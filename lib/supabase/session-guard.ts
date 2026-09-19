/**
 * Server-side twin of the database's `session_is_passwordless()` RLS guard.
 *
 * This site never offers password sign-in, yet Supabase's e-mail provider still
 * accepts a password sign-up from anyone holding the public key. A planted
 * password on a victim's address becomes a usable login the moment the victim's
 * own passwordless sign-in confirms that address. The JWT's `amr` claim records
 * how a session was authenticated, so every account/admin route refuses any
 * session that used a password. `getClaims()` verifies the token signature
 * before returning the claims.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export async function isPasswordlessSession(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) return false;
    const amr = (data.claims as { amr?: Array<string | { method?: string }> }).amr ?? [];
    return !amr.some((e) => (typeof e === 'string' ? e : e?.method) === 'password');
  } catch {
    return false;
  }
}
