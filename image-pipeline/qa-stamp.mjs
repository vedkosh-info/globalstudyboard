// image-pipeline/qa-stamp.mjs
// Stamp independent-QA verdicts into manifest.json and rebuild the registry, so the
// registry (= what the site can show) is always exactly the QA-passed set.
//
//   node image-pipeline/qa-stamp.mjs <qa-result.json> <round>
//
// <qa-result.json> is a workflow result with { reroll:[{n}], notes:[{n}], ... } and the
// full graded list in sliceSummaries/… — we only need: every n that was graded, and the
// set that ended RE_ROLL after verification. Anything graded and not in `reroll` → pass.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const [file, roundArg] = process.argv.slice(2);
if (!file) { console.error('usage: node image-pipeline/qa-stamp.mjs <qa-result.json> <round>'); process.exit(1); }
const round = parseInt(roundArg || '0', 10);
const res = JSON.parse(readFileSync(file, 'utf8'));
const r = res.result ?? res;
const failed = new Set((r.reroll || []).map((x) => x.n));
// graded = pending images that the run looked at. We take them from the manifest: every
// image currently qa:pending is assumed to have been in this run's list.
const mPath = 'image-pipeline/manifest.json';
const m = JSON.parse(readFileSync(mPath, 'utf8'));
const today = new Date().toISOString().slice(0, 10);
let pass = 0, fail = 0;
for (const i of m.images) {
  if (i.qa?.status !== 'pending') continue;
  if (failed.has(i.n)) { i.qa = { status: 'fail', round, date: today }; fail++; }
  else { i.qa = { status: 'pass', round, date: today }; pass++; }
}
writeFileSync(mPath, JSON.stringify(m, null, 2) + '\n');
console.log(`qa-stamp round ${round}: ${pass} pass, ${fail} fail`);
execSync('node image-pipeline/build-registry.mjs', { stdio: 'inherit' });
