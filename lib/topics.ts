import type { Guide } from './guides';
import { GUIDES } from './guides';

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
  | 'prep-funding'; // exam strategy + scholarships

export const TOPIC_GROUP_LABELS: Record<TopicGroup, string> = {
  exams: 'Entrance & Competitive Exams',
  fields: 'Fields & Careers',
  'after-12th': 'After 12th',
  'study-abroad': 'Study Abroad',
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
];

// ─────────────────────────────── Helpers ────────────────────────────────────

const TOPIC_BY_SLUG = new Map<string, Topic>(TOPICS.map((t) => [t.slug, t]));

/** All valid topic slugs — the controlled vocabulary `guide.tags[]` must use. */
export const TOPIC_SLUGS: ReadonlySet<string> = new Set(TOPICS.map((t) => t.slug));

export const getTopicBySlug = (slug: string): Topic | undefined => TOPIC_BY_SLUG.get(slug);

export const getTopicsByGroup = (group: TopicGroup): Topic[] =>
  TOPICS.filter((t) => t.group === group);

/**
 * Every guide shown on a topic hub: the curated `guideSlugs` (in their listed
 * order) merged with any guide that tags the topic, de-duplicated. Returns the
 * full Guide objects, skipping any slug that no longer resolves.
 */
export function guidesForTopic(slug: string): Guide[] {
  const topic = TOPIC_BY_SLUG.get(slug);
  if (!topic) return [];
  const order = new Map<string, number>();
  topic.guideSlugs.forEach((s, i) => order.set(s, i));
  let next = topic.guideSlugs.length;
  for (const g of GUIDES) {
    if (g.tags?.includes(slug) && !order.has(g.slug)) order.set(g.slug, next++);
  }
  return GUIDES.filter((g) => order.has(g.slug)).sort(
    (a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0),
  );
}

/** Topics a given guide belongs to (explicit tags first, then any curated hub). */
export function topicsForGuide(guide: Guide): Topic[] {
  const slugs = new Set<string>(guide.tags ?? []);
  for (const t of TOPICS) if (t.guideSlugs.includes(guide.slug)) slugs.add(t.slug);
  return TOPICS.filter((t) => slugs.has(t.slug));
}
