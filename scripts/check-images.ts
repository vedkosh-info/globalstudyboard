// Prebuild guard: QA, immutable paths, licenses, provenance, dimensions and byte caps.
// Reads small binary headers directly, so no sharp or network is needed at build time.
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { IMAGE_REGISTRY, type ImageProvenance } from '../lib/images.generated';
import { COLLEGES } from '../lib/colleges';

interface ManifestImage {
  publicUrl: string;
  optimizedBase?: string;
  alt: string;
  qa?: { status: string };
  provenance?: {
    kind: string;
    sourceUrl?: string;
    originalUrl?: string;
    author?: string;
    license?: string;
    licenseUrl?: string;
    evidence?: string;
    verifiedAt?: string;
    subject?: string;
    institutionSlug?: string;
  };
}
const ROOT = 'public/images';
const problems: string[] = [];
const PHOTO_FIELDS = ['sourceUrl', 'originalUrl', 'author', 'license', 'licenseUrl', 'evidence', 'verifiedAt', 'subject'] as const;
const manifest = JSON.parse(readFileSync('image-pipeline/manifest.json', 'utf8')) as { images: ManifestImage[] };
const manifestByKey = new Map<string, ManifestImage>();
const knownFiles = new Set<string>();
const collegeSlugs = new Set(COLLEGES.map((c) => c.slug));
const today = new Date().toISOString().slice(0, 10);
const validDate = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s && s <= today;
const stable = (value: unknown): string => JSON.stringify(value, (_key, v: unknown) =>
  v !== null && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
const variants = (base: string) => ({ src: `${base}.avif`, srcWebp: `${base}.webp`, srcSm: `${base}-sm.avif`, srcSmWebp: `${base}-sm.webp` });

function httpsUrl(s: string | undefined): URL | null {
  if (typeof s !== 'string') return null;
  try {
    const url = new URL(s);
    return url.protocol === 'https:' && !url.username && !url.password ? url : null;
  } catch { return null; }
}
function provenanceFor(im: ManifestImage): ImageProvenance | null {
  const p = im.provenance ?? { kind: 'ai' };
  if (p.kind === 'ai') return { kind: 'ai' };
  if (p.kind !== 'photo') return null;
  const fields = Object.fromEntries(PHOTO_FIELDS.map((f) => [f, p[f]?.trim()]));
  return { kind: 'photo', ...fields, ...(p.institutionSlug !== undefined ? { institutionSlug: p.institutionSlug } : {}) } as ImageProvenance;
}

for (const im of manifest.images) {
  if (typeof im.publicUrl !== 'string' || !/^\/images\/[a-z0-9/-]+\.webp$/.test(im.publicUrl)) {
    problems.push('MANIFEST: invalid publicUrl'); continue;
  }
  const key = im.publicUrl.replace(/^\/images\//, '').replace(/\.webp$/, '');
  if (manifestByKey.has(key)) problems.push(`DUPLICATE manifest key: ${key}`);
  manifestByKey.set(key, im);
  const base = im.optimizedBase ?? `/images/${key}`;
  if (!/^\/images\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/.test(base)) { problems.push(`PATH: ${key} has an unsafe optimizedBase`); continue; }
  for (const path of Object.values(variants(base))) {
    if (knownFiles.has(path)) problems.push(`DUPLICATE asset path: ${path}`);
    knownFiles.add(path);
  }
  // Pending/retired assets may exist while a review is in progress, but cannot enter the registry.
  if (im.qa?.status !== 'pass') continue;
  if (!Object.hasOwn(IMAGE_REGISTRY, key)) problems.push(`UNREGISTERED: ${key} passed QA but is absent from the registry`);
  const p = im.provenance ?? { kind: 'ai' };
  if (p.kind === 'ai') {
    if (im.optimizedBase !== undefined && im.optimizedBase !== `/images/${key}`) problems.push(`PATH: ${key} has an unsupported AI optimizedBase`);
    continue;
  }
  if (p.kind !== 'photo') { problems.push(`PROVENANCE: ${key} has unknown kind`); continue; }
  for (const f of PHOTO_FIELDS) if (typeof p[f] !== 'string' || !p[f]?.trim()) problems.push(`PROVENANCE: ${key} needs ${f}`);
  if (!/^\/images\/.*-photo-[a-f0-9]{8}$/.test(base)) problems.push(`IMMUTABLE: ${key} photo needs a hashed optimizedBase`);
  const source = httpsUrl(p.sourceUrl);
  // Commons is evidence for this file's license, never an admissions-fact source.
  let filePage = false;
  try { filePage = Boolean(source && source.hostname === 'commons.wikimedia.org' && /^\/wiki\/File:.+/.test(decodeURIComponent(source.pathname))); } catch { /* malformed encoding */ }
  if (!filePage || source?.search || source?.hash) problems.push(`SOURCE: ${key} needs the specific HTTPS Wikimedia Commons File page`);
  const original = httpsUrl(p.originalUrl);
  if (!original || original.hostname !== 'upload.wikimedia.org' || !original.pathname.startsWith('/wikipedia/commons/') || original.search || original.hash) problems.push(`SOURCE: ${key} needs an HTTPS Commons original image URL`);
  if (p.license === 'CC0-1.0') {
    if (p.licenseUrl !== 'https://creativecommons.org/publicdomain/zero/1.0/') problems.push(`LICENSE: ${key} needs the exact CC0 deed URL`);
  } else if (p.license === 'public-domain') {
    if (p.licenseUrl !== 'https://creativecommons.org/publicdomain/mark/1.0/' || !p.evidence?.trim()) problems.push(`LICENSE: ${key} needs public-domain evidence and the Public Domain Mark URL`);
  } else problems.push(`LICENSE: ${key} license must be CC0-1.0 or documented public-domain`);
  if (!validDate(p.verifiedAt ?? '')) problems.push(`PROVENANCE: ${key} needs a valid, non-future verifiedAt date`);
  if (p.institutionSlug !== undefined && !collegeSlugs.has(p.institutionSlug)) problems.push(`SUBJECT: ${key} names an unknown institutionSlug`);
  if (p.institutionSlug !== undefined) {
    const college = COLLEGES.find((item) => item.slug === p.institutionSlug);
    if (college && !key.startsWith(`regions/${college.region}/`)) problems.push(`SUBJECT: ${key} does not match the institution's destination`);
  }
}

// Parse dimensions from the formats emitted by our encoder. No decompression is needed.
type Dimensions = { width: number; height: number };
function dimensions(buf: Buffer, format: '.avif' | '.webp'): Dimensions | null {
  if (format === '.webp') {
    if (buf.length < 20 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null;
    for (let pos = 12; pos + 8 <= buf.length;) {
      const tag = buf.toString('ascii', pos, pos + 4);
      const size = buf.readUInt32LE(pos + 4);
      const p = pos + 8;
      if (p + size > buf.length) return null;
      if (tag === 'VP8X' && size >= 10) return { width: buf.readUIntLE(p + 4, 3) + 1, height: buf.readUIntLE(p + 7, 3) + 1 };
      if (tag === 'VP8 ' && size >= 10 && buf[p + 3] === 0x9d && buf[p + 4] === 0x01 && buf[p + 5] === 0x2a) return { width: buf.readUInt16LE(p + 6) & 0x3fff, height: buf.readUInt16LE(p + 8) & 0x3fff };
      if (tag === 'VP8L' && size >= 5 && buf[p] === 0x2f) return { width: 1 + buf[p + 1] + ((buf[p + 2] & 0x3f) << 8), height: 1 + (buf[p + 2] >> 6) + (buf[p + 3] << 2) + ((buf[p + 4] & 0x0f) << 10) };
      pos = p + size + (size % 2);
    }
    return null;
  }
  if (buf.length < 16 || buf.toString('ascii', 4, 8) !== 'ftyp' || !['avif', 'avis'].includes(buf.toString('ascii', 8, 12))) return null;
  const boxes = (start: number, end: number): Dimensions | null => {
    for (let pos = start; pos + 8 <= end;) {
      let size = buf.readUInt32BE(pos);
      const tag = buf.toString('ascii', pos + 4, pos + 8);
      let header = 8;
      if (size === 1) {
        if (pos + 16 > end) return null;
        const large = buf.readBigUInt64BE(pos + 8);
        if (large > BigInt(Number.MAX_SAFE_INTEGER)) return null;
        size = Number(large); header = 16;
      }
      if (size === 0) size = end - pos;
      if (size < header || pos + size > end) return null;
      const body = pos + header;
      if (tag === 'ispe' && size >= header + 12) return { width: buf.readUInt32BE(body + 4), height: buf.readUInt32BE(body + 8) };
      if (['meta', 'iprp', 'ipco'].includes(tag)) {
        const found = boxes(body + (tag === 'meta' ? 4 : 0), pos + size);
        if (found) return found;
      }
      pos += size;
    }
    return null;
  };
  return boxes(0, buf.length);
}

const CAPS = { src: 100 * 1024, srcWebp: 180 * 1024, srcSm: 30 * 1024, srcSmWebp: 45 * 1024 } as const;
for (const [key, entry] of Object.entries(IMAGE_REGISTRY)) {
  const im = manifestByKey.get(key);
  if (!im) { problems.push(`STALE registry: ${key} has no manifest record`); continue; }
  if (im.qa?.status !== 'pass') problems.push(`QA: ${key} is registered despite status ${im.qa?.status ?? 'pending'}`);
  if (typeof im.alt !== 'string' || im.alt.trim() !== entry.alt || !entry.alt.trim()) problems.push(`STALE alt: ${key}`);
  if (stable(entry.provenance) !== stable(provenanceFor(im))) problems.push(`STALE provenance: ${key}`);
  const expected = variants(im.optimizedBase ?? `/images/${key}`);
  for (const slot of Object.keys(CAPS) as (keyof typeof CAPS)[]) {
    const path = entry[slot];
    if (path !== expected[slot]) problems.push(`STALE path: ${key} ${slot}`);
    const file = join('public', path);
    if (!existsSync(file)) { problems.push(`MISSING: ${key} → ${path}`); continue; }
    const size = statSync(file).size;
    if (size > CAPS[slot]) problems.push(`BYTE CAP: ${path} is ${size} bytes (limit ${CAPS[slot]})`);
    const format = extname(file);
    const actual = format === '.avif' || format === '.webp' ? dimensions(readFileSync(file), format) : null;
    const small = slot === 'srcSm' || slot === 'srcSmWebp';
    const width = small ? entry.widthSm : entry.width;
    const height = small ? entry.heightSm : entry.height;
    if (!actual || actual.width !== width || actual.height !== height) problems.push(`DIMENSIONS: ${path} disagrees with registry ${width}×${height}`);
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || width > (small ? 560 : 1400) || Math.abs(width * 9 - height * 16) > 8) problems.push(`CROP: ${path} needs a correctly sized 16:9 variant`);
  }
}
const walk = (d: string): string[] => existsSync(d) ? readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
}) : [];
for (const file of walk(ROOT)) {
  const ext = extname(file).toLowerCase();
  if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.tif' || ext === '.tiff') problems.push(`RAW SOURCE: ${file} belongs in ignored image-pipeline/raw, outside shipped public assets`);
  if ((ext === '.avif' || ext === '.webp') && !knownFiles.has('/' + file.replace(/^public\//, ''))) problems.push(`UNREGISTERED FILE: ${file}`);
}

// An AI archetype must never pretend to show a real named institution.
const GENERIC = new Set([
  // structural words
  'university', 'universität', 'universite', 'université', 'college', 'institute', 'institution',
  'school', 'faculty', 'academy', 'the', 'of', 'and', 'for', 'de', 'di', 'du', 'des', 'la', 'le',
  'van', 'im', 'in', 'first', 'general', 'public', 'open', 'modern', 'autonomous', 'deemed',
  'central', 'federal', 'royal', 'imperial', 'city', 'national', 'state', 'international',
  'new', 'south', 'north', 'east', 'west', 'saint', 'st', 'higher', 'education', 'campus', 'research',
  // English function words inside an official name ("named after"), not the institution
  'named', 'after',
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
  if (e.provenance.kind !== 'ai') continue;
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

const n = Object.keys(IMAGE_REGISTRY).length;
if (problems.length) {
  console.error(`\ncheck-images: ${problems.length} problem(s) across ${n} registered image(s):`);
  for (const problem of problems) console.error('  ✗ ' + problem);
  console.error('\nFix metadata/QA or asset files, then run node image-pipeline/build-registry.mjs.\n');
  process.exit(1);
}
const photos = Object.values(IMAGE_REGISTRY).filter((entry) => entry.provenance.kind === 'photo').length;
console.log(`check-images: ${n} QA-passed image(s), ${photos} open-source photo(s), registry ⇄ manifest ⇄ disk consistent; licenses, provenance, dimensions and byte caps pass.`);
