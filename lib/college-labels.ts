/**
 * Human labels for college enums and the attributed-ranking rows — shared by
 * the university profile page and the Compare Universities tool so both render
 * a type, a programme level and a ranking identically (same body name, same
 * official link). Pure data + one helper; no catalogue import, so it is safe
 * for server pages and for the tool's compact projection alike.
 */

import type { College, CollegeType, ProgramLevel } from '@/lib/colleges';

export const TYPE_LABELS: Record<CollegeType, string> = {
  'research-university': 'Research university',
  'liberal-arts': 'Liberal arts college',
  'institute-of-technology': 'Institute of technology',
  'business-school': 'Business school',
  'medical-school': 'Medical school',
  'law-school': 'Law school',
  'public-university': 'Public university',
  'private-university': 'Private university',
  iit: 'Indian Institute of Technology (IIT)',
  nit: 'National Institute of Technology (NIT)',
  iim: 'Indian Institute of Management (IIM)',
  aiims: 'All India Institute of Medical Sciences (AIIMS)',
  nlu: 'National Law University (NLU)',
  iisc: 'Indian Institute of Science (IISc)',
};

export const LEVEL_LABELS: Record<ProgramLevel, string> = {
  bachelors: "Bachelor's",
  masters: "Master's",
  phd: 'PhD',
  professional: 'Professional',
};

export interface AttributedRanking {
  /** The issuing body, named exactly as on the profile page. */
  body: string;
  rank: number;
  /** The body's own rankings page — where to confirm the current-year position. */
  url: string;
}

/**
 * A college's rankings, each attributed to the body that published it
 * (constitution §3 tier 2: a ranking may be shown only as that body's own
 * figure, never as a site-authored fact) and linked to the body's own page.
 */
export function collegeRankings(college: Pick<College, 'ranking'>): AttributedRanking[] {
  const out: AttributedRanking[] = [];
  if (college.ranking?.qs) out.push({ body: 'QS World University Rankings', rank: college.ranking.qs, url: 'https://www.topuniversities.com/world-university-rankings' });
  if (college.ranking?.the) out.push({ body: 'Times Higher Education (THE)', rank: college.ranking.the, url: 'https://www.timeshighereducation.com/world-university-rankings' });
  if (college.ranking?.nirf) out.push({ body: 'NIRF (India)', rank: college.ranking.nirf, url: 'https://www.nirfindia.org/' });
  return out;
}

/** The verify nudge that accompanies every ranking on the site (§5). */
export const RANKING_NUDGE =
  'Rankings are published annually by their respective organisations and change every year. Confirm the current-year position on the official ranking website before relying on it.';
