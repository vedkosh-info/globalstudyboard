'use client';

import { Smartphone } from 'lucide-react';
import AudienceToggle from '@/components/AudienceToggle';
import GetAppButton from '@/components/GetAppButton';

/**
 * The slim strip under the header. It carries the two site-wide controls that do
 * NOT belong in the header: the domestic/international student toggle, and the
 * "get the Android app" link the owner wants reachable from the top of every page.
 *
 * It deliberately no longer shows the study destination or a "Change destination"
 * button. Both used to live here as well as in the header, so the same setting was
 * offered in three shapes above the fold; the destination now has exactly one home
 * — the header control (`RegionSwitcher`), which is sticky and therefore reachable
 * at any scroll position, unlike this bar.
 *
 * Layout: ONE flex row at every width — the two controls are short enough that
 * even the longest rendering fits a 320px phone, so the bar is a fixed ~38px on
 * every viewport instead of flipping between one and two rows. Rendered once, with
 * no `order` utilities, so DOM order is visual order and tab order can never
 * disagree with the screen (WCAG 2.4.3 / 1.3.2).
 *
 * It renders server-side too (no `ready` gate): nothing in it depends on the
 * stored region, so there is no wrong-value flash to avoid — and rendering it in
 * the static HTML means the page below it never jumps down after hydration.
 *
 * The `data-gsb-context-bar` hook exists so a modal can make this bar inert: it
 * renders between <header> and <main>, so a header/main/footer sweep misses it.
 */
export default function RegionContextBar() {
  return (
    <div data-gsb-context-bar className="border-b border-forest-100 bg-forest-50/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          {/* Hidden on the narrowest phones only; the toggle keeps its own group
              label ("I am a domestic or international student") for assistive tech. */}
          <span className="hidden shrink-0 text-xs font-medium text-stone-600 sm:inline">
            Studying as
          </span>
          <AudienceToggle />
        </div>

        {/*
          Get the app. An outline pill, not a filled button: "Ask GSB AI" in the
          header is the page's primary CTA and this must not compete with it.
          Both visible strings are substrings of the accessible name, so voice
          control still matches what is on screen (WCAG 2.5.3 Label in Name) while
          the name stays "Get the Android app" — the same name the footer, mobile
          menu and dock triggers use (WCAG 3.2.4 Consistent Identification) — and it
          discloses the platform before an iOS visitor taps it.
        */}
        <GetAppButton
          ariaLabel="Get the Android app"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-forest-300 bg-white px-3 py-1 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1"
        >
          <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sm:hidden">App</span>
          <span className="hidden sm:inline">Get the Android app</span>
        </GetAppButton>
      </div>
    </div>
  );
}
