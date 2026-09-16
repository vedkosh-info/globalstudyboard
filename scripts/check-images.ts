// scripts/check-images.ts — prebuild gate for the image library.
//
// lib/images.generated.ts is a COMMITTED artifact written only by
// image-pipeline/build-registry.mjs; `next build` and `tsc` only ever see string
// literals in it, so a deleted / renamed / re-captioned image would otherwise ship as
// a 404 <img> or a stale alt. This runs automatically before every build (package.json
// "prebuild") and fails it on:
//   1. a registry entry whose files are missing on disk (stale registry)
//   2. an optimised image on disk that is NOT in the registry (forgot to regenerate)
//   3. a registry alt that differs from manifest.json (re-captioned without regenerating)
//   4. Rule A: an alt text that names a real institution — every image is an archetype
//      and must never be captioned as a specific named campus.
// fs-only, no sharp, no network — fast enough to run on every build.

import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { IMAGE_REGISTRY } from '../lib/images.generated';
import { COLLEGES } from '../lib/colleges';

const ROOT = 'public/images';
const problems: string[] = [];

// ---- 1 + 3: every registry entry exists on disk and matches the manifest ----------
const manifest = JSON.parse(readFileSync('image-pipeline/manifest.json', 'utf8')) as {
  images: { publicUrl: string; alt: string; qa?: { status: string } }[];
};
const manifestAlt = new Map(
  manifest.images.map((i) => [i.publicUrl.replace(/^\/images\//, '').replace(/\.webp$/i, ''), i.alt.trim()])
);
const manifestQa = new Map(
  manifest.images.map((i) => [i.publicUrl.replace(/^\/images\//, '').replace(/\.webp$/i, ''), i.qa?.status ?? 'pending'])
);
let gatedOnDisk = 0;

for (const [key, e] of Object.entries(IMAGE_REGISTRY)) {
  for (const f of [e.src, e.srcWebp, e.srcSm, e.srcSmWebp]) {
    if (!existsSync(join('public', f))) problems.push(`STALE registry: ${key} → ${f} is not on disk`);
  }
  const m = manifestAlt.get(key);
  if (m === undefined) problems.push(`STALE registry: ${key} has no manifest.json entry`);
  else if (m !== e.alt) problems.push(`STALE alt: ${key} — manifest says "${m.slice(0, 60)}…"`);
}

// ---- 2: every complete image on disk is in the registry ---------------------------
const walk = (d: string): string[] =>
  existsSync(d)
    ? readdirSync(d).flatMap((n) => {
        const p = join(d, n);
        return statSync(p).isDirectory() ? walk(p) : [p];
      })
    : [];
for (const avif of walk(ROOT).filter((f) => extname(f) === '.avif' && !f.endsWith('-sm.avif'))) {
  const key = relative(ROOT, avif).replace(/\.avif$/, '');
  const base = avif.replace(/\.avif$/, '');
  const complete = [`${base}.webp`, `${base}-sm.avif`, `${base}-sm.webp`].every(existsSync);
  if (complete && !Object.hasOwn(IMAGE_REGISTRY, key)) {
    // A complete image on disk that is deliberately gated out by QA is fine — the
    // registry is the QA-passed set, disk is the working set. Only an un-gated
    // (qa === 'pass') image missing from the registry is a stale-registry error.
    const qa = manifestQa.get(key);
    if (qa === 'pass') problems.push(`UNREGISTERED: ${key} passed QA and is on disk but is not in the registry — run image-pipeline/build-registry.mjs`);
    else gatedOnDisk++;
  }
}

// ---- 4: Rule A — no alt may name a real institution --------------------------------
// Distinctive tokens from every college name: words that identify THAT institution,
// not generic academic nouns. "IIT Bombay" → "bombay"; "Harvard University" → "harvard".
const GENERIC = new Set([
  // structural words
  'university', 'universität', 'universite', 'université', 'college', 'institute', 'institution',
  'school', 'faculty', 'academy', 'the', 'of', 'and', 'for', 'de', 'di', 'du', 'des', 'la', 'le',
  'van', 'im', 'in', 'first', 'general', 'public', 'open', 'modern', 'autonomous', 'deemed',
  'central', 'federal', 'royal', 'imperial', 'city', 'national', 'state', 'international',
  'new', 'south', 'north', 'east', 'west', 'saint', 'st', 'higher', 'education', 'campus', 'research',
  // subject / field words — these appear in honest archetype alts ("a physics optics bench")
  'technology', 'technological', 'science', 'sciences', 'medical', 'medicine', 'management',
  'engineering', 'business', 'law', 'arts', 'art', 'design', 'music', 'commerce', 'economics',
  'physics', 'chemistry', 'biology', 'social', 'applied', 'technical', 'computer', 'information',
  'health', 'nursing', 'dental', 'pharmacy', 'agriculture', 'veterinary', 'polytechnic', 'women',
  // demonyms + COUNTRY names are region descriptors, not institution identifiers
  // (cities stay blocked — "Bombay", "Tokyo", "Cambridge" are specific real places)
  'american', 'indian', 'australian', 'canadian', 'british', 'european', 'india', 'china',
  'japan', 'korea', 'canada', 'australia', 'ireland', 'france', 'germany', 'russia', 'malaysia',
  'thailand', 'philippines', 'taiwan', 'qatar', 'oman', 'bahrain', 'kuwait', 'saudi', 'arabia',
  'emirates', 'zealand', 'kingdom', 'states',
]);
const tokens = new Set<string>();
for (const c of COLLEGES) {
  for (const w of c.nameEn.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length >= 4 && !GENERIC.has(w)) tokens.add(w);
  }
  // acronym-style short names (IIT, AIIMS, MIT, UBC…) are distinctive as whole words
  for (const w of c.nameEn.split(/[^A-Za-z]+/)) {
    if (/^[A-Z]{2,6}$/.test(w)) tokens.add(w.toLowerCase());
  }
}
const wordRe = (t: string) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
for (const [key, e] of Object.entries(IMAGE_REGISTRY)) {
  // Match the caption and the FILE name, not the folder — `regions/india/…` is a
  // controlled path that legitimately carries the region slug.
  const hay = `${e.alt} ${key.split('/').pop() ?? ''}`;
  for (const t of tokens) {
    if (wordRe(t).test(hay)) {
      problems.push(`RULE A: ${key} names a real institution token "${t}" — images are archetypes, never a named campus`);
      break;
    }
  }
}

// ---- report ------------------------------------------------------------------------
const n = Object.keys(IMAGE_REGISTRY).length;
if (problems.length) {
  console.error(`\ncheck-images: ${problems.length} problem(s) across ${n} registered image(s):`);
  for (const p of problems) console.error('  ✗ ' + p);
  console.error('\nFix: re-run image-pipeline/optimize.mjs then image-pipeline/build-registry.mjs, or correct the alt in manifest.json.\n');
  process.exit(1);
}
console.log(`check-images: ${n} QA-passed image(s) registered${gatedOnDisk ? ` (${gatedOnDisk} on disk gated out by QA)` : ''}, registry ⇄ disk ⇄ manifest consistent, 0 Rule-A hits.`);
