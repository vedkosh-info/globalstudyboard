// image-pipeline/reroll-resume.mjs
// Resume a re-roll whose generation was blocked (spend cap / quota) AFTER the manifest was
// already stamped with the corrected prompts. Generates only the listed #s, promotes any
// parked alt for images that came back, then optimises + archives + re-registers.
//
//   node image-pipeline/reroll-resume.mjs 63,74,76,...
import './env.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import { execSync } from 'node:child_process';

const ns = (process.argv[2] || '').split(',').map((s) => parseInt(s, 10)).filter(Boolean);
if (!ns.length) { console.error('usage: node image-pipeline/reroll-resume.mjs 1,2,3'); process.exit(1); }
const mPath = 'image-pipeline/manifest.json';
const manifest = JSON.parse(readFileSync(mPath, 'utf8'));
const today = new Date().toISOString().slice(0, 10);

console.log(`→ generate --only ${ns.join(',')} --force`);
execSync(`node image-pipeline/generate.mjs --only ${ns.join(',')} --force`, { stdio: 'inherit' });

let promoted = 0, parked = 0;
for (const n of ns) {
  const img = manifest.images.find((i) => i.n === n); if (!img) continue;
  const png = img.path.replace(/\.webp$/i, '.png');
  if (!existsSync(png)) { if (img.pendingScene) parked++; continue; }
  img.qa = { status: 'pending', date: today, note: 'regenerated — awaiting independent QA' };
  if (img.pendingScene) {
    const prompt = img.pendingScene.prompt; // an earlier park may hold the full prompt
    if (prompt && img.prompt !== prompt) img.prompt = prompt;
    img.alt = img.pendingScene.alt;
    img.sceneRewritten = [...(img.sceneRewritten || []), { date: today, reason: img.pendingScene.reason || img.pendingScene.note || 'resumed' }];
    delete img.pendingScene; promoted++;
  }
}
writeFileSync(mPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`alts: ${promoted} promoted, ${parked} still parked`);

let overBudget = false;
try { execSync('node image-pipeline/optimize.mjs', { stdio: 'inherit' }); } catch { overBudget = true; }

for (const n of ns) {
  const img = manifest.images.find((i) => i.n === n); if (!img) continue;
  const png = img.path.replace(/\.webp$/i, '.png');
  const raw = png.replace(/^public\/images\//, 'image-pipeline/raw/');
  if (existsSync(png)) { mkdirSync(dirname(raw), { recursive: true }); renameSync(png, raw); }
}
if (overBudget) { console.log('\n✗ an image is over its size ceiling — fix, then build-registry.'); process.exit(1); }
execSync('node image-pipeline/build-registry.mjs', { stdio: 'inherit' });
console.log('\nDone.');
