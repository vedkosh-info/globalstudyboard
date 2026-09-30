'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Info } from 'lucide-react';

/**
 * The on-image AI disclosure, collapsed to a circular (i) by default.
 *
 * Owner decision 22 Sep 2026 (an explicit override of the 18 Sep review's
 * "words always visible" recommendation, logged in the audit log): only the ⓘ
 * shows at rest; a click/tap reveals "AI-generated · not a photo" beside it in the
 * same pill, and the revealed text is a plain link to the image policy (full
 * navigation, so the browser Back button returns here). A second click, Escape, or
 * a tap anywhere else collapses it again.
 *
 * Props are plain strings on purpose — ContentImage (a server component) computes
 * them and nothing from lib/images ever reaches the client bundle.
 *
 * Crawlers and assistive tech still get the disclosure without a click: the label
 * text is in the server HTML (toggled with the `hidden` class, never mounted on
 * demand — so server and first client render agree and there is no hydration
 * mismatch), and the ⓘ button's accessible name carries the full sentence.
 */
interface Props {
  /** Visible label, e.g. "AI-generated · not a photo". */
  label: string;
  /** Screen-reader form of the same words, e.g. "AI-generated, not a photo". */
  spokenLabel: string;
  href: string;
  variant: 'hero' | 'card';
}

export default function AiImageBadge({ label, spokenLabel, href, variant }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textId = useId();
  const hero = variant === 'hero';

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Escape + tap-outside only while open — no listeners at rest on ~3,400 pages.
  // Deliberately NOT a blur/focusout close: Safari/iOS and Firefox-mac do not
  // focus links on click, so a blur-close would hide the link before its click lands.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close]);

  return (
    <div
      ref={rootRef}
      // Dark glass with cream text: ≥9:1 against any pixel behind it, including a
      // white sky (measured across all 93 heroes). 12px is the site's disclosure
      // floor. print: Chromium's PDF compositor drops any element carrying
      // backdrop-filter, so the blur is switched off for print and the fill forced.
      className={`inline-flex items-center rounded-full bg-ink/75 text-cream-50 ring-1 ring-cream-50/40 shadow-sm backdrop-blur-sm print:backdrop-blur-none print:bg-ink print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact] ${
        hero ? 'h-8' : 'h-7'
      }`}
    >
      <a
        id={textId}
        href={href}
        className={`${open ? 'inline-flex' : 'hidden'} items-center self-stretch font-semibold text-cream-50 no-underline hover:underline hover:text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cream-50 focus-visible:outline-offset-2 ${
          hero ? 'pl-3 pr-1 text-xs' : 'pl-2.5 pr-0.5 text-xs'
        }`}
      >
        {label}
        <span className="sr-only"> — read how we use AI images</span>
      </a>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={textId}
        // The sentence is the name, so a screen-reader user hears the disclosure
        // at the collapsed state without activating anything (WCAG 4.1.2).
        aria-label={`${spokenLabel} — ${open ? 'hide' : 'show'} details`}
        onClick={() => setOpen((v) => !v)}
        // 32×32 hit target (WCAG 2.5.8 ≥24); cream outline + dark halo so the focus
        // ring stays visible over warm photos where the global terracotta ring vanishes.
        className={`inline-flex shrink-0 items-center justify-center rounded-full text-cream-50 hover:bg-ink/60 motion-safe:transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cream-50 focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_5px_rgba(10,10,10,0.6)] ${
          hero ? 'h-8 w-8' : 'h-7 w-7'
        }`}
      >
        <Info aria-hidden="true" className={hero ? 'h-4 w-4' : 'h-3.5 w-3.5'} strokeWidth={2.25} />
      </button>
    </div>
  );
}
