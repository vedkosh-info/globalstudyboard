/**
 * Owner console gate — SERVER ONLY (imports lib/supabase/server).
 *
 * Model: the owner signs in exactly like any visitor (e-mail code/link or
 * Google); an API call is an admin call when ALL of these hold:
 *   1. the SERVER-VERIFIED session e-mail (`getUser().email`) is on the
 *      ADMIN_EMAILS allowlist and is confirmed — never user_metadata, which
 *      users can edit;
 *   2. the session is PASSWORDLESS (JWT `amr` has no `password` entry). This
 *      site never offers password sign-in, but Supabase's e-mail provider still
 *      accepts a password sign-up from anyone with the public key, so an
 *      attacker could pre-register the owner's address with a password and
 *      wait for the owner's own sign-in to confirm it. Such a session is
 *      refused here (and by RLS — see session_is_passwordless in migration 0001);
 *   3. for MUTATIONS, the session signed in within the last 24 hours (a
 *      step-up: a long-lived cookie alone cannot ban or delete anyone).
 * One credential to look after, no second password system; the console fails
 * CLOSED (ADMIN_EMAILS unset = no admins). Failures answer a flat 401 so a
 * probe learns nothing about which check it tripped.
 *
 * Bootstrap (runbook): the owner signs in FIRST, checks Auth → Users shows
 * exactly one row for the address, then sets ADMIN_EMAILS.
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseServerClient, getSupabaseServiceClient } from '@/lib/supabase/server';
import { isPasswordlessSession } from '@/lib/supabase/session-guard';

const STEP_UP_MS = 24 * 60 * 60 * 1000;

export function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && adminEmails().has(String(email).toLowerCase());
}

export function isAdminUser(user: User | null): user is User & { email: string } {
  if (!user?.email) return false;
  const emailVerified = Boolean(user.email_confirmed_at || user.confirmed_at);
  return emailVerified && isAdminEmail(user.email);
}

export type AdminContext =
  | { ok: true; user: User & { email: string }; service: SupabaseClient; stepUpFresh: boolean }
  | { ok: false; status: 401 | 503 };

/** True when the session signed in recently enough to pass the mutation step-up. */
export function isStepUpFresh(user: User): boolean {
  const last = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : NaN;
  return Number.isFinite(last) && Date.now() - last <= STEP_UP_MS;
}

export async function requireAdmin(opts: { mutation?: boolean } = {}): Promise<AdminContext> {
  const supabase = await getSupabaseServerClient();
  const service = getSupabaseServiceClient();
  if (!supabase || !service || adminEmails().size === 0) return { ok: false, status: 503 };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminUser(user)) return { ok: false, status: 401 };
  if (!(await isPasswordlessSession(supabase))) return { ok: false, status: 401 };
  const stepUpFresh = isStepUpFresh(user);
  if (opts.mutation && !stepUpFresh) return { ok: false, status: 401 };
  return { ok: true, user, service, stepUpFresh };
}
