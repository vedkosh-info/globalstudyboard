/**
 * Application Planner → ReportDocument. Pure: rows in, document out.
 *
 * The plan is per DESTINATION, exactly as the planner shows it (§18 "region in
 * context"): `inDestination` decides what belongs — the destination's
 * applications, their items, and the items not tied to a university — the
 * test dates, which belong to no destination and so appear in every
 * destination's plan (named as the planner names them: "Your test dates"). Every
 * date is the student's own entry; the report says so under the table and
 * never adds a deadline of its own (§18 "student-authored data only"). Like
 * the other three reports it addresses the reader as "you".
 */

import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { DATE_RE, PRIORITY_LABEL, STATUS_LABEL, TASK_KIND_LABEL, daysUntil, examForTitle, formatDue, inDestination, todayIso, type ExamOption, type PlannerApplication, type PlannerTask } from '@/lib/planner';
import { DASH, cell, dedupeLinks, fileSlug, hostOf, type Cell, type ReportDocument, type ReportLink, type ReportSection } from '@/lib/reports/model';

export interface PlannerReportInput {
  region: RegionSlug;
  apps: PlannerApplication[];
  tasks: PlannerTask[];
  includeNotes: boolean;
  /**
   * The planner's exam list, when it has loaded — a test date then links its
   * test body's official site, where the date must be confirmed. Without it
   * the report is complete, just without those links.
   */
  exams?: readonly ExamOption[];
  /** Injectable for tests. */
  now?: Date;
}

const compareDue = (a: PlannerTask, b: PlannerTask): number => {
  if (a.due_on && b.due_on) return a.due_on.localeCompare(b.due_on);
  if (a.due_on) return -1;
  if (b.due_on) return 1;
  return a.created_at.localeCompare(b.created_at);
};

function dueCell(t: PlannerTask, today: string): Cell {
  if (!t.due_on) return cell('No date', { muted: true });
  if (!DATE_RE.test(t.due_on)) return cell(String(t.due_on).slice(0, 10), { muted: true }); // never let a malformed value throw
  const n = daysUntil(t.due_on, today);
  const when = n === 0 ? 'today' : n === 1 ? 'tomorrow' : n > 1 ? `in ${n} days` : n === -1 ? '1 day overdue' : `${-n} days overdue`;
  return cell(`${formatDue(t.due_on)} · ${when}`, t.done ? { muted: true } : n < 0 ? { strong: true } : {});
}

export function buildPlannerReport(input: PlannerReportInput): ReportDocument {
  const now = input.now ?? new Date();
  const today = todayIso(now);
  const region = getRegionBySlug(input.region);
  const regionName = region?.displayName ?? input.region;
  const prose = region?.proseName ?? regionName;

  const scope = inDestination(input.apps, input.tasks, input.region);
  const apps = [...scope.apps].sort((a, b) => a.name.localeCompare(b.name));
  const linked = [...scope.linked].sort(compareDue);
  const general = [...scope.general].sort(compareDue);
  const nameOf = new Map(apps.map((a) => [a.id, a.name]));

  const isOverdue = (t: PlannerTask) => !!t.due_on && daysUntil(t.due_on, today) < 0;
  const tally = (items: PlannerTask[]) => {
    const open = items.filter((t) => !t.done);
    const overdue = open.filter(isOverdue).length;
    return `${items.length} (${items.length - open.length} done, ${open.length} open${overdue ? `, ${overdue} overdue` : ''})`;
  };
  // The next open date across BOTH lists, as the planner's Upcoming list and
  // its "Due in 30 days" / "Overdue" counts take them — a test date is part of
  // every destination's plan, so it can be the next thing due. Well-formed
  // dates only: formatDue would throw on anything else.
  const next = [...linked, ...general]
    .filter((t) => !t.done && !!t.due_on && DATE_RE.test(t.due_on) && daysUntil(t.due_on, today) >= 0)
    .sort(compareDue)[0];
  const nextUni = next ? nameOf.get(next.application_id ?? '') : undefined;

  const sections: ReportSection[] = [];

  sections.push({
    kind: 'facts',
    heading: 'At a glance',
    items: [
      { label: 'Destination', value: regionName },
      { label: 'Applications', value: String(apps.length) },
      { label: 'Checklist items', value: tally(linked) },
      ...(general.length ? [{ label: 'Test dates', value: tally(general) }] : []),
      { label: 'Next dated item', value: next && next.due_on ? `${formatDue(next.due_on)} — ${next.title}${nextUni ? ` (${nextUni})` : ''}` : cell('None with a date yet', { muted: true }) },
    ],
  });

  sections.push({
    kind: 'table',
    heading: 'Your shortlist',
    columns: [
      { label: 'University', weight: 2.2 },
      { label: 'Programme', weight: 1.6 },
      { label: 'Intake', weight: 0.9 },
      { label: 'Status', weight: 1 },
      { label: 'Your estimate', weight: 0.9 },
      { label: 'Official site', weight: 1.4 },
    ],
    rows: apps.map((a) => [
      cell(a.name, { strong: true }),
      a.program ?? DASH,
      a.intake ?? DASH,
      STATUS_LABEL[a.status],
      a.priority ? PRIORITY_LABEL[a.priority] : DASH,
      a.official_url ? cell(hostOf(a.official_url), { url: a.official_url }) : DASH,
    ]),
    empty: `No applications for ${prose} yet.`,
    footnote: '“Your estimate” (safe / target / reach) is your own judgement. GlobalStudyBoard never predicts admission.',
  });

  sections.push({
    kind: 'table',
    heading: 'Deadlines and checklist',
    intro: 'Every item and every date below is one you entered, listed soonest first.',
    columns: [
      { label: 'Due', weight: 1.5 },
      { label: 'University', weight: 1.7 },
      { label: 'Item', weight: 2.2 },
      { label: 'Kind', weight: 0.9 },
      { label: 'Done', weight: 0.6 },
    ],
    rows: linked.map((t) => [dueCell(t, today), nameOf.get(t.application_id ?? '') ?? DASH, t.done ? cell(t.title, { muted: true }) : t.title, TASK_KIND_LABEL[t.kind], t.done ? 'Yes' : 'No']),
    empty: 'No checklist items yet.',
    footnote: 'Confirm every deadline and requirement on the official university or examination website before relying on it — they change every year.',
  });

  const exams = input.exams ?? [];
  const testSite = (t: PlannerTask) => examForTitle(t.title, exams);
  // The column appears only when at least one test date has a known official site.
  const siteColumn = general.some((t) => testSite(t)?.url);
  if (general.length) {
    sections.push({
      kind: 'table',
      heading: 'Your test dates',
      intro: 'The test dates and registration deadlines you added, which are not tied to a university. They belong to no single destination, so they appear in your plan for every destination.',
      columns: [
        { label: 'Due', weight: 1.5 },
        { label: 'Item', weight: siteColumn ? 2.6 : 3 },
        { label: 'Kind', weight: siteColumn ? 0.8 : 1 },
        { label: 'Done', weight: 0.6 },
        // Wide enough for a whole host name ("satsuite.collegeboard.org") on one line.
        ...(siteColumn ? [{ label: 'Official site', weight: 2.2 }] : []),
      ],
      rows: general.map((t) => {
        const row: Cell[] = [dueCell(t, today), t.done ? cell(t.title, { muted: true }) : t.title, TASK_KIND_LABEL[t.kind], t.done ? 'Yes' : 'No'];
        if (siteColumn) {
          const url = testSite(t)?.url;
          row.push(url ? cell(hostOf(url), { url }) : DASH);
        }
        return row;
      }),
      footnote: 'Confirm every test date and registration deadline on the official examination website before relying on it — they change every year.',
    });
  }

  const noted = apps.filter((a) => a.notes && a.notes.trim());
  if (input.includeNotes && noted.length) {
    sections.push({
      kind: 'text',
      heading: 'Your private notes',
      paragraphs: noted.map((a) => `${a.name}: ${a.notes?.trim() ?? ''}`),
    });
  }

  const sources: ReportLink[] = dedupeLinks([
    ...apps.filter((a) => a.official_url).map((a) => ({ label: `${a.name} — official site`, url: a.official_url as string })),
    ...general.flatMap((t) => {
      const ex = testSite(t);
      return ex?.url ? [{ label: `${ex.shortName} — official site`, url: ex.url }] : [];
    }),
  ]);

  return {
    tool: 'application-planner',
    toolName: 'Application Planner',
    title: `Application plan — ${regionName}`,
    // Counted as the "At a glance" section counts them: checklist items belong
    // to an application; the test dates (tied to no university) get their own count.
    subtitle: `${apps.length} ${apps.length === 1 ? 'application' : 'applications'} · ${linked.length} checklist ${linked.length === 1 ? 'item' : 'items'}${
      general.length ? ` · ${general.length} ${general.length === 1 ? 'test date' : 'test dates'}` : ''
    }`,
    region: input.region,
    regionName,
    generatedAt: now.toISOString(),
    intro: `The universities you shortlisted for ${prose}, with the status, deadlines, documents and test dates you recorded in the Application Planner.`,
    sections,
    sources,
    includesNotes: input.includeNotes && noted.length > 0,
    fileStem: `globalstudyboard-application-plan-${fileSlug(input.region, 'plan')}`,
  };
}
