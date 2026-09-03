// image-pipeline/preflight.mjs
// Checks your Gemini setup BEFORE you spend anything. Never prints your key.
//
//   node image-pipeline/preflight.mjs            # free: validates key + model access
//   node image-pipeline/preflight.mjs --image    # also generates ONE test image (~$0.13)
//
// Turns the API's cryptic failures into the actual fix.

import './env.mjs';
import { keyStatus } from './env.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const WANT_IMAGE = process.argv.includes('--image');
const MODEL = 'gemini-3-pro-image';
const ok = (m) => console.log(`  \x1b[32mOK\x1b[0m   ${m}`);
const bad = (m) => console.log(`  \x1b[31mNO\x1b[0m   ${m}`);
const info = (m) => console.log(`       ${m}`);

console.log('\nGemini preflight\n' + '-'.repeat(58));

// 1. key present?
const st = keyStatus('GEMINI_API_KEY');
if (!st.set) {
  bad(`GEMINI_API_KEY — ${st.hint}`);
  console.log(`
  Fix: put your key in image-pipeline/.env (gitignored):

      cp image-pipeline/.env.example image-pipeline/.env
      # then open it and paste your key after GEMINI_API_KEY=

  Get a key at https://aistudio.google.com  ->  "Get API key".
`);
  process.exit(1);
}
ok(`GEMINI_API_KEY ${st.hint}`);

// 2. key actually valid + which image models this key can reach (free — no generation)
let genai;
try { genai = await import('@google/genai'); }
catch { bad('@google/genai not installed — run: npm i -D @google/genai'); process.exit(1); }

const ai = new genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function diagnose(msg) {
  const m = String(msg);
  if (/API_KEY_INVALID|API key not valid|400.*api.?key/i.test(m))
    return 'That key is not valid. Re-copy it from aistudio.google.com (watch for a trailing space).';
  if (/PERMISSION_DENIED|403/i.test(m))
    return 'Key is real but not permitted. Usually billing is not enabled on the linked Google Cloud project, or the Generative Language API is off for it.';
  if (/RESOURCE_EXHAUSTED|429|quota/i.test(m))
    return 'Rate/quota limit. On a brand-new key this usually means you are still on the FREE tier — enable billing.';
  if (/FAILED_PRECONDITION|location|region|not available in your country/i.test(m))
    return 'Blocked for your region on the free tier. Enabling billing (paid tier) resolves this.';
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|network/i.test(m))
    return 'Network problem reaching Google — check your connection/VPN.';
  return null;
}

let reachable = null;
try {
  const names = [];
  const pager = await ai.models.list();
  for await (const m of pager) names.push(m.name || m.baseModelId || '');
  reachable = names.map((n) => n.replace(/^models\//, ''));
  ok(`key is valid — ${reachable.length} models visible`);
} catch (e) {
  bad('key rejected by Google');
  const d = diagnose(e?.message || e);
  info(d || String(e?.message || e).slice(0, 200));
  console.log('\n  Nothing was spent. Fix the above and re-run.\n');
  process.exit(1);
}

const imageModels = reachable.filter((n) => /image/i.test(n));
if (reachable.includes(MODEL)) ok(`${MODEL} is available to this key`);
else {
  bad(`${MODEL} NOT listed for this key`);
  info(imageModels.length ? `image models you CAN see: ${imageModels.join(', ')}` : 'no image models visible — this is the classic "billing not enabled" signature');
  info('Image models require the PAID tier. Enable billing, wait ~1 min, re-run.');
}

// 3. optional: one real image — the only way to prove billing + measure what comes back
if (!WANT_IMAGE) {
  console.log(`
  Free checks done, nothing spent.
  Next, prove it end-to-end with ONE image (~$0.13):

      node image-pipeline/preflight.mjs --image
`);
  process.exit(0);
}

console.log('\n  generating one 2K 16:9 test image…');
try {
  const res = await ai.models.generateContent({
    model: MODEL,
    contents:
      'A single ripe green apple on a plain light-grey studio backdrop, soft window light from the left, ' +
      'shallow depth of field, fine natural film grain. Photorealistic, not an illustration, no text, no watermark.',
    config: { imageConfig: { aspectRatio: '16:9', imageSize: '2K' } },
  });
  const parts = res?.candidates?.[0]?.content?.parts || [];
  const data = parts.map((p) => p.inlineData?.data || p.inline_data?.data).find(Boolean);
  if (!data) {
    const txt = parts.map((p) => p.text).filter(Boolean).join(' ').slice(0, 200);
    throw new Error(`no image returned${txt ? ` — model said: "${txt}"` : ''}`);
  }
  const buf = Buffer.from(data, 'base64');
  mkdirSync('image-pipeline/bakeoff', { recursive: true });
  const out = 'image-pipeline/bakeoff/preflight-test.png';
  writeFileSync(out, buf);

  const sharp = (await import('sharp')).default;
  const meta = await sharp(buf).metadata();
  const mp = (meta.width * meta.height) / 1048576;
  const is169 = Math.abs(meta.width / meta.height - 16 / 9) < 0.02;

  ok(`image generated — ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
  ok(`billing/paid tier is active (image models are paid-only)`);
  console.log(`       returned ${meta.width}x${meta.height}  ${mp.toFixed(2)} MP`);
  if (!is169) bad(`aspect ratio is ${(meta.width / meta.height).toFixed(2)}, not 16:9 — the known silently-ignored-config bug`);
  else ok('aspect ratio 16:9 honoured');
  if (mp < 1.8) bad(`under 2K (${mp.toFixed(2)} MP) — imageSize was silently ignored; heroes would ship soft`);
  else ok('2K resolution honoured');

  console.log(`
  Open it and judge it yourself:   open ${out}

  If it looks like a real photograph, you are ready:
      node image-pipeline/bakeoff.mjs
`);
} catch (e) {
  bad('image generation failed');
  const d = diagnose(e?.message || e);
  info(d || String(e?.message || e).slice(0, 240));
  console.log('');
  process.exit(1);
}
