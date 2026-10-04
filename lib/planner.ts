/**
 * Application Planner — shared vocabulary between the tool UI, the college-page
 * "Add to planner" button and the account export. No Supabase import: safe for
 * any client component (bundle guard).
 *
 * Every value here is STUDENT-AUTHORED. The planner records what the student
 * chooses to track — the site asserts no deadline, fee or admission outcome
 * (constitution Rule A, §4.5). The UI pairs every date with the official-source
 * verify nudge (§5).
 */

import type { RegionSlug } from '@/lib/regions';
import { csvDocument } from '@/lib/csv';

// ── Applications ─────────────────────────────────────────────────────────────

export const APPLICATION_STATUSES = ['researching', 'preparing', 'applied', 'offer', 'accepted', 'closed'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  researching: 'Researching',
  preparing: 'Preparing',
  applied: 'Applied',
  offer: 'Offer received',
  accepted: 'Accepted',
  closed: 'Closed',
};

/** Short helper text under the status control. */
export const STATUS_HINT: Record<ApplicationStatus, string> = {
  researching: 'Still deciding whether to apply.',
  preparing: 'Applying — collecting documents and tests.',
  applied: 'Submitted; waiting for a decision.',
  offer: 'An offer is in hand.',
  accepted: 'You accepted this offer.',
  closed: 'Withdrawn, declined or not admitted.',
};

/** The student's OWN estimate — never a site prediction. */
export const PRIORITIES = ['safe', 'target', 'reach'] as const;
export type Priority = (typeof PRIORITIES)[number];
export const PRIORITY_LABEL: Record<Priority, string> = {
  safe: 'Safe',
  target: 'Target',
  reach: 'Reach',
};

export interface PlannerApplication {
  id: string;
  college_slug: string | null;
  name: string;
  region: RegionSlug;
  program: string | null;
  intake: string | null;
  official_url: string | null;
  status: ApplicationStatus;
  priority: Priority | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Tasks ────────────────────────────────────────────────────────────────────

export const TASK_KINDS = ['application', 'document', 'test', 'scholarship', 'visa', 'interview', 'other'] as const;
export type TaskKind = (typeof TASK_KINDS)[number];
export const TASK_KIND_LABEL: Record<TaskKind, string> = {
  application: 'Application',
  document: 'Document',
  test: 'Test',
  scholarship: 'Scholarship',
  visa: 'Visa',
  interview: 'Interview',
  other: 'Other',
};

export interface PlannerTask {
  id: string;
  application_id: string | null;
  title: string;
  kind: TaskKind;
  /** ISO calendar date (YYYY-MM-DD) or null for an undated checklist item. */
  due_on: string | null;
  done: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * The optional starter checklist offered when an application is added. Deliberately
 * generic: these are the items most applications ask for, phrased so the student
 * confirms the real list with the university (no fabricated requirements).
 */
export const STARTER_CHECKLIST: ReadonlyArray<{ title: string; kind: TaskKind }> = [
  { title: 'Confirm the exact requirements and deadline on the official site', kind: 'application' },
  { title: 'Academic transcripts / mark sheets', kind: 'document' },
  { title: 'Test scores (entrance or English test, if required)', kind: 'test' },
  { title: 'Statement of purpose or personal essay (if required)', kind: 'document' },
  { title: 'Letters of recommendation (if required)', kind: 'document' },
  { title: 'Passport or identity document copy', kind: 'document' },
  { title: 'Proof of funds / financial documents (if required)', kind: 'document' },
  { title: 'Application fee paid and submission confirmed', kind: 'application' },
];

// ── Limits (mirror the database CHECKs) ─────────────────────────────────────

export const LIMITS = {
  name: 160,
  program: 160,
  intake: 40,
  url: 500,
  notes: 4000,
  taskTitle: 160,
  applications: 100,
  tasks: 1000,
} as const;

/** Printable text only (the DB rejects control characters). */
/** Global: `replace` without /g strips only the FIRST match, so a paste with two control characters passed the client cleaner and was then refused by the DB CHECK with a generic error (found 24 Sep 2026). */
/** Includes NUL: Postgres `text` cannot store it at all, so a pasted NUL failed the save with a generic error (26 Sep 2026). */
export const CONTROL_RE = /[\x00-\x1F\x7F]/g;
/** Notes may contain newlines and tabs. */
export const NOTES_CONTROL_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export function cleanText(raw: string, max: number): string {
  return raw.replace(CONTROL_RE, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function cleanNotes(raw: string): string {
  return raw.replace(NOTES_CONTROL_RE, '').replace(/\r\n?/g, '\n').slice(0, LIMITS.notes);
}

/** https only, no whitespace — the DB CHECK is the same rule. Returns '' when invalid. */
export function cleanUrl(raw: string): string {
  const v = raw.trim();
  if (!v) return '';
  if (v.length > LIMITS.url || /\s/.test(v) || !/^https:\/\/[^\s]+$/i.test(v)) return '';
  try {
    const u = new URL(v);
    // Lower-case the scheme: the DB CHECK (`~ '^https://…'`) is case-sensitive,
    // and address bars / autocapitalise hand over "HTTPS://" (independent review).
    return u.protocol === 'https:' ? `https://${v.slice(8)}` : '';
  } catch {
    return '';
  }
}

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Today's calendar date in the visitor's time zone, as YYYY-MM-DD. */
export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Whole days from today to `iso` (negative = overdue). Calendar arithmetic, DST-safe. */
export function daysUntil(iso: string, today = todayIso()): number {
  const a = Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1, Number(today.slice(8, 10)));
  const b = Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return Math.round((b - a) / 86_400_000);
}

export function formatDue(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

/** "Today", "Tomorrow", "in 12 days", "3 days overdue". */
export function relativeDue(iso: string, today = todayIso()): string {
  const n = daysUntil(iso, today);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n > 1) return `in ${n} days`;
  if (n === -1) return '1 day overdue';
  return `${-n} days overdue`;
}

// ── Catalogue projections (built by the server page, passed as props) ───────

export interface CollegeOption {
  slug: string;
  name: string;
  region: RegionSlug;
  /** Destination country name (`countries` in lib/regions.ts), or null when the profile's country is not on that list. */
  country: string | null;
  /** "City, Country" for the search result line. */
  place: string;
  url: string | null;
  /** Course areas already on the profile. The planner offers them; the student can still type their own. */
  courses?: string[];
}

export interface ExamOption {
  slug: string;
  shortName: string;
  fullName: string;
  region: RegionSlug | 'global';
  /** Further destinations whose universities accept it (the exam record's own `regions`). */
  regions?: RegionSlug[];
  /** The test body's official site, from the exam record — linked beside every date added for it. */
  url: string | null;
}

/**
 * The exam a test-date item was added for. The item stores only the title the
 * form wrote — "<short name> — test date" or "<short name> — registration
 * deadline" — so the exam is the one whose short name opens that title (the
 * longest such name wins, so a name that begins another's is never mistaken
 * for it). Null for an item whose title matches no exam in the list.
 */
export function examForTitle(title: string, exams: readonly ExamOption[]): ExamOption | null {
  let best: ExamOption | null = null;
  for (const e of exams) {
    if (title.startsWith(`${e.shortName} — `) && (!best || e.shortName.length > best.shortName.length)) best = e;
  }
  return best;
}

// ── One destination at a time (constitution §18 "region in context") ────────

/**
 * What the planner shows for one destination: that destination's
 * applications, the items tied to them, and every item NOT tied to a
 * university. Those general items (the test dates added from the timeline)
 * belong to no destination — a student applying to two destinations sits one
 * IELTS — so they appear under each destination rather than under none. The
 * tool, its CSV and its report all use this one rule, so they never disagree
 * about what "your plan for X" contains.
 */
export function inDestination(
  apps: PlannerApplication[],
  tasks: PlannerTask[],
  region: RegionSlug,
): { apps: PlannerApplication[]; linked: PlannerTask[]; general: PlannerTask[] } {
  const here = apps.filter((a) => a.region === region);
  const ids = new Set(here.map((a) => a.id));
  return {
    apps: here,
    linked: tasks.filter((t) => t.application_id !== null && ids.has(t.application_id)),
    general: tasks.filter((t) => t.application_id === null),
  };
}

// ── CSV download ─────────────────────────────────────────────────────────────

/**
 * The plan for ONE destination, as on screen (and as in the report): its
 * applications with their items, then the general items. The student's whole
 * plan across every destination is in the account data download.
 */
export function plannerCsv(apps: PlannerApplication[], tasks: PlannerTask[], region: RegionSlug, exams: readonly ExamOption[] = []): string {
  const scope = inDestination(apps, tasks, region);
  const header = ['University', 'Destination', 'Programme', 'Intake', 'Status', 'Your estimate', 'Official site', 'Item', 'Kind', 'Due', 'Done'];
  const rows: Array<string | null>[] = [];
  for (const a of scope.apps) {
    const own = scope.linked.filter((t) => t.application_id === a.id);
    const base = [a.name, a.region, a.program, a.intake, STATUS_LABEL[a.status], a.priority ? PRIORITY_LABEL[a.priority] : '', a.official_url];
    if (own.length === 0) rows.push([...base, '', '', '', '']);
    for (const t of own) rows.push([...base, t.title, TASK_KIND_LABEL[t.kind], t.due_on ?? '', t.done ? 'yes' : 'no']);
  }
  for (const t of scope.general) {
    // A test date carries its test body's official site (where the date must be confirmed) when the exam list is known.
    rows.push(['', '', '', '', '', '', examForTitle(t.title, exams)?.url ?? '', t.title, TASK_KIND_LABEL[t.kind], t.due_on ?? '', t.done ? 'yes' : 'no']);
  }
  return csvDocument([header, ...rows]);
}
