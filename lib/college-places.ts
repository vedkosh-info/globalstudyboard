// ─────────────────────────────────────────────────────────────────────────────
// The university place tree: destination → country → state → city.
//
// Built from COLLEGES at build time (server only — never import this from a
// 'use client' file; scripts/check-tools.ts blocks lib/colleges in client code).
//
// A place gets its own page only when it has at least MIN_PLACE_PROFILES
// profiles AND it narrows its parent (a state whose only city is one city does
// not get a second, identical city page). Its parent must be published too, so
// a published URL never has a missing page above it. Every other place still
// appears as a heading on its parent's page, so the directory is always grouped
// by place even before a place has enough profiles for a page of its own.
// ─────────────────────────────────────────────────────────────────────────────
import { COLLEGES, type College, type CollegeCountry } from './colleges';
import { REGION_SLUGS, getRegionBySlug, type RegionSlug } from './regions';
import { categoryLabel } from './region-nav';
import {
  CITY_ALIASES,
  MIN_PLACE_PROFILES,
  PLACE_COUNTRIES,
  SINGLE_COUNTRY_REGIONS,
  SUBDIVISIONS,
  type PlaceSubdivision,
} from './place-registry';

export type PlaceLevel = 'country' | 'subdivision' | 'city';

export interface PlaceNode {
  region: RegionSlug;
  level: PlaceLevel;
  country: CollegeCountry;
  /** Path segments after /regions/{region}/universities/. */
  segments: string[];
  /** Short name: "Bengaluru", "Karnataka", "Germany". */
  name: string;
  /** Heading form: "Bengaluru, Karnataka", "Karnataka", "United Kingdom". */
  label: string;
  /** Sentence form after "in": "Bengaluru, Karnataka", "the United Kingdom". */
  prose: string;
  colleges: College[];
  children: PlaceNode[];
  parent: PlaceNode | null;
  published: boolean;
}

export const norm = (x: string): string =>
  x
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim();

export const placeSlug = (x: string): string =>
  norm(x)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** City as the place tree uses it: parenthetical notes dropped, one canonical spelling. */
export function placeCityName(c: Pick<College, 'city' | 'country'>): string {
  const bare = c.city.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  return CITY_ALIASES[`${c.country}:${norm(bare)}`] ?? bare;
}

export function subdivisionFor(
  c: Pick<College, 'state' | 'country'>,
): PlaceSubdivision | null | undefined {
  const scheme = SUBDIVISIONS[c.country];
  if (!scheme) return null; // this country has no subdivision level
  if (!c.state) return undefined; // required but missing
  const want = norm(c.state);
  return scheme.entries.find(
    (e) => norm(e.name) === want || (e.aliases ?? []).some((a) => norm(a) === want),
  );
}

interface Step {
  level: PlaceLevel;
  slug: string;
  name: string;
}

/** The place steps for one college, or null when it cannot be placed (the build check reports why). */
function stepsFor(c: College): Step[] | null {
  const steps: Step[] = [];
  const single = SINGLE_COUNTRY_REGIONS[c.region];
  if (single) {
    if (c.country !== single) return null;
  } else {
    steps.push({ level: 'country', slug: c.country, name: PLACE_COUNTRIES[c.country].name });
  }
  const sub = subdivisionFor(c);
  if (sub === undefined) return null;
  if (sub) steps.push({ level: 'subdivision', slug: sub.slug, name: sub.name });
  const city = placeCityName(c);
  const citySlug = placeSlug(city);
  if (!citySlug) return null;
  steps.push({ level: 'city', slug: citySlug, name: city });
  return steps;
}

function labelsFor(level: PlaceLevel, name: string, ancestors: PlaceNode[], country: CollegeCountry) {
  if (level === 'country') {
    return { label: PLACE_COUNTRIES[country].name, prose: PLACE_COUNTRIES[country].proseName };
  }
  if (level === 'subdivision') return { label: name, prose: name };
  // City: "Bengaluru, Karnataka" / "Munich, Germany"; never "Singapore, Singapore".
  const above = ancestors[ancestors.length - 1];
  const tail = above ? (above.level === 'country' ? PLACE_COUNTRIES[country].name : above.name) : '';
  const label = tail && norm(tail) !== norm(name) ? `${name}, ${tail}` : name;
  return { label, prose: label };
}

const byName = (a: College, b: College) => a.nameEn.localeCompare(b.nameEn);

function buildRegion(region: RegionSlug): PlaceNode[] {
  const roots: PlaceNode[] = [];
  const index = new Map<string, PlaceNode>();
  for (const c of COLLEGES) {
    if (c.region !== region) continue;
    const steps = stepsFor(c);
    if (!steps) continue;
    const chain: PlaceNode[] = [];
    for (const step of steps) {
      const segments = [...chain.map((n) => n.segments[n.segments.length - 1]), step.slug];
      const key = segments.join('/');
      let node = index.get(key);
      if (!node) {
        const parent = chain[chain.length - 1] ?? null;
        const { label, prose } = labelsFor(step.level, step.name, chain, c.country);
        node = {
          region,
          level: step.level,
          country: c.country,
          segments,
          name: step.name,
          label,
          prose,
          colleges: [],
          children: [],
          parent,
          published: false,
        };
        index.set(key, node);
        (parent ? parent.children : roots).push(node);
      }
      node.colleges.push(c);
      chain.push(node);
    }
  }
  const regionCount = COLLEGES.filter((c) => c.region === region).length;
  const settle = (nodes: PlaceNode[], parentCount: number, parentPublished: boolean) => {
    nodes.sort((a, b) => a.label.localeCompare(b.label));
    for (const n of nodes) {
      n.colleges.sort(byName);
      n.published =
        parentPublished && n.colleges.length >= MIN_PLACE_PROFILES && n.colleges.length < parentCount;
      // A child of a page that did not narrow its own parent is compared with
      // the nearest published ancestor, but is only published under a
      // published parent (no URL with a missing page above it).
      settle(n.children, n.colleges.length, n.published);
    }
  };
  settle(roots, regionCount, true);
  return roots;
}

let cache: Map<RegionSlug, PlaceNode[]> | null = null;

function tree(): Map<RegionSlug, PlaceNode[]> {
  if (!cache) cache = new Map(REGION_SLUGS.map((r) => [r, buildRegion(r)]));
  return cache;
}

/** Top-level places of a destination (countries, or states for a one-country destination). */
export function placeRoots(region: RegionSlug): PlaceNode[] {
  return tree().get(region) ?? [];
}

function walk(nodes: PlaceNode[], out: PlaceNode[] = []): PlaceNode[] {
  for (const n of nodes) {
    out.push(n);
    walk(n.children, out);
  }
  return out;
}

export function allPlaces(): PlaceNode[] {
  return REGION_SLUGS.flatMap((r) => walk(placeRoots(r)));
}

export function publishedPlaces(): PlaceNode[] {
  return allPlaces().filter((n) => n.published);
}

export function getPlace(region: string, segments: string[]): PlaceNode | undefined {
  const key = segments.join('/');
  return walk(placeRoots(region as RegionSlug)).find((n) => n.segments.join('/') === key);
}

export function placeHref(n: Pick<PlaceNode, 'region' | 'segments'>): string {
  return `/regions/${n.region}/universities/${n.segments.join('/')}`;
}

/** Published places above (and including) this node, top first. */
export function publishedTrail(n: PlaceNode): PlaceNode[] {
  const out: PlaceNode[] = [];
  for (let p: PlaceNode | null = n; p; p = p.parent) if (p.published) out.unshift(p);
  return out;
}

/** Published places that contain this college, top first, for its breadcrumb. */
export function collegePlaceTrail(c: College): PlaceNode[] {
  const steps = stepsFor(c);
  if (!steps) return [];
  let level = placeRoots(c.region);
  let node: PlaceNode | undefined;
  for (const step of steps) {
    node = level.find((n) => n.segments[n.segments.length - 1] === step.slug);
    if (!node) return [];
    level = node.children;
  }
  return node ? publishedTrail(node) : [];
}

/** Nouns for a set of sibling places: { one: "state or union territory", many: "states and union territories" }. */
export function placeKind(nodes: Pick<PlaceNode, 'level' | 'region' | 'country'>[]): { one: string; many: string } {
  const first = nodes[0];
  if (!first) return { one: 'place', many: 'places' };
  if (first.level === 'country') {
    // Hong Kong and Taiwan sit in this destination; the region hub uses the same words.
    return first.region === 'east-southeast-asia'
      ? { one: 'country or territory', many: 'countries and territories' }
      : { one: 'country', many: 'countries' };
  }
  if (first.level === 'subdivision') {
    const scheme = SUBDIVISIONS[first.country];
    return scheme ? { one: scheme.noun, many: scheme.plural } : { one: 'place', many: 'places' };
  }
  return { one: 'city', many: 'cities' };
}

/** "Colleges" for India, "Universities" elsewhere — the region nav's own word. */
export function placeNoun(region: RegionSlug): string {
  return categoryLabel('universities', region);
}

/** Search title within the 70-character limit; drops the tail rather than the place. */
export function placeTitle(n: PlaceNode): string {
  const head = `${placeNoun(n.region)} in ${n.prose}`;
  const full = `${head}: Profiles & How to Apply`;
  return full.length <= 70 ? full : head;
}

export function placeDescription(n: PlaceNode): string {
  const count = n.colleges.length;
  return `Browse ${count} institution profiles in ${n.prose}, with locations, degree levels, official links and admission tests where recorded.`;
}

/** Problems that block the build (scripts/check-places.ts). */
export function placeIssues(): string[] {
  const issues: string[] = [];
  const regionOf = new Map<CollegeCountry, Set<RegionSlug>>();
  for (const c of COLLEGES) {
    const single = SINGLE_COUNTRY_REGIONS[c.region];
    if (single && c.country !== single) {
      issues.push(`${c.slug}: region "${c.region}" is the ${PLACE_COUNTRIES[single].name}, but country is "${c.country}".`);
    }
    const sub = subdivisionFor(c);
    if (sub === undefined) {
      const scheme = SUBDIVISIONS[c.country]!;
      issues.push(
        c.state
          ? `${c.slug}: state "${c.state}" is not a ${scheme.noun} of ${PLACE_COUNTRIES[c.country].name} in lib/place-registry.ts.`
          : `${c.slug}: ${PLACE_COUNTRIES[c.country].name} groups universities by ${scheme.noun}; set \`state\`.`,
      );
    }
    if (!placeSlug(placeCityName(c))) issues.push(`${c.slug}: city "${c.city}" has no usable name.`);
    if (!regionOf.has(c.country)) regionOf.set(c.country, new Set());
    regionOf.get(c.country)!.add(c.region);
  }
  for (const [country, regions] of regionOf) {
    if (regions.size > 1) {
      issues.push(`${country}: colleges sit in more than one destination (${[...regions].join(', ')}); one country, one destination.`);
    }
  }
  // Two spellings of one city ("St Petersburg" / "Saint Petersburg") would
  // become two city pages. Siblings that match once "saint"/"st" and
  // punctuation are ignored must share one spelling or a CITY_ALIASES entry.
  const loose = (x: string) => norm(x).replace(/\b(saint|st)\b\.?/g, '').replace(/[^a-z]/g, '');
  const check = (nodes: PlaceNode[]) => {
    const seen = new Map<string, string>();
    for (const n of nodes) {
      if (n.level === 'city') {
        const k = loose(n.name);
        const prev = seen.get(k);
        if (prev && prev !== n.name) {
          issues.push(`${n.region}/${n.segments.join('/')}: "${prev}" and "${n.name}" look like one city; use one spelling or add CITY_ALIASES.`);
        }
        seen.set(k, n.name);
      }
      check(n.children);
    }
  };
  for (const r of REGION_SLUGS) if (getRegionBySlug(r)) check(placeRoots(r));
  return issues;
}

/** Notes that do not block the build but should be tidied in the record. */
export function placeWarnings(): string[] {
  return COLLEGES.filter((c) => /[()]/.test(c.city)).map(
    (c) => `${c.slug}: city "${c.city}" carries a note in brackets; it is grouped under "${placeCityName(c)}".`,
  );
}
