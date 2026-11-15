import { COLLEGES, COLLEGE_COUNTRY_INFO } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { PROGRAMMES } from '@/lib/application-check-catalogue';
import type { CollegeOption, ExamOption, PlannerCheckLink } from '@/lib/planner';
import { REGION_COUNTRY_NAME } from '@/lib/study-country';

/**
 * The compact university / exam pickers for the Application Planner —
 * server-only (it imports the catalogue). Served by
 * app/tools/application-planner/catalogue/route.ts and fetched by the tool
 * chunk on mount, so the ~20 KB of picker data leaves the page payload that
 * every crawler and signed-out visitor receives (independent review, 22 Sep 2026).
 */
export function plannerCatalogue(): { colleges: CollegeOption[]; exams: ExamOption[]; checks: PlannerCheckLink[] } {
  const colleges: CollegeOption[] = COLLEGES.map((c) => ({
    slug: c.slug,
    name: c.nameEn,
    region: c.region,
    country: REGION_COUNTRY_NAME[c.country],
    place: `${c.city}, ${COLLEGE_COUNTRY_INFO[c.country].label}`,
    url: c.websiteUrl ?? null,
    courses: c.courses,
  })).sort((a, b) => a.name.localeCompare(b.name));
  const exams: ExamOption[] = ENTRANCE_EXAMS.map((e) => ({
    slug: e.slug,
    shortName: e.shortName,
    fullName: e.fullName,
    region: e.region,
    ...(e.regions?.length ? { regions: e.regions } : {}),
    url: e.websiteUrl ?? null,
  })).sort((a, b) => a.shortName.localeCompare(b.shortName));
  const checks: PlannerCheckLink[] = PROGRAMMES.map((programme) => ({
    region: programme.region,
    collegeSlug: programme.collegeSlug,
    id: programme.id,
    name: programme.name,
  }));
  return { colleges, exams, checks };
}
