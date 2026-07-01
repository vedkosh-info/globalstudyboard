// Merge-first pre-authoring tool (constitution §11.1a step 1–2: "search first,
// write second" + "club/merge by default"). Before writing a NEW guide, run:
//
//   npm run find-home "Proposed guide title here"
//
// It surfaces the existing guides your material is closest to AND lists each
// candidate's section headings — so you can decide to ADD your content to an
// existing page/section instead of creating a near-duplicate new page. If nothing
// is close, it tells you the topic looks novel (still run dup:check after writing).
import { GUIDES } from '../lib/guides';
import { conceptKey, tokenSet, jaccard } from './dup-core';

const title = process.argv.slice(2).filter((a) => !a.startsWith('--')).join(' ').trim();

if (!title) {
  console.error('Usage: npm run find-home "Proposed guide title"');
  process.exit(2);
}

const propConcept = conceptKey(title);
const propTok = tokenSet(title, 2);

interface Cand {
  slug: string;
  region: string;
  title: string;
  score: number;
  conceptExact: boolean;
  sections: string[];
}

const scored: Cand[] = GUIDES.map((g) => {
  const conceptExact = propConcept.length >= 4 && conceptKey(g.titleEn) === propConcept;
  const titleSim = jaccard(propTok, tokenSet(`${g.titleEn} ${g.descriptionEn}`, 2));
  const score = titleSim + (conceptExact ? 0.5 : 0);
  return {
    slug: g.slug,
    region: g.region,
    title: g.titleEn,
    score,
    conceptExact,
    sections: g.sections.map((s) => s.headingEn),
  };
})
  .filter((c) => c.score > 0.08 || c.conceptExact)
  .sort((a, b) => b.score - a.score)
  .slice(0, 8);

console.log('=== FIND HOME — merge-first check ===');
console.log(`Proposed: "${title}"`);
console.log(`Concept key: {${propConcept}}`);
console.log('');

if (scored.length === 0) {
  console.log('No close existing guide found — this topic looks NOVEL.');
  console.log('Safe to author a new guide. Re-run `npm run dup:check` after writing to confirm.');
  process.exit(0);
}

const strong = scored.filter((c) => c.conceptExact || c.score >= 0.4);
if (strong.length > 0) {
  console.log('⚠ CLOSE MATCH — prefer ADDING to / expanding an existing guide over a new page:');
} else {
  console.log('Nearest existing guides (likely distinct, but confirm you are not duplicating):');
}
console.log('');

for (const c of scored) {
  const flag = c.conceptExact ? ' [SAME CONCEPT]' : c.score >= 0.4 ? ' [STRONG OVERLAP]' : '';
  console.log(`  ${c.score.toFixed(2)}  ${c.slug}  (${c.region})${flag}`);
  console.log(`        ${c.title}`);
  console.log(`        sections: ${c.sections.join(' · ')}`);
  console.log('');
}

console.log('Decision (§11.1a):');
console.log('  • If your material fits one of the above, ADD it there (extend a section or add one)');
console.log('    — do NOT create a second page. Update relatedGuideSlugs + tags as needed.');
console.log('  • Only author a NEW guide if the topic is genuinely distinct; then run `npm run dup:check`.');
