'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Award, Bookmark, ChevronDown, ClipboardList, Coins, Columns3, LogIn, LogOut, UserRound } from 'lucide-react';
import SignInButton from '@/components/auth/SignInButton';
import { useAuth } from '@/components/auth/AuthProvider';
import { announceAuthChanged } from '@/lib/auth-events';
import ToolLink from '@/components/tools/ToolLink';
import { useRegion } from '@/components/RegionProvider';
import { toolPageHref } from '@/lib/tool-hint';
import { clearLocalAuthCookies, hasAuthCookie, isAuthConfigured } from '@/lib/supabase/config';

/**
 * The account control in the context bar — the ONE place the chrome shows
 * sign-in state (the mobile menu row and the /account page are secondary
 * entrances, not duplicates of this control).
 *
 * Placement is measured, not chosen. The header row is full at 1024px (and at
 * 390/430px): the nav already carries "Tools" and the destination name
 * truncates there, so a control there would push the menu button off screen
 * or cut the destination name further (see Header.tsx / RegionSwitcher.tsx).
 * The account control lives in the context bar, whose width budget is
 * measured in ONE place — the table in RegionContextBar.tsx (re-measure at
 * 320/360/410/640/680px, signed in and out). Signed out: 32px icon-only below
 * 410px, "Sign in" (~77–85px) from 410px. Signed in: 32px icon-only below
 * `sm` (chevron hidden too); "Account" and the chevron (~115px) from `sm`.
 *
 * Signed out → the shared SignInButton. Signed in → a small popover (same
 * pattern as RegionSwitcher: aria-expanded + aria-controls, NO aria-haspopup,
 * role="group" named by its own heading, roving Up/Down/Home/End, Escape returns
 * focus, outside click closes). The e-mail is fetched lazily on open — the
 * Supabase SDK is never part of this chunk.
 *
 * That fetch follows the tools' session rule (lib/tools-shared): only a
 * definite "session gone" from the auth server closes the menu and signs the
 * device out. A network blip used to look identical (`getUser()` answers
 * `user: null` either way), so on a flaky connection the menu — now the
 * entrance to all four tools — opened and shut itself on every tap
 * (independent review SH-06). Offline, it now stays open with "Signed in".
 */

const PILL =
  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-forest-300 bg-white px-2 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 sm:px-3';

const OPTION =
  'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-stone-800 no-underline hover:bg-forest-50 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500';

/**
 * Expire every cookie of this project's sign-in storage on this device — the
 * session, its `.0`, `.1`… chunks and every `sb-<ref>-auth-token-…` companion
 * (the sign-in verifiers, their per-sign-in slots and the index of pending
 * ones). clearLocalAuthCookies sweeps them by prefix, not by the SDK's index: a
 * slot whose index entry was lost to two sign-ins started at once (auth-js
 * 2.116 accepts that race, lib/helpers storePKCEVerifier) escapes the SDK's
 * own removeAllPKCEVerifiers and would otherwise stay for the cookie's 400 days.
 */
function expireSignInCookies(): void {
  clearLocalAuthCookies();
}

/**
 * "Sign out" on this device only, made certain. Shared by the account menu and
 * /account (both its "Sign out" and the clean-up after a deletion).
 *
 * auth-js RETURNS, rather than throws, when it cannot end the session: an
 * expired access token whose refresh cannot reach the auth server (offline, a
 * 5xx) comes back as `{ error }` with the session still stored (auth-js 2.116
 * `_signOut`). The old `try { await signOut() } catch {}` therefore went home
 * as if it had worked while the device stayed signed in — against /cookies'
 * "removed when you sign out" (review SA-1). Whatever the SDK answers, this
 * device now ends with no session cookie. Offline the SDK is not asked at all:
 * its logout request could not be sent, and with an expired token it would
 * first retry the refresh for ~25 s. Either way the device no longer holds the
 * session's only refresh token, so nothing here can use it again — but the
 * provider still holds the session record until a connected sign-out, "Sign
 * out everywhere" or account deletion ends it (a Supabase session lasts until
 * then unless a time-box or inactivity limit is configured, and
 * ACCOUNTS_SETUP.md records neither).
 *
 * The sweep runs after every sign-out, a successful one included, so /cookies'
 * "the next sign-out on this device removes them all" holds for the verifier
 * slots the SDK cannot see (see expireSignInCookies; review G10-SK-3). The
 * SDK's own sign-out already removes every verifier it knows of, a sign-in
 * pending in another tab included, so the sweep only adds the orphans.
 */
export async function signOutThisDevice(getClient: () => Promise<SupabaseClient | null>): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    expireSignInCookies();
    return;
  }
  try {
    const client = await getClient();
    // auth-js returns its failures; a throw is caught here too. Neither changes
    // what this device ends with.
    await client?.auth.signOut({ scope: 'local' }).catch(() => undefined);
  } catch {
    // The SDK chunk could not be fetched: forget this device anyway (below).
  }
  expireSignInCookies();
}

export default function AccountControl() {
  const { hasSession, ready } = useAuth();
  // The popover's tool links carry the page's destination (#region=), like
  // every other Tools entrance (§18).
  const { pageRegion } = useRegion();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const signInRef = useRef<HTMLSpanElement>(null);
  /** The menu closed because the session turned out to be gone: focus follows the control that replaces it. */
  const refocus = useRef(false);
  /** Re-runs the refocus effect when the answer lands after the menu had already closed (nothing else changes then). */
  const [refocusTick, setRefocusTick] = useState(0);
  const panelId = useId();
  const labelId = useId();

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) btnRef.current?.focus();
  };

  // Outside click + Escape (matches RegionSwitcher / MobileMenu).
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // On open: focus the first option and fetch the address (lazy SDK chunk).
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[data-account-option]')?.focus();
    let active = true;
    void import('@/lib/tools-shared')
      .then(async ({ checkToolSession }) => {
        // noteEnded: false — the menu explains itself; a later tool visit must
        // not open on a stale "session ended" notice.
        const s = await checkToolSession({ noteEnded: false });
        if (s.kind === 'signed-out') {
          // The cookie was stale (session revoked or expired elsewhere): the
          // check has signed this device out and told the chrome, so the pill
          // becomes "Sign in" — close, and let focus follow it (below). Also
          // when the answer arrives after Escape already closed the menu:
          // focus went back to the Account button, which is about to unmount
          // (a 1.5 s delayed 401 dropped it to <body>, follow-up review SH-06).
          // Only while focus is still inside this control, though: after an
          // outside click or tap on page text focus rests on <body>, and
          // moving it to the context-bar pill (not sticky) scrolled the page
          // back to the top. The chrome cannot re-render before this line —
          // the auth announcement renders in a later macrotask.
          const focused = document.activeElement;
          if (active || (focused && ref.current?.contains(focused))) {
            refocus.current = true;
            setRefocusTick((n) => n + 1);
          }
          setOpen(false);
          return;
        }
        if (!active) return;
        if (s.kind === 'ok') setEmail(s.user.email ?? null);
        // 'offline' (or 'unconfigured'): keep the menu open; the address line
        // stays "Signed in" and the next open asks again.
      })
      .catch(() => undefined); // the chunk could not be fetched: same as offline
    return () => {
      active = false;
    };
  }, [open]);

  // After a close caused by an ended session, the option that had focus is
  // gone: move focus to the control that replaced the menu (the Sign in pill),
  // never to <body> — unless the visitor has already moved it elsewhere.
  useEffect(() => {
    if (!refocus.current || open) return;
    // The cookie is already gone but the chrome has not re-rendered yet: wait
    // for the pill to swap (this runs again when `hasSession` flips), or focus
    // would land on the Account button a moment before it unmounts.
    if (hasSession && !hasAuthCookie()) return;
    refocus.current = false;
    if (document.activeElement && document.activeElement !== document.body) return;
    const target = hasSession ? btnRef.current : signInRef.current?.querySelector<HTMLElement>('button');
    target?.focus();
  }, [open, hasSession, refocusTick]);

  // A different account may sign in on this page later: never show the last one's address.
  useEffect(() => {
    if (!hasSession) setEmail(null);
  }, [hasSession]);

  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[data-account-option]') ?? []);
    if (items.length === 0) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
  };

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    // This device only — the same scope as /account's "Sign out"; the
    // "everywhere" control on /account ends the other sessions.
    await signOutThisDevice(async () => (await import('@/lib/supabase/client')).getSupabaseBrowserClient());
    announceAuthChanged();
    window.location.href = '/';
  };

  if (!isAuthConfigured()) return null;

  if (!ready || !hasSession) {
    // Icon-only below 410px, with the accessible name + tooltip intact: on phones
    // the strip also carries the labelled Tools pill (owner directive, 30 Sep
    // 2026). Measured signed out: with the word (77px) the row needs 369px of
    // inner width, so it fits from a 402px viewport; 410px leaves headroom for
    // fallback fonts. The signed-in Account pill stays icon-only below sm.
    // `contents`: the wrapper adds no box (the measured widths above hold); it
    // only lets focus find this pill after the menu closed on an ended session.
    return (
      <span ref={signInRef} className="contents">
        <SignInButton className={PILL} ariaLabel="Sign in" title="Sign in">
          <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden min-[410px]:inline">Sign in</span>
        </SignInButton>
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        data-sign-in-trigger
        onClick={() => (open ? close(true) : setOpen(true))}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label="Your account"
        title="Your account"
        className={PILL}
      >
        <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Account</span>
        <ChevronDown className={`hidden h-3.5 w-3.5 text-stone-500 transition-transform sm:inline ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          role="group"
          aria-labelledby={labelId}
          onKeyDown={onPanelKeyDown}
          className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl"
        >
          <p id={labelId} className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-stone-600">
            Your account
          </p>
          <p className="truncate px-2.5 pb-2 text-xs text-stone-700" translate="no">
            {email ?? 'Signed in'}
          </p>
          <Link href="/account" data-account-option className={OPTION} onClick={() => setOpen(false)}>
            <UserRound className="h-4 w-4 text-forest-700" aria-hidden="true" /> My account
          </Link>
          <Link href="/account?tab=saved" data-account-option className={OPTION} onClick={() => setOpen(false)}>
            <Bookmark className="h-4 w-4 text-forest-700" aria-hidden="true" /> Saved pages
          </Link>
          <ToolLink href={toolPageHref('application-planner', pageRegion)} data-account-option className={OPTION} onClick={() => setOpen(false)}>
            <ClipboardList className="h-4 w-4 text-forest-700" aria-hidden="true" /> Application planner
          </ToolLink>
          <ToolLink href={toolPageHref('cost-planner', pageRegion)} data-account-option className={OPTION} onClick={() => setOpen(false)}>
            <Coins className="h-4 w-4 text-forest-700" aria-hidden="true" /> Cost &amp; funding planner
          </ToolLink>
          <ToolLink href={toolPageHref('compare-universities', pageRegion)} data-account-option className={OPTION} onClick={() => setOpen(false)}>
            <Columns3 className="h-4 w-4 text-forest-700" aria-hidden="true" /> Compare universities
          </ToolLink>
          <ToolLink href={toolPageHref('test-score-tracker', pageRegion)} data-account-option className={OPTION} onClick={() => setOpen(false)}>
            <Award className="h-4 w-4 text-forest-700" aria-hidden="true" /> Test score tracker
          </ToolLink>
          {/* aria-disabled + the guard in signOut, not `disabled`: Chrome drops
              focus to <body> from a focused button that becomes disabled, and
              a sign-out whose token refresh cannot reach the auth server can
              take ~25 s (the SDK's retries) before it gives up. */}
          <button
            type="button"
            data-account-option
            onClick={() => void signOut()}
            aria-disabled={signingOut || undefined}
            className={`${OPTION} aria-disabled:cursor-not-allowed aria-disabled:opacity-60`}
          >
            <LogOut className="h-4 w-4 text-forest-700" aria-hidden="true" /> {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
