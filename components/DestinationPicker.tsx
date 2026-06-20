'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Compass, ArrowRight, Check } from 'lucide-react';
import {
  REGIONS_ALPHABETICAL,
  REGION_TAGLINES,
  getRegionBySlug,
  type RegionSlug,
} from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Destination picker. Appears once per browser session on the first page a
 * visitor lands on whenever no destination has been chosen — and can be
 * re-opened anytime from the region context bar / switcher. Choosing a region
 * tunes the whole site to it. When the visitor arrives deep from search on a
 * page that already belongs to a destination, that destination is pre-selected
 * so confirming is a single tap. Content always renders behind the picker, so
 * crawlers and direct-link visitors are never blocked.
 *
 * Accessibility: the panel is a focus-trapped dialog — focus moves into it on
 * open (so screen readers announce it), Tab/Shift+Tab cycle within it, and focus
 * is restored to the previously-focused element on close. Escape, the close
 * button, the backdrop and the "just exploring" link all dismiss it.
 */
export default function DestinationPicker() {
  const { pageRegion, setRegion, markPrompted, pickerOpen, ready } = useRegion();
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const open = ready && pickerOpen;

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // On open: move focus into the dialog (so screen readers announce it) and make the
  // rest of the page inert so neither Tab nor AT browse-mode can reach behind the
  // overlay. On close: lift inert, then restore focus to the element that opened the
  // picker — or, on the first-visit auto-open path (where focus was on <body>), to a
  // sensible control rather than dropping focus to the document root.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const background = ['header', 'main', 'footer']
      .map((sel) => document.querySelector(sel))
      .filter((el): el is Element => el !== null);
    background.forEach((el) => el.setAttribute('inert', ''));
    panelRef.current?.focus();
    return () => {
      background.forEach((el) => el.removeAttribute('inert'));
      if (
        previouslyFocused &&
        previouslyFocused !== document.body &&
        previouslyFocused.isConnected &&
        typeof previouslyFocused.focus === 'function'
      ) {
        previouslyFocused.focus();
      } else {
        const fallback =
          document.querySelector<HTMLElement>('[data-region-picker-trigger]') ??
          document.querySelector<HTMLElement>('header a, header button');
        fallback?.focus();
      }
    };
  }, [open]);

  // Escape closes the picker (recorded as a skip for the session).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && markPrompted();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, markPrompted]);

  if (!open) return null;

  const suggested = pageRegion ? getRegionBySlug(pageRegion) : undefined;

  const choose = (slug: RegionSlug) => {
    setRegion(slug);
    // Stay put when confirming the destination of the page they're already on;
    // otherwise take them to the chosen destination's hub.
    if (slug !== pageRegion) router.push(`/regions/${slug}`);
  };

  // Keep Tab focus cycling inside the panel while it is open.
  const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
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
      onClick={markPrompted}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/55 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="destination-picker-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onPanelKeyDown}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-cream-50 rounded-3xl border border-stone-200 shadow-2xl focus:outline-none"
      >
        {/* Decorative top band */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-forest-50 to-transparent"
        />

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={markPrompted}
            aria-label="Skip for now"
            className="absolute top-4 right-4 text-stone-600 hover:text-stone-800 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-forest-700 mb-3">
            <Compass className="w-4 h-4" />
            {suggested ? 'Confirm your destination' : 'Welcome to GlobalStudyBoard'}
          </p>
          <h2
            id="destination-picker-title"
            className="font-display text-3xl sm:text-4xl font-bold tracking-editorial leading-tight text-ink mb-2"
          >
            Where do you want to study?
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
            We tune the whole site to your destination — universities, entrance exams, scholarships,
            costs and visas. Pick where you&apos;re headed (you can change it anytime).
          </p>

          {suggested && (
            <button
              type="button"
              onClick={() => choose(suggested.slug)}
              className="mb-5 flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-forest-300 bg-white p-4 text-left shadow-sm transition-all hover:border-forest-500 hover:shadow-md"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span aria-hidden="true" className="text-2xl leading-none">
                  {suggested.flag}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-base font-bold text-ink">
                    Continue with {suggested.displayName}
                  </span>
                  <span className="block text-xs text-stone-500 truncate">
                    {REGION_TAGLINES[suggested.slug]}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-forest-600 px-3 py-1.5 text-xs font-semibold text-white">
                <Check className="h-4 w-4" /> Confirm
              </span>
            </button>
          )}

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-600">
            {suggested ? 'Or choose another destination' : 'Choose your destination'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REGIONS_ALPHABETICAL.map((r) => (
              <button
                key={r.slug}
                type="button"
                onClick={() => choose(r.slug)}
                className="text-left bg-white border border-stone-200 rounded-2xl p-4 hover:border-forest-400 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-2 min-w-0">
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {r.flag}
                    </span>
                    <span className="font-display text-base font-bold text-ink group-hover:text-forest-700 transition-colors truncate">
                      {r.displayName}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-stone-400 group-hover:text-forest-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-stone-500 text-xs leading-relaxed m-0">{REGION_TAGLINES[r.slug]}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={markPrompted}
            className="mt-6 text-sm text-stone-500 hover:text-forest-700 underline-offset-2 hover:underline"
          >
            I&apos;m just exploring — show me everything
          </button>
        </div>
      </div>
    </div>
  );
}
