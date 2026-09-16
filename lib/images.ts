// Image resolver — how ~100–360 images cover 3,480 pages.
//
// Coverage comes from a FALLBACK CHAIN, not a 1:1 page→image mapping:
//   explicit → field → journey → exam → region → site default → null
// Every tier is optional; a page passes whatever it knows and gets the most specific
// image that actually exists. When nothing matches, `null` is returned and
// <ContentImage> renders nothing — so a page can never show a broken image, and
// wiring this into a template before the library exists is a zero-visual-change no-op.
//
// CLIENT-BUNDLE GUARD (binding — see the Breadcrumbs→cmi→GUIDES 15.7 MB incident):
// this module MUST stay a leaf. It imports ONLY the generated registry (a plain
// object of strings/numbers) and a type-only RegionSlug. Never import guides,
// colleges, topics, tracks or cmi here, and never make this file 'use client'.
//
// Rotation: within a folder, `seed` (usually the page slug) picks a stable member
// deterministically, so a cluster of 400 guides fans out across every image in that
// folder instead of all showing the first one — and the same page always gets the
// same image (no flicker between builds or between SSR and hydration).

import type { RegionSlug } from '@/lib/regions';
import { IMAGE_REGISTRY, type RegistryEntry } from './images.generated';

export type ImageAsset = RegistryEntry & { key: string };

export interface ImageQuery {
  /** Exact registry key, e.g. 'common/fields/computer-science-lab'. Wins outright. */
  explicit?: string;
  /** Field-of-study image name under common/fields/, e.g. 'computer-science-lab'. */
  field?: string;
  /** Application-journey concept under common/journey/, e.g. 'application-checklist'. */
  journey?: string;
  /** Exam concept under common/exams/, e.g. 'exam-hall-empty-desks'. */
  exam?: string;
  /** Destination — falls back to any image under regions/<slug>/. */
  region?: RegionSlug;
  /** Last resort, a site/hero/* key. Defaults to the homepage hero. */
  siteDefault?: string;
  /** Stable per-page seed for rotation within a folder (use the page slug). */
  seed?: string;
}

const DEFAULT_SITE_HERO = 'site/hero/homepage-campus-avenue-dawn';

// Small, fast, deterministic string hash (FNV-1a 32-bit). Not for security.
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** Registry keys sorted once, so folder lookups are cheap and stable. */
const KEYS: readonly string[] = Object.keys(IMAGE_REGISTRY).sort();

function get(key: string): ImageAsset | null {
  // Own-property check: a key such as 'constructor' or 'toString' is truthy on any
  // plain object and would otherwise return a bogus asset with no src/alt.
  if (!Object.hasOwn(IMAGE_REGISTRY, key)) return null;
  return { ...IMAGE_REGISTRY[key], key };
}

/** Deterministically pick one existing image under `prefix/` using `seed`. */
function pickFrom(prefix: string, seed: string | undefined): ImageAsset | null {
  return pickFromPools([prefix], seed);
}

/**
 * Pick from the UNION of several folders. Used where a page class is a landing page (a
 * topic hub) rather than a specific place or concept, so region-agnostic site heroes can
 * share the load with a thin region folder instead of 300 hubs rotating across 2–3 images.
 * Order-stable and deterministic: same seed → same image across builds.
 */
function pickFromPools(prefixes: readonly string[], seed: string | undefined): ImageAsset | null {
  const ps = prefixes.map((x) => (x.endsWith('/') ? x : `${x}/`));
  const pool = KEYS.filter((k) => ps.some((p) => k.startsWith(p)));
  if (!pool.length) return null;
  const i = seed ? hash(seed) % pool.length : 0;
  return get(pool[i]);
}

/**
 * Resolve the best available image for a page. Returns `null` when the library has
 * nothing suitable — callers render nothing in that case, never a placeholder.
 */
export function imageFor(q: ImageQuery): ImageAsset | null {
  if (q.explicit) {
    const hit = get(q.explicit);
    if (hit) return hit;
  }
  if (q.field) {
    const hit = get(`common/fields/${q.field}`);
    if (hit) return hit;
  }
  if (q.journey) {
    const hit = get(`common/journey/${q.journey}`);
    if (hit) return hit;
  }
  if (q.exam) {
    const hit = get(`common/exams/${q.exam}`);
    if (hit) return hit;
  }
  if (q.region) {
    const hit = pickFrom(`regions/${q.region}`, q.seed);
    if (hit) return hit;
  }
  return get(q.siteDefault ?? DEFAULT_SITE_HERO) ?? pickFrom('site/hero', q.seed);
}

/** Rotate across a whole folder (e.g. 'common/fields') — for list/grid thumbs. */
export function imageFromFolder(prefix: string, seed?: string): ImageAsset | null {
  return pickFrom(prefix, seed);
}

/** How many images the library currently holds (for admin/debug output only). */
export function imageLibrarySize(): number {
  return KEYS.length;
}

// ---------------------------------------------------------------- page helpers
// Thin, typed conveniences so templates don't hand-build queries. Type-only imports
// keep this module a leaf (erased at build).

import type { GuideCategory } from '@/lib/guides';

/**
 * Neutral journey scenes per guide category for a guide with NO recognisable
 * subject — deliberately not the whole folder: an India "choose a stream after
 * 10th" guide must never rotate onto the airport or the passport, and a funding
 * guide never onto a dorm room.
 */
const GUIDE_CATEGORY_POOL: Partial<Record<GuideCategory, readonly string[]>> = {
  admissions: [
    'common/journey/admission-letter',
    'common/journey/application-checklist',
    'common/journey/decision-day-calendar',
    'common/journey/night-study-setup',
    'common/journey/orientation-auditorium',
    'common/journey/research-thesis-desk',
    'common/journey/graduation-still-life',
  ],
  'study-abroad': [
    'common/journey/choosing-destination-globe',
    'common/journey/study-abroad-passport',
    'common/journey/airport-departure',
    'common/journey/packing-suitcase',
    'common/journey/orientation-auditorium',
    'common/journey/student-dorm-room',
  ],
  scholarships: [
    'common/journey/scholarship-funding',
    'common/journey/education-loan',
    'common/journey/budgeting-abroad',
  ],
};

/** Deterministically pick one EXISTING key from an explicit list using `seed`. */
function pickFromKeys(keys: readonly string[], seed: string | undefined): ImageAsset | null {
  const pool = keys.filter((k) => Object.hasOwn(IMAGE_REGISTRY, k));
  if (!pool.length) return null;
  return get(pool[seed ? hash(seed) % pool.length : 0]);
}

// ------------------------------------------------------------ subject matching
// A page's SUBJECT decides which shared-concept image it gets; only pages with no
// recognisable subject rotate across a pool. Before this, career/comparison guides,
// field hubs and exam pages hashed their slug across the whole folder, so a nursing
// guide showed a teaching kitchen, a finance hub a dental lab and GATE the
// listening-test headphones (~700 pages, found by the 16 Sep 2026 pre-deploy
// review). The label under the image was honest, but the picture contradicted the
// page. Patterns match whole hyphen-separated slug tokens (`(^|-)…(-|$)`) so "art"
// never matches "part" and "law" never matches "flaw". First match wins, so the
// specific rows (dental, nursing, pharmacy, civil, electronics…) sit above the
// generic ones (medical, engineering, science).
type SubjectRule = readonly [RegExp, string];

function tok(alts: string): RegExp {
  return new RegExp(`(?:^|-)(?:${alts})(?:-|$)`);
}

/** Field-of-study keywords → common/fields/* (order matters: specific before generic). */
const FIELD_RULES: readonly SubjectRule[] = [
  [tok('dental|dentist|dentistry|bds|mds|dmd|dds'), 'dental-training-lab'],
  [tok('nursing|nurse|nurses|midwifery|midwife|anm|gnm'), 'nursing-skills-lab'],
  [tok('pharmacy|pharmacist|pharmacists|pharma|pharm|pharmaceutical|gpat'), 'pharmacy-dispensary'],
  [tok('veterinary|vet|vets|bvsc|animal'), 'veterinary-science'],
  [tok('pilot|pilots|aviation|aeronautical|aerospace|airline|cabin|crew|flying'), 'aviation-simulator'],
  [tok('maritime|marine|nautical|seafaring|seafarer|merchant|shipping|naval-architecture'), 'maritime-training'],
  [tok('culinary|hospitality|hotel|hotels|chef|catering|cookery|tourism'), 'culinary-teaching-kitchen'],
  [tok('law|laws|llb|llm|legal|lawyer|lawyers|judge|judiciary|advocate|clat|ailet|lsat|lnat|bar'), 'law-library'],
  [tok('journalism|media|mass-communication|communication|broadcasting|film|animation|vfx|gaming|advertising'), 'media-journalism-studio'],
  [tok('psychology|psychologist|psychiatry|mental-health'), 'psychology-study-room'],
  [tok('architecture|architect|architects|b-arch|barch|nata|interior-design|urban-planning'), 'architecture-studio'],
  [tok('agriculture|agricultural|agri|farming|horticulture|forestry|agronomy|fisheries'), 'agriculture-greenhouse'],
  [tok('biotechnology|biotech|biology|biological|biomedical|life-sciences|genetics|microbiology|bioinformatics'), 'biotechnology-lab'],
  [tok('data-science|data|analytics|ai|artificial-intelligence|machine-learning|ml|statistics'), 'data-science-dashboards'],
  [tok('company-secretary|icsi|cseet'), 'business-case-room'],
  [tok('computer-science|computer|computing|software|cse|information-technology|coding|programming|developer|full-stack|cyber|cybersecurity|cloud|devops|web'), 'computer-science-lab'],
  [tok('electronics|electronic|ece|electrical|eee|vlsi|embedded|telecommunication|telecom|mechatronics|semiconductor|semiconductors|microelectronics|ic-design|chip'), 'electronics-lab'],
  [tok('civil|structural|construction|surveying|geotechnical'), 'civil-engineering-models'],
  [tok('physics|optics|astronomy|astrophysics|photonics'), 'physics-optics-lab'],
  [tok('finance|financial|accounting|accountancy|accountant|accountants|ca|cpa|cfa|cma|acca|actuarial|actuary|banking|investment|economics|commerce|bcom|b-com|audit'), 'finance-analytics-desk'],
  [tok('mba|business|management|bba|marketing|entrepreneurship|product-management|hr|operations|supply-chain|logistics'), 'business-case-room'],
  [tok('medical|medicine|mbbs|md|doctor|doctors|physician|surgeon|surgery|clinical|paramedical|physiotherapy|allied-health|health-sciences|health-science|healthcare|optometry|radiography|dietetics|nutrition|ayurveda|bams|bhms|homeopathy|occupational-therapy|speech'), 'medical-simulation-lab'],
  [tok('mechanical|manufacturing|automobile|automotive|engineering|engineer|engineers|btech|b-tech|robotics|industrial|energy|mining|petroleum|metallurgy|textile'), 'engineering-makerspace'],
  [tok('art|arts|design|fine-arts|humanities|liberal-arts|literature|history|philosophy|linguistics|sociology|anthropology|political-science|social-sciences|social-science|social-work|teaching|teacher|b-ed|music|performing-arts|fashion'), 'art-humanities-studio'],
  [tok('research|phd|doctoral|scientist|chemistry|chemical|science|sciences|bsc|msc|laboratory|materials|geology|environmental'), 'research-laboratory'],
];

/**
 * Practical-step keywords that outrank a field of study: a page whose slug says
 * visa, scholarship, loan, cost, credential-evaluation or housing is ABOUT that
 * step even when it names a field ("nursing scholarships", "MBBS fees"), and some
 * of these tokens collide with field tokens ("ECE" the credential evaluator vs
 * electronics; "council tax" vs finance). Checked before FIELD_RULES.
 */
const STEP_RULES: readonly SubjectRule[] = [
  [tok('visa|visas|permit|permits|immigration|f-1|f1|sevis|i-20'), 'student-visa-documents'],
  [tok('scholarship|scholarships|fellowship|fellowships|bursary|bursaries|financial-aid'), 'scholarship-funding'],
  [tok('loan|loans|lending'), 'education-loan'],
  [tok('cost|costs|tuition|fees|fee|budget|budgeting|expenses|expense|cheap|affordable|tax|taxes|bank'), 'budgeting-abroad'],
  [tok('credential|credentials|equivalency|equivalence|attestation|apostille|nostrification|wes|naces'), 'application-checklist'],
  [tok('accommodation|housing|dorm|dorms|hostel|hostels|rent|renting'), 'student-dorm-room'],
];

/** Application-journey keywords → common/journey/* (checked after FIELD_RULES). */
const JOURNEY_RULES: readonly SubjectRule[] = [
  [tok('grant|grants|funding|aid'), 'scholarship-funding'],
  [tok('living'), 'budgeting-abroad'],
  [tok('sop|statement-of-purpose|personal-statement|essay|essays'), 'statement-of-purpose'],
  [tok('lor|letter-of-recommendation|recommendation|recommendations|reference|references'), 'letter-of-recommendation'],
  [tok('internship|internships|intern|co-op|coop|placement|placements|job|jobs|work|working|career|careers|employment'), 'internship-workspace'],
  [tok('language|languages|ielts|toefl|pte|duolingo|english|jlpt|topik|hsk|testdaf|dsh|delf|dele'), 'language-learning'],
  [tok('packing|luggage|arrival|arriving|departure|flight|flights|airport'), 'airport-departure'],
  [tok('deadline|deadlines|timeline|timelines|intake|intakes|calendar|dates'), 'decision-day-calendar'],
];

function matchRule(rules: readonly SubjectRule[], slug: string): string | null {
  for (const [re, key] of rules) if (re.test(slug)) return key;
  return null;
}

/** The common/journey/* image for a slug about a practical step that outranks any field, else null. */
function stepFor(slug: string): ImageAsset | null {
  const key = matchRule(STEP_RULES, slug);
  return key ? get(`common/journey/${key}`) : null;
}

/** The common/fields/* image for a slug whose subject is a field of study, else null. */
function fieldFor(slug: string): ImageAsset | null {
  const key = matchRule(FIELD_RULES, slug);
  return key ? get(`common/fields/${key}`) : null;
}

/** The common/journey/* image for a slug about an application step, else null. */
function journeyFor(slug: string): ImageAsset | null {
  const key = matchRule(JOURNEY_RULES, slug);
  return key ? get(`common/journey/${key}`) : null;
}

/** Language / listening tests are the ONLY exams the headphones scene may illustrate. */
const LANGUAGE_TEST = tok('ielts|toefl|pte|duolingo|det|oet|celpip|cael|english|language|jlpt|topik|hsk|testdaf|dsh|delf|dalf|dele|siele|cils|celi|cambridge|linguaskill');

/**
 * An exam-concept image for a slug: the headphones scene for language tests, the
 * shared pool (rotated by slug) minus the headphones scene for every other exam.
 */
function examConceptFor(slug: string): ImageAsset | null {
  if (LANGUAGE_TEST.test(slug)) return get('common/exams/english-listening-test');
  const pool = KEYS.filter((k) => k.startsWith('common/exams/') && k !== 'common/exams/english-listening-test');
  if (!pool.length) return null;
  return get(pool[hash(slug) % pool.length]);
}

/**
 * Hero for a guide page. The subject wins: a field-of-study keyword in the slug →
 * that field's scene; an application-step keyword → that journey scene; an
 * exam-prep guide → an exam scene that fits the exam. Only a guide with no
 * recognisable subject rotates across a pool — the neutral site heroes for
 * career/comparison guides (never a random field), a curated neutral subset of
 * the journey scenes for the rest — before falling back to the destination's
 * atmosphere.
 */
export function guideImage(g: { slug: string; category: GuideCategory; region: RegionSlug }): ImageAsset | null {
  const subject = stepFor(g.slug) ?? fieldFor(g.slug) ?? journeyFor(g.slug);
  if (subject) return subject;
  if (g.category === 'exam-prep') return examConceptFor(g.slug) ?? imageFor({ region: g.region, seed: g.slug });
  if (g.category === 'career' || g.category === 'comparison') {
    return pickFrom('site/hero', g.slug) ?? imageFor({ region: g.region, seed: g.slug });
  }
  const pool = GUIDE_CATEGORY_POOL[g.category];
  return (pool ? pickFromKeys(pool, g.slug) : null) ?? imageFor({ region: g.region, seed: g.slug });
}

/**
 * Hero for a NAMED college page. Deliberately keyed on region + slug-seeded rotation,
 * never on the institution — there is no path by which this can select an image that
 * "matches" a real campus. Render with <ContentImage representative /> so the label
 * states plainly that it is not a photograph of that institution.
 */
export function collegeImage(c: { slug: string; region: RegionSlug }): ImageAsset | null {
  return imageFor({ region: c.region, seed: c.slug });
}

import type { TopicGroup } from '@/lib/topics';

/** Hero for a destination hub: that region's own atmosphere, rotated by slug. */
export function regionImage(slug: RegionSlug): ImageAsset | null {
  return imageFor({ region: slug, seed: slug });
}

/**
 * Hero for an exam page: the listening-test scene for language tests only; every
 * other exam rotates across the remaining exam-concept scenes by slug.
 */
export function examImage(e: { slug: string; region?: RegionSlug }): ImageAsset | null {
  return examConceptFor(e.slug) ?? (e.region ? imageFor({ region: e.region, seed: e.slug }) : null);
}

/** Region-gated topic groups → the destination whose atmosphere illustrates them. */
const TOPIC_GROUP_REGION: Partial<Record<TopicGroup, RegionSlug>> = {
  'study-in-usa': 'usa',
  'study-in-canada': 'canada',
  'study-in-australia-nz': 'australia-nz',
  'study-in-europe': 'europe',
  'study-in-middle-east': 'middle-east',
  'study-in-russia-cis': 'russia',
  'study-in-uk-ireland': 'uk-ireland',
  'study-in-asia': 'east-southeast-asia',
};

/** Shared-concept topic groups → the common folder that illustrates them. */
const TOPIC_GROUP_FOLDER: Partial<Record<TopicGroup, string>> = {
  'study-abroad': 'common/journey',
  'prep-funding': 'common/journey',
};

/**
 * Hero for a topic hub. Hubs are landing pages, so the region-agnostic `site/hero` pool is
 * blended in: a region-gated hub draws from its region folder + site heroes; a concept hub
 * draws from its concept folder + site heroes. (Region hub pages and college pages do NOT
 * blend — they stay regionally specific.) Measured 15 Sep 2026: this takes the region-gated
 * hubs from 2–3 candidate images each to 13–14, at zero cost.
 */
export function topicImage(t: { slug: string; group: TopicGroup; region?: RegionSlug }): ImageAsset | null {
  // A hub about a recognisable field of study gets that field's scene wherever it
  // sits (a region-gated "nursing in Japan" hub included); a hub whose slug names an
  // exam concept gets an exam scene that fits. Only then the pools below.
  const subject = stepFor(t.slug) ?? fieldFor(t.slug);
  if (subject) return subject;
  if (t.group === 'exams' && LANGUAGE_TEST.test(t.slug)) return get('common/exams/english-listening-test');
  const region = t.region ?? TOPIC_GROUP_REGION[t.group];
  if (region) return pickFromPools([`regions/${region}`, 'site/hero'], t.slug) ?? imageFor({ seed: t.slug });
  if (t.group === 'fields') return pickFrom('site/hero', t.slug) ?? imageFor({ seed: t.slug });
  if (t.group === 'exams') return examConceptFor(t.slug) ?? pickFrom('site/hero', t.slug);
  const folder = TOPIC_GROUP_FOLDER[t.group];
  return pickFromPools(folder ? [folder, 'site/hero'] : ['site/hero'], t.slug) ?? imageFor({ seed: t.slug });
}

/** The homepage hero — one fixed, region-agnostic image (the site's first impression). */
export function homeImage(): ImageAsset | null {
  return imageFor({ explicit: 'site/hero/homepage-campus-avenue-dawn' });
}
