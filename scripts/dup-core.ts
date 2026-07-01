// ─────────────────────────────────────────────────────────────────────────────
// Shared de-duplication core — tokenization, concept keys, similarity, and the
// resolutions allowlist. Used by BOTH `scripts/dupcheck.ts` (the audit gate) and
// `scripts/find-home.ts` (the merge-first pre-authoring tool) so they agree on
// exactly what "the same content" means. Node-only (never bundled to the client).
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import type { Guide } from '../lib/guides';
import { REGIONS } from '../lib/regions';

/** Country / region / demonym / filler tokens that must NOT drive a "same topic"
 *  key (so "study in usa" and "study in canada" don't look like one concept). */
export const REGION_WORDS = new Set<string>();
for (const r of REGIONS) {
  REGION_WORDS.add(r.slug);
  r.displayName.toLowerCase().split(/[^a-z]+/).forEach((w) => w && REGION_WORDS.add(w));
  r.countries.forEach((c) => c.toLowerCase().split(/[^a-z]+/).forEach((w) => w && REGION_WORDS.add(w)));
}
[
  'usa','us','uk','america','american','britain','british','india','indian','canada','canadian',
  'australia','australian','zealand','europe','european','german','germany','france','french',
  'ireland','irish','russia','russian','gulf','emirates','uae','china','chinese','abroad','overseas',
  'international','students','student','for','the','a','an','to','in','of','and','or','your','you',
  'how','what','is','are','guide','explained','complete','best','vs','which','after','from','with',
  'list','top','do','does','need','should','step','by','about','study','studying','university',
  'universities','college','colleges','course','courses','exam','exams','test','tests','program',
].forEach((w) => REGION_WORDS.add(w));

/** Lowercase → strip punctuation → tokens. */
export const STEM = (s: string): string[] =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

/** Concept key: significant title tokens, region/filler removed, sorted+unique. */
export function conceptKey(title: string): string {
  const toks = Array.from(new Set(STEM(title).filter((w) => w.length > 2 && !REGION_WORDS.has(w))));
  return toks.sort().join(' ');
}

/** Content-bearing token set (drops short words) for similarity comparison. */
export function tokenSet(s: string, minLen = 3): Set<string> {
  return new Set(STEM(s).filter((w) => w.length > minLen));
}

/** Jaccard token overlap ∈ [0,1] — intersection / union. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
}

/** The full readable body of a guide: title + lede + every section's prose &
 *  bullets + every FAQ + every key-fact. This is what the constitution's §11.1a
 *  "full-body token overlap" threshold is measured against — NOT just the
 *  one-line description. */
export function guideFullText(g: Guide): string {
  const parts: string[] = [g.titleEn, g.descriptionEn];
  for (const s of g.sections) {
    parts.push(s.headingEn, s.bodyEn);
    if (s.bullets) parts.push(...s.bullets);
  }
  for (const f of g.faqs) parts.push(f.questionEn, f.answerEn);
  for (const k of g.keyFacts ?? []) parts.push(k.label, k.value);
  return parts.join(' ');
}

// ── Resolutions allowlist ────────────────────────────────────────────────────
// Accepted, reviewed parallels (e.g. genuinely destination-specific guides that
// legitimately share a concept). Listed here so `--strict` does not re-flag them.
// Order-independent slug pairs. See lib/dup-resolutions.json.

export interface DupResolution {
  a: string;
  b: string;
  /** The full-body similarity recorded when this pair was reviewed & accepted. */
  sim?: number;
  reason?: string;
}

/** Order-independent key for a pair of slugs. */
export const pairKey = (a: string, b: string): string => [a, b].sort().join('::');

/** How far above its recorded sim a resolved pair may drift before it re-flags. */
export const RESOLUTION_DRIFT = 0.05;
/** Absolute ceiling — no pair is ever silenced at/above this (a verbatim copy). */
export const RESOLUTION_CEILING = 0.9;

/** Load the accepted-duplicate allowlist → Map(pairKey → recorded sim). Empty if
 *  the file is absent/invalid. A missing `sim` records as 1 (legacy: always
 *  silenced) — prefer setting `sim` so the drift/ceiling guard can re-flag. */
export function loadResolutions(): Map<string, number> {
  const map = new Map<string, number>();
  const p = join(process.cwd(), 'lib/dup-resolutions.json');
  if (!existsSync(p)) return map;
  try {
    const arr = JSON.parse(readFileSync(p, 'utf8')) as DupResolution[];
    for (const r of arr) if (r && r.a && r.b) map.set(pairKey(r.a, r.b), typeof r.sim === 'number' ? r.sim : 1);
  } catch {
    /* malformed file — treat as no resolutions */
  }
  return map;
}

/**
 * Whether a pair is safely allow-listed at its CURRENT similarity. A resolved
 * pair is silenced ONLY while its similarity stays near what was reviewed — if it
 * later drifts up (edited toward a verbatim copy) beyond the drift margin, or
 * crosses the hard ceiling, it re-flags. `sim === undefined` (name-variant scan)
 * falls back to plain membership.
 */
export function isPairResolved(
  resolutions: Map<string, number>,
  a: string,
  b: string,
  sim?: number,
): boolean {
  const recorded = resolutions.get(pairKey(a, b));
  if (recorded === undefined) return false;
  if (sim === undefined) return true;
  if (sim >= RESOLUTION_CEILING) return false;
  return sim <= recorded + RESOLUTION_DRIFT;
}
