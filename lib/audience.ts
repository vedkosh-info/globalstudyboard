// ─────────────────────────────────────────────────────────────────────────────
// Audience layer — the SECOND personalization axis (alongside destination).
//
// A visitor is either a DOMESTIC student (a citizen/resident of the destination
// they're viewing) or an INTERNATIONAL student. Most content is COMMON to both;
// a focused set of blocks (admission route, fees, student-visa) differs, and is
// tagged so the page shows the right set for the chosen audience.
//
// Like the region engine (lib/regions.ts + RegionProvider), this is CLIENT-ONLY
// and SSG-safe: every block renders in the server HTML; a block that doesn't
// match the active audience is hidden with a class (crawler still reads it).
// The default is baked per-page from the page's OWN region, so the static HTML
// is correct for the majority and there is no hydration flash. See content-
// policy.md §16 (two-axis model: destination + audience-status).
// ─────────────────────────────────────────────────────────────────────────────
import type { RegionSlug } from './regions';

/** A content block's audience. `common` (the default) shows to everyone. */
export type Audience = 'common' | 'domestic' | 'international';

/** The two toggle-able audiences (common is implicit, never a toggle option). */
export type AudienceChoice = 'domestic' | 'international';

export const AUDIENCE_CHOICES: readonly AudienceChoice[] = ['domestic', 'international'];

export const AUDIENCE_LABEL: Record<AudienceChoice, string> = {
  domestic: 'Domestic',
  international: 'International',
};

/**
 * The default audience for a page, derived from the page's OWN destination:
 * India is a domestic-first home market; every other destination is served to
 * international students by default. (content-policy.md §16.)
 */
export function defaultAudienceFor(region: RegionSlug): AudienceChoice {
  return region === 'india' ? 'domestic' : 'international';
}

/** True if a block of `blockAudience` should be visible to the `active` audience. */
export function isAudienceVisible(
  blockAudience: Audience | undefined,
  active: AudienceChoice,
): boolean {
  return !blockAudience || blockAudience === 'common' || blockAudience === active;
}
