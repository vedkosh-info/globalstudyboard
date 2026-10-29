/** Student-authored scholarship records. No SDK or content catalogue imports. */
import type { RegionSlug } from '@/lib/regions';
import { csvDocument } from '@/lib/csv';

export const SCHOLARSHIP_STATUSES = ['researching', 'preparing', 'submitted', 'shortlisted', 'offered', 'accepted', 'received', 'unsuccessful', 'withdrawn'] as const;
export type ScholarshipStatus = (typeof SCHOLARSHIP_STATUSES)[number];
export const SCHOLARSHIP_STATUS_LABEL: Record<ScholarshipStatus, string> = {
  researching: 'Researching', preparing: 'Preparing', submitted: 'Submitted',
  shortlisted: 'Shortlisted', offered: 'Award offered', accepted: 'Award accepted',
  received: 'Funding received', unsuccessful: 'Unsuccessful', withdrawn: 'Withdrawn',
};
export const SCHOLARSHIP_LIMITS = {
  entries: 100, tasksPerEntry: 20, tasks: 1000, name: 160, provider: 160,
  url: 500, guideSlug: 160, cycle: 40, notes: 2000, taskTitle: 160,
} as const;
export const SCHOLARSHIP_FIRST_TASK = 'Check the current requirements on the official site';
export const SCHOLARSHIP_VERIFY = 'Confirm every requirement and deadline on the official programme website. Your entries are not verified by GlobalStudyBoard.';

export interface ScholarshipEntry {
  id: string;
  user_id?: string;
  name: string;
  provider: string | null;
  official_url: string | null;
  guide_slug: string | null;
  cycle: string | null;
  region: RegionSlug;
  application_id: string | null;
  status: ScholarshipStatus;
  notes: string | null;
  budget_item_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipTask {
  id: string;
  user_id?: string;
  scholarship_id: string;
  title: string;
  /** A calendar date entered by the student; never a date inferred by GSB. */
  due_on: string | null;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipBudgetResult { item_id: string; already_added: boolean }

/** One UUID per pending save: retries reuse it, even after a lost response. */
export function newScholarshipId(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
      (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16));
}

export function cleanScholarshipText(value: string, max: number = SCHOLARSHIP_LIMITS.name): string {
  return value.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
export function cleanScholarshipNotes(value: string): string {
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').replace(/\r\n?/g, '\n').trim().slice(0, SCHOLARSHIP_LIMITS.notes);
}
/** Links are never fetched by the server. Credentials and non-HTTPS URLs are refused. */
export function cleanScholarshipUrl(value: string): string {
  const v = value.trim();
  if (!v || v.length > SCHOLARSHIP_LIMITS.url || /\s/.test(v)) return '';
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && u.hostname && !u.username && !u.password ? u.href : '';
  } catch { return ''; }
}
export function isScholarshipDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1990-01-01' || value > '2100-12-31') return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
export function formatScholarshipDue(value: string | null): string {
  if (!value) return 'No date added';
  if (!isScholarshipDate(value)) return 'Check the date';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
export function isScholarshipClosed(entry: ScholarshipEntry): boolean {
  return entry.status === 'unsuccessful' || entry.status === 'withdrawn' || entry.status === 'received';
}
export function canTransferScholarship(entry: ScholarshipEntry): boolean {
  return entry.status === 'accepted' || entry.status === 'received';
}
/** One workload rule for the tracker and planner: closed awards keep history, not active reminders. */
export function activeScholarshipTasks(entries: readonly ScholarshipEntry[], tasks: readonly ScholarshipTask[], region: RegionSlug): ScholarshipTask[] {
  const active = new Set(entries.filter((entry) => entry.region === region && !isScholarshipClosed(entry)).map((entry) => entry.id));
  return tasks.filter((task) => !task.done && active.has(task.scholarship_id)).sort((a, b) => (a.due_on ?? '9999').localeCompare(b.due_on ?? '9999') || a.created_at.localeCompare(b.created_at));
}
export function scholarshipTasksFor(tasks: readonly ScholarshipTask[], scholarshipId: string): ScholarshipTask[] {
  return tasks.filter((t) => t.scholarship_id === scholarshipId).sort((a, b) =>
    Number(a.done) - Number(b.done) || (a.due_on ?? '9999').localeCompare(b.due_on ?? '9999') || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
}
export function nextScholarshipTask(tasks: readonly ScholarshipTask[], scholarshipId: string): ScholarshipTask | undefined {
  return scholarshipTasksFor(tasks, scholarshipId).find((t) => !t.done);
}

/** Export only this destination, with no account identifiers and notes opt-in. */
export function scholarshipCsv(entries: readonly ScholarshipEntry[], tasks: readonly ScholarshipTask[], region: RegionSlug, includeNotes = false): string {
  const rows: Array<Array<string>> = [[
    'Scholarship', 'Provider', 'Cycle', 'Destination', 'Status', 'Programme link',
    'Checklist item', 'Your due date', 'Done', 'Funding added to budget', ...(includeNotes ? ['Private notes'] : []),
  ]];
  for (const e of entries.filter((x) => x.region === region).sort((a, b) => a.name.localeCompare(b.name))) {
    const list: Array<ScholarshipTask | undefined> = scholarshipTasksFor(tasks, e.id);
    if (!list.length) list.push(undefined);
    for (const t of list) rows.push([
      e.name, e.provider ?? '', e.cycle ?? '', e.region, SCHOLARSHIP_STATUS_LABEL[e.status], e.official_url ?? '',
      t?.title ?? '', t?.due_on ?? '', t ? (t.done ? 'Yes' : 'No') : '', e.budget_item_id ? 'Yes' : 'No', ...(includeNotes ? [e.notes ?? ''] : []),
    ]);
  }
  rows.push([SCHOLARSHIP_VERIFY]);
  return csvDocument(rows);
}
