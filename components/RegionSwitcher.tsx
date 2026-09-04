'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';
import DestinationMenu from '@/components/DestinationMenu';

/**
 * The site's ONE destination control.
 *
 * It shows the destination the whole site is currently tuned to and is the only
 * place in the page chrome where it can be changed. The context bar used to
 * repeat both jobs — a "Showing by default: India" label AND a separate "Change
 * destination" button that opened a differently-shaped modal — so the same
 * setting appeared three times in three shapes above the fold. Now: one control,
 * one panel, one list (`DestinationMenu`). The modal is gone entirely — the site
 * shows a default destination and never asks before it serves (§16.3).
 *
 * It lives in the header rather than the bar below because the header is sticky:
 * the destination stays visible and changeable at any scroll position.
 *
 * Keyboard: Enter/Space opens and moves focus to the current destination;
 * Up/Down/Home/End rove the options; Escape closes and returns focus here.
 */
export default function RegionSwitcher() {
  const { effectiveRegion, setRegion } = useRegion();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const panelLabelId = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) btnRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const options = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[data-destination-option]') ?? []),
    [],
  );

  // Opening lands focus on the destination in use, so a keyboard or screen-reader
  // user hears where they are before they move.
  useEffect(() => {
    if (!open) return;
    const items = options();
    const current = items.find((el) => el.dataset.regionSlug === effectiveRegion);
    (current ?? items[0])?.focus();
  }, [open, effectiveRegion, options]);

  const onPanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    const items = options();
    if (items.length === 0) return;
    e.preventDefault();
    const at = items.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? items.length - 1
          : e.key === 'ArrowDown'
            ? (at + 1 + items.length) % items.length
            : (at - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  // Always a real region (India until the student picks otherwise), so the
  // control is never blank and always names the destination in force.
  const active = getRegionBySlug(effectiveRegion);

  const choose = (slug: RegionSlug) => {
    setRegion(slug);
    close(true);
    // Re-tune in place. The one exception: when standing on a region-scoped URL,
    // move to the same view for the new destination so the page cannot contradict
    // the control that was just used.
    if (pathname?.startsWith('/regions/')) router.push(`/regions/${slug}`);
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        type="button"
        /* Stable hook for verification/automation: the ONE control that changes
           the destination. (It outlived the welcome dialog that used to restore
           focus to it; the name is kept so existing checks keep resolving.) */
        data-region-picker-trigger
        onClick={() => (open ? close(true) : setOpen(true))}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`Study destination: ${active?.displayName ?? 'not set'}. Change destination`}
        className="flex h-9 min-w-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-forest-300 bg-white px-2.5 text-sm font-semibold text-forest-800 shadow-sm transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 sm:px-3"
      >
        <RegionFlag slug={effectiveRegion} className="h-4" />
        {/*
          The name appears from 640px (sm) up. It is NOT shown below that, and the flag
          is doing the work there: measured on a 375px phone, wordmark (213px) +
          named pill (139px) + menu button (32px) needs 400px of a 343px row, and
          the menu button was pushed clean off the screen — unreachable, with
          `overflow-x: hidden` hiding the evidence. The old control showed a
          featureless globe at every width, which is what made a phone visitor
          unable to tell which destination they were on; a flag answers that in the
          same space. Full name is always in the accessible name and in the panel.
          Above 640px the name is capped per breakpoint so a long one ("United
          Kingdom & Ireland", ~172px) truncates by design rather than squeezing the
          nav beside it. It was briefly revealed from 460px, which overflowed the
          row (wordmark 212px + named pill 186px + menu 32px > the 428px available)
          and — because this button was shrink-0 and MobileMenu was not — collapsed
          the hamburger to a 13px sliver for the 7 destinations with long names.
          Measure against the LONGEST name at 640px before lowering this again.
        */}
        <span className="hidden min-w-0 truncate sm:inline sm:max-w-[8.5rem] xl:max-w-[12rem]">
          {active?.displayName ?? 'Choose destination'}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          onKeyDown={onPanelKeyDown}
          /* group + aria-labelledby: the popup is a list of real buttons, not a
             menu widget, so it takes its name from the heading DestinationMenu
             already renders ("I want to study in…") rather than claiming a role
             it does not implement. Without this the popup was anonymous to a
             screen reader — the labelId prop existed for exactly this and was
             never wired up. */
          role="group"
          aria-labelledby={panelLabelId}
          className="absolute right-0 z-50 mt-2 max-h-[min(78vh,32rem)] w-[16.5rem] overflow-y-auto overscroll-contain rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl"
        >
          <DestinationMenu
            onChoose={choose}
            onNavigate={() => setOpen(false)}
            showBrowseAll
            labelId={panelLabelId}
          />
        </div>
      )}
    </div>
  );
}
