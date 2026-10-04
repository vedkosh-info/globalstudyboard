/**
 * Test Score Tracker → ReportDocument. Pure: rows in, document out.
 *
 * Two things, kept apart: the student's own attempts (score as received,
 * sections, test date) and the official validity rule for each exam
 * (lib/test-validity.ts — a fact with its source). The readiness table lists
 * presence only ("recorded" / "nothing recorded") for the tests each
 * shortlisted university's profile names; the report never says whether a
 * score meets a requirement, never computes a best score (Rule A, §4.5).
 */

import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { todayIso } from '@/lib/planner';
import { validityFor, validityStatus } from '@/lib/test-validity';
import { DOMESTIC_READINESS_CAVEAT, readiness, readinessIntro, sortAttempts, type CollegeTests, type ExamPick, type ShortlistApplication, type TestScore, type TestScoreSection } from '@/lib/test-scores';
import { DASH, cell, fileSlug, hostOf, mergeSubjectLinks, type Cell, type ReportDocument, type ReportSection, type SubjectLink } from '@/lib/reports/model';

export interface ScoresReportInput {
  region: RegionSlug;
  scores: TestScore[];
  sections: TestScoreSection[];
  exams: Map<string, ExamPick>;
  /** The planner's applications (any destination — the builder keeps the destination's). */
  applications: ShortlistApplication[];
  colleges: Map<string, CollegeTests>;
  /**
   * Whether the planner shortlist could be read. 'setup' / 'error' must never be
   * reported as "no applications": the report would then state as fact
   * something it did not read (Rule A).
   */
  shortlist?: 'ready' | 'setup' | 'error';
  /**
   * The §16.7 audience the report is made for (the tool's own: the chosen
   * audience, else the destination's default). A domestic student is told —
   * exactly as in the tool — that tests a profile lists for international
   * applicants may not apply to them. Omitted = no audience line, no caveat.
   */
  domestic?: boolean;
  /** Country chosen in the tool. Readiness is that country's profiled applications only. */
  country?: string | null;
  includeNotes: boolean;
  now?: Date;
}

const fmtDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
};

export function buildScoresReport(input: ScoresReportInput): ReportDocument {
  const now = input.now ?? new Date();
  const today = todayIso(now);
  const region = getRegionBySlug(input.region);
  const regionName = region?.displayName ?? input.region;
  const prose = region?.proseName ?? regionName;
  const attempts = sortAttempts(input.scores);
  const nameOf = (slug: string) => input.exams.get(slug)?.shortName ?? slug;
  const sectionsOf = (id: string) =>
    input.sections
      .filter((x) => x.score_id === id)
      .sort((a, b) => a.position - b.position)
      .map((x) => `${x.label} ${x.value}`)
      .join(' · ');

  const rules = attempts.map((s) => validityFor(s.exam_slug));
  const statuses = attempts.map((s, i) => validityStatus(rules[i], s.test_date, today, nameOf(s.exam_slug)));
  const count = (pick: (i: number) => boolean) => attempts.filter((_, i) => pick(i)).length;
  // Only a `months` rule is a validity or reporting period the test body
  // itself ends (TOEFL, PTE, DET; GRE "reportable"): those alone are counted
  // as ending or ended. A RECOMMENDED age (IELTS) never expires a result, so it
  // is counted apart and never called expiring or expired (Rule A).
  const ending = count((i) => rules[i]?.kind === 'months' && statuses[i].tone === 'soon');
  const ended = count((i) => rules[i]?.kind === 'months' && statuses[i].tone === 'expired');
  const anyRecommended = rules.some((r) => r?.kind === 'recommended-months');
  const nearRecommended = count((i) => rules[i]?.kind === 'recommended-months' && statuses[i].tone === 'soon');
  const pastRecommended = count((i) => rules[i]?.kind === 'recommended-months' && statuses[i].tone === 'advisory');
  const distinctExams = new Set(attempts.map((s) => s.exam_slug)).size;
  const countCell = (n: number) => (n ? String(n) : cell('None', { muted: true }));

  const sections: ReportSection[] = [];

  sections.push({
    kind: 'facts',
    heading: 'At a glance',
    items: [
      { label: 'Destination in view', value: regionName },
      ...(input.domestic === undefined ? [] : [{ label: 'Viewing as', value: input.domestic ? 'Domestic student' : 'International student' }]),
      { label: 'Recorded attempts', value: `${attempts.length} across ${distinctExams} ${distinctExams === 1 ? 'test' : 'tests'}` },
      { label: 'Validity or reporting period ends within 90 days', value: countCell(ending) },
      { label: 'Past the published validity or reporting period', value: countCell(ended) },
      // Shown only when a recorded test publishes a recommended age rather than a validity period.
      ...(anyRecommended
        ? [
            { label: 'Reaches a recommended maximum age within 90 days', value: countCell(nearRecommended) },
            { label: 'Older than a recommended maximum age', value: countCell(pastRecommended) },
          ]
        : []),
    ],
  });

  sections.push({
    kind: 'table',
    heading: 'Your recorded scores',
    intro: 'Every attempt you recorded, newest first — the score exactly as you entered it. Nothing here is a “best” or combined score.',
    columns: [
      { label: 'Test', weight: 1.1 },
      { label: 'Test date', weight: 1 },
      { label: 'Score', weight: 1.2 },
      { label: 'Sections', weight: 1.8 },
      { label: 'Validity (as published by the test body)', weight: 2.4 },
    ],
    rows: attempts.map((s, i): Cell[] => [
      cell(nameOf(s.exam_slug), { strong: true }),
      fmtDate(s.test_date),
      cell(s.score_text, { strong: true }),
      sectionsOf(s.id) || cell(DASH, { muted: true }),
      cell(statuses[i].text, statuses[i].tone === 'expired' ? { strong: true } : statuses[i].tone === 'info' ? { muted: true } : {}),
    ]),
    empty: 'No scores recorded yet.',
    footnote:
      'We compute a date only where the test body publishes a fixed period from the test date, or recommends a maximum age for a result (counted here from the test date, so treat that date as approximate); everywhere else the rule is stated in words, in the body’s own terms. Universities may set their own recency rules — confirm with each one.',
  });

  const shortlist = input.shortlist ?? 'ready';
  const pickedCountry = input.country && region?.countries.includes(input.country) ? input.country : null;
  const apps =
    shortlist === 'ready'
      ? input.applications.filter((a) => a.region === input.region && (!pickedCountry || (Boolean(a.college_slug) && input.colleges.get(a.college_slug!)?.country === pickedCountry)))
      : [];
  const place = pickedCountry ?? prose;
  const rows: Cell[][] = [];
  for (const row of readiness(apps, input.colleges, input.scores, input.exams, today)) {
    if (row.lines === null) {
      rows.push([cell(row.name, { strong: true }), cell('Added by you — no profile, so no test list to check', { muted: true }), cell(DASH, { muted: true }), cell(DASH, { muted: true })]);
      continue;
    }
    if (row.lines.length === 0) {
      rows.push([cell(row.name, { strong: true }), cell('The profile lists no tests', { muted: true }), cell(DASH, { muted: true }), cell(DASH, { muted: true })]);
      continue;
    }
    for (const line of row.lines) {
      if (line.exams.length === 0) {
        rows.push([cell(row.name, { strong: true }), line.text, cell('Nothing the tracker records — see the official requirements', { muted: true }), cell(DASH, { muted: true })]);
        continue;
      }
      for (const ex of line.exams) {
        // A row dated after today (the database's one-day slack, a wrong clock,
        // a time-zone change) is "dated", never presented as a result in hand.
        const record = !ex.latest
          ? cell(`${nameOf(ex.slug)}: nothing recorded`, { muted: true })
          : ex.future
            ? cell(`${nameOf(ex.slug)}: recorded — ${ex.latest.score_text}, dated ${fmtDate(ex.latest.test_date)} (after today)`, { strong: true })
            : cell(`${nameOf(ex.slug)}: recorded — ${ex.latest.score_text} (${fmtDate(ex.latest.test_date)})`, { strong: true });
        rows.push([
          cell(row.name, { strong: true }),
          line.text,
          record,
          ex.validity ? cell(ex.validity.text, ex.validity.tone === 'expired' ? { strong: true } : { muted: true }) : cell(DASH, { muted: true }),
        ]);
      }
    }
  }
  sections.push({
    kind: 'table',
    heading: `Readiness for your shortlist — ${pickedCountry ?? regionName}`,
    intro: `${readinessIntro(place)}${input.domestic ? ` ${DOMESTIC_READINESS_CAVEAT}` : ''}`,
    columns: [
      { label: 'University', weight: 1.4 },
      { label: 'Profile’s admission requirements', weight: 2 },
      { label: 'Your record', weight: 2 },
      { label: 'Validity', weight: 2 },
    ],
    rows,
    empty:
      shortlist === 'setup'
        ? 'The Application Planner is not switched on for this account yet, so there is no shortlist to check.'
        : shortlist === 'error'
          ? 'The Application Planner shortlist could not be loaded for this report. Reload the page to include it.'
          : `The Application Planner has no ${pickedCountry ? 'profiled application in' : 'applications for'} ${place} yet.`,
    footnote: 'Presence only. Whether a score satisfies a programme is decided by the university, on the official requirements page — this report never says a score is enough or not enough.',
  });

  sections.push({
    kind: 'callout',
    text: 'Scores, sections and dates are as you entered them; GlobalStudyBoard verified none of them, converts no test’s scale into another’s, computes no best or combined score, and makes no prediction of admission. Validity rules are summarised from each test body’s official page, listed under Sources, and change — confirm before relying on them.',
  });

  const notes: string[] = [];
  if (input.includeNotes) for (const s of attempts) if (s.note?.trim()) notes.push(`${nameOf(s.exam_slug)} (${fmtDate(s.test_date)}): ${s.note.trim()}`);
  if (notes.length) sections.push({ kind: 'text', heading: 'Your private notes', paragraphs: notes });

  // Labels use a colon, never a parenthesis around a name: several carry their
  // own ("AFCAT — official portal (Indian Air Force)"). Each rule is cited by
  // its source's own label — the page or document, with the section where the
  // rule lives in a bulletin ("NATA 2026 information brochure, §3.0 and
  // §10.1–10.2") — as the tool and the public table cite it. Exams that cite
  // one page for the same purpose share one entry that names them all.
  const sources: SubjectLink[] = [];
  for (const slug of new Set(attempts.map((s) => s.exam_slug))) {
    const subject = nameOf(slug);
    const v = validityFor(slug);
    // An `unstated` link is where to confirm — never labelled as the rule itself.
    if (v) sources.push({ subject, about: v.kind === 'unstated' ? `where to confirm validity: ${v.source.label}; no published rule found` : `validity rule: ${v.source.label}`, url: v.source.url });
    if (v?.also) sources.push({ subject, about: `validity rule, second source: ${v.also.label}`, url: v.also.url });
    const site = input.exams.get(slug)?.websiteUrl;
    if (site) sources.push({ subject, about: `official site (${hostOf(site)})`, url: site });
  }

  return {
    tool: 'test-score-tracker',
    toolName: 'Test Score Tracker',
    title: `Test scores — ${regionName} shortlist`,
    subtitle: `${attempts.length} ${attempts.length === 1 ? 'attempt' : 'attempts'} · ${distinctExams} ${distinctExams === 1 ? 'test' : 'tests'}${shortlist === 'ready' ? ` · ${apps.length} ${apps.length === 1 ? 'university' : 'universities'} on the shortlist` : ''}`,
    region: input.region,
    regionName,
    generatedAt: now.toISOString(),
    intro: `The test scores you recorded, each with the validity rule its test body publishes (or a note where it publishes none), and — for your Application Planner shortlist in ${place} — which listed tests have a score on record.`,
    sections,
    sources: mergeSubjectLinks(sources),
    includesNotes: notes.length > 0,
    fileStem: `globalstudyboard-test-scores-${fileSlug(input.region, 'scores')}`,
  };
}
