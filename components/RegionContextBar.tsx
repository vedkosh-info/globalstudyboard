'use client';

import { Smartphone, Wrench } from 'lucide-react';
import AudienceToggle from '@/components/AudienceToggle';
import GetAppButton from '@/components/GetAppButton';
import AccountControl from '@/components/auth/AccountControl';
import ToolsEntranceLink from '@/components/ToolsEntranceLink';

/**
 * The slim strip under the header. It carries the site-wide controls that do NOT
 * belong in the header: the domestic/international student toggle, a labelled
 * Tools link below lg (the header nav carries "Tools" from lg — owner directive,
 * 30 Sep 2026), the account control (Sign in / Account — the header row is
 * measured full at 1024px, so the account control lives here, see
 * components/auth/AccountControl.tsx), and the "get the Android app" link the
 * owner wants reachable from the top of every page.
 *
 * It deliberately no longer shows the study destination or a "Change destination"
 * button. Both used to live here as well as in the header, so the same setting was
 * offered in three shapes above the fold; the destination now has exactly one home
 * — the header control (`RegionSwitcher`), which is sticky and therefore reachable
 * at any scroll position, unlike this bar.
 *
 * Layout: ONE flex row at every width. Measured 30 Sep 2026 (inner width =
 * vw − 32), after the labelled Tools pill (67px; 75px from `sm`) joined the row
 * for phones and tablets:
 *   320px (288): toggle 165 (compact padding below `sm`) + 12 + Tools 67 + 8 +
 *                account 32 = 284 — the App pill steps aside below 360px (it is
 *                still in the menu, the footer and the quick-actions dock).
 *   360–409px:   + App 32 icon-only (+8) = 324 ≤ 328; Sign in and the signed-in
 *                Account pill are both 32px icon-only here.
 *   410–639px:   the signed-out "Sign in" word returns (77px): 165 + 12 + 67 + 8
 *                + 77 + 8 + 32 = 369 ≤ 378 (it fits from 402px; 410 leaves
 *                headroom for fallback fonts). Signed in stays 32px below `sm`.
 *   640px (608): left cluster 247 ("Studying as" + toggle), + 12 + Tools 75 + 8
 *                + Sign in 85 / Account 115 + 8 + "App" 70 = 505 signed out /
 *                535 signed in — fits. Full "Get the Android app" (162) from
 *                680px: at 640 signed in it would need 627 of 608 and the toggle
 *                runs under the Tools pill; at 680 (648) it clears by ~20px
 *                beyond the 12px gap.
 *   lg+:         the Tools pill steps aside — the header nav carries "Tools".
 * Rendered once, with no `order` utilities, so DOM order is visual order and tab
 * order can never disagree with the screen (WCAG 2.4.3 / 1.3.2). Re-measure at
 * 320/360/410/640/680, signed in and out, before widening anything here.
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
    // relative z-[35]: the account popover inside must stay UNDER the pinned
    // header (z-40) when the page scrolls, and above the pinned RegionRail (z-30).
    <div data-gsb-context-bar className="relative z-[35] border-b border-forest-100 bg-forest-50/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          {/* Hidden on the narrowest phones only; the toggle keeps its own group
              label ("I am a domestic or international student") for assistive tech. */}
          <span className="hidden shrink-0 text-xs font-medium text-stone-600 sm:inline">
            Studying as
          </span>
          <AudienceToggle />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Tools — a permanent, labelled entrance on phones and tablets (owner
              directive, 30 Sep 2026). From lg the header nav carries "Tools", so
              this pill steps aside there. Its label stays visible at every width:
              an icon alone would not say what it opens. */}
          <ToolsEntranceLink className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-forest-300 bg-white px-2 text-xs font-semibold text-forest-700 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 sm:px-3 lg:hidden">
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            Tools
          </ToolsEntranceLink>
          {/* Sign in / Account. Renders nothing until accounts are configured. */}
          <AccountControl />
          {/*
            Get the app. An outline pill, not a filled button: "Ask GSB AI" in the
            header is the page's primary CTA and this must not compete with it.
            Both visible strings are substrings of the accessible name, so voice
            control still matches what is on screen (WCAG 2.5.3 Label in Name) while
            the name stays "Get the Android app" — the same name the footer, mobile
            menu and dock triggers use (WCAG 3.2.4 Consistent Identification) — and
            the platform is named wherever the width allows. Icon-only 360–639px
            (with a matching tooltip); gone below 360px, where the menu, the footer
            and the dock still offer it.
          */}
          <GetAppButton
            ariaLabel="Get the Android app"
            title="Get the Android app"
            className="hidden h-7 shrink-0 items-center gap-1.5 rounded-full border border-forest-300 bg-white px-2 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 min-[360px]:inline-flex sm:px-3"
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline min-[680px]:hidden">App</span>
            <span className="hidden min-[680px]:inline">Get the Android app</span>
          </GetAppButton>
        </div>
      </div>
    </div>
  );
}
