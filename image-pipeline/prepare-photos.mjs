// Prepare explicitly selected, independently reviewed source candidates.
// node image-pipeline/prepare-photos.mjs
// Reads photo-selections.json; originals stay ignored under image-pipeline/raw/.
// Does NOT approve QA: new photos remain pending until a separate reviewer passes them.
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const selections = JSON.parse(readFileSync('image-pipeline/photo-selections.json', 'utf8'));
const manifest = JSON.parse(readFileSync('image-pipeline/manifest.json', 'utf8'));
const rawRoot = resolve('image-pipeline/raw') + '/';
const recipe = { version: 1, hero: 1400, card: 560, avif: [48, 44, 40], webp: [76, 72, 68], effort: 6 };
const measured = [];
const preparedFiles = [];

for (const selection of selections) {
  const im = manifest.images.find((entry) => entry.publicUrl === `/images/${selection.key}.webp`);
  if (!im) throw new Error(`Unknown image key: ${selection.key}`);
  const file = resolve(selection.localSource);
  if (!file.startsWith(rawRoot) || !existsSync(file)) throw new Error(`Missing ignored source: ${file}`);
  if (selection.provenance?.kind !== 'photo' || selection.provenance.license !== 'CC0-1.0') {
    throw new Error(`This import batch accepts checked CC0 photos only: ${selection.key}`);
  }
  const original = readFileSync(file);
  const oriented = await sharp(original).rotate().toBuffer({ resolveWithObject: true });
  const crop = selection.crop ?? { left: 0, top: 0, width: oriented.info.width, height: oriented.info.height };
  for (const field of ['left', 'top', 'width', 'height']) {
    if (!Number.isInteger(crop[field]) || crop[field] < (field === 'left' || field === 'top' ? 0 : 1)) {
      throw new Error(`Invalid crop ${field}: ${selection.key}`);
    }
  }
  if (crop.left + crop.width > oriented.info.width || crop.top + crop.height > oriented.info.height) {
    throw new Error(`Crop exceeds source: ${selection.key}`);
  }
  const heroWidth = selection.heroWidth ?? recipe.hero;
  if (!Number.isInteger(heroWidth) || heroWidth < 1000 || heroWidth > recipe.hero) throw new Error(`Invalid hero width: ${selection.key}`);
  const revision = createHash('sha256').update(original).update(JSON.stringify({ crop, recipe, heroWidth })).digest('hex').slice(0, 8);
  const optimizedBase = `/images/${selection.key}-photo-${revision}`;
  const publishedBase = `public${optimizedBase}`;
  const base = `image-pipeline/raw/prepared${optimizedBase}`;
  mkdirSync(dirname(base), { recursive: true });
  const variants = [];
  for (const [maxWidth, suffix, targets, ceilings] of [
    [heroWidth, '', [45, 85], [100, 180]],
    [recipe.card, '-sm', [14, 24], [30, 45]],
  ]) {
    const width = Math.min(maxWidth, crop.width, Math.floor(crop.height * 16 / 9));
    const height = Math.round(width * 9 / 16);
    if (width < (suffix ? 560 : 1000)) throw new Error(`Source too small for a sharp responsive photo: ${selection.key}`);
    for (const [index, format] of ['avif', 'webp'].entries()) {
      const dest = `${base}${suffix}.${format}`;
      let quality;
      for (quality of recipe[format]) {
        const pipeline = sharp(oriented.data).extract(crop).resize({ width, height, fit: 'cover', position: 'centre', withoutEnlargement: true });
        await pipeline[format]({ quality, effort: format === 'avif' ? recipe.effort : 6 }).toFile(dest);
        if (statSync(dest).size <= targets[index] * 1024) break;
      }
      const bytes = statSync(dest).size;
      if (bytes > ceilings[index] * 1024) throw new Error(`Photo over size ceiling: ${dest} (${bytes} bytes)`);
      const published = `${publishedBase}${suffix}.${format}`;
      variants.push({ path: published, width, height, quality, bytes });
      preparedFiles.push({ staged: dest, published });
    }
  }
  const changed = im.optimizedBase !== optimizedBase || im.alt !== selection.alt ||
    JSON.stringify(im.provenance) !== JSON.stringify(selection.provenance);
  Object.assign(im, {
    optimizedBase,
    alt: selection.alt,
    provenance: selection.provenance,
    photoPreparation: {
      sourceSha256: createHash('sha256').update(original).digest('hex'),
      originalWidth: oriented.info.width, originalHeight: oriented.info.height,
      crop, fit: '16:9 centre cover after explicit crop', recipe: { ...recipe, hero: heroWidth }, variants,
    },
  });
  if (changed) im.qa = { status: 'pending', date: '2026-10-23', reason: 'Photo replacement requires separate source, crop and page review.' };
  measured.push({ key: selection.key, optimizedBase, bytes: variants.reduce((sum, variant) => sum + variant.bytes, 0) });
  console.log(`${selection.key}: ${variants.map((variant) => `${(variant.bytes / 1024).toFixed(1)} KiB`).join(' / ')}`);
}
// Publish only after the whole selected batch meets the budgets. A rejected
// candidate leaves the manifest and public assets untouched.
for (const { staged, published } of preparedFiles) {
  if (existsSync(published) && !readFileSync(published).equals(readFileSync(staged))) {
    throw new Error(`Refusing to overwrite immutable bytes: ${published}. Bump the encoding recipe version to create a new URL.`);
  }
}
for (const { staged, published } of preparedFiles) {
  mkdirSync(dirname(published), { recursive: true });
  copyFileSync(staged, published);
}
writeFileSync('image-pipeline/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared ${measured.length} photos; all new/changed records remain QA-pending. Original published files are retained until review passes.`);
