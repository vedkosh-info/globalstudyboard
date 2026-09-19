'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Bookmark, ChevronDown, LogIn, LogOut, UserRound } from 'lucide-react';
import SignInButton from '@/components/auth/SignInButton';
import { useAuth } from '@/components/auth/AuthProvider';
import { announceAuthChanged } from '@/lib/auth-events';
import { isAuthConfigured } from '@/lib/supabase/config';

/**
 * The account control in the context bar — the ONE place the chrome shows
 * sign-in state (the mobile menu row and the /account page are secondary
 * entrances, not duplicates of this control).
 *
 * Placement is measured, not chosen: the header row is exactly full at 1024px
 * (and at 390/430px), so a control there would truncate the destination name
 * or push the menu button off screen (see the width tables in Header.tsx /
 * RegionSwitcher.tsx). The context bar has 33px spare at 320px and ≥88px from
 * 375px up, so: icon-only below `sm` (~40px), text from `sm` (~86px), and the
 * App pill drops its "App" text below 360px so both fit a 320px phone.
 *
 * Signed out → the shared SignInButton. Signed in → a small popover (same
 * pattern as RegionSwitcher: aria-expanded + aria-controls, NO aria-haspopup,
 * role="group" named by its own heading, roving Up/Down/Home/End, Escape returns
 * focus, outside click closes). The e-mail is fetched lazily on open — the
 * Supabase SDK is never part of this chunk.
 */

const PILL =
  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-forest-300 bg-white px-2 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 sm:px-3';

const OPTION =
  'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-stone-800 no-underline hover:bg-forest-50 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500';

export default function AccountControl() {
  const { hasSession, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
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
    void import('@/lib/supabase/client').then(async ({ getSupabaseBrowserClient }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) {
        // The cookie was stale (session revoked elsewhere): tell the chrome.
        announceAuthChanged();
        setOpen(false);
        return;
      }
      setEmail(user.email ?? null);
    });
    return () => {
      active = false;
    };
  }, [open]);

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
    setSigningOut(true);
    try {
      const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
      // This device only — the same scope as /account's "Sign out"; the
      // "everywhere" control on /account is the global one.
      await getSupabaseBrowserClient()?.auth.signOut({ scope: 'local' });
    } catch {
      /* the cookie is cleared client-side regardless of the network */
    }
    announceAuthChanged();
    window.location.href = '/';
  };

  if (!isAuthConfigured()) return null;

  if (!ready || !hasSession) {
    return (
      <SignInButton className={PILL}>
        <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Sign in</span>
      </SignInButton>
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
        className={PILL}
      >
        <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Account</span>
        <ChevronDown className={`h-3.5 w-3.5 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
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
          <button type="button" data-account-option onClick={() => void signOut()} disabled={signingOut} className={OPTION}>
            <LogOut className="h-4 w-4 text-forest-700" aria-hidden="true" /> {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
