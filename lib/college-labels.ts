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
function rankingBody(name: string, year?: number, tied?: boolean): string {
  const edition = year ? ` ${year}` : '';
  const joint = tied ? ' (joint)' : '';
  return `${name}${edition}${joint}`;
}

export function collegeRankings(college: Pick<College, 'ranking'>): AttributedRanking[] {
  const ranking = college.ranking;
  const out: AttributedRanking[] = [];
  if (ranking?.qs) {
    out.push({
      body: rankingBody('QS World University Rankings', ranking.qsYear, ranking.qsTied),
      rank: ranking.qs,
      url: 'https://www.topuniversities.com/world-university-rankings',
    });
  }
  if (ranking?.the) {
    out.push({
      body: rankingBody('Times Higher Education (THE)', ranking.theYear, ranking.theTied),
      rank: ranking.the,
      url: 'https://www.timeshighereducation.com/world-university-rankings',
    });
  }
  if (ranking?.nirf) out.push({ body: 'NIRF (India)', rank: ranking.nirf, url: 'https://www.nirfindia.org/' });
  return out;
}

/**
 * The short QS label on a destination card. The edition year and “joint”
 * appear only when that edition was read. A card without them stays “QS #n”.
 */
export function qsChip(ranking: College['ranking']): string | null {
  if (!ranking?.qs) return null;
  const year = ranking.qsYear ? ` ${ranking.qsYear}` : '';
  const joint = ranking.qsTied ? ' joint' : '';
  return `QS${year} #${ranking.qs}${joint}`;
}

/** The verify nudge that accompanies every ranking on the site (§5). */
export const RANKING_NUDGE =
  'Rankings are published annually by their respective organisations and change every year. Confirm the current-year position on the official ranking website before relying on it.';
