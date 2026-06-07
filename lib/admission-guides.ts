import type { RegionSlug } from './regions';

export type ExamRegion = RegionSlug | 'global';

export type ExamDomain =
  | 'undergraduate-admission'
  | 'graduate-admission'
  | 'engineering'
  | 'medicine'
  | 'management'
  | 'law'
  | 'language'
  | 'science'
  | 'general';

export interface ExamSource {
  /** Short human label, e.g. "College Board — SAT fees". */
  label: string;
  /** Tier-1 official URL the fact was verified against. */
  url: string;
}

export interface EntranceExam {
  id: string;
  slug: string;
  shortName: string;
  fullName: string;
  /** Primary home region, or 'global' for a test accepted everywhere. */
  region: ExamRegion;
  /**
   * Regions this exam is required/accepted in when it is relevant to a SPECIFIC
   * subset (e.g. SAT → USA + Middle East). Leave unset for single-region exams;
   * use `region: 'global'` for tests accepted everywhere. See `resolveDisplayRegions()`.
   */
  regions?: RegionSlug[];
  domain: ExamDomain;
  conductingBody: string;
  frequency: string;
  mode: 'online' | 'offline' | 'both';
  duration: string;
  totalMarks: string;
  descriptionEn: string;
  eligibility: string;
  websiteUrl?: string;
  collegesAccepting: string[];
  costUsd?: string;
  /** Tier-1 official sources the hard facts (fee/pattern) were verified against. */
  sources?: ExamSource[];
  /** ISO date (YYYY-MM-DD) the facts were last verified against official sources. */
  lastVerified?: string;
}

export const ENTRANCE_EXAMS: EntranceExam[] = [
  // ─────────────────────────── USA undergraduate ───────────────────────────
  {
    id: 'sat',
    slug: 'sat',
    shortName: 'SAT',
    fullName: 'Scholastic Assessment Test',
    region: 'usa',
    // Also used for admission to American universities in the Middle East
    // (e.g. NYU Abu Dhabi — see collegesAccepting). See Content Policy §11.4.
    regions: ['usa', 'middle-east'],
    domain: 'undergraduate-admission',
    conductingBody: 'College Board',
    frequency: '7 dates per year (Aug, Oct, Nov, Dec, Mar, May, Jun)',
    mode: 'online',
    duration: '2 hours 14 minutes',
    totalMarks: '1600 (Reading & Writing 800 + Math 800)',
    eligibility: 'No formal prerequisite; typically taken by high-school juniors and seniors',
    websiteUrl: 'https://satsuite.collegeboard.org',
    costUsd: 'US$68 base fee; an additional regional fee applies for international test centres',
    descriptionEn:
      'The Digital SAT is required or recommended for undergraduate admissions at most U.S. universities. A score of 1500+ is competitive for top schools. The test is adaptive (module 2 difficulty depends on module 1 performance). Scores are valid for five years and can be superscored across attempts.',
    collegesAccepting: ['mit', 'harvard', 'stanford', 'caltech', 'princeton', 'yale', 'columbia', 'upenn', 'uchicago', 'cornell', 'brown', 'dartmouth', 'cmu', 'northwestern', 'duke', 'nyu', 'nyu-abu-dhabi'],
    sources: [
      { label: 'College Board — SAT test fees', url: 'https://satsuite.collegeboard.org/sat/registration/fees-refunds/test-fees' },
      { label: 'College Board — SAT international fees', url: 'https://satsuite.collegeboard.org/sat/registration/international-testing/fees' },
    ],
    lastVerified: '2026-06-03',
  },
  {
    id: 'act',
    slug: 'act',
    shortName: 'ACT',
    fullName: 'American College Testing',
    region: 'usa',
    domain: 'undergraduate-admission',
    conductingBody: 'ACT, Inc.',
    frequency: '7 dates per year',
    mode: 'both',
    duration: '2 hours 55 minutes (3 hours 35 minutes with optional Writing)',
    totalMarks: '1–36 composite score',
    eligibility: 'No formal prerequisite; typically taken by high-school juniors and seniors',
    websiteUrl: 'https://www.act.org',
    costUsd: 'US$70 core (English, Math, Reading); +US$5 Science add-on and +US$25 Writing add-on (up to US$100 with both)',
    descriptionEn:
      'An alternative to the SAT, accepted by all U.S. universities. The ACT has three core sections (English, Math, Reading) with optional Science and Writing add-ons. A score of 34+ is competitive for top universities. Most students take only the SAT or ACT — not both.',
    collegesAccepting: ['mit', 'harvard', 'stanford', 'caltech', 'princeton', 'yale', 'columbia', 'upenn', 'uchicago', 'cornell', 'brown', 'dartmouth', 'uc-berkeley', 'ucla', 'umich'],
    sources: [
      { label: 'ACT — Current ACT fees and services', url: 'https://www.act.org/content/act/en/products-and-services/the-act/registration/fees.html' },
    ],
    lastVerified: '2026-06-03',
  },
  {
    id: 'ap',
    slug: 'ap-exams',
    shortName: 'AP Exams',
    fullName: 'Advanced Placement Examinations',
    region: 'usa',
    domain: 'undergraduate-admission',
    conductingBody: 'College Board',
    frequency: 'Once a year (May)',
    mode: 'both',
    duration: '2–3 hours per subject',
    totalMarks: '1–5 per subject',
    eligibility: 'No formal prerequisite; typically taken after a year-long AP course in high school',
    websiteUrl: 'https://apstudents.collegeboard.org',
    costUsd: 'US$99 per exam in the US, US territories, Canada & DoDEA schools; US$129 per exam at schools outside the US (2025–26)',
    descriptionEn:
      'AP exams test college-level knowledge in 38 subjects. High scores (typically 4 or 5) can earn college credit, advanced placement, or both at over 4,000 universities worldwide. International students often use AP scores in place of A-Levels or IB.',
    collegesAccepting: ['mit', 'harvard', 'stanford', 'caltech', 'princeton', 'yale', 'columbia', 'upenn', 'uchicago', 'cornell', 'oxford', 'cambridge'],
    sources: [
      { label: 'College Board — AP exam fees', url: 'https://apstudents.collegeboard.org/exam-policies-guidelines/exam-fees' },
    ],
    lastVerified: '2026-06-03',
  },

  // ─────────────────────────── USA graduate ───────────────────────────
  {
    id: 'gre',
    slug: 'gre',
    shortName: 'GRE',
    fullName: 'Graduate Record Examinations',
    region: 'global',
    domain: 'graduate-admission',
    conductingBody: 'ETS (Educational Testing Service)',
    frequency: 'Year-round (5 attempts per year per candidate)',
    mode: 'online',
    duration: '1 hour 58 minutes',
    totalMarks: '340 (Verbal 170 + Quant 170) + 6.0 Analytical Writing',
    eligibility: 'No formal prerequisite; typically required for graduate program admission',
    websiteUrl: 'https://www.ets.org/gre',
    costUsd: 'US$220 in most of the world (US$231.30 in China)',
    descriptionEn:
      'The GRE is accepted by thousands of graduate programs worldwide, primarily in the U.S., Canada, and Australia. The shortened version (since Sep 2023) takes under two hours. Scores are valid for five years. Many programs are now GRE-optional or GRE-waived.',
    collegesAccepting: ['mit', 'harvard', 'stanford', 'caltech', 'cornell', 'umich', 'cmu', 'duke', 'georgia-tech', 'kaust'],
    sources: [
      { label: 'ETS — GRE General Test fees', url: 'https://www.ets.org/gre/test-takers/general-test/register/fees.html' },
    ],
    lastVerified: '2026-06-03',
  },
  {
    id: 'gmat',
    slug: 'gmat',
    shortName: 'GMAT Focus',
    fullName: 'Graduate Management Admission Test (Focus Edition)',
    region: 'global',
    domain: 'management',
    conductingBody: 'GMAC (Graduate Management Admission Council)',
    frequency: 'Year-round (up to 5 attempts per year)',
    mode: 'online',
    duration: '2 hours 15 minutes',
    totalMarks: '205–805',
    eligibility: "Bachelor's degree or equivalent (for MBA programs)",
    websiteUrl: 'https://www.mba.com',
    costUsd: '$275–$300 (varies by country)',
    descriptionEn:
      'The GMAT Focus Edition is accepted by over 7,700 programs at 2,400+ business schools worldwide, including every top-10 MBA program. Three sections: Quantitative Reasoning, Verbal Reasoning, Data Insights. Scores are valid for five years.',
    collegesAccepting: ['harvard', 'stanford', 'upenn', 'mit', 'columbia', 'uchicago', 'northwestern', 'oxford', 'cambridge', 'bocconi'],
  },
  {
    id: 'mcat',
    slug: 'mcat',
    shortName: 'MCAT',
    fullName: 'Medical College Admission Test',
    region: 'usa',
    domain: 'medicine',
    conductingBody: 'AAMC (Association of American Medical Colleges)',
    frequency: '~30 dates per year (Jan–Sep)',
    mode: 'offline',
    duration: '7 hours 30 minutes',
    totalMarks: '472–528',
    eligibility: 'Pre-med coursework recommended; intended for medical school applicants',
    websiteUrl: 'https://students-residents.aamc.org/mcat',
    costUsd: '$345 (US/Canada) / $445 international',
    descriptionEn:
      'Required for almost all U.S. and Canadian MD programs. Four sections test biology, chemistry, physics, psychology, sociology, and critical reasoning. A competitive score is 510+ (top schools: 515+). Scores are valid for two to three years depending on the school.',
    collegesAccepting: ['harvard', 'stanford', 'upenn', 'duke', 'umich', 'ucla'],
  },
  {
    id: 'lsat',
    slug: 'lsat',
    shortName: 'LSAT',
    fullName: 'Law School Admission Test',
    region: 'usa',
    domain: 'law',
    conductingBody: 'LSAC (Law School Admission Council)',
    frequency: '9 dates per year',
    mode: 'online',
    duration: '2 hours 20 minutes (plus optional Writing)',
    totalMarks: '120–180',
    eligibility: "Bachelor's degree (or in final year)",
    websiteUrl: 'https://www.lsac.org',
    costUsd: 'US$253 (includes LSAT Argumentative Writing); CAS US$219 (2026–27 testing year)',
    descriptionEn:
      'Required for U.S. and most Canadian JD programs. Three scored sections (Logical Reasoning x2, Reading Comprehension) plus a separately submitted Writing sample. A score of 170+ is competitive for top-14 law schools. Scores are valid for five years.',
    collegesAccepting: ['harvard', 'yale', 'stanford', 'columbia', 'uchicago', 'nyu', 'u-toronto', 'mcgill'],
    sources: [
      { label: 'LSAC — LSAT & CAS fees', url: 'https://www.lsac.org/lsat/register-lsat/lsat-cas-fees' },
    ],
    lastVerified: '2026-06-03',
  },

  // ─────────────────────────── UK undergraduate ───────────────────────────
  {
    id: 'a-levels',
    slug: 'a-levels',
    shortName: 'A-Levels',
    fullName: 'General Certificate of Education Advanced Level',
    region: 'uk-ireland',
    domain: 'undergraduate-admission',
    conductingBody: 'AQA, Edexcel, OCR, CIE (various exam boards)',
    frequency: 'May–June each year (resits in Oct–Nov)',
    mode: 'offline',
    duration: 'Varies per subject',
    totalMarks: 'A*–E per subject',
    eligibility: 'Typically Year 12–13 students (UK) or equivalent international Year 12–13',
    websiteUrl: 'https://www.gov.uk/what-different-qualification-levels-mean/list-of-qualification-levels',
    descriptionEn:
      'The gold-standard UK pre-university qualification. Most universities require three A-Levels; competitive programs require A*A*A or higher. Subject combinations matter — for medicine, Chemistry plus Biology is standard. Cambridge International A-Levels are widely accepted globally.',
    collegesAccepting: ['oxford', 'cambridge', 'imperial', 'ucl', 'lse', 'edinburgh', 'manchester', 'kings-college-london', 'warwick', 'st-andrews'],
  },
  {
    id: 'ib',
    slug: 'international-baccalaureate',
    shortName: 'IB',
    fullName: 'International Baccalaureate Diploma Programme',
    region: 'global',
    domain: 'undergraduate-admission',
    conductingBody: 'International Baccalaureate Organization',
    frequency: 'May and November each year',
    mode: 'offline',
    duration: 'Six subjects over two years',
    totalMarks: '1–7 per subject (max 45 with TOK/EE bonus)',
    eligibility: 'IB Diploma Programme students (typically grades 11–12)',
    websiteUrl: 'https://www.ibo.org/programmes/diploma-programme/',
    descriptionEn:
      'A two-year pre-university programme accepted by universities in over 90 countries. Students take six subjects (three Higher Level, three Standard Level) plus Theory of Knowledge, an Extended Essay, and CAS. Competitive scores: 38+ for top universities, 42+ for Oxbridge.',
    collegesAccepting: ['oxford', 'cambridge', 'imperial', 'ucl', 'lse', 'harvard', 'mit', 'yale', 'u-toronto', 'mcgill', 'eth-zurich'],
  },
  {
    id: 'ucat',
    slug: 'ucat',
    shortName: 'UCAT',
    fullName: 'University Clinical Aptitude Test',
    region: 'uk-ireland',
    domain: 'medicine',
    conductingBody: 'UCAT Consortium',
    frequency: 'July to September each year',
    mode: 'online',
    duration: '2 hours',
    totalMarks: '1200–3600 across five subtests',
    eligibility: 'Applicants to UK/Australian/New Zealand medical and dental schools',
    websiteUrl: 'https://www.ucat.ac.uk',
    costUsd: '£75 UK / £115 international',
    descriptionEn:
      'Required for most UK medical and dental schools (plus a few in Australia/NZ). Five sections test verbal reasoning, decision making, quantitative reasoning, abstract reasoning, and situational judgement. Scores are valid for one application cycle only.',
    collegesAccepting: ['kings-college-london', 'manchester', 'edinburgh', 'u-melbourne', 'unsw'],
  },

  // ─────────────────────────── Europe ───────────────────────────
  {
    id: 'testas',
    slug: 'testas',
    shortName: 'TestAS',
    fullName: 'Test für Ausländische Studierende (Test for Academic Studies)',
    region: 'europe',
    domain: 'undergraduate-admission',
    conductingBody: 'TestDaF-Institut / Society for Academic Test Development',
    frequency: '4 dates per year (Feb, Apr, Jun, Oct)',
    mode: 'both',
    duration: '~4 hours 40 minutes',
    totalMarks: '0–130 (Core + Subject)',
    eligibility: 'International students applying to German universities',
    websiteUrl: 'https://www.testas.de',
    costUsd: '€80–€100',
    descriptionEn:
      'TestAS is an aptitude test used by German universities to assess international applicants. Includes a Core Test and a Subject-Specific Module (Engineering, Mathematics & Natural Sciences, Economics, or Humanities). Required or recommended by many German universities for bachelor\'s applicants without an EU/EEA school-leaving certificate.',
    collegesAccepting: ['tu-munich', 'lmu-munich', 'heidelberg'],
  },
  {
    id: 'testdaf',
    slug: 'testdaf',
    shortName: 'TestDaF',
    fullName: 'Test Deutsch als Fremdsprache',
    region: 'europe',
    domain: 'language',
    conductingBody: 'TestDaF-Institut',
    frequency: '6 dates per year',
    mode: 'both',
    duration: '~3 hours 10 minutes',
    totalMarks: 'TDN 3, 4, or 5 per skill',
    eligibility: 'International applicants to German-taught programs',
    websiteUrl: 'https://www.testdaf.de',
    costUsd: '€195',
    descriptionEn:
      'The standardised German language test for international students. A TDN 4 in all four skills (Reading, Listening, Writing, Speaking) is typically required for German-taught bachelor\'s and master\'s programs. Alternatives: DSH, Goethe-Zertifikat C2, telc Deutsch C1 Hochschule.',
    collegesAccepting: ['tu-munich', 'lmu-munich', 'heidelberg'],
  },

  // ─────────────────────────── Global English tests ───────────────────────────
  {
    id: 'ielts',
    slug: 'ielts',
    shortName: 'IELTS',
    fullName: 'International English Language Testing System',
    region: 'global',
    domain: 'language',
    conductingBody: 'British Council / IDP / Cambridge Assessment English',
    frequency: '48+ dates per year',
    mode: 'both',
    duration: '2 hours 45 minutes',
    totalMarks: 'Band score 0–9',
    eligibility: 'No formal prerequisite',
    websiteUrl: 'https://www.ielts.org',
    costUsd: '$215–$310 (varies by country)',
    descriptionEn:
      'IELTS Academic is required for UK, Australia, Canada, New Zealand, and many European and U.S. universities. A band score of 6.5–7.5 is typically required by top universities. The Online version (IELTS Online) is taken at home with a proctor. Scores are valid for two years.',
    collegesAccepting: ['oxford', 'cambridge', 'imperial', 'u-toronto', 'mcgill', 'u-melbourne', 'eth-zurich', 'tu-delft'],
  },
  {
    id: 'toefl',
    slug: 'toefl',
    shortName: 'TOEFL iBT',
    fullName: 'Test of English as a Foreign Language (Internet-Based Test)',
    region: 'global',
    domain: 'language',
    conductingBody: 'ETS (Educational Testing Service)',
    frequency: '60+ dates per year',
    mode: 'online',
    duration: '2 hours',
    totalMarks: '0–120',
    eligibility: 'No formal prerequisite',
    websiteUrl: 'https://www.ets.org/toefl',
    costUsd: '$200–$300 (varies by country)',
    descriptionEn:
      'TOEFL iBT is accepted by 12,500+ universities in 160+ countries, including every U.S. and Canadian university. A score of 100+ is competitive for top universities (110+ for the most selective). The home edition is available globally. Scores are valid for two years.',
    collegesAccepting: ['mit', 'harvard', 'stanford', 'u-toronto', 'mcgill', 'oxford', 'eth-zurich'],
  },
  {
    id: 'duolingo',
    slug: 'duolingo-english-test',
    shortName: 'Duolingo',
    fullName: 'Duolingo English Test',
    region: 'global',
    domain: 'language',
    conductingBody: 'Duolingo, Inc.',
    frequency: 'On-demand (any time, anywhere with internet)',
    mode: 'online',
    duration: '1 hour',
    totalMarks: '10–160',
    eligibility: 'No formal prerequisite',
    websiteUrl: 'https://englishtest.duolingo.com',
    costUsd: '$65',
    descriptionEn:
      'A computer-adaptive English test that can be taken at home with a webcam. Results in 48 hours. Accepted by 5,500+ institutions across the U.S., U.K., Canada, Australia, and Europe. A score of 120+ is typically required by top universities. Scores are valid for two years.',
    collegesAccepting: ['nyu', 'cmu', 'georgia-tech', 'u-toronto', 'ubc', 'tu-delft', 'kth'],
  },
  {
    id: 'pte',
    slug: 'pte-academic',
    shortName: 'PTE Academic',
    fullName: 'Pearson Test of English Academic',
    region: 'global',
    domain: 'language',
    conductingBody: 'Pearson',
    frequency: 'Year-round (most days at most centres)',
    mode: 'online',
    duration: '2 hours',
    totalMarks: '10–90',
    eligibility: 'No formal prerequisite',
    websiteUrl: 'https://www.pearsonpte.com',
    costUsd: '$200–$250 (varies by country)',
    descriptionEn:
      'A computer-based English proficiency test with fast results (typically 48 hours). Widely accepted in the U.K. (for student visas), Australia, New Zealand, Canada, and a growing number of U.S. universities. A score of 65+ is competitive. Scores are valid for two years.',
    collegesAccepting: ['u-melbourne', 'u-sydney', 'unsw', 'imperial', 'manchester'],
  },

  // ─────────────────────────── India ───────────────────────────
  {
    id: 'jee-main',
    slug: 'jee-main',
    shortName: 'JEE Main',
    fullName: 'Joint Entrance Examination Main',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'National Testing Agency (NTA)',
    frequency: 'Twice a year (January & April)',
    mode: 'online',
    duration: '3 hours',
    totalMarks: '300',
    eligibility: 'Class 12 pass / appearing with Physics, Chemistry, Mathematics',
    websiteUrl: 'https://jeemain.nta.ac.in',
    costUsd: 'Approx. $12 (₹1000) general / less for reserved categories',
    descriptionEn:
      'JEE Main is the gateway to NITs, IIITs, and Government-Funded Technical Institutes (GFTIs) across India. It also serves as the qualifying exam for JEE Advanced. Candidates can appear up to three consecutive years after Class 12. The paper covers Physics, Chemistry, and Mathematics at the Class 11–12 level.',
    collegesAccepting: ['nit-trichy'],
  },
  {
    id: 'jee-advanced',
    slug: 'jee-advanced',
    shortName: 'JEE Advanced',
    fullName: 'Joint Entrance Examination Advanced',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'IITs (rotating basis)',
    frequency: 'Once a year (May/June)',
    mode: 'online',
    duration: '6 hours (2 papers × 3 hours)',
    totalMarks: '360',
    eligibility: 'Top 2.5 lakh JEE Main qualifiers; max 2 attempts',
    websiteUrl: 'https://jeeadv.ac.in',
    costUsd: 'Approx. $30 (₹2500) general',
    descriptionEn:
      'JEE Advanced is the entrance exam for all 23 IITs. Only top JEE Main scorers are eligible. The paper tests deep conceptual understanding in Physics, Chemistry, and Mathematics — significantly harder than JEE Main.',
    collegesAccepting: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur'],
  },
  {
    id: 'neet-ug',
    slug: 'neet-ug',
    shortName: 'NEET UG',
    fullName: 'National Eligibility cum Entrance Test (Undergraduate)',
    region: 'india',
    domain: 'medicine',
    conductingBody: 'National Testing Agency (NTA)',
    frequency: 'Once a year (May)',
    mode: 'offline',
    duration: '3 hours 20 minutes',
    totalMarks: '720',
    eligibility: 'Class 12 with PCB (Physics, Chemistry, Biology); minimum 50% marks',
    websiteUrl: 'https://neet.nta.nic.in',
    costUsd: 'Approx. $20 (₹1700) general',
    descriptionEn:
      'NEET UG is the single national entrance test for MBBS, BDS, BAMS, BSMS, BUMS, and BHMS courses in India. There is no cap on attempts. It is the most competitive medical entrance exam in the world by number of applicants.',
    collegesAccepting: ['aiims-delhi'],
  },
  {
    id: 'cat',
    slug: 'cat',
    shortName: 'CAT',
    fullName: 'Common Admission Test',
    region: 'india',
    domain: 'management',
    conductingBody: 'IIMs (rotating basis)',
    frequency: 'Once a year (November)',
    mode: 'online',
    duration: '2 hours',
    totalMarks: '198 (scaled score)',
    eligibility: "Bachelor's degree with 50% marks (45% for SC/ST/PwD)",
    websiteUrl: 'https://iimcat.ac.in',
    costUsd: 'Approx. $30 (₹2500) general',
    descriptionEn:
      'CAT is the primary gateway to all 20 IIMs and over 1,200 other business schools in India. It tests Verbal Ability & Reading Comprehension (VARC), Data Interpretation & Logical Reasoning (DILR), and Quantitative Aptitude (QA). Around 250,000 candidates take it each year.',
    collegesAccepting: ['iim-ahmedabad', 'iim-bangalore'],
  },
  {
    id: 'clat',
    slug: 'clat',
    shortName: 'CLAT',
    fullName: 'Common Law Admission Test',
    region: 'india',
    domain: 'law',
    conductingBody: 'Consortium of NLUs',
    frequency: 'Once a year (December)',
    mode: 'offline',
    duration: '2 hours',
    totalMarks: '120',
    eligibility: 'Class 12 with 45% marks (UG); LLB with 55% marks (PG)',
    websiteUrl: 'https://consortiumofnlus.ac.in',
    costUsd: 'Approx. $50 (₹4000) general',
    descriptionEn:
      'CLAT is the centralised national entrance exam for admission to 24 National Law Universities (NLUs) across India for BA LLB (Hons.) and LLM programmes. NLU Delhi uses its own AILET exam instead.',
    collegesAccepting: [],
  },
  {
    id: 'ailet',
    slug: 'ailet',
    shortName: 'AILET',
    fullName: 'All India Law Entrance Test',
    region: 'india',
    domain: 'law',
    conductingBody: 'National Law University Delhi',
    frequency: 'Once a year (December)',
    mode: 'offline',
    duration: '2 hours',
    totalMarks: '150',
    eligibility: 'Class 12 with 45% marks (UG); LLB for PG',
    websiteUrl: 'https://nationallawuniversitydelhi.in',
    costUsd: 'Approx. $40 (₹3500) general',
    descriptionEn:
      'AILET is the entrance exam for National Law University Delhi (NLU Delhi). NLU Delhi does not participate in CLAT — applicants must take AILET separately. Around 120 seats in BA LLB (Hons.) and 70 in LL.M.',
    collegesAccepting: ['nlu-delhi'],
  },
  {
    id: 'gate',
    slug: 'gate',
    shortName: 'GATE',
    fullName: 'Graduate Aptitude Test in Engineering',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'IITs and IISc (rotating basis)',
    frequency: 'Once a year (February)',
    mode: 'online',
    duration: '3 hours',
    totalMarks: '100 (GATE score out of 1000)',
    eligibility: "Bachelor's degree in Engineering / Science / Architecture",
    websiteUrl: 'https://gate2026.iitg.ac.in',
    costUsd: 'Approx. $24 (₹2000 general, regular period); ₹2500 in the extended period',
    descriptionEn:
      'GATE is required for M.Tech admissions at IITs, NITs, and IISc, and for PSU recruitment (ONGC, BHEL, NTPC, etc.). A valid GATE score is also required for direct PhD admissions at several top institutions.',
    collegesAccepting: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur', 'nit-trichy'],
    sources: [
      { label: 'GATE 2026 — IIT Guwahati (organizing institute)', url: 'https://gate2026.iitg.ac.in' },    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'cuet-ug',
    slug: 'cuet-ug',
    shortName: 'CUET UG',
    fullName: 'Common University Entrance Test (Undergraduate)',
    region: 'india',
    domain: 'undergraduate-admission',
    conductingBody: 'National Testing Agency (NTA)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'Varies by the number of subjects taken (slot-based)',
    totalMarks: 'Varies by the subjects chosen — see the official bulletin',
    eligibility:
      'Passed or appearing in Class 12 (or equivalent) from a recognised board; no upper age limit for the test. Individual universities set their own subject and eligibility criteria per programme.',
    websiteUrl: 'https://cuet.nta.nic.in',
    descriptionEn:
      'CUET UG is a national, computer-based entrance test conducted by the NTA for undergraduate admission at central universities and a growing number of state, deemed and private universities. It has a language section, domain-subject sections and a general test, with the syllabus based on the NCERT Class 12 curriculum. The subjects offered, the number a candidate may choose, the marking scheme and the dates are set in the official information bulletin each year.',
    collegesAccepting: [],
    sources: [
      { label: 'NTA — CUET (UG) official site', url: 'https://cuet.nta.nic.in' },
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'mht-cet',
    slug: 'mht-cet',
    shortName: 'MHT CET',
    fullName: 'Maharashtra Common Entrance Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'State Common Entrance Test Cell, Government of Maharashtra',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official brochure',
    totalMarks: 'See the official brochure',
    eligibility:
      'Passed or appearing in Class 12 with the required subjects (PCM for engineering); Maharashtra domicile and category rules set by the CET Cell.',
    websiteUrl: 'https://cetcell.mahacet.org',
    descriptionEn:
      'MHT CET is the Maharashtra state entrance test conducted by the State Common Entrance Test Cell for admission to engineering, pharmacy and other professional undergraduate courses in the state. Engineering aspirants take the PCM group. It is a computer-based test based on the Maharashtra Class 11 and 12 syllabus; seats are allotted through the state Centralised Admission Process (CAP). Pattern, marking and dates are set in the official brochure each year.',
    collegesAccepting: [],
    sources: [
      { label: 'State Common Entrance Test Cell, Maharashtra — official site', url: 'https://cetcell.mahacet.org' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'kcet',
    slug: 'kcet',
    shortName: 'KCET',
    fullName: 'Karnataka Common Entrance Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'Karnataka Examinations Authority (KEA)',
    frequency: 'Once a year',
    mode: 'offline',
    duration: 'See the official KEA brochure',
    totalMarks: 'See the official KEA brochure',
    eligibility:
      'Passed or appearing in Class 12 (PUC II) with the required subjects (PCM for engineering); Karnataka domicile and reservation rules set by KEA.',
    websiteUrl: 'https://cetonline.karnataka.gov.in/kea',
    descriptionEn:
      'KCET is the Karnataka state entrance test conducted by the Karnataka Examinations Authority (KEA) for admission to first-year undergraduate professional courses — including engineering, agriculture and pharmacy — at government, aided and private colleges in Karnataka. It is a pen-and-paper (OMR) test based on the Karnataka PUC Class 11 and 12 syllabus; seats are allotted through KEA online counselling, which may also weigh qualifying-exam marks for some courses. Pattern, marking and dates are set by KEA each year.',
    collegesAccepting: [],
    sources: [
      { label: 'Karnataka Examinations Authority (KEA) — official site', url: 'https://cetonline.karnataka.gov.in/kea' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'wbjee',
    slug: 'wbjee',
    shortName: 'WBJEE',
    fullName: 'West Bengal Joint Entrance Examination',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'West Bengal Joint Entrance Examinations Board (WBJEEB)',
    frequency: 'Once a year',
    mode: 'offline',
    duration: 'See the official WBJEEB brochure',
    totalMarks: 'See the official WBJEEB brochure',
    eligibility:
      'Passed or appearing in Class 12 with the required subjects (Physics and Mathematics, with a third subject); West Bengal domicile rules for state-quota seats set by WBJEEB.',
    websiteUrl: 'https://wbjeeb.nic.in',
    descriptionEn:
      'WBJEE is the West Bengal state entrance test conducted by the West Bengal Joint Entrance Examinations Board (WBJEEB) for admission to undergraduate engineering and technology, pharmacy and architecture courses in the state. It is an OMR-based (offline) test of two papers — Paper I (Mathematics) and Paper II (Physics and Chemistry), all multiple-choice; seats are allotted through the board e-counselling. Marks, marking scheme and dates are set by WBJEEB each year.',
    collegesAccepting: [],
    sources: [
      { label: 'West Bengal Joint Entrance Examinations Board (WBJEEB) — official site', url: 'https://wbjeeb.nic.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'ap-eapcet',
    slug: 'ap-eapcet',
    shortName: 'AP EAPCET',
    fullName: 'Andhra Pradesh Engineering, Agriculture & Pharmacy Common Entrance Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'JNTU Kakinada, on behalf of APSCHE',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official bulletin',
    totalMarks: 'See the official bulletin',
    eligibility:
      'Passed or appearing in Class 12 (Intermediate) with the required subjects — PCM for the engineering stream; biology-based for the agriculture & pharmacy stream. State domicile and reservation rules apply.',
    websiteUrl: 'https://cets.apsche.ap.gov.in',
    descriptionEn:
      'AP EAPCET (formerly AP EAMCET) is the Andhra Pradesh state entrance test conducted by JNTU Kakinada on behalf of the AP State Council of Higher Education (APSCHE) for admission to undergraduate engineering, agriculture and pharmacy courses in the state. It is a computer-based test based on the AP Intermediate syllabus; seats are allotted through APSCHE online counselling. Pattern, marking and dates are set in the official bulletin each year. (Medical admission is through NEET, not this test.)',
    collegesAccepting: [],
    sources: [
      { label: 'AP EAPCET — APSCHE official site', url: 'https://cets.apsche.ap.gov.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'ts-eamcet',
    slug: 'ts-eamcet',
    shortName: 'TS EAMCET',
    fullName: 'Telangana Engineering, Agriculture & Pharmacy Common Entrance Test (TG EAPCET)',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'JNTU Hyderabad, on behalf of TGCHE',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official bulletin',
    totalMarks: 'See the official bulletin',
    eligibility:
      'Passed or appearing in Class 12 (Intermediate) with the required subjects — PCM for the engineering stream; biology-based for the agriculture & pharmacy stream. State domicile and reservation rules apply.',
    websiteUrl: 'https://eapcet.tgche.ac.in',
    descriptionEn:
      'TS EAMCET — renamed TG EAPCET in 2024 — is the Telangana state entrance test conducted by JNTU Hyderabad on behalf of the Telangana Council of Higher Education (TGCHE) for admission to undergraduate engineering, agriculture and pharmacy courses in the state. It is a computer-based test based on the Telangana Intermediate syllabus; seats are allotted through online counselling under TGCHE. Pattern, marking and dates are set in the official bulletin each year. (Medical admission is through NEET, not this test.)',
    collegesAccepting: [],
    sources: [
      { label: 'TG EAPCET — TGCHE official site', url: 'https://eapcet.tgche.ac.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'keam',
    slug: 'keam',
    shortName: 'KEAM',
    fullName: 'Kerala Engineering Architecture Medical',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'Commissioner for Entrance Examinations (CEE), Kerala',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Passed or appearing in Class 12 with the required subjects (PCM for engineering); Kerala domicile and category rules set by the CEE.',
    websiteUrl: 'https://cee.kerala.gov.in',
    descriptionEn:
      'KEAM is the Kerala state admission process for professional undergraduate courses, run by the Commissioner for Entrance Examinations (CEE). The engineering and pharmacy entrance is a computer-based test based on the higher secondary syllabus; seats are allotted through the Centralised Allotment Process (CAP). Architecture admission uses NATA with qualifying marks, and medical admission is through NEET. Pattern, marking and dates are set in the official notification each year.',
    collegesAccepting: [],
    sources: [
      { label: 'Commissioner for Entrance Examinations (CEE), Kerala — official site', url: 'https://cee.kerala.gov.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'gujcet',
    slug: 'gujcet',
    shortName: 'GUJCET',
    fullName: 'Gujarat Common Entrance Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'Gujarat Secondary & Higher Secondary Education Board (GSEB)',
    frequency: 'Once a year',
    mode: 'offline',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Passed or appearing in Class 12 (science) with the required subjects (PCM for engineering); admission through the Admission Committee for Professional Courses (ACPC).',
    websiteUrl: 'https://gujcet.gseb.org',
    descriptionEn:
      'GUJCET is the Gujarat state entrance test conducted by the Gujarat Secondary and Higher Secondary Education Board (GSEB) for admission to engineering and pharmacy undergraduate courses in Gujarat. It is an offline, OMR-based test across Physics, Chemistry and Mathematics (or Biology), based on the Gujarat Class 12 syllabus. Admission and counselling are handled by the Admission Committee for Professional Courses (ACPC), which may combine GUJCET, board marks and JEE Main as defined each year. Pattern, marking and dates are set by GSEB each year.',
    collegesAccepting: [],
    sources: [
      { label: 'Gujarat Secondary & Higher Secondary Education Board (GSEB) — official site', url: 'https://www.gseb.org' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'bitsat',
    slug: 'bitsat',
    shortName: 'BITSAT',
    fullName: 'Birla Institute of Technology and Science Admission Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'BITS Pilani (Birla Institute of Technology and Science)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official admission site',
    totalMarks: 'See the official admission site',
    eligibility:
      'Passed or appearing in Class 12 with Physics, Chemistry and Mathematics (with adequate English) and the minimum marks BITS sets.',
    websiteUrl: 'https://admissions.bits-pilani.ac.in',
    descriptionEn:
      'BITSAT is the entrance test conducted by BITS Pilani for admission to its integrated first-degree programmes (engineering, pharmacy and science) at the Pilani, K. K. Birla Goa and Hyderabad campuses. It is a computer-based online test based on the Class 11 and 12 (NCERT-aligned) syllabus — Physics, Chemistry, Mathematics, English proficiency and logical reasoning. admissions.bits-pilani.ac.in is the official BITS Pilani admission portal. Pattern, marking, cut-offs and dates are set by BITS each year.',
    collegesAccepting: [],
    sources: [
      { label: 'BITS Pilani — official admission portal', url: 'https://admissions.bits-pilani.ac.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'viteee',
    slug: 'viteee',
    shortName: 'VITEEE',
    fullName: 'VIT Engineering Entrance Examination',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'Vellore Institute of Technology (VIT)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official admission site',
    totalMarks: 'See the official admission site',
    eligibility:
      'Passed or appearing in Class 12 with the required subjects (Physics and Chemistry with Mathematics or Biology) and the minimum marks VIT sets.',
    websiteUrl: 'https://viteee.vit.ac.in',
    descriptionEn:
      'VITEEE is the entrance test conducted by Vellore Institute of Technology (VIT), a deemed-to-be university, for admission to its undergraduate B.Tech programmes across the VIT campuses. It is a computer-based test based on the Class 11 and 12 syllabus — Mathematics or Biology, Physics, Chemistry, aptitude and English. Admission is by VITEEE rank through VIT counselling. Pattern, marking, cut-offs and dates are set by VIT each year.',
    collegesAccepting: [],
    sources: [
      { label: 'VIT — VITEEE official site', url: 'https://viteee.vit.ac.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'comedk-uget',
    slug: 'comedk-uget',
    shortName: 'COMEDK UGET',
    fullName: 'COMEDK Under Graduate Entrance Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'COMEDK (Consortium of Medical, Engineering & Dental Colleges of Karnataka)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official site',
    totalMarks: 'See the official site',
    eligibility:
      'Passed or appearing in Class 12 with Physics, Chemistry and Mathematics, and the minimum marks COMEDK sets.',
    websiteUrl: 'https://www.comedk.org',
    descriptionEn:
      'COMEDK UGET is the entrance test conducted by COMEDK (the Consortium of Medical, Engineering and Dental Colleges of Karnataka) for admission to undergraduate engineering courses at its member private institutions in Karnataka. It is a computer-based test in Physics, Chemistry and Mathematics, based on the Class 11 and 12 syllabus, with centralised single-window counselling. Despite the name, the UGET is for engineering; medical and dental admission is through NEET. Pattern, marking and dates are set by COMEDK each year.',
    collegesAccepting: [],
    sources: [
      { label: 'COMEDK — official site', url: 'https://www.comedk.org' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'ssc-chsl',
    slug: 'ssc-chsl',
    shortName: 'SSC CHSL',
    fullName: 'SSC Combined Higher Secondary Level Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Staff Selection Commission (SSC)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Passed Class 12 (10+2) or equivalent; some posts require typing/data-entry skills. Age limits and category rules per the official notification.',
    websiteUrl: 'https://ssc.gov.in',
    descriptionEn:
      'SSC CHSL is conducted by the Staff Selection Commission to recruit candidates for Class-12-level posts — such as Lower Division Clerk and Data Entry Operator roles — in central government offices. It is a computer-based examination conducted in stages (which may include a skill/typing component for relevant posts). Pattern, posts, vacancies and dates are set in the official notification each cycle.',
    collegesAccepting: [],
    sources: [
      { label: 'Staff Selection Commission (SSC) — official site', url: 'https://ssc.gov.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'ssc-mts',
    slug: 'ssc-mts',
    shortName: 'SSC MTS',
    fullName: 'SSC Multi-Tasking (Non-Technical) Staff Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Staff Selection Commission (SSC)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Passed Class 10 (Matriculation) or equivalent; Havaldar posts may include a physical test. Age limits and category rules per the official notification.',
    websiteUrl: 'https://ssc.gov.in',
    descriptionEn:
      'SSC MTS is conducted by the Staff Selection Commission to recruit Multi-Tasking (Non-Technical) Staff and Havaldar posts (CBIC/CBN) — Group-C, non-gazetted roles in central government departments. It is a computer-based examination. Pattern, posts, vacancies and dates are set in the official notification each cycle.',
    collegesAccepting: [],
    sources: [
      { label: 'Staff Selection Commission (SSC) — official site', url: 'https://ssc.gov.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'ibps-po',
    slug: 'ibps-po',
    shortName: 'IBPS PO',
    fullName: 'IBPS Probationary Officer Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Institute of Banking Personnel Selection (IBPS)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      "Bachelor's degree in any discipline; age range per the official notification.",
    websiteUrl: 'https://www.ibps.in',
    descriptionEn:
      'IBPS PO is conducted by the Institute of Banking Personnel Selection to recruit Probationary Officers (officer cadre) for participating public sector banks. The selection is typically a preliminary exam, a main exam and an interview, all set by IBPS each cycle. Pattern, vacancies and dates are in the official notification.',
    collegesAccepting: [],
    sources: [
      { label: 'Institute of Banking Personnel Selection (IBPS) — official site', url: 'https://www.ibps.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'ibps-clerk',
    slug: 'ibps-clerk',
    shortName: 'IBPS Clerk',
    fullName: 'IBPS Clerical Cadre Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Institute of Banking Personnel Selection (IBPS)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      "Bachelor's degree in any discipline; age range per the official notification.",
    websiteUrl: 'https://www.ibps.in',
    descriptionEn:
      'IBPS Clerk is conducted by the Institute of Banking Personnel Selection to recruit for the clerical cadre of participating public sector banks. The selection is typically a preliminary exam and a main exam, set by IBPS each cycle. Pattern, vacancies and dates are in the official notification.',
    collegesAccepting: [],
    sources: [
      { label: 'Institute of Banking Personnel Selection (IBPS) — official site', url: 'https://www.ibps.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'sbi-po',
    slug: 'sbi-po',
    shortName: 'SBI PO',
    fullName: 'State Bank of India Probationary Officer Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'State Bank of India (SBI)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      "Bachelor's degree in any discipline; age range per the official notification.",
    websiteUrl: 'https://sbi.bank.in',
    descriptionEn:
      'SBI PO is conducted by the State Bank of India (separately from IBPS) to recruit Probationary Officers (officer cadre). The selection is typically a preliminary exam, a main exam (objective and descriptive) and a final phase with a group exercise and interview. Pattern, vacancies and dates are set by SBI each cycle in the official notification.',
    collegesAccepting: [],
    sources: [
      { label: 'State Bank of India — Careers (official)', url: 'https://sbi.bank.in/web/careers' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'rbi-grade-b',
    slug: 'rbi-grade-b',
    shortName: 'RBI Grade B',
    fullName: 'RBI Officer in Grade B (Direct Recruitment)',
    region: 'india',
    domain: 'general',
    conductingBody: 'Reserve Bank of India (RBI)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      "General stream: a bachelor's degree (minimum-marks norm); DEPR/DSIM streams: relevant postgraduate qualifications. Per the official notification.",
    websiteUrl: 'https://opportunities.rbi.org.in',
    descriptionEn:
      'RBI Grade B is the officer-level recruitment of the Reserve Bank of India for Officers in Grade B across the General, DEPR and DSIM streams. The selection is a multi-phase process — Phase I (preliminary objective), Phase II (main, including descriptive papers) and an interview — set by RBI each cycle. Eligibility, pattern, vacancies and dates are in the official notification.',
    collegesAccepting: [],
    sources: [
      { label: 'Reserve Bank of India — opportunities/recruitment portal', url: 'https://opportunities.rbi.org.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'ssc-cgl',
    slug: 'ssc-cgl',
    shortName: 'SSC CGL',
    fullName: 'SSC Combined Graduate Level Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Staff Selection Commission (SSC)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      "Bachelor's degree (graduate); some posts have specific requirements. Age limits and category rules per the official notification.",
    websiteUrl: 'https://ssc.gov.in',
    descriptionEn:
      'SSC CGL (Combined Graduate Level) is conducted by the Staff Selection Commission to recruit graduates for Group B and Group C posts across central government ministries, departments and offices. It is a computer-based examination conducted in tiers. Posts, pattern, vacancies and dates are set in the official notification each cycle.',
    collegesAccepting: [],
    sources: [
      { label: 'Staff Selection Commission (SSC) — official site', url: 'https://ssc.gov.in' },
    ],
    lastVerified: '2026-06-06',
  },

// ──────────────────────── Set 8 exam records — defence ──────────────────────
  {
    id: 'cds',
    slug: 'cds',
    shortName: 'CDS',
    fullName: 'Combined Defence Services Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Union Public Service Commission (UPSC)',
    frequency: 'Twice a year (CDS I and CDS II)',
    mode: 'offline',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Varies by academy (IMA, INA, AFA, OTA): broadly a relevant degree or final-year status, with subject and age requirements set officially each cycle. Confirm in the official UPSC CDS notification.',
    websiteUrl: 'https://upsc.gov.in',
    descriptionEn:
      'The Combined Defence Services Examination is conducted by UPSC twice a year to recruit commissioned officers into the Indian Army (IMA, OTA), Indian Navy (INA), and Indian Air Force (AFA). The selection involves a written examination followed by an SSB interview and medical assessment. Eligibility, pattern, vacancies and dates are set in the official UPSC notification each cycle.',
    collegesAccepting: [],
    sources: [
      { label: 'Union Public Service Commission (UPSC) — official site', url: 'https://upsc.gov.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'afcat',
    slug: 'afcat',
    shortName: 'AFCAT',
    fullName: 'Air Force Common Admission Test',
    region: 'india',
    domain: 'general',
    conductingBody: 'Indian Air Force',
    frequency: 'Twice a year (Cycle 01 and Cycle 02)',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Varies by branch: Flying Branch broadly requires Physics and Mathematics at 10+2 with a minimum marks norm; Ground Duty branches require relevant degrees. Age limits are set officially each cycle. Confirm in the official AFCAT notification.',
    websiteUrl: 'https://careerairforce.gov.in',
    descriptionEn:
      'AFCAT is conducted by the Indian Air Force twice a year to recruit commissioned officers into the Flying Branch, Ground Duty (Technical), and Ground Duty (Non-Technical) branches. Candidates who qualify the computer-based test appear for the Air Force Selection Board (AFSB). Eligibility, pattern, vacancies and dates are set in the official IAF notification each cycle.',
    collegesAccepting: [],
    sources: [
      { label: 'Indian Air Force — careerairforce.gov.in (official)', url: 'https://careerairforce.gov.in' },
      { label: 'AFCAT portal — afcat.cdac.in (official)', url: 'https://afcat.cdac.in/AFCAT/' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'capf-ac',
    slug: 'capf-ac',
    shortName: 'CAPF AC',
    fullName: 'Central Armed Police Forces (Assistant Commandants) Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Union Public Service Commission (UPSC)',
    frequency: 'Once a year',
    mode: 'offline',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Bachelor\'s degree (graduate); age range set officially each cycle. Confirm in the official UPSC CAPF AC notification.',
    websiteUrl: 'https://upsc.gov.in',
    descriptionEn:
      'The CAPF AC Examination is conducted by UPSC once a year to recruit Group A officers — Assistant Commandants — for the BSF, CRPF, CISF, ITBP, and SSB. Selection involves a written examination (two papers), a physical standards and efficiency test, a medical examination, and an interview. Eligibility, pattern, vacancies and dates are set in the official UPSC notification each cycle.',
    collegesAccepting: [],
    sources: [
      { label: 'Union Public Service Commission (UPSC) — official site', url: 'https://upsc.gov.in' },
    ],
    lastVerified: '2026-06-06',
  },
// ─────────────────────────── Set 9 — Teaching / research exams ─────────────
  {
    id: 'ctet',
    slug: 'ctet',
    shortName: 'CTET',
    fullName: 'Central Teacher Eligibility Test',
    region: 'india',
    domain: 'general',
    conductingBody: 'Central Board of Secondary Education (CBSE)',
    frequency: 'Typically twice a year (see ctet.nic.in for current dates)',
    mode: 'offline',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Relevant teacher-education qualification recognised by NCTE (criteria differ for Paper I and Paper II); verify current norms on ctet.nic.in',
    websiteUrl: 'https://ctet.nic.in',
    descriptionEn:
      'CTET is the national teacher eligibility test conducted by CBSE in offline, pen-and-paper mode. It has two papers: Paper I for teaching Classes 1–5 and Paper II for Classes 6–8. Qualifying CTET is a minimum eligibility requirement for teaching in central government schools (Kendriya Vidyalayas, Navodaya Vidyalayas) and is accepted by many other schools. Clearing CTET does not guarantee appointment — actual recruitment is done separately by the school or recruitment authority.',
    collegesAccepting: [],
    sources: [
      { label: 'CTET — Official portal (CBSE)', url: 'https://ctet.nic.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'ugc-net',
    slug: 'ugc-net',
    shortName: 'UGC NET',
    fullName: 'University Grants Commission National Eligibility Test',
    region: 'india',
    domain: 'general',
    conductingBody: 'National Testing Agency (NTA) on behalf of the University Grants Commission (UGC)',
    frequency: 'Typically twice a year (June and December cycles; confirm on ugcnet.nta.nic.in)',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Master\'s degree or equivalent from a recognised university (minimum percentage as per current information bulletin); final-year Master\'s candidates may apply provisionally',
    websiteUrl: 'https://ugcnet.nta.nic.in',
    descriptionEn:
      'UGC NET is conducted by NTA in Computer-Based Test (CBT) mode across a broad range of subjects. It determines eligibility for two categories: appointment as Assistant Professor in Indian universities and colleges, and award of Junior Research Fellowship (JRF) for funded doctoral research. Paper I tests general teaching/research aptitude (common to all subjects); Paper II is subject-specific. Qualifying marks and cut-offs for NET and JRF are published after each exam.',
    collegesAccepting: [],
    sources: [
      { label: 'UGC NET — Official portal (NTA)', url: 'https://ugcnet.nta.nic.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'csir-net',
    slug: 'csir-net',
    shortName: 'CSIR NET',
    fullName: 'CSIR-UGC National Eligibility Test',
    region: 'india',
    domain: 'science',
    conductingBody: 'National Testing Agency (NTA) on behalf of the Council of Scientific and Industrial Research (CSIR)',
    frequency: 'Typically twice a year (June and December cycles; confirm on csirnet.nta.nic.in)',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility:
      'Master\'s degree or equivalent in a relevant science subject (Chemical Sciences, Earth Sciences, Life Sciences, Mathematical Sciences, or Physical Sciences) from a recognised university; minimum percentage per current information bulletin',
    websiteUrl: 'https://csirnet.nta.nic.in',
    descriptionEn:
      'CSIR NET is conducted by NTA in Computer-Based Test (CBT) mode for five science disciplines: Chemical Sciences, Earth Sciences, Life Sciences, Mathematical Sciences and Physical Sciences. It determines eligibility for Junior Research Fellowship (JRF) and appointment as Assistant Professor / Lecturer in Indian universities and research institutions. The exam has three parts: Part A (general aptitude, common to all), Part B and Part C (subject-specific at different difficulty levels).',
    collegesAccepting: [],
    sources: [
      { label: 'CSIR NET — Official portal (NTA)', url: 'https://csirnet.nta.nic.in' },
    ],
    lastVerified: '2026-06-06',
  },
// Set 10 — no new exam records. This file is intentionally empty.
// Set 11 creates no new exam records.
// Set 13 — no new exam records
// Set 14 — No new exam records for this set.
// Set 15 creates no new exam records.
// Set 16 creates no new exam records.
// ──────────────────── Set 18 — Specialized & PG entrance exams ────────────────────
  {
    id: 'cuet-pg',
    slug: 'cuet-pg',
    shortName: 'CUET PG',
    fullName: 'Common University Entrance Test (Postgraduate)',
    region: 'india',
    domain: 'graduate-admission',
    conductingBody: 'National Testing Agency (NTA)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility: 'Bachelor\'s degree or final year — see the official information bulletin',
    websiteUrl: 'https://exams.nta.nic.in/cuet-pg/',
    descriptionEn:
      'CUET PG is a national computer-based entrance test conducted by the NTA for admission to postgraduate programmes at central, state, deemed and private universities across India. The score is used by a large and growing number of participating institutions.',
    collegesAccepting: [],
    sources: [
      { label: 'NTA — CUET PG official portal', url: 'https://exams.nta.nic.in/cuet-pg/' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'neet-pg',
    slug: 'neet-pg',
    shortName: 'NEET PG',
    fullName: 'National Eligibility cum Entrance Test (Postgraduate)',
    region: 'india',
    domain: 'medicine',
    conductingBody: 'National Board of Examinations in Medical Sciences (NBEMS)',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility: 'MBBS degree from a recognised institution (internship condition applies) — see official bulletin',
    websiteUrl: 'https://natboard.edu.in',
    descriptionEn:
      'NEET PG is the national entrance test for admission to MD, MS and PG Diploma programmes at medical colleges across India. Conducted by NBEMS, it replaced multiple separate state and institutional entrance tests with a single national merit list.',
    collegesAccepting: [],
    sources: [
      { label: 'NBEMS — official site and notifications', url: 'https://natboard.edu.in' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'nata',
    slug: 'nata',
    shortName: 'NATA',
    fullName: 'National Aptitude Test in Architecture',
    region: 'india',
    domain: 'undergraduate-admission',
    conductingBody: 'Council of Architecture (CoA)',
    frequency: 'Multiple sessions per year (phases and dates set by CoA each cycle)',
    mode: 'both',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility: 'Class 10+2 or 10+3 Diploma with Mathematics — see the official information bulletin',
    websiteUrl: 'https://www.nata.in/',
    descriptionEn:
      'NATA is the national aptitude test for B.Arch admission at schools of architecture in India, conducted by the Council of Architecture. The exam is hybrid: Part A is an offline drawing test; Part B is a computer-based aptitude test covering mathematics, logical reasoning, and architectural awareness.',
    collegesAccepting: [],
    sources: [
      { label: 'Council of Architecture — NATA official site', url: 'https://www.nata.in/' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'iit-jam',
    slug: 'iit-jam',
    shortName: 'IIT JAM',
    fullName: 'Joint Admission Test for Masters',
    region: 'india',
    domain: 'graduate-admission',
    conductingBody: 'IITs (organising institute rotates annually), jointly with IISc Bengaluru',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility: 'Bachelor\'s degree or final year in a relevant science discipline — see the official brochure',
    websiteUrl: 'https://jam2026.iitb.ac.in/',
    descriptionEn:
      'IIT JAM is the joint entrance test for M.Sc (two-year), Joint M.Sc–Ph.D, and other post-bachelor\'s programmes at the IITs and IISc Bengaluru. Conducted by IITs on a rotating basis, it covers multiple science subject papers including Physics, Chemistry, Mathematics, Statistics, Biotechnology, Geology, and Economics.',
    collegesAccepting: [],
    sources: [
      { label: 'IIT JAM 2026 official website (IIT Bombay, organising institute)', url: 'https://jam2026.iitb.ac.in/' },
    ],
    lastVerified: '2026-06-06',
  },
  {
    id: 'nchm-jee',
    slug: 'nchm-jee',
    shortName: 'NCHM JEE',
    fullName: 'National Council for Hotel Management Joint Entrance Examination',
    region: 'india',
    domain: 'undergraduate-admission',
    conductingBody: 'National Testing Agency (NTA) on behalf of NCHMCT',
    frequency: 'Once a year',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    eligibility: 'Class 12 pass or appearing — see the official information bulletin',
    websiteUrl: 'https://nchmjee.nta.nic.in',
    descriptionEn:
      'NCHM JEE is the national entrance test for admission to the B.Sc in Hospitality and Hotel Administration (B.Sc HHA) at Institutes of Hotel Management (IHMs) affiliated with the National Council for Hotel Management and Catering Technology (NCHMCT) under the Ministry of Tourism. It is conducted by NTA as a computer-based test.',
    collegesAccepting: [],
    sources: [
      { label: 'NTA — NCHM JEE official portal', url: 'https://nchmjee.nta.nic.in' },
      { label: 'NTA — NCHM JEE exam page', url: 'https://exams.nta.nic.in/nchm-jee/' },
    ],
    lastVerified: '2026-06-06',
  },
{
    id: 'ipmat',
    slug: 'ipmat',
    shortName: 'IPMAT',
    fullName: 'Integrated Programme in Management Aptitude Test',
    region: 'india',
    domain: 'management',
    conductingBody: 'IIM Indore (IPMAT Indore) and IIM Rohtak (IPMAT Rohtak) — separate tests',
    frequency: 'Once a year (May; exact dates per official notification)',
    mode: 'online',
    duration: 'See the official notification',
    totalMarks: 'See the official notification',
    descriptionEn:
      'IPMAT is the aptitude test for admission to the five-year Integrated Programme in Management (IPM) offered by IIM Indore and IIM Rohtak. The two institutes run separate tests — IPMAT Indore and IPMAT Rohtak — each with its own application, schedule, and pattern. Entry is after Class 12. On completion of the five-year programme, students earn a management degree (BBA + MBA at IIM Rohtak; IPM degree at IIM Indore). The exam broadly covers quantitative ability and verbal ability; IIM Rohtak\'s paper also includes logical reasoning. All specifics — eligibility, fees, marking, and selection process — are set in each institute\'s official notification.',
    eligibility: 'Class 12 pass or appearing; exact age limits, minimum marks and category relaxations per official notification',
    websiteUrl: 'https://www.iimidr.ac.in',
    collegesAccepting: [],
    sources: [
      { label: 'IIM Indore — IPM admissions', url: 'https://iimidr.ac.in/programmes/academic-programmes/five-year-integrated-programme-in-management-ipm/ipm-admissions-details/' },
      { label: 'IIM Rohtak — IPM admission', url: 'https://www.iimrohtak.ac.in/ipm-admission.php' },
    ],
    lastVerified: '2026-06-06',
  },
// Set 20 — no new exam records for this set.
];

export const getExamBySlug = (slug: string) =>
  ENTRANCE_EXAMS.find((e) => e.slug === slug);

export const EXAMS_BY_REGION = (region: ExamRegion) =>
  ENTRANCE_EXAMS.filter((e) => e.region === region);

export const EXAMS_BY_DOMAIN = (domain: ExamDomain) =>
  ENTRANCE_EXAMS.filter((e) => e.domain === domain);
