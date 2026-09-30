import { GUIDES, type Guide } from '@/lib/guides';
import type { EntranceExam } from '@/lib/admission-guides';
import type { College } from '@/lib/colleges';
import { REGIONS, matchesRegion } from '@/lib/regions';

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

/**
 * Lower-cased words of a string, space-padded, so a `includes(' x ')` test is a
 * WHOLE-WORD test. Plain substring matching put eight unrelated guides on
 * /exams/ucat — "ucat" is inside "education" — and linked an Air Force exam from
 * CAT (afcat), "activities" from ACT and Gates Cambridge from GATE.
 */
function words(s: string): string {
  const plain = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return ` ${plain.replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

/** True when `phrase` occurs in `text` as whole words, ignoring case and punctuation. */
function hasWords(text: string, phrase: string): boolean {
  const p = words(phrase);
  return p.trim().length > 0 && words(text).includes(p);
}

/**
 * Words that make a slug an explainer of the exam rather than a guide to one
 * use of it. "how-to-prepare-for-the-sat", "jee-main-exam-pattern-and-syllabus"
 * and "toefl-ibt-test-structure-and-scoring-explained" are made only of the
 * exam's own name plus these; "ielts-for-canada-requirements" and
 * "gre-guide-for-indian-students" are not.
 */
const EXPLAINER_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'how', 'what', 'is', 'your',
  'prepare', 'preparation', 'prep', 'exam', 'exams', 'test', 'tests', 'guide', 'complete',
  'full', 'explained', 'overview', 'basics', 'structure', 'pattern', 'syllabus', 'format',
  'scoring', 'sections', 'eligibility', 'criteria',
]);

/**
 * Names of every destination (and the demonyms and short forms guide titles
 * use for them). A worldwide test's page must not feature a guide written for
 * one destination, or one country's students, as the test's "full guide".
 */
const DESTINATION_PHRASES: string[] = Array.from(
  new Set([
    ...REGIONS.flatMap((r) => [r.slug, r.displayName, r.proseName.replace(/^the /, ''), ...r.countries]),
    'us', 'usa', 'uk', 'uae', 'nz', 'gcc', 'gulf', 'asia', 'asian', 'american', 'british', 'irish',
    'indian', 'canadian', 'australian', 'european', 'german', 'russian', 'saudi', 'cis',
  ]),
);

function namesDestination(text: string): boolean {
  return DESTINATION_PHRASES.some((p) => hasWords(text, p));
}

export interface RankedGuide {
  guide: Guide;
  score: number;
  /** True when the guide is squarely about the unit (name/slug match), not just a mention. */
  dedicated: boolean;
  /**
   * Exam pages only: the slug is the exam's own name plus explainer words (see
   * EXPLAINER_WORDS) — an explainer of the test itself, not of one use of it.
   */
  explainer?: boolean;
}

/**
 * Guides ranked for an exam page. Explainers of the exam come first, then guides
 * whose slug starts with it, then guides that name it mid-slug, then guides that
 * declare or mention it; same-region guides and prep guides rank higher within
 * each band. Every match is on whole words / slug tokens.
 */
/**
 * Other slug forms guides use for an exam when neither its slug nor its short
 * name appears: guides say "IELTS vs PTE", never "PTE Academic" (review, 30 Sep
 * 2026 — the two PTE comparison guides ranked 126th on /exams/pte-academic).
 * Only unambiguous forms belong here; each is matched as whole slug words.
 */
const EXAM_SLUG_ALIASES: Readonly<Record<string, readonly string[]>> = {
  'pte-academic': ['pte'],
};

export function rankGuidesForExam(exam: EntranceExam): RankedGuide[] {
  const slug = exam.slug.toLowerCase();
  const shortSlug = exam.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const aliases = EXAM_SLUG_ALIASES[exam.slug] ?? [];
  const namesAlias = (s: string) => aliases.some((a) => hasWords(s, a));
  const nameWords = new Set(words(`${exam.slug} ${exam.shortName} ${exam.fullName}`).trim().split(' '));
  const candidates = GUIDES.filter(
    (g) =>
      g.relatedExamSlugs.includes(exam.slug) ||
      hasWords(g.slug, slug) ||
      (shortSlug.length >= 3 && hasWords(g.slug, shortSlug)) ||
      namesAlias(g.slug),
  );
  const ranked = candidates.map((g) => {
    const declared = g.relatedExamSlugs.includes(exam.slug);
    const namesExam = hasWords(g.slug, slug) || hasWords(g.slug, shortSlug) || namesAlias(g.slug);
    const explainer =
      namesExam && words(g.slug).trim().split(' ').every((w) => nameWords.has(w) || EXPLAINER_WORDS.has(w));
    let score = 0;
    let dedicated = false;
    if (explainer) {
      score += 200;
      dedicated = true;
    } else if (g.slug === slug || g.slug.startsWith(`${slug}-`)) {
      // A guide that LEADS with the exam ("toefl-ibt-…") outranks one that names
      // it mid-slug ("ielts-and-toefl-for-european-universities").
      score += 150;
      dedicated = true;
    } else if (hasWords(g.slug, slug) || namesAlias(g.slug)) {
      score += 100;
      dedicated = true;
    } else {
      if (hasWords(`${g.slug} ${g.titleEn}`, exam.shortName) || hasWords(g.titleEn, slug)) score += 40;
      // A declared relationship outranks a passing mention in someone else's title.
      if (declared) score += 30;
    }
    if (g.category === 'exam-prep') score += 20;
    else if (g.category === 'admissions') score += 5;
    if (exam.region !== 'global' && matchesRegion(exam.region, g.region, g.regions)) score += 10;
    // Specificity: a guide that references fewer exams is more about this one.
    score += Math.max(0, 6 - g.relatedExamSlugs.length);
    return { guide: g, score, dedicated, explainer };
  });
  return ranked.sort((a, b) => b.score - a.score || b.guide.readMinutes - a.guide.readMinutes);
}

/**
 * The guide an exam page features as its "Full {exam} guide", or null.
 *
 * A destination's exam features its best dedicated guide for that destination —
 * never another destination's. A worldwide test (region 'global') features only
 * an explainer of the test itself whose title names no destination: "IELTS and
 * TOEFL for European Universities" and "Is the Duolingo English Test Accepted
 * for the Australia and New Zealand Student Visa?" used to be featured on the
 * TOEFL and Duolingo pages. Where no such guide exists the page features none,
 * and the destination guides stay in its "Guides that cover…" list.
 */
export function primaryGuideForExam(exam: EntranceExam, ranked: RankedGuide[] = rankGuidesForExam(exam)): Guide | null {
  const region = exam.region;
  const hit =
    region === 'global'
      ? ranked.find((r) => r.explainer && !namesDestination(r.guide.titleEn))
      : ranked.find((r) => r.dedicated && matchesRegion(region, r.guide.region, r.guide.regions));
  return hit?.guide ?? null;
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
      hasWords(g.slug, college.slug),
  );
  const ranked = candidates.map((g) => {
    // Whole words, singular or plural ("IIT" ↔ "IITs") — never a substring:
    // "tu" (TU Munich, TU Delft) is inside every "study" and "students".
    const text = words(`${g.slug} ${g.titleEn}`);
    const slugParts = g.slug.split('-');
    let score = 0;
    let dedicated = false;
    const identityHits = identity.filter((t) => slugParts.includes(t)).length;
    const nameHits = tokens.filter((t) => text.includes(words(t)) || text.includes(words(`${t}s`))).length;
    if (hasWords(g.slug, college.slug) || (identity.length > 0 && identityHits === identity.length)) {
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
