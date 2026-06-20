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
