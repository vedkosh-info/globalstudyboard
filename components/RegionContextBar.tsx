'use client';

import { Globe2, Smartphone } from 'lucide-react';
import { getRegionBySlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';
import AudienceToggle from '@/components/AudienceToggle';
import GetAppButton from '@/components/GetAppButton';

/**
 * The slim, always-present strip under the header that tells the visitor which
 * study destination the site is currently tuned to, and lets them change it in
 * one tap. Together with the header switcher it keeps the chosen destination
 * front-and-centre on every page. Renders only after the client knows the
 * stored/selected region, so it never flashes the wrong destination.
 *
 * It also carries the "Get the app" link. That lives HERE rather than in the
 * header for a measured reason: at the 1024px desktop breakpoint the header row
 * is already exactly full (wordmark 264px + nav 728px = the whole 992px inner
 * width), so anything added there re-breaks the nav — the same regression that
 * was fixed once by moving the desktop breakpoint md→lg. This bar had 471px
 * spare at 1024px and ~270px spare on the first mobile line, so the link fits on
 * every viewport without adding a third row of chrome above the content.
 *
 * Layout: one flex-wrap row, rendered ONCE (no per-breakpoint duplication) and with
 * NO CSS `order` utilities, so the DOM order is the visual order at every width and
 * the tab order can never disagree with what is on screen (WCAG 2.4.3 / 1.3.2):
 *   < md    line 1: [region] ............ [Android app]
 *           line 2: [Domestic|International] [Change destination]
 *   md+     one row: [region] ... [Android app] [Domestic|International] [Change destination]
 * `ml-auto` on the app pill pushes it and everything after it to the right edge, and
 * `w-full md:w-auto` on the controls is what drops them to their own line below md.
 * This also keeps "Change destination" as the right-most control, where it has always been.
 */
export default function RegionContextBar() {
  const { effectiveRegion, region, pageRegion, openPicker, ready } = useRegion();

  if (!ready) return null;
  const r = getRegionBySlug(effectiveRegion);
  if (!r) return null;

  const label = region
    ? 'Your study destination'
    : pageRegion
      ? 'Showing content for'
      : 'Showing by default';

  // The `data-gsb-context-bar` hook exists so a modal can make this bar inert:
  // it renders between <header> and <main>, so a header/main/footer sweep misses it.
  return (
    <div data-gsb-context-bar className="border-b border-forest-100 bg-forest-50/60">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <p className="m-0 flex min-w-0 items-center gap-2 text-sm text-stone-600">
          <Globe2 className="h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
          {/* Held back to lg. Measured at 768px: with this label shown, the row costs
              ~679px of the 736px available, leaving a 57px name budget — so 6 of the 9
              destinations ("Middle East" upward) wrapped the bar to a second row. Hidden
              until 1024px, the longest name ("United Kingdom & Ireland", ~172px) clears
              every width comfortably. Do NOT move this back to md/sm without re-measuring
              against the LONGEST region name, not "India". */}
          <span className="hidden lg:inline">{label}:</span>
          <RegionFlag slug={r.slug} className="h-4" />
          <strong className="truncate font-semibold text-forest-800">{r.displayName}</strong>
        </p>

        {/*
          Get the app. Same pill geometry as "Change destination" so the bar reads
          as one system; the phone icon is what distinguishes it. Deliberately not
          a filled button — "Ask GSB AI" in the header is the page's primary CTA
          and this must not compete with it.
        */}
        <GetAppButton
          ariaLabel="Get the Android app"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-forest-300 bg-white px-3 py-1 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50"
        >
          <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
          {/* Both visible strings are substrings of the aria-label, so voice control
              still matches what is on screen (WCAG 2.5.3 Label in Name) while the
              accessible name stays "Get the Android app" — the same name the footer,
              mobile menu and dock triggers use (WCAG 3.2.4 Consistent Identification),
              and it discloses the platform before an iOS visitor taps it.
              Short on phones so a long destination name and this pill still share one
              line; "Get the Android app" in full is too wide for the 768px row. */}
          <span className="sm:hidden">App</span>
          <span className="hidden sm:inline">Android app</span>
        </GetAppButton>

        {/*
          Region controls: their own full-width line below md, inline from md up.
          md — not sm — because that is the width where the single row provably fits
          the LONGEST destination name: measured, every one of the nine renders a 48px
          single row at 768px, while at 640-767px the long names (from "United States"
          up) overflowed and wrapped anyway. Forcing the break makes the two-row layout
          deliberate and identical for all destinations instead of flipping per name.
        */}
        <div className="flex w-full shrink-0 items-center gap-2 md:w-auto">
          <AudienceToggle />
          <button
            type="button"
            onClick={openPicker}
            data-region-picker-trigger
            className="shrink-0 rounded-full border border-forest-300 bg-white px-3 py-1 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50"
          >
            Change destination
          </button>
        </div>
      </div>
    </div>
  );
}
