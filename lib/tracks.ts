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
    topicSlugs: ['jee', 'neet', 'cuet', 'engineering-entrance-exams', 'gate', 'government-exams', 'specialized-exams', 'exam-preparation', 'mba-and-management-entrances', 'design-and-aptitude-entrances', 'counselling-and-seat-allotment', 'staff-selection-and-railway-exams', 'banking-and-insurance-exams', 'defence-and-police-recruitment', 'science-and-research-entrances', 'university-specific-admissions'],
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
    topicSlugs: ['career-paths', 'civil-services-and-government-careers', 'modern-and-creative-careers', 'staff-selection-and-railway-exams', 'banking-and-insurance-exams', 'defence-and-police-recruitment'],
  },
  {
    slug: 'after-school',
    region: 'india',
    label: 'After 10th & 12th',
    title: 'After 10th & 12th: Streams, Boards & Courses',
    description:
      'The school-stage decisions that shape everything after — choosing a stream after Class 10, comparing boards, board-exam preparation, and the courses and careers open after Class 12.',
    topicSlugs: ['courses-after-12th', 'school-and-boards', 'more-pathways-after-12th', 'college-quality-and-recognition', 'admission-essentials-and-documents'],
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
    topicSlugs: ['us-admissions', 'application-components-deep-dive-usa', 'college-essay-mastery-usa', 'admissions-strategy-and-positioning-usa', 'us-undergrad-admissions-strategy'],
  },
  {
    slug: 'sat-act-testing', region: 'usa', label: 'Tests & Credit',
    title: 'SAT, ACT & College Credit',
    description:
      'US college testing and credit — the digital SAT and the ACT, how to prepare and test smart, and earning college credit through AP, IB and CLEP.',
    topicSlugs: ['sat-act-testing', 'test-prep-and-test-day-deep-dive-usa', 'ap-ib-and-college-credit-usa', 'us-standardized-tests-deep-dive'],
  },
  {
    slug: 'us-universities', region: 'usa', label: 'Universities',
    title: 'US Universities & Getting In',
    description:
      'The US university landscape and how to get in — types and state systems, public and private, elite and Ivy admissions, and how to choose and compare colleges by fit.',
    topicSlugs: ['us-universities', 'ivy-and-elite-admissions-deep-dive', 'public-universities-and-systems-usa', 'choosing-and-comparing-us-colleges', 'us-public-university-admissions', 'us-private-and-tech-university-admissions', 'us-state-university-systems', 'us-transfer-and-community-college'],
  },
  {
    slug: 'us-majors-careers', region: 'usa', label: 'Majors & Careers',
    title: 'US College Majors & Careers',
    description:
      'Choosing a US college major — STEM and engineering, business and economics, humanities and social sciences, the health professions and the arts — what each studies and where it can lead.',
    topicSlugs: ['us-majors-careers', 'stem-majors-deep-dive-usa', 'engineering-disciplines-usa', 'business-and-economics-majors-usa', 'humanities-and-social-science-majors-usa', 'health-profession-majors-usa', 'arts-architecture-design-majors-usa', 'us-majors-and-careers-deep-dive'],
  },
  {
    slug: 'financial-aid-usa', region: 'usa', label: 'Financial Aid',
    title: 'Paying for College & Financial Aid (USA)',
    description:
      'Paying for a US degree — financial aid and the FAFSA, scholarships of every kind, and financing strategies and loans — with facts and official sources, not financial advice.',
    topicSlugs: ['financial-aid-usa', 'scholarships-deep-dive-usa', 'financing-strategies-and-loans-usa', 'us-financial-aid-deep-dive'],
  },
  {
    slug: 'us-grad-school', region: 'usa', label: 'Graduate School',
    title: 'US Graduate & Professional School',
    description:
      'US graduate and professional school — MS, PhD and funding, graduate programmes by field, and admission to medical, law, dental and other professional schools.',
    topicSlugs: ['us-grad-school', 'graduate-programs-by-field-usa', 'professional-school-admissions-usa', 'us-professional-licensing', 'us-graduate-admissions-by-field'],
  },
  {
    slug: 'international-students-usa', region: 'usa', label: 'International Students',
    title: 'International Students in the USA',
    description:
      'Studying in the US as an international student — applying, the F-1 visa and OPT, and the practicalities of student life, on- and off-campus work, travel and money.',
    topicSlugs: ['international-students-usa', 'international-student-life-and-work-usa', 'us-work-visas-and-opt', 'applying-to-us-from-india'],
  },
  {
    slug: 'us-college-life', region: 'usa', label: 'College Life',
    title: 'US College Life & Practicalities',
    description:
      'Life at a US college — housing and campus life and support, transfer routes, and the practical systems (GPA and credits, health cover, city costs) that shape your four years.',
    topicSlugs: ['us-college-life', 'campus-life-and-student-support-usa', 'us-student-life-and-logistics'],
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
    topicSlugs: ['uk-ireland-admissions', 'ucas-application-in-depth-uk', 'uk-entry-routes-and-qualifications', 'ireland-cao-and-leaving-cert-in-depth', 'applying-to-uk-ireland-in-depth'],
  },
  {
    slug: 'uk-ireland-universities', region: 'uk-ireland', label: 'Universities',
    title: 'UK & Ireland Universities',
    description:
      'Choosing a UK or Irish university — Oxbridge and the collegiate system, the Russell Group in depth, how university groups and league tables work, and studying across Scotland, Wales and Northern Ireland.',
    topicSlugs: ['uk-ireland-universities', 'oxbridge-and-the-collegiate-system', 'russell-group-universities-in-depth', 'uk-university-groups-and-league-tables', 'scotland-wales-northern-ireland-study', 'more-uk-ireland-universities'],
  },
  {
    slug: 'uk-ireland-courses-careers', region: 'uk-ireland', label: 'Courses & Careers',
    title: 'Courses & Careers in the UK & Ireland',
    description:
      'Choosing a degree subject in the UK and Ireland — economics and finance, psychology, the natural and life sciences, humanities and social sciences, art, design and architecture, and postgraduate and research study.',
    topicSlugs: ['uk-ireland-courses-careers', 'studying-economics-and-finance-uk-ireland', 'studying-psychology-uk-ireland', 'studying-natural-and-life-sciences-uk-ireland', 'studying-humanities-and-social-sciences-uk-ireland', 'studying-art-design-and-architecture-uk-ireland', 'postgraduate-and-research-study-uk-ireland', 'more-disciplines-and-professions-uk-ireland'],
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
    topicSlugs: ['uk-ireland-tuition-scholarships', 'uk-ireland-tuition-and-funding-in-depth', 'uk-ireland-scholarships-in-depth'],
  },
  {
    slug: 'uk-ireland-student-visas', region: 'uk-ireland', label: 'Student Visas',
    title: 'UK & Ireland Student Visas',
    description:
      'Student visas for the UK and Ireland — the routes, CAS, the Immigration Health Surcharge and documents, and the UK Student visa process in depth. Neutral official facts, not immigration advice.',
    topicSlugs: ['uk-ireland-student-visas', 'uk-student-visa-process-in-depth', 'visas-refusals-and-extensions-uk-ireland'],
  },
  {
    slug: 'work-and-stay-uk-ireland', region: 'uk-ireland', label: 'Work & Stay',
    title: 'Working & Staying On (UK & Ireland)',
    description:
      'Working during and after study in the UK and Ireland — the Graduate Route and Stamp 1G, the Skilled Worker and other work-visa routes, and building employability and graduate careers.',
    topicSlugs: ['work-and-stay-uk-ireland', 'uk-graduate-and-work-visa-routes-in-depth', 'graduate-careers-and-employability-uk-ireland', 'professional-licensing-uk-ireland'],
  },
  {
    slug: 'uk-ireland-student-life', region: 'uk-ireland', label: 'Student Life',
    title: 'Student Life in the UK & Ireland',
    description:
      'Living and settling in as a student in the UK and Ireland — accommodation, healthcare and the practicalities of settling in, from the BRP/eVisa and GP registration to council tax, banking and transport.',
    topicSlugs: ['uk-ireland-student-life', 'settling-into-uk-ireland-student-life', 'student-practical-life-uk-ireland'],
  },
];

// ───────────────────────────── Canada (explicit, Phase 2) ───────────────────
// Eight journey tracks anchored by the existing Canada hubs + their Phase-2
// sub-hubs. The remaining four abroad regions stay 1:1-derived until their Phase 2.
export const CANADA_TRACKS: Track[] = [
  {
    slug: 'canada-admissions', region: 'canada', label: 'Admissions',
    title: 'Canadian University Admissions',
    description:
      'Applying to Canadian universities — how admissions work and the application components in depth, and how your grades and qualifications are recognised across provinces.',
    topicSlugs: ['canada-admissions', 'canadian-application-components-in-depth', 'grades-and-credential-recognition-canada', 'professional-program-applications-canada', 'application-and-funding-essentials-canada'],
  },
  {
    slug: 'canada-tests-grades', region: 'canada', label: 'Tests & Grades',
    title: 'Tests, English & French for Canada',
    description:
      'The English and French tests and grade requirements for studying in Canada — IELTS, TOEFL, PTE and Duolingo for admission and the study permit, and how scores are used.',
    topicSlugs: ['canada-tests-grades', 'english-and-french-tests-for-canada-in-depth'],
  },
  {
    slug: 'study-permit-canada', region: 'canada', label: 'Study Permit',
    title: 'Canada Study Permit',
    description:
      'The Canada study permit — the PAL, proof of funds and documents, and the application process in depth. Neutral official facts deferred to IRCC, not immigration advice.',
    topicSlugs: ['study-permit-canada', 'canada-study-permit-process-in-depth'],
  },
  {
    slug: 'canada-tuition-funding', region: 'canada', label: 'Tuition & Funding',
    title: 'Cost, Tuition & Funding (Canada)',
    description:
      'Paying for study in Canada — tuition and living costs, scholarships and funding in depth, and how to manage money, the GIC and proof of funds. Facts, not financial advice.',
    topicSlugs: ['canada-tuition-funding', 'canadian-scholarships-and-funding-in-depth', 'paying-for-canada-and-managing-money'],
  },
  {
    slug: 'canada-universities', region: 'canada', label: 'Universities',
    title: 'Universities & Provinces in Canada',
    description:
      'Choosing where to study in Canada — the U15 and top schools, and the universities of Ontario (OUAC), Western Canada (BC and Alberta), Quebec and the CEGEP system, and the Atlantic and Prairie provinces.',
    topicSlugs: ['canada-universities', 'ontario-universities-and-ouac-in-depth', 'western-canada-universities-bc-and-alberta', 'quebec-universities-and-the-cegep-system', 'atlantic-and-prairie-universities-canada', 'more-canadian-universities-in-depth'],
  },
  {
    slug: 'canada-majors-careers', region: 'canada', label: 'Majors & Careers',
    title: 'Programs & Careers in Canada',
    description:
      'Choosing a programme in Canada — college diploma programmes, the sciences, arts and social sciences, trades and applied fields, co-operative education, and graduate study.',
    topicSlugs: ['canada-majors-careers', 'canadian-college-diploma-programs-in-depth', 'studying-sciences-in-canada', 'studying-arts-humanities-and-social-sciences-canada', 'studying-trades-and-applied-fields-canada', 'co-op-and-experiential-learning-canada-in-depth', 'graduate-study-in-canada-in-depth', 'more-programs-and-disciplines-canada'],
  },
  {
    slug: 'work-and-stay-canada', region: 'canada', label: 'Work & Stay',
    title: 'Working & Staying in Canada',
    description:
      'Working during and after study in Canada — the Post-Graduation Work Permit in depth, and the pathways to permanent residence for graduates. Deferred to IRCC, not immigration advice.',
    topicSlugs: ['work-and-stay-canada', 'pgwp-eligibility-and-rules-in-depth', 'pathways-to-permanent-residence-for-students-canada', 'professional-licensing-in-canada', 'more-immigration-pathways-canada'],
  },
  {
    slug: 'canada-student-life', region: 'canada', label: 'Student Life',
    title: 'Student Life in Canada',
    description:
      'Living as a student in Canada — settling in, provincial health cover, housing and money, and campus and community life, from clubs and support services to finding community.',
    topicSlugs: ['canada-student-life', 'settling-and-living-in-canada-in-depth', 'canadian-campus-and-community-life-in-depth', 'settling-in-and-daily-life-canada'],
  },
];

// ───────────────────────────── Europe (explicit, Phase 2) ───────────────────
// Eight journey tracks anchored by the existing Europe hubs + their Phase-2
// sub-hubs (multi-country). The remaining three abroad regions stay 1:1-derived.
export const EUROPE_TRACKS: Track[] = [
  {
    slug: 'europe-admissions', region: 'europe', label: 'Admissions',
    title: 'Studying in Europe: Admissions',
    description:
      'Applying to European universities — how admissions and documents work, the ECTS credit system and degree recognition, and Erasmus exchange and joint degrees across countries.',
    topicSlugs: ['europe-admissions', 'ects-credits-and-degree-recognition-europe', 'erasmus-and-joint-degrees-in-depth', 'applying-and-living-in-europe'],
  },
  {
    slug: 'europe-student-visas', region: 'europe', label: 'Student Visas',
    title: 'Student Visas for Europe',
    description:
      'Student visas and residence permits for Europe — national and Schengen routes, funds and insurance, and the visa process in depth by country. Neutral official facts, not immigration advice.',
    topicSlugs: ['europe-student-visas', 'europe-student-visa-process-in-depth'],
  },
  {
    slug: 'europe-universities', region: 'europe', label: 'Universities',
    title: 'European Universities & Country Systems',
    description:
      'Choosing where to study in Europe — top universities, and how admissions work country by country: Germany (APS, NC, FH vs Uni), France (grandes écoles, Parcoursup), the Netherlands (Studielink, WO vs HBO), Italy (Universitaly, IMAT) and the Nordics.',
    topicSlugs: ['europe-universities', 'germany-admissions-systems-in-depth', 'france-admissions-pathways-in-depth', 'netherlands-admissions-in-depth', 'italy-admissions-in-depth', 'nordics-admissions-in-depth', 'more-european-universities', 'more-european-study-countries'],
  },
  {
    slug: 'europe-courses-careers', region: 'europe', label: 'Courses & Careers',
    title: 'Courses & Careers in Europe',
    description:
      'Choosing a programme in Europe — engineering, the natural sciences and maths, social sciences and humanities, medicine and health degrees, and PhD and research funding.',
    topicSlugs: ['europe-courses-careers', 'studying-engineering-in-europe-in-depth', 'studying-natural-sciences-and-maths-in-europe', 'studying-social-sciences-and-humanities-in-europe', 'medicine-and-health-degrees-in-europe-in-depth', 'phd-and-research-funding-in-europe-in-depth', 'mbbs-and-medicine-in-europe'],
  },
  {
    slug: 'europe-tuition-scholarships', region: 'europe', label: 'Tuition & Scholarships',
    title: 'Tuition, Funding & Scholarships (Europe)',
    description:
      'Paying for study in Europe — tuition and free-tuition options, country scholarships in depth, and proving your funds via blocked accounts and proof-of-funds requirements. Facts, not financial advice.',
    topicSlugs: ['europe-tuition-scholarships', 'country-scholarships-in-europe-in-depth', 'blocked-accounts-and-proof-of-funds-europe', 'europe-scholarships-in-depth'],
  },
  {
    slug: 'work-and-stay-europe', region: 'europe', label: 'Work & Stay',
    title: 'Working & Staying in Europe',
    description:
      'Working during and after study in Europe — the EU Blue Card and national work permits, post-study work routes, and the pathways to permanent residence and citizenship. Deferred to each country, not immigration advice.',
    topicSlugs: ['work-and-stay-europe', 'eu-blue-card-and-work-permits-in-depth', 'staying-in-europe-pr-and-citizenship-pathways', 'professional-recognition-in-europe', 'germany-routes-and-europe-work-visas'],
  },
  {
    slug: 'europe-language-tests', region: 'europe', label: 'Language & Tests',
    title: 'Languages & Tests for Europe',
    description:
      'The languages and tests for studying in Europe — German tests and requirements, and learning French, Italian, Spanish or Dutch for study and daily life.',
    topicSlugs: ['europe-language-tests', 'learning-european-languages-for-study-and-life', 'europe-languages-and-english-taught'],
  },
  {
    slug: 'europe-student-life', region: 'europe', label: 'Student Life',
    title: 'Student Life in Europe',
    description:
      'Living as a student in Europe — housing, insurance, banking and travel, the first steps of residence registration after you arrive, and student life and culture across very different countries.',
    topicSlugs: ['europe-student-life', 'settling-in-europe-residence-registration-in-depth', 'student-life-and-culture-across-europe'],
  },
];

// ─────────────────────── Australia & New Zealand (explicit, Phase 2) ─────────
// Eight journey tracks anchored by the existing ANZ hubs + their Phase-2 sub-hubs.
// The remaining two abroad regions stay 1:1-derived until their Phase 2.
export const ANZ_TRACKS: Track[] = [
  {
    slug: 'anz-admissions', region: 'australia-nz', label: 'Admissions',
    title: 'Australia & New Zealand Admissions',
    description:
      'Applying to Australian and New Zealand universities — application strategy and offers, how qualifications are recognised and the pathways in, and New Zealand admissions in depth.',
    topicSlugs: ['anz-admissions', 'application-strategy-and-offers-anz', 'qualification-recognition-and-pathways-anz', 'new-zealand-admissions-in-depth', 'application-and-money-logistics-anz'],
  },
  {
    slug: 'anz-student-visas', region: 'australia-nz', label: 'Student Visas',
    title: 'Australia & New Zealand Student Visas',
    description:
      'Student visas for Australia and New Zealand — the Australian subclass 500 in depth (Genuine Student, CoE, evidence) and the New Zealand student visa. Neutral official facts, not immigration advice.',
    topicSlugs: ['anz-student-visas', 'australia-student-visa-subclass-500-in-depth', 'new-zealand-student-visa-in-depth', 'visas-refusals-and-skilled-migration-anz'],
  },
  {
    slug: 'anz-universities', region: 'australia-nz', label: 'Universities',
    title: 'Australian & New Zealand Universities',
    description:
      'Choosing a university in Australia or New Zealand — the Group of Eight and beyond, and New Zealand’s eight universities in depth.',
    topicSlugs: ['anz-universities', 'australian-universities-beyond-the-go8', 'new-zealand-universities-in-depth', 'australian-universities-in-depth-anz'],
  },
  {
    slug: 'anz-courses-careers', region: 'australia-nz', label: 'Courses & Careers',
    title: 'Courses & Careers in Australia & New Zealand',
    description:
      'Choosing a programme in Australia or New Zealand — the sciences, arts and social sciences, health and medical professions, agriculture and the environment, and law and business professions.',
    topicSlugs: ['anz-courses-careers', 'studying-sciences-in-australia-and-new-zealand', 'studying-arts-humanities-and-social-sciences-anz', 'health-and-medical-professions-anz-in-depth', 'agriculture-environment-and-marine-studies-anz', 'law-and-business-professions-anz', 'allied-health-and-professional-degrees-anz'],
  },
  {
    slug: 'anz-tuition-scholarships', region: 'australia-nz', label: 'Tuition & Scholarships',
    title: 'Tuition, Costs & Scholarships (ANZ)',
    description:
      'Paying for study in Australia and New Zealand — tuition and living costs, scholarships and funding in depth, and budgeting and money management. Facts, not financial advice.',
    topicSlugs: ['anz-tuition-scholarships', 'scholarships-and-funding-anz-in-depth', 'budgeting-and-money-management-anz'],
  },
  {
    slug: 'work-and-stay-anz', region: 'australia-nz', label: 'Work & Stay',
    title: 'Working & Staying On (Australia & NZ)',
    description:
      'Working during and after study in Australia and New Zealand — the subclass 485 graduate visa, skilled migration and PR pathways, and building graduate careers and employability. Deferred to official, not immigration advice.',
    topicSlugs: ['work-and-stay-anz', 'temporary-graduate-visa-485-in-depth', 'skilled-migration-and-pr-pathways-anz-in-depth', 'graduate-careers-and-employability-anz', 'skills-assessment-and-registration-anz', 'working-and-living-practical-anz'],
  },
  {
    slug: 'anz-english-tests', region: 'australia-nz', label: 'English Tests',
    title: 'English Tests for Australia & New Zealand',
    description:
      'The English tests for Australia and New Zealand — the accepted tests and scores, and the key difference between what is accepted for admission and for the student visa.',
    topicSlugs: ['anz-english-tests', 'english-tests-for-admission-vs-visa-anz'],
  },
  {
    slug: 'anz-student-life', region: 'australia-nz', label: 'Student Life',
    title: 'Student Life in Australia & New Zealand',
    description:
      'Living as a student in Australia and New Zealand — housing, banking and the cities, the practicalities of arriving and settling in, and student life, culture and support.',
    topicSlugs: ['anz-student-life', 'arriving-and-settling-in-anz-in-depth', 'student-life-culture-and-support-anz', 'more-study-cities-anz'],
  },
];

// ─────────────────────── Middle East (Gulf) (explicit, Phase 2) ──────────────
// Eight journey tracks anchored by the existing Gulf hubs + their Phase-2 sub-hubs.
// Russia & CIS is the last region that stays 1:1-derived until its Phase 2.
export const MIDDLE_EAST_TRACKS: Track[] = [
  {
    slug: 'middle-east-admissions', region: 'middle-east', label: 'Admissions',
    title: 'Gulf University Admissions',
    description:
      'Applying to universities in the Gulf — how the UAE and Saudi higher-education systems and recognition work, and certificate attestation and equivalency across the GCC.',
    topicSlugs: ['middle-east-admissions', 'uae-higher-education-system-and-recognition', 'saudi-higher-education-system-and-recognition', 'credential-attestation-and-equivalency-gulf-in-depth', 'india-to-gulf-and-back'],
  },
  {
    slug: 'middle-east-universities', region: 'middle-east', label: 'Universities',
    title: 'Universities in the Gulf',
    description:
      'Choosing a university in the Gulf — the top universities and the UAE’s national and private universities in depth, and how to choose between the GCC countries.',
    topicSlugs: ['middle-east-universities', 'uae-national-and-private-universities-in-depth', 'choosing-a-gulf-country-for-study'],
  },
  {
    slug: 'middle-east-branch-campuses', region: 'middle-east', label: 'Branch Campuses',
    title: 'International Branch Campuses in the Gulf',
    description:
      'The international branch campuses in the Gulf — how to judge their accreditation and quality, and the Dubai academic free-zones (Academic City and Knowledge Park).',
    topicSlugs: ['middle-east-branch-campuses', 'branch-campus-accreditation-and-quality-gulf', 'dubai-academic-clusters-and-free-zones-explained', 'more-gulf-branch-campuses'],
  },
  {
    slug: 'middle-east-scholarships', region: 'middle-east', label: 'Scholarships & Money',
    title: 'Scholarships, Funding & Money (Gulf)',
    description:
      'Funding study in the Gulf — scholarships across the GCC, funded graduate awards and assistantships at research universities, and managing money and banking. Facts, not financial advice.',
    topicSlugs: ['middle-east-scholarships', 'funded-graduate-scholarships-and-assistantships-gulf', 'managing-money-and-banking-for-students-gulf', 'gulf-scholarships-and-fees-in-depth'],
  },
  {
    slug: 'middle-east-student-visas', region: 'middle-east', label: 'Student Visas',
    title: 'Student Visas & Residency (Gulf)',
    description:
      'Student visas and residency for the Gulf — the GCC student-visa routes, working and staying after study, and the UAE Golden Visa and long-term residency. Neutral official facts, not immigration advice.',
    topicSlugs: ['middle-east-student-visas', 'gulf-work-and-residency-after-study-in-depth', 'uae-golden-visa-and-long-term-residency-explained', 'gulf-student-visas-in-depth'],
  },
  {
    slug: 'middle-east-courses-careers', region: 'middle-east', label: 'Courses & Careers',
    title: 'Courses & Careers in the Gulf',
    description:
      'Choosing a programme in the Gulf — the sciences, architecture and the creative arts, aviation and logistics, hospitality and tourism, finance and fintech, and graduate careers and employability.',
    topicSlugs: ['middle-east-courses-careers', 'sciences-and-mathematics-degrees-in-the-gulf', 'architecture-design-and-creative-arts-in-the-gulf', 'aviation-aerospace-and-logistics-in-the-gulf', 'hospitality-tourism-and-events-in-the-gulf', 'finance-banking-and-fintech-in-the-gulf', 'graduate-careers-and-employability-in-the-gulf', 'gulf-professional-licensing', 'gulf-degrees-and-fields'],
  },
  {
    slug: 'middle-east-tests-english', region: 'middle-east', label: 'Tests & English',
    title: 'Entrance & English Tests (Gulf)',
    description:
      'The tests for Gulf universities — the SAT, EmSAT, IELTS and TOEFL, and how school qualifications and entrance or placement tests are recognised.',
    topicSlugs: ['middle-east-tests-english', 'school-qualifications-and-entrance-tests-gulf', 'gulf-tests-and-practical-life'],
  },
  {
    slug: 'middle-east-student-life', region: 'middle-east', label: 'Student Life',
    title: 'Student Life in the Gulf',
    description:
      'Living as a student in the Gulf — costs, housing, health cover and budgeting, a practical city-by-city guide, and adjusting and student wellbeing.',
    topicSlugs: ['middle-east-student-life', 'living-in-gulf-cities-a-practical-guide', 'cultural-adjustment-and-student-wellbeing-gulf'],
  },
];

// ─────────────────────── Russia & CIS (explicit, Phase 2) — final region ─────
// Eight journey tracks anchored by the existing Russia & CIS hubs + their Phase-2
// sub-hubs. With this, ALL eight destinations now have explicit, two-level tracks.
export const RUSSIA_CIS_TRACKS: Track[] = [
  {
    slug: 'russia-cis-admissions', region: 'russia', label: 'Admissions',
    title: 'Russia & CIS Admissions',
    description:
      'Applying to universities in Russia and the CIS — the Russian higher-education system and degrees, how admission works across the CIS countries, and the preparatory faculty (podfak).',
    topicSlugs: ['russia-cis-admissions', 'russian-higher-education-system-and-degrees-explained', 'cis-admissions-and-application-systems-in-depth', 'preparatory-faculty-and-russian-foundation-year-in-depth', 'india-to-russia-cis-recognition-and-admission'],
  },
  {
    slug: 'russia-cis-universities', region: 'russia', label: 'Universities',
    title: 'Universities in Russia & the CIS',
    description:
      'Choosing a university in Russia or the CIS — Russian universities by field and type, the leading CIS universities by country, and how to verify and compare them.',
    topicSlugs: ['russia-cis-universities', 'russian-universities-by-field-and-type-in-depth', 'cis-universities-by-country-in-depth', 'how-to-verify-and-compare-russia-cis-universities', 'more-russia-cis-universities'],
  },
  {
    slug: 'russia-cis-mbbs', region: 'russia', label: 'MBBS',
    title: 'MBBS in Russia & the CIS for Indian Students',
    description:
      'MBBS in Russia and the CIS for Indian students — the India-side licensing path (NEET, NMC, FMGE/NExT, internship and registration) and how to verify and choose a medical university. Deferred to the NMC/NEET; no guarantees.',
    topicSlugs: ['russia-cis-mbbs', 'mbbs-abroad-india-licensing-fmge-next-in-depth', 'verifying-and-choosing-an-mbbs-university-abroad-india-side', 'russia-cis-medical-and-dental-deeper'],
  },
  {
    slug: 'russia-cis-courses-careers', region: 'russia', label: 'Courses & Careers',
    title: 'Courses & Careers in Russia & the CIS',
    description:
      'Choosing a programme in Russia or the CIS — the sciences and mathematics, the arts, humanities and social sciences, the creative and performing arts, IT, engineering and energy, and graduate and research study.',
    topicSlugs: ['russia-cis-courses-careers', 'studying-sciences-and-mathematics-in-russia-cis', 'studying-arts-humanities-and-social-sciences-russia-cis', 'creative-arts-music-and-performing-arts-russia-cis', 'it-engineering-and-energy-specialisations-russia-cis', 'graduate-and-research-study-aspirantura-russia-cis', 'russia-cis-fields-and-careers-more'],
  },
  {
    slug: 'russia-cis-scholarships', region: 'russia', label: 'Scholarships & Costs',
    title: 'Scholarships & Costs (Russia & CIS)',
    description:
      'Funding study in Russia and the CIS — the Russian Government Scholarship and the Open Doors olympiad in depth, and budgeting and student costs. Facts, not financial advice.',
    topicSlugs: ['russia-cis-scholarships', 'russian-government-scholarship-and-open-doors-in-depth', 'budgeting-and-student-costs-in-russia-cis-in-depth'],
  },
  {
    slug: 'russia-cis-student-visas', region: 'russia', label: 'Student Visas',
    title: 'Student Visas for Russia & the CIS',
    description:
      'Student visas for Russia and the CIS — the Russian student visa, invitation letter and migration registration, and the CIS student visas and residence permits. Neutral official facts, not immigration advice.',
    topicSlugs: ['russia-cis-student-visas', 'russia-student-visa-invitation-and-migration-in-depth', 'cis-student-visas-and-residence-permits-in-depth'],
  },
  {
    slug: 'russia-cis-language-tests', region: 'russia', label: 'Language & Tests',
    title: 'Language Tests for Russia & the CIS',
    description:
      'The languages and tests for studying in Russia and the CIS — Russian, the TORFL and IELTS/TOEFL — and how to learn Russian and reach the level your programme needs.',
    topicSlugs: ['russia-cis-language-tests', 'learning-russian-and-the-torfl-in-depth', 'russia-cis-language-in-depth'],
  },
  {
    slug: 'russia-cis-student-life', region: 'russia', label: 'Student Life',
    title: 'Student Life in Russia & the CIS',
    description:
      'Living as a student in Russia and the CIS — cost, housing, climate and healthcare, a practical city-by-city guide, and adjusting and student wellbeing.',
    topicSlugs: ['russia-cis-student-life', 'living-in-russian-and-cis-cities-a-practical-guide', 'adjusting-and-student-wellbeing-russia-cis'],
  },
];

// ─────────────── East & Southeast Asia (explicit, Phase 2) — 9th region ──────
// Eleven journey/country tracks over the region's 68 hubs (8 + 20 P2 + 20 P3 + 20 P4).
export const EAST_SOUTHEAST_ASIA_TRACKS: Track[] = [
  {
    slug: 'asia-admissions', region: 'east-southeast-asia', label: 'Admissions & Planning',
    title: 'Applying to Study in East & Southeast Asia',
    description:
      'How to apply across Asia — application systems, documents and credential recognition, intakes and deadlines, the language and English tests, where English-taught degrees exist, and choosing your destination.',
    topicSlugs: ["east-southeast-asia-admissions","asian-language-and-english-tests-in-depth","asia-application-practicalities-and-documents","asia-intakes-deadlines-and-application-planning","asia-english-taught-degrees-by-country","choosing-and-comparing-asian-destinations","asia-which-destination-for-your-field"],
  },
  {
    slug: 'asia-universities', region: 'east-southeast-asia', label: 'Universities',
    title: 'Universities in East & Southeast Asia',
    description:
      'The region’s leading universities and how to weigh a subject against a destination.',
    topicSlugs: ["east-southeast-asia-universities","fields-and-subjects-across-asia"],
  },
  {
    slug: 'asia-stem-health', region: 'east-southeast-asia', label: 'STEM & Health',
    title: 'STEM, Engineering & Health Studies in Asia',
    description:
      'Studying the sciences, engineering and the health professions across Asia — from computing and emerging tech to medicine, dentistry, nursing and the agricultural and marine sciences.',
    topicSlugs: ["asia-engineering-disciplines-in-depth","asia-computing-ai-and-data-in-depth","asia-emerging-tech-and-engineering-specialisations","asia-medicine-dentistry-and-health-sciences","asia-dentistry-veterinary-and-pharmacy","asia-nursing-and-allied-health-by-country","asia-agriculture-environment-and-marine"],
  },
  {
    slug: 'asia-business-arts', region: 'east-southeast-asia', label: 'Business, Arts & Social Sciences',
    title: 'Business, Arts & Social Sciences in Asia',
    description:
      'Studying business and finance, the creative fields, the social sciences and law, hospitality, maritime and logistics across Asia — plus postgraduate and research study.',
    topicSlugs: ["asia-business-finance-and-management-in-depth","asia-arts-design-media-and-architecture","asia-social-sciences-humanities-and-law","asia-hospitality-tourism-and-culinary","asia-maritime-aviation-and-logistics","asia-postgraduate-research-and-phd"],
  },
  {
    slug: 'asia-japan', region: 'east-southeast-asia', label: 'Study in Japan',
    title: 'Study in Japan',
    description:
      'Studying in Japan end to end — the universities, fields of study, MEXT and other scholarships, and student life, work and cities.',
    topicSlugs: ["study-in-japan","japan-universities-in-depth","japan-more-universities-and-programs","japan-even-more-universities","japan-fields-and-careers","japan-professional-and-creative-fields","japan-scholarships-and-funding-in-depth","japan-student-life-work-and-cities"],
  },
  {
    slug: 'asia-singapore', region: 'east-southeast-asia', label: 'Study in Singapore',
    title: 'Study in Singapore',
    description:
      'Studying in Singapore — the universities and pathways, fields of study and postgraduate routes, and scholarships, costs and working while and after you study.',
    topicSlugs: ["study-in-singapore","singapore-universities-and-pathways-in-depth","singapore-fields-and-careers","singapore-postgrad-and-professional-fields","singapore-scholarships-costs-and-work"],
  },
  {
    slug: 'asia-south-korea', region: 'east-southeast-asia', label: 'Study in South Korea',
    title: 'Study in South Korea',
    description:
      'Studying in South Korea — the universities, fields of study, and GKS and other funding, the D-2 and D-10 visas and student life.',
    topicSlugs: ["study-in-south-korea","korea-universities-in-depth","korea-more-universities","korea-even-more-universities","korea-fields-and-careers","korea-professional-and-creative-fields","korea-scholarships-visas-and-life"],
  },
  {
    slug: 'asia-hong-kong-taiwan', region: 'east-southeast-asia', label: 'Hong Kong & Taiwan',
    title: 'Study in Hong Kong & Taiwan',
    description:
      'Studying in Hong Kong and Taiwan — the universities and admission routes, fields of study, scholarships, and the practicalities in each.',
    topicSlugs: ["study-in-hong-kong-and-taiwan","hong-kong-universities-and-admission-in-depth","hong-kong-fields-and-student-life-in-depth","taiwan-universities-and-scholarships-in-depth","taiwan-more-universities-and-programs","taiwan-fields-programs-and-life-in-depth"],
  },
  {
    slug: 'asia-malaysia-sea', region: 'east-southeast-asia', label: 'Malaysia & SE Asia',
    title: 'Study in Malaysia & Southeast Asia',
    description:
      'Affordable study across Southeast Asia — Malaysia’s universities, branch campuses and pathways, and studying in Thailand and the Philippines.',
    topicSlugs: ["study-in-malaysia-and-southeast-asia","malaysia-universities-and-branch-campuses-in-depth","malaysia-more-universities-and-colleges","malaysia-fields-pathways-and-life-in-depth","thailand-and-philippines-study-in-depth","more-southeast-asia-universities","philippines-universities-nursing-and-life","thailand-universities-programs-and-life"],
  },
  {
    slug: 'asia-china-mbbs', region: 'east-southeast-asia', label: 'China & MBBS',
    title: 'Study in China & MBBS in Asia',
    description:
      'Studying in mainland China — universities, fields and the Chinese language, the CSC scholarship and HSK — plus the India-side NEET and NMC rules for pursuing MBBS in China or the Philippines.',
    topicSlugs: ["study-in-china-and-mbbs-in-asia","china-universities-and-scholarships-in-depth","china-more-universities","china-even-more-universities","china-fields-and-language-in-depth","mbbs-in-china-and-asia-in-depth"],
  },
  {
    slug: 'asia-work-costs', region: 'east-southeast-asia', label: 'Work, Costs & Living',
    title: 'Working, Costs & Living in Asia',
    description:
      'The money and living side of studying in Asia — costs and budgeting, scholarships and funding, student cities, health, safety and wellbeing, post-study work and bringing your qualification back to India.',
    topicSlugs: ["working-staying-and-costs-across-asia","asia-affordable-study-and-budgeting","asia-more-scholarships-and-corporate-funding","asia-student-cities-living-guides","asia-health-safety-and-wellbeing","asia-after-graduation-and-back-to-india"],
  },
]

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
  if (region === 'canada') return CANADA_TRACKS;
  if (region === 'europe') return EUROPE_TRACKS;
  if (region === 'australia-nz') return ANZ_TRACKS;
  if (region === 'middle-east') return MIDDLE_EAST_TRACKS;
  if (region === 'russia') return RUSSIA_CIS_TRACKS;
  if (region === 'east-southeast-asia') return EAST_SOUTHEAST_ASIA_TRACKS;
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
