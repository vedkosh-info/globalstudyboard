/**
 * Build gate for university profiles (`docs/COLLEGE_PROFILE_ARCHITECTURE.md`).
 *
 * Runs in `prebuild` and via `npm run colleges:check`. Fails the build when:
 *   - COLLEGES has fewer than 130 profiles, or duplicate normalized name + country + city;
 *   - a record has `contentUpdated` without `lastVerified`, or `contentUpdated` is not a
 *     real non-future calendar date after `lastVerified`;
 *   - `system` is set without `category`, or outside the closed `CollegeSystem` union;
 *   - `control` is set on a public or private research category, or without an allowed category;
 *   - `specializations` disagrees with `deriveSpecializations(organisation)`, or is set while
 *     `organisation` is empty;
 *   - `organisation[].sourceUrl`, `instructionNote.sourceUrl`, `applyLines[].sourceUrl`,
 *     `sources[].url`, or `websiteUrl` (on a categorized record, or when present) is not https;
 *   - a record with `category` has:
 *       * no `lastVerified` (or invalid date),
 *       * `courses` other than `[]`,
 *       * `type` other than `legacyTypeFor(c)`,
 *       * `descriptionEn` other than `collegeIdentityLine(c)`,
 *       * a `qs` or `the` ranking number without `qsYear` / `theYear`,
 *       * fewer than two `sources` entries, or every source URL is only an apex/front page,
 *       * latest source read is inconsistent with `lastVerified` and any later partial edit date,
 *       * banned editorial tokens in `descriptionEn`, `instructionNote.text`, or `applyLines[].text`.
 */

import { COLLEGES } from '../lib/colleges';
import { GUIDES } from '../lib/guides';
import { DEDICATED_COLLEGE_GUIDE } from '../lib/college-guides';
import {
  BANNED_COLLEGE_PROSE_RE,
  COLLEGE_CATEGORIES,
  COLLEGE_SYSTEMS,
  SPECIALIZATIONS,
  collegeIdentityLine,
  deriveSpecializations,
  legacyTypeFor,
} from '../lib/college-taxonomy';

const problems: string[] = [];

const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const validCategories = new Set<string>(COLLEGE_CATEGORIES);
const validSystems = new Set<string>(COLLEGE_SYSTEMS);
const validSpecializations = new Set<string>(SPECIALIZATIONS);
const controlAllowedCategories = new Set<string>([
  'institute-of-technology',
  'liberal-arts-college',
  'specialist-school',
]);

function dateProblem(d: string): string | null {
  const t = new Date(`${d}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(t.getTime()) || t.toISOString().slice(0, 10) !== d) {
    return 'is not a real YYYY-MM-DD calendar date';
  }
  const latestToday = new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return d > latestToday ? 'is in the future' : null;
}

function checkHttpsUrl(where: string, url: string | undefined): URL | null {
  if (!url) {
    problems.push(`${where}: URL is missing`);
    return null;
  }
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') {
      problems.push(`${where}: URL is not https — ${url}`);
      return null;
    }
    return u;
  } catch {
    problems.push(`${where}: URL does not parse — ${url}`);
    return null;
  }
}

function isApexUrl(u: URL): boolean {
  const path = u.pathname.replace(/\/+$/, '');
  return path === '' && !u.search;
}

if (COLLEGES.length < 130) {
  problems.push(`COLLEGES has ${COLLEGES.length} records — expected at least 130`);
}

const entities = new Map<string, string>();

for (const c of COLLEGES) {
  const where = `colleges/${c.slug || c.id}`;

  const entityKey = `${norm(c.nameEn)}|${c.country}|${norm(c.city)}`;
  if (entities.has(entityKey)) {
    problems.push(
      `${where}: duplicate normalized name + country + city with "${entities.get(entityKey)}" (${c.nameEn}, ${c.city}, ${c.country})`,
    );
  } else {
    entities.set(entityKey, c.slug);
  }

  if (c.lastVerified !== undefined) {
    const p = dateProblem(c.lastVerified);
    if (p) problems.push(`${where}: lastVerified (${c.lastVerified}) ${p}`);
  }

  if (c.contentUpdated !== undefined) {
    const p = dateProblem(c.contentUpdated);
    if (p) problems.push(`${where}: contentUpdated (${c.contentUpdated}) ${p}`);
    else if (!c.lastVerified) {
      problems.push(`${where}: contentUpdated is set without lastVerified`);
    } else if (c.contentUpdated <= c.lastVerified) {
      problems.push(`${where}: contentUpdated (${c.contentUpdated}) is not after lastVerified (${c.lastVerified})`);
    }
  }

  if (c.system !== undefined) {
    if (!c.category) {
      problems.push(`${where}: system "${c.system}" is set but category is missing`);
    }
    if (!validSystems.has(c.system)) {
      problems.push(`${where}: system "${c.system}" is not a valid CollegeSystem`);
    }
  }

  if (c.control !== undefined) {
    if (c.control !== 'public' && c.control !== 'private') {
      problems.push(`${where}: control "${c.control}" must be 'public' or 'private'`);
    }
    if (!c.category || !controlAllowedCategories.has(c.category)) {
      problems.push(
        `${where}: control "${c.control}" is set on category "${c.category ?? 'none'}" — only allowed on institute-of-technology, liberal-arts-college, or specialist-school`,
      );
    }
  }

  if (c.organisation !== undefined && c.organisation.length === 0) {
    problems.push(`${where}: organisation is an empty array — omit the field when no units are recorded`);
  }

  for (const [i, u] of (c.organisation ?? []).entries()) {
    if (!u.name.trim()) problems.push(`${where}: organisation[${i}].name is empty`);
    if (!validSpecializations.has(u.specialization)) {
      problems.push(`${where}: organisation[${i}].specialization "${u.specialization}" is invalid`);
    }
    checkHttpsUrl(`${where}/organisation[${i}]`, u.sourceUrl);
    if (u.readOn !== undefined) {
      const p = dateProblem(u.readOn);
      if (p) problems.push(`${where}: organisation[${i}].readOn (${u.readOn}) ${p}`);
    }
  }

  if (c.instructionNote) {
    if (!c.instructionNote.text.trim()) problems.push(`${where}: instructionNote.text is empty`);
    checkHttpsUrl(`${where}/instructionNote`, c.instructionNote.sourceUrl);
    if (BANNED_COLLEGE_PROSE_RE.test(c.instructionNote.text)) {
      problems.push(`${where}: instructionNote.text contains a banned editorial token`);
    }
    if (c.instructionNote.readOn !== undefined) {
      const p = dateProblem(c.instructionNote.readOn);
      if (p) problems.push(`${where}: instructionNote.readOn (${c.instructionNote.readOn}) ${p}`);
    }
  }

  const applySlot = new Set<string>();
  for (const [i, a] of (c.applyLines ?? []).entries()) {
    if (a.audience !== 'domestic' && a.audience !== 'international') {
      problems.push(`${where}: applyLines[${i}].audience must be domestic or international`);
    }
    const slot = `${a.audience}:${a.level ?? 'all'}`;
    if (applySlot.has(slot)) {
      problems.push(`${where}: applyLines has two lines for ${slot}. Use one line, or split undergraduate and postgraduate.`);
    }
    applySlot.add(slot);
    if (a.level !== undefined && a.level !== 'undergraduate' && a.level !== 'postgraduate' && a.level !== 'all') {
      problems.push(`${where}: applyLines[${i}].level is invalid`);
    }
    if (!a.text.trim()) problems.push(`${where}: applyLines[${i}].text is empty`);
    checkHttpsUrl(`${where}/applyLines[${i}]`, a.sourceUrl);
    if (BANNED_COLLEGE_PROSE_RE.test(a.text)) {
      problems.push(`${where}: applyLines[${i}].text contains a banned editorial token`);
    }
    if (a.readOn !== undefined) {
      const p = dateProblem(a.readOn);
      if (p) problems.push(`${where}: applyLines[${i}].readOn (${a.readOn}) ${p}`);
    }
  }

  for (const [i, s] of (c.sources ?? []).entries()) {
    if (!s.label.trim()) problems.push(`${where}: sources[${i}].label is empty`);
    checkHttpsUrl(`${where}/sources[${i}]`, s.url);
    const p = dateProblem(s.readOn);
    if (p) problems.push(`${where}: sources[${i}].readOn (${s.readOn}) ${p}`);
  }

  if (c.websiteUrl !== undefined) {
    checkHttpsUrl(`${where}/websiteUrl`, c.websiteUrl);
  }

  const expectedSpecs = deriveSpecializations(c.organisation);
  if (c.specializations !== undefined) {
    if (!c.organisation?.length) {
      problems.push(`${where}: specializations is set while organisation is empty`);
    } else if (
      c.specializations.length !== expectedSpecs.length ||
      c.specializations.some((s, i) => s !== expectedSpecs[i])
    ) {
      problems.push(
        `${where}: specializations (${c.specializations.join(', ')}) disagrees with deriveSpecializations(organisation) (${expectedSpecs.join(', ')})`,
      );
    }
  } else if (c.organisation?.length) {
    problems.push(`${where}: organisation is non-empty but specializations was not derived (missing withDerived)`);
  }

  if (c.category !== undefined) {
    if (!validCategories.has(c.category)) {
      problems.push(`${where}: category "${c.category}" is not in COLLEGE_CATEGORIES`);
    }
    if (!c.lastVerified) {
      problems.push(`${where}: category is set but lastVerified is missing`);
    }
    if (c.courses.length !== 0) {
      problems.push(`${where}: category is set so courses must be [] (got ${c.courses.length} item(s))`);
    }
    const expectedLegacyType = legacyTypeFor(c);
    if (c.type !== expectedLegacyType) {
      problems.push(`${where}: type is "${c.type}", expected "${expectedLegacyType}" from legacyTypeFor`);
    }
    if (validCategories.has(c.category)) {
      const expectedLine = collegeIdentityLine(c);
      if (c.descriptionEn !== expectedLine) {
        problems.push(
          `${where}: descriptionEn does not match collegeIdentityLine — got "${c.descriptionEn}", expected "${expectedLine}"`,
        );
      }
    }
    if (BANNED_COLLEGE_PROSE_RE.test(c.descriptionEn)) {
      problems.push(`${where}: descriptionEn contains a banned editorial token`);
    }
    if (c.ranking?.qs !== undefined && !c.ranking.qsYear) {
      problems.push(`${where}: ranking.qs (${c.ranking.qs}) has no qsYear`);
    }
    if (c.ranking?.the !== undefined && !c.ranking.theYear) {
      problems.push(`${where}: ranking.the (${c.ranking.the}) has no theYear`);
    }
    checkHttpsUrl(`${where}/websiteUrl`, c.websiteUrl);

    if (!c.sources || c.sources.length < 2) {
      problems.push(`${where}: a categorized record needs at least 2 sources entries (got ${c.sources?.length ?? 0})`);
    } else {
      const parsedSources = c.sources
        .map((s, i) => checkHttpsUrl(`${where}/sources[${i}]`, s.url))
        .filter((u): u is URL => u !== null);
      if (parsedSources.length > 0 && parsedSources.every(isApexUrl)) {
        problems.push(`${where}: every source URL in sources[] is only an apex/root URL`);
      }
      for (const [i, u] of parsedSources.entries()) {
        if (isApexUrl(u)) {
          problems.push(`${where}: sources[${i}].url (${u.href}) is a site root — cite the specific page`);
        }
      }
    }

    const readDates = [
      ...(c.sources ?? []).map((s) => s.readOn),
      ...(c.organisation ?? []).map((u) => u.readOn).filter((d): d is string => Boolean(d)),
      ...(c.instructionNote?.readOn ? [c.instructionNote.readOn] : []),
      ...(c.applyLines ?? []).map((a) => a.readOn).filter((d): d is string => Boolean(d)),
    ];
    if (readDates.length === 0) {
      problems.push(`${where}: categorized record has no readOn dates`);
    } else {
      const latestReadOn = [...readDates].sort().pop()!;
      if (c.contentUpdated && c.lastVerified && (latestReadOn < c.lastVerified || latestReadOn > c.contentUpdated)) {
        problems.push(`${where}: latest readOn (${latestReadOn}) must be between lastVerified and contentUpdated`);
      } else if (!c.contentUpdated && c.lastVerified !== latestReadOn) {
        problems.push(
          `${where}: lastVerified (${c.lastVerified ?? 'unset'}) does not equal latest readOn (${latestReadOn})`,
        );
      }
    }
  }
}

// Each featured "Full admissions guide" must be a real guide about a real college,
// and the guide must list that college (lib/college-guides.ts).
{
  const collegeSlugs = new Set(COLLEGES.map((c) => c.slug));
  const guideBySlug = new Map(GUIDES.map((g) => [g.slug, g]));
  for (const [collegeSlug, guideSlug] of Object.entries(DEDICATED_COLLEGE_GUIDE)) {
    const where = `college-guides ${collegeSlug}`;
    const guide = guideBySlug.get(guideSlug);
    if (!collegeSlugs.has(collegeSlug)) problems.push(`${where}: no college with this slug`);
    if (!guide) problems.push(`${where}: no guide '${guideSlug}'`);
    else if (!guide.relatedCollegeSlugs.includes(collegeSlug)) {
      problems.push(`${where}: guide '${guideSlug}' does not list this college in relatedCollegeSlugs`);
    }
  }
}

if (problems.length) {
  console.error(`check-colleges: ${problems.length} problem(s)\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}

const categorizedCount = COLLEGES.filter((c) => Boolean(c.category)).length;
console.log(
  `check-colleges: ${COLLEGES.length} colleges (${categorizedCount} categorized, ${COLLEGES.length - categorizedCount} legacy) — OK`,
);
