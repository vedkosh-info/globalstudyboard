import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabase/server';
import { isPasswordlessSession } from '@/lib/supabase/session-guard';
import { isSameOriginRequest } from '@/lib/security/same-origin';
import { createRateLimiter, clientIp, NO_STORE } from '@/lib/security/request';

/**
 * POST /api/account/delete — permanently delete the signed-in visitor's account.
 *
 * Gate order: same-origin (CSRF) → accounts configured → signed in → explicit
 * confirmation word → service client → auth.admin.deleteUser. Deleting the
 * auth.users row cascades to profiles and saved_items (FK ON DELETE CASCADE),
 * so nothing about the account survives; there are no retained financial rows
 * on this site to redact first. The response also clears the session cookies.
 *
 * This is also the in-app deletion path Google Play's User Data policy requires
 * for an app that offers account creation (the public, logged-out route is the
 * /delete-account page).
 */

export const runtime = 'nodejs';

const isRateLimited = createRateLimiter(5, 15 * 60_000);

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
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
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429, headers: { ...NO_STORE, 'Retry-After': '900' } });
  }

  let confirm = '';
  try {
    const body = (await request.json()) as { confirm?: unknown };
    confirm = typeof body.confirm === 'string' ? body.confirm.trim().toUpperCase() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: NO_STORE });
  }
  if (confirm !== 'DELETE') {
    return NextResponse.json({ error: 'Type DELETE to confirm.' }, { status: 400, headers: NO_STORE });
  }

  const service = getSupabaseServiceClient();
  if (!service) {
    return NextResponse.json({ error: 'Account deletion is not available right now.' }, { status: 503, headers: NO_STORE });
  }

  // What outlives the account in the audit trail is "action + when" only.
  await service.from('admin_actions').update({ reason: null }).eq('target_user_id', user.id);
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('[account-delete] failed: admin-delete-rejected');
    return NextResponse.json({ error: 'Could not delete your account. Please try again or email us.' }, { status: 500, headers: NO_STORE });
  }
  // The auth.users row is gone; expire this browser's session cookies too. A
  // failure here is harmless — the refresh token no longer exists server-side.
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    /* ignore */
  }
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
