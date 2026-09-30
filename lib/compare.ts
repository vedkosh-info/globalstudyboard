/**
 * Compare Universities — shared vocabulary between the tool UI, the "Add to
 * compare" button on university profiles, the shell page and the account
 * export. No Supabase import, no catalogue import: safe for any client
 * component (bundle guard). The fact sheets come from lib/compare-catalogue.ts
 * (server-only) through the tool's static JSON route.
 *
 * Two kinds of content sit in one table and are kept visibly apart:
 *   - OUR verified facts about a profile (attributed rankings, location, tests,
 *     platform …) — the same rows the profile page renders, never a judgement;
 *   - the STUDENT'S own comparison: criteria they name and weight, and the
 *     score they give each university. The site computes the arithmetic on
 *     those and draws no conclusion of its own (Rule A, Rule E, §4.5).
 */

import type { RegionSlug } from '@/lib/regions';
import { csvDocument } from '@/lib/csv';
import type { CompareFacts } from '@/lib/compare-catalogue';

// ── Rows (mirror migration 0005) ────────────────────────────────────────────

export interface CompareSet {
  id: string;
  region: RegionSlug;
  label: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompareCriterion {
  id: string;
  set_id: string;
  label: string;
  /** How much this criterion matters to the student, 1–5. */
  weight: number;
  created_at: string;
  updated_at: string;
}

export interface CompareEntry {
  id: string;
  set_id: string;
  /** Set when picked from our profiles (links the facts + /colleges/<slug>). */
  college_slug: string | null;
  name: string;
  official_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/** A row EXISTS = the student scored that cell; no row = "Not scored yet". */
export interface CompareScore {
  id: string;
  entry_id: string;
  criterion_id: string;
  /** 1–5, the student's own rating. */
  score: number;
  created_at: string;
  updated_at: string;
}

// ── Limits (mirror the database CHECKs + caps) ──────────────────────────────

export const COMPARE_LIMITS = {
  label: 120,
  notes: 4000,
  criterionLabel: 40,
  entryName: 160,
  url: 500,
  note: 300,
  sets: 20,
  criteriaPerSet: 8,
  entriesPerSet: 4,
  scoreMin: 1,
  scoreMax: 5,
} as const;

export const SCALE = [1, 2, 3, 4, 5] as const;
export type Scale = (typeof SCALE)[number];
export const isScale = (n: number): n is Scale => Number.isInteger(n) && n >= 1 && n <= 5;

/**
 * The six criteria a new comparison starts with — all personal and subjective,
 * none with any admission-odds meaning (the site never suggests a "chance").
 * The student may rename, remove or add their own (up to 8).
 */
export const DEFAULT_CRITERIA: ReadonlyArray<{ label: string; weight: Scale }> = [
  { label: 'Programme fit', weight: 3 },
  { label: 'Cost & funding', weight: 3 },
  { label: 'Location & lifestyle', weight: 3 },
  { label: 'Reputation, as I see it', weight: 3 },
  { label: 'Scholarships & support', weight: 3 },
  { label: 'Career outcomes for me', weight: 3 },
];

export const SCORE_HINT: Record<Scale, string> = {
  1: 'Poor for me',
  2: 'Below what I want',
  3: 'Acceptable',
  4: 'Good for me',
  5: 'Ideal for me',
};

export const WEIGHT_HINT: Record<Scale, string> = {
  1: 'Barely matters',
  2: 'Matters a little',
  3: 'Matters',
  4: 'Matters a lot',
  5: 'Decisive',
};

// ── Scoring (the student's own arithmetic, shown in full) ───────────────────

export interface EntryResult {
  entryId: string;
  /** Criteria the student actually scored for this university. */
  scored: number;
  total: number;
  /** Σ weight × score over the scored criteria. */
  points: number;
  /** Σ weight × 5 over the scored criteria. */
  maxPoints: number;
  /** 0–100, or null when nothing is scored yet (never a false 0%). */
  percent: number | null;
  /** The arithmetic, e.g. "(3×4 + 5×2) ÷ (3×5 + 5×5) = 55%". */
  formula: string | null;
}

export function entryResult(entry: CompareEntry, criteria: CompareCriterion[], scores: CompareScore[]): EntryResult {
  const parts: string[] = [];
  const maxParts: string[] = [];
  let points = 0;
  let maxPoints = 0;
  let scored = 0;
  for (const c of criteria) {
    const s = scores.find((x) => x.entry_id === entry.id && x.criterion_id === c.id);
    if (!s) continue;
    scored += 1;
    points += c.weight * s.score;
    maxPoints += c.weight * 5;
    parts.push(`${c.weight}×${s.score}`);
    maxParts.push(`${c.weight}×5`);
  }
  const percent = scored === 0 || maxPoints === 0 ? null : Math.round((points / maxPoints) * 100);
  return {
    entryId: entry.id,
    scored,
    total: criteria.length,
    points,
    maxPoints,
    percent,
    formula: percent === null ? null : `(${parts.join(' + ')}) ÷ (${maxParts.join(' + ')}) = ${percent}%`,
  };
}

export interface TopPick {
  /** One entry id, or several when tied. Empty when fewer than two universities are scored. */
  entryIds: string[];
  percent: number;
}

/** The student's own top pick, by their own weights — only when at least two universities have a score. */
export function topPick(results: EntryResult[]): TopPick | null {
  const scored = results.filter((r) => r.percent !== null);
  if (scored.length < 2) return null;
  const best = Math.max(...scored.map((r) => r.percent as number));
  return { entryIds: scored.filter((r) => r.percent === best).map((r) => r.entryId), percent: best };
}

/** Stable: unscored universities always last; equal percentages keep add order. */
export function sortByScore(entries: CompareEntry[], results: Map<string, EntryResult>): CompareEntry[] {
  return [...entries].sort((a, b) => {
    const pa = results.get(a.id)?.percent ?? -1;
    const pb = results.get(b.id)?.percent ?? -1;
    return pb - pa;
  });
}

// ── Cleaners ────────────────────────────────────────────────────────────────

/** Global + NUL — same rule as lib/planner.ts: a non-global pattern stripped only the first control character, and the DB CHECK then refused the rest with a generic error. */
export const CONTROL_RE = /[\x00-\x1F\x7F]/g;
export const cleanLine = (raw: string, max: number): string => raw.replace(CONTROL_RE, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

/** The comparison the tool opens on when none is chosen: the one touched most recently (the profile-page button targets the same one). */
export function mostRecentSet<T extends Pick<CompareSet, 'updated_at' | 'created_at'>>(sets: T[]): T | null {
  return sets.length ? [...sets].sort((a, b) => (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at))[0] : null;
}

/** A comparison's default name: "{Region} comparison", numbered on collision. */
export function defaultSetLabel(regionName: string, existing: Pick<CompareSet, 'label'>[]): string {
  const base = `${regionName} comparison`;
  const taken = new Set(existing.map((s) => s.label));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 100; n += 1) if (!taken.has(`${base} ${n}`)) return `${base} ${n}`;
  return `${base} ${existing.length + 1}`;
}

// ── CSV (wide, like the on-screen table) ────────────────────────────────────

/** A profiled university whose fact sheet is not in the loaded catalogue — the same words in the tool, the CSV and the report. */
export const PROFILE_NOT_FOUND = 'Profile not found — check the university’s official site';

/**
 * The CSV of one comparison. `facts` must be the LOADED catalogue (the tool
 * keeps Download CSV unavailable until it is): a profiled university missing
 * from it — its profile has left the catalogue — is said so in the Rankings
 * row rather than left as a row of blanks that reads like a profile with no
 * facts (review CRIT2-5), and keeps the official site stored when it was added.
 */
export function compareCsv(set: CompareSet, entries: CompareEntry[], criteria: CompareCriterion[], scores: CompareScore[], facts: Map<string, CompareFacts>): string {
  const head = ['', ...entries.map((e) => e.name)];
  const factRow = (label: string, f: (x: CompareFacts | undefined) => string, missing = '') =>
    [label, ...entries.map((e) => (e.college_slug ? (facts.has(e.college_slug) ? f(facts.get(e.college_slug)) : missing) : 'Added by you — no verified facts'))];
  const rows: Array<Array<string | number | null>> = [
    [`Comparison: ${set.label}`, ...entries.map(() => '')],
    ...(set.notes ? [[`Notes: ${set.notes}`, ...entries.map(() => '')]] : []),
    head,
    factRow('Rankings (as published by each body)', (x) => (x?.rankings.length ? x.rankings.map((r) => `${r.body} #${r.rank}`).join('; ') : ''), PROFILE_NOT_FOUND),
    factRow('Location', (x) => x?.place ?? ''),
    factRow('Type', (x) => x?.type ?? ''),
    factRow('Admission tests', (x) => x?.admissionTests.join('; ') ?? ''),
    factRow('Application platform', (x) => x?.applicationPlatform ?? ''),
    factRow('Programme levels', (x) => x?.levels.join('; ') ?? ''),
    factRow('Language', (x) => (x ? (x.englishTaught ? 'English-taught' : 'Local language') : '')),
    factRow('Established', (x) => (x ? String(x.established) : '')),
    // A student-added university has no facts, but its own link is still theirs to keep.
    ['Official site', ...entries.map((e) => (e.college_slug ? facts.get(e.college_slug)?.url ?? e.official_url ?? '' : e.official_url ?? ''))],
    ['Your criteria (weight)', ...entries.map(() => '')],
    ...criteria.map((c) => [
      `${c.label} (weight ${c.weight})`,
      ...entries.map((e) => {
        const s = scores.find((x) => x.entry_id === e.id && x.criterion_id === c.id);
        return s ? s.score : '';
      }),
    ]),
    ['Your score (your own weights)', ...entries.map((e) => entryResult(e, criteria, scores).percent ?? 'Not scored yet')],
    ['Your note', ...entries.map((e) => e.note ?? '')],
    ['Your figures — arithmetic on your own ratings and weights, not an assessment by GlobalStudyBoard', ...entries.map(() => '')],
  ];
  return csvDocument(rows);
}
