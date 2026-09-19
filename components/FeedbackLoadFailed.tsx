'use client';

import { useEffect, useRef, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { CONTACT_EMAIL } from '@/lib/site-meta';
import { lockBackground, trapTab } from '@/lib/dialog-a11y';

/**
 * Stand-in rendered by <FeedbackHost/> when the lazily loaded dialog chunk
 * cannot be fetched (offline, a stale deployment's hashed chunk gone after a
 * redeploy, an ad-blocker). Without this, the rejected `import()` would throw
 * inside the ROOT LAYOUT — above every `error.tsx` — and take the whole page
 * down. Tiny on purpose: a sentence and the project inbox, nothing else.
 */
export default function FeedbackLoadFailed({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Same modal treatment as the real dialog: scroll lock, inert page, Tab trap.
  useEffect(() => lockBackground(), []);
  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => trapTab(e, panelRef.current);

  return (
    <div
      className="fixed inset-0 z-[1550] flex items-end sm:items-center justify-center bg-stone-900/50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gsb-feedback-failed-title"
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className="w-full sm:max-w-md bg-cream-50 rounded-t-2xl sm:rounded-2xl border border-stone-200 shadow-xl p-5 focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="gsb-feedback-failed-title" className="font-display text-lg leading-tight text-forest-800">
            The feedback form could not load
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-2 -m-2 text-stone-600 hover:text-forest-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-3 text-sm text-stone-800 leading-relaxed">
          Please check your connection and try again, or email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 text-forest-700">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-forest-700 text-cream-50 text-sm font-medium py-2.5 hover:bg-forest-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
