import { getRegionBySlug, type RegionSlug } from '@/lib/regions';

/**
 * The one ordering every tool's test picker uses, so a student sees the same
 * list wherever they choose a test (constitution §18, "region in context").
 * Suggested = the destination's key exams, then any extra slugs the caller
 * names (the Test Score Tracker passes the tests the student's own shortlist
 * for that destination names), then every test accepted everywhere and every
 * test that lists the destination; the rest follow alphabetically. Any test
 * stays choosable — a student may sit one unrelated to the destination in
 * the header. Client-safe: it imports only the region list, never a catalogue.
 */
export interface PickableExam {
  slug: string;
  shortName: string;
  region: RegionSlug | 'global';
  regions?: RegionSlug[];
}

export function groupExamsForDestination<T extends PickableExam>(
  region: RegionSlug,
  exams: readonly T[],
  alsoSuggest: readonly string[] = [],
): { suggested: T[]; others: T[] } {
  const bySlug = new Map(exams.map((e) => [e.slug, e]));
  const order: string[] = [];
  const push = (slug: string) => {
    if (bySlug.has(slug) && !order.includes(slug)) order.push(slug);
  };
  for (const s of getRegionBySlug(region)?.keyExamSlugs ?? []) push(s);
  for (const s of alsoSuggest) push(s);
  for (const e of exams) if (e.region === 'global' || e.region === region || e.regions?.includes(region)) push(e.slug);
  const suggested = order.map((s) => bySlug.get(s) as T);
  const others = exams.filter((e) => !order.includes(e.slug)).sort((a, b) => a.shortName.localeCompare(b.shortName));
  return { suggested, others };
}
