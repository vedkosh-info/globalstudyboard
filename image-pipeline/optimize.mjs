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
//   name.avif      1400×788  hero  target ≤ 45 KB, ceiling 100 KB   (primary)
//   name.webp      1400×788  hero  target ≤ 85 KB, ceiling 180 KB   (no-AVIF fallback)
//   name-sm.avif    560×315  card  target ≤ 14 KB, ceiling  30 KB
//   name-sm.webp    560×315  card  target ≤ 24 KB, ceiling  45 KB
// All four are a centred 16:9 cover-crop, whatever ratio the API actually returned.
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
// TWO TIERS (decided 12 Sep 2026 after the first full run): 74% of scenes hit the
// target at q46; the rest are high-entropy exteriors (foliage on brick, cobbles,
// autumn leaves) that no quality setting brings under 45 KB without wrecking the very
// texture that makes them read as real. Those get ONE modest quality step (q46 → q40)
// and a hard ceiling. Over the ceiling at q40 = the composition is too busy → re-roll,
// never crush.
const TARGET  = { hero_avif: 45,  hero_webp: 85,  card_avif: 14, card_webp: 24 };
const CEILING = { hero_avif: 100, hero_webp: 180, card_avif: 30, card_webp: 45 };
const STEP_Q  = 6; // q46 → q40 (AVIF); webp steps the same amount

const KB = (n) => (n / 1024).toFixed(1) + ' KB';
const size = (p) => { try { return statSync(p).size; } catch { return 0; } };
const walk = (dir) => readdirSync(dir).flatMap((e) => {
  const p = join(dir, e);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

if (!existsSync(ROOT)) { console.error(`No ${ROOT}/ — nothing to do.`); process.exit(1); }
const pngs = walk(ROOT).filter((f) => extname(f).toLowerCase() === '.png' && !f.endsWith('-sm.png'));
if (!pngs.length) { console.log(`No .png files under ${ROOT}/ yet. Generate first, then re-run.`); process.exit(0); }

let inTot = 0, outTot = 0, over = 0, tier2 = 0, tier3 = 0;
const flagged = [];

for (const png of pngs) {
  const inSize = size(png); inTot += inSize;
  const base = png.replace(/\.png$/i, '');
  const meta = await sharp(png).metadata();

  // Every variant is forced to exactly 16:9 with a centred cover-crop. The API's
  // aspectRatio is silently ignored in known open bugs, so a 4:3 or 1:1 source would
  // otherwise become a taller-than-16:9 hero — a visual one-off against §15.2 and a
  // CLS trap. Cropping an archetype we generated ourselves carries no licence concern.
  // Encode one variant; if over TARGET at the base quality, retry once at a lower
  // quality; report which tier it landed in. Returns [avifBytes, webpBytes, tier].
  const enc = async (w, suffix, kind) => {
    const width = Math.min(meta.width || w, w);
    const height = Math.round((width * 9) / 16);
    const fit = { width, height, fit: 'cover', position: 'centre', withoutEnlargement: true };
    const avifOut = `${base}${suffix}.avif`, webpOut = `${base}${suffix}.webp`;
    // Tier 1 = base quality. Tier 2 = one step down if over TARGET. Tier 3 = a second
    // step down only if STILL over the hard CEILING (a busy exterior that lands a few
    // KB over is a rounding case, not a composition failure). Still over at tier 3 →
    // the image is genuinely too busy for a hero → re-roll.
    const steps = [[AVIF_Q, WEBP_Q], [AVIF_Q - STEP_Q, WEBP_Q - STEP_Q], [AVIF_Q - 2 * STEP_Q, WEBP_Q - 2 * STEP_Q]];
    let tier = 1;
    for (let t = 0; t < steps.length; t++) {
      const [aq, wq] = steps[t];
      await sharp(png).resize(fit).avif({ quality: aq, effort: 6 }).toFile(avifOut);
      await sharp(png).resize(fit).webp({ quality: wq }).toFile(webpOut);
      const kb = size(avifOut) / 1024;
      tier = t + 1;
      if (kb <= TARGET[`${kind}_avif`]) break;                 // hit target — stop
      if (t === 1 && kb <= CEILING[`${kind}_avif`]) break;     // tier 2 within ceiling — good enough
    }
    return [size(avifOut), size(webpOut), tier];
  };

  const [ha, hw, ht] = await enc(HERO_W, '', 'hero');
  const [ca, cw, ct] = await enc(CARD_W, '-sm', 'card');
  outTot += ha + hw + ca + cw;
  if (ht >= 2 || ct >= 2) tier2++;
  if (ht === 3 || ct === 3) tier3++;

  const bad = [];
  if (ha / 1024 > CEILING.hero_avif) bad.push(`hero.avif ${KB(ha)}`);
  if (hw / 1024 > CEILING.hero_webp) bad.push(`hero.webp ${KB(hw)}`);
  if (ca / 1024 > CEILING.card_avif) bad.push(`card.avif ${KB(ca)}`);
  if (cw / 1024 > CEILING.card_webp) bad.push(`card.webp ${KB(cw)}`);
  if (bad.length) { over++; flagged.push(`${png.replace(ROOT + '/', '')} — ${bad.join(', ')}`); }

  const rel = png.replace(ROOT + '/', '');
  const mark = bad.length ? '✗' : (ht === 3 || ct === 3) ? '³' : (ht === 2 || ct === 2) ? '²' : ' ';
  console.log(`${mark} ${rel.padEnd(50)} hero ${KB(ha).padStart(9)}/${KB(hw).padStart(9)}   card ${KB(ca).padStart(8)}/${KB(cw).padStart(8)}`);
  if (STRIP) unlinkSync(png);
}

console.log('\n' + '-'.repeat(96));
console.log(`${pngs.length} images  |  PNG sources ${KB(inTot)}  →  shipped (4 variants each) ${KB(outTot)}`);
console.log(`Avg shipped per image ${KB(outTot / pngs.length)}  |  a page loads ONE hero + lazy cards, not the whole set.`);
console.log(`Tier 1 (≤ target at q${AVIF_Q}): ${pngs.length - tier2}   |   Tier 2 (q${AVIF_Q - STEP_Q}): ${tier2 - tier3}   |   Tier 3 (q${AVIF_Q - 2 * STEP_Q}, rounding cases): ${tier3}`);
if (over) {
  console.log(`\n✗ ${over} image(s) OVER THE HARD CEILING even at q${AVIF_Q - 2 * STEP_Q} — too busy for a hero; re-roll a calmer composition:`);
  flagged.forEach((f) => console.log(`   ${f}`));
  process.exitCode = 1; // fail the step so an over-ceiling batch cannot ship silently
} else {
  console.log('\n✓ every image within its tier ceiling.');
}
if (!STRIP) console.log('Kept source PNGs (keep them OUT of git — see .gitignore).');
