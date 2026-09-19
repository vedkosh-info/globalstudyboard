import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabase/server';
import { isPasswordlessSession } from '@/lib/supabase/session-guard';
import { createRateLimiter, clientIp, NO_STORE } from '@/lib/security/request';

/**
 * GET /api/account/export — the signed-in visitor's data as a JSON download
 * (GDPR Art. 20 / DPDP right of access). Reads run through the caller's OWN
 * cookie-bound session, so RLS guarantees the export can only ever contain
 * their rows — no service role involved.
 *
 * PostgREST silently caps an unbounded select at ~1,000 rows and returns the
 * prefix with no error, so every list is paged with .range() until a short page.
 * Every table that holds data about the user MUST be listed here; adding a
 * per-user table elsewhere without extending this export is a §9 defect. The
 * one table the user cannot read themselves (admin_actions, service-role only)
 * is read on their behalf with the service client so the export stays complete.
 */

export const runtime = 'nodejs';

const PAGE = 1000;
const isRateLimited = createRateLimiter(10, 10 * 60_000);

async function fetchAll<T>(query: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await query(from, from + PAGE - 1);
    if (error) throw new Error('export_query_failed');
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export async function GET(request: NextRequest) {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') {
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403, headers: NO_STORE });
  }
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Accounts are not available right now.' }, { status: 503, headers: NO_STORE });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isPasswordlessSession(supabase))) {
    return NextResponse.json({ error: 'Please sign in first.' }, { status: 401, headers: NO_STORE });
  }
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'Too many exports. Please try again later.' }, { status: 429, headers: { ...NO_STORE, 'Retry-After': '600' } });
  }

  try {
    const service = getSupabaseServiceClient();
    const [profile, savedItems, moderation] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name, preferred_region, preferred_audience, consent_version, consent_tos_at, consent_privacy_at, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle()
        .then((r) => {
          if (r.error) throw new Error('export_query_failed');
          return r.data;
        }),
      fetchAll<Record<string, unknown>>((from, to) =>
        supabase
          .from('saved_items')
          .select('kind, slug, title, region, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to),
      ),
      service
        ? service
            .from('admin_actions')
            .select('action, at, reason')
            .eq('target_user_id', user.id)
            .order('at', { ascending: false })
            .range(0, 999)
            .then((r) => (r.error ? [] : (r.data ?? [])))
        : Promise.resolve([] as Array<{ action: string; at: string; reason: string | null }>),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      site: 'https://www.globalstudyboard.com',
      account: {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        sign_in_methods: (user.identities ?? []).map((i) => i.provider),
      },
      profile,
      saved_items: savedItems,
      moderation_actions: moderation,
      notes: [
        'This file contains every record GlobalStudyBoard stores about your account, including any moderation action taken on it and the note (if any) attached to that action while your account exists.',
        'Our sign-in provider also keeps technical security logs of sign-ins (IP address, browser, time) for a limited period; usage analytics are aggregate and never tied to an account. Neither is included here.',
      ],
    };
    const body = JSON.stringify(payload, null, 2);
    return new NextResponse(body, {
      status: 200,
      headers: {
        ...NO_STORE,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="globalstudyboard-account-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch {
    console.warn('[account-export] failed: query-error');
    return NextResponse.json({ error: 'Could not build your export. Please try again.' }, { status: 500, headers: NO_STORE });
  }
}
