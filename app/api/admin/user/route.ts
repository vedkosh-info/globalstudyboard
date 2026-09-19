import { NextResponse, type NextRequest } from 'next/server';
import { isAdminEmail, requireAdmin } from '@/lib/admin/auth';
import { isSameOriginRequest } from '@/lib/security/same-origin';
import { createRateLimiter, clientIp, NO_STORE, UUID_RE } from '@/lib/security/request';

/**
 * POST /api/admin/user — one mutation on one account.
 *   { userId, action: 'ban' | 'unban', reason? }
 *   { userId, action: 'delete', confirmEmail, reason? }   (confirmEmail must match)
 *
 * ban    → GoTrue sign-in ban: sign-in and token REFRESH are refused until lifted.
 *          An access token already issued stays valid until it expires (Auth →
 *          Sessions → JWT expiry is set to 15 minutes on this project), so the
 *          UI says "takes full effect within 15 minutes".
 * unban  → lifts it
 * delete → auth.admin.deleteUser (cascades profiles + saved_items). For erasure
 *          requests that arrive by e-mail; needs the target's address typed back.
 * Nobody can act on their own account or on another administrator's here; the
 * console requires a sign-in within the last 24 h for mutations (step-up).
 * Every mutation appends to admin_actions (target user id + a bounded note with
 * anything that looks like an e-mail address scrubbed — never the e-mail).
 */

export const runtime = 'nodejs';

const ACTIONS = ['ban', 'unban', 'delete'] as const;
type Action = (typeof ACTIONS)[number];
const isAction = (v: unknown): v is Action => typeof v === 'string' && (ACTIONS as readonly string[]).includes(v);
const REASON_MAX = 300;
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
// Anything e-mail-shaped typed into the note is replaced so the audit trail
// never accumulates addresses (it outlives the account by up to 12 months).
const EMAIL_LIKE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const isRateLimited = createRateLimiter(30, 60_000);

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Request rejected.' }, { status: 403, headers: NO_STORE });
  }
  const ctx = await requireAdmin({ mutation: true });
  if (!ctx.ok) {
    return NextResponse.json(
      { error: ctx.status === 503 ? 'Admin console is not configured.' : 'Not authorised.' },
      { status: ctx.status, headers: NO_STORE },
    );
  }
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429, headers: NO_STORE });
  }

  let body: { userId?: unknown; action?: unknown; reason?: unknown; confirmEmail?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: NO_STORE });
  }
  const userId = typeof body.userId === 'string' && UUID_RE.test(body.userId) ? body.userId.toLowerCase() : null;
  if (!userId || !isAction(body.action)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: NO_STORE });
  }
  if (userId === ctx.user.id) {
    return NextResponse.json({ error: 'You cannot act on your own account here.' }, { status: 400, headers: NO_STORE });
  }
  const reason =
    typeof body.reason === 'string'
      ? body.reason.replace(CONTROL_CHARS, ' ').replace(EMAIL_LIKE, '[e-mail removed]').replace(/\s+/g, ' ').trim().slice(0, REASON_MAX)
      : '';

  const { service, user: admin } = ctx;
  const { data: target, error: lookupError } = await service.auth.admin.getUserById(userId);
  if (lookupError || !target.user) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404, headers: NO_STORE });
  }
  if (isAdminEmail(target.user.email)) {
    return NextResponse.json({ error: 'Administrator accounts cannot be changed from the console.' }, { status: 400, headers: NO_STORE });
  }

  try {
    if (body.action === 'delete') {
      const confirm = typeof body.confirmEmail === 'string' ? body.confirmEmail.trim().toLowerCase() : '';
      if (!confirm || confirm !== (target.user.email ?? '').toLowerCase()) {
        return NextResponse.json(
          { error: 'Type the account e-mail exactly to confirm deletion.' },
          { status: 400, headers: NO_STORE },
        );
      }
      const { error } = await service.auth.admin.deleteUser(userId);
      if (error) throw new Error('delete_failed');
      // What outlives the account is "action + when" only (the promise on
      // /privacy and /delete-account): clear the notes on earlier rows here,
      // and never attach one to the 'delete' row itself (below) — an
      // independent review caught that the delete row used to keep its note
      // for the full 12-month retention window.
      await service.from('admin_actions').update({ reason: null }).eq('target_user_id', userId);
    } else {
      const { error } = await service.auth.admin.updateUserById(userId, {
        ban_duration: body.action === 'ban' ? '876000h' : 'none',
      });
      if (error) throw new Error('ban_failed');
    }
    const { error: auditError } = await service.from('admin_actions').insert({
      admin_email: admin.email.toLowerCase(),
      action: body.action,
      target_user_id: userId,
      reason: body.action === 'delete' ? null : reason || null,
    });
    if (auditError) console.warn('[admin-user] audit-row-failed');
    return NextResponse.json({ ok: true, action: body.action }, { headers: NO_STORE });
  } catch {
    console.warn('[admin-user] failed: mutation-error');
    return NextResponse.json({ error: 'The action failed. Please try again.' }, { status: 502, headers: NO_STORE });
  }
}

// Framework-generated 405s for the other methods carried `cache-control: public`
// (live IQA, 19 Sep); answer them explicitly with the same no-store headers as
// every other response from this route.
const methodNotAllowed = () => NextResponse.json({ error: 'Method not allowed.' }, { status: 405, headers: { ...NO_STORE, Allow: 'POST' } });
export const GET = methodNotAllowed;
export const HEAD = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
