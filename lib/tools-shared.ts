'use client';

/**
 * Small pieces every signed-in tool chunk (and every report chunk) needs.
 * Client-only: it touches the Supabase browser client, so it must never be
 * imported by a server component or by anything mounted in the root layout
 * (the bundle guard — the SDK loads only inside lazily-loaded tool chunks).
 * The page buttons (Save, Add to planner, Add to compare) and the account menu
 * reach it through `await import()` for the same reason.
 */

import { isAuthApiError, isAuthRetryableFetchError, isAuthSessionMissingError, type SupabaseClient, type User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { clearLocalAuthCookies } from '@/lib/supabase/config';
import { CONNECTION_LOST, SESSION_ENDED, announceAuthChanged, noteToolSessionEnded } from '@/lib/auth-events';

// The sentences live in the SDK-free event module (a page button must be able
// to say them even when this chunk fails to load); re-exported for the tools.
export { CONNECTION_LOST, SESSION_ENDED };

/** What a tool's write resolves to: null when it saved, otherwise the sentence that says why it did not. */
export type WriteOutcome = string | null;

/** A tool's tables have not been created yet (the owner-run migration is pending). */
export function isSetupError(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return err.code === '42P01' || err.code === 'PGRST205' || /relation .* does not exist|could not find the table|schema cache/i.test(err.message ?? '');
}

export interface ToolSession {
  supabase: SupabaseClient;
  user: User;
}

export type SessionCheck =
  | ({ kind: 'ok' } & ToolSession)
  /** The auth server said the session is gone — the device has been signed out locally. */
  | { kind: 'signed-out' }
  /** The auth server could not be reached (offline, timeout, 5xx). The session is NOT touched. */
  | { kind: 'offline' }
  /** Accounts are not configured on this deployment. */
  | { kind: 'unconfigured' };

/**
 * GoTrue error codes that mean the session itself is dead, whatever the HTTP
 * status: a refresh token that was revoked ("Sign out everywhere", a ban) or
 * already rotated, a session that no longer exists. They arrive as a 400, so a
 * status-only test called them a connection problem — while the SDK had in
 * fact already removed the session (independent review, SH-02).
 */
const DEAD_SESSION_CODES = new Set([
  'refresh_token_not_found',
  'refresh_token_already_used',
  'session_not_found',
  'session_expired',
  'user_banned',
  'user_not_found',
]);

/**
 * Only a definite answer from the auth server ends a session: no session at
 * all, a 401/403 for the token, or one of the dead-session codes above. A
 * network failure or a server error comes back from `getUser()` as
 * `{ user: null, error: AuthRetryableFetchError }`, indistinguishable from a
 * sign-out unless the error is inspected — treating it as one used to sign a
 * student out on a flaky connection (and, if the logout request then got
 * through, forced a new e-mail code on a mailer limited to a few per hour).
 * Independent review, 24 Sep 2026.
 */
function endsSession(error: unknown): boolean {
  if (!error) return true; // no user and no error = there is no session
  if (isAuthRetryableFetchError(error)) return false;
  if (isAuthSessionMissingError(error)) return true;
  if (isAuthApiError(error)) return error.status === 401 || error.status === 403 || DEAD_SESSION_CODES.has(error.code ?? '');
  return false; // unknown failure: look again below before calling it a connection problem
}

/**
 * The auth server refused with something we do not recognise (not a network
 * failure): if the SDK no longer holds a usable session, the device IS signed
 * out — a refresh that failed a moment ago removes the session before the
 * error surfaces, or (inside the SDK's 60-second refresh-failure cooldown)
 * hands back the dead-token error again. Anything else stays a connection
 * problem: a stored session, a check that could not reach the server, or a
 * refresh the SDK discarded because another tab had just rotated the token —
 * signing out then would throw away that tab's valid session.
 */
async function sessionAlreadyRemoved(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    return !data.session && endsSession(error);
  } catch {
    return false;
  }
}

export interface CheckOptions {
  /**
   * Leave the note the tool sign-in card reads ("Your session ended …") when
   * the session turns out to be gone. Default true. The page buttons and the
   * account menu pass false: they explain it themselves, and a later visit to
   * a tool must not open on a stale notice.
   */
  noteEnded?: boolean;
}

/** The live session, verified with the auth server (never a cached cookie claim). */
export async function checkToolSession({ noteEnded = true }: CheckOptions = {}): Promise<SessionCheck> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { kind: 'unconfigured' };
  let user: User | null = null;
  let error: unknown = null;
  try {
    const res = await supabase.auth.getUser();
    user = res.data.user;
    error = res.error;
  } catch (e) {
    error = e;
  }
  if (user) return { kind: 'ok', supabase, user };
  const gone = endsSession(error) || (!isAuthRetryableFetchError(error) && (await sessionAlreadyRemoved(supabase)));
  if (!gone) return { kind: 'offline' };
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  // The server has said the session is gone. Expire this project's sign-in
  // cookies whatever the SDK managed (its refresh cooldown can leave the
  // session; a verifier slot whose index entry was lost escapes it even when it
  // succeeds), so the gate and the chrome swap to "signed out" at once and no
  // sign-in cookie outlives the session. Idempotent.
  clearLocalAuthCookies();
  if (noteEnded) noteToolSessionEnded();
  announceAuthChanged();
  return { kind: 'signed-out' };
}

/**
 * The sentence for a session check: `fallback` when the session is fine (so
 * the failure was something else), otherwise why the action could not run —
 * a connection problem (nothing signed out, nothing lost) or an ended session.
 * `ended` lets a page button name its own action ("… sign in again to save.").
 */
export function sessionMessage(check: SessionCheck, fallback: string, ended: string = SESSION_ENDED): string {
  if (check.kind === 'ok') return fallback;
  return check.kind === 'offline' ? CONNECTION_LOST : ended;
}

/** Why a first read failed — each value is also a state of every tool's and report's `LoadState`. */
export type LoadFailure = 'setup' | 'offline' | 'signed-out' | 'error';

/**
 * A tool's or report's FIRST read failed: name the reason. A missing table is
 * the pending migration; otherwise ask the auth server — a read that failed on
 * a dead connection is 'offline' (the page says so and the session stays),
 * and a session that is gone is 'signed-out'. checkToolSession has then
 * already signed the device out, left the "session ended" note and told the
 * chrome, so the gate normally swaps in the sign-in card; if it does not (a
 * cookie this page cannot expire), the tool shows its ToolSessionEnded card —
 * as its own first session check does — never a generic "could not load" for
 * a session that ended (review RH-3). 'error' is left for a read that failed
 * while the session is fine.
 */
export async function explainLoadFailure(err: { code?: string; message?: string } | null | undefined): Promise<LoadFailure> {
  if (isSetupError(err)) return 'setup';
  const s = await checkToolSession();
  if (s.kind === 'offline') return 'offline';
  if (s.kind === 'signed-out') return 'signed-out';
  return 'error';
}

/**
 * How long a write may go unanswered before the tool gives up on it and tells
 * the student the outcome is UNKNOWN (never "not saved"): a request that got no
 * answer may still have reached the server. Shared by every tool so a stalled
 * connection never leaves a form or button stuck (review TRK-R2-6, 29 Sep 2026).
 */
export const WRITE_TIMEOUT_MS = 20_000;
export const TIMED_OUT = Symbol('timed-out');

/**
 * Runs one write with an abort signal and a deadline. Resolves to TIMED_OUT
 * when the deadline passes first (the signal is then aborted); `expired()`
 * lets the write skip any side effect it would apply after that, since the
 * caller has already told the student the outcome is unknown.
 */
export async function withDeadline<T>(run: (signal: AbortSignal, expired: () => boolean) => Promise<T>, ms: number = WRITE_TIMEOUT_MS): Promise<T | typeof TIMED_OUT> {
  const controller = new AbortController();
  let expired = false;
  let timer: number | undefined;
  const deadline = new Promise<typeof TIMED_OUT>((resolve) => {
    timer = window.setTimeout(() => {
      expired = true;
      controller.abort();
      resolve(TIMED_OUT);
    }, ms);
  });
  try {
    return await Promise.race([run(controller.signal, () => expired), deadline]);
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Whether a write got no answer from the DATABASE, so its outcome is unknown
 * (it may or may not have run) and the student must be told so — never "not
 * saved". postgrest-js reports a request that got no HTTP response as status 0
 * (it never retries a write); a gateway's 502 or 504 means the gateway never
 * heard back either. PostgREST's OWN errors (code PGRST…, e.g. PGRST003, no
 * pool connection) are definite: the statement never ran. One rule for all
 * four tools (review, 30 Sep 2026: the tracker used status 0 only).
 */
export function isUnansweredWrite(status: number, error?: { code?: string } | null): boolean {
  if (status === 0) return true;
  return (status === 502 || status === 504) && !/^PGRST/.test(error?.code ?? '');
}
