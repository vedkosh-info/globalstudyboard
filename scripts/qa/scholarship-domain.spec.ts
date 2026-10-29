/** Independent pure-domain/report QA. Run with: npx tsx scripts/qa/scholarship-domain.spec.ts */
import assert from 'node:assert/strict';
import { REGION_SLUGS } from '../../lib/regions';
import {
  activeScholarshipTasks, canTransferScholarship, cleanScholarshipNotes, cleanScholarshipText,
  cleanScholarshipUrl, formatScholarshipDue, isScholarshipDate,
  nextScholarshipTask, scholarshipCsv, scholarshipTasksFor,
  SCHOLARSHIP_LIMITS, SCHOLARSHIP_STATUSES, type ScholarshipEntry, type ScholarshipTask,
} from '../../lib/scholarship-tracker';
import { buildScholarshipReport } from '../../lib/reports/scholarship-report';
import { REPORT_FOOTER_LINES, defaultPaperFor } from '../../lib/reports/model';
import { SITE_DISCLAIMER, NON_AFFILIATION_NOTICE } from '../../lib/site-meta';

let checks = 0;
function check(label: string, body: () => void) { body(); checks++; console.log(`PASS ${label}`); }
const stamp = '2026-10-28T08:00:00Z';
function entry(overrides: Partial<ScholarshipEntry> = {}): ScholarshipEntry {
  return { id: 'entry-local', user_id: 'account-private-identifier', name: 'Local award', provider: null,
    official_url: 'https://example.edu/awards', guide_slug: null, cycle: null, region: 'usa',
    application_id: null, status: 'researching', notes: 'PRIVATE NOTE', budget_item_id: null,
    created_at: stamp, updated_at: stamp, ...overrides };
}
function task(overrides: Partial<ScholarshipTask> = {}): ScholarshipTask {
  return { id: 'task-local', user_id: 'account-private-identifier', scholarship_id: 'entry-local',
    title: 'Check requirements', due_on: null, done: false, created_at: stamp, updated_at: stamp, ...overrides };
}

check('real calendar dates and allowed year bounds', () => {
  for (const date of ['2028-02-29', '2026-10-28', '1990-01-01', '2100-12-31']) assert.equal(isScholarshipDate(date), true, date);
  for (const date of ['2026-02-29', '2026-02-30', '2026-13-01', '2026-01-00', '2026-1-01', '1989-12-31', '2101-01-01', '2026-10-28T00:00:00Z', '']) assert.equal(isScholarshipDate(date), false, date);
  assert.equal(formatScholarshipDue(null), 'No date added');
  assert.equal(formatScholarshipDue('2026-02-30'), 'Check the date');
  assert.equal(formatScholarshipDue('2026-10-28'), '28 Oct 2026');
});

check('safe links reject executable schemes, credentials and whitespace', () => {
  for (const url of ['javascript:alert(1)', 'http://example.edu/award', '//example.edu/award', 'https://name:secret@example.edu/award', 'https://name@example.edu/award', 'https://example.edu/a b', 'https://example.edu/\naward', '']) assert.equal(cleanScholarshipUrl(url), '', url);
  assert.equal(cleanScholarshipUrl(' HTTPS://EXAMPLE.EDU/award '), 'https://example.edu/award');
  assert.equal(cleanScholarshipUrl(`https://example.edu/${'a'.repeat(500)}`), '');
});

check('single-line limits and notes preserve useful paragraphs only', () => {
  assert.equal(cleanScholarshipText('  Award\u0000\n\t name  '), 'Award name');
  assert.equal(cleanScholarshipText('1234567', 4), '1234');
  assert.equal(cleanScholarshipNotes('a\r\nb\u0000\tc'), 'a\nb\tc');
  assert.equal(cleanScholarshipNotes('a'.repeat(3000)).length, SCHOLARSHIP_LIMITS.notes);
});

check('only accepted or received awards can be transferred to a budget', () => {
  for (const status of SCHOLARSHIP_STATUSES) assert.equal(canTransferScholarship(entry({ status })), status === 'accepted' || status === 'received', status);
});

check('closed awards do not contribute upcoming or overdue workload', () => {
  const entries = SCHOLARSHIP_STATUSES.map((status, index) => entry({ id: `e-${index}`, status }));
  const tasks = entries.map((e, index) => task({ id: `t-${index}`, scholarship_id: e.id, due_on: '2020-01-01' }));
  const visible = activeScholarshipTasks(entries, tasks, 'usa');
  assert.deepEqual(visible.map(t => entries.find(e => e.id === t.scholarship_id)?.status), ['researching','preparing','submitted','shortlisted','offered','accepted']);
  assert.deepEqual(activeScholarshipTasks(entries, tasks, 'india'), []);
  assert.deepEqual(activeScholarshipTasks(entries, tasks.map(t => ({ ...t, done: true })), 'usa'), []);
});

check('next action ignores done and unrelated tasks and orders dates first', () => {
  const tasks = [task({ id: 'done', due_on: '2026-01-01', done: true }), task({ id: 'undated' }),
    task({ id: 'later', due_on: '2026-12-01' }), task({ id: 'next', due_on: '2026-10-29' }),
    task({ id: 'other', scholarship_id: 'other-entry', due_on: '2026-01-01' })];
  const before = JSON.stringify(tasks);
  assert.equal(nextScholarshipTask(tasks, 'entry-local')?.id, 'next');
  assert.deepEqual(scholarshipTasksFor(tasks, 'entry-local').map(t => t.id), ['next', 'later', 'undated', 'done']);
  assert.equal(JSON.stringify(tasks), before, 'selectors do not mutate input');
  assert.equal(nextScholarshipTask([task({ done: true })], 'entry-local'), undefined);
});

check('CSV formula escaping, optional notes and no account identifiers', () => {
  const e = entry({ name: '=HYPERLINK("https://example.invalid")' });
  const csv = scholarshipCsv([e], [task()], 'usa');
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(!csv.includes('PRIVATE NOTE'));
  assert.ok(!csv.includes('account-private-identifier'));
  assert.ok(!csv.includes('entry-local'));
  assert.ok(scholarshipCsv([e], [task()], 'usa', true).includes('PRIVATE NOTE'));
});

for (const region of REGION_SLUGS) check(`export and report isolate destination ${region}`, () => {
  const otherRegion = region === 'usa' ? 'india' : 'usa';
  const own = entry({ region, name: `Award for ${region}` });
  const foreign = entry({ id: 'other-entry', name: 'OTHER DESTINATION AWARD', region: otherRegion, notes: 'OTHER PRIVATE NOTE', official_url: 'https://other.example.edu/awards' });
  const tasks = [task(), task({ scholarship_id: 'other-entry', title: 'OTHER CHECKLIST ITEM' })];
  const report = buildScholarshipReport({ region, entries: [own, foreign], tasks, includeNotes: false, now: new Date(stamp) });
  const serialized = JSON.stringify(report);
  assert.ok(serialized.includes(`Award for ${region}`));
  for (const secret of ['OTHER DESTINATION', 'OTHER CHECKLIST', 'PRIVATE NOTE', 'other.example.edu', 'account-private-identifier', 'entry-local']) assert.ok(!serialized.includes(secret), secret);
  assert.equal(report.generatedAt, new Date(stamp).toISOString());
  assert.equal(report.sources.length, 1);
  assert.equal(report.includesNotes, false);
  const csv = scholarshipCsv([own, foreign], tasks, region);
  assert.ok(csv.includes(`Award for ${region}`));
  assert.ok(!csv.includes('OTHER DESTINATION'));
  assert.ok(!csv.includes('OTHER CHECKLIST'));
  assert.equal(defaultPaperFor(region), region === 'usa' || region === 'canada' ? 'letter' : 'a4');
});

check('notes require explicit report opt-in and do not cross destinations', () => {
  const report = buildScholarshipReport({ region: 'usa', entries: [entry(), entry({ id: 'foreign', region: 'india', notes: 'FOREIGN NOTE' })], tasks: [], includeNotes: true, now: new Date(stamp) });
  assert.equal(report.includesNotes, true);
  assert.ok(JSON.stringify(report).includes('PRIVATE NOTE'));
  assert.ok(!JSON.stringify(report).includes('FOREIGN NOTE'));
});

check('empty records and unlinked tasks do not fabricate scholarships', () => {
  const report = buildScholarshipReport({ region: 'usa', entries: [], tasks: [task()], includeNotes: true, now: new Date(stamp) });
  assert.equal(report.subtitle, '0 scholarships · 0 checklist items');
  assert.equal(report.sources.length, 0);
  assert.equal(report.includesNotes, false);
});

check('report uses shared exact disclaimer and non-affiliation wording', () => {
  assert.deepEqual(REPORT_FOOTER_LINES, [SITE_DISCLAIMER, NON_AFFILIATION_NOTICE]);
});

console.log(`Independent scholarship domain/report QA: ${checks} checks passed.`);
