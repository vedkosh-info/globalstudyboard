import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resumableFragment } from '../lib/auth-events';
import { scholarshipCatalogue, scholarshipForGuide } from '../lib/scholarship-catalogue';
import { scholarshipTrackerHref } from '../lib/scholarship-options';
import { REGION_SLUGS } from '../lib/regions';
import { TOOLS, TOOLS_INDEX_DESCRIPTION_MAX, toolsIndexDescription } from '../lib/tools';
import { sitemapEntries } from '../lib/sitemap-entries';

let checks = 0;
function check(condition: unknown, message: string): void { assert.ok(condition, message); checks += 1; }

// Public source records cannot include person-level or time-sensitive fields.
const { awards } = scholarshipCatalogue();
check(new Set(awards.map((award) => award.region)).size === REGION_SLUGS.length, 'All nine destinations have an entry point');
check(new Set(awards.map((award) => award.slug)).size === awards.length, 'Canonical guide keys are unique');
check(scholarshipForGuide('scholarships-eu-students') === undefined, 'An overview guide is never turned into a specific award');
for (const award of awards) {
  const href = scholarshipTrackerHref(award);
  const url = new URL(href, 'https://www.globalstudyboard.com');
  check(url.pathname === '/tools/scholarship-tracker' && !url.search, 'One canonical tracker path, no query prefill');
  check(resumableFragment(url.hash) === url.hash, `Prefill survives redirect sign-in: ${award.slug}`);
  check(new URLSearchParams(url.hash.slice(1)).get('region') === award.region, 'Study destination travels with prefill');
  check(Object.keys(award).sort().join(',') === 'guideTitle,name,officialUrl,provider,region,slug,sourceReviewed', 'Only reviewed public identity fields ship');
  check(new URL(award.officialUrl).protocol === 'https:', 'Official programme source is HTTPS');
}

// Shared auth helper is security-sensitive: accept one item and one destination,
// never duplicate keys, encoded extra parameters, personal text or foreign URLs.
const entry = 'a1b2c3d4-1234-4abc-8def-1234567890ab';
const allowed = [
  '#region=usa', '#exam=sat', '#award=chevening-scholarship-guide',
  '#exam=sat&region=usa', '#region=usa&exam=sat',
  '#award=chevening-scholarship-guide&region=uk-ireland',
  '#region=uk-ireland&award=chevening-scholarship-guide',
  `#entry=${entry}`, `#entry=${entry}&region=usa`, `#region=usa&entry=${entry}`,
];
for (const hash of allowed) check(resumableFragment(hash) === hash, `Allowed fragment: ${hash}`);
const rejected = [
  '', '#', '#region=', '#award=', '#entry=123', '#entry=hello',
  '#region=usa&region=india', '#award=one&award=two', '#award=one&exam=sat',
  `#entry=${entry}&award=one`, '#award=one&region=usa&extra=text',
  '#award=one%26region=usa', '#award=My Scholarship', '#award=../../account',
  '#award=https://example.org', '#region=usa?name=student', '#award=one\n',
  '#award=one&region=usa\n', '#exam=sat&region=usa&region=india',
  `#entry=${entry}&entry=${entry}`, `#award=${'a'.repeat(121)}`,
];
for (const hash of rejected) check(resumableFragment(hash) === '', `Rejected fragment: ${JSON.stringify(hash)}`);

const metadata = toolsIndexDescription();
check(metadata.length <= TOOLS_INDEX_DESCRIPTION_MAX, 'All tools fit the index search description');
for (const tool of TOOLS) check(metadata.includes(tool.indexLabel), `Index metadata includes ${tool.slug}`);
const urls = sitemapEntries('static').map((item) => item.url);
check(urls.includes('https://www.globalstudyboard.com/tools/scholarship-tracker'), 'Tracker is in sitemap');
check(!urls.some((url) => url.includes('/tools/scholarship-tracker/report')), 'Private report is absent from sitemap');
const exportRoute = readFileSync('app/api/account/export/route.ts', 'utf8');
for (const table of ['scholarship_entries', 'scholarship_tasks']) check(exportRoute.includes(`.from('${table}')`), `${table} is included in account data download`);
check(exportRoute.includes('scholarship_tracker: { entries: scholarshipEntries, tasks: scholarshipTasks }'), 'Both collections are emitted in account export');

console.log(`Scholarship integration QA: ${checks} checks passed.`);
