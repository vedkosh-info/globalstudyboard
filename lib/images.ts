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
  ],
  scholarships: [
    'common/journey/scholarship-funding',
    'common/journey/education-loan',
    'common/journey/budgeting-abroad',
  ],
};

// A neutral study/decision scene is appropriate when a page has no more specific
// subject. Do not hash such pages across passports, suitcases, dorms or ceremonial
// graduation scenes: a generic degree comparison makes none of those promises.
const NEUTRAL_STUDY_SCENES: readonly string[] = [
  'site/hero/topic-hub-desk-flatlay',
  'site/hero/study-flatlay-coffee',
  'site/hero/window-desk-morning',
  'common/journey/research-thesis-desk',
];

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
  // Interactive media in a game-development degree is computing, not broadcast.
  [tok('game-design|game-development|gaming'), 'computer-science-lab'],
  [tok('dental|dentist|dentistry|bds|mds|dmd|dds'), 'dental-training-lab'],
  [tok('nursing|nurse|nurses|midwifery|midwife|anm|gnm'), 'nursing-skills-lab'],
  [tok('pharmacy|pharmacist|pharmacists|pharma|pharm|pharmaceutical|gpat'), 'pharmacy-dispensary'],
  [tok('veterinary|vet|vets|bvsc|animal'), 'veterinary-science'],
  [tok('pilot|pilots|aviation|aeronautical|aerospace|airline|aircraft|cabin|crew|flying'), 'aviation-simulator'],
  [tok('maritime|marine|nautical|seafaring|seafarer|merchant|shipping|naval-architecture'), 'maritime-training'],
  [tok('culinary|hospitality|hotel|hotels|chef|catering|cookery|tourism'), 'culinary-teaching-kitchen'],
  [tok('law|laws|llb|llm|legal|lawyer|lawyers|judge|judiciary|advocate|clat|ailet|lsat|lnat|bar'), 'law-library'],
  [tok('journalism|media|mass-communication|communications|broadcasting|film|cinematography|advertising'), 'media-journalism-studio'],
  [tok('psychology|psychologist|psychiatry|mental-health'), 'psychology-study-room'],
  [tok('architecture|architect|architects|b-arch|barch|nata|interior-design|urban-planning'), 'architecture-studio'],
  [tok('agriculture|agricultural|agri|farming|horticulture|forestry|agronomy|fisheries'), 'agriculture-greenhouse'],
  [tok('food-science|food-technology'), 'research-laboratory'],
  [tok('medical-laboratory|medical-lab-technology|bmlt|laboratory-sciences'), 'biotechnology-lab'],
  [tok('biotechnology|biotech|biology|biological|biomedical|life-sciences|genetics|microbiology|bioinformatics'), 'biotechnology-lab'],
  // The old "dashboards" asset contains decorative bokeh, not data. Actual
  // teaching computers are a more relevant context for computing/analytics study.
  [tok('data-science|data-engineer|data-analyst|analytics|ai|artificial-intelligence|machine-learning|ml|statistics|animation|vfx|gaming|game-design|game-development'), 'computer-science-lab'],
  [tok('company-secretary|icsi|cseet'), 'business-case-room'],
  [tok('computer-science|computer|computing|software|cse|information-technology|coding|programming|developer|full-stack|cyber|cybersecurity|cloud|devops|web-development|emerging-tech|new-age-careers'), 'computer-science-lab'],
  [tok('electronics|electronic|ece|electrical|eee|vlsi|embedded|telecommunication|telecom|mechatronics|semiconductor|semiconductors|microelectronics|ic-design|chip'), 'electronics-lab'],
  [tok('civil-engineering|structural|construction|surveying|geotechnical'), 'civil-engineering-models'],
  [tok('physics|optics|astronomy|astrophysics|photonics'), 'physics-optics-lab'],
  [tok('finance|financial|accounting|accountancy|accountant|accountants|ca|cpa|cfa|cma|acca|actuarial|actuary|banking|investment|economics|commerce|bcom|b-com|audit'), 'finance-analytics-desk'],
  [tok('mba|business|management|bba|marketing|entrepreneurship|product-management|hr|operations|supply-chain|logistics-management|logistics-studies|logistics-degrees'), 'business-case-room'],
  [tok('medical|medicine|mbbs|md|doctor|doctors|physician|surgeon|surgery|clinical|paramedical|paramedicine|physiotherapy|allied-health|health-sciences|health-science|healthcare|health-profession|optometry|radiography|dietetics|nutrition|ayurveda|bams|bhms|homeopathy|occupational-therapy|speech'), 'medical-simulation-lab'],
  [tok('fashion|textile-design|art|arts|design|fine-arts|music|performing-arts'), 'art-humanities-studio'],
  [tok('mechanical|manufacturing|automobile|automotive|engineering|engineer|engineers|btech|b-tech|robotics|industrial-engineering|energy|mining|petroleum|metallurgy|textile-engineering'), 'engineering-makerspace'],
  [tok('humanities|liberal-arts|literature|history|philosophy|linguistics|sociology|anthropology|political-science|international-relations|social-sciences|social-science|social-work'), 'common/journey/research-thesis-desk'],
  [tok('education|teaching|teacher|b-ed'), 'site/hero/lecture-hall-empty'],
  [tok('scientist|chemistry|chemical|science|sciences|bsc|msc|laboratory|materials|geology|environmental'), 'research-laboratory'],
];

/**
 * Practical-step keywords that outrank a field of study: a page whose slug says
 * visa, scholarship, loan, cost, credential-evaluation or housing is ABOUT that
 * step even when it names a field ("nursing scholarships", "MBBS fees"), and some
 * of these tokens collide with field tokens ("ECE" the credential evaluator vs
 * electronics; "council tax" vs finance). Checked before FIELD_RULES.
 */
const STEP_RULES: readonly SubjectRule[] = [
  [tok('visa|visas|permit|permits|immigration|migration|pgwp|opt|cpt|permanent-residence|permanent-residency|post-study|work-and-stay|study-to-residence|pr-pathways|citizenship|f-1|f1|sevis|i-20'), 'student-visa-documents'],
  [tok('scholarship|scholarships|fellowship|fellowships|bursary|bursaries|financial-aid|financial-need'), 'scholarship-funding'],
  [tok('loan|loans|lending'), 'education-loan'],
  [tok('fund|funding|funded|grant|grants|stipend|stipends|studentship|studentships|assistantship|assistantships'), 'scholarship-funding'],
  [tok('cost|costs|tuition|fees|fee|budget|budgeting|expenses|expense|cheap|affordable|tax|taxes|bank|money|currency|proof-of-funds|blocked-account|blocked-accounts|building-credit|bank-account|bank-accounts|banking-for-students'), 'budgeting-abroad'],
  [tok('credential|credentials|equivalency|equivalence|attestation|apostille|nostrification|wes|naces|documents|document|paperwork|counselling|counseling|allotment|choice-filling|management-quota|insurance|oshc|ovhc|uhip|ehic|ghic|biometrics|national-id|licensing|licensure|licence|recognition|recognized|recognised|accreditation|registration|registering'), 'application-checklist'],
  [tok('accommodation|housing|dorm|dorms|hostel|hostels|rent|renting'), 'student-dorm-room'],
  [tok('sop|statement-of-purpose|personal-statement|essay|essays'), 'statement-of-purpose'],
  [tok('lor|letter-of-recommendation|recommendation|recommendations|reference|references'), 'letter-of-recommendation'],
  [tok('deadline|deadlines|timeline|timelines|intake|intakes|calendar|dates'), 'decision-day-calendar'],
  [tok('packing|luggage|what-to-pack'), 'packing-suitcase'],
  [tok('orientation'), 'orientation-auditorium'],
  [tok('student-life|daily-life|practical-life|settling|wellbeing|well-being|cultural-adjustment|culture-and-support'), 'student-dorm-room'],
];

/** Application-journey keywords → common/journey/* (checked after FIELD_RULES). */
const JOURNEY_RULES: readonly SubjectRule[] = [
  [tok('aid'), 'scholarship-funding'],
  [tok('living'), 'budgeting-abroad'],
  [tok('internship|internships|intern|co-op|coop|placement|placements|job|jobs|work|working|career|careers|employment'), 'internship-workspace'],
  [tok('language|languages|ielts|toefl|pte|duolingo|english-tests|french-tests|learning-russian|russian-language|torfl|cils|celi|plida|jlpt|topik|hsk|testdaf|dsh|delf|dele'), 'language-learning'],
  [tok('arrival|arriving|departure|flight|flights|airport'), 'airport-departure'],
  [tok('research|phd|doctoral|supervisor|supervision|proposal|thesis|dissertation|graduate-study|postgraduate'), 'research-thesis-desk'],
];

function matchRule(rules: readonly SubjectRule[], slug: string): string | null {
  for (const [re, key] of rules) if (re.test(slug)) return key;
  return null;
}

/** The common/journey/* image for a slug about a practical step that outranks any field, else null. */
function stepFor(slug: string): ImageAsset | null {
  // Counselling/support is more specific than a generic wellbeing/living scene.
  if (tok('mental-health-support|mental-health-and-wellbeing-support').test(slug)) return get('common/fields/psychology-study-room');
  const key = matchRule(STEP_RULES, slug);
  return key ? get(`common/journey/${key}`) : null;
}

/** The common/fields/* image for a slug whose subject is a field of study, else null. */
function fieldFor(slug: string): ImageAsset | null {
  // A guide explicitly about options "beyond medicine" should not be given the
  // medical-training picture merely because that excluded field is in its slug.
  const key = matchRule(FIELD_RULES, slug.replace(/(?:^|-)beyond-medicine(?=-|$)/, ''));
  return key ? get(key.includes('/') ? key : `common/fields/${key}`) : null;
}

/** The common/journey/* image for a slug about an application step, else null. */
function journeyFor(slug: string): ImageAsset | null {
  const key = matchRule(JOURNEY_RULES, slug);
  return key ? get(`common/journey/${key}`) : null;
}

/** Language / listening tests are the ONLY exams the headphones scene may illustrate. */
const LANGUAGE_TEST = tok('ielts|toefl|pte|duolingo|det|oet|celpip|cael|english|language|jlpt|topik|hsk|testdaf|dsh|delf|dalf|dele|siele|cils|celi|cambridge|linguaskill');

const EXAM_CONTEXT = tok('exam|exams|test|tests|testing|entrance|entrances|prep|preparation|prepare|test-day|jee|neet|clat|ailet|lsat|gmat|gre|mcat|ucat|imat|hpat|gate|mat|cmat|xat|ipmat|upsc|cet|sat|act');
const APPLICATION_CONTEXT = tok('application|applications|applying|apply|admission|admissions|counselling|counseling');
const EXAM_RESULT_CONTEXT = tok('score|scores|result|results|cutoff|cutoffs|percentile|marks|rank|ranking');
const EXAM_REGISTRATION_CONTEXT = tok('registration|register|form|application|applications');
const EXAM_WRITING_CONTEXT = tok('writing|essay|essays');
const EXAM_COMPUTER_CONTEXT = tok('computer|online|cbt');
const CIVIL_SERVICE_CONTEXT = tok('civil-services');
const OUTCOMES_CONTEXT = tok('outcomes-data|retention-graduation|league-tables');
const CONNECTIVITY_CONTEXT = tok('sim|internet|connectivity|broadband');
const COMMUTE_CONTEXT = tok('transport|commuting|commute');

function applicationFor(slug: string): ImageAsset | null {
  return APPLICATION_CONTEXT.test(slug)
    ? pickFromKeys(GUIDE_CATEGORY_POOL.admissions ?? [], slug)
    : null;
}

function editorialContextFor(slug: string): ImageAsset | null {
  if (CIVIL_SERVICE_CONTEXT.test(slug)) return get('common/exams/prep-books-stack');
  if (OUTCOMES_CONTEXT.test(slug)) return get('common/exams/score-report-abstract');
  if (CONNECTIVITY_CONTEXT.test(slug)) return get('site/hero/window-desk-morning');
  if (COMMUTE_CONTEXT.test(slug)) return get('site/hero/campus-bicycle-ivy');
  return null;
}

/**
 * An exam-concept image for a slug: the headphones scene for language tests, the
 * shared pool (rotated by slug) minus the headphones scene for every other exam.
 */
function examConceptFor(slug: string): ImageAsset | null {
  if (LANGUAGE_TEST.test(slug)) return get('common/exams/english-listening-test');
  if (EXAM_RESULT_CONTEXT.test(slug)) return get('common/exams/score-report-abstract');
  if (EXAM_REGISTRATION_CONTEXT.test(slug)) return get('common/exams/registration-laptop');
  if (EXAM_WRITING_CONTEXT.test(slug)) return get('common/exams/writing-essay-booklet');
  if (EXAM_COMPUTER_CONTEXT.test(slug)) return get('common/exams/computer-based-test');
  // Preparation stationery is neutral about an examination's current delivery
  // mode. A seeded computer station or score sheet used to imply a feature the
  // page had not asserted; those now require an explicit matching subject above.
  return pickFromKeys([
    'common/exams/exam-hall-empty-desks',
    'common/exams/answer-sheet-pencil',
    'common/exams/prep-books-stack',
  ], slug);
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
  const step = stepFor(g.slug);
  if (step) return step;
  if (g.category === 'exam-prep' && EXAM_CONTEXT.test(g.slug)) return examConceptFor(g.slug);
  const subject = editorialContextFor(g.slug) ?? applicationFor(g.slug) ?? fieldFor(g.slug) ?? journeyFor(g.slug);
  if (subject) return subject;
  if (g.category === 'exam-prep') return examConceptFor(g.slug) ?? imageFor({ region: g.region, seed: g.slug });
  if (g.category === 'career' || g.category === 'comparison') {
    return pickFromKeys(NEUTRAL_STUDY_SCENES, g.slug);
  }
  const pool = GUIDE_CATEGORY_POOL[g.category];
  return (pool ? pickFromKeys(pool, g.slug) : null) ?? academicImage(g.region, g.slug);
}

// Academic scenes only: a university profile should not receive a destination's
// countryside, skyline or holiday coastline merely because it is in the same pool.
const COLLEGE_ACADEMIC_SCENES: readonly string[] = [
  'regions/india/campus-quad-golden-hour', 'regions/india/library-reading-room',
  'regions/usa/collegiate-brick-autumn', 'regions/usa/campus-green-clocktower', 'regions/usa/study-commons-interior',
  'regions/canada/maple-campus-autumn',
  'regions/uk-ireland/honey-stone-quad', 'regions/uk-ireland/wood-panelled-library',
  'regions/europe/continental-courtyard', 'regions/europe/modern-study-hall',
  'regions/australia-nz/sunny-modern-campus', 'regions/australia-nz/glass-learning-centre',
  'regions/russia/classical-building-winter', 'regions/russia/ornate-lecture-hall',
  'regions/middle-east/desert-campus-architecture', 'regions/middle-east/bright-library-interior',
  'regions/east-southeast-asia/hightech-campus-blossom', 'regions/east-southeast-asia/futuristic-study-commons',
];
const COLLEGE_NEUTRAL_SCENES: readonly string[] = [
  'site/hero/homepage-campus-avenue-dawn', 'site/hero/golden-hour-quad', 'site/hero/campus-gateway-arch',
];

function academicImage(region: RegionSlug, seed: string): ImageAsset | null {
  const academic = COLLEGE_ACADEMIC_SCENES.filter((key) =>
    key.startsWith(`regions/${region}/`) && IMAGE_REGISTRY[key]?.provenance.kind === 'ai');
  const neutral = COLLEGE_NEUTRAL_SCENES.filter((key) => IMAGE_REGISTRY[key]?.provenance.kind === 'ai');
  return pickFromKeys(academic, seed) ?? pickFromKeys(neutral, seed);
}

/**
 * Hero for a NAMED college page. Deliberately keyed on region + slug-seeded rotation,
 * uses an explicitly reviewed exact-institution photograph when one is available.
 * Otherwise it selects only reviewed AI, never a photograph of another institution.
 * Render with <ContentImage representative /> for the on-image disclosure.
 */
export function collegeImage(c: { slug: string; region: RegionSlug }): ImageAsset | null {
  const exact = KEYS.find((key) => {
    const source = IMAGE_REGISTRY[key].provenance;
    return source.kind === 'photo' && source.institutionSlug === c.slug &&
      key.startsWith(`regions/${c.region}/`);
  });
  if (exact) return get(exact);
  return academicImage(c.region, c.slug);
}

import type { TopicGroup } from '@/lib/topics';

const REGION_CAMPUS: Readonly<Record<RegionSlug, string>> = {
    india: 'regions/india/campus-quad-golden-hour',
    usa: 'regions/usa/collegiate-brick-autumn',
    canada: 'regions/canada/maple-campus-autumn',
    'uk-ireland': 'regions/uk-ireland/honey-stone-quad',
    europe: 'regions/europe/continental-courtyard',
    'australia-nz': 'regions/australia-nz/sunny-modern-campus',
    russia: 'regions/russia/classical-building-winter',
    'middle-east': 'regions/middle-east/desert-campus-architecture',
    'east-southeast-asia': 'regions/east-southeast-asia/hightech-campus-blossom',
};

/** Every destination hub leads with its own academic setting, never random scenery. */
export function regionImage(slug: RegionSlug): ImageAsset | null {
  return get(REGION_CAMPUS[slug]) ?? academicImage(slug, slug);
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

/**
 * Hero for a topic hub. Practical steps and examination subjects are resolved
 * before fields, then the same journey matching used by guides. A destination
 * fallback stays academic; unrelated luggage, scenery and graduation objects
 * are never picked merely to create visual variety.
 */
export function topicImage(t: { slug: string; group: TopicGroup; region?: RegionSlug }): ImageAsset | null {
  // A hub about a recognisable field of study gets that field's scene wherever it
  // sits (a region-gated "nursing in Japan" hub included); a hub whose slug names an
  // exam concept gets an exam scene that fits. Only then the pools below.
  const step = stepFor(t.slug);
  if (step) return step;
  if (t.group === 'exams' || EXAM_CONTEXT.test(t.slug)) return examConceptFor(t.slug);
  const subject = editorialContextFor(t.slug) ?? applicationFor(t.slug) ?? fieldFor(t.slug) ?? journeyFor(t.slug);
  if (subject) return subject;
  const region = t.region ?? TOPIC_GROUP_REGION[t.group];
  if (region) return academicImage(region, t.slug);
  return pickFromKeys(NEUTRAL_STUDY_SCENES, t.slug);
}

/** The homepage hero — one fixed, region-agnostic image (the site's first impression). */
export function homeImage(): ImageAsset | null {
  return imageFor({ explicit: 'site/hero/homepage-campus-avenue-dawn' });
}
