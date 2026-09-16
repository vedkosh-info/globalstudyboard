// image-pipeline/reroll.mjs
// Regenerate the images an independent QA pass rejected, with the reviewer's prompt
// fix baked into manifest.json (so the manifest stays the truthful record of what was
// asked for), then re-optimise + re-register only those images.
//
//   node image-pipeline/reroll.mjs image-pipeline/rerolls.json          # do it
//   node image-pipeline/reroll.mjs image-pipeline/rerolls.json --dry    # show prompts only
//
// rerolls.json = [{ n, key, reason, promptFix }] or [{ n, key, reason, scene, alt }] (scene REPLACES). Each entry's promptFix is appended to
// the image's prompt as a "CORRECTION:" clause AFTER the scene text and BEFORE the shared
// style tail, and the entry is stamped `rerolled: [{date, reason}]` for the audit log.

import './env.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname } from 'node:path';
import { execSync } from 'node:child_process';

const file = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!file || !existsSync(file)) { console.error('usage: node image-pipeline/reroll.mjs <rerolls.json> [--dry]'); process.exit(1); }

const rerolls = JSON.parse(readFileSync(file, 'utf8'));
const mPath = 'image-pipeline/manifest.json';
const manifest = JSON.parse(readFileSync(mPath, 'utf8'));
const TAIL = manifest.styleTail;
const ABSTRACT_TAIL = manifest.abstractTail;
const today = new Date().toISOString().slice(0, 10);

// Systematic lesson from the Phase-1 QA: the model fails on PRODUCTS and TECHNICAL
// EQUIPMENT (brand imprints, pseudo-text on labels/spines/screens, invented instruments).
// Every re-roll gets this class-level guard in addition to its specific fix.
const CLASS_GUARD =
  'Every manufactured object in frame is completely unbranded and unlabelled — no printed marks, ' +
  'logos, model names, stickers or lettering of any kind on pens, pencils, highlighters, books, ' +
  'book spines, boxes, bottles, instruments, screens or bezels; screens are switched off or show ' +
  'only a soft featureless glow; any equipment is simple, real and generic, shown at a distance or ' +
  'softly out of focus rather than as an invented close-up. No human figures, mannequins, ' +
  'silhouettes, anatomical illustrations or posters depicting people anywhere in the frame.';

let changed = 0;
for (const r of rerolls) {
  const img = manifest.images.find((i) => i.n === r.n);
  if (!img) { console.error(`#${r.n} not in manifest — skipped`); continue; }
  const tail = img.abstract ? ABSTRACT_TAIL : TAIL;
  const idx = img.prompt.indexOf(tail);
  const scene = idx > -1 ? img.prompt.slice(0, idx).trimEnd() : img.prompt.trimEnd();
  const fix = String(r.promptFix || '').trim();
  const hasGuard = img.prompt.includes('Every manufactured object in frame is completely unbranded');
  const correction = ` CORRECTION (post-QA ${today}): ${hasGuard ? '' : CLASS_GUARD + ' '}${fix}`.replace(/:\s+$/, ': (no additional clause)');
  // Two modes:
  //   promptFix  → append a correction to the existing scene (round-2 style)
  //   scene      → REPLACE the scene text entirely. Used when an object CLASS keeps failing
  //                on fresh draws (keyboards, glasses, glassware, globes, bubble grids…) —
  //                the honest fix is a composition without that object, not another plea.
  //                A replaced scene MUST come with a new `alt` (Rule A: the caption
  //                describes what is shown).
  if (!r.scene && img.pendingScene && img.pendingScene.alt) { r.scene = null; r.alt = img.pendingScene.alt; } // resume a parked rewrite: prompt already holds the scene
  if (r.scene) {
    if (!r.alt) { console.error(`#${r.n}: a replaced scene requires a new alt`); process.exit(1); }
    img.prompt = `${String(r.scene).trim()}${correction}\n\n${tail}`;
    // Do NOT touch img.alt yet — the caption must never describe a scene that has not been
    // generated (Rule A). Stage it; it is promoted below only if generate succeeds for this n.
    img.pendingScene = { alt: String(r.alt).trim(), date: today, reason: r.reason };
  } else {
    img.prompt = idx > -1 ? `${scene}${correction}\n\n${tail}` : `${scene}${correction}`;
  }
  img.rerolled = [...(img.rerolled || []), { date: today, reason: r.reason }];
  changed++;
  if (DRY) console.log(`\n#${r.n} ${img.publicUrl}\n${img.prompt.slice(0, 900)}…\n`);
}
if (DRY) { console.log(`${changed} prompt(s) would be updated (dry run — nothing written).`); process.exit(0); }

writeFileSync(mPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest.json: ${changed} prompt(s) corrected + stamped.`);

const ns = rerolls.map((r) => r.n).join(',');
console.log(`\n→ generate --only ${ns} --force`);
execSync(`node image-pipeline/generate.mjs --only ${ns} --force`, { stdio: 'inherit' });

// Promote staged alts ONLY for images that actually came back; leave the rest parked so a
// cap/quota failure can never leave a caption ahead of its image.
let promoted = 0, parked = 0;
for (const r of rerolls) {
  const img = manifest.images.find((i) => i.n === r.n); if (!img?.pendingScene) continue;
  const png = img.path.replace(/\.webp$/i, '.png');
  if (existsSync(png)) { img.alt = img.pendingScene.alt; img.sceneRewritten = [...(img.sceneRewritten || []), { date: today, reason: r.reason }]; delete img.pendingScene; promoted++; }
  else parked++;
}
// Every image that actually regenerated is unverified again → qa pending (gated out of the
// registry) until an independent QA pass stamps it via image-pipeline/qa-stamp.mjs.
for (const r of rerolls) {
  const img = manifest.images.find((i) => i.n === r.n); if (!img) continue;
  if (existsSync(img.path.replace(/\.webp$/i, '.png'))) img.qa = { status: 'pending', date: today, note: 'regenerated — awaiting independent QA' };
}
writeFileSync(mPath, JSON.stringify(manifest, null, 2) + '\n');
if (promoted || parked) console.log(`\nalts: ${promoted} promoted (generated), ${parked} left parked (not generated)`);

console.log('\n→ optimize (only the new PNGs are present under public/images)');
let overBudget = false;
try { execSync('node image-pipeline/optimize.mjs', { stdio: 'inherit' }); }
catch { overBudget = true; } // optimize exits 1 when an image is over its ceiling — still archive, then stop

console.log('\n→ archive new sources to image-pipeline/raw/');
for (const r of rerolls) {
  const img = manifest.images.find((i) => i.n === r.n); if (!img) continue;
  const png = img.path.replace(/\.webp$/i, '.png');
  const raw = png.replace(/^public\/images\//, 'image-pipeline/raw/');
  if (existsSync(png)) { mkdirSync(dirname(raw), { recursive: true }); renameSync(png, raw); }
}

if (overBudget) {
  console.log('\n✗ STOPPED before build-registry: an image is over its size ceiling (see above).');
  console.log('  Re-roll that one with a calmer composition, then re-run optimize + build-registry.');
  process.exit(1);
}
console.log('\n→ build-registry');
execSync('node image-pipeline/build-registry.mjs', { stdio: 'inherit' });
console.log(`\nDone. Re-rolled ${changed}. Next: re-QA these ${changed}, then npm run build.`);
