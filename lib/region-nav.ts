// ─────────────────────────────────────────────────────────────────────────────
// Region navigation taxonomy — the single source of truth for the region-scoped
// section pages at /regions/[region]/[category]. Drives the region nav, the hub
// category cards, breadcrumbs, the [category] route's generateStaticParams, and
// the sitemap. See .claude/rules/content-policy.md §16.
//
// Every region exposes the same four categories; all are non-empty for every
// region we cover (verified). Labels adapt for India (domestic).
// ─────────────────────────────────────────────────────────────────────────────
import type { RegionSlug } from './regions';

export type RegionCategory = 'universities' | 'exams' | 'guides' | 'scholarships';

/** Display + nav order for the region category sections. */
export const REGION_CATEGORIES: readonly RegionCategory[] = [
  'universities',
  'exams',
  'guides',
  'scholarships',
];

export function isRegionCategory(value: string): value is RegionCategory {
  return (REGION_CATEGORIES as readonly string[]).includes(value);
}

/** Region-aware section label (India is domestic → "Colleges" / "Entrance Exams"). */
export function categoryLabel(category: RegionCategory, region: RegionSlug): string {
  switch (category) {
    case 'universities':
      return region === 'india' ? 'Colleges' : 'Universities';
    case 'exams':
      return region === 'india' ? 'Entrance Exams' : 'Exams';
    case 'guides':
      return 'Guides';
    case 'scholarships':
      return 'Scholarships';
  }
}

/** Plural noun for body copy. */
export function categoryNoun(category: RegionCategory, region: RegionSlug): string {
  switch (category) {
    case 'universities':
      return region === 'india' ? 'colleges' : 'universities';
    case 'exams':
      return 'exams';
    case 'guides':
      return 'guides';
    case 'scholarships':
      return 'scholarships';
  }
}

export function regionCategoryPath(region: RegionSlug, category: RegionCategory): string {
  return `/regions/${region}/${category}`;
}

/** The destination-neutral (all destinations) listing for a category. */
export function globalCategoryPath(category: RegionCategory): string {
  switch (category) {
    case 'universities':
      return '/colleges';
    case 'exams':
      return '/exams';
    case 'guides':
      return '/guides';
    case 'scholarships':
      return '/scholarships';
  }
}

/**
 * Where a chrome link (header nav, mobile menu) should point while it is being
 * SERVER-RENDERED. The remembered destination is only known on the client, so
 * the static HTML used to bake India's section pages into the nav of every one
 * of ~3,480 pages — Harvard's included — and re-point them after hydration. Now
 * the nav is destination-neutral in the HTML unless the page's own destination
 * is already known (a /regions/{slug}/… URL), and re-tunes once the client has
 * read the preference. `chromeCategoryLabel()` keeps the anchor text consistent
 * with the href ("Universities" while it points at /colleges; India's "Colleges"
 * only once the href is India's section page).
 */
export function chromeCategoryPath(
  category: RegionCategory,
  region: RegionSlug,
  tunedIsKnown: boolean,
): string {
  return tunedIsKnown ? regionCategoryPath(region, category) : globalCategoryPath(category);
}

/** Anchor text that matches `chromeCategoryPath()` — neutral until the region is known. */
export function chromeCategoryLabel(
  category: RegionCategory,
  region: RegionSlug,
  tunedIsKnown: boolean,
): string {
  return tunedIsKnown ? categoryLabel(category, region) : categoryLabel(category, 'usa');
}
