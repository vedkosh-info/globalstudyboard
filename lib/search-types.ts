import type { ContentUnit } from './cmi';
import type { RegionSlug } from './regions';

/** The selected destination only; the full catalogue never becomes a page prop. */
export type SearchEntry = Pick<ContentUnit, 'type' | 'slug' | 'title' | 'subtitle' | 'url' | 'keywords' | 'sections'>;

export interface SearchCatalogue {
  region: RegionSlug;
  items: SearchEntry[];
  places?: SearchEntry[];
}

/** A failed or malformed response must produce the retry card, not a render error. */
export function isSearchCatalogue(value: unknown, region: RegionSlug): value is SearchCatalogue {
  if (!value || typeof value !== 'object' || !('region' in value) || value.region !== region || !('items' in value) || !Array.isArray(value.items)) return false;
  const validEntry = (item: unknown, place: boolean) => {
    if (!item || typeof item !== 'object') return false;
    const entry = item as Record<string, unknown>;
    const types = place ? ['place'] : ['college', 'exam', 'guide', 'region'];
    if (!types.includes(String(entry.type))) return false;
    if (!['slug', 'title', 'subtitle', 'url', 'keywords'].every((key) => typeof entry[key] === 'string')) return false;
    const path = place
      ? /^\/regions\/[a-z0-9-]+\/universities(?:\/[a-z0-9-]+){1,3}$/
      : /^\/(colleges|exams|guides|regions)\/[a-z0-9-]+$/;
    if (typeof entry.url !== 'string' || !path.test(entry.url)) return false;
    return entry.sections === undefined || (Array.isArray(entry.sections) && entry.sections.every((section: unknown) => {
      if (!section || typeof section !== 'object') return false;
      return 'h' in section && typeof section.h === 'string' && 'a' in section && typeof section.a === 'string';
    }));
  };
  return value.items.every((item) => validEntry(item, false)) && (
    !('places' in value) || (Array.isArray(value.places) && value.places.every((item) => validEntry(item, true)))
  );
}
