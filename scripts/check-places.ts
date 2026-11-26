// Build gate for the university place tree (lib/college-places.ts).
// Fails when a college cannot be placed: a missing or unknown state in a
// country grouped by state, a destination/country mismatch, or two spellings
// of one city. Warnings (a note in brackets inside `city`) do not fail.
import { placeIssues, placeWarnings, publishedPlaces, placeHref } from '../lib/college-places';
import { COLLEGES } from '../lib/colleges';

const issues = placeIssues();
const warnings = placeWarnings();
for (const w of warnings) console.warn(`places:check warning — ${w}`);

// A college slug equal to a place path segment is harmless (different route
// trees), but two published places must never share one URL.
const urls = new Map<string, string>();
for (const p of publishedPlaces()) {
  const href = placeHref(p);
  if (urls.has(href)) issues.push(`Two places resolve to ${href}.`);
  urls.set(href, p.label);
}

if (issues.length > 0) {
  console.error(`places:check FAILED — ${issues.length} problem(s):`);
  for (const i of issues) console.error(`  • ${i}`);
  process.exit(1);
}
console.log(`places:check OK — ${COLLEGES.length} colleges placed; ${publishedPlaces().length} place pages published.`);
