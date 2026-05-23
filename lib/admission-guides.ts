export type ExamRegion = 'india' | 'usa' | 'uk' | 'global';
export type ExamDomain = 'engineering' | 'medicine' | 'management' | 'law' | 'language' | 'science' | 'general';

export interface EntranceExam {
  id: string;
  slug: string;
  shortName: string;
  fullName: string;
  region: ExamRegion;
  domain: ExamDomain;
  conductingBody: string;
  frequency: string;
  mode: 'online' | 'offline' | 'both';
  duration: string;
  totalMarks: string;
  descriptionEn: string;
  descriptionHi?: string;
  eligibility: string;
  websiteUrl?: string;
  collegesAccepting: string[];
}

export const ENTRANCE_EXAMS: EntranceExam[] = [
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
    descriptionEn:
      'JEE Main is the gateway to NITs, IIITs, and Government Funded Technical Institutes (GFTIs) across India. It also serves as the qualifying exam for JEE Advanced. Candidates can appear up to three consecutive years after Class 12. The paper covers Physics, Chemistry, and Mathematics at the Class 11–12 level.',
    descriptionHi:
      'जेईई मेन भारत भर के एनआईटी, आईआईआईटी और सरकारी वित्त पोषित तकनीकी संस्थानों में प्रवेश का प्रवेश द्वार है। यह जेईई एडवांस्ड के लिए क्वालीफाइंग परीक्षा भी है।',
    collegesAccepting: ['nit-trichy', 'nit-warangal'],
  },
  {
    id: 'jee-advanced',
    slug: 'jee-advanced',
    shortName: 'JEE Advanced',
    fullName: 'Joint Entrance Examination Advanced',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'IITs (rotating basis)',
    frequency: 'Once a year (June)',
    mode: 'online',
    duration: '6 hours (2 papers × 3 hours)',
    totalMarks: '360',
    eligibility: 'Top 2.5 lakh JEE Main qualifiers; max 2 attempts',
    websiteUrl: 'https://jeeadv.ac.in',
    descriptionEn:
      'JEE Advanced is the entrance exam for all 23 IITs. Only top JEE Main scorers are eligible. The paper tests deep conceptual understanding in Physics, Chemistry, and Mathematics — significantly harder than JEE Main.',
    descriptionHi:
      'जेईई एडवांस्ड सभी 23 आईआईटी के लिए प्रवेश परीक्षा है। केवल शीर्ष जेईई मेन उत्तीर्ण छात्र पात्र हैं।',
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
    descriptionEn:
      'NEET UG is the single national entrance test for MBBS, BDS, BAMS, BSMS, BUMS, and BHMS courses in India. There is no cap on attempts. It is the most competitive medical entrance exam in the world by number of applicants.',
    descriptionHi:
      'नीट यूजी भारत में एमबीबीएस, बीडीएस और आयुष पाठ्यक्रमों के लिए एकल राष्ट्रीय प्रवेश परीक्षा है।',
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
    descriptionEn:
      'CAT is the primary gateway to all 20 IIMs and over 1,200 other business schools. It tests Verbal Ability & Reading Comprehension (VARC), Data Interpretation & Logical Reasoning (DILR), and Quantitative Aptitude (QA).',
    descriptionHi:
      'कैट सभी 20 आईआईएम और 1,200 से अधिक बिजनेस स्कूलों का प्राथमिक प्रवेश द्वार है।',
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
    mode: 'online',
    duration: '2 hours',
    totalMarks: '120',
    eligibility: 'Class 12 with 45% marks (UG); LLB with 55% marks (PG)',
    websiteUrl: 'https://consortiumofnlus.ac.in',
    descriptionEn:
      'CLAT is the centralised national entrance exam for admission to 24 National Law Universities (NLUs) across India for BA LLB (Hons.) and LLM programmes.',
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
    descriptionEn:
      'GATE is required for M.Tech admissions at IITs, NITs, and IISc, and for PSU recruitment (ONGC, BHEL, NTPC, etc.). A valid GATE score is also required for direct PhD admissions at several top institutions.',
    collegesAccepting: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur', 'nit-trichy'],
  },
  {
    id: 'gre',
    slug: 'gre',
    shortName: 'GRE',
    fullName: 'Graduate Record Examinations',
    region: 'global',
    domain: 'general',
    conductingBody: 'ETS (Educational Testing Service)',
    frequency: 'Year-round (5 times per year per candidate)',
    mode: 'online',
    duration: '1 hour 58 minutes',
    totalMarks: '340 (Verbal 170 + Quant 170) + 6.0 Analytical Writing',
    eligibility: "Bachelor's degree or equivalent",
    websiteUrl: 'https://www.ets.org/gre',
    descriptionEn:
      'The GRE is accepted by thousands of graduate and business programs worldwide, primarily in the USA, Canada, and Australia. It assesses Verbal Reasoning, Quantitative Reasoning, and Analytical Writing. GRE scores are valid for 5 years.',
    collegesAccepting: ['mit', 'stanford'],
  },
  {
    id: 'gmat',
    slug: 'gmat',
    shortName: 'GMAT',
    fullName: 'Graduate Management Admission Test',
    region: 'global',
    domain: 'management',
    conductingBody: 'GMAC (Graduate Management Admission Council)',
    frequency: 'Year-round (up to 5 times per year)',
    mode: 'online',
    duration: '2 hours 15 minutes',
    totalMarks: '205–805',
    eligibility: "Bachelor's degree or equivalent",
    websiteUrl: 'https://www.mba.com',
    descriptionEn:
      'The GMAT Focus Edition is accepted by over 7,700 programs at 2,400+ business schools worldwide, including all top-10 global MBA programs. It tests Data Insights, Verbal Reasoning, and Quantitative Reasoning. Scores are valid for 5 years.',
    collegesAccepting: ['oxford', 'cambridge'],
  },
  {
    id: 'sat',
    slug: 'sat',
    shortName: 'SAT',
    fullName: 'Scholastic Assessment Test',
    region: 'usa',
    domain: 'general',
    conductingBody: 'College Board',
    frequency: 'Year-round (7 dates per year)',
    mode: 'online',
    duration: '2 hours 14 minutes',
    totalMarks: '1600 (Reading & Writing 800 + Math 800)',
    eligibility: 'No formal prerequisite; typically taken by Class 11–12 students',
    websiteUrl: 'https://satsuite.collegeboard.org',
    descriptionEn:
      'The Digital SAT is required or recommended for undergraduate admissions at most US universities. A score of 1500+ is typically competitive for top universities. Scores are valid for 5 years and can be superscored across attempts.',
    collegesAccepting: ['mit'],
  },
  {
    id: 'ielts',
    slug: 'ielts',
    shortName: 'IELTS',
    fullName: 'International English Language Testing System',
    region: 'global',
    domain: 'language',
    conductingBody: 'British Council / IDP / Cambridge Assessment English',
    frequency: 'Year-round (48 dates per year)',
    mode: 'both',
    duration: '2 hours 45 minutes',
    totalMarks: 'Band score 0–9',
    eligibility: 'No formal prerequisite',
    websiteUrl: 'https://www.ielts.org',
    descriptionEn:
      'IELTS Academic is required for UK, Australia, Canada, and many European university admissions. A band score of 6.5–7.5 is typically required by top universities. IELTS scores are valid for 2 years.',
    collegesAccepting: ['oxford', 'cambridge'],
  },
  {
    id: 'toefl',
    slug: 'toefl',
    shortName: 'TOEFL',
    fullName: 'Test of English as a Foreign Language',
    region: 'global',
    domain: 'language',
    conductingBody: 'ETS (Educational Testing Service)',
    frequency: 'Year-round (60+ dates per year)',
    mode: 'online',
    duration: '2 hours',
    totalMarks: '0–120',
    eligibility: 'No formal prerequisite',
    websiteUrl: 'https://www.ets.org/toefl',
    descriptionEn:
      'TOEFL iBT is accepted by more than 12,500 universities in over 160 countries, including all US and Canadian universities. A score of 100+ is competitive for top universities. Scores are valid for 2 years.',
    collegesAccepting: ['mit', 'oxford'],
  },
];

export const getExamBySlug = (slug: string) =>
  ENTRANCE_EXAMS.find((e) => e.slug === slug);

export const EXAMS_BY_REGION = (region: ExamRegion) =>
  ENTRANCE_EXAMS.filter((e) => e.region === region);

export const EXAMS_BY_DOMAIN = (domain: ExamDomain) =>
  ENTRANCE_EXAMS.filter((e) => e.domain === domain);
