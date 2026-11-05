import type { RegionSlug } from './regions';

export interface CheckRule {
  id: string;
  title: string;
  detail: string;
  sourceUrl: string;
  action: string;
  kind: 'prepare' | 'confirm' | 'ielts' | 'minimum' | 'courses';
  minimum?: { value: number; question: string; unit: string };
  /** Each group is required. Alternatives within a group satisfy the same topic. */
  courses?: { options: string[]; groups: string[][] };
  /** Only an explicitly published IELTS Academic route; alternative routes stay unresolved. */
  ielts?: { overall: number; eachBand?: number };
}

export interface CheckProgramme {
  id: string;
  collegeSlug: string;
  university: string;
  name: string;
  region: RegionSlug;
  officialUrl: string;
  scope: string;
  intake: string;
  reviewed: string;
  /** Optional end of the specific cycle covered, if earlier than the editorial review window. */
  validThrough?: string;
  rules: CheckRule[];
}

export type CheckAnswer = 'ready' | 'todo';
export interface BandInput { overall: string; lowest: string }
export type CheckStatus = 'ready' | 'todo' | 'unknown' | 'confirm';
export interface Finding { rule: CheckRule; status: CheckStatus; message: string }

// An editorial review window, never an application deadline.
const REVIEW_DAYS = 90;

function dayNumber(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const stamp = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(stamp) && new Date(stamp).toISOString().slice(0, 10) === value
    ? stamp / 86400000 : NaN;
}

export function evidenceCurrent(programme: CheckProgramme, today = new Date().toISOString().slice(0, 10)): boolean {
  const day = dayNumber(today);
  const age = day - dayNumber(programme.reviewed);
  return age >= 0 && age <= REVIEW_DAYS && (!programme.validThrough || day <= dayNumber(programme.validThrough));
}

function programmeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    // Keep programme/intake query parameters. Only known tracking parameters can be ignored.
    for (const key of Array.from(url.searchParams.keys())) {
      if (/^utm_/i.test(key)) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    // Preserve hash-routed programme identities (e.g. #/courses/abc).
    const fragment = /^#!?\//.test(url.hash) ? url.hash : '';
    return url.origin + url.pathname.replace(/\/$/, '') + url.search + fragment;
  } catch {
    return null;
  }
}

const searchable = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function matchingProgrammes(programmes: CheckProgramme[], region: RegionSlug, query: string): CheckProgramme[] {
  const entries = programmes.filter((programme) => programme.region === region);
  const value = query.trim();
  if (!value) return entries;
  if (/^[a-z][\w+.-]*:|^www\./i.test(value)) {
    const url = programmeUrl(/^www\./i.test(value) ? 'https://' + value : value);
    return url ? entries.filter((entry) => programmeUrl(entry.officialUrl) === url) : [];
  }
  const words = searchable(value).split(/\s+/);
  return entries.filter((entry) => {
    const name = searchable([entry.university, entry.name, entry.id.replace(/-/g, ' ')].join(' '));
    return words.every((word) => name.includes(word));
  });
}

export function parseBand(value: string): number | null {
  if (!/^[0-9](?:\.[05])?$/.test(value.trim())) return null;
  const band = Number(value);
  return band <= 9 ? band : null;
}

function compareBands(rule: CheckRule, bands: BandInput): Finding {
  const threshold = rule.ielts;
  const overall = parseBand(bands.overall);
  const lowest = parseBand(bands.lowest);
  if (!threshold || overall === null) {
    return { rule, status: 'unknown', message: 'If you plan to use IELTS Academic, enter the overall band from one result.' };
  }
  if (threshold.eachBand !== undefined && bands.lowest && (lowest === null || lowest > overall || overall > Math.round((lowest + 27) / 2) / 2)) {
    return { rule, status: 'unknown', message: 'Check the overall and lowest bands against the same score report.' };
  }
  const overallShort = overall < threshold.overall;
  const skillShort = threshold.eachBand !== undefined && lowest !== null && lowest < threshold.eachBand;
  if (overallShort || skillShort) {
    const overallResult = `Your overall band of ${overall.toFixed(1)} ${overallShort ? 'falls below' : 'reaches'} the ${threshold.overall.toFixed(1)} minimum.`;
    const skillResult = skillShort ? ` Your lowest skill band is ${lowest.toFixed(1)}. Each skill needs at least ${threshold.eachBand!.toFixed(1)}.` : '';
    return { rule, status: 'todo', message: overallResult + skillResult + ' Check the programme’s other English evidence options.' };
  }
  if (threshold.eachBand !== undefined && lowest === null) {
    return { rule, status: 'unknown', message: 'The overall band reaches the stated minimum. Add your lowest section band to check all four.' };
  }
  return { rule, status: 'ready', message: 'The bands entered reach the published minimum for this route. Confirm the result date and accepted test format.' };
}

export interface CheckResponses {
  quantities?: Record<string, string>;
  courses?: Record<string, string[]>;
}

function compareQuantity(rule: CheckRule, value: string | undefined): Finding {
  if (!rule.minimum || !value || !/^\d{1,4}$/.test(value.trim())) {
    return { rule, status: 'unknown', message: 'Enter a whole number to compare this requirement.' };
  }
  const difference = rule.minimum.value - Number(value);
  if (difference > 0) {
    return { rule, status: 'todo', message: `Your answer is ${difference} ${rule.minimum.unit} below the stated minimum. Check which experience the programme counts.` };
  }
  return { rule, status: 'ready', message: 'The amount you entered reaches the stated minimum. The programme confirms which experience counts.' };
}

function compareCourses(rule: CheckRule, choices: string[] | undefined): Finding {
  if (!rule.courses || choices === undefined) {
    return { rule, status: 'unknown', message: 'Select your course topics to see which ones still need evidence.' };
  }
  const selected = new Set(choices);
  const missing = rule.courses.groups.filter((group) => !group.some((option) => selected.has(option)));
  if (missing.length) {
    const topics = missing.map((group) => group.join(' or ')).join(', ');
    return { rule, status: 'unknown', message: `Still to account for: ${topics}. Check your course record for these topics.` };
  }
  return { rule, status: 'ready', message: 'Your selections cover the listed topics. Confirm credit, grades and accepted course content with the programme.' };
}

export function evaluateCheck(programme: CheckProgramme, answers: Record<string, CheckAnswer>, bands: BandInput, today?: string, responses: CheckResponses = {}): Finding[] {
  if (!evidenceCurrent(programme, today)) return programme.rules.map((rule) => ({
    rule, status: 'confirm', message: 'This review needs updating. Check the current instructions on the official page.',
  }));
  return programme.rules.map((rule) => {
    if (rule.kind === 'ielts') return compareBands(rule, bands);
    if (rule.kind === 'minimum') return compareQuantity(rule, responses.quantities?.[rule.id]);
    if (rule.kind === 'courses') return compareCourses(rule, responses.courses?.[rule.id]);
    if (rule.kind === 'confirm') return { rule, status: 'confirm', message: 'Check how this applies to your background with the programme.' };
    switch (answers[rule.id]) {
      case 'ready': return { rule, status: 'ready', message: 'You marked this item ready.' };
      case 'todo': return { rule, status: 'todo', message: 'You marked this as a next step.' };
      default: return { rule, status: 'unknown', message: 'Your preparation status is unknown.' };
    }
  });
}

export function nextActions(findings: Finding[]): Finding[] {
  const priority: Record<CheckStatus, number> = { todo: 0, confirm: 1, unknown: 2, ready: 3 };
  return findings.filter(({ status }) => status !== 'ready').sort((a, b) => priority[a.status] - priority[b.status]).slice(0, 3);
}

export function lowestReportedBand(sections: { label: string; value: string }[]): string {
  const found = new Map<string, number>();
  for (const { label, value } of sections) {
    const key = label.trim().toLowerCase();
    if (!['reading', 'writing', 'listening', 'speaking'].includes(key)) continue;
    const band = parseBand(value);
    if (band === null || found.has(key)) return '';
    found.set(key, band);
  }
  return found.size === 4 ? String(Math.min(...found.values())) : '';
}
