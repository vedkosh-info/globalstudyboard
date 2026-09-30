import { COLLEGES, COLLEGE_COUNTRY_INFO } from '@/lib/colleges';
import { TYPE_LABELS, LEVEL_LABELS, collegeRankings, type AttributedRanking } from '@/lib/college-labels';
import type { RegionSlug } from '@/lib/regions';

/**
 * The Compare Universities tool's fact sheet per profile — server-only (it
 * imports the catalogue). Served by app/tools/compare-universities/catalogue/
 * route.ts as static JSON and fetched by the tool chunk on mount, so the
 * client never imports lib/colleges (bundle guard) and the public shell's
 * payload carries none of it.
 *
 * Every field is a fact already rendered on the profile page, worded the same
 * way (shared labels + attributed rankings); nothing here is a judgement.
 */
export interface CompareFacts {
  slug: string;
  name: string;
  region: RegionSlug;
  /** "City, State, Country" / "City, Country". */
  place: string;
  established: number;
  type: string;
  rankings: AttributedRanking[];
  admissionTests: string[];
  applicationPlatform: string | null;
  levels: string[];
  englishTaught: boolean;
  url: string | null;
  courses: string[];
}

export function compareCatalogue(): CompareFacts[] {
  return COLLEGES.map((c) => ({
    slug: c.slug,
    name: c.nameEn,
    region: c.region,
    place: [c.city, c.state, COLLEGE_COUNTRY_INFO[c.country].label].filter(Boolean).join(', '),
    established: c.established,
    type: TYPE_LABELS[c.type] ?? c.type,
    rankings: collegeRankings(c),
    admissionTests: c.admissionExams,
    applicationPlatform: c.applicationPlatform ?? null,
    levels: c.programLevels.map((l) => LEVEL_LABELS[l] ?? l),
    englishTaught: c.englishTaught,
    url: c.websiteUrl ?? null,
    courses: c.courses,
  })).sort((a, b) => a.name.localeCompare(b.name));
}
