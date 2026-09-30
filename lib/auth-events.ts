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

/**
 * Set when a signed-in tool discovers mid-use that the session has ended (the
 * auth server answered 401 / no session). The tool is then swapped for its
 * sign-in card by the gate — the card reads this once to explain why, instead
 * of the student's form silently vanishing (independent review, 24 Sep 2026).
 * Module state: shared by every chunk on the page, cleared on read.
 */
let toolSessionEnded = false;
export function noteToolSessionEnded(): void {
  toolSessionEnded = true;
}
export function consumeToolSessionEnded(): boolean {
  const v = toolSessionEnded;
  toolSessionEnded = false;
  return v;
}

// ── Session-state messages ──────────────────────────────────────────────────
// One wording everywhere a save can fail for a reason that is not the
// student's input: the four tools, their reports and the page buttons (Save,
// Add to planner, Add to compare). Kept here, SDK-free, so a page button can
// still say it when the lazily loaded SDK chunk itself could not be fetched.
// lib/tools-shared re-exports them for the tools.

/** The auth server said the session is gone — the device has been signed out. */
export const SESSION_ENDED = 'Your session ended — sign in again to continue.';
/** The auth server could not be reached — the session and everything saved are untouched. */
export const CONNECTION_LOST = 'We could not reach the server — check your connection and try again. Nothing was lost.';
/** Title + text for a tool or report whose FIRST read could not reach the server. */
export const OFFLINE_TITLE = 'We could not reach the server';
export const OFFLINE_ON_LOAD = 'Check your connection and reload the page. You are still signed in, and nothing you saved before has changed.';

/** 'plan' = the college-page Add-to-planner button; 'compare' = its Add-to-compare peer; 'tools' = a /tools/* sign-in card. */
export type SignInIntent = 'account' | 'save' | 'admin' | 'plan' | 'compare' | 'tools';

export interface SignInRequest {
  intent?: SignInIntent;
  /** Same-origin path Google OAuth should return to (re-validated server-side). */
  next?: string;
}

/**
 * The part of the current URL's fragment that may ride through a redirect
 * sign-in (Google, or the e-mailed link opened in a new tab), or ''.
 *
 * A fragment never reaches the server and a redirect door starts a fresh
 * navigation, so without this the exam page's "Record your X score" link
 * (`/tools/test-score-tracker#exam=<slug>`) landed back on the tracker with no
 * test chosen, although the sheet promises the tool "opens right here"
 * (independent review, C6). The same goes for `#region=<slug>`, the
 * destination a destination page (a region hub, a university profile, an exam
 * page) hands to a tool (components/tools/useDestinationHint): without it, a
 * visitor who arrived from the USA hub and signed in through a redirect door
 * landed on the India view (review, CRIT2-2).
 *
 * ALLOW-LISTED, never passed through: only `#exam=<slug>`, `#region=<slug>`
 * or the two joined by `&` (either order, each at most once), every value in
 * the catalogue's slug shape (lowercase words joined by single hyphens). Any
 * other fragment is dropped, so no arbitrary text is carried into `next` or
 * back onto the page. The tools still check each slug against their own list
 * (the tracker's catalogue, REGION_SLUGS) before using it.
 */
const FRAGMENT_SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
const RESUMABLE_FRAGMENT = new RegExp(
  `^#(?:exam=${FRAGMENT_SLUG}(?:&region=${FRAGMENT_SLUG})?|region=${FRAGMENT_SLUG}(?:&exam=${FRAGMENT_SLUG})?)$`,
);
export function resumableFragment(hash: string): string {
  return hash.length <= 120 && RESUMABLE_FRAGMENT.test(hash) ? hash : '';
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
// A redirect sign-in (Google, or the e-mail link) discards in-memory state. A
// caller that wants to finish its action when the visitor lands back here (e.g.
// "save this guide") stashes an intent scoped to THIS path with a short TTL, and
// the page consumes it exactly once. Path-scoping matters: without it, a sign-in
// started on one page could trigger another page's stashed action.
// localStorage, NOT sessionStorage: mail clients open the e-mailed link in a NEW
// tab, and sessionStorage is per tab — the landing tab found no stash and the
// promised save silently never happened (live IQA, 19 Sep 2026). localStorage is
// shared across tabs; the one-shot removal keeps it single-use.

const RESUME_KEY = 'gsb-auth-resume-v1';
// How long a redirect sign-in may take and still finish the action. It must
// outlast the e-mailed link itself — Supabase's OTP/link expiry is 900 s
// (ACCOUNTS_SETUP.md, "Dashboard config") — plus time for the mail to arrive,
// or the sheet's "it is saved to your account" promise would silently fail for
// a link opened 10–15 minutes after sending (review, 29 Sep 2026). Both the
// stash and the pending marker use it; raise it if the link expiry is raised.
const SIGN_IN_REDIRECT_TTL_MS = 20 * 60_000;
const RESUME_TTL_MS = SIGN_IN_REDIRECT_TTL_MS;

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
    localStorage.setItem(RESUME_KEY, JSON.stringify(stash));
  } catch {
    /* storage unavailable — the visitor simply repeats the action */
  }
}

/** Drop a stash that will never be consumed (the sign-in completed in place). */
export function clearResumeIntent(): void {
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * One-shot for the MATCHING caller: true only if a fresh stash for `intent`
 * exists for the current path, and only then is it removed. A fresh stash for
 * another intent or page is left for its own button: on a university profile
 * Save, Add to planner and Add to compare run this in sibling order, and
 * Save's check used to consume the planner's or comparison's note, so that
 * add never happened (review G10-SK-1). A stale or unreadable stash is removed
 * by whichever caller reads it. /cookies describes exactly this.
 */
export function takeResumeIntent(intent: SignInIntent): boolean {
  try {
    const raw = localStorage.getItem(RESUME_KEY);
    if (!raw) return false;
    let stash: Partial<ResumeStash> | null = null;
    try {
      stash = JSON.parse(raw) as Partial<ResumeStash> | null;
    } catch {
      stash = null;
    }
    if (!stash || typeof stash !== 'object' || typeof stash.ts !== 'number' || !(Date.now() - stash.ts < RESUME_TTL_MS)) {
      localStorage.removeItem(RESUME_KEY);
      return false;
    }
    if (stash.intent !== intent || stash.path !== window.location.pathname) return false;
    localStorage.removeItem(RESUME_KEY);
    return true;
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
const PENDING_TTL_MS = SIGN_IN_REDIRECT_TTL_MS;

export function markSignInPending(): void {
  try {
    localStorage.setItem(PENDING_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/** Drop the marker when the sign-in completed in place (code door). */
export function clearSignInPending(): void {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** One-shot: true if a redirect sign-in started here within SIGN_IN_REDIRECT_TTL_MS. */
export function takeSignInPending(): boolean {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return false;
    localStorage.removeItem(PENDING_KEY);
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < PENDING_TTL_MS;
  } catch {
    return false;
  }
}
