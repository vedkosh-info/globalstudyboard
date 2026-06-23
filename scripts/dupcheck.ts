// Anti-duplication pre-flight (constitution §11.1a). Run BEFORE adding any
// content and as part of the independent QA pass:  npm run dup:check
//
// Surfaces: [1] duplicate slugs, [2] identical titles, [3] same-concept clusters
// across regions (club / make-global candidates), [3b] same-concept within one
// region (minor-tweak suspects), [4] high body/description-similarity pairs.
// A flag is a prompt to update/club an existing unit — not necessarily a defect
// (genuinely destination-specific parallels are allowed per §16.4).
import { GUIDES } from '../lib/guides';
import { ENTRANCE_EXAMS } from '../lib/admission-guides';
import { COLLEGES } from '../lib/colleges';
import { REGIONS } from '../lib/regions';

const REGION_WORDS = new Set<string>();
for (const r of REGIONS) {
  REGION_WORDS.add(r.slug);
  r.displayName.toLowerCase().split(/[^a-z]+/).forEach((w) => w && REGION_WORDS.add(w));
  r.countries.forEach((c) => c.toLowerCase().split(/[^a-z]+/).forEach((w) => w && REGION_WORDS.add(w)));
}
// Common country / demonym / filler tokens that shouldn't drive a "same topic" key.
[
  'usa','us','uk','america','american','britain','british','india','indian','canada','canadian',
  'australia','australian','zealand','europe','european','german','germany','france','french',
  'ireland','irish','russia','russian','gulf','emirates','uae','china','chinese','abroad','overseas',
  'international','students','student','for','the','a','an','to','in','of','and','or','your','you',
  'how','what','is','are','guide','explained','complete','best','vs','which','after','from','with',
  'list','top','do','does','need','should','step','by','about','study','studying','university',
  'universities','college','colleges','course','courses','exam','exams','test','tests','program',
].forEach((w) => REGION_WORDS.add(w));

const STEM = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

/** Concept key: significant title tokens, region/filler removed, sorted+unique. */
function conceptKey(title: string): string {
  const toks = Array.from(new Set(STEM(title).filter((w) => w.length > 2 && !REGION_WORDS.has(w))));
  return toks.sort().join(' ');
}

// ── 1. Exact duplicate slugs / ids (should be zero — CMI enforces) ──
const slugCounts = new Map<string, number>();
for (const g of GUIDES) slugCounts.set(g.slug, (slugCounts.get(g.slug) ?? 0) + 1);
const dupSlugs = [...slugCounts].filter(([, n]) => n > 1);

// ── 2. Identical titles across different slugs ──
const byTitle = new Map<string, typeof GUIDES>();
for (const g of GUIDES) {
  const k = g.titleEn.trim().toLowerCase();
  if (!byTitle.has(k)) byTitle.set(k, []);
  byTitle.get(k)!.push(g);
}
const sameTitle = [...byTitle].filter(([, gs]) => gs.length > 1);

// ── 3. Same concept across regions (potential near-dupes to club/global-ise) ──
const byConcept = new Map<string, typeof GUIDES>();
for (const g of GUIDES) {
  const k = conceptKey(g.titleEn);
  if (k.length < 4) continue;
  if (!byConcept.has(k)) byConcept.set(k, []);
  byConcept.get(k)!.push(g);
}
const concepts = [...byConcept]
  .filter(([, gs]) => gs.length > 1)
  .map(([k, gs]) => ({
    k,
    gs,
    regions: new Set(gs.map((g) => g.region)),
  }))
  .sort((a, b) => b.gs.length - a.gs.length);

// ── 4. Description near-duplication (token Jaccard) within shared concept buckets ──
const descTokens = (s: string) => new Set(STEM(s).filter((w) => w.length > 3));
function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
}
const highDesc: { a: string; b: string; sim: number; ra: string; rb: string }[] = [];
for (const { gs } of concepts) {
  for (let i = 0; i < gs.length; i++) {
    for (let j = i + 1; j < gs.length; j++) {
      const sim = jaccard(descTokens(gs[i].descriptionEn), descTokens(gs[j].descriptionEn));
      if (sim >= 0.5) highDesc.push({ a: gs[i].slug, b: gs[j].slug, sim, ra: gs[i].region, rb: gs[j].region });
    }
  }
}

// ── Report ──
console.log('=== CONTENT DUPLICATION AUDIT ===');
console.log(`Guides: ${GUIDES.length} | Exams: ${ENTRANCE_EXAMS.length} | Colleges: ${COLLEGES.length}`);
console.log('');
console.log(`[1] Duplicate guide slugs: ${dupSlugs.length}`, dupSlugs);
console.log('');
console.log(`[2] Identical titles across different slugs: ${sameTitle.length}`);
for (const [t, gs] of sameTitle) console.log(`    "${t}" -> ${gs.map((g) => `${g.slug}(${g.region})`).join(', ')}`);
console.log('');
console.log(`[3] Same concept across MULTIPLE regions (candidates to club / make global): ${concepts.filter((c) => c.regions.size > 1).length} concepts`);
for (const c of concepts.filter((c) => c.regions.size > 1).slice(0, 60)) {
  console.log(`    [${c.gs.length}× across ${c.regions.size} regions] {${c.k}}`);
  for (const g of c.gs) console.log(`        - ${g.slug} (${g.region})`);
}
console.log('');
console.log(`[3b] Same concept within a SINGLE region (possible minor-tweak dupes): ${concepts.filter((c) => c.regions.size === 1).length}`);
for (const c of concepts.filter((c) => c.regions.size === 1).slice(0, 40)) {
  console.log(`    [${c.gs.length}× in ${[...c.regions][0]}] {${c.k}} -> ${c.gs.map((g) => g.slug).join(', ')}`);
}
console.log('');
console.log(`[4] High description similarity (>=0.5 Jaccard) within shared concepts: ${highDesc.length}`);
for (const h of highDesc.sort((a, b) => b.sim - a.sim).slice(0, 40)) {
  console.log(`    ${h.sim.toFixed(2)}  ${h.a}(${h.ra})  ~  ${h.b}(${h.rb})`);
}
