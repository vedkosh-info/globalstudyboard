import assert from 'node:assert/strict';
import { PROGRAMMES } from '../lib/application-check-catalogue';
import { getCollegeBySlug } from '../lib/colleges';
import { REGION_SLUGS } from '../lib/regions';
import { parseBand } from '../lib/application-check';

const programmeIds = new Set<string>();
const destinations = new Set<string>();
function officialUrl(value: string) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:');
  assert.ok(!url.username && !url.password && value.length <= 500);
  assert.notEqual(url.pathname, '/', 'Use the specific official page for each check');
}
for (const programme of PROGRAMMES) {
  assert.ok(!programmeIds.has(programme.id), 'Each programme has one identity');
  programmeIds.add(programme.id);
  destinations.add(programme.region);
  assert.match(programme.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  const college = getCollegeBySlug(programme.collegeSlug);
  assert.ok(college, 'The programme links to an existing university');
  assert.equal(college.region, programme.region);
  assert.ok(programme.name.length <= 160 && programme.university.length <= 160);
  assert.ok(programme.intake && programme.intake.length <= 40);
  assert.ok(programme.scope && programme.rules.length > 0);
  officialUrl(programme.officialUrl);
  for (const date of [programme.reviewed, programme.validThrough].filter(Boolean) as string[]) {
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new Date(date).toISOString().slice(0, 10), date);
  }
  assert.ok(!programme.validThrough || programme.validThrough >= programme.reviewed);
  const rules = new Set<string>();
  for (const rule of programme.rules) {
    assert.ok(!rules.has(rule.id), 'Rule identities must be unique inside a programme');
    rules.add(rule.id);
    assert.match(rule.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(rule.action.length > 0 && rule.action.length <= 160);
    assert.ok(rule.title && rule.detail);
    officialUrl(rule.sourceUrl);
    assert.equal(Boolean(rule.ielts), rule.kind === 'ielts');
    assert.equal(Boolean(rule.minimum), rule.kind === 'minimum');
    assert.equal(Boolean(rule.courses), rule.kind === 'courses');
    if (rule.ielts) {
      assert.notEqual(parseBand(String(rule.ielts.overall)), null);
      if (rule.ielts.eachBand !== undefined) {
        assert.notEqual(parseBand(String(rule.ielts.eachBand)), null);
        assert.ok(rule.ielts.eachBand <= rule.ielts.overall);
      }
    }
    if (rule.minimum) assert.ok(Number.isSafeInteger(rule.minimum.value) && rule.minimum.value > 0 && rule.minimum.question && rule.minimum.unit);
    if (rule.courses) {
      assert.ok(rule.courses.options.length && rule.courses.groups.length);
      assert.equal(new Set(rule.courses.options).size, rule.courses.options.length);
      for (const group of rule.courses.groups) assert.ok(group.length && group.every(option => rule.courses!.options.includes(option)));
    }
  }
}
assert.deepEqual([...destinations].sort(), [...REGION_SLUGS].sort(), 'Every destination has reviewed pilot coverage');
console.log('Application Check catalogue valid — ' + PROGRAMMES.length + ' programmes across ' + destinations.size + ' destinations.');
