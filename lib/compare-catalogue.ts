import { COLLEGES, COLLEGE_COUNTRY_INFO, type College } from '@/lib/colleges';
import { SPECIALIZATION_LABELS } from '@/lib/college-taxonomy';
import { LEVEL_LABELS, categoryLabel, collegeRankings, type AttributedRanking } from '@/lib/college-labels';
import type { RegionSlug } from '@/lib/regions';
import { REGION_COUNTRY_NAME } from '@/lib/study-country';

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
  /** Destination country name, or null when the profile's country is not on that destination's list. */
  country: string | null;
  /** "City, State, Country" / "City, Country". */
  place: string;
  established: number | null;
  establishmentLabel?: College['establishmentLabel'];
  type: string;
  rankings: AttributedRanking[];
  admissionTests: string[];
  applicationPlatform: string | null;
  levels: string[];
  /** Ready-worded instruction line (`instructionNote.text`, else "English-taught" / "Local language"). */
  language: string | null;
  /** Specialization labels derived from `organisation` (`[]` on legacy records). */
  specializations: string[];
  url: string | null;
  courses: string[];
}

export function compareCatalogue(): CompareFacts[] {
  return COLLEGES.map((c) => ({
    slug: c.slug,
    name: c.nameEn,
    region: c.region,
    country: REGION_COUNTRY_NAME[c.country],
    place: [c.city, c.state, COLLEGE_COUNTRY_INFO[c.country].label].filter(Boolean).join(', '),
    established: c.established ?? null,
    establishmentLabel: c.establishmentLabel,
    type: categoryLabel(c),
    rankings: collegeRankings(c),
    admissionTests: c.admissionExams,
    applicationPlatform: c.applicationPlatform ?? null,
    levels: c.programLevels.map((l) => LEVEL_LABELS[l] ?? l),
    language: c.instructionNote?.text ?? (
      c.englishTaught === undefined ? null : c.englishTaught ? 'English-taught' : 'Local language'
    ),
    specializations: (c.specializations ?? []).map((s) => SPECIALIZATION_LABELS[s]),
    url: c.websiteUrl ?? null,
    courses: c.courses,
  })).sort((a, b) => a.name.localeCompare(b.name));
}
