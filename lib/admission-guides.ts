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
    websiteUrl: 'https://gate2026.iitr.ac.in',
    costUsd: 'Approx. $20 (₹1800) general',
    descriptionEn:
      'GATE is required for M.Tech admissions at IITs, NITs, and IISc, and for PSU recruitment (ONGC, BHEL, NTPC, etc.). A valid GATE score is also required for direct PhD admissions at several top institutions.',
    collegesAccepting: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur', 'nit-trichy'],
  },
];

export const getExamBySlug = (slug: string) =>
  ENTRANCE_EXAMS.find((e) => e.slug === slug);

export const EXAMS_BY_REGION = (region: ExamRegion) =>
  ENTRANCE_EXAMS.filter((e) => e.region === region);

export const EXAMS_BY_DOMAIN = (domain: ExamDomain) =>
  ENTRANCE_EXAMS.filter((e) => e.domain === domain);
