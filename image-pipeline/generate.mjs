// image-pipeline/generate.mjs
// Batch-generate the GlobalStudyBoard images via the Google Gemini IMAGE API
// (NOT the consumer Gemini app) → NO visible ✦ sparkle watermark. Only the invisible
// SynthID + C2PA provenance metadata remain (unavoidable, imperceptible, and we do NOT
// strip them). Reads image-pipeline/manifest.json and writes a PNG to each image's path.
//
// SETUP (one time)
//   1. aistudio.google.com → "Get API key", then ENABLE BILLING on the linked Google
//      Cloud project. The paid tier matters: (a) your prompts/outputs are NOT used to
//      train Google and are not human-reviewed, (b) real rate limits, (c) EEA/UK serving.
//   2. npm i @google/genai
//   3. export GEMINI_API_KEY="your_key_here"     # never commit this
//
// RUN
//   node image-pipeline/generate.mjs --only 1 --force   # ALWAYS smoke-test one first
//   node image-pipeline/generate.mjs                    # generate every missing image
//   node image-pipeline/generate.mjs --group B          # only one group (A–E)
//   node image-pipeline/generate.mjs --only 3,29,77     # re-rolls
//   node image-pipeline/generate.mjs --model gemini-3.1-flash-image --size 1K   # cheaper
//
// MODELS (verified 22 Aug 2026 — ai.google.dev/gemini-api/docs/pricing)
//   gemini-3-pro-image        Nano Banana Pro   $0.134 @1K/2K, $0.24 @4K   ← DEFAULT, best realism
//   gemini-3.1-flash-image    Nano Banana 2     $0.067 @1K, $0.101 @2K     (may ignore imageSize)
//   gemini-3.1-flash-lite-image                 $0.0336 @1K                (cheapest, drafts)
//   gemini-2.5-flash-image    LEGACY — Google recommends migrating off. Do not use.
//   Imagen 4                  RETIRED 17 Aug 2026. Gone.
//   Batch API = 50% off if you later need it for a large run.
//
// After this, run: node image-pipeline/optimize.mjs   (PNG → tiny AVIF + WebP)

import './env.mjs'; // loads image-pipeline/.env (gitignored)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { GoogleGenAI } from '@google/genai';

const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const MODEL = arg('--model', 'gemini-3-pro-image');
const SIZE = arg('--size', '2K');        // 1K | 2K | 4K  (uppercase K required)
const ASPECT = arg('--aspect', '16:9');  // 16:9 for heroes; 1:1 / 4:3 for card crops
const DELAY = parseInt(arg('--delay', '3000'), 10);
const FORCE = process.argv.includes('--force');
const ONLY = (arg('--only', '') || '').split(',').map((s) => parseInt(s, 10)).filter(Boolean);
const GROUP = (arg('--group', '') || '').toUpperCase();
const MAX_RETRY = 4;

const key = process.env.GEMINI_API_KEY;
if (!key) { console.error('Set GEMINI_API_KEY (aistudio.google.com → Get API key, billing enabled).'); process.exit(1); }

const manifest = JSON.parse(readFileSync('image-pipeline/manifest.json', 'utf8'));
let images = manifest.images;
if (ONLY.length) images = images.filter((i) => ONLY.includes(i.n));
if (GROUP) images = images.filter((i) => i.group === GROUP);

const ai = new GoogleGenAI({ apiKey: key });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const outFor = (img) => img.path.replace(/\.webp$/i, '.png'); // manifest paths end .webp; we save PNG

function extractImage(res) {
  const parts = res?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const data = p.inlineData?.data || p.inline_data?.data;
    if (data) return Buffer.from(data, 'base64');
  }
  // no image → surface any text (often a safety refusal) for the log
  const txt = parts.map((p) => p.text).filter(Boolean).join(' ').slice(0, 160);
  throw new Error(`no image in response${txt ? ` — model said: "${txt}"` : ''}`);
}

let ok = 0, skip = 0, fail = 0;
const failures = [];
console.log(`Model: ${MODEL} | ${SIZE} | ${ASPECT} | ${images.length} target(s) | delay ${DELAY}ms\n`);

for (const img of images) {
  const out = outFor(img);
  if (!FORCE && existsSync(out)) { console.log(`· skip  #${String(img.n).padStart(3)}  ${out} (exists)`); skip++; continue; }

  let done = false;
  for (let attempt = 1; attempt <= MAX_RETRY && !done; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: img.prompt,
        // Ask the API for the exact framing/resolution instead of hoping the prompt
        // text carries it. Note: gemini-3.1-flash-image is reported to silently ignore
        // imageSize (always ~1K); gemini-3-pro-image honours it.
        config: { imageConfig: { aspectRatio: ASPECT, imageSize: SIZE } },
      });
      const buf = extractImage(res);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, buf);
      console.log(`✓ done  #${String(img.n).padStart(3)}  ${out}  (${(buf.length / 1024).toFixed(0)} KB)`);
      ok++; done = true;
    } catch (e) {
      const msg = String(e.message || e);
      const retryable = /429|rate|quota|500|503|deadline|ECONNRESET|fetch failed|timeout/i.test(msg);
      if (attempt < MAX_RETRY && retryable) {
        const back = DELAY * attempt * 2;
        console.log(`  … #${img.n} attempt ${attempt} failed (${msg.slice(0, 80)}); retry in ${back}ms`);
        await sleep(back);
      } else {
        console.log(`✗ FAIL  #${String(img.n).padStart(3)}  ${out}  — ${msg.slice(0, 120)}`);
        fail++; failures.push(img.n); done = true;
      }
    }
  }
  await sleep(DELAY); // gentle pacing between images
}

console.log(`\n${'-'.repeat(60)}\ndone ${ok}  |  skipped ${skip}  |  failed ${fail}`);
if (failures.length) console.log(`re-run failures with:  node image-pipeline/generate.mjs --only ${failures.join(',')}`);
console.log(`next: node image-pipeline/optimize.mjs   (PNG → AVIF + WebP)`);
