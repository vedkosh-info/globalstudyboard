/**
 * Reports — ONE document model shared by every tool and every output.
 *
 * A tool builds a `ReportDocument` (a pure function of the student's rows);
 * the same document is then rendered three ways — as the on-page HTML report
 * (`components/tools/ReportView.tsx`), through the browser's print stylesheet,
 * and as a PDF drawn in the browser by `lib/reports/pdf.ts`. One model means
 * the PDF can never say something the page does not. (The one difference is
 * visible, never silent: a character the PDF's embedded fonts cannot draw —
 * Devanagari or Chinese typed in a note, say — prints as □, and the report
 * view tells the student that Print keeps it.)
 *
 * Constitution §18 rules that shape this file:
 *   - Everything in a report is the STUDENT's own data or a fact our profile
 *     page already renders (attributed and linked). The builders add no
 *     figure, threshold, verdict or prediction of their own (Rule A, §4.5).
 *   - Every report prints the site disclaimer and the non-affiliation notice
 *     on every page, plus a line saying who prepared it — a document a student
 *     may hand to a bank or a visa officer must never look like an official
 *     record (§14.2 consumer/advertising).
 *   - Nothing leaves the device: no server, no e-mail address, no identifier.
 *     Private notes appear only when the student ticks the box (§9.1).
 *
 * No Supabase import, no catalogue import: safe in any client chunk.
 */

import type { RegionSlug } from '@/lib/regions';
import { NON_AFFILIATION_NOTICE, SITE_DISCLAIMER } from '@/lib/site-meta';

export type ToolSlug = 'application-planner' | 'cost-planner' | 'compare-universities' | 'test-score-tracker';

// ── Paper ───────────────────────────────────────────────────────────────────

export type Paper = 'a4' | 'letter';
export const PAPERS: Paper[] = ['a4', 'letter'];
export const PAPER_LABEL: Record<Paper, string> = { a4: 'A4', letter: 'US Letter' };
export const isPaper = (v: string): v is Paper => v === 'a4' || v === 'letter';

/** Letter where it is the everyday sheet (USA, Canada); A4 everywhere else — the report follows the destination in context. */
export function defaultPaperFor(region: RegionSlug): Paper {
  return region === 'usa' || region === 'canada' ? 'letter' : 'a4';
}

// ── Cells and sections ──────────────────────────────────────────────────────

export interface ReportLink {
  label: string;
  url: string;
}

export interface ReportCell {
  text: string;
  /** Rendered as a link (HTML) and a clickable area (PDF); the text stays visible in print. */
  url?: string;
  align?: 'left' | 'right';
  muted?: boolean;
  strong?: boolean;
}
export type Cell = string | ReportCell;

export interface ReportColumn {
  label: string;
  align?: 'left' | 'right';
  /** Relative width for the PDF (defaults to 1). */
  weight?: number;
}

export interface TableSection {
  kind: 'table';
  heading: string;
  intro?: string;
  columns: ReportColumn[];
  rows: Cell[][];
  /** Shown when there are no rows. */
  empty?: string;
  footnote?: string;
}

export interface FactsSection {
  kind: 'facts';
  heading: string;
  items: { label: string; value: Cell }[];
}

export interface TextSection {
  kind: 'text';
  heading: string;
  paragraphs: string[];
}

/** A boxed line the student must not miss (not-advice, verify nudges). */
export interface CalloutSection {
  kind: 'callout';
  text: string;
}

export type ReportSection = TableSection | FactsSection | TextSection | CalloutSection;

export interface ReportDocument {
  tool: ToolSlug;
  toolName: string;
  title: string;
  subtitle: string | null;
  region: RegionSlug;
  regionName: string;
  /** ISO timestamp of generation (the page's clock; shown on the report). */
  generatedAt: string;
  /** One honest sentence: what this document is and where its content came from. */
  intro: string;
  sections: ReportSection[];
  /** Every official page the report cites, de-duplicated by URL (dedupeLinks / mergeSubjectLinks). */
  sources: ReportLink[];
  includesNotes: boolean;
  /** Filename stem — never a name, an e-mail or an identifier. */
  fileStem: string;
}

export const cell = (text: string, extra: Omit<ReportCell, 'text'> = {}): ReportCell => ({ text, ...extra });
export const cellText = (c: Cell): string => (typeof c === 'string' ? c : c.text);
export const cellUrl = (c: Cell): string | undefined => (typeof c === 'string' ? undefined : c.url);

/** A placeholder that reads as "nothing entered" in both HTML and PDF. */
export const DASH = '—';

/** "example.edu" for a link cell whose full URL would crowd a table. */
export function hostOf(url: string | null | undefined): string {
  if (!url) return DASH;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * The page a URL names, for de-duplication: "https://www.Upsc.gov.in/" and
 * "http://upsc.gov.in" are the same page, so the scheme, a leading "www.",
 * the host's case and trailing slashes are ignored. The path's case, the
 * query and the fragment are kept — they can name a different page or a
 * different place on it. An unparseable string is its own key.
 */
function pageKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname.toLowerCase().replace(/^www\./, '')}${u.port ? `:${u.port}` : ''}${u.pathname.replace(/\/+$/, '')}${u.search}${u.hash}`;
  } catch {
    return url;
  }
}

/**
 * Each cited page once. The first entry keeps its label (builders push the
 * most specific label first, e.g. the validity page before the exam's site);
 * if a later spelling of the same page is https and the kept one is not, the
 * https address is kept instead.
 */
export function dedupeLinks(links: ReportLink[]): ReportLink[] {
  const kept = new Map<string, ReportLink>();
  for (const l of links) {
    if (!l.url) continue;
    const key = pageKey(l.url);
    const prev = kept.get(key);
    if (!prev) kept.set(key, { ...l });
    else if (!prev.url.startsWith('https:') && l.url.startsWith('https:')) prev.url = l.url;
  }
  return [...kept.values()];
}

/** A page cited on behalf of a named subject (an exam), and what the page is to that subject. */
export interface SubjectLink {
  subject: string;
  /** What the page is to the subject ("validity rule: ETS") — printed after the subject names. */
  about: string;
  url: string;
}

/**
 * dedupeLinks for pages cited on behalf of named subjects, labelled
 * "{subjects} — {about}". Each page is listed once; when several subjects cite
 * it for the SAME purpose (CDS and CAPF AC both confirm on upsc.gov.in), the
 * one entry names them all ("CDS, CAPF AC — …") rather than hiding the later
 * ones behind the first. A subject that cites a kept page for a DIFFERENT
 * purpose is not added to its label — that would say the page is something it
 * is not for that subject; the page is still listed once. First entry first,
 * with dedupeLinks' preference for an https spelling.
 */
export function mergeSubjectLinks(links: SubjectLink[]): ReportLink[] {
  const kept = new Map<string, { subjects: string[]; about: string; url: string }>();
  for (const l of links) {
    if (!l.url) continue;
    const key = pageKey(l.url);
    const prev = kept.get(key);
    if (!prev) {
      kept.set(key, { subjects: [l.subject], about: l.about, url: l.url });
      continue;
    }
    if (!prev.url.startsWith('https:') && l.url.startsWith('https:')) prev.url = l.url;
    if (l.about === prev.about && !prev.subjects.includes(l.subject)) prev.subjects.push(l.subject);
  }
  return [...kept.values()].map((k) => ({ label: `${k.subjects.join(', ')} — ${k.about}`, url: k.url }));
}

// ── Fixed wording printed on every report ───────────────────────────────────

/** Who made this document and what it is NOT — printed under the title and in the PDF metadata. */
export const PREPARED_BY =
  'Prepared by the account holder in their own browser from information they entered on GlobalStudyBoard. Nothing here was verified, issued or certified by GlobalStudyBoard; this is not an offer, a receipt or an official record.';

/** The two lines every page of every report carries (the same wording as the site footer). */
export const REPORT_FOOTER_LINES: readonly string[] = [SITE_DISCLAIMER, NON_AFFILIATION_NOTICE];

// ── Dates and names ─────────────────────────────────────────────────────────

/** "23 September 2026, 15:42" in the visitor's time zone. */
export function formatGenerated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
}

/** YYYY-MM-DD of the generation time, for the filename. */
export function generatedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'report';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function reportFilename(doc: ReportDocument): string {
  return `${doc.fileStem}-${generatedDate(doc.generatedAt)}.pdf`;
}

/** A filename-safe fragment from a student-typed label (ASCII letters/digits only, never empty). */
export function fileSlug(label: string, fallback: string): string {
  const s = label
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return s || fallback;
}
