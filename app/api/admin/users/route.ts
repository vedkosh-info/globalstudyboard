import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin/auth';
import { isSameOriginRequest } from '@/lib/security/same-origin';
import { createRateLimiter, clientIp, NO_STORE, UUID_RE } from '@/lib/security/request';
import type { AdminUser } from '@/lib/admin/types';

/**
 * GET  /api/admin/users           → { total, recent: AdminUser[] }  (last 50 sign-ups)
 * POST /api/admin/users { q }     → { user: AdminUser | null }      (lookup by e-mail or uuid)
 *
 * Lookup is a POST with a JSON body so the identifier never appears in a
 * request line that platform logs record — the GET variant would have written
 * every looked-up e-mail into Vercel's request logs.
 *
 * Owner-console reads. `auth.users` is not reachable through PostgREST and
 * `profiles` stores no e-mail, so lookups go through the GoTrue admin API:
 * getUserById() is the fast path; an e-mail lookup is a BOUNDED scan of
 * listUsers() (the API has no server-side e-mail filter). Exhausting the cap
 * answers 504 with an honest message rather than a false "not found".
 *
 * Console privacy rules (mirrors VedKosh's owner directive): the identifier the
 * admin types never enters a URL the browser keeps in history (the client uses
 * fetch), there is no export/download control, and nothing is logged.
 */

export const runtime = 'nodejs';

const isRateLimited = createRateLimiter(60, 60_000);
const SCAN_PAGE = 200;
const SCAN_MAX_PAGES = 25;

async function shape(service: SupabaseClient, u: User): Promise<AdminUser> {
  const [{ data: profile }, { count }] = await Promise.all([
    service.from('profiles').select('display_name, preferred_region, preferred_audience').eq('id', u.id).maybeSingle(),
    service.from('saved_items').select('slug', { count: 'exact', head: true }).eq('user_id', u.id),
  ]);
  const banned = (u as User & { banned_until?: string | null }).banned_until ?? null;
  return {
    id: u.id,
    email: u.email ?? null,
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at ?? null,
    emailConfirmedAt: u.email_confirmed_at ?? null,
    providers: (u.identities ?? []).map((i) => i.provider),
    bannedUntil: banned && new Date(banned).getTime() > Date.now() ? banned : null,
    profile: profile
      ? {
          displayName: String(profile.display_name ?? ''),
          preferredRegion: (profile.preferred_region as string | null) ?? null,
          preferredAudience: (profile.preferred_audience as string | null) ?? null,
        }
      : null,
    savedCount: count ?? 0,
  };
}

async function findByEmail(service: SupabaseClient, email: string): Promise<User | null | 'exhausted'> {
  for (let page = 1; page <= SCAN_MAX_PAGES; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: SCAN_PAGE });
    if (error) throw new Error('list_users_failed');
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < SCAN_PAGE) return null;
  }
  return 'exhausted';
}

function denied(status: 401 | 503) {
  return NextResponse.json(
    { error: status === 503 ? 'Admin console is not configured.' : 'Not authorised.' },
    { status, headers: NO_STORE },
  );
}

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx.ok) return denied(ctx.status);
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: NO_STORE });
  }
  const { service } = ctx;
  try {
    // Retention belt-and-braces: the daily pg_cron job (migration 0002) is the
    // enforcing mechanism for the 12-month promise; this opportunistic call
    // just means a console open never shows a row the job is about to remove.
    void service.rpc('purge_admin_actions', { p_keep_days: 365 }).then(() => undefined, () => undefined);

    const { data, error } = await service.auth.admin.listUsers({ page: 1, perPage: 50 });
    if (error) throw new Error('list_users_failed');
    const users = [...data.users].sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
    const recent = await Promise.all(users.map((u) => shape(service, u)));
    const total = (data as { total?: number }).total ?? null;
    // stepUpFresh lets the console warn up front that ban/unban/delete will be
    // refused until the owner signs in again (the mutation route answers a flat
    // 401, which on its own reads as "not an admin").
    return NextResponse.json({ total, recent, stepUpFresh: ctx.stepUpFresh }, { headers: NO_STORE });
  } catch {
    console.warn('[admin-users] failed: query-error');
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 502, headers: NO_STORE });
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403, headers: NO_STORE });
  }
  const ctx = await requireAdmin();
  if (!ctx.ok) return denied(ctx.status);
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: NO_STORE });
  }
  let q = '';
  try {
    const body = (await request.json()) as { q?: unknown };
    q = typeof body.q === 'string' ? body.q.trim().slice(0, 254) : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: NO_STORE });
  }
  if (!q) return NextResponse.json({ error: 'Enter an e-mail address or user id.' }, { status: 400, headers: NO_STORE });

  const { service } = ctx;
  try {
    let found: User | null | 'exhausted';
    if (UUID_RE.test(q)) {
      const { data, error } = await service.auth.admin.getUserById(q);
      if (error && !/not found/i.test(error.message)) throw new Error('get_user_failed');
      found = data?.user ?? null;
    } else {
      found = await findByEmail(service, q.toLowerCase());
    }
    if (found === 'exhausted') {
      return NextResponse.json(
        { error: 'Too many accounts to scan by e-mail — look up by user id instead.' },
        { status: 504, headers: NO_STORE },
      );
    }
    return NextResponse.json({ user: found ? await shape(service, found) : null }, { headers: NO_STORE });
  } catch {
    console.warn('[admin-users] failed: query-error');
    return NextResponse.json({ error: 'Lookup failed. Please try again.' }, { status: 502, headers: NO_STORE });
  }
}
