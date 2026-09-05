'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { usePathname } from 'next/navigation';
import { X, Smartphone, Check } from 'lucide-react';
import { useRegion } from '@/components/RegionProvider';
import { OPEN_TESTER_INVITE_EVENT } from '@/lib/tester-invite';

/**
 * Android beta-tester sign-up.
 *
 * The Play app is on the internal-testing track, so nobody can install it until
 * the owner adds their Google-account address to the Play Console tester list.
 * This dialog collects that address and posts it to /api/tester-invite, which
 * appends it to the "GlobalStudyBoard App Testers" sheet. The owner adds the
 * address in Play and Play sends the invite — hence the explicit "we'll email
 * you" wording: nothing is instant and the copy must not imply otherwise.
 *
 * Mounted once globally in the root layout and opened by a custom event, so any
 * trigger anywhere is two lines (see `lib/tester-invite.ts`).
 *
 * Accessibility: a real focus-trapped dialog, matching the treatment in
 * the rest of the site — body scroll is locked, the background is
 * made `inert` so neither Tab nor screen-reader browse mode can reach behind it,
 * Tab/Shift+Tab cycle inside the panel, and focus is restored on close.
 */

// Permissive on purpose — a Play tester may use any Google account, including a
// Workspace address, so restricting to @gmail.com would reject valid testers.
// The server re-validates; this is only to catch typos before a round trip.
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Everything that must go inert while the dialog is open. `header`/`main`/`footer`
 * are the page; the context bar sits BETWEEN header and main so a three-selector
 * sweep misses it; the quick-actions dock is a top-level sibling of the dialog and
 * would otherwise stay tabbable underneath it.
 */
const BACKGROUND = ['header', 'main', 'footer', '[data-gsb-context-bar]', '.gsb-dock'];

type Status = 'idle' | 'submitting' | 'done' | 'error';

export default function TesterInviteModal() {
  const pathname = usePathname() || '/';
  const { effectiveRegion } = useRegion();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<Element | null>(null);
  // A route change closes the dialog too. Restoring focus then would yank the
  // viewport back to whichever trigger opened it (the footer button persists
  // across routes), so navigation-driven closes must not restore focus.
  const closedByNavigation = useRef(false);
  // Where the pointer went DOWN. A backdrop click only dismisses if the press
  // started on the backdrop — otherwise selecting text in the panel and
  // releasing outside it would discard a half-typed address.
  const pressStartedOnBackdrop = useRef(false);

  const value = email.trim().toLowerCase();
  const valid = EMAIL_RE.test(value) && value.length <= 254;
  const showError = touched && email.trim().length > 0 && !valid;

  // Any trigger (footer, mobile menu, quick-actions dock) opens it by event.
  useEffect(() => {
    const onOpen = () => {
      openerRef.current = document.activeElement;
      closedByNavigation.current = false;
      setEmail('');
      setTouched(false);
      setHoneypot('');
      setStatus('idle');
      setMessage('');
      setOpen(true);
    };
    window.addEventListener(OPEN_TESTER_INVITE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TESTER_INVITE_EVENT, onOpen);
  }, []);

  // Close on navigation, flagged so the cleanup below skips focus restoration.
  useEffect(() => {
    setOpen((wasOpen) => {
      if (wasOpen) closedByNavigation.current = true;
      return false;
    });
  }, [pathname]);

  // Lock body scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Make the background inert on open; lift it and restore focus on close.
  useEffect(() => {
    if (!open) return;
    const background = BACKGROUND.flatMap((sel) =>
      Array.from(document.querySelectorAll(sel)),
    );
    background.forEach((el) => el.setAttribute('inert', ''));
    return () => {
      background.forEach((el) => el.removeAttribute('inert'));
      if (closedByNavigation.current) {
        closedByNavigation.current = false;
        return;
      }
      const opener = openerRef.current;
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
        return;
      }
      // The mobile menu and the quick-actions dock unmount their trigger when
      // they close, so the captured opener is gone by now. Fall back to a
      // trigger that still exists rather than dropping focus on <body>.
      const fallback =
        document.querySelector<HTMLElement>('[data-get-app-trigger]') ??
        document.querySelector<HTMLElement>('header a, header button');
      fallback?.focus();
    };
  }, [open]);

  // Escape to close; focus the email field once the dialog has painted.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(id);
    };
  }, [open]);

  // Move focus into the success panel so a screen-reader user hears the outcome
  // instead of being left on a submit button that no longer exists.
  useEffect(() => {
    if (status === 'done') successRef.current?.focus();
  }, [status]);

  if (!open) return null;

  const close = () => setOpen(false);

  // Keep Tab cycling inside the panel while it is open.
  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    // `el.tabIndex >= 0` matters: the bare `input` in FOCUSABLE also matches the
    // honeypot, which is off-screen with tabIndex={-1}. Real Tab skips it, but it
    // must never become a wrap target either.
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null && el.tabIndex >= 0,
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const activeEl = document.activeElement;
    if (e.shiftKey && (activeEl === first || activeEl === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (activeEl === last || activeEl === panel)) {
      e.preventDefault();
      first.focus();
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setTouched(true);
      return;
    }
    setStatus('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/tester-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: value,
          page: pathname,
          region: effectiveRegion,
          source: 'website',
          ...(honeypot ? { website: honeypot } : {}),
        }),
      });
      if (res.ok) {
        setStatus('done');
        return;
      }
      const data = await res.json().catch(() => null);
      setMessage(
        (data && typeof data.error === 'string' && data.error) ||
          'Something went wrong. Please try again.',
      );
      setStatus('error');
    } catch {
      setMessage('Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div
      // Above the quick-actions dock (z-1300) and the recent-pages drawer
      // (z-1400); the report-AI dialog (z-1600) is the only layer above, and the
      // two never open together. (The destination picker that used to sit at
      // z-1500 no longer exists — no z-1500 layer remains in the codebase.)
      className="fixed inset-0 z-[1550] flex items-end sm:items-center justify-center bg-stone-900/50 p-0 sm:p-4"
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressStartedOnBackdrop.current) close();
        pressStartedOnBackdrop.current = false;
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tester-invite-title"
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className="w-full sm:max-w-md bg-cream-50 rounded-t-2xl sm:rounded-2xl border border-stone-200 shadow-xl p-5 max-h-[90vh] overflow-y-auto focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-cream-50">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2
              id="tester-invite-title"
              className="font-display text-lg leading-tight text-forest-800"
            >
              {status === 'done' ? 'You’re on the list' : 'Early access to the app'}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-stone-600 hover:text-forest-800 p-1 -m-1"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {status === 'done' ? (
          <div ref={successRef} tabIndex={-1} className="mt-4 focus:outline-none">
            <p className="text-sm text-stone-800 leading-relaxed">
              Thank you — your request for early access is in. Here is what happens next:
            </p>
            <ol className="mt-3 space-y-2 list-none p-0 m-0">
              {[
                'We review requests and approve them in small batches.',
                'Once your request is approved, you’ll get an email with instructions to install — within 24 hours.',
                'Open that email on your Android phone, tap “Become a tester”, then install.',
              ].map((step) => (
                <li key={step} className="flex gap-2 text-sm text-stone-700 leading-relaxed">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-forest-600" aria-hidden="true" />
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-stone-600 leading-relaxed">
              Your invitation only works for the address you gave us, so open it on the phone that is
              signed in to that Google account. Every guide is on this site too — the app is for
              reading it comfortably on your phone.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-4 w-full rounded-xl bg-forest-700 text-cream-50 text-sm font-medium py-2.5 hover:bg-forest-800"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-1">
            {/*
              Sells the ACCESS as exclusive — which is true, places are genuinely limited — and
              deliberately does NOT claim exclusive or premium FEATURES. The app is a wrapper around
              this same site and has none, and inventing them would be a misleading claim of exactly
              the kind Play rejected this app for.
            */}
            <p className="text-sm text-stone-800 leading-relaxed">
              We&apos;re testing the GlobalStudyBoard Android app with a limited, invite-only group
              before we open to everyone.
            </p>
            <p className="mt-2 text-sm text-stone-700 leading-relaxed">
              If you&apos;d like an exclusive early-access preview, share the Google account email
              you&apos;re signed in with on your Android phone.
            </p>
            <p className="mt-2 text-sm text-stone-700 leading-relaxed">
              Once your request is approved, you&apos;ll get an email with instructions to install —
              within 24 hours.
            </p>

            {/* Honeypot — bots fill hidden fields; the server drops those rows. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            <label htmlFor="tester-invite-email" className="block mt-4">
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Google account email
              </span>
              <input
                id="tester-invite-email"
                ref={inputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                // RFC 2606 reserved domain — never a real person's address.
                placeholder="you@example.com"
                aria-invalid={showError || undefined}
                aria-describedby="tester-invite-help"
                // font-sans is explicit: Tailwind preflight is disabled, so the
                // input would otherwise fall back to the UA default font.
                className={`mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-sm text-stone-800 placeholder:text-stone-500 focus:outline-none ${
                  showError
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-stone-300 focus:border-forest-600'
                }`}
              />
            </label>

            {/*
              role="status" so the validation hint and any server error are spoken
              without stealing focus from the field or the submit button.
            */}
            <p
              id="tester-invite-help"
              role="status"
              aria-live="polite"
              className="mt-1.5 text-xs leading-relaxed"
            >
              {showError ? (
                <span className="text-red-600 font-medium">
                  Please enter a valid email address.
                </span>
              ) : status === 'error' ? (
                <span className="text-red-600 font-medium">{message}</span>
              ) : (
                <span className="text-stone-600">
                  Used only to send your Play Store invite — no marketing, no sharing. See our{' '}
                  <a href="/privacy" className="underline underline-offset-2 hover:text-forest-700">
                    privacy policy
                  </a>
                  .
                </span>
              )}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-xl border border-stone-300 text-sm font-medium py-2.5 text-stone-700 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'submitting' || !valid}
                className="flex-1 rounded-xl bg-forest-700 text-cream-50 text-sm font-medium py-2.5 hover:bg-forest-800 disabled:bg-stone-200 disabled:text-stone-500 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? 'Sending…' : 'Request early access'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
