// Server-only projection. The browser requests just its destination's static JSON.
import { CONTENT_INDEX } from './cmi';
import { GUIDES } from './guides';
import { ENTRANCE_EXAMS } from './admission-guides';
import { resolveDisplayRegions, type RegionSlug } from './regions';
import type { SearchCatalogue } from './search-types';

const guideRegions = new Map(GUIDES.map((guide) => [guide.slug, resolveDisplayRegions(guide.region, guide.regions)]));
const examRegions = new Map(ENTRANCE_EXAMS.map((exam) => [exam.slug, resolveDisplayRegions(exam.region, exam.regions)]));

export function searchCatalogue(region: RegionSlug): SearchCatalogue {
  const items = CONTENT_INDEX.filter((unit) => {
    if (unit.type === 'guide') return guideRegions.get(unit.slug)?.includes(region) ?? false;
    if (unit.type === 'exam') return examRegions.get(unit.slug)?.includes(region) ?? false;
    return unit.region === null || resolveDisplayRegions(unit.region).includes(region);
  }).map(({ type, slug, title, subtitle, url, keywords, sections }) => ({
    type, slug, title, subtitle, url, keywords,
    ...(sections?.length ? { sections } : {}),
  }));
  return { region, items };
}
