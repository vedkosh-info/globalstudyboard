// image-pipeline/bakeoff.mjs
// Run the SAME prompts through several image models and build a side-by-side
// contact sheet, so the model choice is made on evidence rather than on defaults.
//
// The failure mode we are testing for is the one the README calls out:
//   "a previous project's AI images looked obviously AI; that must not happen here."
//
//   node image-pipeline/bakeoff.mjs                    # all available models
//   node image-pipeline/bakeoff.mjs --only 3,29,55     # specific manifest #s
//   node image-pipeline/bakeoff.mjs --models gemini    # just one model
//   node image-pipeline/bakeoff.mjs --open             # build sheet + print open cmd
//
// A model whose API key or SDK is missing is SKIPPED cleanly — it never aborts the run.
// Output (gitignored):  image-pipeline/bakeoff/<model>/<n>.png  +  bakeoff/index.html

import './env.mjs'; // loads image-pipeline/.env (gitignored)
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

// Known OPEN bugs (js-genai #1461, #1009) have imageSize / aspectRatio being SILENTLY
// ignored — you ask for 2K 16:9 and quietly get 1K 4:3. Never trust the request; measure
// what actually came back, or the whole comparison is invalid.
async function describe(buf) {
  try {
    const m = await sharp(buf).metadata();
    const w = m.width, h = m.height;
    const mp = (w * h) / 1048576;
    const ar = w / h;
    const is169 = Math.abs(ar - 16 / 9) < 0.02;
    return { w, h, mp: mp.toFixed(2), ar: ar.toFixed(2), is169, under2k: mp < 1.8 };
  } catch { return null; }
}

const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? process.argv[i + 1] : d; };
const OUT = 'image-pipeline/bakeoff';
const FORCE = process.argv.includes('--force');

// The 5 bake-off prompts — selected then ADVERSARIALLY REVIEWED (both reviewers
// returned sound=false on the first slate; both swaps below are theirs):
//   13 region exterior   arched colonnades + fountain -> repeating geometry, water
//   29 technical         keyboards + screens          -> key-grid melt, screen-text hallucination
//   54 still-life macro  blank bubble sheet           -> glyph hallucination (the brutal one)
//   66 journey flat-lay  passport + boarding pass     -> Group D tier, document text, leather/paper
//   83 site hero         misty dawn avenue            -> volumetric light; highest blast radius (LCP)
// Reviewer 1 caught a load-bearing factual error (a med-risk region EXTERIOR does exist:
// #13) -> swapped out #22. Reviewer 2 caught Group-E redundancy vs #83 -> #92 out, #66 in,
// which also closed the Group-D (journey) coverage gap.
const DEFAULT_PICKS = [13, 29, 54, 66, 83];
const PICKS = (arg('--only', '') || '').split(',').map((s) => parseInt(s, 10)).filter(Boolean);
const WANT = PICKS.length ? PICKS : DEFAULT_PICKS;

const manifest = JSON.parse(readFileSync('image-pipeline/manifest.json', 'utf8'));
const images = WANT.map((n) => manifest.images.find((i) => i.n === n)).filter(Boolean);
if (!images.length) { console.error('No matching manifest entries.'); process.exit(1); }

/* ------------------------------------------------------------------ adapters */
// Each adapter: { id, label, note, available() -> {ok, why}, run(prompt) -> Buffer }

const adapters = [
  {
    id: 'gemini',
    label: 'Gemini — Nano Banana Pro',
    note: 'gemini-3-pro-image · 2K · 16:9',
    env: 'GEMINI_API_KEY',
    pkg: '@google/genai',
    async run(prompt) {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const res = await ai.models.generateContent({
        model: process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image',
        contents: prompt,
        config: { imageConfig: { aspectRatio: '16:9', imageSize: '2K' } },
      });
      const parts = res?.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        const d = p.inlineData?.data || p.inline_data?.data;
        if (d) return Buffer.from(d, 'base64');
      }
      const txt = parts.map((p) => p.text).filter(Boolean).join(' ').slice(0, 200);
      throw new Error(`no image returned${txt ? ` — model said: "${txt}"` : ''}`);
    },
  },
  {
    id: 'flux2pro',
    label: 'FLUX 2 Pro',
    note: 'fal-ai/flux-2-pro · 2048x1152',
    env: 'FAL_KEY',
    pkg: '@fal-ai/client',
    async run(prompt) {
      const { fal } = await import('@fal-ai/client');
      fal.config({ credentials: process.env.FAL_KEY });
      // Verified: the endpoint is 'fal-ai/flux-2-pro' (NOT '.../flux-2/pro'), there is no
      // `aspect_ratio` param, the 'landscape_16_9' PRESET is only ~1MP, each side must be a
      // multiple of 16, area <= 4,194,304 px, and safety_tolerance is a STRING.
      const r = await fal.subscribe(process.env.FAL_IMAGE_MODEL || 'fal-ai/flux-2-pro', {
        input: {
          prompt,
          image_size: { width: 2048, height: 1152 }, // true 16:9, 2.25 MP, both /16
          output_format: 'png',
          safety_tolerance: '2',
        },
      });
      const url = r?.data?.images?.[0]?.url || r?.images?.[0]?.url;
      if (!url) throw new Error('no image url in fal response');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`download failed ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    },
  },
  {
    id: 'gptimage2',
    label: 'OpenAI — GPT Image 2',
    note: 'gpt-image-2 · 2048x1152',
    env: 'OPENAI_API_KEY',
    pkg: 'openai',
    async run(prompt) {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const r = await client.images.generate({
        model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
        prompt,
        // 1536x1024 is 3:2, NOT 16:9 — using it would have handed OpenAI a different
        // crop from the other two and invalidated the comparison. 2048x1152 is true 16:9
        // and satisfies "both edges multiples of 16". Never send response_format: gpt-image-*
        // rejects it and always returns b64_json.
        size: '2048x1152',
        quality: 'high',
        n: 1,
      });
      const b64 = r?.data?.[0]?.b64_json;
      if (b64) return Buffer.from(b64, 'base64');
      const url = r?.data?.[0]?.url;
      if (url) { const d = await fetch(url); return Buffer.from(await d.arrayBuffer()); }
      throw new Error('no image in OpenAI response');
    },
  },
];

async function availability(a) {
  if (!process.env[a.env]) return { ok: false, why: `${a.env} not set` };
  try { await import(a.pkg); } catch { return { ok: false, why: `npm i -D ${a.pkg}` }; }
  return { ok: true };
}

/* ---------------------------------------------------------------------- run */
const only = (arg('--models', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const chosen = only.length ? adapters.filter((a) => only.includes(a.id)) : adapters;

console.log(`Bake-off · ${images.length} prompt(s): #${images.map((i) => i.n).join(', #')}\n`);

const status = [];
for (const a of chosen) {
  const av = await availability(a);
  status.push({ ...a, ...av });
  console.log(av.ok ? `  ready   ${a.label}` : `  skip    ${a.label}  (${av.why})`);
}
const live = status.filter((s) => s.ok);
console.log('');

if (!live.length) {
  console.log('No models available — nothing generated. Set at least one API key, then re-run.');
  console.log('  Gemini (recommended):  export GEMINI_API_KEY="..."');
  process.exit(0);
}

const results = {};
let spend = 0;
// gemini: $0.134 flat at 1K/2K. flux2pro: metered per MP — 2048x1152 = 2.25MP, rounded
// up to 3 => ~$0.06. gptimage2: token-billed ($30/1M image output tokens); ~$0.19 at this
// size/quality is an estimate, so treat the printed total as approximate.
const PRICE = { gemini: 0.134, flux2pro: 0.06, gptimage2: 0.19 };

for (const img of images) {
  for (const a of live) {
    const out = join(OUT, a.id, `${img.n}.png`);
    results[img.n] ??= {};
    if (!FORCE && existsSync(out)) {
      const cd = await describe(readFileSync(out));
      results[img.n][a.id] = { ok: true, file: out, kb: (statSize(out) / 1024).toFixed(0), cached: true, dim: cd, warn: [] };
      console.log(`· cached  #${String(img.n).padStart(3)}  ${a.id}`);
      continue;
    }
    try {
      const t0 = Date.now();
      const buf = await a.run(img.prompt);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, buf);
      spend += PRICE[a.id] || 0;
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      const d = await describe(buf);
      const warn = d ? [!d.is169 && `NOT 16:9 (${d.ar})`, d.under2k && `under 2K (${d.mp}MP)`].filter(Boolean) : [];
      results[img.n][a.id] = { ok: true, file: out, kb: (buf.length / 1024).toFixed(0), secs, dim: d, warn };
      const dims = d ? `${d.w}x${d.h} ${d.mp}MP` : '?';
      console.log(`OK  #${String(img.n).padStart(3)}  ${a.id.padEnd(10)} ${(buf.length / 1024).toFixed(0).padStart(5)} KB  ${dims.padEnd(18)} ${secs}s${warn.length ? `   !! ${warn.join(', ')}` : ''}`);
    } catch (e) {
      const msg = String(e.message || e).slice(0, 160);
      results[img.n][a.id] = { ok: false, error: msg };
      console.log(`XX  #${String(img.n).padStart(3)}  ${a.id.padEnd(10)} ${msg}`);
    }
  }
}

function statSize(p) { try { return statSync(p).size; } catch { return 0; } }

/* ------------------------------------------------------- contact sheet (HTML) */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cols = live.map((a) => `<th><div class="m">${esc(a.label)}</div><div class="n">${esc(a.note)}</div></th>`).join('');
const rows = images.map((img) => {
  const cells = live.map((a) => {
    const r = results[img.n]?.[a.id];
    if (!r?.ok) return `<td class="fail"><div class="x">failed</div><code>${esc(r?.error || 'not run')}</code></td>`;
    const dim = r.dim ? `${r.dim.w}&times;${r.dim.h} · ${r.dim.mp}MP` : '';
    const warn = (r.warn || []).length ? `<div class="warn">${esc(r.warn.join(' · '))}</div>` : '';
    return `<td><a href="${a.id}/${img.n}.png" target="_blank"><img src="${a.id}/${img.n}.png" loading="lazy"></a><div class="meta">${dim}<br>${r.kb} KB${r.secs ? ` · ${r.secs}s` : ' · cached'}</div>${warn}</td>`;
  }).join('');
  return `<tr><th class="p"><div class="hn">#${img.n} <span>${esc(img.group)}</span></div><div class="alt">${esc(img.alt)}</div><div class="risk">aiLookRisk: <b>${esc(img.aiLookRisk)}</b> · realism ${esc(img.realismScore)}</div><details><summary>prompt</summary><pre>${esc(img.prompt)}</pre></details></th>${cells}</tr>`;
}).join('\n');

const html = `<!doctype html><meta charset="utf-8"><title>GSB image bake-off</title>
<style>
:root{--ink:#1c1917;--stone:#78716c;--line:#e7e5e4;--bg:#faf9f7}
*{box-sizing:border-box}body{margin:0;padding:32px;font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink)}
h1{font-size:26px;margin:0 0 6px}p.sub{color:var(--stone);margin:0 0 28px}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid var(--line);vertical-align:top;padding:12px;background:#fff}
thead th{position:sticky;top:0;z-index:2;background:#fff;text-align:left}
.m{font-weight:700}.n{color:var(--stone);font-size:12px;font-weight:400}
th.p{width:300px;max-width:300px;background:#fff}
.hn{font-weight:700;margin-bottom:6px}.hn span{color:var(--stone);font-weight:400;font-size:12px}
.alt{font-size:13px;color:var(--stone);font-weight:400;margin-bottom:8px}
.risk{font-size:12px;color:var(--stone);font-weight:400;margin-bottom:8px}
details summary{cursor:pointer;font-size:12px;color:#0f766e;font-weight:600}
pre{white-space:pre-wrap;font-size:11px;color:var(--stone);max-height:260px;overflow:auto;background:var(--bg);padding:10px;border-radius:8px;font-weight:400}
td img{width:100%;height:auto;display:block;border-radius:8px}
.meta{font-size:12px;color:var(--stone);margin-top:8px}
td.fail{background:#fef2f2}.x{color:#b91c1c;font-weight:700;margin-bottom:6px}
.warn{margin-top:6px;font-size:11px;color:#92400e;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:4px 7px}
code{font-size:11px;color:#7f1d1d;word-break:break-word}
.tips{margin-top:32px;padding:18px 22px;background:#fff;border:1px solid var(--line);border-radius:12px}
.tips h2{font-size:15px;margin:0 0 10px}.tips li{margin-bottom:6px;font-size:14px}
</style>
<h1>GlobalStudyBoard — image model bake-off</h1>
<p class="sub">Same prompt, every model, side by side. Judge at full size (click an image) before deciding.</p>
<table><thead><tr><th class="p">Prompt</th>${cols}</tr></thead><tbody>
${rows}
</tbody></table>
<div class="tips"><h2>What to look for — the AI tells</h2><ol>
<li><b>Repeating geometry</b> — do window grids, columns, shelves and floor tiles stay straight and consistent, or do they warp/melt toward the edges?</li>
<li><b>Light physics</b> — does every shadow fall from the same direction, with believable softness and falloff?</li>
<li><b>Reflections &amp; glass</b> — do reflections match what is actually in the scene, or are they invented mush?</li>
<li><b>Micro-texture</b> — real grain, fibre, dust and wear vs plastic/waxy over-smoothed surfaces.</li>
<li><b>Text</b> — any garbled pseudo-lettering on signage or book spines is an instant fail.</li>
<li><b>Overall</b> — cover it and ask: would I believe this was shot by a photographer? If you hesitate, it fails.</li>
</ol><h2 style="margin-top:18px">Also check</h2><ol>
<li><b>Amber size warnings</b> above mean the model silently ignored the requested resolution or aspect ratio — a known open SDK bug. Compare like with like before judging quality.</li>
<li><b>Refusals</b> show as a red cell with the model's own words. Every prompt carries a long negative safety tail ("no weapons, alcohol, religious symbols, flags, military…"); some moderation classifiers score those tokens as topic mentions, so a refusal may be the <i>tail's</i> fault rather than the scene's.</li>
</ol></div>`;

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'index.html'), html);

console.log(`\n${'-'.repeat(66)}`);
console.log(`approx spend this run: $${spend.toFixed(2)}`);
console.log(`contact sheet: ${join(OUT, 'index.html')}`);
console.log(`\n  open ${join(OUT, 'index.html')}\n`);
