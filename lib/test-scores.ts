/**
 * Test Score Tracker — shared vocabulary between the tool UI, the exam-page
 * "Record a score" entrance, the report builder and the account export.
 * No Supabase import, no catalogue import (the exam and university
 * projections arrive through the tool's static JSON route): safe for any
 * client component (bundle guard).
 *
 * What the tracker is (constitution §18, panel decision 23 Sep 2026):
 *   - the student's OWN attempts, each kept as its own row — the score as
 *     received (text), optional section pairs, the test date, a private note;
 *   - the exam's OFFICIAL validity rule, an official fact from
 *     lib/test-validity.ts, printed in words or as a computed date;
 *   - a READINESS view: for each shortlisted university (the planner), the
 *     tests its profile lists, and whether a score is recorded for each.
 * What it never does: compute a "best" or a superscore, convert one test's
 * scale into another's, or say whether a score meets any requirement
 * (Rule A, Rule E, §4.5) — that judgement belongs to the university alone.
 */

import type { RegionSlug } from '@/lib/regions';
import { csvDocument } from '@/lib/csv';
import { groupExamsForDestination } from '@/lib/exam-picker';
import { cleanNotes, cleanText } from '@/lib/planner';
import { validityBrief, validityFor, validityStatus, type ValidityStatus } from '@/lib/test-validity';

// ── Rows (mirror migration 0006) ────────────────────────────────────────────

export interface TestScore {
  id: string;
  exam_slug: string;
  /** The score exactly as received ("1450", "7.5", "99.2 percentile", "A*AA"). */
  score_text: string;
  /** ISO calendar date (YYYY-MM-DD). */
  test_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestScoreSection {
  id: string;
  score_id: string;
  label: string;
  value: string;
  position: number;
  created_at: string;
}

// ── Limits (mirror the database CHECKs + caps) ──────────────────────────────

export const SCORE_LIMITS = {
  scoreText: 200,
  sectionLabel: 40,
  sectionValue: 40,
  note: 2000,
  scores: 100,
  sectionsPerScore: 6,
  earliestYear: 1990,
} as const;

export const cleanScoreText = (raw: string): string => cleanText(raw, SCORE_LIMITS.scoreText);
export const cleanSectionLabel = (raw: string): string => cleanText(raw, SCORE_LIMITS.sectionLabel);
export const cleanSectionValue = (raw: string): string => cleanText(raw, SCORE_LIMITS.sectionValue);
export const cleanScoreNote = (raw: string): string => cleanNotes(raw).slice(0, SCORE_LIMITS.note);

// ── Catalogue projections (served by the tool's static route) ──────────────

export interface ExamPick {
  slug: string;
  shortName: string;
  fullName: string;
  region: RegionSlug | 'global';
  regions?: RegionSlug[];
  domain: string;
  /** The board's own scale, as text ("1600 (Reading & Writing 800 + Math 800)"). */
  totalMarks: string;
  websiteUrl: string | null;
}

export interface CollegeTests {
  slug: string;
  name: string;
  region: RegionSlug;
  /** Destination country name, or null when the profile's country is not on that destination's list. */
  country: string | null;
  /** The profile's own free-text list of tests it names. */
  admissionExams: string[];
}

export interface ScoresCatalogue {
  exams: ExamPick[];
  colleges: CollegeTests[];
}

// ── Region in context: which exams the picker offers first ──────────────────

export interface PickerGroups {
  suggested: ExamPick[];
  others: ExamPick[];
}

/**
 * Suggested = the destination's key exams, then the tests the student's own
 * shortlist for that destination names, then every test accepted everywhere
 * and every test that lists the destination; the rest follow alphabetically.
 * Any exam can always be recorded — a student may hold a score for a test
 * unrelated to the destination in the header. The ordering is the shared one
 * in lib/exam-picker.ts, so the Application Planner's test picker agrees.
 */
export function pickerGroups(region: RegionSlug, exams: ExamPick[], shortlistSlugs: string[]): PickerGroups {
  return groupExamsForDestination(region, exams, shortlistSlugs);
}

// ── Matching a profile's free-text test list to exam slugs ──────────────────

/**
 * Deterministic keyword → slug patterns for the strings university profiles
 * use ("SAT / ACT / A-Levels / IB Diploma (undergraduate entry qualifications)").
 * Order matters where one name contains another (JEE Advanced before JEE Main,
 * NEET-PG before NEET, CUET-PG before CUET). A string that matches nothing is
 * shown as "from our profile — nothing the tracker records for this line", with
 * a pointer to the official requirements page — never dropped.
 */
export const EXAM_PATTERNS: ReadonlyArray<{ slug: string; re: RegExp }> = [
  { slug: 'jee-advanced', re: /\bJEE[\s-]*\(?Advanced\)?/i },
  { slug: 'jee-main', re: /\bJEE\b(?![\s-]*\(?Advanced)/i },
  { slug: 'neet-pg', re: /\bNEET[\s-]*PG\b/i },
  { slug: 'neet-ug', re: /\bNEET\b(?![\s-]*(?:PG|MDS|SS)\b)/i },
  { slug: 'cuet-pg', re: /\bCUET[\s-]*PG\b/i },
  { slug: 'cuet-ug', re: /\bCUET\b(?![\s-]*PG)/i },
  { slug: 'ugc-net', re: /\bUGC[\s-]*NET\b/i },
  { slug: 'csir-net', re: /\bCSIR[\s-]*NET\b/i },
  { slug: 'ap-eapcet', re: /\bAP[\s-]*EAPCET\b/i },
  { slug: 'ts-eamcet', re: /\b(TS[\s-]*EAMCET|TG[\s-]*EAPCET)\b/i },
  // Case-sensitive bare "AP" ("SAT / ACT / AP / IB", "SAT with AP"), but never AP EAPCET (Andhra Pradesh).
  { slug: 'ap-exams', re: /\bAdvanced Placement\b|\bAP\b(?![\s-]*EAPCET)/ },
  { slug: 'sat', re: /\bSAT\b/ },
  { slug: 'act', re: /\bACT\b/ },
  { slug: 'gre', re: /\bGRE\b/ },
  { slug: 'gmat', re: /\bGMAT\b/ },
  { slug: 'mcat', re: /\bMCAT\b/ },
  { slug: 'lsat', re: /\bLSAT\b/ },
  { slug: 'a-levels', re: /\b(A[\s-]?Levels?|GCE A)\b/i },
  { slug: 'international-baccalaureate', re: /\b(IB\b|International Baccalaureate)/ },
  { slug: 'ucat', re: /\bUCAT\b/ },
  { slug: 'testas', re: /\bTestAS\b/i },
  { slug: 'testdaf', re: /\bTestDaF\b/i },
  { slug: 'ielts', re: /\bIELTS\b/ },
  { slug: 'toefl', re: /\bTOEFL\b/ },
  { slug: 'duolingo-english-test', re: /\bDuolingo\b/i },
  { slug: 'pte-academic', re: /\bPTE\b/ },
  { slug: 'cat', re: /\bCAT\b/ },
  { slug: 'clat', re: /\bCLAT\b/ },
  { slug: 'ailet', re: /\bAILET\b/ },
  { slug: 'gate', re: /\bGATE\b/ },
  { slug: 'mht-cet', re: /\bMHT[\s-]*CET\b/i },
  { slug: 'kcet', re: /\bKCET\b/ },
  { slug: 'wbjee', re: /\bWBJEE\b/ },
  { slug: 'keam', re: /\bKEAM\b/ },
  { slug: 'gujcet', re: /\bGUJCET\b/ },
  { slug: 'bitsat', re: /\bBITSAT\b/ },
  { slug: 'viteee', re: /\bVITEEE\b/ },
  { slug: 'comedk-uget', re: /\bCOMEDK\b/i },
  { slug: 'nata', re: /\bNATA\b/ },
  { slug: 'iit-jam', re: /\b(IIT[\s-]*)?JAM\b/ },
  { slug: 'nchm-jee', re: /\bNCHM/i },
  { slug: 'ipmat', re: /\bIPMAT\b/ },
  { slug: 'ctet', re: /\bCTET\b/ },
];

/**
 * Compound names that CONTAIN another exam's name. Matched on their own, then
 * blanked out before the other patterns run, so "NCHM JEE" is not also read as
 * JEE (Main). Done this way rather than with a regex lookbehind, which older
 * Safari (< 16.4) cannot parse — a syntax error there would break the whole
 * tool chunk.
 */
const COMPOUNDS: ReadonlyArray<{ slug: string; re: RegExp }> = [{ slug: 'nchm-jee', re: /\bNCHM[\s-]*JEE\b/gi }];

/** The exam slugs one profile line names, in pattern order, each once. */
export function matchExamMentions(text: string, known: ReadonlySet<string>): string[] {
  const out: string[] = [];
  let rest = text;
  for (const { slug, re } of COMPOUNDS) {
    if (known.has(slug) && new RegExp(re.source, 'i').test(rest) && !out.includes(slug)) out.push(slug);
    rest = rest.replace(re, ' ');
  }
  for (const { slug, re } of EXAM_PATTERNS) {
    if (known.has(slug) && re.test(rest) && !out.includes(slug)) out.push(slug);
  }
  return out;
}

// ── Grouping, the "most recent" attempt, the readiness view ─────────────────

/** Newest test date first; equal dates by creation (newest first). */
export function sortAttempts(scores: TestScore[]): TestScore[] {
  return [...scores].sort((a, b) => b.test_date.localeCompare(a.test_date) || b.created_at.localeCompare(a.created_at));
}

/** Attempts grouped by exam, each group newest first; groups in `examOrder` order, unknown exams last. */
export function groupByExam(scores: TestScore[], examOrder: string[]): Array<{ slug: string; attempts: TestScore[] }> {
  const groups = new Map<string, TestScore[]>();
  for (const s of sortAttempts(scores)) {
    const list = groups.get(s.exam_slug) ?? [];
    list.push(s);
    groups.set(s.exam_slug, list);
  }
  const rank = (slug: string) => {
    const i = examOrder.indexOf(slug);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...groups.entries()].map(([slug, attempts]) => ({ slug, attempts })).sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug));
}

/**
 * The most recently sat attempt for an exam — a UI affordance ("most recent"),
 * never "your official score". A row dated after `today` (the database's
 * one-day time-zone slack, a wrong device clock, or a score recorded in a time
 * zone ahead of the viewer's — see FUTURE_TEXT in lib/test-validity.ts) is never
 * treated as the most recent sitting, so it never displaces an attempt already
 * sat; it is used only when nothing else exists.
 */
export function latestFor(scores: TestScore[], slug: string, today: string): TestScore | null {
  const sorted = sortAttempts(scores.filter((s) => s.exam_slug === slug));
  return sorted.find((s) => s.test_date <= today) ?? sorted[0] ?? null;
}

/**
 * The readiness view's lead sentence — one wording for the screen, the report
 * and the PDF. "Our profile" because the lines are our own summary of each
 * university (some are not tests at all); presence only, never a verdict.
 */
export const readinessIntro = (prose: string): string =>
  `For each university in your Application Planner for ${prose}: the admission requirements our profile of it lists, and — for each test the tracker records — whether you have a score on record.`;

/**
 * §16.7: shown under the readiness view (app, report and PDF) when the visitor
 * is a domestic student — one constant, so the printed copy can never drift
 * from the screen.
 */
export const DOMESTIC_READINESS_CAVEAT =
  'You are viewing as a domestic student. Tests a profile lists for international applicants — usually English-language tests — may not apply to you; confirm on each university’s own page.';

export interface ShortlistApplication {
  id: string;
  name: string;
  region: RegionSlug;
  college_slug: string | null;
}

export interface ReadinessLine {
  /** The profile's own wording. */
  text: string;
  /**
   * Tests we track that the line names, with the newest recorded attempt (or
   * none). `validity` is the SHORT line (validityBrief — the full rule sits
   * with the student's scores); `future` = the attempt is dated after today
   * (only via the database's one-day slack, a wrong clock or a time-zone
   * change), so it is shown as "dated …", never as a result in hand.
   */
  exams: Array<{ slug: string; latest: TestScore | null; validity: ValidityStatus | null; future: boolean }>;
}

export interface ReadinessRow {
  applicationId: string;
  name: string;
  /** null = a university the student added by name (no profile, so no test list). */
  lines: ReadinessLine[] | null;
}

/**
 * For each shortlisted university: every test its profile lists, and whether
 * a score is recorded for it. Presence and a short validity line only — never
 * a verdict.
 */
export function readiness(apps: ShortlistApplication[], colleges: Map<string, CollegeTests>, scores: TestScore[], exams: Map<string, ExamPick>, today: string): ReadinessRow[] {
  const known = new Set(exams.keys());
  return apps.map((a) => {
    const college = a.college_slug ? colleges.get(a.college_slug) : undefined;
    if (!college) return { applicationId: a.id, name: a.name, lines: null };
    const lines: ReadinessLine[] = college.admissionExams.map((text) => ({
      text,
      exams: matchExamMentions(text, known).map((slug) => {
        const latest = latestFor(scores, slug, today);
        return {
          slug,
          latest,
          validity: latest ? validityBrief(validityFor(slug), latest.test_date, today, exams.get(slug)?.shortName ?? slug) : null,
          future: latest !== null && latest.test_date > today,
        };
      }),
    }));
    return { applicationId: a.id, name: a.name, lines };
  });
}

/** Exam slugs the student's shortlist for a destination names (for the picker's "suggested" group). */
export function shortlistExamSlugs(apps: ShortlistApplication[], colleges: Map<string, CollegeTests>, known: ReadonlySet<string>): string[] {
  const out: string[] = [];
  for (const a of apps) {
    const college = a.college_slug ? colleges.get(a.college_slug) : undefined;
    if (!college) continue;
    for (const text of college.admissionExams) for (const slug of matchExamMentions(text, known)) if (!out.includes(slug)) out.push(slug);
  }
  return out;
}

// ── CSV ─────────────────────────────────────────────────────────────────────

/**
 * One row per attempt. The Validity cell is the same validityStatus() sentence
 * the tool and the report print for that attempt — so a rule written for one
 * edition ("a CAT 2026 score…") says whose rule it is under an attempt from
 * another year, and a recommended age (IELTS) is never called expired.
 */
export function scoresCsv(scores: TestScore[], sections: TestScoreSection[], exams: Map<string, ExamPick>, today: string): string {
  const header = ['Exam', 'Test date', 'Score', 'Sections', 'Validity', 'Note'];
  const rows: Array<Array<string | number | null>> = sortAttempts(scores).map((s) => {
    const exam = exams.get(s.exam_slug);
    const secs = sections
      .filter((x) => x.score_id === s.id)
      .sort((a, b) => a.position - b.position)
      .map((x) => `${x.label} ${x.value}`)
      .join('; ');
    return [exam?.shortName ?? s.exam_slug, s.test_date, s.score_text, secs, validityStatus(validityFor(s.exam_slug), s.test_date, today, exam?.shortName ?? s.exam_slug).text, s.note];
  });
  rows.push([`Your own records — scores and dates as you entered them; GlobalStudyBoard verifies none of them and never says whether a score meets a requirement. Generated ${today}; any "days left" counts from that date.`, '', '', '', '', '']);
  return csvDocument([header, ...rows]);
}
