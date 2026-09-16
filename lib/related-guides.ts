import { GUIDES, type Guide } from '@/lib/guides';
import type { EntranceExam } from '@/lib/admission-guides';
import type { College } from '@/lib/colleges';
import { matchesRegion } from '@/lib/regions';

// ─────────────────────────────────────────────────────────────────────────────
// Relevance-ranked "related guides" for exam and college pages.
//
// Both templates used to take the FIRST THREE guides in catalogue order that
// referenced the unit — and GUIDES is a spread with the newest batch prepended,
// so /exams/gre (178 referencing guides) linked a Yuan Ze University admission
// guide, a Taiwan semiconductors guide and a naval-architecture guide, while
// Harvard's page linked 3 of 87 guides and not "How to get into Harvard". This
// module scores by how specifically a guide is ABOUT the unit. Server-only
// (imports the full guide catalogue).
// ─────────────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'the', 'of', 'and', 'at', 'in', 'for', 'university', 'college', 'institute', 'school',
  'technology', 'national', 'state', 'de', 'la', 'del', 'di', 'universität', 'universidad',
  // Generic words in Indian institution names ("Indian Institute of Management
  // Ahmedabad" → "ahmedabad"), otherwise every "…-in-indian-admissions" guide matches.
  'indian', 'india', 'management', 'science', 'sciences', 'medical', 'engineering', 'all',
]);

/** Lower-cased, slug-safe tokens of a name, stopwords removed ("Harvard University" → ["harvard"]). */
function nameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[()&,.'’-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function scoreText(g: Guide): string {
  return `${g.slug} ${g.titleEn}`.toLowerCase();
}

export interface RankedGuide {
  guide: Guide;
  score: number;
  /** True when the guide is squarely about the unit (name/slug match), not just a mention. */
  dedicated: boolean;
}

/**
 * Guides ranked for an exam page. Dedicated prep/eligibility guides for the exam
 * itself come first, then same-region guides, then the most specific mentions.
 */
export function rankGuidesForExam(exam: EntranceExam): RankedGuide[] {
  const slug = exam.slug.toLowerCase();
  const short = exam.shortName.toLowerCase();
  const shortSlug = short.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const candidates = GUIDES.filter(
    (g) =>
      g.relatedExamSlugs.includes(exam.slug) ||
      g.slug.includes(slug) ||
      (shortSlug.length >= 3 && g.slug.split('-').includes(shortSlug)),
  );
  const ranked = candidates.map((g) => {
    const text = scoreText(g);
    let score = 0;
    let dedicated = false;
    if (
      g.slug === `${slug}-exam-guide` ||
      g.slug === `how-to-prepare-for-${slug}` ||
      g.slug.startsWith(`${slug}-eligibility`) ||
      g.slug.startsWith(`${slug}-exam-`) ||
      g.slug.startsWith(`${slug}-syllabus`) ||
      g.slug.startsWith(`${slug}-guide`)
    ) {
      score += 200;
      dedicated = true;
    } else if (g.slug.startsWith(`${slug}-`) || g.slug.includes(`-${slug}-`) || g.slug.endsWith(`-${slug}`)) {
      score += 100;
      dedicated = true;
    } else if (text.includes(short)) {
      score += 40;
    }
    if (g.category === 'exam-prep') score += 20;
    else if (g.category === 'admissions') score += 5;
    if (exam.region !== 'global' && matchesRegion(exam.region, g.region, g.regions)) score += 10;
    // Specificity: a guide that references fewer exams is more about this one.
    score += Math.max(0, 6 - g.relatedExamSlugs.length);
    return { guide: g, score, dedicated };
  });
  return ranked.sort((a, b) => b.score - a.score || b.guide.readMinutes - a.guide.readMinutes);
}

/**
 * Guides ranked for a college page. "How to get into X" / "X admission guide"
 * pages come first (they are the long-form twin of the profile card), then
 * guides that reference the college, then same-region admissions guides.
 */
export function rankGuidesForCollege(college: College): RankedGuide[] {
  // Identity = the college's own slug segments minus generic words: 'aiims-delhi'
  // → ['aiims', 'delhi'], 'harvard-university' → ['harvard']. A guide is
  // "dedicated" only when EVERY identity token appears in its slug — "Delhi
  // University" must not be presented as the guide for AIIMS Delhi.
  const identity = college.slug.split('-').filter((t) => t.length > 1 && !STOPWORDS.has(t));
  const tokens = Array.from(new Set([...identity, ...nameTokens(college.nameEn)]));
  const candidates = GUIDES.filter(
    (g) =>
      g.relatedCollegeSlugs.includes(college.slug) ||
      tokens.some((t) => g.slug.split('-').includes(t)) ||
      g.slug.includes(college.slug),
  );
  const ranked = candidates.map((g) => {
    const text = scoreText(g);
    const slugParts = g.slug.split('-');
    let score = 0;
    let dedicated = false;
    const identityHits = identity.filter((t) => slugParts.includes(t)).length;
    const nameHits = tokens.filter((t) => text.includes(t)).length;
    if (g.slug.includes(college.slug) || (identity.length > 0 && identityHits === identity.length)) {
      score += 100;
      dedicated = true;
      if (g.slug.startsWith('how-to-get-into-') || g.slug.includes('-admission')) score += 50;
    } else if (nameHits > 0) {
      score += 15 * nameHits;
    }
    if (g.relatedCollegeSlugs.includes(college.slug)) score += 40;
    if (g.category === 'admissions') score += 10;
    if (matchesRegion(college.region, g.region, g.regions)) score += 10;
    score += Math.max(0, 6 - g.relatedCollegeSlugs.length);
    return { guide: g, score, dedicated };
  });
  return ranked.sort((a, b) => b.score - a.score || b.guide.readMinutes - a.guide.readMinutes);
}
