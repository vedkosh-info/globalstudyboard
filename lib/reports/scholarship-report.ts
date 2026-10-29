/** One student-authored report model for HTML, print and browser PDF. */
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { SCHOLARSHIP_STATUS_LABEL, SCHOLARSHIP_VERIFY, formatScholarshipDue, scholarshipTasksFor, type ScholarshipEntry, type ScholarshipTask } from '@/lib/scholarship-tracker';
import { cell, DASH, dedupeLinks, hostOf, type ReportDocument, type ReportSection } from '@/lib/reports/model';

export interface ScholarshipReportInput {
  region: RegionSlug;
  entries: readonly ScholarshipEntry[];
  tasks: readonly ScholarshipTask[];
  includeNotes: boolean;
  now?: Date;
}

export function buildScholarshipReport(input: ScholarshipReportInput): ReportDocument {
  const regionName = getRegionBySlug(input.region)?.displayName ?? input.region;
  const entries = input.entries.filter((e) => e.region === input.region).sort((a, b) => a.name.localeCompare(b.name));
  const ids = new Set(entries.map((e) => e.id));
  const tasks = input.tasks.filter((t) => ids.has(t.scholarship_id));
  const sections: ReportSection[] = [{
    kind: 'facts', heading: 'At a glance', items: [
      { label: 'Destination', value: regionName },
      { label: 'Scholarships tracked', value: String(entries.length) },
      { label: 'Checklist', value: `${tasks.filter((t) => t.done).length} of ${tasks.length} items marked done` },
    ],
  }, { kind: 'callout', text: SCHOLARSHIP_VERIFY }, {
    kind: 'table', heading: 'Your scholarships',
    columns: [{ label: 'Scholarship', weight: 2.2 }, { label: 'Provider / cycle', weight: 1.8 }, { label: 'Your status', weight: 1.3 }, { label: 'Programme link', weight: 1.6 }],
    rows: entries.map((e) => [cell(e.name, { strong: true }), [e.provider, e.cycle].filter(Boolean).join(' · ') || DASH, SCHOLARSHIP_STATUS_LABEL[e.status], e.official_url ? cell(hostOf(e.official_url), { url: e.official_url }) : DASH]),
    empty: 'No scholarships saved for this destination yet.',
    footnote: 'Statuses are your own records. An offered or accepted award is not a receipt of funds or a guarantee of payment.',
  }, {
    kind: 'table', heading: 'Your checklist and dates',
    columns: [{ label: 'Scholarship', weight: 1.7 }, { label: 'Item', weight: 2.6 }, { label: 'Your due date', weight: 1.3 }, { label: 'Done', weight: 0.6 }],
    rows: entries.flatMap((e) => scholarshipTasksFor(tasks, e.id).map((t) => [e.name, t.title, formatScholarshipDue(t.due_on), t.done ? 'Yes' : 'No'])),
    empty: 'No checklist items recorded.', footnote: 'All dates were entered by you. Confirm the exact closing time and time zone with the provider.',
  }];
  const notes = input.includeNotes ? entries.filter((e) => e.notes?.trim()).map((e) => `${e.name}: ${e.notes!.trim()}`) : [];
  if (notes.length) sections.push({ kind: 'text', heading: 'Your private notes', paragraphs: notes });
  return {
    tool: 'scholarship-tracker', toolName: 'Scholarship Application Tracker', title: `Scholarship plan — ${regionName}`,
    subtitle: `${entries.length} ${entries.length === 1 ? 'scholarship' : 'scholarships'} · ${tasks.length} checklist ${tasks.length === 1 ? 'item' : 'items'}`,
    region: input.region, regionName, generatedAt: (input.now ?? new Date()).toISOString(),
    intro: 'The scholarships, progress and next steps you recorded. This is your personal plan, not an eligibility assessment or an award confirmation.',
    sections, sources: dedupeLinks(entries.flatMap((e) => e.official_url ? [{ label: `${e.name} — programme link you recorded`, url: e.official_url }] : [])),
    includesNotes: notes.length > 0, fileStem: `globalstudyboard-scholarships-${input.region}`,
  };
}
