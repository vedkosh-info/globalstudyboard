import type { ContentUnit } from './cmi';
import type { RegionSlug } from './regions';

/** The selected destination only; the full catalogue never becomes a page prop. */
export type SearchEntry = Pick<ContentUnit, 'type' | 'slug' | 'title' | 'subtitle' | 'url' | 'keywords' | 'sections'>;

export interface SearchCatalogue {
  region: RegionSlug;
  items: SearchEntry[];
}

/** A failed or malformed response must produce the retry card, not a render error. */
export function isSearchCatalogue(value: unknown, region: RegionSlug): value is SearchCatalogue {
  if (!value || typeof value !== 'object' || !('region' in value) || value.region !== region || !('items' in value) || !Array.isArray(value.items)) return false;
  return value.items.every((item: unknown) => {
    if (!item || typeof item !== 'object') return false;
    const entry = item as Record<string, unknown>;
    if (!['college', 'exam', 'guide', 'region'].includes(String(entry.type))) return false;
    if (!['slug', 'title', 'subtitle', 'url', 'keywords'].every((key) => typeof entry[key] === 'string')) return false;
    if (typeof entry.url !== 'string' || !/^\/(colleges|exams|guides|regions)\/[a-z0-9-]+$/.test(entry.url)) return false;
    return entry.sections === undefined || (Array.isArray(entry.sections) && entry.sections.every((section: unknown) => {
      if (!section || typeof section !== 'object') return false;
      return 'h' in section && typeof section.h === 'string' && 'a' in section && typeof section.a === 'string';
    }));
  });
}
