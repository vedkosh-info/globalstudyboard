// Anti-duplication pre-flight (constitution §11.1a). Run BEFORE adding any
// content and as part of the independent QA pass:
//   npm run dup:check          (advisory report)
//   npm run dup:check:strict   (exits non-zero on a real duplicate — CI/pre-ship)
//
// Surfaces, for GUIDES:
//   [1] duplicate slugs, [2] identical titles,
//   [3] same-concept clusters ACROSS regions (club / make-global candidates),
//   [3b] same-concept WITHIN one region (minor-tweak suspects),
//   [4] high DESCRIPTION similarity, and
//   [5] high FULL-BODY similarity (title + all section prose + bullets + FAQs) —
//       the real signal for a copy-with-words-swapped page (§11.1a's 0.35 rule).
// And, for COLLEGES and EXAMS, [6] near-duplicate names within a region.
//
// A flag is a prompt to update/club an existing unit — not necessarily a defect
// (genuinely destination-specific parallels are allowed per §16.4, and reviewed
// pairs can be recorded in lib/dup-resolutions.json so --strict won't re-flag).
import { GUIDES } from '../lib/guides';
import { ENTRANCE_EXAMS } from '../lib/admission-guides';
import { COLLEGES } from '../lib/colleges';
import {
  conceptKey,
  tokenSet,
  jaccard,
  guideFullText,
  loadResolutions,
  isPairResolved,
  STEM,
} from './dup-core';

const STRICT = process.argv.includes('--strict');

// Thresholds (constitution §11.1a): within one region a high overlap is a
// minor-tweak duplicate; across regions a higher bar allows real destination
// parallels. Description uses the legacy 0.5; full-body uses the 0.35/0.5 rule.
const DESC_SIM = 0.5;
// Same-region full-body: 0.35 is the constitution's "too similar" line (WARN /
// backlog); 0.55 is the near-verbatim "obvious duplicate" line (hard BLOCK in
// --strict). Cross-region parallels get a higher bar (they may be legitimate).
const BODY_SIM_SAME_REGION = 0.35;
const BODY_STRICT_BLOCK = 0.55;
const BODY_SIM_CROSS_REGION = 0.5;

// Generic institution/type words dropped before comparing college/exam names, so
// "IIT Bombay" vs "IIT Delhi" aren't flagged (distinguishing tokens bombay≠delhi),
// while true variants ("Stanford University" vs "Stanford Univ") collapse to the
// same residual and ARE flagged.
const NAME_STOPWORDS = new Set<string>([
  'university', 'universities', 'univ', 'institute', 'institutes', 'institution',
  'technology', 'tech', 'college', 'colleges', 'school', 'of', 'the', 'and',
  'national', 'state', 'central', 'higher', 'education', 'sciences', 'science',
  'studies', 'campus', 'deemed', 'be',
]);
const residualName = (name: string): string =>
  Array.from(new Set(STEM(name).filter((w) => w.length > 1 && !NAME_STOPWORDS.has(w))))
    .sort()
    .join(' ');

const resolved = loadResolutions();

// ── 1. Exact duplicate slugs (should be zero — CMI enforces) ──
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

// ── 3. Same concept clusters (club / make-global candidates) ──
const byConcept = new Map<string, typeof GUIDES>();
for (const g of GUIDES) {
  const k = conceptKey(g.titleEn);
  if (k.length < 4) continue;
  if (!byConcept.has(k)) byConcept.set(k, []);
  byConcept.get(k)!.push(g);
}
const concepts = [...byConcept]
  .filter(([, gs]) => gs.length > 1)
  .map(([k, gs]) => ({ k, gs, regions: new Set(gs.map((g) => g.region)) }))
  .sort((a, b) => b.gs.length - a.gs.length);

// ── 4. Description similarity within shared concept buckets (advisory) ──
const descTok = new Map<string, Set<string>>();
const bodyTok = new Map<string, Set<string>>();
for (const g of GUIDES) {
  descTok.set(g.slug, tokenSet(g.descriptionEn));
  bodyTok.set(g.slug, tokenSet(guideFullText(g)));
}
interface Pair { a: string; b: string; sim: number; ra: string; rb: string; sameRegion: boolean }
const highDesc: Pair[] = [];
for (const { gs } of concepts) {
  for (let i = 0; i < gs.length; i++) {
    for (let j = i + 1; j < gs.length; j++) {
      const a = gs[i];
      const b = gs[j];
      const dsim = jaccard(descTok.get(a.slug)!, descTok.get(b.slug)!);
      if (dsim >= DESC_SIM && !isPairResolved(resolved, a.slug, b.slug, dsim)) {
        highDesc.push({ a: a.slug, b: b.slug, sim: dsim, ra: a.region, rb: b.region, sameRegion: a.region === b.region });
      }
    }
  }
}

// ── 5. FULL-BODY similarity. SOUND: same-region is compared over the WHOLE
//   within-region pair space (NOT pre-filtered by concept key — a name-swap copy
//   with a different title must still be caught). Cross-region stays within
//   concept buckets (legitimate destination parallels get a higher bar). ──
const bodySame: Pair[] = [];
const byRegionAll = new Map<string, typeof GUIDES>();
for (const g of GUIDES) {
  if (!byRegionAll.has(g.region)) byRegionAll.set(g.region, []);
  byRegionAll.get(g.region)!.push(g);
}
for (const gs of byRegionAll.values()) {
  for (let i = 0; i < gs.length; i++) {
    for (let j = i + 1; j < gs.length; j++) {
      const a = gs[i];
      const b = gs[j];
      const bsim = jaccard(bodyTok.get(a.slug)!, bodyTok.get(b.slug)!);
      if (bsim >= BODY_SIM_SAME_REGION && !isPairResolved(resolved, a.slug, b.slug, bsim)) {
        bodySame.push({ a: a.slug, b: b.slug, sim: bsim, ra: a.region, rb: b.region, sameRegion: true });
      }
    }
  }
}
bodySame.sort((a, b) => b.sim - a.sim);

const bodyCross: Pair[] = [];
for (const { gs } of concepts) {
  for (let i = 0; i < gs.length; i++) {
    for (let j = i + 1; j < gs.length; j++) {
      const a = gs[i];
      const b = gs[j];
      if (a.region === b.region) continue; // same-region handled above
      const bsim = jaccard(bodyTok.get(a.slug)!, bodyTok.get(b.slug)!);
      if (bsim >= BODY_SIM_CROSS_REGION && !isPairResolved(resolved, a.slug, b.slug, bsim)) {
        bodyCross.push({ a: a.slug, b: b.slug, sim: bsim, ra: a.region, rb: b.region, sameRegion: false });
      }
    }
  }
}
bodyCross.sort((a, b) => b.sim - a.sim);

const bodyBlockers = bodySame.filter((h) => h.sim >= BODY_STRICT_BLOCK);

// ── 6. Same-entity name variants within a region (true dupes, not siblings) ──
// Flags only when the DISTINGUISHING residual of two names is identical after
// generic type-words are stripped — e.g. a typo/format variant of one school.
interface NameHit { kind: 'college' | 'exam'; a: string; b: string; residual: string; region: string }
const nameHits: NameHit[] = [];
function scanNames(kind: 'college' | 'exam', items: { slug: string; name: string; region: string }[]) {
  const byRegion = new Map<string, typeof items>();
  for (const it of items) {
    if (!byRegion.has(it.region)) byRegion.set(it.region, []);
    byRegion.get(it.region)!.push(it);
  }
  for (const group of byRegion.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (isPairResolved(resolved, group[i].slug, group[j].slug)) continue;
        const ra = residualName(group[i].name);
        const rb = residualName(group[j].name);
        if (ra && ra === rb) {
          nameHits.push({ kind, a: group[i].slug, b: group[j].slug, residual: ra, region: group[i].region });
        }
      }
    }
  }
}
scanNames('college', COLLEGES.map((c) => ({ slug: c.slug, name: c.nameEn, region: c.region })));
scanNames('exam', ENTRANCE_EXAMS.map((e) => ({ slug: e.slug, name: e.shortName, region: String(e.region) })));

// ── Report ──
console.log('=== CONTENT DUPLICATION AUDIT ===');
console.log(`Guides: ${GUIDES.length} | Exams: ${ENTRANCE_EXAMS.length} | Colleges: ${COLLEGES.length}`);
console.log(`Resolutions on file (baselined / accepted pairs, sim-stamped): ${resolved.size}`);
console.log('');
console.log(`[1] Duplicate guide slugs: ${dupSlugs.length}`, dupSlugs);
console.log('');
console.log(`[2] Identical titles across different slugs: ${sameTitle.length}`);
for (const [t, gs] of sameTitle) console.log(`    "${t}" -> ${gs.map((g) => `${g.slug}(${g.region})`).join(', ')}`);
console.log('');
console.log(`[3] Same concept across MULTIPLE regions (club / make-global candidates): ${concepts.filter((c) => c.regions.size > 1).length}`);
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
console.log(`[4] High DESCRIPTION similarity (>=${DESC_SIM}): ${highDesc.length}`);
for (const h of highDesc.sort((a, b) => b.sim - a.sim).slice(0, 40)) {
  console.log(`    ${h.sim.toFixed(2)}  ${h.a}(${h.ra})  ~  ${h.b}(${h.rb})${h.sameRegion ? '  [SAME REGION]' : ''}`);
}
console.log('');
console.log(`[5] SAME-REGION FULL-BODY overlap (unresolved): ${bodySame.length} pairs >=${BODY_SIM_SAME_REGION}  (of which ${bodyBlockers.length} >=${BODY_STRICT_BLOCK} = --strict blockers)`);
console.log(`    § The 0.35 line is the constitution's "too similar" target; 0.55+ is a near-verbatim / name-swap duplicate.`);
for (const h of bodySame.slice(0, 60)) {
  console.log(`    ${h.sim.toFixed(2)}  ${h.a}  ~  ${h.b}  (${h.ra})${h.sim >= BODY_STRICT_BLOCK ? '  [BLOCK]' : ''}`);
}
console.log('');
console.log(`[5x] CROSS-REGION full-body overlap (unresolved, within a shared concept, >=${BODY_SIM_CROSS_REGION}): ${bodyCross.length}`);
for (const h of bodyCross.slice(0, 30)) {
  console.log(`    ${h.sim.toFixed(2)}  ${h.a}(${h.ra})  ~  ${h.b}(${h.rb})`);
}
console.log('');
console.log(`[6] Same-entity name variants within a region (identical residual name): ${nameHits.length}`);
for (const h of nameHits.slice(0, 40)) {
  console.log(`    [${h.kind}] ${h.a}  ~  ${h.b}  (${h.region})  {${h.residual}}`);
}

// Backlog warning (advisory, never blocks): same-region pairs in the 0.35–0.55
// band exceed the constitution's target but aren't near-verbatim. Surface the
// count so the differentiation backlog stays visible.
const backlog = bodySame.filter((h) => h.sim < BODY_STRICT_BLOCK);
if (backlog.length) {
  console.log(`⚠ BACKLOG: ${backlog.length} same-region pair(s) in the ${BODY_SIM_SAME_REGION}–${BODY_STRICT_BLOCK} band exceed the §11.1a target — differentiate over time (not a --strict blocker).`);
  console.log('');
}

// ── Strict gate — block on a real, unacknowledged duplicate ──
if (STRICT) {
  const blockers: string[] = [];
  if (dupSlugs.length) blockers.push(`${dupSlugs.length} duplicate slug(s)`);
  if (sameTitle.length) blockers.push(`${sameTitle.length} identical title(s)`);
  if (bodyBlockers.length) blockers.push(`${bodyBlockers.length} same-region near-verbatim (>=${BODY_STRICT_BLOCK}) pair(s)`);

  if (blockers.length) {
    console.error('✖ STRICT: ' + blockers.join('; ') + '.');
    for (const h of bodyBlockers) console.error(`    ${h.sim.toFixed(2)}  ${h.a}  ~  ${h.b}  (${h.ra})`);
    console.error('  Club/merge the duplicate into one canonical unit, or — if it is a genuinely');
    console.error('  distinct destination parallel — record the reviewed pair (with its sim) in');
    console.error('  lib/dup-resolutions.json.');
    process.exit(1);
  }
  console.log('✔ STRICT: no duplicate slugs, identical titles, or same-region near-verbatim duplicates.');
}
