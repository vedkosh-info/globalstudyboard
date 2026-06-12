import type { RegionSlug } from './regions';

// ─────────────────────────────────────────────────────────────────────────────
// Topics — pillar / hub pages for SEO topical authority.
//
// A Topic is simultaneously (a) a controlled TAG that guides reference via
// `guide.tags[]`, and (b) a hub page at /topics/<slug> that aggregates every
// related guide + exam and interlinks them. One concept, one route — a topic is
// a tag is a hub. See `.claude/rules/content-policy.md` §13 (SEO) + §11 (CMI).
//
// A guide appears on a hub if EITHER it lists the topic slug in `guide.tags`
// (the path for new guides) OR it is curated in `topic.guideSlugs` (used to seed
// hubs from the existing catalogue without editing every guide). Both are
// validated by the CMI (`validateContent`) so a typo'd slug fails the build.
// ─────────────────────────────────────────────────────────────────────────────

/** Coarse grouping used by the header mega-menu and the /topics index. */
export type TopicGroup =
  | 'exams' // entrance & competitive exams
  | 'fields' // fields of study & careers
  | 'after-12th' // choosing a path after school
  | 'study-abroad'
  | 'study-in-usa' // USA destination hubs (shown only when the USA region is selected)
  | 'study-in-canada' // Canada destination hubs (shown only when the Canada region is selected)
  | 'study-in-australia-nz' // Australia & New Zealand destination hubs (shown only when that region is selected)
  | 'prep-funding'; // exam strategy + scholarships

export const TOPIC_GROUP_LABELS: Record<TopicGroup, string> = {
  exams: 'Entrance & Competitive Exams',
  fields: 'Fields & Careers',
  'after-12th': 'After 12th',
  'study-abroad': 'Study Abroad',
  'study-in-usa': 'Study in the USA',
  'study-in-canada': 'Study in Canada',
  'study-in-australia-nz': 'Study in Australia & NZ',
  'prep-funding': 'Preparation & Funding',
};

export interface Topic {
  /** Stable, unique slug — also the value guides use in `tags[]`. */
  slug: string;
  /** Short label for nav / chips, e.g. "JEE & IITs". */
  label: string;
  /** SEO H1 / page title. */
  title: string;
  /** Meta description + the lede shown on the hub. */
  description: string;
  /** Optional longer hub intro prose (paragraphs split on blank lines). */
  intro?: string;
  group: TopicGroup;
  /**
   * Optional destination region this hub belongs to. Region-tagged hubs surface
   * in the /topics index and the Topics mega-menu ONLY when that region is the
   * effective selection; region-less hubs are always shown. The hub page itself
   * (and every guide page) stays directly reachable + indexable regardless.
   */
  region?: RegionSlug;
  /**
   * Curated guide slugs to seed the hub from the existing catalogue. New guides
   * normally join via `guide.tags` instead; both are merged + de-duplicated.
   */
  guideSlugs: string[];
  /** Curated related exam slugs (must be real `admission-guides.ts` slugs). */
  examSlugs?: string[];
  /** SEO keywords for the hub's metadata. */
  keywords: string[];
}

export const TOPICS: Topic[] = [
  // ───────────────────────────── Exams ─────────────────────────────
  {
    slug: 'jee',
    label: 'JEE & IITs',
    title: 'JEE, IITs & Engineering Admission',
    description:
      'Everything on JEE Main and JEE Advanced — eligibility, exam pattern, attempts, JoSAA counselling, and the path into the IITs, NITs and IIITs.',
    intro:
      'JEE is the gateway to India\'s top engineering institutes. JEE Main (conducted by the NTA) leads to the NITs, IIITs and GFTIs through JoSAA, while JEE Advanced is the second stage for admission to the IITs.\n\nThese guides explain each step in plain language and link every time-sensitive fact to the official source, because eligibility and counselling rules are set fresh each year.',
    group: 'exams',
    guideSlugs: [
      'jee-main-vs-jee-advanced-difference',
      'jee-main-eligibility-criteria',
      'jee-main-exam-pattern-and-syllabus',
      'how-to-apply-for-jee-main',
      'josaa-counselling-process-explained',
      'how-to-get-into-iit',
      'iit-vs-nit-which-is-better',
      'iit-vs-iiit-difference',
      'list-of-all-iits-in-india',
      'iit-branch-change-rules',
      'how-to-choose-engineering-college',
    ],
    examSlugs: ['jee-main', 'jee-advanced'],
    keywords: ['jee main', 'jee advanced', 'iit admission', 'josaa counselling', 'nit admission', 'engineering entrance exam'],
  },
  {
    slug: 'neet',
    label: 'NEET & Medical',
    title: 'NEET & Medical Admission in India',
    description:
      'NEET UG eligibility, exam pattern and MCC counselling, plus how to become a doctor and the medical courses you can pursue — MBBS, BDS, BAMS, nursing and allied health.',
    intro:
      'NEET UG is the single national entrance test for MBBS, BDS and AYUSH courses in India. These guides cover the exam itself — eligibility, pattern and MCC/state counselling — and the wider set of medical and health-science careers it opens up.\n\nAll medical eligibility and counselling specifics change each year, so every figure links back to the official NTA or MCC source.',
    group: 'exams',
    guideSlugs: [
      'neet-ug-eligibility-criteria',
      'neet-exam-pattern-and-syllabus',
      'neet-counselling-process-mcc',
      'how-to-become-a-doctor-in-india',
      'aiims-vs-government-medical-college',
      'career-options-after-neet-besides-mbbs',
      'bds-dental-course-guide',
      'bams-ayurveda-course-guide',
      'nursing-courses-in-india',
      'allied-health-sciences-careers',
    ],
    examSlugs: ['neet-ug', 'neet-pg'],
    keywords: ['neet ug', 'medical admission india', 'how to become a doctor', 'mbbs admission', 'neet counselling', 'mcc counselling'],
  },
  {
    slug: 'cuet',
    label: 'CUET & DU',
    title: 'CUET & University Admission in India',
    description:
      'CUET UG eligibility, exam pattern and syllabus, how to prepare, the universities that accept it, and how to get into Delhi University.',
    intro:
      'CUET UG is a national, computer-based test conducted by the NTA for undergraduate admission across central universities and a growing number of state, deemed and private universities. These guides explain the eligibility, pattern, syllabus and preparation, and how a single score is used to apply to many universities.\n\nSubject choices, marking and dates are set in the official information bulletin each cycle, so every specific links back to the official source.',
    group: 'exams',
    guideSlugs: [
      'cuet-ug-eligibility-and-exam-pattern',
      'cuet-ug-syllabus-and-subjects',
      'how-to-prepare-for-cuet',
      'universities-accepting-cuet-ug',
      'how-to-get-admission-in-delhi-university',
    ],
    examSlugs: ['cuet-ug', 'cuet-pg'],
    keywords: ['cuet ug', 'cuet exam', 'cuet syllabus', 'cuet eligibility', 'delhi university admission', 'universities accepting cuet'],
  },
  {
    slug: 'engineering-entrance-exams',
    label: 'Engineering Exams',
    title: 'Engineering Entrance Exams in India',
    description:
      'The national and state engineering entrance exams — JEE Main and Advanced, and state CETs like MHT CET, KCET, WBJEE, AP EAPCET and TS EAMCET — and how to choose between them.',
    intro:
      'Engineering admission in India runs through several entrance exams. JEE Main and JEE Advanced are the national route to the NITs, IIITs and IITs, while most states run their own Common Entrance Test (CET) for seats in state colleges. These guides explain each exam — who conducts it, the format and the syllabus — so you can pick the right ones for your target colleges.\n\nEvery exam sets its eligibility, pattern, marking and dates afresh each year, so each guide links back to the official source.',
    group: 'exams',
    guideSlugs: [
      'jee-main-vs-jee-advanced-difference',
      'jee-main-eligibility-criteria',
      'how-to-apply-for-jee-main',
      'mht-cet-exam-guide',
      'kcet-exam-guide',
      'wbjee-exam-guide',
      'ap-eapcet-exam-guide',
      'ts-eamcet-exam-guide',
      'keam-exam-guide',
      'gujcet-exam-guide',
      'bitsat-exam-guide',
      'viteee-exam-guide',
      'comedk-uget-exam-guide',
      'how-to-choose-engineering-college',
    ],
    examSlugs: ['jee-main', 'jee-advanced', 'mht-cet', 'kcet', 'wbjee', 'ap-eapcet', 'ts-eamcet', 'keam', 'gujcet', 'bitsat', 'viteee', 'comedk-uget'],
    keywords: ['engineering entrance exams', 'state cet engineering', 'mht cet kcet wbjee', 'jee vs state cet', 'engineering exams after 12th', 'list of engineering entrance exams'],
  },
  {
    slug: 'gate',
    label: 'GATE',
    title: 'GATE & Higher Studies After Engineering',
    description:
      'GATE preparation and what it unlocks — M.Tech, MS, PSU jobs and research — plus how to choose between M.Tech, MS, MBA and other paths after B.Tech.',
    intro:
      'GATE (the Graduate Aptitude Test in Engineering) is conducted by IISc and the IITs and is the main gateway to postgraduate engineering study, PSU recruitment and research. These guides cover how to prepare for GATE and the routes it opens, alongside a neutral look at M.Tech, MS, MBA and other options after B.Tech.\n\nEligibility, pattern, counselling and dates are set afresh each year, so every specific links back to the official source.',
    group: 'exams',
    guideSlugs: [
      'how-to-prepare-for-gate',
      'career-options-after-gate',
      'mtech-vs-ms-vs-mba-after-btech',
      'higher-studies-options-after-btech',
      'gate-vs-cat-for-engineers',
      'mba-after-engineering-worth-it',
    ],
    examSlugs: ['gate'],
    keywords: ['gate exam', 'gate preparation', 'after btech', 'mtech vs mba', 'higher studies after engineering', 'gate vs cat'],
  },
  {
    slug: 'government-exams',
    label: 'Government Exams',
    title: 'Government & Competitive Exams in India',
    description:
      'Structure, eligibility and preparation for India\'s major government and competitive exams — UPSC Civil Services, SSC, bank PO, NDA and railway recruitment.',
    intro:
      'Government and public-sector exams attract lakhs of candidates each year across UPSC, SSC, banking, defence and railways. These guides explain how each exam is structured and who can apply — neutral, official facts only, with no predictions or commentary.\n\nVacancy counts, age limits and attempt rules are set by each conducting body and change every cycle, so always confirm them on the official notification.',
    group: 'exams',
    guideSlugs: [
      'how-to-prepare-for-upsc',
      'ssc-cgl-exam-guide',
      'ssc-chsl-exam-guide',
      'ssc-mts-exam-guide',
      'bank-po-exam-guide',
      'ibps-clerk-vs-po-difference',
      'sbi-po-exam-guide',
      'rbi-grade-b-exam-guide',
      'nda-entrance-guide',
      'railway-exams-overview',
    ],
    examSlugs: ['ssc-cgl', 'ssc-chsl', 'ssc-mts', 'ibps-po', 'ibps-clerk', 'sbi-po', 'rbi-grade-b', 'cds', 'afcat', 'capf-ac'],
    keywords: ['government exams india', 'upsc civil services', 'ssc cgl', 'ssc chsl', 'bank po exam', 'ibps sbi rbi', 'nda exam', 'railway recruitment'],
  },

  // ───────────────────────────── Fields & careers ─────────────────────────────
  {
    slug: 'engineering',
    label: 'Engineering',
    title: 'Engineering Branches & Tech Careers',
    description:
      'Compare engineering branches — CSE, mechanical, electrical and emerging fields like data science, AI and cyber security — and choose the right degree and college.',
    intro:
      'Engineering is one of India\'s largest professional fields, and choosing a branch is one of the biggest decisions a student makes. These guides describe what each branch involves and the careers it leads to — without ranking branches as "better" or "worse".\n\nDemand shifts over time and varies by region and employer, so treat scope as context, not a guarantee.',
    group: 'fields',
    guideSlugs: [
      'computer-science-engineering-overview',
      'mechanical-engineering-career-scope',
      'electrical-engineering-overview',
      'electronics-communication-engineering-overview',
      'civil-engineering-career-scope',
      'chemical-engineering-overview',
      'aerospace-engineering-career-scope',
      'information-technology-vs-computer-science',
      'biotechnology-courses-and-career',
      'ai-and-machine-learning-engineering-branch',
      'ece-vs-cse-which-to-choose',
      'electronics-vs-electrical-engineering',
      'automobile-engineering-career-scope',
      'best-engineering-branches',
      'btech-vs-bsc-which-to-choose',
      'btech-cse-vs-data-science',
      'data-science-courses-in-india',
      'ai-courses-in-india',
      'cyber-security-career-guide',
      'how-to-choose-engineering-college',
    ],
    examSlugs: ['gate'],
    keywords: ['engineering branches', 'best engineering branch', 'cse vs data science', 'btech careers', 'engineering scope'],
  },
  {
    slug: 'mba',
    label: 'MBA & CAT',
    title: 'MBA, CAT & Management Studies',
    description:
      'CAT eligibility and pattern, how to prepare, IIM and ISB comparisons, MBA specializations, and whether an MBA is worth it after engineering.',
    intro:
      'An MBA is one of the most sought-after postgraduate routes in India, with CAT as the main gateway to the IIMs. These guides cover the exam, the percentile system, the top business schools and how to choose a specialization.\n\nThey stay neutral on "which school is best" and make no salary or placement guarantees — decisions should rest on your own goals and verified information.',
    group: 'fields',
    guideSlugs: [
      'cat-exam-eligibility-and-pattern',
      'how-to-prepare-for-cat',
      'cat-percentile-vs-marks-explained',
      'cat-vs-gmat-which-to-take',
      'top-iims-in-india-list',
      'iim-vs-isb-which-is-better',
      'mba-specializations-explained',
      'executive-mba-vs-regular-mba',
      'mba-after-engineering-worth-it',
      'gd-pi-preparation-guide',
    ],
    examSlugs: ['cat', 'gmat', 'ipmat'],
    keywords: ['mba in india', 'cat exam', 'iim admission', 'cat percentile', 'mba specializations', 'cat vs gmat'],
  },
  {
    slug: 'law',
    label: 'Law & CLAT',
    title: 'Law, CLAT & Legal Careers',
    description:
      'CLAT and AILET eligibility and pattern, how to become a lawyer in India, the National Law Universities, and career options after an LLB.',
    intro:
      'Law is a popular path after both Class 12 and graduation, with CLAT and AILET as the main entrances to the National Law Universities. These guides explain the exams, the route to practising as an advocate, and where an LLB can lead.\n\nThey describe institutions and pathways neutrally, without rankings or guarantees.',
    group: 'fields',
    guideSlugs: [
      'clat-eligibility-and-exam-pattern',
      'clat-vs-ailet-difference',
      'how-to-become-a-lawyer-in-india',
      'list-of-national-law-universities',
      'career-options-after-llb',
    ],
    examSlugs: ['clat', 'ailet'],
    keywords: ['clat exam', 'ailet', 'how to become a lawyer', 'national law universities', 'career after llb'],
  },
  {
    slug: 'commerce-and-finance',
    label: 'Commerce & Finance',
    title: 'Commerce & Finance Careers',
    description:
      'Professional and degree routes in commerce and finance — CA, CS, CFA, B.Com vs BBA, and how to build a career in investment banking.',
    intro:
      'Commerce opens onto a wide set of professional qualifications and finance careers. These guides explain the major routes — chartered accountancy, company secretaryship, the CFA programme and undergraduate choices — and how they fit together.\n\nThey make no salary or pass-rate guarantees and point every professional requirement to its official institute.',
    group: 'fields',
    guideSlugs: [
      'ca-chartered-accountancy-guide',
      'cs-company-secretary-guide',
      'cfa-guide-for-indians',
      'bcom-vs-bba-which-to-choose',
      'how-to-become-investment-banker-india',
    ],
    keywords: ['commerce careers', 'chartered accountancy', 'company secretary', 'cfa india', 'bcom vs bba', 'investment banking india'],
  },
  {
    slug: 'design-arts-media',
    label: 'Design, Arts & Media',
    title: 'Design, Arts & Media Careers',
    description:
      'Creative and humanities pathways — design careers after 12th, the NIFT/NID entrances, journalism and mass communication, psychology and hotel management.',
    intro:
      'Design, the arts and media are skill-led fields with a wide range of career pathways. These guides map the main courses and entrances — from NIFT and NID to journalism, psychology and hospitality — and the work each can lead to.\n\nThey describe options without framing any field as "lesser" and make no income claims.',
    group: 'fields',
    guideSlugs: [
      'career-options-in-design-after-12th',
      'nift-nid-entrance-guide',
      'journalism-mass-communication-courses',
      'psychology-courses-and-careers',
      'hotel-management-course-guide',
    ],
    examSlugs: ['nata', 'nchm-jee'],
    keywords: ['design courses', 'nift nid entrance', 'journalism courses', 'psychology careers', 'hotel management'],
  },

  // ───────────────────────────── After 12th ─────────────────────────────
  {
    slug: 'courses-after-12th',
    label: 'After 12th',
    title: 'Courses & Careers After 12th',
    description:
      'Stream-by-stream guides to what you can study after Class 12 — science, commerce and arts options, PCM and PCB pathways, and how to choose a college.',
    intro:
      'The choice of course after Class 12 shapes everything that follows. These guides lay out the realistic options for each stream and subject combination, plus the trade-offs between private and government, deemed and state, and studying in India versus abroad.\n\nThey stay neutral, decision-focused and free of guarantees.',
    group: 'after-12th',
    guideSlugs: [
      'career-options-after-12th-science',
      'career-options-after-12th-commerce',
      'career-options-after-12th-arts',
      'courses-after-12th-pcm',
      'courses-after-12th-pcb',
      'private-vs-government-college-india',
      'deemed-vs-state-university',
      'online-degree-vs-regular-degree',
      'study-in-india-vs-abroad',
    ],
    keywords: ['courses after 12th', 'career options after 12th', 'after 12th science', 'after 12th commerce', 'after 12th arts'],
  },

  // ───────────────────────────── Study abroad ─────────────────────────────
  {
    slug: 'study-abroad',
    label: 'Study Abroad',
    title: 'Study Abroad from India',
    description:
      'How to study abroad from India — country guides, English tests (IELTS, TOEFL), the GRE and GMAT, student visas, SOPs and LORs, costs and post-study work.',
    intro:
      'Studying abroad involves a sequence of decisions — destination, tests, applications, visas and funding. These guides walk through each one with official government and exam-board sources, and treat all visa and policy facts as neutral information to verify, never as advice.',
    group: 'study-abroad',
    guideSlugs: [
      'how-to-study-in-usa-from-india',
      'how-to-study-in-uk-from-india',
      'how-to-study-in-canada-from-india',
      'study-in-germany-from-india',
      'study-in-australia-from-india',
      'study-in-ireland-from-india',
      'study-in-france-from-india',
      'study-in-netherlands-from-india',
      'study-in-new-zealand-from-india',
      'ielts-vs-toefl-which-to-take',
      'how-to-prepare-for-ielts',
      'gre-guide-for-indian-students',
      'gmat-guide-for-indian-students',
      'duolingo-english-test-explained',
      'us-f1-student-visa-guide',
      'uk-student-visa-guide',
      'canada-study-permit-guide',
      'how-to-write-statement-of-purpose',
      'letter-of-recommendation-guide',
      'how-to-choose-a-university-abroad',
      'education-loan-for-study-abroad',
      'cost-of-studying-in-usa-for-indians',
      'part-time-jobs-for-international-students',
      'post-study-work-options-by-country',
      'mbbs-abroad-from-india-guide',
    ],
    examSlugs: ['ielts', 'toefl', 'pte-academic', 'duolingo-english-test', 'gre', 'gmat', 'sat'],
    keywords: ['study abroad from india', 'study in usa', 'study in uk', 'ielts', 'student visa', 'sop', 'study abroad cost'],
  },

  // ───────────────────────────── Prep & funding ─────────────────────────────
  {
    slug: 'exam-preparation',
    label: 'Exam Prep',
    title: 'Exam Preparation & Strategy',
    description:
      'Practical preparation strategy for India\'s big entrance exams — how to prepare for CAT, IELTS and UPSC, whether a drop year is worth it, and GD-PI prep.',
    intro:
      'Good preparation is as much about strategy as syllabus. These guides focus on how to prepare effectively — without coaching-industry hype, fake shortcuts or guaranteed-success claims.',
    group: 'prep-funding',
    guideSlugs: [
      'how-to-prepare-for-cat',
      'how-to-prepare-for-ielts',
      'how-to-prepare-for-upsc',
      'gd-pi-preparation-guide',
      'drop-year-for-jee-neet-worth-it',
    ],
    keywords: ['exam preparation', 'how to prepare', 'drop year jee neet', 'gd pi preparation', 'study strategy'],
  },
  {
    slug: 'scholarships',
    label: 'Scholarships',
    title: 'Scholarships & Education Funding',
    description:
      'Scholarships and funding for Indian students — the National Scholarship Portal, INSPIRE, Fulbright and DAAD, plus how to fund study abroad.',
    intro:
      'Funding can decide whether a plan is feasible. These guides cover major government and international scholarship routes and how education loans work, with secular eligibility facts only and a clear caution against pay-to-guarantee scams.',
    group: 'prep-funding',
    guideSlugs: [
      'scholarships-for-indian-students-abroad',
      'national-scholarship-portal-guide',
      'inspire-scholarship-guide',
      'fulbright-scholarship-for-indians',
      'daad-scholarship-for-indians',
      'education-loan-for-study-abroad',
    ],
    keywords: ['scholarships for indian students', 'national scholarship portal', 'inspire scholarship', 'fulbright', 'daad scholarship', 'education loan'],
  },

  // ───────────── India top-100 — new hubs (Sets 9, 13–14, 16, 17, 18) ─────────────
  {
    slug: 'teaching-and-research',
    label: 'Teaching & Research',
    title: 'Teaching & Research Careers in India',
    description:
      'Eligibility and exams for teaching and research careers — CTET and state TET, UGC NET/JRF, CSIR NET — plus how to become a teacher or professor and the B.Ed route.',
    intro:
      'Teaching and research careers in India span school classrooms, college lecture halls and research labs. School teaching needs a teacher-education qualification and a Teacher Eligibility Test (TET/CTET); college and university roles need a master\'s degree with UGC NET or CSIR NET, and increasingly a PhD.\n\nThese guides explain each exam and route with stable, official facts only — cut-offs, age limits and marking schemes change each cycle, so verify them on the conducting body\'s official site.',
    group: 'fields',
    guideSlugs: [
      'ctet-and-tet-exam-guide',
      'ugc-net-jrf-exam-guide',
      'csir-net-exam-guide',
      'how-to-become-a-teacher-in-india',
      'how-to-become-a-professor-in-india',
      'b-ed-course-guide',
    ],
    examSlugs: ['ctet', 'ugc-net', 'csir-net'],
    keywords: ['teaching career india', 'ctet tet exam', 'ugc net jrf', 'csir net', 'how to become a teacher india', 'how to become a professor india'],
  },
  {
    slug: 'career-paths',
    label: 'Career Paths',
    title: 'Career Paths: How to Become…',
    description:
      'Step-by-step, official-source guides to entering specific professions in India — pilot, merchant navy, IAS/IPS, software engineer, scientist, architect, pharmacist, judge and cabin crew.',
    intro:
      'The path to many professions is more structured than it looks. These guides trace each route — pilot, merchant navy, IAS and IPS officer, software engineer, scientist, architect, pharmacist, judge and cabin crew — from eligibility and official entry requirements through training and certification.\n\nThey stay neutral, make no salary or placement promises, and defer every volatile detail (age limits, attempts, licensing thresholds) to the official authority.',
    group: 'fields',
    guideSlugs: [
      'how-to-become-a-pilot-in-india',
      'how-to-join-merchant-navy',
      'how-to-become-an-ias-officer',
      'how-to-become-an-ips-officer',
      'how-to-become-a-software-engineer',
      'how-to-become-a-scientist-in-india',
      'how-to-become-an-architect-in-india',
      'how-to-become-a-pharmacist',
      'how-to-become-a-judge-judiciary-exams',
      'how-to-become-cabin-crew-air-hostess',
    ],
    examSlugs: [],
    keywords: ['career paths india', 'how to become a pilot india', 'how to become ias officer', 'how to become software engineer india', 'how to become a scientist india', 'cabin crew career india'],
  },
  {
    slug: 'school-and-boards',
    label: 'School & Boards',
    title: 'School Boards & Choosing a Stream',
    description:
      'Choosing a stream after Class 10, board exam preparation, comparing CBSE/ICSE/state boards, and how your Class 12 marks matter for admission.',
    intro:
      'The choices you make in school — which stream to take after Class 10, which board you study under, and how you approach your board exams — shape your later options. These guides explain each decision neutrally, with official sources for anything that needs verifying.\n\nStream choice, board differences and Class 12 eligibility norms change in their specifics, so confirm current details on the official source before you act.',
    group: 'after-12th',
    guideSlugs: [
      'how-to-choose-a-stream-after-10th',
      'science-vs-commerce-vs-arts-how-to-choose',
      'cbse-vs-icse-vs-state-board-difference',
      'how-to-score-well-in-board-exams',
      'how-important-is-class-12-percentage',
    ],
    examSlugs: [],
    keywords: ['how to choose stream after 10th', 'cbse vs icse vs state board', 'science commerce arts which to choose', 'board exam preparation', 'class 12 percentage admission', 'school boards india'],
  },
  {
    slug: 'new-age-careers',
    label: 'New-Age Careers',
    title: 'New-Age & Skill Careers',
    description:
      'Fast-evolving, skill-led careers — digital marketing, UX/UI design, full-stack development, product management, and animation, VFX and gaming.',
    intro:
      'New-age careers are defined more by skills and portfolio than by any single degree — digital marketing, UX/UI design, full-stack development, product management, and animation, VFX and gaming. There are many entry points: degrees, bootcamps, self-study and internships.\n\nThese guides describe what each field involves and realistic ways to enter it. No field is framed as highest-paying or easiest, and no income or placement outcome is guaranteed.',
    group: 'fields',
    guideSlugs: [
      'digital-marketing-career-guide',
      'ux-ui-design-career-guide',
      'full-stack-developer-career-guide',
      'product-management-career-guide',
      'animation-vfx-and-gaming-careers',
    ],
    examSlugs: [],
    keywords: ['new age careers india', 'digital marketing career', 'ux ui design career', 'full stack developer career', 'product management career', 'animation vfx gaming careers'],
  },
  {
    slug: 'specialized-exams',
    label: 'Specialized & PG Exams',
    title: 'Specialized & Postgraduate Entrance Exams',
    description:
      'Postgraduate and specialised entrance exams — CUET PG, NEET PG, NATA (architecture), IIT JAM (M.Sc) and NCHM JEE (hotel management).',
    intro:
      'India\'s entrance-exam landscape goes well beyond JEE and NEET. CUET PG opens postgraduate programmes at central and participating universities; NEET PG is the route to MD/MS for MBBS graduates; NATA tests aptitude for B.Arch; IIT JAM admits science graduates to IIT and IISc M.Sc programmes; and NCHM JEE leads to the B.Sc in Hospitality and Hotel Administration at the IHMs.\n\nEach is run by a different authority (NTA, NBEMS, the Council of Architecture, or the IITs), with its own eligibility and pattern set afresh each cycle — so verify specifics on the official site.',
    group: 'exams',
    guideSlugs: [
      'cuet-pg-exam-guide',
      'neet-pg-exam-guide',
      'nata-exam-guide',
      'iit-jam-exam-guide',
      'nchm-jee-hotel-management-exam-guide',
    ],
    examSlugs: ['cuet-pg', 'neet-pg', 'nata', 'iit-jam', 'nchm-jee'],
    keywords: ['specialized entrance exams india', 'cuet pg exam', 'neet pg md ms', 'nata architecture exam', 'iit jam msc', 'nchm jee hotel management'],
  },

  // ───────────── USA top-100 — region-gated hubs (region: 'usa') ─────────────
  {
    slug: 'us-admissions',
    label: 'US Admissions',
    title: 'US College Admissions',
    description:
      'How US undergraduate admissions work — the Common App, Early Decision and Early Action, the timeline, essays and how colleges read applications.',
    intro:
      'US college admissions can seem complex from the outside, but the core process follows a clear structure. Most four-year colleges use a holistic review that weighs academic performance, standardised test scores (where required), personal essays, extracurricular activities, and letters of recommendation together — no single factor determines admission on its own.\n\nThis hub covers everything prospective students need to navigate the process confidently: which application platforms to use, how Early Decision and Early Action differ, when to submit each piece of the application, how to build a balanced college list, and what to expect from the moment you submit to the day you commit. All guidance is based on official sources — individual college policies and deadlines change each year, so always verify specifics with each institution directly.',
    group: 'study-in-usa',
    region: 'usa',
    guideSlugs: [
      'how-us-college-admissions-work',
      'common-app-vs-coalition-app',
      'early-decision-vs-early-action-explained',
      'us-college-application-timeline',
      'how-many-colleges-should-you-apply-to',
      'how-to-write-the-common-app-essay',
      'college-supplemental-essays-guide',
      'letters-of-recommendation-for-us-colleges',
      'extracurricular-activities-for-college-applications',
      'how-to-build-a-college-list',
      'us-college-rankings-explained',
      'understanding-college-acceptance-rates',
      'reach-match-safety-schools-explained',
      'waitlists-and-deferrals-explained',
      'how-colleges-read-applications',
      'how-to-answer-why-this-college-essay',
      'demonstrated-interest-explained',
      'legacy-and-first-generation-applicants',
      'how-to-handle-a-waitlist-or-deferral',
      'how-to-compare-financial-aid-offers',
      'complete-guide-to-applying-to-us-colleges',
      'us-college-admissions-glossary',
      'international-student-guide-to-studying-in-usa',
      'scholarships-for-international-students-in-usa',
      'affordable-ways-to-study-in-usa',
    ],
    examSlugs: [
      'sat',
      'act',
      'ap-exams',
    ],
    keywords: [
      'US college admissions',
      'how to apply to US college',
      'Common App',
      'Early Decision Early Action',
      'US college application timeline',
      'holistic review admissions',
    ],
  },
  {
    slug: 'sat-act-testing',
    label: 'SAT, ACT & Testing',
    title: 'SAT, ACT & US College Testing',
    description:
      'The digital SAT, the enhanced ACT, AP credit, test-optional vs test-required policies, and how to prepare and superscore.',
    intro:
      'Standardised testing is a central part of US college admissions for most applicants, but the landscape has changed significantly in recent years. The SAT is now fully digital and adaptive; the ACT has introduced a shorter format; and test-optional policies — once near-universal — have been reinstated as requirements at several highly selective universities. Understanding each test and the current policy at each school you are targeting helps you plan your testing timeline.\n\nThese guides explain the structure and scoring of the digital SAT and the enhanced ACT in plain language, walk through how to decide between them, interpret what a strong score means for your specific college list, and clarify how test-optional policies actually work in 2026. Every volatile detail — fees, test dates, score ranges, and individual college policies — is linked to the official source and should be verified there before you act.',
    group: 'study-in-usa',
    region: 'usa',
    guideSlugs: [
      'digital-sat-explained',
      'enhanced-act-explained',
      'sat-vs-act-which-to-take',
      'is-test-optional-still-a-thing',
      'what-is-a-good-sat-score-explained',
      'how-to-prepare-for-the-sat',
      'how-to-prepare-for-the-act',
      'ap-exams-and-college-credit',
      'psat-and-national-merit-explained',
      'how-superscoring-works',
    ],
    examSlugs: [
      'sat',
      'act',
      'ap-exams',
    ],
    keywords: [
      'digital SAT',
      'ACT test',
      'SAT vs ACT',
      'test-optional colleges',
      'SAT score percentile',
      'US college admissions tests',
      'SAT ACT superscoring',
    ],
  },
  {
    slug: 'financial-aid-usa',
    label: 'Financial Aid (USA)',
    title: 'Financial Aid & Paying for College (USA)',
    description:
      'FAFSA, the CSS Profile, grants vs loans vs work-study, need-blind vs need-aware, merit vs need-based aid, and the true cost of attendance.',
    intro:
      'Paying for a U.S. college education involves navigating a system of federal, state, and institutional funding sources — each with its own application process, eligibility rules, and conditions. The foundation of the federal system is the FAFSA, which determines access to federal grants, subsidized loans, and work-study for eligible students. Many selective colleges also require the CSS Profile to assess eligibility for their own institutional aid funds.\n\nUnderstanding the different types of aid — and how they interact — is as important as knowing how to apply for them. Gift aid (grants and scholarships) does not need to be repaid; loans do. Need-based aid depends on financial circumstances; merit-based scholarships depend on achievement. Whether a college is need-blind or need-aware in its admissions process affects how applying for aid may influence your application. The guides in this hub walk through each topic clearly, citing official U.S. government and College Board sources, so you can make informed decisions about how to fund your studies.',
    group: 'study-in-usa',
    region: 'usa',
    guideSlugs: [
      'fafsa-explained-how-to-apply',
      'css-profile-explained',
      'types-of-financial-aid-grants-loans-work-study',
      'need-blind-vs-need-aware-admissions',
      'merit-scholarships-vs-need-based-aid',
      'cost-of-attendance-explained',
      'how-to-pay-for-college-in-usa',
      'federal-student-loans-explained',
      'how-to-find-and-win-scholarships',
      'net-price-calculator-explained',
    ],
    examSlugs: [
      'sat',
      'act',
    ],
    keywords: [
      'fafsa how to apply',
      'css profile',
      'financial aid usa',
      'grants loans work-study',
      'need-blind admissions',
      'merit scholarships vs need-based aid',
      'college financial aid',
      'paying for college usa',
    ],
  },
  {
    slug: 'us-universities',
    label: 'US Universities',
    title: 'US Universities: Types, Rankings & Getting In',
    description:
      'Ivy League, liberal arts colleges, public flagships and R1 research universities — how they differ, how rankings work, and how to choose and get in.',
    intro:
      'The United States is home to more than 4,000 degree-granting institutions spanning a wide range of types, sizes, and missions. Understanding the landscape — the difference between an Ivy League university, an R1 research university, a liberal arts college, and a public flagship — is the first step toward building a thoughtful, realistic college list. The category of a university shapes class size, teaching style, research access, campus culture, and ultimately what your four years of study will feel like.\n\nNo type is universally better than another. The right university is the one that best matches your academic programme, learning style, financial situation, and personal priorities. This hub brings together guides that explain what each type of US institution is, how they compare, and how to approach the process of choosing and applying — so you can make a well-informed decision grounded in facts rather than prestige alone.',
    group: 'study-in-usa',
    region: 'usa',
    guideSlugs: [
      'types-of-us-universities',
      'what-is-the-ivy-league',
      'liberal-arts-colleges-explained',
      'public-vs-private-universities-usa',
      'how-to-choose-a-us-college',
      'how-to-get-into-an-ivy-league-school',
      'how-to-get-into-harvard',
      'how-to-get-into-mit',
      'how-to-get-into-stanford',
      'how-to-get-into-top-engineering-schools-usa',
      'athletic-recruitment-and-sports-scholarships-usa',
      'honors-colleges-and-programs-explained',
      'bs-md-combined-medical-programs',
      'co-op-programs-explained',
      'double-major-minor-and-dual-degree-explained',
    ],
    examSlugs: [
      'sat',
      'act',
      'ap-exams',
      'toefl',
      'ielts',
    ],
    keywords: [
      'types of us universities',
      'ivy league colleges',
      'liberal arts colleges usa',
      'public vs private university usa',
      'r1 research university',
      'how to choose a us college',
      'best universities in the usa',
      'us college admissions guide',
    ],
  },
  {
    slug: 'us-majors-careers',
    label: 'Majors & Careers (USA)',
    title: 'College Majors & Careers (USA)',
    description:
      'How to choose a major and what popular US majors involve — computer science, nursing, business, engineering, data science and pre-professional tracks.',
    intro:
      'Choosing a college major is one of the most visible decisions in a US undergraduate application, yet it is rarely as fixed as it seems. Most US universities allow students to declare a major by the end of their sophomore year and to change it thereafter, so the initial choice is a starting point rather than a binding commitment. What matters most is making a thoughtful, interest-led decision with a clear understanding of each programme\'s structure, accreditation, and requirements.\n\nThis hub brings together guides covering the major academic fields students most commonly consider at US universities — including computer science, nursing, business and finance, and engineering — alongside a practical framework for making the choice itself. Each guide is written to help you understand what a field covers and what to look for in a programme, without fabricating salary claims or employment guarantees. Use the official pages of each university, the relevant accrediting body, and official US government resources to verify any specific figures before you decide.',
    group: 'study-in-usa',
    region: 'usa',
    guideSlugs: [
      'how-to-choose-a-college-major',
      'computer-science-major-guide-usa',
      'nursing-degree-guide-usa',
      'business-and-finance-majors-usa',
      'engineering-majors-usa',
      'data-science-and-ai-majors-usa',
      'pre-med-track-explained',
      'pre-law-track-explained',
      'undecided-major-what-to-do',
      'stem-vs-liberal-arts-which-to-choose',
    ],
    examSlugs: [
      'sat',
      'act',
      'ap-exams',
      'gre',
      'gmat',
    ],
    keywords: [
      'us college majors guide',
      'how to choose a major usa',
      'computer science major usa',
      'nursing degree usa',
      'business major usa',
      'engineering majors usa',
    ],
  },
  {
    slug: 'international-students-usa',
    label: 'International Students (USA)',
    title: 'International Students: Studying in the USA',
    description:
      'For international applicants — applying to US universities, the I-20 and SEVIS, the F-1 visa interview, proof of funds, and English-test requirements.',
    intro:
      'Applying to US universities as an international student involves navigating both the academic admissions process and a set of legal and documentary requirements unique to studying abroad. From choosing and applying to SEVP-certified universities through centralised platforms, to receiving your I-20, paying the SEVIS fee, preparing for your F-1 visa interview, and demonstrating the financial resources to cover your cost of attendance — each step has official rules set by the university, the US Department of State, and the Department of Homeland Security.\n\nThis hub brings together the essential guides for international applicants: how the US application process works, what the I-20 and SEVIS system are and why they matter, how to prepare for the F-1 visa interview, what financial documentation is required, and how to find and meet the English proficiency requirements for the universities on your list. All information here reflects stable, official facts — always verify current requirements directly with your university and at the official US government sources before taking action.',
    group: 'study-in-usa',
    region: 'usa',
    guideSlugs: [
      'how-to-apply-to-us-universities-as-an-international-student',
      'i-20-and-sevis-explained',
      'f1-visa-interview-preparation',
      'proof-of-funds-for-f1-visa',
      'english-test-requirements-for-us-universities',
      'opt-and-cpt-explained',
      'stem-opt-extension-explained',
      'credential-evaluation-for-us-admission',
      'j1-vs-f1-visa-explained',
      'on-campus-jobs-for-international-students',
    ],
    examSlugs: [
      'toefl',
      'ielts',
      'duolingo-english-test',
      'pte-academic',
      'sat',
      'act',
    ],
    keywords: [
      'international students USA',
      'apply to US universities international student',
      'I-20 SEVIS explained',
      'F-1 visa interview',
      'proof of funds F1 visa',
      'English test requirements US universities',
      'study in USA international student guide',
    ],
  },
  {
    slug: 'us-grad-school',
    label: 'US Graduate School',
    title: 'US Graduate School: MS, PhD & Funding',
    description:
      'Applying to US graduate programmes — MS and PhD admissions, the GRE-optional landscape, funding through assistantships, and the application package.',
    intro:
      'US graduate education spans two main paths: coursework master\'s programmes that give you advanced professional skills, and research-based programmes — including many MS tracks and virtually all PhD programmes — where you join a department, work with a faculty advisor, and contribute original research to your field. Navigating which path fits your goals, which programmes are the right fit, and how to fund your studies are the three questions these guides address.\n\nEvery fact that varies by programme — test requirements, funding availability, deadlines, stipend amounts — is deferred to the official source for that specific programme, because no general guide can be authoritative on current details. Use these guides to understand the structure and ask better questions; use each programme\'s official pages and the official US government resources to verify before acting.',
    group: 'study-in-usa',
    region: 'usa',
    guideSlugs: [
      'how-to-apply-to-us-grad-school',
      'ms-in-usa-application-guide',
      'phd-in-usa-funding-and-admission',
      'do-you-need-the-gre-for-grad-school',
      'assistantships-ta-ra-funding-explained',
      'mba-in-usa-application-guide',
      'gmat-vs-gre-for-mba',
      'how-to-get-into-us-law-school',
      'how-to-get-into-us-medical-school',
      'llm-in-usa-for-international-lawyers',
    ],
    examSlugs: [
      'gre',
      'gmat',
      'toefl',
      'ielts',
      'lsat',
      'mcat',
    ],
    keywords: [
      'us graduate school',
      'ms in usa',
      'phd in usa',
      'graduate school application usa',
      'gre for grad school',
      'teaching assistantship usa',
      'us phd funding',
      'us grad school admissions',
    ],
  },
  {
    slug: 'us-college-life',
    label: 'US College Life',
    title: 'US College Life, Transfer & Practicalities',
    description:
      'Transferring from community college, housing, health insurance, the GPA and credit system, campus jobs and living costs at US universities.',
    intro:
      'Choosing how to enter and navigate the US higher education system involves more than picking a university. Millions of students start at community colleges and transfer to four-year institutions — a legitimate, cost-effective pathway supported by formal articulation agreements in many states. Others explore alternative routes such as dual enrollment (earning college credit while still in high school) or take a deliberate gap year before enrolling. Understanding how credits transfer, how deferral works, and what the associate degree offers can shape your entire academic and financial trajectory.\n\nThis hub covers the practical side of US college life for students at every stage: the two-year pathway and transfer process, the meaning and uses of the associate degree, dual enrollment for high schoolers, and how to plan a purposeful gap year with or without a university deferral. Every guide is based on official sources and offers guidance only — verify specific deadlines, tuition, and policies on the official websites of the institutions and government agencies involved.',
    group: 'study-in-usa',
    region: 'usa',
    guideSlugs: [
      'community-college-to-university-transfer',
      'how-to-transfer-colleges-usa',
      'associate-degree-explained',
      'dual-enrollment-explained',
      'gap-year-before-us-college',
      'on-campus-vs-off-campus-housing',
      'student-health-insurance-usa',
      'cost-of-living-for-students-by-us-city',
      'campus-jobs-and-work-study',
      'us-grading-gpa-and-credit-system-explained',
    ],
    examSlugs: [
      'sat',
      'act',
      'ap-exams',
    ],
    keywords: [
      'US college transfer',
      'community college pathway USA',
      'associate degree USA',
      'dual enrollment USA',
      'gap year before college USA',
      'transfer university USA',
      'US college life',
      'college credit high school USA',
    ],
  },

  // ───────────── Canada top-100 — region-gated hubs (region: 'canada') ─────────────
  {
    slug: 'canada-admissions',
    label: 'Canada Admissions',
    title: 'Canadian University Admissions: How to Apply, Timelines & Requirements',
    description:
      'Understand how university admissions work in Canada — province-run systems, direct and OUAC applications, application timelines, and the academic and language requirements you need.',
    intro:
      'Applying to university in Canada works differently from many other countries: there is no single national application portal, education is run by each province and territory, and most decisions rest on your academic grades and required prerequisite subjects rather than US-style holistic review. These guides walk through how Canadian admissions work, the two main ways to apply (directly to each university, or through Ontario\'s centralized OUAC service), a general fall-intake timeline, and the academic and language requirements universities look for. Exact fees, deadlines, scores, and rules vary by university and province and change each year — always verify the current details on the official university or Government of Canada source before you apply.',
    group: 'study-in-canada',
    region: 'canada',
    guideSlugs: [
      'how-canadian-university-admissions-work',
      'how-to-apply-to-canadian-universities',
      'canadian-university-application-timeline',
      'ouac-application-guide',
      'admission-requirements-for-canadian-universities',
      'how-to-study-in-canada-as-an-international-student',
      'application-fees-and-documents-canada',
      'statement-of-purpose-for-canadian-universities',
      'letters-of-recommendation-canada',
      'how-to-choose-a-canadian-university',
      'community-college-pathways-in-canada',
      'college-to-university-transfer-canada',
      'foundation-and-pathway-programs-canada',
      'conditional-admission-canada',
      'studying-in-canada-after-12th-from-india',
      'study-in-canada-vs-australia',
      'canada-study-permit-vs-usa-f1',
      'is-canada-good-for-international-students',
      'public-vs-private-colleges-in-canada',
      'direct-entry-vs-pathway-canada',
      'complete-guide-to-studying-in-canada',
      'canada-study-permit-and-admission-glossary',
      'international-student-guide-to-canada',
      'affordable-ways-to-study-in-canada',
      'roadmap-to-study-in-canada-from-india',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'duolingo-english-test',
      'pte-academic',
    ],
    keywords: [
      'canadian university admissions',
      'how to apply to canadian universities',
      'ouac application ontario',
      'canada university application timeline',
      'admission requirements canada universities',
      'study in canada admissions process',
    ],
  },
  {
    slug: 'canada-tests-grades',
    label: 'Canada Tests & Grades',
    title: 'Tests & English Requirements for Studying in Canada',
    description:
      'Understand the English- and French-language tests Canadian universities accept — IELTS, TOEFL, the Duolingo English Test, PTE Academic, and French tests like TEF/TCF — including how scoring works, why minimums vary by university and program, and where to confirm the exact requirement.',
    intro:
      'Most Canadian university programs are taught in English, so international applicants whose first language is not English usually have to prove their English ability with a recognised test. The most widely accepted tests are IELTS Academic and TOEFL iBT, while a growing number of universities also accept the Duolingo English Test or PTE Academic — though acceptance is not universal. French proficiency matters mainly for French-language and Quebec programs, often via tests such as TEF or TCF. Crucially, there is no single national score requirement: each university and program sets its own minimum and can revise it every admission cycle, so always verify the exact requirement on the official source before you apply. These guides explain how each test works and how to choose the right one for your shortlist.',
    group: 'study-in-canada',
    region: 'canada',
    guideSlugs: [
      'ielts-for-canada-requirements',
      'toefl-vs-ielts-for-canada',
      'duolingo-english-test-for-canada',
      'english-proficiency-requirements-canada',
      'french-language-requirements-for-canada',
      'grade-requirements-for-canadian-universities',
      'percentage-to-gpa-conversion-for-canada',
      'how-the-canadian-grading-system-works',
      'do-canadian-universities-require-sat',
      'wes-credential-evaluation-for-canada',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'duolingo-english-test',
      'pte-academic',
    ],
    keywords: [
      'english test for canada universities',
      'ielts vs toefl canada',
      'duolingo english test canada',
      'english proficiency requirements canada',
      'french language requirements canada',
      'study in canada english requirements',
    ],
  },
  {
    slug: 'study-permit-canada',
    label: 'Canada Study Permit',
    title: 'Canada Study Permit: Application, PAL, Proof of Funds & Documents',
    description:
      'A neutral, official-source guide to the Canada study permit for international students — what it is, how to apply through IRCC, the Provincial Attestation Letter (PAL), proof of funds and the GIC option, and the documents you need.',
    intro:
      'Most international students need a study permit issued by Immigration, Refugees and Citizenship Canada (IRCC) to study in Canada. These guides explain the study permit in plain language — what it is and how it differs from a visa, the step-by-step application, the Provincial Attestation Letter (PAL) introduced in January 2024, proof-of-funds and the Guaranteed Investment Certificate (GIC), and a high-level documents checklist. Everything here is general information, not immigration advice: rules change frequently and the Student Direct Stream (SDS) was ended on 8 November 2024, so always verify the current requirements on the official Government of Canada source before you act.',
    group: 'study-in-canada',
    region: 'canada',
    guideSlugs: [
      'canada-study-permit-explained',
      'how-to-apply-for-a-canada-study-permit',
      'provincial-attestation-letter-pal-explained',
      'proof-of-funds-and-gic-for-canada',
      'study-permit-documents-checklist',
      'designated-learning-institution-dli-explained',
      'biometrics-and-medical-exam-for-canada',
      'study-permit-processing-times',
      'study-permit-refusal-reasons-and-reapplying',
      'bringing-family-on-a-canada-study-permit',
    ],
    examSlugs: [
      'ielts',
      'toefl',
    ],
    keywords: [
      'canada study permit',
      'how to apply for canada study permit',
      'provincial attestation letter PAL',
      'proof of funds GIC canada',
      'canada study permit documents checklist',
      'canada student visa requirements',
    ],
  },
  {
    slug: 'canada-tuition-funding',
    label: 'Tuition & Funding in Canada',
    title: 'Cost of Studying in Canada: Tuition, Living Costs & Budgeting',
    description:
      'Understand the real cost of studying in Canada — university tuition, student living expenses, practical budgeting, and how Canada compares with the USA and UK. Ranges only, with official sources to confirm current figures.',
    intro:
      'Planning the money side of studying in Canada means looking at two things: what you pay your university (tuition and compulsory fees) and what it costs to live (housing, food, transit, insurance). Both vary widely — tuition by program and university, living costs by city and lifestyle — so these guides give honest ranges and point you to the official figures to confirm. They also explain why the study-permit proof-of-funds amount is not the same as your actual living cost, show how to build a working student budget, and compare Canada neutrally with the USA and UK. Tuition, living costs, and immigration thresholds change every academic year, so always verify the latest numbers on the official Government of Canada and university sources before you commit.',
    group: 'study-in-canada',
    region: 'canada',
    guideSlugs: [
      'cost-of-studying-in-canada',
      'tuition-fees-at-canadian-universities',
      'cost-of-living-in-canada-for-students',
      'how-to-budget-as-a-student-in-canada',
      'canada-vs-usa-vs-uk-for-studies',
      'scholarships-for-international-students-in-canada',
      'canada-government-scholarships',
      'university-entrance-awards-canada',
      'osap-and-provincial-student-aid',
      'how-to-fund-your-studies-in-canada',
    ],
    examSlugs: [
      'ielts',
      'toefl',
    ],
    keywords: [
      'cost of studying in canada',
      'tuition fees at canadian universities',
      'cost of living in canada for students',
      'student budget canada',
      'canada vs usa vs uk for studies',
      'study in canada cost for international students',
    ],
  },
  {
    slug: 'canada-universities',
    label: 'Canada Universities',
    title: 'Universities in Canada: Rankings, U15, Colleges & Top-School Admissions',
    description:
      'Understand Canada\'s higher-education landscape — how to read attributed rankings, what the U15 research-university group means, the difference between colleges and universities, and how admission works at the University of Toronto and UBC.',
    intro:
      'Choosing where to study in Canada means cutting through rankings, labels, and admission jargon. This hub explains how to read university rankings (and why QS, Times Higher Education, and Maclean\'s disagree), what the U15 group of research-intensive universities actually is, how Canadian colleges differ from universities, and how admission works at two of the country\'s best-known universities. Every guide defers volatile figures — fees, deadlines, cutoffs, and admit rates — to the official source with a verify-on-official nudge, and treats all study-permit information as general guidance, not immigration advice.',
    group: 'study-in-canada',
    region: 'canada',
    guideSlugs: [
      'top-universities-in-canada',
      'u15-universities-explained',
      'college-vs-university-in-canada',
      'university-of-toronto-admission-guide',
      'ubc-admission-guide',
      'mcgill-university-admission-guide',
      'university-of-waterloo-admission-guide',
      'how-to-get-into-top-canadian-universities',
      'community-colleges-in-canada-explained',
      'choosing-between-canadian-provinces',
      'studying-in-ontario-guide',
      'studying-in-british-columbia-guide',
      'studying-in-quebec-guide',
      'studying-in-alberta-guide',
      'best-provinces-to-study-in-canada',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'duolingo-english-test',
      'gre',
    ],
    keywords: [
      'universities in canada',
      'top universities in canada',
      'u15 universities canada',
      'college vs university canada',
      'university of toronto admission',
      'ubc admission guide',
    ],
  },
  {
    slug: 'canada-majors-careers',
    label: 'Majors & Careers',
    title: 'Majors and Careers: Studying in Canada',
    description:
      'Explore popular fields of study in Canada — Computer Science, Engineering, Business and MBA, Data Science and AI — and how co-op education builds work experience into your degree.',
    intro:
      'Choosing what to study is one of the biggest decisions for students heading to Canada. This hub covers some of the most-searched fields — Computer Science, Engineering, Business and MBA, and Data Science and AI — along with how co-operative education (co-op) integrates paid work terms into a degree. Each guide explains what programs cover, the role of co-op, English-test and entry expectations, and where to verify the exact requirements on official sources. We defer all volatile specifics such as fees, scores, and rankings to official sources, attribute any rankings to their issuer, and make no salary, placement, admission, or immigration guarantees.',
    group: 'study-in-canada',
    region: 'canada',
    guideSlugs: [
      'computer-science-in-canada',
      'engineering-programs-in-canada',
      'business-and-mba-in-canada',
      'data-science-and-ai-programs-canada',
      'co-op-education-in-canada-explained',
      'health-and-nursing-programs-in-canada',
      'study-medicine-in-canada',
      'study-law-in-canada',
      'diploma-vs-degree-in-canada',
      'in-demand-courses-in-canada',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'duolingo-english-test',
      'pte-academic',
      'gmat',
      'gre',
    ],
    keywords: [
      'study majors in canada',
      'computer science in canada',
      'engineering programs canada',
      'mba in canada',
      'data science and ai canada',
      'co-op education canada',
    ],
  },
  {
    slug: 'work-and-stay-canada',
    label: 'Work & Stay in Canada',
    title: 'Working and Staying in Canada as an International Student',
    description:
      'Official IRCC and Service Canada facts on working while you study in Canada, the off-campus hour limit, co-op and post-graduation work permits, and getting a Social Insurance Number — general information to verify on the official Government of Canada source.',
    intro:
      'Many international students want to work while they study in Canada and gain Canadian experience afterwards. This hub gathers the essentials — working on-campus and off-campus, the off-campus hour limit updated in 2024, the co-op work permit for required placements, the Post-Graduation Work Permit (PGWP), and the Social Insurance Number (SIN) you need to be paid. Everything here is general information drawn from official Government of Canada sources, not immigration advice; work and permit rules change, so always confirm the current rules on the official IRCC or Service Canada source before you act.',
    group: 'study-in-canada',
    region: 'canada',
    guideSlugs: [
      'working-while-studying-in-canada',
      'post-graduation-work-permit-pgwp-explained',
      'co-op-work-permit-canada',
      'social-insurance-number-for-students',
      'on-campus-vs-off-campus-jobs-canada',
      'staying-in-canada-after-graduation',
      'express-entry-for-international-graduates',
      'provincial-nominee-program-for-students',
      'canadian-experience-class-explained',
      'study-permit-to-permanent-residence-overview',
    ],
    examSlugs: [
      'ielts',
    ],
    keywords: [
      'work while studying in canada',
      'post graduation work permit canada',
      'off campus work hours canada',
      'co-op work permit canada',
      'social insurance number students canada',
      'international student jobs canada',
    ],
  },
  {
    slug: 'canada-student-life',
    label: 'Student Life in Canada',
    title: 'Student Life in Canada: Settling In as an International Student',
    description:
      'Practical, welcoming guides to everyday student life in Canada — campus culture and weather, health insurance by province, housing, banking, phone plans and transit.',
    intro:
      'Settling into a new country is about more than admission and a study permit — it is the day-to-day reality of campus culture, the seasons, health coverage, finding a place to live, opening a bank account, and getting a phone and transit pass. These guides cover the practical side of student life in Canada in plain English. Because rules and costs (especially provincial health coverage, residence fees, and phone and transit terms) differ by province, city and provider and change over time, each guide points you to the official source to verify the current details for your own situation. Immigration-related points such as study permits and work eligibility are presented as general information, not immigration advice — always confirm them on the official Government of Canada source.',
    group: 'study-in-canada',
    region: 'canada',
    guideSlugs: [
      'student-life-in-canada',
      'health-insurance-for-international-students-canada',
      'student-housing-in-canada',
      'opening-a-bank-account-as-a-student-canada',
      'phone-and-transit-for-students-canada',
      'arriving-in-canada-student-checklist',
      'what-to-pack-for-canada',
      'part-time-jobs-and-budgeting-canada',
      'canadian-campus-life-and-culture',
      'student-safety-and-support-services-canada',
    ],
    examSlugs: [
      'ielts',
      'toefl',
    ],
    keywords: [
      'student life in canada',
      'international student life canada',
      'health insurance international students canada',
      'student housing canada',
      'opening a bank account student canada',
      'phone and transit for students canada',
    ],
  },

  // ───────────── Australia & New Zealand top-100 — region-gated hubs (region: 'australia-nz') ─────────────
  {
    slug: 'anz-admissions',
    label: 'Australia & NZ Admissions',
    title: 'Australia & New Zealand University Admissions',
    description:
      'How to apply to Australian and New Zealand universities as an international student — application routes, intakes, timelines, entry requirements, and state admission centres.',
    intro:
      'Applying to study in Australia or New Zealand follows a clear path: choose a course and university, meet the entry requirements, apply, accept your offer, and prepare for your student visa. Australia has no single national application portal for international students — you mostly apply directly to each university, while the state Tertiary Admission Centres (UAC, VTAC, QTAC, SATAC, TISC) are mainly domestic school-leaver pathways. These guides walk through the application process, the Semester 1 and Semester 2 intakes, typical timelines, and the academic, English-language, and document requirements. Volatile details such as exact deadlines, fees, scores, and visa rules change every year, so always verify them on the official university or government source before you apply.',
    group: 'study-in-australia-nz',
    region: 'australia-nz',
    guideSlugs: [
      'how-to-study-in-australia-complete-guide',
      'how-to-apply-to-australian-universities',
      'australian-university-application-process-and-timeline',
      'entry-requirements-for-australian-universities',
      'uac-vtac-satac-qtac-application-centres-guide',
      'how-to-study-in-new-zealand-complete-guide',
      'how-to-apply-to-new-zealand-universities',
      'entry-requirements-for-new-zealand-universities',
      'application-documents-checklist-australia-and-new-zealand',
      'statement-of-purpose-for-australia-and-new-zealand',
      'complete-guide-to-studying-in-australia-and-new-zealand',
      'study-in-australia-vs-new-zealand',
      'studying-in-australia-after-12th-from-india',
      'is-australia-good-for-international-students',
      'roadmap-to-study-in-new-zealand-from-india',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'pte-academic',
    ],
    keywords: [
      'study in australia',
      'how to apply to australian universities',
      'australia university intakes',
      'entry requirements australian universities',
      'uac vtac qtac satac',
      'study in australia for international students',
    ],
  },
  {
    slug: 'anz-student-visas',
    label: 'Australia Student Visas',
    title: 'Australia Student Visas (Subclass 500) — Guides for International Students',
    description:
      'Clear, neutral guides to the Australian Student visa (subclass 500): what it is, the financial and Genuine Student requirements, how to apply through ImmiAccount, and mandatory Overseas Student Health Cover (OSHC). Official facts only — verify on the Department of Home Affairs.',
    intro:
      'Planning to study in Australia starts with understanding the Student visa (subclass 500). These guides explain the visa and its conditions, the financial-capacity (evidence-of-funds) requirement and the figure that was raised in 2024, the Genuine Student (GS) requirement that replaced the older Genuine Temporary Entrant (GTE) requirement on 23 March 2024, the step-by-step application process through ImmiAccount, and the mandatory Overseas Student Health Cover (OSHC). Everything here is general information drawn from official Australian Government sources, not immigration advice — rules and amounts change, so always confirm the current details on the official Department of Home Affairs website before you apply.',
    group: 'study-in-australia-nz',
    region: 'australia-nz',
    guideSlugs: [
      'australia-student-visa-subclass-500-guide',
      'australia-student-visa-financial-requirements',
      'genuine-student-requirement-for-australia-student-visa',
      'australia-student-visa-application-process',
      'overseas-student-health-cover-oshc-guide',
      'new-zealand-student-visa-guide',
      'new-zealand-student-visa-financial-requirements',
      'new-zealand-student-visa-application-process',
      'student-visa-working-hours-australia-and-new-zealand',
      'bringing-family-on-a-student-visa-australia-new-zealand',
    ],
    examSlugs: [
      'ielts',
      'pte-academic',
      'toefl',
    ],
    keywords: [
      'australia student visa',
      'subclass 500 visa',
      'genuine student requirement australia',
      'australia student visa financial requirements',
      'australia student visa application process',
      'overseas student health cover oshc',
    ],
  },
  {
    slug: 'anz-universities',
    label: 'Australia & NZ Universities',
    title: 'Australian & New Zealand Universities — Admission Guides',
    description:
      'Admission guides to leading Australian and New Zealand universities — the Group of Eight, plus official, step-by-step application processes for Melbourne, Sydney, ANU, and UNSW.',
    intro:
      'Choosing where to study in Australia or New Zealand starts with understanding each university\'s official admission process. This hub explains what the Group of Eight (Go8) is and walks through the official application routes, entry and English-language requirements, and post-offer steps (OSHC and the student visa) for individual universities. We describe the official process only and defer every volatile figure — entry scores, fees, and deadlines — to each university\'s official site, with a reminder to verify current rules before you apply.',
    group: 'study-in-australia-nz',
    region: 'australia-nz',
    guideSlugs: [
      'group-of-eight-go8-universities-guide',
      'university-of-melbourne-admission-guide',
      'university-of-sydney-admission-guide',
      'australian-national-university-anu-admission-guide',
      'unsw-sydney-admission-guide',
      'monash-university-admission-guide',
      'university-of-queensland-admission-guide',
      'university-of-western-australia-admission-guide',
      'university-of-adelaide-admission-guide',
      'best-universities-in-australia-for-international-students',
      'universities-in-new-zealand-complete-guide',
      'university-of-auckland-admission-guide',
      'university-of-otago-admission-guide',
      'how-to-choose-a-university-in-australia',
      'regional-universities-in-australia-guide',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'pte-academic',
    ],
    keywords: [
      'australian universities admission',
      'group of eight universities',
      'study at university of melbourne',
      'university of sydney application',
      'anu admission guide',
      'unsw entry requirements',
    ],
  },
  {
    slug: 'anz-courses-careers',
    label: 'Courses & Careers',
    title: 'Courses & Careers in Australia and New Zealand',
    description:
      'Explore popular fields of study in Australia and New Zealand — engineering, IT and computer science, nursing, business and more — with neutral guides on how to choose, accreditation, and what to verify officially.',
    intro:
      'Choosing what to study is a personal decision, not a ranking. These guides describe the fields international students commonly pursue in Australia and New Zealand, explain professional accreditation (such as Engineers Australia for engineering and AHPRA/NMBA for nursing), and show how to read rankings and entry requirements. They make no promise of jobs, salaries, or migration outcomes — always verify volatile details on the official university and government sources.',
    group: 'study-in-australia-nz',
    region: 'australia-nz',
    guideSlugs: [
      'best-courses-to-study-in-australia',
      'best-universities-australia-engineering',
      'nursing-courses-in-australia-for-international-students',
      'it-and-computer-science-courses-in-australia',
      'business-and-management-courses-in-australia',
      'data-science-and-analytics-courses-in-australia',
      'health-and-medical-courses-in-australia',
      'masters-degree-in-australia-guide',
      'mba-in-australia-guide',
      'vocational-education-and-tafe-in-australia',
      'best-courses-to-study-in-new-zealand',
      'engineering-courses-in-new-zealand',
      'nursing-and-healthcare-courses-in-new-zealand',
      'best-courses-for-jobs-and-pr-in-australia-and-new-zealand',
      'choosing-the-right-course-for-australia-and-new-zealand',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'pte-academic',
      'gmat',
      'gre',
    ],
    keywords: [
      'courses to study in australia',
      'engineering universities in australia',
      'nursing courses in australia',
      'computer science courses in australia',
      'business courses in australia',
      'study fields in australia for international students',
    ],
  },
  {
    slug: 'anz-tuition-scholarships',
    label: 'Tuition & Scholarships',
    title: 'Australia & New Zealand: Tuition, Costs & Scholarships',
    description:
      'What it costs to study in Australia and how to fund it — tuition and living-cost components, plus university, government, and external scholarships, with every volatile figure deferred to the official source.',
    intro:
      'Planning the budget for study in Australia means understanding two things clearly: what you will spend and how you can fund it. These guides break down tuition and living-cost components in Australian dollars, explain why figures vary by course and city, and walk through the main scholarship routes — university awards, Australian Government programs such as Australia Awards (and Destination Australia, whose funding status we note from the official source), and external funding. We deliberately quote ranges and components rather than fixed amounts, because fees, living costs, scholarship values, deadlines, and program availability are set officially and change every year. For every figure, verify the current details on the official university or government source before you rely on it. Scholarships are competitive and never guaranteed.',
    group: 'study-in-australia-nz',
    region: 'australia-nz',
    guideSlugs: [
      'cost-of-studying-in-australia-for-international-students',
      'cost-of-living-in-australia-for-students',
      'scholarships-to-study-in-australia',
      'australia-awards-scholarships-guide',
      'destination-australia-scholarship-guide',
      'cost-of-studying-in-new-zealand',
      'scholarships-to-study-in-new-zealand',
      'education-loan-for-studying-in-australia-and-new-zealand',
      'cost-of-studying-australia-vs-new-zealand-compared',
      'university-scholarships-in-australia-guide',
    ],
    examSlugs: [
      'ielts',
      'pte-academic',
    ],
    keywords: [
      'cost of studying in australia',
      'cost of living in australia for students',
      'scholarships to study in australia',
      'australia awards scholarships',
      'destination australia scholarship',
      'australia student budget and funding',
    ],
  },
  {
    slug: 'work-and-stay-anz',
    label: 'Work & Stay',
    title: 'Working and Staying On in Australia and New Zealand',
    description:
      'Neutral, official-fact guides to work rights and post-study options in Australia and New Zealand — student work-hours rules, the Temporary Graduate visa (subclass 485), part-time and graduate jobs, and the Tax File Number — each pointing you to the official government source.',
    intro:
      'Work rights and post-study visas are set by government and change often. These guides present the facts neutrally — the student-visa work-hours limit, Australia’s Temporary Graduate visa (subclass 485) and its two streams, how to find part-time and graduate work, and how the Tax File Number and superannuation work through the ATO. They are general information, not immigration, tax, or financial advice, and they make no promise of a job, income, visa, or permanent residence. Always verify volatile details on the official Department of Home Affairs, Immigration New Zealand, and ATO sources before acting.',
    group: 'study-in-australia-nz',
    region: 'australia-nz',
    guideSlugs: [
      'temporary-graduate-visa-485',
      'working-while-studying-in-australia-rules',
      'part-time-jobs-for-international-students-in-australia',
      'finding-a-graduate-job-in-australia-guide',
      'tax-file-number-and-working-in-australia',
      'skilled-migration-to-australia-points-system-guide',
      'subclass-189-skilled-independent-visa-guide',
      'subclass-190-state-nominated-visa-guide',
      'subclass-491-skilled-work-regional-visa-guide',
      'permanent-residency-pathways-after-studying-in-australia',
      'new-zealand-post-study-work',
      'working-while-studying-in-new-zealand-rules',
      'skilled-migrant-category-resident-visa-new-zealand',
      'green-list-occupations-new-zealand-guide',
      'post-study-work-and-pr-australia-vs-new-zealand',
    ],
    examSlugs: [
      'ielts',
      'pte-academic',
      'toefl',
    ],
    keywords: [
      'subclass 485 visa',
      'working while studying in australia',
      'part time jobs for international students australia',
      'post study work visa australia',
      'tax file number australia',
      'finding a graduate job in australia',
    ],
  },
  {
    slug: 'anz-student-life',
    label: 'Student Life in Australia & NZ',
    title: 'Student Life in Australia & New Zealand',
    description:
      'Where to study and what life is really like — the best Australian student cities and practical, neutral guides to Melbourne, Sydney, Brisbane and Perth, with living-cost ranges and how to settle in.',
    intro:
      'Choosing where to study is about more than a university name — the city shapes your cost of living, climate, commute and day-to-day life. These guides describe Australia\'s major student cities neutrally, with living costs framed in ranges (AUD) and all volatile figures deferred to official sources. Use them to match a city to your course, budget and lifestyle, and always verify current costs and rules on the official Australian Government and university websites.',
    group: 'study-in-australia-nz',
    region: 'australia-nz',
    guideSlugs: [
      'best-cities-to-study-in-australia',
      'studying-in-melbourne-student-guide',
      'studying-in-sydney-student-guide',
      'studying-in-brisbane-student-guide',
      'studying-in-perth-student-guide',
      'student-accommodation-in-australia-guide',
      'opening-a-bank-account-in-australia-for-students',
      'studying-in-auckland-student-guide',
      'student-accommodation-in-new-zealand-guide',
      'student-life-in-new-zealand-guide',
    ],
    examSlugs: [
      'ielts',
      'pte-academic',
      'toefl',
    ],
    keywords: [
      'best cities to study in australia',
      'student life in australia',
      'cost of living in australia for students',
      'studying in melbourne',
      'studying in sydney',
      'study in australia student cities',
    ],
  },
  {
    slug: 'anz-english-tests',
    label: 'English Tests (Australia & NZ)',
    title: 'English Tests for Australia & New Zealand',
    description:
      'IELTS, PTE Academic, and TOEFL for studying in Australia and New Zealand — which tests universities and visas accept, and where to confirm the required scores.',
    intro:
      'Most students applying to Australia or New Zealand need to show English proficiency in two places: the university\'s own course requirement and the student-visa requirement set by each government. This hub explains the main accepted tests — IELTS Academic, PTE Academic, and TOEFL iBT — and the country-by-country English requirements. Required scores and accepted tests vary by university, course, and visa route and change over time, so every guide points you to the official university and government sources to confirm the current figures. Immigration details are general information, not immigration advice — always verify on the official government source.',
    group: 'study-in-australia-nz',
    region: 'australia-nz',
    guideSlugs: [
      'ielts-for-australia-and-new-zealand-guide',
      'pte-academic-for-australia-and-new-zealand-guide',
      'toefl-for-australia-and-new-zealand',
      'english-language-requirements-for-australian-universities',
      'english-language-requirements-for-new-zealand-universities',
      'ielts-vs-pte-for-australia-student-visa',
      'english-test-score-requirements-explained-australia-nz',
      'duolingo-english-test-for-australia-and-new-zealand',
      'australia-vs-uk-for-international-students',
      'australia-vs-usa-for-international-students',
    ],
    examSlugs: [
      'ielts',
      'pte-academic',
      'toefl',
    ],
    keywords: [
      'english test for australia',
      'english test for new zealand',
      'ielts for australia',
      'pte academic australia new zealand',
      'english requirements australian universities',
      'english requirements new zealand universities',
    ],
  },
];

// ─────────────────────────────── Helpers ────────────────────────────────────

const TOPIC_BY_SLUG = new Map<string, Topic>(TOPICS.map((t) => [t.slug, t]));

/** All valid topic slugs — the controlled vocabulary `guide.tags[]` must use. */
export const TOPIC_SLUGS: ReadonlySet<string> = new Set(TOPICS.map((t) => t.slug));

export const getTopicBySlug = (slug: string): Topic | undefined => TOPIC_BY_SLUG.get(slug);

export const getTopicsByGroup = (group: TopicGroup): Topic[] =>
  TOPICS.filter((t) => t.group === group);

// guidesForTopic() + topicsForGuide() live in ./topic-guides — they depend on the
// heavy GUIDES data array and are kept out of this module so Client Components can
// import the lightweight TOPICS array + labels here without bundling GUIDES into
// the browser. Import those helpers from '@/lib/topic-guides' (server-side only).
