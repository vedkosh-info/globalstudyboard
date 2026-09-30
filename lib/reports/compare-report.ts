/**
 * Compare Universities → ReportDocument. Pure: a comparison and its rows in, a
 * document out.
 *
 * Two kinds of content, kept apart exactly as on screen (Rule A, Rule E):
 *   - OUR facts for a profiled university — the same fact sheet the profile
 *     page renders, each ranking attributed to its body and linked, with the
 *     verify nudge printed under the table;
 *   - the STUDENT's criteria, weights and 1–5 scores, and the arithmetic on
 *     them. A blank cell is "not scored", never a zero; the "top pick" is named
 *     only when two or more universities carry a score, ties named together,
 *     and always as the student's own — the site recommends nothing.
 */

import { getRegionBySlug } from '@/lib/regions';
import { RANKING_NUDGE } from '@/lib/college-labels';
import { PROFILE_NOT_FOUND, entryResult, topPick, type CompareCriterion, type CompareEntry, type CompareScore, type CompareSet } from '@/lib/compare';
import type { CompareFacts } from '@/lib/compare-catalogue';
import { DASH, cell, dedupeLinks, fileSlug, hostOf, type Cell, type ReportColumn, type ReportDocument, type ReportLink, type ReportSection } from '@/lib/reports/model';

export interface CompareReportInput {
  set: CompareSet;
  /** Any of the student's rows — the builder keeps only this comparison's (defence in depth; callers need not pre-filter). */
  entries: CompareEntry[];
  criteria: CompareCriterion[];
  scores: CompareScore[];
  facts: Map<string, CompareFacts>;
  includeNotes: boolean;
  now?: Date;
}

/** A university the student typed in themselves (no `college_slug`): we hold no facts for it. */
const CUSTOM = 'Added by you — no verified facts';
// A PROFILED university whose fact sheet is not in the map (its profile has left the
// catalogue) reads PROFILE_NOT_FOUND — never CUSTOM, which would tell the reader they
// typed it in. The report view never builds from a catalogue that failed to load: that
// is shown as a load failure with a retry (review RH-1).

export function buildCompareReport(input: CompareReportInput): ReportDocument {
  const now = input.now ?? new Date();
  const { set } = input;
  const r = getRegionBySlug(set.region);
  const regionName = r?.displayName ?? set.region;
  const entries = input.entries.filter((e) => e.set_id === set.id);
  const criteria = input.criteria.filter((c) => c.set_id === set.id);
  const entryIds = new Set(entries.map((e) => e.id));
  const scores = input.scores.filter((s) => entryIds.has(s.entry_id));
  const factOf = (e: CompareEntry): CompareFacts | undefined => (e.college_slug ? input.facts.get(e.college_slug) : undefined);

  const nameColumns: ReportColumn[] = [{ label: '', weight: 1.4 }, ...entries.map((e) => ({ label: e.name, weight: 1.6 }))];

  const factRow = (label: string, f: (x: CompareFacts) => Cell): Cell[] => [
    cell(label, { strong: true }),
    ...entries.map((e) => {
      const x = factOf(e);
      return x ? f(x) : cell(DASH, { muted: true });
    }),
  ];

  const sections: ReportSection[] = [];

  sections.push({
    kind: 'facts',
    heading: 'Comparison',
    items: [
      { label: 'Destination', value: regionName },
      { label: 'Universities', value: entries.length ? entries.map((e) => e.name).join(' · ') : cell('None yet', { muted: true }) },
      { label: 'Criteria', value: criteria.length ? `${criteria.length}, each weighted 1–5 by you` : cell('None yet', { muted: true }) },
    ],
  });

  sections.push({
    kind: 'table',
    heading: 'Verified facts — as published on each profile',
    intro: 'The same fact sheet as each university’s profile page. A university you added yourself carries no facts here, only your own scores below.',
    columns: nameColumns,
    rows: [
      [
        cell('Rankings', { strong: true }),
        ...entries.map((e) => {
          if (!e.college_slug) return cell(CUSTOM, { muted: true });
          const x = factOf(e);
          if (!x) return cell(PROFILE_NOT_FOUND, { muted: true });
          return x.rankings.length ? x.rankings.map((k) => `${k.body} #${k.rank}`).join('; ') : cell('Not ranked in the lists we carry', { muted: true });
        }),
      ],
      factRow('Location', (x) => x.place),
      factRow('Type', (x) => x.type),
      factRow('Admission tests', (x) => (x.admissionTests.length ? x.admissionTests.join(', ') : DASH)),
      factRow('Application platform', (x) => x.applicationPlatform ?? DASH),
      factRow('Programme levels', (x) => (x.levels.length ? x.levels.join(', ') : DASH)),
      factRow('Language of instruction', (x) => (x.englishTaught ? 'English-taught' : 'Local language')),
      factRow('Established', (x) => String(x.established)),
      [
        cell('Official site', { strong: true }),
        ...entries.map((e) => {
          const url = factOf(e)?.url ?? e.official_url ?? null;
          return url ? cell(hostOf(url), { url }) : cell(DASH, { muted: true });
        }),
      ],
    ],
    empty: 'No universities in this comparison yet.',
    footnote: RANKING_NUDGE,
  });

  const results = new Map(entries.map((e) => [e.id, entryResult(e, criteria, scores)]));
  sections.push({
    kind: 'table',
    heading: 'Your criteria, weights and scores',
    intro: 'Weights and scores are your own (1 = poor for me … 5 = ideal for me). A blank cell was not scored and counts for nothing.',
    columns: [{ label: 'Criterion (weight)', weight: 1.4 }, ...entries.map((e) => ({ label: e.name, align: 'right' as const, weight: 1.6 }))],
    rows: [
      ...criteria.map((c) => [
        cell(`${c.label} (weight ${c.weight})`, { strong: true }),
        ...entries.map((e) => {
          const s = scores.find((x) => x.entry_id === e.id && x.criterion_id === c.id);
          return s ? cell(String(s.score), { align: 'right' }) : cell(DASH, { align: 'right', muted: true });
        }),
      ]),
      [
        cell('Your score', { strong: true }),
        ...entries.map((e) => {
          const res = results.get(e.id);
          return res && res.percent !== null ? cell(`${res.percent}%`, { align: 'right', strong: true }) : cell('Not scored yet', { align: 'right', muted: true });
        }),
      ],
      [
        cell('Based on', { muted: true }),
        ...entries.map((e) => {
          const res = results.get(e.id);
          return cell(res ? `${res.scored} of ${res.total} criteria` : DASH, { align: 'right', muted: true });
        }),
      ],
    ],
    empty: 'No criteria yet.',
  });

  const pick = topPick([...results.values()]);
  const pickLine = pick
    ? `Your top pick, by your own weights: ${pick.entryIds.map((id) => entries.find((e) => e.id === id)?.name ?? '').filter(Boolean).join(' and ')} (${pick.percent}%).`
    : 'Score at least two universities to see your own top pick.';
  sections.push({
    kind: 'callout',
    text: `${pickLine} Every percentage is arithmetic on your own ratings and weights — not an assessment of any university by GlobalStudyBoard, and not a prediction of admission.`,
  });

  const formulas = entries
    .map((e) => {
      const res = results.get(e.id);
      return res && res.formula ? `${e.name}: ${res.formula}` : null;
    })
    .filter((x): x is string => Boolean(x));
  if (formulas.length) {
    sections.push({
      kind: 'text',
      heading: 'How each score was calculated',
      paragraphs: ['Score = the sum of (weight × your rating) ÷ the sum of (weight × 5), over the criteria you scored for that university.', ...formulas],
    });
  }

  const notes: string[] = [];
  if (input.includeNotes) {
    if (set.notes?.trim()) notes.push(set.notes.trim());
    for (const e of entries) if (e.note?.trim()) notes.push(`${e.name}: ${e.note.trim()}`);
  }
  if (notes.length) sections.push({ kind: 'text', heading: 'Your private notes', paragraphs: notes });

  const sources: ReportLink[] = [];
  for (const e of entries) {
    const x = factOf(e);
    if (x) {
      for (const k of x.rankings) sources.push({ label: k.body, url: k.url });
      if (x.url) sources.push({ label: `${x.name} — official site`, url: x.url });
    } else if (e.official_url) {
      // A profiled entry keeps the official site its profile gave when it was added; a typed-in one, the site the student gave.
      sources.push({ label: e.college_slug ? `${e.name} — official site` : `${e.name} — the site you gave`, url: e.official_url });
    }
  }

  return {
    tool: 'compare-universities',
    toolName: 'Compare Universities',
    title: `Comparison — ${set.label}`,
    subtitle: `${regionName} · ${entries.length} ${entries.length === 1 ? 'university' : 'universities'} · ${criteria.length} ${criteria.length === 1 ? 'criterion' : 'criteria'}`,
    region: set.region,
    regionName,
    generatedAt: now.toISOString(),
    intro: `Up to four universities for ${r?.proseName ?? regionName} side by side: the facts each profile page publishes, then the criteria, weights and scores you gave them.`,
    sections,
    sources: dedupeLinks(sources),
    includesNotes: notes.length > 0,
    fileStem: `globalstudyboard-comparison-${fileSlug(set.label, set.region)}`,
  };
}
