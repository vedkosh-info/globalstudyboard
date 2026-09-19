'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import {
  FEEDBACK_RETURN,
  FEEDBACK_RETURN_SCOPE,
  FEEDBACK_TRIGGER,
  OPEN_FEEDBACK_EVENT,
  type FeedbackAttachment,
  type FeedbackKind,
  type FeedbackPrefill,
  type OpenFeedbackDetail,
} from '@/lib/feedback';

// The form is lazy: the every-page layout carries only this tiny host, and the
// dialog's code downloads on the first tap (ssr:false — pure client UI).
//
// The loader must NEVER reject: `dynamic()` is React.lazy under the hood, this
// host sits in the root layout ABOVE every error boundary, and a chunk that
// fails to fetch (offline, a stale deployment's hash after a redeploy) would
// otherwise take the whole page down. It falls back to a one-sentence dialog
// pointing at the project inbox. The `loading` overlay makes the first tap
// respond instantly (backdrop + "Loading…") while the chunk is in flight; the
// dialog itself locks scroll and inerts the page once it mounts.
const FeedbackModal = dynamic(
  () =>
    import('@/components/FeedbackModal').catch(() =>
      import('@/components/FeedbackLoadFailed'),
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 z-[1550] flex items-end sm:items-center justify-center bg-stone-900/50 p-0 sm:p-4"
        role="status"
        aria-live="polite"
        aria-label="Loading the feedback form"
      >
        <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-cream-50 border border-stone-200 shadow-xl px-5 py-6 text-sm text-stone-600">
          Loading…
        </div>
      </div>
    ),
  },
);

/**
 * Global host for the "Share feedback / Report an issue" dialog.
 *
 * Mounted once in the root layout and opened by a custom event, so any trigger
 * anywhere is one `<FeedbackButton/>` (see `lib/feedback.ts`).
 *
 * Why the attachment state lives HERE and not in the dialog: the root layout
 * never remounts on client-side navigation, so files a visitor attached survive
 * page-to-page browsing even though the dialog itself closes on navigation.
 * Typed fields survive even a full reload via the localStorage draft
 * (`lib/feedback-draft.ts`) — together they make "continue from any page" work.
 *
 * Focus (WCAG 2.4.3): the dialog holds a focus trap; on a user-initiated close
 * focus returns to the element that opened it, or to a surviving trigger when
 * that one has unmounted (menu rows and dock items do). A close caused by a
 * route change does NOT restore focus — that would yank the viewport back to
 * the footer trigger, which persists across routes.
 */
export default function FeedbackHost() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [requestedKind, setRequestedKind] = useState<FeedbackKind | undefined>(undefined);
  const [prefill, setPrefill] = useState<FeedbackPrefill | undefined>(undefined);
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const openerRef = useRef<Element | null>(null);
  // Where to land if the opener has unmounted by the time we close: the dock
  // collapses, the mobile menu closes and a page's "Report issue" panel folds
  // as soon as their item is used, so the item that opened us is gone. Their
  // TOGGLES persist (marked with FEEDBACK_RETURN inside a FEEDBACK_RETURN_SCOPE)
  // and sit where the visitor was looking — unlike the footer trigger, which
  // would scroll the page to the bottom if focus fell there.
  const fallbackRef = useRef<HTMLElement | null>(null);
  const closedByNavigation = useRef(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<OpenFeedbackDetail>).detail;
      const opener = document.activeElement;
      openerRef.current = opener;
      fallbackRef.current =
        opener
          ?.closest<HTMLElement>(`[${FEEDBACK_RETURN_SCOPE}]`)
          ?.querySelector<HTMLElement>(`[${FEEDBACK_RETURN}]`) ?? null;
      closedByNavigation.current = false;
      setRequestedKind(detail?.kind);
      setPrefill(detail?.prefill);
      setOpen(true);
    };
    window.addEventListener(OPEN_FEEDBACK_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_FEEDBACK_EVENT, onOpen);
  }, []);

  // Close on navigation (the draft + attachments make reopening seamless).
  useEffect(() => {
    setOpen((wasOpen) => {
      if (wasOpen) closedByNavigation.current = true;
      return false;
    });
  }, [pathname]);

  // Restore focus after a user-initiated close, once the dialog has unmounted.
  useEffect(() => {
    if (open) return;
    if (closedByNavigation.current) {
      closedByNavigation.current = false;
      openerRef.current = null;
      return;
    }
    const opener = openerRef.current;
    const hostToggle = fallbackRef.current;
    openerRef.current = null;
    fallbackRef.current = null;
    if (!opener) return; // never opened yet (initial mount)
    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus();
      return;
    }
    const fallback =
      (hostToggle?.isConnected ? hostToggle : null) ??
      document.querySelector<HTMLElement>(`[${FEEDBACK_TRIGGER}]`) ??
      document.querySelector<HTMLElement>('header a, header button');
    fallback?.focus();
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  if (!open) return null;

  return (
    <FeedbackModal
      onClose={close}
      requestedKind={requestedKind}
      prefill={prefill}
      attachments={attachments}
      setAttachments={setAttachments}
    />
  );
}
