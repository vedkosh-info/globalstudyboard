// CMI command-line runner.
//   npm run cmi:validate  → validate the catalogue; exit 1 on any error.
//   npm run cmi:build     → validate, then write a JSON registry snapshot.
//
// See `.claude/rules/content-policy.md` §11. Run before adding content and
// before shipping; 0 errors required.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTENT_INDEX, validateContent } from '../lib/cmi';

const build = process.argv.includes('--build');
const report = validateContent();

console.log('\nContent Master Index (CMI)');
console.log('──────────────────────────');
console.log(
  `Indexed: ${report.counts.total} units ` +
    `(${report.counts.colleges} colleges, ${report.counts.exams} exams, ${report.counts.regions} regions, ${report.counts.guides} guides)`,
);

if (report.warnings.length > 0) {
  console.log(`\n⚠ ${report.warnings.length} warning(s):`);
  for (const w of report.warnings) console.log(`  · ${w}`);
}

if (report.errors.length > 0) {
  console.error(`\n✖ ${report.errors.length} error(s):`);
  for (const e of report.errors) console.error(`  ✖ ${e}`);
  console.error('\nCMI validation FAILED. Fix the errors above before shipping.\n');
  process.exit(1);
}

console.log('\n✓ CMI validation passed — 0 errors.');

if (build) {
  const out = join(process.cwd(), 'lib', 'content-index.generated.json');
  writeFileSync(out, JSON.stringify(CONTENT_INDEX, null, 2) + '\n', 'utf8');
  console.log(`✓ Wrote registry snapshot: ${out} (${CONTENT_INDEX.length} units).`);
}

console.log('');
