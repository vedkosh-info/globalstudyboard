// ─────────────────────────────────────────────────────────────────────────────
// Tracks — the region-shaped, top-level grouping of the topic hubs.
//
// The site's navigation backbone is:  Region → Track → Topic hub → Guide.
// A Track is a region-specific cluster of topic hubs (5–11 per region). Tracks
// DIFFER per region by design — India is domestic/exam-and-field-shaped, the
// abroad destinations are journey-shaped (Admissions → Tests → Universities …).
//
// This is the SINGLE SOURCE OF TRUTH for that grouping (like lib/region-nav.ts
// is for the content-type sections). It feeds the Topics mega-menu, the /topics
// index, the region hub's "Explore by track" cards, the Track landing pages, and
// the region guides page. The CMI (lib/cmi.ts) validates every reference.
//
// India tracks are AUTHORED explicitly below (they restructure India's 20
// region-less hubs into student-goal clusters). The seven abroad regions DERIVE
// a 1:1 passthrough track per existing hub for now — they are already
// journey-shaped — and gain real sub-hubs (true two-level depth) in Phase 2 as
// content grows. A hub may be CROSS-LISTED in more than one track for discovery
// (e.g. JEE under both "Entrance Exams" and "Engineering"); the FIRST track that
// lists a hub is its primary home (used for breadcrumbs + de-duplication).
//
// IMPORTANT: this module imports only the lightweight TOPICS array (never GUIDES),
// so Client Components (TopicsMenu, TopicsIndex) can import it without dragging
// the ~6 MB guide catalogue into the browser bundle. See lib/topic-guides.ts.
// ─────────────────────────────────────────────────────────────────────────────
import { TOPICS, getTopicBySlug, type Topic } from './topics';
import { REGION_SLUGS, type RegionSlug } from './regions';

export interface Track {
  /** Stable slug, unique within its region. Multi-hub tracks use it as a route. */
  slug: string;
  /** The single destination this track belongs to. */
  region: RegionSlug;
  /** Short label for nav cards + chips, e.g. "Entrance Exams". */
  label: string;
  /** SEO H1 / page title for the track landing page. */
  title: string;
  /** Meta description + the lede shown on the track landing page. */
  description: string;
  /** Topic-hub slugs in this track, in display order (must resolve in TOPICS). */
  topicSlugs: string[];
}

// ───────────────────────────── India (domestic) ─────────────────────────────
// Exam-and-field spine. Partitions (with deliberate cross-listing) India's 20
// region-less hubs. "Entrance Exams" is the home of every exam hub (JEE, NEET,
// CUET … — where students look first); the field/career tracks own the
// course/career hubs and cross-list the relevant exams for discovery.
export const INDIA_TRACKS: Track[] = [
  {
    slug: 'entrance-exams',
    region: 'india',
    label: 'Entrance Exams',
    title: 'Entrance Exams in India',
    description:
      'Every major Indian entrance exam in one place — JEE, NEET, CUET, the state engineering CETs, GATE, government-recruitment exams and specialised postgraduate tests — with eligibility, pattern and preparation, each linked to its official source.',
    topicSlugs: [
      'jee',
      'neet',
      'cuet',
      'engineering-entrance-exams',
      'gate',
      'government-exams',
      'specialized-exams',
      'exam-preparation',
      'mba-and-management-entrances',
      'design-and-aptitude-entrances',
    ],
  },
  {
    slug: 'engineering-tech',
    region: 'india',
    label: 'Engineering & Technology',
    title: 'Engineering & Technology in India',
    description:
      'Engineering admission and careers — the JEE and state-CET route into the IITs, NITs and IIITs, GATE for higher study, the branches you can choose, and fast-evolving new-age tech careers.',
    topicSlugs: ['engineering', 'new-age-careers', 'jee', 'engineering-entrance-exams', 'gate', 'emerging-tech-careers', 'more-engineering-branches'],
  },
  {
    slug: 'medical-healthcare',
    region: 'india',
    label: 'Medical & Healthcare',
    title: 'Medical & Healthcare Studies in India',
    description:
      'Becoming a doctor and the wider health-science field — NEET UG, MBBS and the courses it opens (BDS, BAMS, nursing and allied health), with official eligibility and counselling facts.',
    topicSlugs: ['neet', 'medical-pg-and-specialisation', 'ayush-and-alternative-medicine', 'allied-and-paramedical-health'],
  },
  {
    slug: 'management-commerce',
    region: 'india',
    label: 'Management & Commerce',
    title: 'Management & Commerce in India',
    description:
      'MBA, CAT and the wider commerce and finance world — business-school admission, professional routes like CA, CS and CFA, and how undergraduate commerce choices fit together.',
    topicSlugs: ['mba', 'commerce-and-finance', 'finance-professional-qualifications', 'mba-specialisations-and-schools'],
  },
  {
    slug: 'law-legal',
    region: 'india',
    label: 'Law',
    title: 'Law & Legal Studies in India',
    description:
      'CLAT, AILET and the path to a legal career — the National Law Universities, the route to practising as an advocate, and where an LLB can lead.',
    topicSlugs: ['law', 'law-entrance-preparation', 'law-careers-and-specialisations'],
  },
  {
    slug: 'arts-design-media',
    region: 'india',
    label: 'Arts, Design & Media',
    title: 'Arts, Design & Media in India',
    description:
      'Creative and humanities pathways — design careers and the NIFT/NID entrances, journalism and mass communication, psychology and hotel management.',
    topicSlugs: ['design-arts-media', 'design-fields-and-entrances', 'media-and-communication-careers', 'humanities-and-social-sciences'],
  },
  {
    slug: 'teaching-research',
    region: 'india',
    label: 'Teaching & Research',
    title: 'Teaching & Research Careers in India',
    description:
      'Routes into school teaching, college lecturing and research — CTET and state TET, UGC NET/JRF, CSIR NET, the B.Ed route, and how to become a teacher or professor.',
    topicSlugs: ['teaching-and-research', 'research-and-phd-pathways'],
  },
  {
    slug: 'careers-professions',
    region: 'india',
    label: 'Careers & Professions',
    title: 'Careers & Professions in India',
    description:
      'Step-by-step, official-source guides to entering specific professions — pilot, merchant navy, IAS and IPS officer, software engineer, scientist, architect, pharmacist, judge and cabin crew.',
    topicSlugs: ['career-paths', 'civil-services-and-government-careers', 'modern-and-creative-careers'],
  },
  {
    slug: 'after-school',
    region: 'india',
    label: 'After 10th & 12th',
    title: 'After 10th & 12th: Streams, Boards & Courses',
    description:
      'The school-stage decisions that shape everything after — choosing a stream after Class 10, comparing boards, board-exam preparation, and the courses and careers open after Class 12.',
    topicSlugs: ['courses-after-12th', 'school-and-boards', 'more-pathways-after-12th'],
  },
  {
    slug: 'study-abroad-india',
    region: 'india',
    label: 'Study Abroad (from India)',
    title: 'Study Abroad from India',
    description:
      'How to study abroad from India — destination guides, English tests, the GRE and GMAT, student visas, SOPs and LORs, costs and post-study work — with neutral, official-source facts.',
    topicSlugs: ['study-abroad'],
  },
  {
    slug: 'scholarships-funding',
    region: 'india',
    label: 'Scholarships & Funding',
    title: 'Scholarships & Education Funding',
    description:
      'Scholarships and funding routes for Indian students — the National Scholarship Portal, INSPIRE, Fulbright and DAAD, and how education loans work — with secular eligibility facts only.',
    topicSlugs: ['scholarships', 'indian-scholarships-in-depth', 'education-loans-and-funding'],
  },
  {
    slug: 'foreign-nri-admission',
    region: 'india',
    label: 'Foreign & NRI Admission',
    title: 'Foreign & NRI Admission to India',
    description:
      'For foreign nationals, NRIs and OCI/PIO students applying to Indian colleges — admission routes (DASA, NRI quota), the student visa, fees, scholarships and living in India, each deferred to its official source.',
    topicSlugs: ['foreign-nri-admission-routes', 'studying-in-india-as-an-international-student'],
  },
];

// ───────────────────────────── USA (explicit, Phase 2) ──────────────────────
// Eight journey tracks, each anchored by an existing USA hub and deepened with
// Phase-2 sub-hubs (true two-level depth). Mirrors INDIA_TRACKS; the other six
// abroad regions stay 1:1-derived until their own Phase 2.
export const USA_TRACKS: Track[] = [
  {
    slug: 'us-admissions', region: 'usa', label: 'Admissions',
    title: 'US College Admissions',
    description:
      'How US college admissions work end to end — the application and its components, the essays, recommendations and overall strategy — from first steps to a strong, coherent application.',
    topicSlugs: ['us-admissions', 'application-components-deep-dive-usa', 'college-essay-mastery-usa', 'admissions-strategy-and-positioning-usa'],
  },
  {
    slug: 'sat-act-testing', region: 'usa', label: 'Tests & Credit',
    title: 'SAT, ACT & College Credit',
    description:
      'US college testing and credit — the digital SAT and the ACT, how to prepare and test smart, and earning college credit through AP, IB and CLEP.',
    topicSlugs: ['sat-act-testing', 'test-prep-and-test-day-deep-dive-usa', 'ap-ib-and-college-credit-usa'],
  },
  {
    slug: 'us-universities', region: 'usa', label: 'Universities',
    title: 'US Universities & Getting In',
    description:
      'The US university landscape and how to get in — types and state systems, public and private, elite and Ivy admissions, and how to choose and compare colleges by fit.',
    topicSlugs: ['us-universities', 'ivy-and-elite-admissions-deep-dive', 'public-universities-and-systems-usa', 'choosing-and-comparing-us-colleges'],
  },
  {
    slug: 'us-majors-careers', region: 'usa', label: 'Majors & Careers',
    title: 'US College Majors & Careers',
    description:
      'Choosing a US college major — STEM and engineering, business and economics, humanities and social sciences, the health professions and the arts — what each studies and where it can lead.',
    topicSlugs: ['us-majors-careers', 'stem-majors-deep-dive-usa', 'engineering-disciplines-usa', 'business-and-economics-majors-usa', 'humanities-and-social-science-majors-usa', 'health-profession-majors-usa', 'arts-architecture-design-majors-usa'],
  },
  {
    slug: 'financial-aid-usa', region: 'usa', label: 'Financial Aid',
    title: 'Paying for College & Financial Aid (USA)',
    description:
      'Paying for a US degree — financial aid and the FAFSA, scholarships of every kind, and financing strategies and loans — with facts and official sources, not financial advice.',
    topicSlugs: ['financial-aid-usa', 'scholarships-deep-dive-usa', 'financing-strategies-and-loans-usa'],
  },
  {
    slug: 'us-grad-school', region: 'usa', label: 'Graduate School',
    title: 'US Graduate & Professional School',
    description:
      'US graduate and professional school — MS, PhD and funding, graduate programmes by field, and admission to medical, law, dental and other professional schools.',
    topicSlugs: ['us-grad-school', 'graduate-programs-by-field-usa', 'professional-school-admissions-usa'],
  },
  {
    slug: 'international-students-usa', region: 'usa', label: 'International Students',
    title: 'International Students in the USA',
    description:
      'Studying in the US as an international student — applying, the F-1 visa and OPT, and the practicalities of student life, on- and off-campus work, travel and money.',
    topicSlugs: ['international-students-usa', 'international-student-life-and-work-usa'],
  },
  {
    slug: 'us-college-life', region: 'usa', label: 'College Life',
    title: 'US College Life & Practicalities',
    description:
      'Life at a US college — housing and campus life and support, transfer routes, and the practical systems (GPA and credits, health cover, city costs) that shape your four years.',
    topicSlugs: ['us-college-life', 'campus-life-and-student-support-usa'],
  },
];

// ───────────────────────────── UK & Ireland (explicit, Phase 2) ─────────────
// Eight journey tracks anchored by the existing UK & Ireland hubs + their Phase-2
// sub-hubs. The remaining five abroad regions stay 1:1-derived until their Phase 2.
export const UK_IRELAND_TRACKS: Track[] = [
  {
    slug: 'uk-ireland-admissions', region: 'uk-ireland', label: 'Admissions',
    title: 'UK & Ireland Admissions: UCAS & CAO',
    description:
      'Applying to UK and Irish universities — the UCAS application and personal statement, the entry routes and qualifications that get you in, and Ireland’s CAO and Leaving Certificate.',
    topicSlugs: ['uk-ireland-admissions', 'ucas-application-in-depth-uk', 'uk-entry-routes-and-qualifications', 'ireland-cao-and-leaving-cert-in-depth'],
  },
  {
    slug: 'uk-ireland-universities', region: 'uk-ireland', label: 'Universities',
    title: 'UK & Ireland Universities',
    description:
      'Choosing a UK or Irish university — Oxbridge and the collegiate system, the Russell Group in depth, how university groups and league tables work, and studying across Scotland, Wales and Northern Ireland.',
    topicSlugs: ['uk-ireland-universities', 'oxbridge-and-the-collegiate-system', 'russell-group-universities-in-depth', 'uk-university-groups-and-league-tables', 'scotland-wales-northern-ireland-study'],
  },
  {
    slug: 'uk-ireland-courses-careers', region: 'uk-ireland', label: 'Courses & Careers',
    title: 'Courses & Careers in the UK & Ireland',
    description:
      'Choosing a degree subject in the UK and Ireland — economics and finance, psychology, the natural and life sciences, humanities and social sciences, art, design and architecture, and postgraduate and research study.',
    topicSlugs: ['uk-ireland-courses-careers', 'studying-economics-and-finance-uk-ireland', 'studying-psychology-uk-ireland', 'studying-natural-and-life-sciences-uk-ireland', 'studying-humanities-and-social-sciences-uk-ireland', 'studying-art-design-and-architecture-uk-ireland', 'postgraduate-and-research-study-uk-ireland'],
  },
  {
    slug: 'uk-ireland-medicine-competitive', region: 'uk-ireland', label: 'Medicine & Competitive',
    title: 'Medicine, Healthcare & Competitive Courses',
    description:
      'The most competitive UK and Ireland courses — medicine, dentistry, law and veterinary medicine, the admissions tests in depth (UCAT, LNAT, TMUA/ESAT, STEP, HPAT), and healthcare degrees beyond medicine.',
    topicSlugs: ['uk-ireland-medicine-competitive', 'uk-ireland-admissions-tests-in-depth', 'healthcare-degrees-beyond-medicine-uk-ireland'],
  },
  {
    slug: 'uk-ireland-tuition-scholarships', region: 'uk-ireland', label: 'Tuition & Scholarships',
    title: 'Tuition, Funding & Scholarships (UK & Ireland)',
    description:
      'Paying for a UK or Irish degree — tuition and fee status, scholarships and funding for international students, and how Student Finance, bursaries and postgraduate loans work. Facts, not financial advice.',
    topicSlugs: ['uk-ireland-tuition-scholarships', 'uk-ireland-tuition-and-funding-in-depth'],
  },
  {
    slug: 'uk-ireland-student-visas', region: 'uk-ireland', label: 'Student Visas',
    title: 'UK & Ireland Student Visas',
    description:
      'Student visas for the UK and Ireland — the routes, CAS, the Immigration Health Surcharge and documents, and the UK Student visa process in depth. Neutral official facts, not immigration advice.',
    topicSlugs: ['uk-ireland-student-visas', 'uk-student-visa-process-in-depth'],
  },
  {
    slug: 'work-and-stay-uk-ireland', region: 'uk-ireland', label: 'Work & Stay',
    title: 'Working & Staying On (UK & Ireland)',
    description:
      'Working during and after study in the UK and Ireland — the Graduate Route and Stamp 1G, the Skilled Worker and other work-visa routes, and building employability and graduate careers.',
    topicSlugs: ['work-and-stay-uk-ireland', 'uk-graduate-and-work-visa-routes-in-depth', 'graduate-careers-and-employability-uk-ireland'],
  },
  {
    slug: 'uk-ireland-student-life', region: 'uk-ireland', label: 'Student Life',
    title: 'Student Life in the UK & Ireland',
    description:
      'Living and settling in as a student in the UK and Ireland — accommodation, healthcare and the practicalities of settling in, from the BRP/eVisa and GP registration to council tax, banking and transport.',
    topicSlugs: ['uk-ireland-student-life', 'settling-into-uk-ireland-student-life'],
  },
];

// ───────────────────────────── Abroad (derived) ─────────────────────────────
// Each abroad region's existing region-tagged hubs ARE its tracks (1:1) for now.
// They reuse the hub's own label/title/description and gain real sub-hubs in
// Phase 2. Built from the lightweight TOPICS array in their authored order.
function deriveRegionTracks(region: RegionSlug): Track[] {
  return TOPICS.filter((t) => t.region === region).map((t) => ({
    slug: t.slug,
    region,
    label: t.label,
    title: t.title,
    description: t.description,
    topicSlugs: [t.slug],
  }));
}

/** The ordered set of tracks for a destination (explicit for India, derived for abroad). */
export function tracksForRegion(region: RegionSlug): Track[] {
  if (region === 'india') return INDIA_TRACKS;
  if (region === 'usa') return USA_TRACKS;
  if (region === 'uk-ireland') return UK_IRELAND_TRACKS;
  return deriveRegionTracks(region);
}

/** A track has real two-level depth (its own landing page) once it holds ≥2 hubs. */
export const isMultiHubTrack = (track: Track): boolean => track.topicSlugs.length >= 2;

/** Resolve a track's hub slugs to full Topic objects (skipping any that vanish). */
export const topicsForTrack = (track: Track): Topic[] =>
  track.topicSlugs.map((s) => getTopicBySlug(s)).filter((t): t is Topic => Boolean(t));

/**
 * Where a Track card/link points:
 *  - multi-hub  → its own landing page (the real middle tap)
 *  - single-hub → straight to its one hub (no redundant near-duplicate page)
 */
export function trackHref(track: Track): string {
  return isMultiHubTrack(track)
    ? `/regions/${track.region}/track/${track.slug}`
    : `/topics/${track.topicSlugs[0]}`;
}

/** Look up one track by region + slug. */
export const getTrack = (region: RegionSlug, slug: string): Track | undefined =>
  tracksForRegion(region).find((t) => t.slug === slug);

// Reverse index: topic slug → its PRIMARY track (the first track that lists it,
// scanning each region's tracks in order). Used for breadcrumbs + guide grouping.
const TOPIC_TO_TRACK = new Map<string, Track>();
for (const region of REGION_SLUGS) {
  for (const track of tracksForRegion(region)) {
    for (const ts of track.topicSlugs) {
      if (!TOPIC_TO_TRACK.has(ts)) TOPIC_TO_TRACK.set(ts, track);
    }
  }
}

/** The primary track a topic hub belongs to (undefined only if it is in none). */
export const trackForTopic = (topicSlug: string): Track | undefined =>
  TOPIC_TO_TRACK.get(topicSlug);

/** Every multi-hub track across all regions — the set that gets a landing page. */
export function multiHubTracks(): Track[] {
  return REGION_SLUGS.flatMap((r) => tracksForRegion(r)).filter(isMultiHubTrack);
}
