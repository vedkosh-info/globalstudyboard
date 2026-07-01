// Live, build-time KPIs computed from the actual content catalogue.
//
// These are NOT hard-coded marketing numbers — they are derived from the same
// data the site renders (guides, colleges, exams, regions), so they can never
// drift out of date as the catalogue grows. Computed once at module load, which
// keeps every page that reads them fully static (SSG-safe: no request-time work).
//
// We display counts rounded DOWN to a clean threshold with a "+" (e.g. 1,708 →
// "1,700+"). Rounding down keeps the claim truthful at all times (we always have
// at least that many) and avoids false precision, per the Content Constitution
// Rule A. Destinations are shown exactly (a small, meaningful number).

import { GUIDES } from './guides';
import { COLLEGES } from './colleges';
import { ENTRANCE_EXAMS } from './admission-guides';
import { REGIONS } from './regions';

/** Round down to a "nice" threshold so the "+" claim is always true. */
function floorTo(n: number): number {
  if (n >= 1000) return Math.floor(n / 100) * 100;
  if (n >= 100) return Math.floor(n / 50) * 50;
  if (n >= 20) return Math.floor(n / 10) * 10;
  return n;
}

const guideCount = GUIDES.length;
const collegeCount = COLLEGES.length;
const examCount = ENTRANCE_EXAMS.length;
const regionCount = REGIONS.length;

export interface SiteStat {
  /** The headline value, e.g. "1,700+" or "8". */
  value: string;
  /** Short label under the value, e.g. "in-depth guides". */
  label: string;
  /** One-line context shown on hover / for screen readers. */
  detail: string;
}

export const SITE_STATS: SiteStat[] = [
  {
    value: `${regionCount}`,
    label: 'study destinations',
    detail: 'Countries and regions covered side by side, from India to the USA, UK, Europe and the Gulf.',
  },
  {
    value: `${floorTo(guideCount).toLocaleString('en-US')}+`,
    label: 'in-depth guides',
    detail: 'Step-by-step guides on admissions, exams, courses, visas, scholarships and student life.',
  },
  {
    value: `${floorTo(collegeCount)}+`,
    label: 'universities profiled',
    detail: 'University profiles with official programmes, attributed rankings and admissions requirements.',
  },
  {
    value: `${floorTo(examCount)}+`,
    label: 'entrance & standardized exams',
    detail: 'Exam breakdowns — pattern, eligibility and fees — each linked to the official conducting body.',
  },
];

/** Exact underlying totals, for any surface that wants precise numbers. */
export const SITE_STAT_TOTALS = {
  guides: guideCount,
  colleges: collegeCount,
  exams: examCount,
  regions: regionCount,
} as const;
