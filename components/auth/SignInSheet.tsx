'use client';

import dynamic from 'next/dynamic';
import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { lockBodyScroll, unlockBodyScroll } from '@/lib/scroll-lock';
import type { SignInRequest, SignInVerdict } from '@/lib/auth-events';

/**
 * The contextual sign-in dialog FRAME — rendered synchronously by SignInHost the
 * moment a trigger fires, so the click is never "dead": the backdrop, the named
 * `role="dialog"`, the scroll lock, the inert sweep and initial focus all exist
 * before the form's chunk (which carries the Supabase SDK) has downloaded. The
 * form streams in below the heading with a live "Loading…" line meanwhile.
 *
 * Accessibility follows TesterInviteModal exactly: a real focus-trapped dialog,
 * body scroll locked (lib/scroll-lock — body{overflow:hidden} is inert here),
 * the background made `inert` so neither Tab nor screen-reader browse mode can
 * reach behind it, Tab/Shift+Tab cycle inside the panel, Escape closes, and
 * focus is restored to the trigger on close (with a `[data-sign-in-trigger]`
 * fallback because menu hosts unmount their trigger when they close).
 */

const LoginForm = dynamic(() => import('@/components/auth/LoginForm'), {
  ssr: false,
  loading: () => (
    <p role="status" aria-live="polite" className="mt-4 text-sm text-stone-600">
      Loading sign-in…
    </p>
  ),
});

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';

/**
 * Everything that must go inert while the dialog is open. `header`/`main`/`footer`
 * are the page; the context bar sits BETWEEN header and main so a three-selector
 * sweep misses it; the quick-actions dock is a top-level sibling of the dialog.
 */
const BACKGROUND = ['header', 'main', 'footer', '[data-gsb-context-bar]', '.gsb-dock'];

export default function SignInSheet({
  request,
  opener,
  closedByNavigation,
  onClose,
}: {
  request: SignInRequest;
  /** The element that was focused when the sheet opened (for focus restore). */
  opener: Element | null;
  /** Set by the host when a route change closed the sheet — no focus restore then. */
  closedByNavigation: { current: boolean };
  onClose: (verdict: SignInVerdict) => void;
}) {
  const headingId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const pressStartedOnBackdrop = useRef(false);

  // Scroll lock + inert background for the lifetime of the sheet; restore focus
  // on unmount unless a navigation closed it.
  useEffect(() => {
    lockBodyScroll();
    const background = BACKGROUND.flatMap((sel) => Array.from(document.querySelectorAll(sel)));
    background.forEach((el) => el.setAttribute('inert', ''));
    return () => {
      background.forEach((el) => el.removeAttribute('inert'));
      unlockBodyScroll();
      if (closedByNavigation.current) {
        closedByNavigation.current = false;
        return;
      }
      // Safari does not focus a button on click, so the captured opener can be
      // <body>; that is not a restore target — use the fallback instead.
      if (opener instanceof HTMLElement && opener.isConnected && opener !== document.body) {
        opener.focus();
        return;
      }
      const fallback =
        document.querySelector<HTMLElement>('[data-sign-in-trigger]') ??
        document.querySelector<HTMLElement>('header a, header button');
      fallback?.focus();
    };
  }, [opener, closedByNavigation]);

  // Escape closes; focus enters the dialog immediately (the form moves it to
  // its e-mail field when its chunk mounts).
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose('dismissed');
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
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

  return (
    <div
      // Layer stack: dock z-1200 (.gsb-dock), recent-pages backdrop z-1300 / panel
      // z-1400, tester-invite dialog z-1550, THIS sheet z-1575, report-AI dialog
      // z-1600. The two dialogs never open together (the App trigger sits in the
      // inert context bar while this is open, and vice versa), but distinct tiers
      // keep the stack unambiguous.
      className="fixed inset-0 z-[1575] flex items-end justify-center bg-stone-900/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressStartedOnBackdrop.current) onClose('dismissed');
        pressStartedOnBackdrop.current = false;
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border border-stone-200 bg-cream-50 p-5 shadow-xl focus:outline-none motion-safe:animate-[gsb-sheet-in_.2s_ease-out] motion-reduce:animate-none sm:max-w-md sm:rounded-2xl"
      >
        {/* The dialog's accessible name lives in the frame so it exists before
            the form chunk arrives (and stays stable across its steps). */}
        <h2 id={headingId} className="sr-only">
          Sign in or create your account
        </h2>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onClose('dismissed')}
            aria-label="Close"
            className="-m-1 p-1 text-stone-600 hover:text-forest-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="-mt-3">
          <LoginForm
            variant="modal"
            next={request.next}
            resumeIntent={request.intent}
            onSuccess={() => onClose('ok')}
          />
          {request.intent === 'save' && (
            <p className="mt-4 text-xs text-stone-600 leading-relaxed">
              Your page stays right here — it will be saved as soon as you sign in.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
