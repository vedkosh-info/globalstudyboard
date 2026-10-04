import { COLLEGES } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import type { CollegeTests, ExamPick, ScoresCatalogue } from '@/lib/test-scores';
import { REGION_COUNTRY_NAME } from '@/lib/study-country';

/**
 * The compact exam picker + each university's own test list for the Test
 * Score Tracker — server-only (it imports the catalogue). Served by
 * app/tools/test-score-tracker/catalogue/route.ts and fetched by the tool
 * chunk on mount, so none of it rides the public shell's payload.
 */
export function scoresCatalogue(): ScoresCatalogue {
  const exams: ExamPick[] = ENTRANCE_EXAMS.map((e) => ({
    slug: e.slug,
    shortName: e.shortName,
    fullName: e.fullName,
    region: e.region,
    ...(e.regions ? { regions: e.regions } : {}),
    domain: e.domain,
    totalMarks: e.totalMarks,
    websiteUrl: e.websiteUrl ?? null,
  })).sort((a, b) => a.shortName.localeCompare(b.shortName));
  const colleges: CollegeTests[] = COLLEGES.map((c) => ({
    slug: c.slug,
    name: c.nameEn,
    region: c.region,
    country: REGION_COUNTRY_NAME[c.country],
    admissionExams: c.admissionExams,
  }));
  return { exams, colleges };
}
