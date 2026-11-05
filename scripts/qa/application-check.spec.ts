import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  evaluateCheck, matchingProgrammes, nextActions, evidenceCurrent, lowestReportedBand, parseBand,
  type CheckProgramme,
} from '../../lib/application-check';

const date = '2026-11-04';
const sourceUrl = 'https://example.edu/courses?programme=science';
const template = { title: 'Example', detail: 'Published rule', sourceUrl, action: 'Check the official programme page' };
const course: CheckProgramme = {
  id: 'example-science', collegeSlug: 'example', university: 'Example University', name: 'Applied Science',
  region: 'canada', officialUrl: sourceUrl, scope: 'Synthetic fixture', intake: '2027', reviewed: date,
  rules: [
    { ...template, id: 'statement', kind: 'prepare' },
    { ...template, id: 'degree', kind: 'confirm' },
    { ...template, id: 'language', kind: 'ielts', ielts: { overall: 7, eachBand: 6.5 } },
    { ...template, id: 'experience', kind: 'minimum', minimum: { value: 60, unit: 'months', question: 'How many qualifying months?' } },
    { ...template, id: 'courses', kind: 'courses', courses: {options: ['Maths', 'Programming', 'Statistics'], groups: [['Programming'], ['Maths', 'Statistics']]} },
  ],
};
const evaluate = (overall = '', lowest = '') => evaluateCheck(course, { statement: 'ready', degree: 'ready' }, { overall, lowest }, date);

test('a URL matches the exact programme and destination, including an identity-bearing query', () => {
  assert.equal(matchingProgrammes([course], 'canada', sourceUrl + '&utm_medium=link#apply')[0], course);
  for (const url of [sourceUrl.replace('science','law'), sourceUrl.replace('edu','edu.evil.invalid'), sourceUrl.replace('//','//user@'), sourceUrl.replace('https:','http:')]) {
    assert.deepEqual(matchingProgrammes([course], 'canada', url), []);
  }
  assert.deepEqual(matchingProgrammes([course], 'india', sourceUrl), []);
  assert.deepEqual(matchingProgrammes([course], 'canada', 'science EXAMPLE'), [course]);
});

test('a stale review, invalid date or ended intake never produces a match', () => {
  assert.ok(evidenceCurrent(course, '2027-02-02'));
  for (const day of ['2026-11-03', '2027-02-03', '2026-11-31', '']) assert.equal(evidenceCurrent(course, day), false);
  assert.equal(evidenceCurrent({ ...course, validThrough: date }, '2026-11-05'), false);
  assert.ok(evaluateCheck(course, { statement: 'ready' }, {overall:'9',lowest:'9'}, '2027-03-01').every(x => x.status === 'confirm'));
});

test('a saved document is self-reported; an academic equivalence cannot be self-certified', () => {
  const result = evaluate();
  assert.equal(result[0].status, 'ready');
  assert.equal(result[1].status, 'confirm');
  assert.equal(result[2].status, 'unknown');
});

test('IELTS uses one valid Academic attempt and all applicable band thresholds', () => {
  assert.equal(evaluate('7')[2].status, 'unknown');
  assert.equal(evaluate('7','6')[2].status, 'todo');
  assert.match(evaluate('7','6')[2].message, /reaches the 7.0 minimum.*skill band is 6.0.*at least 6.5/);
  assert.equal(evaluate('7','6.5')[2].status, 'ready');
  assert.equal(evaluate('6.5','6.5')[2].status, 'todo');
  assert.equal(evaluate('7','8')[2].status, 'unknown');
  assert.equal(evaluate('9','4')[2].status, 'unknown');
  for (const invalid of ['', 'B2', '7.25', '9.5', '7/9', '-1', 'Infinity']) assert.equal(parseBand(invalid), null);
});

test('a lowest section band needs four distinct, recognisable sections from the same attempt', () => {
  const rows = ['Reading', ' Writing ', 'Listening', 'Speaking'].map((label, i) => ({ label, value: i === 3 ? '6' : '7' }));
  assert.equal(lowestReportedBand(rows), '6');
  assert.equal(lowestReportedBand(rows.slice(0,3)), '');
  assert.equal(lowestReportedBand([...rows, rows[0]]), '');
  assert.equal(lowestReportedBand([...rows.slice(0,3), {label:'Speaking', value:'pending'}]), '');
});

test('course alternatives satisfy exactly one group and incomplete answers remain unresolved', () => {
  const check = (courses: string[]) => evaluateCheck(course, {}, {overall:'', lowest:''}, date, {courses: {courses}})[4];
  assert.equal(check(['Maths', 'Statistics']).status, 'unknown');
  assert.match(check(['Maths']).message, /Programming/);
  assert.equal(check(['Statistics','Programming']).status, 'ready');
  assert.equal(check(['Maths','Programming']).status, 'ready');
  assert.equal(check(['none']).status, 'unknown');
});

test('qualifying experience is compared in whole months and the first action reflects a known shortfall', () => {
  const check = (value: string) => evaluateCheck(course, {}, {overall:'',lowest:''}, date, {quantities:{experience:value}});
  assert.equal(check('0')[3].status,'todo');
  assert.match(check('57')[3].message,/3 months below/);
  assert.equal(check('60')[3].status,'ready');
  assert.equal(check('')[3].status,'unknown');
  assert.equal(check('5 years')[3].status,'unknown');
  const actions = nextActions(check('57'));
  assert.equal(actions[0].rule.id,'experience');
  assert.equal(actions.length,3);
  assert.ok(!nextActions(evaluate('7','6.5')).some(result => result.status === 'ready'));
});
