/**
 * Sign-in event bus — the ONLY auth module the globally-mounted chrome imports.
 *
 * It contains no Supabase code (bundle guard: the layout chunk must stay ≈45 KB).
 * Triggers dispatch an event; `SignInHost` (a layout sibling) listens and lazily
 * loads the sheet + SDK chunk on first open. Kept in `lib` so the triggers and
 * the host share one source of truth without importing each other — the same
 * shape as lib/tester-invite.ts.
 *
 * Two ways in:
 *   openSignIn({ next })  — fire and forget (the context-bar pill, the menu row).
 *   requireAuth({ intent }) — await a verdict before continuing an action (the
 *     Save button): resolves 'ok' once a session exists, 'dismissed' if the
 *     visitor closes the sheet. Fails OPEN when accounts are unconfigured or no
 *     host is mounted — the server's 401 / RLS is the real enforcement, the
 *     sheet is only the on-ramp.
 */

import { hasAuthCookie, isAuthConfigured } from '@/lib/supabase/config';

export const OPEN_SIGN_IN_EVENT = 'gsb:open-sign-in';
/** Dispatched after a sign-in or sign-out completes so the chrome re-reads the cookie. */
export const AUTH_CHANGED_EVENT = 'gsb:auth-changed';

export type SignInIntent = 'account' | 'save' | 'admin';

export interface SignInRequest {
  intent?: SignInIntent;
  /** Same-origin path Google OAuth should return to (re-validated server-side). */
  next?: string;
}

export type SignInVerdict = 'ok' | 'dismissed';

type OpenHandler = (req: SignInRequest) => void;

let openHandler: OpenHandler | null = null;
let pendingResolvers: Array<(v: SignInVerdict) => void> = [];

/** The host registers itself on mount; the returned function unregisters (and strands no waiter). */
export function registerSignInHost(handler: OpenHandler): () => void {
  openHandler = handler;
  return () => {
    if (openHandler === handler) openHandler = null;
    settleSignIn('dismissed');
  };
}

/** Resolve every caller waiting on the current sheet with one verdict. */
export function settleSignIn(verdict: SignInVerdict): void {
  const resolvers = pendingResolvers;
  pendingResolvers = [];
  resolvers.forEach((resolve) => resolve(verdict));
}

/** Open the sheet from any client component (no verdict needed). */
export function openSignIn(req: SignInRequest = {}): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<SignInRequest>(OPEN_SIGN_IN_EVENT, { detail: req }));
}

/** Notify the chrome that the session changed (after sign-in / sign-out). */
export function announceAuthChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

/**
 * Ensure a session exists before continuing. Concurrent callers share one sheet.
 * The cookie-presence fast path is a UI hint only; the API still verifies.
 */
export function requireAuth(req: SignInRequest = {}): Promise<SignInVerdict> {
  if (!isAuthConfigured() || hasAuthCookie() || !openHandler) return Promise.resolve('ok');
  return new Promise<SignInVerdict>((resolve) => {
    pendingResolvers.push(resolve);
    if (pendingResolvers.length === 1) openHandler?.(req);
  });
}

// ── OAuth resume stash ──────────────────────────────────────────────────────
// A Google sign-in is a full-page redirect, which discards in-memory state. A
// caller that wants to finish its action when the visitor lands back here (e.g.
// "save this guide") stashes an intent scoped to THIS path with a short TTL, and
// the page consumes it exactly once. Path-scoping matters: without it, a sign-in
// started on one page could trigger another page's stashed action.

const RESUME_KEY = 'gsb-auth-resume-v1';
const RESUME_TTL_MS = 10 * 60_000;

interface ResumeStash {
  intent: SignInIntent;
  path: string;
  ts: number;
}

export function stashResumeIntent(intent: SignInIntent, path: string): void {
  try {
    // Pathname only: callers pass pathname+search (the same value the callback
    // returns to), while takeResumeIntent compares against location.pathname —
    // a stash carrying "?tab=1" would never match (independent review).
    const stash: ResumeStash = { intent, path: path.split(/[?#]/)[0] || '/', ts: Date.now() };
    sessionStorage.setItem(RESUME_KEY, JSON.stringify(stash));
  } catch {
    /* storage unavailable — the visitor simply repeats the action */
  }
}

/** Drop a stash that will never be consumed (the sign-in completed in place). */
export function clearResumeIntent(): void {
  try {
    sessionStorage.removeItem(RESUME_KEY);
  } catch {
    /* ignore */
  }
}

/** One-shot: returns true only if a fresh stash for `intent` exists for the current path. */
export function takeResumeIntent(intent: SignInIntent): boolean {
  try {
    const raw = sessionStorage.getItem(RESUME_KEY);
    if (!raw) return false;
    sessionStorage.removeItem(RESUME_KEY);
    const stash = JSON.parse(raw) as Partial<ResumeStash>;
    return (
      stash.intent === intent &&
      stash.path === window.location.pathname &&
      typeof stash.ts === 'number' &&
      Date.now() - stash.ts < RESUME_TTL_MS
    );
  } catch {
    return false;
  }
}

// ── Fresh-sign-in marker (redirect doors) ───────────────────────────────────
// A Google sign-in returns through a server route, so the landing page has a
// session cookie but no in-page "you just signed in" event. The form sets this
// one-shot marker before redirecting; AuthProvider consumes it (short TTL) to
// pull the account's remembered preferences onto a device that has none and to
// announce the sign-in.

const PENDING_KEY = 'gsb-auth-pending';
const PENDING_TTL_MS = 10 * 60_000;

export function markSignInPending(): void {
  try {
    sessionStorage.setItem(PENDING_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/** Drop the marker when the sign-in completed in place (code door). */
export function clearSignInPending(): void {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** One-shot: true if a redirect sign-in started here less than 10 minutes ago. */
export function takeSignInPending(): boolean {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return false;
    sessionStorage.removeItem(PENDING_KEY);
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < PENDING_TTL_MS;
  } catch {
    return false;
  }
}
