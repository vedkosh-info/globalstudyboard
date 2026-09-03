// image-pipeline/optimize.mjs
// Batch-optimise the Gemini PNGs in public/images/ → tiny AVIF (+ WebP fallback),
// at TWO widths so a 400px card never downloads a 1400px hero.
//
//   npm i -D sharp
//   node image-pipeline/optimize.mjs                # encode all PNGs, keep sources
//   node image-pipeline/optimize.mjs --strip-png    # ...and delete the source PNGs
//   node image-pipeline/optimize.mjs --q 46         # tune AVIF quality (lower = smaller)
//
// Emits, beside each name.png:
//   name.avif      1400w  hero      target ≤ 45 KB   (primary)
//   name.webp      1400w  hero      target ≤ 85 KB   (fallback for no-AVIF browsers)
//   name-sm.avif    560w  card      target ≤ 14 KB
//   name-sm.webp    560w  card      target ≤ 24 KB
//
// Anything over budget is flagged ⚠ so it can be re-encoded or re-rolled — that is the
// guard that keeps the site light as the library grows.

import { readdirSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ROOT = 'public/images';
const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const HERO_W = parseInt(arg('--hero', '1400'), 10);
const CARD_W = parseInt(arg('--card', '560'), 10);
const AVIF_Q = parseInt(arg('--q', '46'), 10);
const WEBP_Q = parseInt(arg('--webp', '72'), 10);
const STRIP = process.argv.includes('--strip-png');

// KB budgets — the "don't make the project heavy" contract, enforced not hoped.
const BUDGET = { hero_avif: 45, hero_webp: 85, card_avif: 14, card_webp: 24 };

const KB = (n) => (n / 1024).toFixed(1) + ' KB';
const size = (p) => { try { return statSync(p).size; } catch { return 0; } };
const walk = (dir) => readdirSync(dir).flatMap((e) => {
  const p = join(dir, e);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

if (!existsSync(ROOT)) { console.error(`No ${ROOT}/ — nothing to do.`); process.exit(1); }
const pngs = walk(ROOT).filter((f) => extname(f).toLowerCase() === '.png' && !f.endsWith('-sm.png'));
if (!pngs.length) { console.log(`No .png files under ${ROOT}/ yet. Generate first, then re-run.`); process.exit(0); }

let inTot = 0, outTot = 0, over = 0;
const flagged = [];

for (const png of pngs) {
  const inSize = size(png); inTot += inSize;
  const base = png.replace(/\.png$/i, '');
  const meta = await sharp(png).metadata();

  const enc = async (w, suffix) => {
    const width = Math.min(meta.width || w, w);
    await sharp(png).resize({ width, withoutEnlargement: true }).avif({ quality: AVIF_Q, effort: 6 }).toFile(`${base}${suffix}.avif`);
    await sharp(png).resize({ width, withoutEnlargement: true }).webp({ quality: WEBP_Q }).toFile(`${base}${suffix}.webp`);
    return [size(`${base}${suffix}.avif`), size(`${base}${suffix}.webp`)];
  };

  const [ha, hw] = await enc(HERO_W, '');
  const [ca, cw] = await enc(CARD_W, '-sm');
  outTot += ha + hw + ca + cw;

  const bad = [];
  if (ha / 1024 > BUDGET.hero_avif) bad.push(`hero.avif ${KB(ha)}`);
  if (hw / 1024 > BUDGET.hero_webp) bad.push(`hero.webp ${KB(hw)}`);
  if (ca / 1024 > BUDGET.card_avif) bad.push(`card.avif ${KB(ca)}`);
  if (cw / 1024 > BUDGET.card_webp) bad.push(`card.webp ${KB(cw)}`);
  if (bad.length) { over++; flagged.push(`${png.replace(ROOT + '/', '')} — ${bad.join(', ')}`); }

  const rel = png.replace(ROOT + '/', '');
  console.log(`${bad.length ? '⚠' : ' '} ${rel.padEnd(50)} hero ${KB(ha).padStart(9)}/${KB(hw).padStart(9)}   card ${KB(ca).padStart(8)}/${KB(cw).padStart(8)}`);
  if (STRIP) unlinkSync(png);
}

console.log('\n' + '-'.repeat(96));
console.log(`${pngs.length} images  |  PNG sources ${KB(inTot)}  →  shipped (4 variants each) ${KB(outTot)}`);
console.log(`Avg shipped per image ${KB(outTot / pngs.length)}  |  a page loads ONE hero + lazy cards, not the whole set.`);
if (over) {
  console.log(`\n⚠ ${over} image(s) OVER BUDGET — re-encode with a lower --q, or re-roll a busier composition:`);
  flagged.forEach((f) => console.log(`   ${f}`));
  process.exitCode = 1; // fail the step so an over-budget batch cannot ship silently
} else {
  console.log('\n✓ every image within budget.');
}
if (!STRIP) console.log('Kept source PNGs (keep them OUT of git — see .gitignore).');
