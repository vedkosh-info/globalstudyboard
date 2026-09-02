'use client';

import { useEffect, useRef, useState } from 'react';
import { Flag, X } from 'lucide-react';

/**
 * "Report this response" control for a single GSB AI answer.
 *
 * Google Play's Generative AI policy requires an in-app reporting path for
 * AI-generated content that works "without needing to exit the app". The whole
 * flow therefore happens in this dialog — no `mailto:`, no new tab — and posts
 * to /api/report-ai. Nothing identifying is asked for or sent.
 */
export default function ReportAIResponse({ answer }: { answer: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<'inaccurate' | 'offensive' | 'other'>('inaccurate');
  const [detail, setDetail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  // Move focus into the dialog on open, restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    // Land on the first radio rather than the close button, so a keyboard or
    // screen-reader user starts on the actual question.
    const first =
      dialogRef.current?.querySelector<HTMLElement>('input[type="radio"]') ??
      dialogRef.current?.querySelector<HTMLElement>('button');
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) openerRef.current?.focus();
  }, [open]);

  const submit = async () => {
    setState('sending');
    try {
      const res = await fetch('/api/report-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, detail, answer }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  };

  const close = () => {
    setOpen(false);
    setState('idle');
    setDetail('');
    setReason('inaccurate');
  };

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-terracotta-600 underline underline-offset-2"
        aria-haspopup="dialog"
      >
        <Flag className="h-3 w-3" aria-hidden="true" />
        Report this response
      </button>

      {open && (
        <div
          // Above the floating action dock (z-1200) and the full-height layer
          // (z-1400); the destination picker sits at z-1500.
          className="fixed inset-0 z-[1600] flex items-end sm:items-center justify-center bg-stone-900/50 p-0 sm:p-4"
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-ai-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-cream-50 rounded-t-2xl sm:rounded-2xl border border-stone-200 shadow-xl p-5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="report-ai-title" className="font-display text-lg text-forest-800">
                Report this response
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-stone-600 hover:text-forest-800 p-1 -m-1"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {state === 'sent' ? (
              <div className="mt-4">
                <p className="text-sm text-stone-800">
                  Thanks — your report has been sent. We review reported answers and correct the
                  underlying guides where needed.
                </p>
                <p className="mt-3 text-xs text-stone-600">
                  Remember to verify anything important against the official university, exam board
                  or government website.
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
              <>
                <p className="mt-1 text-xs text-stone-600">
                  Answers are generated automatically and can be wrong. Telling us what went wrong
                  helps us fix it. We don&apos;t ask for your name or email.
                </p>

                <fieldset className="mt-4">
                  <legend className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                    What&apos;s wrong with it?
                  </legend>
                  <div className="mt-2 space-y-2">
                    {(
                      [
                        ['inaccurate', 'Inaccurate or out of date'],
                        ['offensive', 'Offensive, unsafe or inappropriate'],
                        ['other', 'Something else'],
                      ] as const
                    ).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 text-sm text-stone-800">
                        <input
                          type="radio"
                          name="report-reason"
                          value={value}
                          checked={reason === value}
                          onChange={() => setReason(value)}
                          className="accent-forest-700"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="block mt-4">
                  <span className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                    Details (optional)
                  </span>
                  <textarea
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="What was wrong, and what should it say?"
                    // font-sans is explicit: Tailwind preflight is disabled, so a
                    // textarea would otherwise fall back to the UA monospace font.
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-sans text-sm text-stone-800 placeholder:text-stone-500 focus:border-forest-600 focus:outline-none"
                  />
                </label>

                {state === 'error' && (
                  <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    That didn&apos;t send. Please try again in a moment.
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="flex-1 rounded-xl border border-stone-300 text-sm font-medium py-2.5 text-stone-700 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={state === 'sending'}
                    className="flex-1 rounded-xl bg-forest-700 text-cream-50 text-sm font-medium py-2.5 hover:bg-forest-800 disabled:opacity-60"
                  >
                    {state === 'sending' ? 'Sending…' : 'Send report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
