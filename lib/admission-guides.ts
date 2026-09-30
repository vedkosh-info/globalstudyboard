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
  /**
   * Delivery medium, not location: 'online' = computer-based (at a test centre
   * and/or at home — say which in `descriptionEn`), 'offline' = pen and paper,
   * 'both' = computer- and paper-based options exist.
   */
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
  /**
   * The date the record's CONTENT last changed without a full re-verification of
   * its facts (e.g. a dead source link repaired, a sentence corrected) — the same
   * rule as `Guide.contentUpdated`. Never moves lastVerified — "Last verified"
   * stays the date the facts were checked; "Last updated", the sitemap and
   * dateModified use the later of the two (examModified). Needs a lastVerified
   * and must be after it (CMI enforces both). Omit when lastVerified is the
   * latest change.
   */
  contentUpdated?: string;
}

/** An exam's real last-modified date: the later of its verification and any later content change (ISO strings compare as dates); undefined for an unstamped record. */
export const examModified = (e: Pick<EntranceExam, 'lastVerified' | 'contentUpdated'>): string | undefined =>
  e.contentUpdated && (!e.lastVerified || e.contentUpdated > e.lastVerified) ? e.contentUpdated : e.lastVerified;

export const ENTRANCE_EXAMS: EntranceExam[] = [
  // ─────────────────────────── USA undergraduate ───────────────────────────
  {
    id: 'sat',
    slug: 'sat',
    shortName: 'SAT',
    // College Board no longer expands the name; its pages call it "the digital SAT".
    fullName: 'Digital SAT',
    region: 'usa',
    // Also used for admission to American universities in the Middle East
    // (e.g. NYU Abu Dhabi — see collegesAccepting). See Content Policy §11.4.
    regions: ['usa', 'middle-east'],
    domain: 'undergraduate-admission',
    conductingBody: 'College Board',
    frequency: '8 weekend test dates a year (2026–27: Aug, Sep, Oct, Nov, Dec, Mar, May, Jun; same for U.S. and international)',
    mode: 'online',
    duration: '2 hours 14 minutes (plus a 10-minute break)',
    totalMarks: '400–1600 (Reading and Writing 200–800 + Math 200–800)',
    eligibility:
      'No published academic prerequisite. College Board recommends taking it in the spring of junior year (11th grade) and again in the fall of senior year (12th grade), with no limit on retakes; students under 13 need a parent or guardian to submit a consent form before they can register.',
    websiteUrl: 'https://satsuite.collegeboard.org',
    // College Board's $68/$43 sentences carry no year; its "Fees Through June 2027"
    // table and the Aug 2026–Jun 2027 centre list carry the $24 fee. Re-check in 2027.
    costUsd: 'US$68 (as listed by College Board in September 2026); testing outside the U.S. adds a flat US$43 international fee (US$111 total), and some listed international centres charge a further US$24 test-centre fee (listed through June 2027)',
    descriptionEn:
      "The digital SAT is College Board's undergraduate admission test and is accepted by most U.S. colleges; each college sets its own testing policy, and many are test-optional, so check the college's admissions website. It is taken on a laptop or tablet in College Board's Bluebook app, at a test centre or at school with a proctor. The test is adaptive: each section (Reading and Writing, Math) has two modules, and the second module is more or less difficult depending on performance on the first. College Board states no fixed expiry, but cautions that scores sent five or more years after the test date may be less valid predictors; scores can be superscored across attempts where a college allows it.",
    // umich and georgia-tech checked on their own testing pages on 29 Sep 2026 (U-M considers
    // SAT or ACT scores if submitted; Georgia Tech requires one of them) — the same list as the ACT record.
    collegesAccepting: ['mit', 'harvard', 'stanford', 'caltech', 'princeton', 'yale', 'columbia', 'upenn', 'uchicago', 'cornell', 'brown', 'dartmouth', 'umich', 'georgia-tech', 'cmu', 'northwestern', 'duke', 'nyu', 'nyu-abu-dhabi'],
    sources: [
      { label: 'College Board — SAT test fees', url: 'https://satsuite.collegeboard.org/sat/registration/fees-refunds/test-fees' },
      { label: 'College Board — SAT international fees', url: 'https://satsuite.collegeboard.org/sat/registration/international-testing/fees' },
      { label: 'College Board — SAT test dates and deadlines', url: 'https://satsuite.collegeboard.org/sat/dates-deadlines' },
      { label: 'College Board — how the SAT is structured', url: 'https://satsuite.collegeboard.org/sat/whats-on-the-test/structure' },
      { label: 'College Board — what do my scores mean? (score ranges)', url: 'https://satsuite.collegeboard.org/scores/what-scores-mean' },
      { label: 'College Board — what to expect on test day (Bluebook, proctor)', url: 'https://satsuite.collegeboard.org/sat/what-to-bring-do/what-to-expect' },
      { label: 'College Board — SAT device readiness', url: 'https://satsuite.collegeboard.org/sat/device-readiness' },
      { label: 'College Board — Parents FAQs: SAT (accepted by most U.S. colleges)', url: 'https://satsuite.collegeboard.org/sat-suite-benefits-students-parents/faq/sat' },
      { label: 'College Board — how many times can a student take the SAT?', url: 'https://satsuite.collegeboard.org/help-center/how-many-times-can-student-take-sat-and-when-should-they-take-it' },
      { label: 'College Board — students under 13', url: 'https://satsuite.collegeboard.org/sat/registration/additional-registration-options/students-under-13' },
      { label: 'College Board — sending archived SAT scores (“Using older scores”)', url: 'https://satsuite.collegeboard.org/scores/sending-sat-scores/additional/sending-archived-scores' },
      { label: 'College Board Blog — what is an SAT superscore? (test-optional colleges)', url: 'https://blog.collegeboard.org/what-is-an-sat-superscore' },
    ],
    lastVerified: '2026-09-29',
  },
  {
    id: 'act',
    slug: 'act',
    shortName: 'ACT',
    // ACT no longer expands the name ("American College Testing" is retired);
    // its own pages call it "the ACT Test".
    fullName: 'The ACT Test',
    region: 'usa',
    // Also used for admission to American universities in the Middle East: NYU's
    // testing policy lists the ACT, and NYU Abu Dhabi's entry requirements point
    // to it as the policy for all NYU campuses (both read 29 Sep 2026). See Content Policy §11.4.
    regions: ['usa', 'middle-east'],
    domain: 'undergraduate-admission',
    // act.org's terms of use: the site is maintained by ACT Education Corp. ("ACT").
    conductingBody: 'ACT (ACT Education Corp.)',
    frequency: '7 test dates a year, in the U.S. and outside it (2026–27: Sep, Oct, Dec, Feb, Apr, Jun, Jul; most non-U.S. dates are two-day windows)',
    // U.S.: paper, online or bring-your-own-device at a test site; outside the
    // U.S. ACT's test-day page covers both computer and paper sittings.
    mode: 'both',
    duration: '2 hours 5 minutes (English, Math, Reading); the optional Science and Writing sections add 40 minutes each',
    totalMarks: '1–36 Composite (the average of English, Math and Reading, each 1–36); Writing is scored 2–12 separately',
    eligibility:
      'No published academic prerequisite. Most students take it in their junior year (11th grade) or senior year (12th grade) of high school.',
    websiteUrl: 'https://www.act.org',
    // The non-U.S. home page showed US$186.50 on 29 Sep 2026 while the non-U.S.
    // fee table showed US$188.50 — the record quotes the fee table.
    costUsd: 'As listed by ACT in September 2026: in the U.S., US$70 for the ACT (English, Math, Reading), plus US$5 for Science and US$25 for Writing (US$100 with both); outside the U.S., US$188.50, plus US$10 for Science and US$25 for Writing (US$223.50 with both)',
    descriptionEn:
      "The ACT is an undergraduate admission test used by U.S. colleges, and ACT says more than 200 universities outside the U.S. also accept it. Each college sets its own testing policy, and some do not consider scores at all — the University of California, for example, does not use SAT or ACT scores in admission decisions — so check the college's admissions website. The Composite score (1–36) is the average of the English, Math and Reading scores; Science and Writing are optional add-ons that do not affect it. In the U.S. you can choose paper, online or bring-your-own-device testing at a test site.",
    // uc-berkeley and ucla removed: UC does not consider SAT or ACT scores (UC Admissions, 29 Sep 2026).
    // Checked on each university's own testing page on 29 Sep 2026: Georgia Tech requires
    // the SAT or ACT (admission.gatech.edu/first-year/standardized-tests); CMU, Northwestern,
    // Duke and NYU (all campuses, incl. Abu Dhabi) accept it where scores are submitted
    // (cmu.edu/admission/admission/standardized-testing, admissions.northwestern.edu/faqs/
    // standardized-testing-policy, admissions.duke.edu/what-we-look-for, and the NYU sources below).
    collegesAccepting: ['mit', 'harvard', 'stanford', 'caltech', 'princeton', 'yale', 'columbia', 'upenn', 'uchicago', 'cornell', 'brown', 'dartmouth', 'umich', 'georgia-tech', 'cmu', 'northwestern', 'duke', 'nyu', 'nyu-abu-dhabi'],
    sources: [
      { label: 'ACT — Current ACT fees and services (U.S.)', url: 'https://www.act.org/content/act/en/products-and-services/the-act/registration/fees.html' },
      { label: 'ACT — Current ACT fees (non-U.S.)', url: 'https://global.act.org/content/global/en/products-and-services/the-act-non-us/registration/fees.html' },
      { label: 'ACT — U.S. test dates, 2026–27', url: 'https://www.act.org/content/act/en/products-and-services/the-act/registration/test-dates.html' },
      { label: 'ACT — non-U.S. registration and 2026–27 international test dates', url: 'https://global.act.org/content/global/en/products-and-services/the-act-non-us/registration.html' },
      { label: 'ACT — register for the ACT (paper, online and BYOD testing)', url: 'https://www.act.org/content/act/en/products-and-services/the-act/registration.html' },
      { label: 'ACT — ACT vs. SAT (section timing, 2 hours 5 minutes)', url: 'https://www.act.org/content/act/en/products-and-services/the-act/scores/act-vs-sat.html' },
      { label: 'ACT — understanding your scores (Composite 1–36, Writing 2–12)', url: 'https://www.act.org/content/act/en/products-and-services/the-act/scores/understanding-your-scores.html' },
      { label: 'ACT — when should you take the ACT? (junior or senior year)', url: 'https://www.act.org/content/act/en/products-and-services/the-act/scores/when-to-take-the-act.html' },
      { label: 'ACT — the ACT for non-U.S. students (accepted outside the U.S.)', url: 'https://global.act.org/content/global/en/products-and-services/the-act-non-us.html' },
      { label: 'ACT — non-U.S. test day (computer and paper sittings)', url: 'https://global.act.org/content/global/en/products-and-services/the-act-non-us/test-day.html' },
      { label: 'ACT — terms of use (ACT Education Corp.)', url: 'https://www.act.org/content/act/en/terms-of-use.html' },
      { label: 'UC Admissions — first-year requirements (SAT and ACT scores not considered)', url: 'https://admission.universityofcalifornia.edu/counselors/preparing-freshman-students/freshman-requirements.html' },
      { label: 'NYU — undergraduate standardized testing policy (test-optional through 2027–28; SAT or ACT accepted)', url: 'https://www.nyu.edu/admissions/undergraduate-admissions/how-to-apply/standardized-tests.html' },
      { label: 'NYU Abu Dhabi — entry requirements (follows NYU’s testing policy for all campuses)', url: 'https://nyuad.nyu.edu/en/apply/undergraduate/apply/entry-requirements.html' },
    ],
    lastVerified: '2026-09-29',
  },
  {
    id: 'ap',
    slug: 'ap-exams',
    shortName: 'AP Exams',
    fullName: 'Advanced Placement Examinations',
    region: 'usa',
    // Oxford, Cambridge and Imperial publish AP-based entry requirements on their own
    // admissions pages (30 Sep 2026). See Content Policy §11.4.
    regions: ['usa', 'uk-ireland'],
    domain: 'undergraduate-admission',
    conductingBody: 'College Board',
    frequency: 'Once a year (May)',
    // Fully digital (Bluebook) or hybrid digital with handwritten free responses, by subject (2027 course pages).
    mode: 'both',
    // The course pages list 3 h 10 min (Calculus AB) and 3 h 15 min (Chemistry,
    // U.S. History) — the old "2–3 hours" understated them (read 30 Sep 2026).
    duration: 'Varies by subject — e.g. 3 hours 10 minutes (Calculus AB), 3 hours 15 minutes (Chemistry, U.S. History); some subjects are assessed partly or wholly through portfolios or performance tasks',
    totalMarks: '1–5 per subject',
    eligibility: 'Open to any student: College Board recommends taking the AP course first but does not require it. You sit the exam through a school that administers AP Exams (your own or another nearby school) or, in some countries, an authorized AP test center.',
    websiteUrl: 'https://apstudents.collegeboard.org',
    costUsd: 'US$99 per exam in the U.S., U.S. territories, Canada and DoWEA schools; US$129 per exam at schools outside the U.S. (2027 exams; College Board says the cost per exam stays the same in 2026-27). Students with significant financial need may get a US$37 College Board fee reduction per exam. Fees at authorized test centers outside the U.S. vary, and schools may charge more to cover proctoring and administration.',
    descriptionEn:
      'AP Exams are College Board’s assessments in 42 AP subjects, each scored on a 1–5 scale. Many U.S. colleges grant credit, advanced placement or both for scores of 3 and above, and universities outside the U.S. also recognize AP scores. Oxford, Cambridge and Imperial College London, for example, publish AP-based entry requirements. Each college sets its own policy, so check the ones you are applying to. The 2027 AP Exams are held in schools over two weeks in May (3–7 and 10–14 May); some are fully digital in the Bluebook app, others hybrid with handwritten free responses.',
    collegesAccepting: ['mit', 'harvard', 'stanford', 'caltech', 'princeton', 'yale', 'columbia', 'cornell', 'oxford', 'cambridge', 'imperial'],
    sources: [
      // Per-cycle pages: the 2027 fee and exam-date pages — re-check when College Board posts the 2028 figures.
      { label: 'College Board — 2027 AP exam fees (US$99 / US$129; US$37 fee reduction; cost unchanged in 2026-27)', url: 'https://apstudents.collegeboard.org/exam-policies-guidelines/exam-fees' },
      { label: 'College Board — AP courses and exams (42 AP subjects)', url: 'https://apstudents.collegeboard.org/courses' },
      { label: 'College Board — 2027 AP Exam dates', url: 'https://apstudents.collegeboard.org/exam-dates' },
      { label: 'College Board — about AP scores (1–5 scale; credit for 3 and above at many U.S. colleges)', url: 'https://apstudents.collegeboard.org/about-ap-scores' },
      { label: 'College Board — AP around the world (course recommended, not required; testing at schools or authorized test centers)', url: 'https://apstudents.collegeboard.org/ap-around-the-world' },
      { label: 'College Board — AP Calculus AB exam (3 hours 10 minutes; hybrid digital)', url: 'https://apstudents.collegeboard.org/courses/ap-calculus-ab/assessment' },
      { label: 'College Board — AP Chemistry exam (3 hours 15 minutes)', url: 'https://apstudents.collegeboard.org/courses/ap-chemistry/assessment' },
      { label: 'College Board — AP U.S. History exam (3 hours 15 minutes; fully digital)', url: 'https://apstudents.collegeboard.org/courses/ap-united-states-history/assessment' },
      { label: 'College Board — AP Drawing (assessed by digital portfolio)', url: 'https://apstudents.collegeboard.org/courses/ap-drawing/assessment' },
      { label: 'College Board — AP Seminar assessment (two performance tasks plus an end-of-course exam)', url: 'https://apstudents.collegeboard.org/courses/ap-seminar/assessment' },
      { label: 'University of Oxford — international qualifications (USA: Advanced Placement)', url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/admissions-requirements/international-qualifications' },
      { label: 'University of Cambridge — accepted qualifications (Advanced Placement tests)', url: 'https://www.undergraduate.study.cam.ac.uk/apply/before/accepted-qualifications' },
      { label: 'Imperial College London — accepted qualifications (Advanced Placement)', url: 'https://www.imperial.ac.uk/study/apply/undergraduate/entry-requirements/accepted-qualifications/' },
      { label: 'MIT Admissions — tests and scores (self-report AP)', url: 'https://mitadmissions.org/apply/firstyear/tests-scores/' },
      { label: 'Harvard College — application requirements (AP scores)', url: 'https://college.harvard.edu/admissions/apply/application-requirements' },
      { label: 'Stanford — first-year testing (self-report AP)', url: 'https://admission.stanford.edu/apply/first-year/testing.html' },
      { label: 'Caltech — first-year application requirements (AP/IB scores)', url: 'https://www.admissions.caltech.edu/apply/first-year-applicants/application-requirements' },
      { label: 'Princeton — standardized testing (self-report AP/IB)', url: 'https://admission.princeton.edu/apply/standardized-testing' },
      { label: 'Yale — standardized testing (AP or IB scores)', url: 'https://admissions.yale.edu/standardized-testing' },
      { label: 'Columbia — testing (AP scores accepted)', url: 'https://undergrad.admissions.columbia.edu/apply/process/testing' },
      { label: 'Cornell — does Cornell require AP exam scores?', url: 'https://faq.enrollment.cornell.edu/kb/article/412-does-cornell-university-require-advanced-placement-ap-exam-scores/' },
    ],
    lastVerified: '2026-09-30',
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
    frequency: 'Year-round, 365 days a year (once every 21 days, up to 5 times in any rolling 12 months)',
    mode: 'online',
    duration: '1 hour 58 minutes',
    // ETS reports three separate scores and never a combined total.
    totalMarks: 'Verbal 130–170 and Quantitative 130–170 (1-point steps); Analytical Writing 0–6 (half-point steps)',
    eligibility: 'Taken by applicants to graduate, business and law programs, each of which sets its own requirements; bring the required ID on test day',
    websiteUrl: 'https://www.ets.org/gre',
    costUsd: 'US$249 in most of the world from 1 Aug 2026 (US$231.30 in China; ₹25,522 in India); the final charge includes a 4% online service fee, plus local tax in some countries',
    descriptionEn:
      "ETS says the GRE General Test is accepted at thousands of graduate, business and law schools worldwide; some programs make it optional, so check each program's own admission requirements. It is computer-delivered, at a test centre or at home, and since 22 September 2023 takes about 1 hour 58 minutes. ETS reports scores for five years after the test date.",
    collegesAccepting: ['mit', 'harvard', 'stanford', 'caltech', 'cornell', 'umich', 'cmu', 'duke', 'georgia-tech', 'kaust'],
    sources: [
      { label: 'ETS — GRE General Test fees (effective 1 Aug 2026)', url: 'https://www.ets.org/gre/test-takers/general-test/register/fees.html' },
      { label: 'ETS India — GRE General Test fees (INR)', url: 'https://www.in.ets.org/gre/test-takers/general-test/register/fees.html' },
      { label: 'ETS — GRE Information Bulletin 2026–27 (PDF)', url: 'https://www.ets.org/content/dam/ets-org/pdfs/gre/gre-info-bulletin.pdf' },
      { label: 'ETS — GRE General Test structure and timing', url: 'https://www.ets.org/gre/test-takers/general-test/prepare/test-structure.html' },
      { label: 'ETS — getting your GRE General Test scores', url: 'https://www.ets.org/gre/test-takers/general-test/scores/get-scores.html' },
      { label: 'ETS — about the GRE General Test (who accepts it)', url: 'https://www.ets.org/gre/test-takers/general-test/about.html' },
      { label: 'ETS — GRE home (availability, test-optional programs)', url: 'https://www.ets.org/gre' },
    ],
    lastVerified: '2026-09-29',
  },
  {
    id: 'gmat',
    slug: 'gmat',
    shortName: 'GMAT Focus',
    fullName: 'Graduate Management Admission Test (Focus Edition)',
    region: 'global',
    domain: 'management',
    conductingBody: 'GMAC (Graduate Management Admission Council)',
    frequency: 'Appointments 7 days a week (test centres in opening hours, online around the clock where offered); up to 5 attempts in any rolling 12 months, at least 16 days apart',
    mode: 'online',
    duration: '2 hours 15 minutes (plus one optional 10-minute break)',
    totalMarks: '205–805',
    eligibility:
      'At least 18 (ages 13–17 may test at a test centre with written parent or guardian consent); GMAC sets no degree requirement to take the test, and each programme sets its own admission requirements',
    websiteUrl: 'https://www.mba.com/exams/gmat-exam',
    // GMAC's per-country table (29 Sep 2026): 19 euro-area countries €275/€300, but
    // Croatia and Bulgaria US$285/US$310; China and Taiwan test centre only (US$250).
    costUsd: 'US$250–US$310 by location and delivery (e.g. USA, India: US$275 test centre / US$300 online); UK £250/£275; Germany, France, Ireland and most other euro-area countries €275/€300 (Croatia and Bulgaria US$285/US$310); local taxes may apply (Sep 2026)',
    descriptionEn:
      'According to GMAC, the GMAT exam is accepted by over 7,700 programs at about 2,400 business schools worldwide. It is taken on computer at a test centre or, in most locations, online, in three 45-minute sections (64 questions in total) answered in any order: Quantitative Reasoning, Verbal Reasoning and Data Insights. Scores are valid for five years and can be reported for up to ten.',
    collegesAccepting: ['harvard', 'stanford', 'upenn', 'mit', 'columbia', 'uchicago', 'northwestern', 'oxford', 'cambridge', 'bocconi'],
    sources: [
      { label: 'GMAC — the GMAT exam (programs and schools accepting)', url: 'https://www.mba.com/exams/gmat-exam' },
      { label: 'GMAC — GMAT exam structure', url: 'https://www.mba.com/exams/gmat-exam/about/exam-structure' },
      { label: 'GMAC — Understanding your score', url: 'https://www.mba.com/exams/gmat-exam/scores/understanding-your-score' },
      { label: 'GMAC — GMAT exam payment (fees by country)', url: 'https://www.mba.com/exams/gmat-exam/register/exam-payment' },
      { label: 'GMAC — GMAT exam FAQs (retakes)', url: 'https://www.mba.com/exams/gmat-exam/faqs' },
      { label: 'GMAC — GMAT Policies & Procedures, Aug 2026 (eligibility, delivery) (PDF)', url: 'https://www.mba.com/-/media/files/mba2/the-gmat-exam/files/register/gmat-policies-and-procedures_aug-2026.pdf' },
      { label: 'GMAC — test center vs online comparison (appointment availability) (PDF)', url: 'https://blog.gmat.com/hubfs/07.Assessments/GMAT%20Exam/Compare%20the%20Exams%20-%20Test%20Center%20vs%20Online.pdf' },
      { label: 'mba.com — how long are my GMAT scores valid?', url: 'https://support.mba.com/hc/en-us/articles/13894860085531-GMAT-How-Long-Are-My-Scores-Valid' },
    ],
    lastVerified: '2026-09-29',
  },
  {
    id: 'mcat',
    slug: 'mcat',
    shortName: 'MCAT',
    fullName: 'Medical College Admission Test',
    region: 'usa',
    // AAMC: "Most medical schools in the United States, and many in Canada, require
    // applicants to submit recent MCAT scores"; it is also tested in Canada, and
    // the MSAR covers every MD-granting school in both. See Content Policy §11.4.
    regions: ['usa', 'canada'],
    domain: 'medicine',
    conductingBody: 'AAMC (Association of American Medical Colleges)',
    frequency: 'Multiple dates each year, January–September (35 U.S. dates on the 2027 calendar; fewer at many international centres)',
    // Computer-based, taken only at Pearson test centres (see descriptionEn).
    mode: 'online',
    duration: 'About 7 hours 30 minutes seated (6 hours 15 minutes of content; check-in not included)',
    totalMarks: '472–528 (four sections, 118–132 each)',
    eligibility:
      'For people preparing to apply to a health-professions programme that accepts MCAT scores (MD, DO, podiatric, veterinary and others) who are not, and have not been, enrolled in one; anyone else must request AAMC special permission. Limits: 3 attempts per testing year, 4 over two consecutive testing years, 7 in a lifetime (counted from April 2015)',
    // /mcat and /mcat-exam both 404 in a browser (curl sees a 200 bot page) — review C4.
    websiteUrl: 'https://students-residents.aamc.org/taking-mcat-exam/take-mcat-exam',
    // AAMC's fee page says "for all 2026 testing dates"; 2027 registration opens
    // 20–22 Oct 2026 — re-verify the fees once the 2027 fees are posted.
    costUsd: 'US$355 (2026 testing year); testing outside the US, Canada or US territories adds a non-refundable US$130 international fee (US$485); US$145 for approved Fee Assistance Program awardees; any local sales tax, VAT or GST is added at scheduling',
    descriptionEn:
      "Most U.S. medical schools, and many in Canada, require recent MCAT scores, and many other health-professions and graduate programmes also accept them. The computer-based exam is taken at Pearson test centres in the United States, Canada and select locations worldwide. Three of its four multiple-choice sections draw on biology, biochemistry, general and organic chemistry, physics, psychology and sociology; the fourth, Critical Analysis and Reasoning Skills, needs no specific content knowledge. The AAMC notes that MCAT scores and GPA are just one part of a medical school application; its Medical School Admission Requirements (MSAR) database shows the MCAT and GPA ranges of past applicants and matriculants at every MD-granting, LCME-accredited medical school in the U.S. and Canada. Medical schools generally accept scores from the past two or three years; each school sets its own policy.",
    collegesAccepting: ['harvard', 'stanford', 'upenn', 'duke', 'umich', 'ucla'],
    sources: [
      { label: 'AAMC — Take the MCAT® Exam (official MCAT hub)', url: 'https://students-residents.aamc.org/taking-mcat-exam/take-mcat-exam' },
      { label: 'AAMC — MCAT scheduling fees (2026 testing dates)', url: 'https://students-residents.aamc.org/register-mcat-exam/mcat-scheduling-fees' },
      { label: 'AAMC — register for the MCAT exam (January–September dates)', url: 'https://students-residents.aamc.org/register-mcat-exam/register-mcat-exam' },
      { label: 'AAMC — U.S. MCAT calendar and scheduling deadlines', url: 'https://students-residents.aamc.org/register-mcat-exam/us-mcat-calendar-scheduling-deadlines-and-score-release-dates-0' },
      { label: 'AAMC — U.S. territories and international MCAT testing calendar', url: 'https://students-residents.aamc.org/register-mcat-exam/us-territories-and-international-mcat-testing-calendar' },
      { label: 'AAMC MCAT Essentials — What’s on the MCAT exam? (sections, timing, computer-based)', url: 'https://students-residents.aamc.org/whats-mcat-exam/publication-chapters/whats-mcat-exam' },
      { label: 'AAMC MCAT Essentials — MCAT exam scoring', url: 'https://students-residents.aamc.org/register-mcat-exam/publication-chapters/mcat-exam-scoring' },
      { label: 'AAMC MCAT Essentials — eligible health professions programs and special permission', url: 'https://students-residents.aamc.org/register-mcat-exam/publication-chapters/eligible-health-professions-programs-and-requesting-special-permission' },
      { label: 'AAMC MCAT Essentials — testing attempt limits', url: 'https://students-residents.aamc.org/register-mcat-exam/publication-chapters/testing-attempt-limits' },
      { label: 'AAMC — how long are MCAT scores valid?', url: 'https://students-residents.aamc.org/mcat-scores/how-long-are-mcat-scores-valid' },
      { label: 'AAMC — Four tips for using the MSAR (school-specific MCAT ranges)', url: 'https://students-residents.aamc.org/medical-school-admission-requirements/four-tips-using-medical-school-admission-requirements-msar' },
    ],
    lastVerified: '2026-09-29',
  },
  {
    id: 'lsat',
    slug: 'lsat',
    shortName: 'LSAT',
    fullName: 'Law School Admission Test',
    region: 'usa',
    // LSAC tests in the U.S. and Canada on one calendar, and McGill's Faculty of
    // Law notes almost all law faculties outside Quebec require it. §11.4.
    regions: ['usa', 'canada'],
    domain: 'law',
    conductingBody: 'LSAC (Law School Admission Council)',
    // 2026–27 U.S./Canada windows; the Spanish-language LSAT—Puerto Rico is a separate test.
    frequency: '8 multi-day administrations in 2026–27 (U.S. and Canada: Aug, Sep, Oct, Nov, Jan, Feb, Apr, Jun; fewer internationally)',
    mode: 'online',
    // LSAT Argumentative Writing: 15 minutes of prewriting (can be skipped after 5)
    // plus 35 minutes to write. The on-file rule lives in descriptionEn, anchored to
    // the testing year, because its July 2021 boundary rolls forward every July.
    duration: 'About 3 hours (four 35-minute sections and a 10-minute intermission), plus a Writing sample of up to 50 minutes taken separately',
    totalMarks: '120–180',
    eligibility:
      'At least 18 on the date you register (or an exception from LSAC), and taken only to seek admission to law school; LSAC sets no degree requirement to sit it — law schools set their own',
    websiteUrl: 'https://www.lsac.org',
    costUsd: 'US$253 LSAT registration for the 2026–27 testing year (includes LSAT Argumentative Writing); separately, the Credential Assembly Service (CAS) is US$219 and each law-school application needs a US$45 report (CAS or LSAT-only, as the school requires); outside the U.S., local taxes and the exchange rate may affect the charge',
    descriptionEn:
      "LSAC says the LSAT is the only test accepted by all ABA-approved U.S. law schools, although some U.S. and Canadian law schools also accept other tests; McGill's Faculty of Law notes that almost all Canadian law faculties outside Quebec require it. From August 2026 the multiple-choice test is taken on computer at Prometric test centres, with remote testing only by approved exception. It has three scored sections (two Logical Reasoning, one Reading Comprehension) plus one unscored variable section, and an unscored Writing sample taken separately online, which must be on file before LSAC releases a score — a sample from an earlier LSAT still counts while it is within the reportable score period (for the 2026–27 testing year, LSAC counts samples from July 2021 onwards). LSAC's Official Guide to ABA-Approved JD Programs estimates each school's likelihood of admission from undergraduate GPA and LSAT score, using the previous year's admission data, and notes that law schools weigh many other factors. Scores are reportable for up to five testing years after the testing year in which they were earned.",
    collegesAccepting: ['harvard', 'yale', 'stanford', 'columbia', 'uchicago', 'nyu', 'u-toronto', 'mcgill'],
    sources: [
      { label: 'LSAC — LSAT & CAS fees', url: 'https://www.lsac.org/lsat/register-lsat/lsat-cas-fees' },
      { label: 'LSAC — LSAT scoring', url: 'https://www.lsac.org/lsat/lsat-scoring' },
      { label: 'LSAC — LSAT test dates, 2026–27 testing year', url: 'https://www.lsac.org/LSATdates' },
      { label: 'LSAC — specifications of the LSAT and LSAT Argumentative Writing', url: 'https://www.lsac.org/lsat/register-lsat/accommodations/specifications-lsat-and-lsat-argumentative-writing' },
      { label: 'LSAC — LSAT remote testing and distance exceptions', url: 'https://www.lsac.org/lsat/about/lsat-remote-testing-distance-exceptions' },
      { label: 'LSAC — LSAT scheduling for 2026–27 explained', url: 'https://www.lsac.org/lsat/about/lsat-scheduling-2026-27-explained' },
      { label: 'LSAC — Candidate Agreement 2026–27 (minimum age, intended use)', url: 'https://www.lsac.org/about/lsac-policies/lsac-candidate-agreement/2026-2027' },
      { label: 'LSAC — LSAT FAQs (section timing)', url: 'https://www.lsac.org/lsat/frequently-asked-questions-about-lsat' },
      { label: 'LSAC — the LSAT advantage (accepted by all ABA-approved law schools)', url: 'https://www.lsac.org/lsat/about' },
      { label: 'LSAC — LSAT—Puerto Rico (separate test)', url: 'https://www.lsac.org/lsat/register-lsat/lsat-puerto-rico' },
      { label: 'LSAC — Official Guide to ABA-Approved JD Programs', url: 'https://www.lsac.org/choosing-law-school/find-law-school/jd-programs' },
      { label: 'McGill Faculty of Law — LSAT (law faculties outside Quebec)', url: 'https://www.mcgill.ca/law/bcl-jd/admissions-guide/lsat' },
    ],
    lastVerified: '2026-09-29',
  },

  // ─────────────────────────── UK undergraduate ───────────────────────────
  {
    id: 'a-levels',
    slug: 'a-levels',
    shortName: 'A-Levels',
    fullName: 'General Certificate of Education Advanced Level',
    region: 'uk-ireland',
    domain: 'undergraduate-admission',
    conductingBody: 'UK exam boards such as AQA, OCR, Pearson Edexcel, WJEC/Eduqas and CCEA; International A levels from Cambridge International, Pearson Edexcel and OxfordAQA',
    frequency: 'UK exam boards: once a year, in the May–June exam series. Cambridge International AS & A Levels: June and November series.',
    mode: 'offline',
    duration: 'Typically a two-year course; the number and length of exam papers vary by subject',
    totalMarks: 'A* (highest) to E (minimum pass) per subject; AS levels are graded A to E',
    eligibility: 'Usually studied at school or college over two years before university. Your school, college or exam centre enters you for the exams.',
    websiteUrl: 'https://www.gov.uk/what-different-qualification-levels-mean/list-of-qualification-levels',
    descriptionEn:
      'A levels are subject-based qualifications offered by exam boards in England, Wales and Northern Ireland; Ofqual describes them as the main pre-university qualification. Each A level is graded A* (highest) to E. Many universities base offers on three A levels (UCL, Manchester and Warwick say so on their entry-requirements pages), and some courses require particular subjects, so check each course page. UK boards set A-level exams in the May–June series; Cambridge International AS & A Levels are examined in June and November. Oxford and Cambridge accept International A levels from Cambridge International, Pearson Edexcel and OxfordAQA as equivalent to UK A levels.',
    collegesAccepting: ['oxford', 'cambridge', 'imperial', 'ucl', 'lse', 'edinburgh', 'manchester', 'kings-college-london', 'warwick', 'st-andrews'],
    sources: [
      // The AQA timetables are for the 2026–27 series — re-check them each year.
      { label: 'GOV.UK — what qualification levels mean (A level = level 3)', url: 'https://www.gov.uk/what-different-qualification-levels-mean/list-of-qualification-levels' },
      { label: 'Ofqual — glossary (A level: offered by exam boards in England, Wales and Northern Ireland; the main pre-university qualification)', url: 'https://www.gov.uk/government/publications/glossary-for-ofquals-statistics/glossary-for-ofquals-statistics' },
      { label: 'Ofqual — GCE qualification-level conditions (A level graded A* to E; AS A to E)', url: 'https://www.gov.uk/government/publications/gce-qualification-level-conditions-and-requirements/gce-qualification-level-conditions-and-requirements--2' },
      { label: 'AQA — May/June 2027 AS and A-level exam timetable (common JCQ slots)', url: 'https://www.aqa.org.uk/files/f8837da9-1846-4e7f-89a3-fb265c42f2e5/0ada6c345d4c272c8a4a42e48a5986983bfb0d56.pdf' },
      { label: 'AQA — November 2026 exam timetable (GCSE and Level 3 Extended Project only)', url: 'https://www.aqa.org.uk/files/cec4fc90-997e-4da1-b3c2-e217c0e58fdb/7f9db72615b207c4a899032ba0c5c37e166fd5f8.pdf' },
      { label: 'Cambridge International — AS & A Level qualification (two-year course; June and November series; A*–E)', url: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-advanced/cambridge-international-as-and-a-levels/qualification/' },
      { label: 'University of Oxford — international qualifications (International A-levels grade-for-grade)', url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/admissions-requirements/international-qualifications' },
      { label: 'University of Cambridge — accepted qualifications (A levels, International A levels)', url: 'https://www.undergraduate.study.cam.ac.uk/apply/before/accepted-qualifications' },
      { label: 'UCL — undergraduate entry requirements (based on three A levels)', url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/how-apply/entry-requirements' },
      { label: 'University of Manchester — entry requirements (three full A-levels)', url: 'https://www.manchester.ac.uk/study/undergraduate/applying/before-you-apply/entry-requirements/' },
      { label: 'University of Warwick — entry requirements (three full A-levels)', url: 'https://warwick.ac.uk/study/undergraduate/applying/entry-requirements/' },
      { label: 'LSE — entry requirements (standard offers in GCE A-levels and IB)', url: 'https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply/entry-requirements' },
      { label: 'Imperial College London — undergraduate entry requirements (A-level equivalent)', url: 'https://www.imperial.ac.uk/study/apply/undergraduate/entry-requirements/' },
      { label: 'University of Edinburgh — entry requirements (A levels)', url: 'https://study.ed.ac.uk/undergraduate/entry-requirements' },
      { label: 'King’s College London — undergraduate entry requirements (A-levels)', url: 'https://www.kcl.ac.uk/study/undergraduate/how-to-apply/entry-requirements' },
      { label: 'University of St Andrews — standard qualifications accepted (A-Level)', url: 'https://www.st-andrews.ac.uk/subjects/entry/' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ib',
    slug: 'international-baccalaureate',
    shortName: 'IB',
    fullName: 'International Baccalaureate Diploma Programme',
    region: 'global',
    domain: 'undergraduate-admission',
    conductingBody: 'International Baccalaureate (IB)',
    frequency: 'Two exam sessions a year, May and November (your school’s session applies)',
    // The IB delivers paper and digital DP exams, digital in a small number of subjects from 2026.
    mode: 'both',
    duration: 'Six subjects (150 teaching hours at standard level, 240 at higher level) plus the DP core; most courses end with written exams',
    totalMarks: 'Grades 1–7 in each of six subjects, plus up to 3 points for theory of knowledge and the extended essay (45 points maximum). The diploma requires at least 24 points and completion of the core.',
    eligibility: 'Open to students aged 16 to 19 at schools authorized to offer the Diploma Programme',
    websiteUrl: 'https://www.ibo.org/programmes/diploma-programme/',
    descriptionEn:
      'The IB Diploma Programme (DP) is a pre-university programme for students aged 16 to 19 at IB-authorized schools. Students take six subjects, at least three and at most four at higher level (HL) and the rest at standard level (SL), plus the DP core: theory of knowledge (TOK), the extended essay and creativity, activity, service (CAS). Each subject is graded 1–7, TOK and the extended essay add up to 3 points, and the diploma needs at least 24 points with the core completed. Most courses end with written exams in the May or November session, alongside coursework; the IB began digital exams in a small number of subjects in 2026. Each university sets its own IB requirements, and the IB notes that a published recognition policy does not guarantee admission.',
    collegesAccepting: ['oxford', 'cambridge', 'imperial', 'ucl', 'lse', 'harvard', 'mit', 'yale', 'u-toronto', 'mcgill', 'eth-zurich', 'stanford', 'princeton', 'columbia', 'caltech', 'edinburgh', 'st-andrews'],
    sources: [
      { label: 'IB — Diploma Programme (students aged 16 to 19 at authorized schools)', url: 'https://www.ibo.org/programmes/diploma-programme/' },
      { label: 'IB — DP curriculum (six subject groups; 3–4 HL; 150/240 teaching hours; DP core)', url: 'https://www.ibo.org/programmes/diploma-programme/curriculum/' },
      { label: 'IB — understanding DP assessment (grades 1–7; 24-point diploma; up to 3 core points)', url: 'https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/understanding-ib-assessment/' },
      { label: 'IB — DP and CP exam schedule (May and November sessions)', url: 'https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/exam-schedule/' },
      { label: 'IB — assessment and exams (paper and digital exams from 2026)', url: 'https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/' },
      { label: 'IB — university admissions (recognition policies do not guarantee admission)', url: 'https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/university-admissions/' },
      { label: 'University of Oxford — international qualifications (International Baccalaureate)', url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/admissions-requirements/international-qualifications' },
      { label: 'University of Cambridge — accepted qualifications (IB Diploma, points out of 45)', url: 'https://www.undergraduate.study.cam.ac.uk/apply/before/accepted-qualifications' },
      { label: 'Imperial College London — accepted qualifications (International Baccalaureate)', url: 'https://www.imperial.ac.uk/study/apply/undergraduate/entry-requirements/accepted-qualifications/' },
      { label: 'UCL — entry requirements (full IB Diploma accepted)', url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/how-apply/entry-requirements' },
      { label: 'LSE — entry requirements (A-levels and IB)', url: 'https://www.lse.ac.uk/study-at-lse/Undergraduate/Prospective-Students/How-to-Apply/entry-requirements' },
      { label: 'University of Toronto — requirements for international high schools (IB Diploma)', url: 'https://future.utoronto.ca/requirements-international-high-schools' },
      { label: 'McGill — International Baccalaureate Diploma requirements', url: 'https://www.mcgill.ca/undergraduate-admissions/apply/requirements/international/ib' },
      { label: 'ETH Zurich — admission prerequisites (International Baccalaureate)', url: 'https://ethz.ch/en/studies/bachelor/application/non-swiss-matriculation-certificate/admission-prerequisites.html' },
      { label: 'Harvard College — application requirements (IB)', url: 'https://college.harvard.edu/admissions/apply/application-requirements' },
      { label: 'MIT Admissions — tests and scores (self-report IB)', url: 'https://mitadmissions.org/apply/firstyear/tests-scores/' },
      { label: 'Yale — standardized testing (AP or IB scores)', url: 'https://admissions.yale.edu/standardized-testing' },
      { label: 'Stanford — first-year testing (IB predicted marks)', url: 'https://admission.stanford.edu/apply/first-year/testing.html' },
      { label: 'Princeton — standardized testing (self-report IB)', url: 'https://admission.princeton.edu/apply/standardized-testing' },
      { label: 'Columbia — testing (IB results)', url: 'https://undergrad.admissions.columbia.edu/apply/process/testing' },
      { label: 'Caltech — first-year application requirements (AP/IB scores)', url: 'https://www.admissions.caltech.edu/apply/first-year-applicants/application-requirements' },
      { label: 'University of Edinburgh — entry requirements (International Baccalaureate)', url: 'https://study.ed.ac.uk/undergraduate/entry-requirements' },
      { label: 'University of St Andrews — standard qualifications accepted (IB)', url: 'https://www.st-andrews.ac.uk/subjects/entry/' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ucat',
    slug: 'ucat',
    shortName: 'UCAT',
    fullName: 'University Clinical Aptitude Test',
    region: 'uk-ireland',
    // The UCAT universities page lists the NUS and NTU (Singapore) and Thammasat
    // (Thailand) medicine courses among its partner users. See Content Policy §11.4.
    regions: ['uk-ireland', 'east-southeast-asia'],
    domain: 'medicine',
    conductingBody: 'UCAT Consortium',
    frequency: 'Once a year, July to September (2026 window: 13 July – 24 September); one sitting per test cycle',
    // Computer-based at Pearson VUE centres; online proctoring (OnVUE) only on approval.
    mode: 'online',
    duration: 'Just under 2 hours (standard test)',
    totalMarks: '900–2700 (three cognitive subtests, each 300–900), plus a Situational Judgement band (1–4, band 1 highest)',
    eligibility:
      'Applicants to relevant medicine and dentistry courses at UK UCAT Consortium universities and its partner universities abroad. Australian and New Zealand consortium universities accept only the separate UCAT ANZ (same content), and you may not sit both tests in the same year — if you are applying to both regions, sit the UCAT ANZ, whose results UK and partner universities also accept. People affiliated with a UCAT coaching business may not sit it.',
    websiteUrl: 'https://www.ucat.ac.uk',
    costUsd: '£70 for tests taken in the UK / £115 outside the UK (2026 test cycle; set by test location, not nationality); the UCAT Bursary waives the fee for eligible UK candidates',
    descriptionEn:
      'The UCAT is required for relevant medicine and dentistry courses at the 50 UK universities and medical schools on the UCAT Consortium list for 2027 entry; some applicant groups have alternative requirements. A few partner universities abroad also use it, such as NUS and NTU in Singapore and Thammasat in Thailand, while Australian and New Zealand consortium universities accept only the separate UCAT ANZ. It is computer-based and taken at Pearson VUE test centres in the UK and 130+ countries, with online proctoring only for approved candidates. Four sections test verbal reasoning, decision making, quantitative reasoning, and situational judgement (Abstract Reasoning was removed from 2025). For UK entry, results are valid only for the next UCAS admissions cycle (entry the year after the test, or deferred entry a year later); partner universities abroad set their own rules.',
    // Every catalogue unit on the UCAT universities page (29 Sep 2026): 14 UK
    // universities plus the NUS and NTU medical schools. Not 'queens' — that is
    // Queen's University in Canada, not Queen's University Belfast. u-melbourne is
    // on neither the UCAT nor the UCAT ANZ list; unsw uses UCAT ANZ, a separate test.
    collegesAccepting: ['kings-college-london', 'manchester', 'edinburgh', 'oxford', 'cambridge', 'imperial', 'ucl', 'warwick', 'st-andrews', 'bristol', 'glasgow', 'leeds', 'birmingham', 'sheffield', 'nus', 'ntu-sg'],
    sources: [
      { label: 'UCAT Consortium — Test Format & Scoring', url: 'https://www.ucat.ac.uk/about-ucat/test-format-and-scoring/' },
      { label: 'UCAT Consortium — FAQs (fees)', url: 'https://www.ucat.ac.uk/faqs/' },
      { label: 'UCAT — results', url: 'https://www.ucat.ac.uk/results/ucat-results/' },
      { label: 'UCAT Consortium — UCAT 2026 test dates', url: 'https://www.ucat.ac.uk/about-ucat/ucat-test-dates/' },
      { label: 'UCAT Consortium — eligibility (UCAT vs UCAT ANZ; test centres in 130+ countries)', url: 'https://www.ucat.ac.uk/about-ucat/eligibility/' },
      { label: 'UCAT Consortium — UCAT universities (UK and partner list)', url: 'https://www.ucat.ac.uk/about-ucat/universities/' },
      { label: 'UCAT Consortium — UCAT essentials (computer-based, Pearson test centres)', url: 'https://www.ucat.ac.uk/about-ucat/ucat-essentials/' },
      { label: 'UCAT Consortium — OnVUE online proctored testing', url: 'https://www.ucat.ac.uk/about-ucat/eligibility/onvue-testing/' },
      { label: 'UCAT Consortium — UCAT 2025 (Abstract Reasoning withdrawn)', url: 'https://www.ucat.ac.uk/news/ucat-2025/' },
      { label: 'UCAT ANZ Consortium — universities', url: 'https://www.ucat.edu.au/about-ucat-anz/universities/' },
    ],
    lastVerified: '2026-09-29',
  },

  // ─────────────────────────── Europe ───────────────────────────
  {
    id: 'testas',
    slug: 'testas',
    shortName: 'TestAS',
    fullName: 'Test für Ausländische Studierende (Test for Academic Studies)',
    region: 'europe',
    domain: 'undergraduate-admission',
    conductingBody: 'g.a.s.t. (Gesellschaft für Akademische Studienvorbereitung und Testentwicklung e. V.)',
    frequency: 'Several dates a year in two formats. The 2027 worldwide schedule lists paper-based sittings on 25 February, 24 April and 23 October, and digital sittings on 18 March, 15 June and 25 November.',
    mode: 'both',
    duration: 'About 3.5 hours including breaks (digital) or about 4.5 hours including breaks (paper-based)',
    totalMarks: 'Digital: TestAS Score 0–200 for each module and 0–400 overall, plus a percentile rank (1–100). Paper-based: standard score 70–130 and percentile rank (1–100), reported separately for the Core Test and the Subject Module.',
    eligibility: 'Anyone planning an undergraduate degree at a German university; taken in German or English at a licensed test centre',
    websiteUrl: 'https://www.testas.de',
    costUsd: 'Set by g.a.s.t. in three country price groups; the price for your country is shown when you register online (no worldwide figure is published)',
    descriptionEn:
      'TestAS (Test for Academic Studies) is g.a.s.t.’s aptitude test for international applicants to undergraduate programmes at German universities. It combines a Core Module (digital) or Core Test (paper-based), which measures general study-related cognitive abilities, with one Subject Module: Humanities, Cultural Studies and Social Sciences; Engineering; Mathematics, Computer Science and Natural Sciences; or Economics. Life Sciences and Medicine are also offered in the digital format. You take it in German or English at a licensed test centre. Many German universities use TestAS in admission and some require it, but each decides whether and how the result counts, so check the university’s own admission page. In China it can only be taken within the APS procedure, and in Vietnam it is mandatory in the APS procedure for applicants without a university degree; in India it matters where a German university requires it. The certificate has no expiry date.',
    // Heidelberg's BSc Biosciences scores TestAS points for overseas applicants (30 Sep 2026).
    // No TUM or LMU page read that day shows TestAS used in admission — re-add only with one.
    collegesAccepting: ['heidelberg'],
    sources: [
      // The g.a.s.t. schedule lists the 2027 dates — re-check it each year.
      { label: 'TestAS (g.a.s.t.) — official site', url: 'https://www.testas.de/en' },
      { label: 'TestAS — structure of the digital TestAS (Core Module; six Subject Modules)', url: 'https://www.testas.de/en/teilnehmende/the-digital-testas/structure-of-the-digital-testas' },
      { label: 'TestAS — structure of the paper-based TestAS (Core Test 110 min; Subject Module ~150 min)', url: 'https://www.testas.de/en/teilnehmende/the-paper-based-testas/structure-of-the-paper-based-testas' },
      { label: 'TestAS — evaluation of the digital TestAS (0–200 per module, 0–400 overall, percentile rank)', url: 'https://www.testas.de/en/teilnehmende/the-digital-testas/evaluation-of-the-digital-testas' },
      { label: 'TestAS — evaluation of the paper-based TestAS (standard score 70–130, percentile rank)', url: 'https://www.testas.de/en/teilnehmende/the-paper-based-testas/evaluation-of-the-paper-based-testas' },
      { label: 'TestAS — FAQ general (durations; three country price groups)', url: 'https://www.testas.de/en/participants/my-testas/faq/faq-general' },
      { label: 'TestAS — FAQ registration (Subject Modules by format)', url: 'https://www.testas.de/en/participants/my-testas/faq/faq-registration' },
      { label: 'TestAS — FAQ results and certificates (no expiry; weighting varies by university)', url: 'https://www.testas.de/en/participants/my-testas/faq/faq-results-and-certificates' },
      { label: 'TestAS — dates and registration (China, Vietnam, India APS notes)', url: 'https://www.testas.de/en/participants/my-testas/testas-dates-and-registration' },
      { label: 'g.a.s.t. — TestAS worldwide exam dates (2026–2027)', url: 'https://www.gast.de/portal/center-search/center-search/testas/exams/worldwide?lang=en' },
      { label: 'TestAS — TestAS for admission to a German university', url: 'https://www.testas.de/en/participants/my-testas/with-the-testas-to-a-german-university' },
      { label: 'TestAS — imprint (g.a.s.t.)', url: 'https://www.testas.de/en/imprint' },
      { label: 'Heidelberg University, Faculty of Biosciences — BSc Biosciences application (TestAS points in selection)', url: 'https://www.bio.uni-heidelberg.de/en/study-and-teaching/study-programmes/bsc-biosciences/application' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'testdaf',
    slug: 'testdaf',
    shortName: 'TestDaF',
    fullName: 'Test Deutsch als Fremdsprache',
    region: 'europe',
    domain: 'language',
    conductingBody: 'TestDaF-Institut, run by g.a.s.t. (Gesellschaft für Akademische Studienvorbereitung und Testentwicklung e. V.)',
    frequency: 'Many dates a year in two formats. The 2027 worldwide schedule lists 8 digital dates and 6 paper-based dates; in China you register through the NEEA.',
    mode: 'both',
    duration: 'Paper-based: 3 hours 15 minutes of test time (Reading 60, Listening 40, Writing 60, Speaking 35 minutes), with a break after each part. Digital: about 55, 40, 60 and 35 minutes for the four parts.',
    totalMarks: 'TDN 3, TDN 4 or TDN 5 (or below TDN 3) for each of the four parts, with no overall grade; the digital test also reports 0–20 points per part. TDN 3–5 correspond to CEFR B2–C1.',
    eligibility: 'Anyone who registers with a valid passport or national ID. Used by applicants who must prove German for study in Germany because their university entrance qualification was not obtained at a German-language institution.',
    websiteUrl: 'https://www.testdaf.de',
    costUsd: 'In Germany: €215 (paper-based) or €210 (digital). Elsewhere the price depends on which of three country price groups applies; the test centre or online registration shows it. In China the fee is paid to the NEEA.',
    descriptionEn:
      'TestDaF (Test Deutsch als Fremdsprache) is the German-language test for international applicants to German universities, run by the TestDaF-Institut of g.a.s.t. It has four parts (Reading, Listening, Writing and Speaking), each rated separately at TDN 3, 4 or 5 (levels mapped to CEFR B2–C1) with no overall grade, and is taken on computer or on paper at licensed test centres. The TestDaF-Institut states that all German universities recognize the certificate. Under the German universities’ language-test framework (RO-DT), TDN 4 in all four parts counts as proof of German for unrestricted admission to all degree programmes. Some programmes accept lower levels, so check your course. Other accepted proofs include DSH-2, telc Deutsch C1 Hochschule and Goethe-Zertifikat C2. The certificate does not expire, though some universities accept only recent proof.',
    collegesAccepting: ['tu-munich', 'lmu-munich', 'heidelberg'],
    sources: [
      // testdaf.de/en answered HTTP 500 on 30 Sep 2026, so the German pages are cited. The g.a.s.t. schedule lists the 2027 dates — re-check it each year.
      { label: 'TestDaF (g.a.s.t. / TestDaF-Institut) — official site', url: 'https://www.testdaf.de/de/' },
      { label: 'TestDaF — FAQ general (formats, parts, timings, TDN, prices)', url: 'https://www.testdaf.de/de/teilnehmende/mein-testdaf/faq/faq-allgemein/' },
      { label: 'TestDaF — FAQ registration (ID requirement; deadlines)', url: 'https://www.testdaf.de/de/teilnehmende/mein-testdaf/faq/faq-anmeldung/' },
      { label: 'TestDaF — FAQ results and certificate (valid indefinitely; CEFR B2–C1)', url: 'https://www.testdaf.de/de/teilnehmende/mein-testdaf/faq/faq-ergebnisse-und-zertifikat/' },
      { label: 'TestDaF — structure of the digital TestDaF', url: 'https://www.testdaf.de/de/teilnehmende/der-digitale-testdaf/aufbau-des-digitalen-testdaf/' },
      { label: 'TestDaF — evaluation of the digital TestDaF (0–20 points per part)', url: 'https://www.testdaf.de/de/teilnehmende/der-digitale-testdaf/auswertung-des-digitalen-testdaf/' },
      { label: 'TestDaF — structure of the paper-based TestDaF (3 h 15 min test time)', url: 'https://www.testdaf.de/de/teilnehmende/der-papierbasierte-testdaf/aufbau-des-papierbasierten-testdaf/' },
      { label: 'TestDaF — proof of German for study (RO-DT: TDN 4 in all parts)', url: 'https://www.testdaf.de/de/hochschulen/der-testdaf-und-hochschulen/nachweis-der-deutschkenntnisse-fuer-das-studium/' },
      { label: 'TestDaF — with TestDaF to a German university (recognised by all German universities)', url: 'https://www.testdaf.de/de/teilnehmende/mein-testdaf/mit-dem-testdaf-an-eine-deutsche-hochschule/' },
      { label: 'TestDaF — dates and registration (China via NEEA)', url: 'https://www.testdaf.de/de/teilnehmende/mein-testdaf/testdaf-termine-und-anmeldung/' },
      { label: 'g.a.s.t. — TestDaF worldwide exam dates (2026–2027)', url: 'https://www.gast.de/portal/center-search/center-search/exams/worldwide' },
      { label: 'TestDaF — imprint (g.a.s.t., operator of the TestDaF-Institut)', url: 'https://www.testdaf.de/de/impressum/' },
      { label: 'TUM — language certificates (TestDaF level 4; DSH-2; telc C1 Hochschule; Goethe C2)', url: 'https://www.tum.de/en/studies/application/application-info-portal/admission-requirements/language-certificates' },
      { label: 'LMU Munich — German proficiency (DSH 2; TestDaF level 4 in all sections; telc C1)', url: 'https://www.lmu.de/en/study/degree-students/prerequisites/german-proficiency/' },
      { label: 'Heidelberg University — language requirements for international students (TestDaF TDN 4; DSH-2; Goethe C2)', url: 'https://www.uni-heidelberg.de/en/study/advisory-services/learning-languages/language-requirements-for-international-students' },
    ],
    lastVerified: '2026-09-30',
  },

  // ─────────────────────────── Global English tests ───────────────────────────
  {
    id: 'ielts',
    slug: 'ielts',
    shortName: 'IELTS',
    fullName: 'International English Language Testing System',
    region: 'global',
    domain: 'language',
    conductingBody: 'British Council / IDP IELTS / Cambridge University Press & Assessment',
    // The 48-a-year figure was the paper-test schedule, withdrawn from mid-2026.
    frequency: 'Year-round (test dates and session times vary by test centre)',
    // ielts.org: from mid-2026 "All IELTS tests will be delivered on computer" (timing
    // varies by market). "Writing on Paper" = handwritten Writing on the computer test
    // (selected countries), and IELTS Online is taken at home — the medium is computer.
    mode: 'online',
    duration: '2 hours 45 minutes',
    totalMarks: 'Band score 0–9',
    eligibility:
      'No academic prerequisite; bring valid photo ID (passport or national identity card, depending on the country). Under-18s need parental consent, and IELTS Online is for ages 18 and above',
    websiteUrl: 'https://www.ielts.org',
    // Priced locally — a single US$ range would need invented exchange rates.
    costUsd: 'IELTS Academic and General Training: set by country and centre, e.g. USA USD 325–330 from 1 Oct 2026 (USD 285 before), India INR 19,000 and most Australian centres AUD 490 (2026), UK GBP 235 (Bristol); IELTS for UKVI is priced separately (e.g. India INR 19,250)',
    descriptionEn:
      'IELTS Academic is accepted for university admission in the UK, Australia, Canada, New Zealand, the USA and Europe; each university sets its own English-language requirement and minimum band score, so check its official admissions page. At a test centre it is taken on computer — the paper-based test is being withdrawn from mid-2026, with timing varying by market — and some countries offer a handwritten Writing on Paper option. In some countries IELTS Academic can also be taken as IELTS Online, at home with remote proctoring; each university decides whether to accept an online result, and IELTS Online is not accepted for immigration purposes. The IELTS partners recommend that institutions accept a result for a maximum of two years.',
    collegesAccepting: ['oxford', 'cambridge', 'imperial', 'u-toronto', 'mcgill', 'u-melbourne', 'eth-zurich', 'tu-delft', 'uc-berkeley', 'ucla'],
    sources: [
      { label: 'IELTS — Academic test format', url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test' },
      { label: 'IELTS — verifying IELTS results (validity period)', url: 'https://ielts.org/organisations/ielts-for-organisations/verifying-ielts-results' },
      { label: 'IELTS — about IELTS (joint owners)', url: 'https://ielts.org/about-ielts' },
      { label: 'IELTS — updates to IELTS test delivery (paper-based test withdrawn from mid-2026)', url: 'https://ielts.org/news-and-insights/updates-to-ielts-test-delivery' },
      { label: 'IELTS — ways to take IELTS (computer, Writing on Paper, IELTS Online)', url: 'https://ielts.org/take-a-test/why-choose-ielts/ways-to-take-ielts' },
      { label: 'IELTS — IELTS Online (Academic only, 18+, not for immigration)', url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-online' },
      { label: 'IELTS — understanding IELTS scoring (0–9 band scale)', url: 'https://ielts.org/organisations/ielts-for-organisations/understanding-ielts-scoring' },
      { label: 'IELTS — who accepts IELTS', url: 'https://ielts.org/take-a-test/why-choose-ielts/who-accepts-ielts' },
      { label: 'IELTS — US test centre fees (USD 285; USD 325 from 1 Oct 2026), ELS Houston', url: 'https://ielts.org/test-centres/els-language-centers-houston' },
      { label: 'IELTS — US test centre fee (USD 330 from 1 Oct 2026; USD 285 before), ELS Cleveland', url: 'https://ielts.org/test-centres/els-cleveland' },
      { label: 'IELTS — IELTS in the USA (test dates and times each month)', url: 'https://ielts.org/ielts-usa' },
      { label: 'IELTS — UK test centre fee (GBP 235), British Council Bristol', url: 'https://ielts.org/test-centres/british-council-bristol-international-house-trust-assessment-ihta' },
      { label: 'IDP IELTS India — IELTS test fee 2026 (INR 19,000; UKVI INR 19,250)', url: 'https://ieltsidpindia.com/information/ielts-test-fee' },
      { label: 'IDP IELTS India — FAQ (available throughout the year)', url: 'https://ieltsidpindia.com/information/faq' },
      { label: 'IDP IELTS Australia — how much does IELTS cost? (AUD 490, 2026)', url: 'https://ielts.com.au/australia/prepare/article-how-much-does-ielts-cost' },
      { label: 'IDP IELTS Australia — who can take IELTS', url: 'https://ielts.com.au/australia/about/what-is-ielts/ielts-faq/who-can-take-ielts' },
      { label: 'British Council IELTS — FAQs (fee varies by location)', url: 'https://takeielts.britishcouncil.org/what-is-ielts/frequently-asked-questions' },
      { label: 'British Council IELTS — how to book (photo ID; consent under 18)', url: 'https://takeielts.britishcouncil.org/book-ielts-test/how-to-book' },
      { label: 'UC Admissions — English language proficiency (IELTS, TOEFL and the Duolingo English Test among the accepted routes)', url: 'https://admission.universityofcalifornia.edu/admission-requirements/first-year-requirements/english-language-proficiency.html' },
    ],
    lastVerified: '2026-09-29',
    // uc-berkeley and ucla added to collegesAccepting on 30 Sep 2026 from the UC
    // Admissions source above; the rest of the record was not re-checked (§5).
    contentUpdated: '2026-09-30',
  },
  {
    id: 'toefl',
    slug: 'toefl',
    shortName: 'TOEFL iBT',
    fullName: 'Test of English as a Foreign Language (Internet-Based Test)',
    region: 'global',
    domain: 'language',
    conductingBody: 'ETS (Educational Testing Service)',
    frequency: 'Offered more than 170 times a year at test centres (Home Edition: 24 hours a day, 4 days a week)',
    mode: 'online',
    duration: 'About 2 hours',
    totalMarks: '1–6 in 0.5 steps (CEFR-aligned, for tests from 21 Jan 2026); until January 2028 score reports also show a comparable 0–120 overall score',
    eligibility: 'No age limit or published prerequisite (the content is at first-year university level); unlimited retakes, but not more than once in any 3-day period',
    websiteUrl: 'https://www.ets.org/toefl',
    costUsd: 'US$170–US$475 by test location (e.g. USA US$270, UK US$260, Canada US$249, India US$173), as listed on ets.org in September 2026, during the 2026–27 testing year; local taxes may be added in some locations',
    descriptionEn:
      'ETS says TOEFL iBT scores are accepted by more than 13,500 universities and other institutions in over 160 countries, including every university in the United States, Canada, the UK, Australia, New Zealand and Ireland. It is taken on computer at a test centre or as the TOEFL iBT Home Edition — the same test at home with a live human proctor; check availability for your location on ets.org. Each university sets its own score requirement: ETS notes that a school which asked for 100 on the old 0–120 scale may now ask for 5 on the 1–6 scale, and one that asked for 80 may ask for 4. Scores are valid for two years from the test date.',
    collegesAccepting: ['mit', 'harvard', 'stanford', 'u-toronto', 'mcgill', 'oxford', 'eth-zurich', 'uc-berkeley', 'ucla'],
    sources: [
      { label: 'ETS — TOEFL iBT test content', url: 'https://www.ets.org/toefl/test-takers/ibt/about/content.html' },
      { label: 'ETS — TOEFL iBT score scale update (Jan 2026)', url: 'https://www.ets.org/toefl/institutions/ibt/score-scale-update.html' },
      { label: 'ETS — TOEFL iBT score reports FAQ', url: 'https://www.ets.org/toefl/test-takers/ibt/faq/score-reports.html' },
      { label: 'ETS — About TOEFL iBT FAQ (acceptance, age policy)', url: 'https://www.ets.org/toefl/test-takers/ibt/faq/about-toefl-ibt.html' },
      { label: 'ETS — TOEFL iBT testing options (test centre dates, Home Edition)', url: 'https://www.ets.org/toefl/test-takers/ibt/about/testing-options.html' },
      { label: 'ETS — TOEFL iBT registration fees by test location', url: 'https://www.ets.org/toefl/test-takers/ibt/register/fees.html' },
      { label: 'ETS — TOEFL iBT Information Bulletin 2026–27 (retake policy) (PDF)', url: 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-bulletin.pdf' },
      { label: 'UC Admissions — English language proficiency (IELTS, TOEFL and the Duolingo English Test among the accepted routes)', url: 'https://admission.universityofcalifornia.edu/admission-requirements/first-year-requirements/english-language-proficiency.html' },
    ],
    lastVerified: '2026-09-29',
    // uc-berkeley and ucla added to collegesAccepting on 30 Sep 2026 from the UC
    // Admissions source above; the rest of the record was not re-checked (§5).
    contentUpdated: '2026-09-30',
  },
  {
    id: 'duolingo',
    slug: 'duolingo-english-test',
    shortName: 'Duolingo',
    fullName: 'Duolingo English Test',
    region: 'global',
    domain: 'language',
    conductingBody: 'Duolingo, Inc.',
    // The /exams listing card cuts frequency at the first '(' — keep the availability caveat before it.
    frequency: 'On demand, online at any time, though not in every country (up to 3 test purchases in any 30-day period; wait for your result before retesting)',
    mode: 'online',
    duration: 'About 1 hour',
    totalMarks: '10–160',
    eligibility:
      "Accepted ID required (a government-issued photo ID, or an official UNHCR refugee or asylum-seeker certificate); under-13s — or anyone below their country's age for parental consent — need a parent's or guardian's permission",
    websiteUrl: 'https://englishtest.duolingo.com',
    // Duolingo publishes no fee page; the price is stated in its own posts and shown at checkout.
    costUsd: 'US$70 per test (stated by Duolingo, Sep 2026); confirm the final price at checkout',
    descriptionEn:
      "A computer-adaptive English test taken online at home on a Windows or Mac computer, with results within two days (within 12 hours with the paid Faster Results option). You need the Duolingo English Test (DET) desktop app, a webcam, a microphone and speakers, and a smartphone as a second camera. Duolingo says the test is accepted by 6,500+ institutions worldwide; acceptance and minimum scores vary by university, programme and level — in Duolingo's own accepting-institutions search, for example, Georgia Tech and the University of Toronto list it for undergraduate admission only — so check each institution's own English-requirements page. The certificate is valid for two years from the test date.",
    // tu-delft and kth list no Duolingo English Test among their accepted English tests.
    // Duolingo's institution search (29 Sep 2026): georgia-tech and u-toronto list it
    // for undergraduate admission only — the description says so; cmu's graduate CS
    // programmes treat it as supplementary. uc-berkeley and ucla: UC Admissions'
    // first-year (undergraduate) English-proficiency page lists it (30 Sep 2026).
    collegesAccepting: ['nyu', 'cmu', 'georgia-tech', 'u-toronto', 'ubc', 'uc-berkeley', 'ucla'],
    sources: [
      { label: 'Duolingo English Test — Understand scoring', url: 'https://englishtest.duolingo.com/scores' },
      { label: 'Duolingo English Test — Test takers', url: 'https://englishtest.duolingo.com/test_takers' },
      { label: 'Duolingo English Test — Terms of Service (test results expiration)', url: 'https://englishtest.duolingo.com/terms_of_service' },
      { label: 'Duolingo English Test — accepting institutions', url: 'https://englishtest.duolingo.com/test_takers/accepting_institutions' },
      { label: 'DET Help Center — test structure', url: 'https://testcenter.zendesk.com/hc/en-us/articles/39104891663245-Test-Structure' },
      { label: 'DET Help Center — how long does it take to receive my results?', url: 'https://testcenter.zendesk.com/hc/en-us/articles/360010859652-How-long-does-it-take-to-receive-my-results' },
      { label: 'DET Help Center — how often can I take the test?', url: 'https://testcenter.zendesk.com/hc/en-us/articles/360011075451-How-often-can-I-take-the-Duolingo-English-Test' },
      { label: 'DET Help Center — accepted identification', url: 'https://testcenter.zendesk.com/hc/en-us/articles/41633131179917-Accepted-Identification' },
      { label: 'DET Help Center — taking the test under 13 (or below the country consent age)', url: 'https://testcenter.zendesk.com/hc/en-us/articles/360056049632-Can-I-take-the-Duolingo-English-Test-if-I-am-under-13-years-old' },
      // Bare article id on purpose: the page names the one country where the test is
      // unavailable, and the record states the fact without naming it (§4.D).
      { label: 'DET Help Center — a country where the test is not available', url: 'https://testcenter.zendesk.com/hc/en-us/articles/48404390966925' },
      { label: 'DET Help Center — devices and operating systems', url: 'https://testcenter.zendesk.com/hc/en-us/articles/5297715242125-What-devices-and-operating-systems-can-I-use-to-take-the-Duolingo-English-Test' },
      { label: 'Duolingo English Test blog — test price (US$70, Sep 2026)', url: 'https://blog.englishtest.duolingo.com/us-engineering-programs-accept-duolingo-english-test/' },
      { label: 'Duolingo English Test blog — setup: secondary camera and desktop app', url: 'https://blog.englishtest.duolingo.com/duolingo-english-test-setup-secondary-camera-room-scan/' },
      { label: 'UC Admissions — English language proficiency (IELTS, TOEFL and the Duolingo English Test among the accepted routes)', url: 'https://admission.universityofcalifornia.edu/admission-requirements/first-year-requirements/english-language-proficiency.html' },
    ],
    lastVerified: '2026-09-29',
    // uc-berkeley and ucla added to collegesAccepting on 30 Sep 2026 from the UC
    // Admissions source above; the rest of the record was not re-checked (§5).
    contentUpdated: '2026-09-30',
  },
  {
    id: 'pte',
    slug: 'pte-academic',
    shortName: 'PTE Academic',
    fullName: 'Pearson Test of English Academic',
    region: 'global',
    domain: 'language',
    conductingBody: 'Pearson',
    frequency: 'Regular test dates at 500+ test centres in over 115 countries (check availability at your nearest centre)',
    // Computer-based, and only at an authorised test centre — never at home.
    mode: 'online',
    duration: 'About 2 hours',
    totalMarks: '10–90',
    eligibility:
      "Pearson publishes no academic prerequisite. Bring a valid passport on test day (other IDs only in the cases Pearson's identification policy lists); under-18s need a parent's or guardian's consent",
    websiteUrl: 'https://www.pearsonpte.com',
    // Priced locally — a single US$ range would need invented exchange rates.
    costUsd: 'Set by country, e.g. USA US$265, UK £230, Canada CA$360, Australia AU$499, India ₹18,900, Germany €270 (Pearson list prices, Sep 2026)',
    descriptionEn:
      "A computer-based English test taken only at an authorised PTE test centre — it cannot be taken at home — with results typically within two business days (sometimes up to five). According to Pearson, it is accepted by 4,000+ universities and colleges worldwide, including virtually all universities in Australia, Canada, New Zealand and the UK and widely across the US, and by Australia's Department of Home Affairs and Immigration New Zealand for visas that require an English test. For UK visas for study below degree level, or at places that are not Higher Education Institutions, Pearson points to the separate PTE Academic UKVI. Each university and visa authority sets its own minimum score. The Score Report is valid for two years from the test date.",
    collegesAccepting: ['u-melbourne', 'u-sydney', 'unsw', 'imperial', 'manchester'],
    sources: [
      { label: 'Pearson — PTE Academic', url: 'https://www.pearsonpte.com/pte-academic' },
      { label: 'Pearson PTE — help centre, scoring', url: 'https://www.pearsonpte.com/help-center/scoring/' },
      { label: 'Pearson PTE — test centres and fees (price finder)', url: 'https://www.pearsonpte.com/test-centers-and-fees/' },
      { label: 'Pearson PTE — help centre, PTE Academic FAQs (score range, institution requirements)', url: 'https://www.pearsonpte.com/help-center/general-faqs/pte-academic/' },
      { label: 'Pearson PTE — identification policy', url: 'https://www.pearsonpte.com/policy-center/identification-policy/' },
      { label: 'Pearson PTE — help centre, booking and managing your test (under-18 consent)', url: 'https://www.pearsonpte.com/help-center/booking-managing-test/' },
      { label: 'Pearson PTE — PTE Academic test taker handbook (PDF)', url: 'https://www.pearsonpte.com/content/dam/ELL/pte/pearsonpte/pdfs/test-taker-handbook-pte-academic.pdf' },
      { label: 'GOV.UK — Student visa: knowledge of English', url: 'https://www.gov.uk/student-visa/knowledge-of-english' },
    ],
    lastVerified: '2026-09-29',
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
    frequency: 'Two sessions a year (JEE (Main) 2026: 21–30 January and 2–9 April 2026)',
    mode: 'online',
    duration: '3 hours (Paper 1, B.E./B.Tech.)',
    totalMarks: '300 (Paper 1: 75 questions; +4 for a correct answer, −1 for a wrong one)',
    eligibility: 'For JEE (Main) 2026: passed Class 12 (or equivalent) in 2024 or 2025, or sitting it in 2026; no age limit. Admission rules are separate — for Paper 1 programmes at the NITs, IIITs and other GFTIs (through JoSAA/CSAB), Class 12 with Physics, Mathematics, a language, one of Chemistry, Biotechnology, Biology or a technical vocational subject, and one other subject, plus at least 75% aggregate (65% for SC, ST and PwD) or a place in the category-wise top 20 percentile of the board.',
    websiteUrl: 'https://jeemain.nta.nic.in',
    costUsd: 'JEE (Main) 2026, per session, one paper, centres in India: ₹1,000 (General, male); ₹900 (Gen-EWS/OBC-NCL, male); ₹800 (female, General/Gen-EWS/OBC-NCL); ₹500 (SC, ST, PwD/PwBD, third gender). Centres outside India: ₹5,000 (General, male). Processing charges and GST are extra',
    descriptionEn:
      'JEE (Main) is the NTA\'s entrance test for undergraduate engineering at the NITs, IIITs, other centrally funded technical institutions and institutions in participating states (Paper 1, B.E./B.Tech.); Paper 2 is for B.Arch. and B.Planning. It is also the eligibility test for JEE (Advanced), the route to the IITs. It runs in two sessions a year, and the better of a candidate\'s two total NTA scores counts for the rank. Paper 1 is a three-hour computer-based test in Physics, Chemistry and Mathematics — 75 questions for 300 marks — offered in 13 languages at centres in India and abroad; seats are then allocated through JoSAA and CSAB.',
    collegesAccepting: ['nit-trichy'],
    sources: [
      // Per-cycle document: the JEE (Main) 2027 bulletin replaces it — re-check dates, fee, eligibility and the admission criteria then.
      { label: 'NTA — JEE (Main) official portal', url: 'https://jeemain.nta.nic.in/' },
      { label: 'NTA — JEE (Main) 2026 Information Bulletin (dates at a glance, fee table, §2.4 pattern, §2.5 duration, §3 eligibility, §5.8.1 NIT+ admission criteria) (PDF)', url: 'https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2025/11/202511021649722475.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'jee-advanced',
    slug: 'jee-advanced',
    shortName: 'JEE Advanced',
    fullName: 'Joint Entrance Examination Advanced',
    region: 'india',
    domain: 'engineering',
    // The 2026 brochure names IIT Roorkee as organising institute, with seven
    // zonal coordinating IITs; it does not describe a rotation, so none is claimed.
    conductingBody: 'IITs (organising institute for 2026: IIT Roorkee)',
    frequency: 'Once a year (2026: 17 May, both papers the same day)',
    mode: 'online',
    duration: '6 hours (2 papers × 3 hours)',
    // Not fixed in advance — the brochure says the marking scheme is given in the
    // paper's instructions. 360 is the 2026 total: the section maxima printed in
    // the two published papers add up to 180 each (read 30 Sep 2026).
    totalMarks: '360 in 2026 (180 per paper); the marking scheme is set in each year’s papers',
    eligibility:
      'Indian nationals and OCI/PIO (I) candidates must be among the top 2,50,000 in the JEE (Main) B.E./B.Tech. paper and meet the other conditions (age, the year they first sat Class 12 with Physics, Chemistry and Mathematics, and no earlier IIT admission); foreign nationals and OCI/PIO (F) candidates register directly, without JEE (Main), subject to their own age and Class 12 conditions. A maximum of two attempts, in two consecutive years.',
    websiteUrl: 'https://jeeadv.ac.in',
    costUsd: 'JEE (Advanced) 2026, centres in India: ₹3,200 for Indian nationals and OCI/PIO (I) candidates (₹1,600 for female, SC, ST and PwD candidates); foreign nationals USD 100 if residing in a SAARC country, USD 200 otherwise. Centres outside India: USD 200–300. Bank and gateway charges are extra',
    descriptionEn:
      'JEE (Advanced) is the entrance exam for undergraduate programmes at the 23 IITs, with seats allocated through JoSAA. Indian candidates must first rank among the top 2,50,000 in JEE (Main); foreign nationals register directly and compete for supernumerary seats, up to 10% of each programme’s seats. It is a computer-based test of two compulsory three-hour papers, each with Physics, Chemistry and Mathematics sections.',
    collegesAccepting: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur'],
    sources: [
      { label: 'JEE Advanced — official site (organising IIT)', url: 'https://jeeadv.ac.in/' },
      // Per-cycle document: the 2027 brochure replaces it — re-check the fee, eligibility and schedule then.
      { label: 'JEE (Advanced) 2026 Information Brochure (§1 IITs, §9 schedule, §11 eligibility, §13 registration fee, §17 papers) (PDF)', url: 'https://jeeadv.ac.in/documents/IBEnglish_2026.pdf' },
      { label: 'JEE (Advanced) 2026 — Paper 1 (section maximum marks) (PDF)', url: 'https://jeeadv.ac.in/documents/p1_english.pdf' },
      { label: 'JEE (Advanced) 2026 — Paper 2 (section maximum marks) (PDF)', url: 'https://jeeadv.ac.in/documents/p2_english.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'neet-ug',
    slug: 'neet-ug',
    shortName: 'NEET UG',
    fullName: 'National Eligibility cum Entrance Test (Undergraduate)',
    region: 'india',
    domain: 'medicine',
    conductingBody: 'National Testing Agency (NTA)',
    frequency: 'Once a year, in a single shift (NEET (UG) 2026: scheduled for 3 May; NTA cancelled that sitting and held the examination again on 21 June 2026)',
    mode: 'offline',
    duration: '3 hours',
    totalMarks: '720 (180 questions × 4 marks; −1 for a wrong answer)',
    eligibility: 'At least 17 years old on or before 31 December of the exam year; no upper age limit. Class 12 (or equivalent) with Physics, Chemistry, Biology/Biotechnology and English — candidates still sitting Class 12 may take the test but must pass before the first counselling round. To be eligible for admission, a candidate must score at or above the 50th percentile (40th for SC, ST and OBC; 45th for general and Gen-EWS candidates with benchmark disabilities, 40th for SC/ST/OBC candidates with benchmark disabilities).',
    websiteUrl: 'https://neet.nta.nic.in',
    costUsd: 'NEET (UG) 2026: ₹1,700 (General); ₹1,600 (General-EWS/OBC-NCL); ₹1,000 (SC, ST, PwBD/PwD, third gender) for centres in India; ₹9,500 for centres outside India. Processing charges and GST are extra',
    descriptionEn:
      'NEET (UG) is the single uniform entrance test, required by law, for admission to MBBS, BDS, BAMS, BUMS, BSMS and BHMS courses at all medical institutions in India, including AIIMS and JIPMER; its results are also used for B.Sc. (Hons) Nursing and for veterinary (BVSc & AH) seats under the VCI\'s 15% quota. Indian citizens and OCI cardholders who intend to study undergraduate medicine or dentistry abroad must also qualify in it. It is a three-hour pen-and-paper test in a single shift: 180 multiple-choice questions (Physics 45, Chemistry 45, Biology 90) for 720 marks, in 13 languages. The NTA publishes ranks; the MCC counsels for MBBS and BDS seats in the All India quota, AIIMS, JIPMER and central and deemed universities, AACCC for the AYUSH All India quota, and state authorities for state-quota seats.',
    collegesAccepting: ['aiims-delhi'],
    sources: [
      // Per-cycle documents: the NEET (UG) 2027 bulletin replaces them — re-check fee, dates, eligibility and percentiles then.
      { label: 'NTA — NEET (UG) official portal', url: 'https://neet.nta.nic.in/' },
      { label: 'NTA — NEET (UG) 2026 Information Bulletin (dates, fee, pattern, mode, eligibility Ch. 6, counselling Ch. 7, qualifying percentiles Ch. 8) (PDF)', url: 'https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602231394640855.pdf' },
      { label: 'NTA — press release, 12 May 2026: decision on the examination of 3 May 2026 (PDF)', url: 'https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/05/202605122066418251.pdf' },
      { label: 'NTA — press release, 16 July 2026: NEET (UG) 2026 result, examination held on 21 June 2026 (PDF)', url: 'https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/07/20260716477215762.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'cat',
    slug: 'cat',
    shortName: 'CAT',
    fullName: 'Common Admission Test',
    region: 'india',
    domain: 'management',
    // The 2026 bulletin says the IIMs conduct CAT, and the 2026 press release names
    // IIM Indore as this year's conducting IIM; neither describes a rotation, so none is claimed.
    conductingBody: 'IIMs (CAT 2026 conducted by IIM Indore)',
    frequency: 'Once a year (CAT 2026: 29 November, in three sessions)',
    // Computer-based at a test centre — CAT's FAQ stresses it is not taken over the internet.
    mode: 'online',
    duration: '2 hours (40 minutes per section)',
    // CAT publishes no maximum in advance: its FAQ gives the marks per question and
    // says the number of non-MCQ questions cannot be disclosed (read 30 Sep 2026).
    totalMarks: 'Not published in advance — each question carries 3 marks, and a wrong multiple-choice answer costs 1',
    eligibility:
      "Bachelor's degree with at least 50% marks or equivalent CGPA (45% for SC, ST and PwBD candidates), or a CA, CS, CMA or FIAI qualification with the required percentage; final-year students can apply",
    websiteUrl: 'https://iimcat.ac.in',
    costUsd: '₹2,700 (₹1,350 for SC, ST and PwBD candidates) — CAT 2026; paid once, whatever the number of institutes',
    descriptionEn:
      'CAT is the admission test for the management programmes of the 22 Indian Institutes of Management (IIMs). Non-IIM institutions registered for CAT may also use its scores. It has three sections, 40 minutes each: Verbal Ability and Reading Comprehension, Data Interpretation and Logical Reasoning, and Quantitative Ability. It is computer-based and taken at test centres in about 170 cities. Each IIM sets its own cut-offs and selection process, which can also weigh academic record and work experience.',
    collegesAccepting: ['iim-ahmedabad', 'iim-bangalore'],
    sources: [
      { label: 'IIM CAT — official site (CAT 2026 dates; FAQs: fee, computer-based test, sections, marking)', url: 'https://iimcat.ac.in/' },
      // Per-cycle documents: the CAT 2027 bulletin replaces them — re-check the fee, eligibility and dates then.
      { label: 'IIMs — CAT 2026 Information Bulletin (participating IIMs, eligibility, fee, test cities) (PDF)', url: 'https://cdn.digialm.com/per/g06/pub/32842/EForms/image/CAT2026/CAT2026InformationBulletin_26-07-2026_V2.pdf' },
      { label: 'IIMs — CAT 2026 press release (IIM Indore conducting; 120 minutes, 40 per section) (PDF)', url: 'https://cdn.digialm.com/per/g06/pub/32842/EForms/image/CAT2026/CAT_2026_Press_Release_26-07-2026.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'clat',
    slug: 'clat',
    shortName: 'CLAT',
    fullName: 'Common Law Admission Test',
    region: 'india',
    domain: 'law',
    conductingBody: 'Consortium of National Law Universities',
    frequency: 'Once a year (CLAT 2027: Sunday 6 December 2026, 2–4 p.m.)',
    mode: 'offline',
    duration: '2 hours',
    totalMarks: '120 (UG and PG papers: 120 one-mark questions; 0.25 deducted per wrong answer)',
    eligibility: 'UG: 10+2 or equivalent with at least 45% marks (40% for SC, ST and PwD); candidates sitting the qualifying exam in March/April 2027 may apply. PG: LL.B. or equivalent with at least 50% marks (45% for SC, ST and PwD); candidates sitting the qualifying exam in 2027 may apply. No upper age limit. Open to Indian nationals, NRIs and OCI/PIO cardholders; foreign nationals are not eligible to sit CLAT (CLAT 2027).',
    websiteUrl: 'https://consortiumofnlus.ac.in',
    costUsd: 'CLAT 2027: ₹4,000 for General and OBC candidates; ₹3,500 for SC, ST, BPL and PwD candidates. Bank charges are extra; the fee is non-refundable',
    descriptionEn:
      'CLAT is the Consortium of National Law Universities\' admission test for the five-year integrated LL.B. and the LL.M. programmes at its participating universities — 26 NLUs for CLAT 2027. It is a two-hour pen-and-paper test of 120 one-mark multiple-choice questions, with 0.25 marks deducted for a wrong answer; the UG paper covers English Language, Current Affairs including General Knowledge, Legal Reasoning, Logical Reasoning and Quantitative Techniques. Indian nationals, NRIs and OCI/PIO cardholders can sit it; foreign nationals cannot and apply to each NLU directly. NLU Delhi is not a participating university — it admits through its own test, AILET.',
    collegesAccepting: [],
    sources: [
      // Per-cycle pages: the Consortium rebuilds under a new /clat-YYYY/ path each year and deletes old trees — repoint them for CLAT 2028.
      { label: 'Consortium of NLUs — official site (members; CLAT 2027 notices)', url: 'https://consortiumofnlus.ac.in/' },
      { label: 'Consortium of NLUs — CLAT 2027 press release, 22 July 2026 (date and application window) (PDF)', url: 'https://s3.ap-south-1.amazonaws.com/files2027.consortiumofnlus.ac.in/sites/clat2027.consortiumofnlus.ac.in/entity-uploads/notification/attachment/Attachment_720cecc826d8402ab20d3772002b5c77_36562.pdf' },
      { label: 'CLAT 2027 — UG general instructions (mode, date, nationality, application fee)', url: 'https://consortiumofnlus.ac.in/clat-2027/ug-instructions.html' },
      { label: 'CLAT 2027 — UG eligibility', url: 'https://consortiumofnlus.ac.in/clat-2027/ug-eligibility.html' },
      { label: 'CLAT 2027 — PG eligibility', url: 'https://consortiumofnlus.ac.in/clat-2027/pg-eligibility.html' },
      { label: 'CLAT 2027 — UG question paper format', url: 'https://consortiumofnlus.ac.in/clat-2027/ug-question-format.html' },
      { label: 'CLAT 2027 — PG question paper format', url: 'https://consortiumofnlus.ac.in/clat-2027/pg-question-format.html' },
      { label: 'CLAT 2027 — participating universities', url: 'https://consortiumofnlus.ac.in/clat-2027/participating_universities.html' },
      { label: 'CLAT 2027 — FAQs (programmes covered)', url: 'https://consortiumofnlus.ac.in/clat-2027/FAQs.html' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ailet',
    slug: 'ailet',
    shortName: 'AILET',
    fullName: 'All India Law Entrance Test',
    region: 'india',
    domain: 'law',
    conductingBody: 'National Law University Delhi',
    frequency: 'Once a year (AILET 2027: Sunday 13 December 2026, 2–4 p.m.)',
    mode: 'offline',
    duration: '2 hours',
    totalMarks: '150 for B.A.LL.B. (Hons.); 100 for LL.M. (one-mark questions; 0.25 deducted per wrong answer)',
    eligibility: 'B.A.LL.B. (Hons.): 10+2 or equivalent with 45% marks (42% for OBC, 40% for SC/ST); candidates sitting Class 12 in 2027 may apply. LL.M.: LL.B. or equivalent with 50% marks (45% for SC/ST and persons with disabilities); final-year LL.B. candidates in 2027 may apply. No minimum or maximum age. Foreign nationals and OCI/PIO candidates are exempt from AILET and are admitted directly on merit (65% in the qualifying examination for B.A.LL.B.).',
    websiteUrl: 'https://nationallawuniversitydelhi.in',
    costUsd: 'AILET 2027: ₹3,000; ₹1,000 for SC/ST candidates and persons with disabilities; SC/ST and women candidates below the poverty line pay no fee',
    descriptionEn:
      'AILET is National Law University Delhi\'s own admission test for its five-year B.A.LL.B. (Hons.) and one-year LL.M. programmes; NLU Delhi is not among the universities that admit through CLAT. For 2027–28 it fills 110 B.A.LL.B. (Hons.) and 70 LL.M. seats on AILET merit, plus 5 seats per programme each for foreign nationals and OCI/PIO candidates, who are admitted directly on merit without the test. It is a two-hour pen-and-paper (OMR) test: the B.A.LL.B. paper has 150 one-mark multiple-choice questions (English Language 50, Current Affairs and General Knowledge 30, Logical Reasoning 70) and the LL.M. paper 100 questions on law.',
    collegesAccepting: ['nlu-delhi'],
    sources: [
      // Per-cycle documents: all are AILET 2027 — re-check for AILET 2028 (older cycles move to year subdomains).
      { label: 'NLU Delhi — AILET 2027 admission portal (important dates)', url: 'https://nationallawuniversitydelhi.in/' },
      { label: 'NLU Delhi — AILET 2027 Notification, 23 July 2026 (programmes, date) (PDF)', url: 'https://nationallawuniversitydelhi.in/notification/AILET_2027.pdf' },
      { label: 'NLU Delhi — AILET 2027 Admission Notice, 7 Aug 2026 (eligibility, seats, fee) (PDF)', url: 'https://nationallawuniversitydelhi.in/notification/Admision%20Notice_AILET%202027.pdf' },
      { label: 'NLU Delhi — AILET 2027 FAQ (mode, duration, age, fee)', url: 'https://nationallawuniversitydelhi.in/faq.html' },
      { label: 'NLU Delhi — AILET 2027 B.A.LL.B. (Hons.) test pattern', url: 'https://nationallawuniversitydelhi.in/ballb/exam-details.html' },
      { label: 'NLU Delhi — AILET 2027 LL.M. test pattern', url: 'https://nationallawuniversitydelhi.in/llm/exam-details.html' },
      { label: 'National Law University Delhi — official site (links Admissions to the AILET portal)', url: 'https://nludelhi.ac.in/' },
      { label: 'Consortium of NLUs — CLAT 2027 participating universities (NLU Delhi not listed)', url: 'https://consortiumofnlus.ac.in/clat-2027/participating_universities.html' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'gate',
    slug: 'gate',
    shortName: 'GATE',
    fullName: 'Graduate Aptitude Test in Engineering',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'IISc and seven IITs, for the National Coordination Board (Ministry of Education); GATE 2027 organising institute: IIT Madras',
    frequency: 'Once a year (GATE 2027: 6, 7, 13, 14, 20 and 21 February 2027, in forenoon and afternoon sessions)',
    mode: 'online',
    duration: '3 hours',
    totalMarks: '100 per test paper (65 questions); the scorecard also reports a GATE score computed from the marks',
    eligibility: 'Currently in the third or a higher year of any undergraduate degree, or holding any government-approved degree, in Engineering, Technology, Architecture, Science, Commerce, Arts or Humanities; applicants with degrees from outside India must be in the third or a higher year of, or have completed, a bachelor\'s degree of at least three years (GATE 2027).',
    websiteUrl: 'https://gate2027.iitm.ac.in',
    costUsd: 'GATE 2027, per test paper: ₹2,000 for all other candidates, including foreign nationals (₹2,500 in the extended period); ₹1,000 for female, SC, ST and PwD candidates (₹1,500 in the extended period). Two papers cost twice as much; bank charges are extra',
    descriptionEn:
      'GATE tests undergraduate-level subjects in Engineering, Technology, Architecture, Science, Commerce, Arts and Humanities across 30 test papers. Qualified candidates can seek admission, with possible financial assistance, to master\'s and direct doctoral programmes in Engineering, Technology and Architecture and to doctoral programmes at institutions supported by the Ministry of Education; some institutions also use GATE scores for admission without that assistance, and several public sector undertakings — BHEL, NTPC and ONGC among them — have used them for recruitment. Admission and hiring follow each institution\'s and employer\'s own criteria. It is a three-hour computer-based test held only at centres in India (GATE 2027 has no international centres), and a score is valid for three years from the date the results are announced.',
    collegesAccepting: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur', 'nit-trichy'],
    sources: [
      // Per-cycle: the organising IIT and its site change each cycle — re-check the site, brochure, fee and dates for GATE 2028.
      { label: 'GATE 2027 — official site (organising institute: IIT Madras)', url: 'https://gate2027.iitm.ac.in/' },
      { label: 'GATE 2027 Information Brochure, revised 27 Sep 2026 (§4 pattern, §5 about GATE and administration, §6.4.1 fee and centres, §8 score and validity) (PDF)', url: 'https://gate2027ib.iitm.ac.in/GATE2027-IB.pdf' },
      { label: 'GATE 2027 — eligibility criteria', url: 'https://gate2027.iitm.ac.in/eligibility_criteria' },
      { label: 'GATE 2027 — application fees', url: 'https://gate2027.iitm.ac.in/application_fees' },
      { label: 'GATE 2027 — important dates', url: 'https://gate2027.iitm.ac.in/important_dates' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'cuet-ug',
    slug: 'cuet-ug',
    shortName: 'CUET UG',
    fullName: 'Common University Entrance Test (Undergraduate)',
    region: 'india',
    domain: 'undergraduate-admission',
    conductingBody: 'National Testing Agency (NTA)',
    // The /exams cards cut frequency at the first '(' — the cycle detail stays inside it.
    frequency: 'One test window for each academic year (CUET (UG) 2026 was held from 11 to 31 May and on 6–7 June 2026)',
    mode: 'online',
    duration: '60 minutes per test paper; a candidate may take up to five papers (CUET (UG) 2026)',
    totalMarks: '50 compulsory multiple-choice questions per test paper: +5 for each correct answer, −1 for each incorrect answer, 0 if unanswered. Marks from different shifts are converted to NTA scores (CUET (UG) 2026)',
    eligibility:
      'Passed Class 12 (or equivalent) or appearing in it in 2026; there is no age limit for the test. Each university applies its own age, subject, minimum-mark and year-of-passing rules for its programmes.',
    websiteUrl: 'https://cuet.nta.nic.in',
    costUsd: '₹1,000 for up to three subjects plus ₹400 for each additional subject (General/UR, CUET (UG) 2026); ₹900 + ₹375 (OBC-NCL/EWS); ₹800 + ₹350 (SC/ST/PwD/PwBD/third gender); ₹4,500 + ₹1,800 at centres outside India. Bank processing charges and GST are extra.',
    descriptionEn:
      'CUET (UG) is a computer-based entrance test conducted by the National Testing Agency (NTA) for admission to undergraduate programmes at India\'s central universities and at participating state, deemed-to-be and private universities. For CUET (UG) 2026 a candidate could choose up to five of 37 subjects — 13 languages, 23 domain subjects and a General Aptitude Test. Domain subjects follow the NCERT syllabus, and question papers were offered in 13 languages at centres in India and in 15 cities abroad. NTA runs the test and publishes scores; each university sets its own programme eligibility and subject requirements and draws up its own merit list. The NTA score is valid for admission in that academic year only. Subjects, pattern, fees and dates are set afresh in each year\'s information bulletin.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: the CUET (UG) 2027 bulletin replaces them — re-check the fee, pattern and dates then.
      { label: 'NTA — CUET (UG) official site', url: 'https://cuet.nta.nic.in' },
      { label: 'NTA — CUET (UG) 2026 Information Bulletin (fees, pattern, eligibility, §12 scores)', url: 'https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/01/202601031633478370.pdf' },
      { label: 'NTA — press release on the conduct of CUET (UG) 2026 (7 June 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/06/20260608323708178.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'mht-cet',
    slug: 'mht-cet',
    shortName: 'MHT CET',
    fullName: 'Common Entrance Test (State CET Cell, Maharashtra)',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'State Common Entrance Test Cell, Government of Maharashtra',
    frequency: 'Two attempts per admission year: in 2026 the PCM group was held 11–20 April and 12–21 May (excluding 16–17 May), and the PCB group 21–26 April and 10–11 May. A candidate who sits both attempts is ranked on the better total percentile.',
    mode: 'online',
    duration: '180 minutes per group: 90 minutes for Physics and Chemistry, then 90 minutes for Mathematics (PCM) or Biology (PCB)',
    totalMarks: 'Three 100-mark papers: Mathematics (50 questions, 2 marks each), Physics & Chemistry (100 questions, 1 mark each) and Biology (100 questions, 1 mark each). The PCM group sits Mathematics plus Physics & Chemistry; the PCB group sits Physics & Chemistry plus Biology. No negative marking; results are published as percentiles.',
    eligibility:
      'Indian nationality; passed or appearing in HSC/Class 12 (or equivalent); no age limit. Candidates apply under a Maharashtra State, All India or minority candidature type. NRI, OCI/PIO and foreign-national candidates are exempt from the test. All India candidates may use a JEE (Main) score for B.E./B.Tech, which the CET Cell prefers over MHT-CET. Subject and minimum-mark rules for each course are set in the CET Cell\'s admission (CAP) information brochure.',
    websiteUrl: 'https://cetcell.mahacet.org',
    costUsd: '₹1,300 per group for one attempt (General/Open, Outside Maharashtra State and J&K migrant candidates) or ₹1,000 (Maharashtra reserved categories, PwD, orphan and transgender candidates); ₹2,600 / ₹2,000 for both attempts (MHT-CET 2026; payment service charges extra)',
    descriptionEn:
      'MHT-CET is the computer-based common entrance test conducted by Maharashtra\'s State Common Entrance Test Cell for first-year admission to engineering and technology, pharmacy (B.Pharm and Pharm.D), planning and agriculture-education degree courses in the state. Candidates take the PCM group (Physics, Chemistry, Mathematics), the PCB group (Physics, Chemistry, Biology) or both, with questions in English, Marathi or Urdu. Engineering admission generally needs the PCM group; a PCB score qualifies only for a short list of courses such as agricultural engineering and biotechnology. Questions follow Maharashtra SCERT syllabi, with about 20% weightage for Class 11 and 80% for Class 12. There is no negative marking, and results are published as percentiles. In 2026 each group could be taken twice, and the better total percentile was used in the 2026–27 admission process. Seats are allotted through the CET Cell\'s Centralised Admission Process (CAP). Pattern, dates and fees are set in each year\'s information brochure.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: re-check them against the MHT-CET 2027 brochures (the two-attempt system may change).
      { label: 'State Common Entrance Test Cell, Maharashtra — official site', url: 'https://cetcell.mahacet.org' },
      { label: 'MHT-CET 2026 Information Brochure (Technical Education courses, updated 11 Apr 2026)', url: 'https://cetcell.mahacet.org/wp-content/uploads/2023/12/MHT-CET-2026-Information-Brochure-Updated-on-11.04.2026.pdf' },
      { label: 'MHT-CET 2026 syllabus and marking scheme', url: 'https://cetcell.mahacet.org/wp-content/uploads/2023/12/Syllabus-Technical-2026.pdf' },
      { label: 'MHT-CET 2026 Information Brochure (Agriculture Education courses)', url: 'https://cetcell.mahacet.org/wp-content/uploads/2023/12/AGRI_MHT_CET_2026_IB.pdf' },
      { label: 'State CET Cell — final CET 2026 schedule (16 Mar 2026)', url: 'https://cetcell.mahacet.org/wp-content/uploads/2023/12/Technical-Education-CET-final-dates_2026.pdf' },
      { label: 'State CET Cell — second-attempt exam dates (26 Apr 2026)', url: 'https://cetcell.mahacet.org/wp-content/uploads/2026/04/PUBLIC-NOTICE-for-MBA_MHT_Second-Attmp.-Exam-Date-1.pdf' },
      { label: 'State CET Cell — CAP information brochure, UG and PG technical courses 2026-27', url: 'https://cappublicdocs2026.blob.core.windows.net/documents/PublicPages/Information_Brochure_UG_PG_2026_27_dt_2_7_2026_DHG_1_Display.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'kcet',
    slug: 'kcet',
    shortName: 'KCET',
    fullName: 'Karnataka Common Entrance Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'Karnataka Examinations Authority (KEA)',
    frequency: 'Once a year — CET-2026 was scheduled for 23–24 April 2026, with a Kannada language test on 22 April for Horanadu and Gadinadu Kannadiga candidates',
    mode: 'offline',
    duration: '80 minutes per subject paper (Physics, Chemistry, Mathematics, Biology), over two days',
    totalMarks: '60 marks per subject paper: 60 one-mark multiple-choice questions, no negative marking. Candidates take the subjects their course needs — Physics, Chemistry and Mathematics for engineering.',
    eligibility:
      'Government seats are open only to citizens of India who have passed or are appearing in 2nd PUC/Class 12 (or equivalent). For engineering, English must be one of the languages, with at least 45% aggregate in Physics and Mathematics plus one of Chemistry, Biotechnology, Biology, Electronics or Computer (40% for Karnataka SC, ST and Category-1, 2A, 2B, 3A and 3B candidates). Government seats are for candidates who meet a \'Karnataka candidate\' clause of the CET-2006 Admission Rules — for example, at least seven academic years of study in Karnataka between 1st standard and 2nd PUC/12th — and for wards of Jammu & Kashmir migrants.',
    websiteUrl: 'https://cetonline.karnataka.gov.in/kea',
    descriptionEn:
      'KCET (the Karnataka Common Entrance Test, listed by KEA as UGCET) is conducted by the Karnataka Examinations Authority (KEA) to determine eligibility and merit for government-quota seats in first-year engineering and technology, farm science (agriculture and allied), veterinary science, B.Sc. Nursing, naturopathy & yoga, B.Pharm and Pharm.D courses at government, university, aided and private institutions in Karnataka. It is a pen-and-paper (OMR) test of four 60-mark papers — Physics, Chemistry, Mathematics and Biology — held over two days, with no negative marking and questions based on Karnataka\'s first- and second-year PUC syllabi. The engineering rank gives equal weight to CET and Class 12 marks in Physics, Chemistry and Mathematics. Architecture seats use NATA scores and medical, dental and AYUSH seats use NEET (UG), but those applicants also register with KEA for its online counselling, through which seats are allotted. Pattern, dates and fees are set in KEA\'s information bulletin each year.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the CET-2027 bulletin replaces it. The bulletin states no application-fee amount, so no fee is given.
      { label: 'Karnataka Examinations Authority (KEA) — official site', url: 'https://cetonline.karnataka.gov.in/kea/' },
      { label: 'KEA — CET-2026 E-Information Bulletin-1 (English, 16 Jan 2026)', url: 'https://cetonline.karnataka.gov.in/keawebentry456/ugcet2026/information_bulletin_1_ugcet_2026_17012026english.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'wbjee',
    slug: 'wbjee',
    shortName: 'WBJEE',
    fullName: 'West Bengal Joint Entrance Examination',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'West Bengal Joint Entrance Examinations Board (WBJEEB)',
    frequency: 'Once a year — WBJEE-2026 was scheduled for Sunday 24 May 2026',
    mode: 'offline',
    duration: 'Two papers on one day: Paper I (Mathematics) 11:00 a.m.–1:00 p.m.; Paper II (Physics & Chemistry) 2:00–4:00 p.m.',
    totalMarks: 'Paper I: Mathematics, 75 questions, 100 marks. Paper II: Physics and Chemistry, 40 questions and 50 marks each. Single-correct questions carry negative marking (−¼ on 1-mark and −½ on 2-mark questions); multiple-correct 2-mark questions carry none.',
    eligibility:
      'Citizen of India, or OCI (OCI candidates are eligible only for unreserved All-India-quota seats). Must have passed Class 12 (10+2) or equivalent before 2026 or be appearing in 2026, and be at least 17 on 31 December 2026; there is no upper age limit except 25 for degree-level marine engineering. Engineering admission follows AICTE\'s subject rules, with at least 45% in the three qualifying subjects (40% for SC, ST, OBC-A, OBC-B and PwD) and at least 30% in English. West Bengal domicile is required for, among others, seats in government-aided colleges, reserved-category seats and 90% of Jadavpur University\'s general seats.',
    websiteUrl: 'https://wbjeeb.nic.in',
    costUsd: '₹500 (General, male), ₹400 (General, female), ₹300 (General, third gender); ₹400 / ₹300 / ₹200 for SC, ST, OBC-A, OBC-B, EWS, PwD and TFW candidates (male / female / third gender). WBJEE-2026; no bank service charges.',
    descriptionEn:
      'WBJEE is the West Bengal state entrance test conducted annually by the West Bengal Joint Entrance Examinations Board (WBJEEB) for admission to undergraduate engineering and technology, pharmacy and architecture courses at universities and institutes in West Bengal. It is a pen-and-paper (OMR) test of two papers — Paper I (Mathematics) and Paper II (Physics and Chemistry) — with multiple-choice questions in three categories, some with negative marking. Candidates who take both papers receive a General Merit Rank, used for engineering, technology and architecture (and pharmacy at Jadavpur University), and a Pharmacy Merit Rank; candidates who take only Paper II are ranked for pharmacy only. Seats are allotted through WBJEEB\'s online counselling. Pattern, fees and dates are set in each year\'s information bulletin.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: the WBJEE-2027 bulletin replaces them.
      { label: 'West Bengal Joint Entrance Examinations Board (WBJEEB) — official site', url: 'https://wbjeeb.nic.in' },
      { label: 'WBJEEB — Information Bulletin of WBJEE-2026', url: 'https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2026/03/202603101506582412.pdf' },
      { label: 'WBJEEB — tentative schedule of 2026 examinations (13 Mar 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2026/03/20260313216752680.pdf' },
      { label: 'WBJEEB — Common Online Decentralised Counselling notification 2026 (1 Sep 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2026/09/202609011701958807.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ap-eapcet',
    slug: 'ap-eapcet',
    shortName: 'AP EAPCET',
    fullName: 'Andhra Pradesh Engineering, Agriculture & Pharmacy Common Entrance Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'JNTU Kakinada, on behalf of APSCHE',
    frequency: 'Once a year — AP EAPCET 2026: engineering stream 12–15 and 18 May 2026; agriculture & pharmacy stream 19–20 May 2026',
    mode: 'online',
    duration: '3 hours',
    totalMarks: '160 multiple-choice questions, 1 mark each, no negative marking. Engineering: Mathematics 80, Physics 40, Chemistry 40. Agriculture & pharmacy: Biology 80 (Botany 40, Zoology 40), Physics 40, Chemistry 40. The rank combines normalised test marks (75%) with Intermediate group-subject marks (25%); a rank also needs 25% of the maximum marks considered for ranking (no minimum for SC/ST candidates).',
    eligibility:
      'Indian nationality, or Persons of Indian Origin (PIO) and Overseas Citizen of India (OCI) card holders. Candidates must belong to Andhra Pradesh and meet the state\'s local/non-local rules for 2026-27. They must have passed or be appearing in Intermediate (10+2) with the required subjects — Mathematics, Physics and Chemistry for engineering — or a Diploma in Engineering, with at least 45% in those subjects (40% for reserved categories). Some courses, such as B.Tech Dairy Technology and Agricultural Engineering, also have age limits.',
    websiteUrl: 'https://cets.apsche.ap.gov.in',
    costUsd: '₹800 (open category), ₹750 (BC), ₹700 (SC/ST) registration fee for AP EAPCET 2026; late fees apply after 24 March 2026',
    descriptionEn:
      'AP EAPCET (earlier held as AP EAMCET) is the Andhra Pradesh state entrance test conducted by JNTU Kakinada on behalf of the Andhra Pradesh State Council of Higher Education (APSCHE). It is used for first-year admission in the state to engineering, biotechnology and allied B.Tech courses, to B.Sc. Agriculture and Horticulture, veterinary (B.V.Sc. & A.H.) and fisheries (B.F.Sc.) courses, and to B.Pharm and Pharm.D. It is a computer-based test in English and Telugu, with two streams: engineering, and agriculture & pharmacy. The rank combines normalised test marks (75%) with Intermediate marks in the group subjects (25%), and is valid for admission in that academic year only. Seats are allotted through admission counselling convened by the Commissioner of Technical Education, Andhra Pradesh. Undergraduate medical admission is through NEET (UG), not this test.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: the AP EAPCET 2027 instruction booklets replace them.
      { label: 'AP EAPCET — APSCHE official site', url: 'https://cets.apsche.ap.gov.in' },
      { label: 'AP EAPCET 2026 Instruction Booklet — Engineering (V4)', url: 'https://cets.apsche.ap.gov.in/EAPCET/PDF/APEAPCET2026_Instruction_Booklet_Engineering_V4.pdf' },
      { label: 'AP EAPCET 2026 Instruction Booklet — Agriculture & Pharmacy (V4)', url: 'https://cets.apsche.ap.gov.in/EAPCET/PDF/APEAPCET2026_Instruction_Booklet_Agriculture_Pharmacy_V4.pdf' },
      { label: 'AP EAPCET — About Us (JNTU Kakinada)', url: 'https://cets.apsche.ap.gov.in/EAPCET/EapcetHomePages/AboutUS.aspx' },
      { label: 'NTA — NEET (UG) official site', url: 'https://neet.nta.nic.in' },
    ],
    lastVerified: '2026-09-30',
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
    duration: '3 hours (180 minutes)',
    totalMarks: '160 marks — 160 multiple-choice questions, one mark each, no negative marking (Engineering stream: Mathematics 80, Physics 40, Chemistry 40); ranks use normalised marks, and the qualifying mark is 25% of the maximum (none is prescribed for SC/ST candidates)',
    eligibility:
      'Indian nationals, PIO or OCI card holders who meet Telangana\'s local/unreserved status rules (the 1974 admissions order as amended). Engineering stream: passed or appearing in the final year of Intermediate (10+2) with Mathematics, Physics and Chemistry (or a qualifying diploma), with at least 45% in the qualifying subjects taken together (40% for reserved categories), and at least 16 years old on 31 December of the admission year. The Agriculture & Pharmacy stream has its own subject and age rules (TG EAPCET 2026 booklet).',
    websiteUrl: 'https://eapcet.tgche.ac.in',
    costUsd: '₹900 per stream (₹500 for SC/ST and PH candidates); ₹1,800 to sit both the Engineering and the Agriculture & Pharmacy streams (₹1,000 for SC/ST and PH candidates) — TG EAPCET 2026 registration fee; late fees apply after the normal deadline',
    descriptionEn:
      'TS EAMCET — renamed TG EAPCET from 2024 — is the Telangana state entrance test conducted once a year by Jawaharlal Nehru Technological University Hyderabad (JNTUH) on behalf of the Telangana Council of Higher Education (TGCHE) for admission to undergraduate engineering, agriculture and pharmacy courses in Telangana (including B.Tech, B.Pharm, Pharm-D and B.Sc. Nursing). It is a computer-based test held in several sessions, on a syllabus in line with the Telangana Board of Intermediate Education syllabus. Questions are shown bilingually (English with Telugu, or English with Urdu), and marks are normalised across sessions. Seats are allotted through separate online counselling linked from the official site. MBBS and BDS are not among the courses it covers, and B.Arch applicants are directed to NATA. Pattern, marking and dates are set in the official notification and instruction booklet each year.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents (Doc2026): re-check them for TG EAPCET 2027.
      { label: 'TG EAPCET — official site (TGCHE / JNTUH)', url: 'https://eapcet.tgche.ac.in' },
      { label: 'TG EAPCET — About Us', url: 'https://eapcet.tgche.ac.in/TGEAPCET/AboutUs.aspx' },
      { label: 'TG EAPCET 2026 — detailed notification', url: 'https://eapcet.tgche.ac.in/TGEAPCET/Doc2026/Detailed%20Notification-2026.pdf' },
      { label: 'TG EAPCET 2026 — instruction booklet, Engineering stream', url: 'https://eapcet.tgche.ac.in/TGEAPCET/Doc2026/05%20I%20Booklet%20-%20E%20-%202026.pdf' },
      { label: 'TG EAPCET 2026 — Engineering stream syllabus', url: 'https://eapcet.tgche.ac.in/TGEAPCET/Doc2026/Syllabus-E.pdf' },
      { label: 'TG EAPCET — admission and counselling links', url: 'https://eapcet.tgche.ac.in/TGEAPCET/Admission.aspx' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'keam',
    slug: 'keam',
    shortName: 'KEAM',
    fullName: 'Kerala Engineering Architecture and Medical',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'Commissioner for Entrance Examinations (CEE), Kerala',
    frequency: 'Once a year',
    mode: 'online',
    duration: '180 minutes (Engineering paper); the separate Pharmacy paper is 90 minutes',
    totalMarks: 'Engineering paper: 150 multiple-choice questions (Mathematics 75, Physics 45, Chemistry 30), four marks per correct answer and one mark deducted per wrong answer; the entrance score is normalised to 300 and added to normalised Class 12 marks in Mathematics, Physics and Chemistry (also out of 300) for an engineering rank index out of 600',
    eligibility:
      'Indian citizens (OCI/PIO card holders are treated at par for admission, but without reservation or fee concession), classed as Keralite or Non-Keralite (Category I or II) for seat eligibility. Engineering: passed (or appearing, provisionally) the Kerala Higher Secondary examination or an equivalent with Physics and Mathematics, plus Chemistry (or, if not studied, Computer Science, Biotechnology or Biology), with at least 45% in the three subjects together (40% for SC/ST/SEBC/PD candidates); at least 17 years old on 31 December 2026, with no upper age limit (KEAM 2026 prospectus).',
    websiteUrl: 'https://cee.kerala.gov.in',
    costUsd: '₹925 for Engineering (₹400 for SC candidates; no fee for ST candidates) — KEAM 2026 prospectus, clause 7.2; other streams are listed separately in the same clause, and choosing the UAE exam centre adds ₹16,000',
    descriptionEn:
      'KEAM is the Kerala state admission process for professional undergraduate courses, run by the Commissioner for Entrance Examinations (CEE), Government of Kerala. The Engineering entrance, and a separate Pharmacy entrance for B.Pharm, are computer-based tests held in several sessions and set at the standard of the higher secondary examination. Engineering ranks give equal weight to the normalised entrance score and to normalised Class 12 marks in Mathematics, Physics and Chemistry. Seats are allotted through the Centralised Allotment Process (CAP). Architecture ranks give equal weight to NATA and qualifying-examination marks, and medical and allied courses (such as MBBS, BDS, AYUSH, agriculture and veterinary) use NEET-UG ranks. Pattern, marking and dates are set in the prospectus each year.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the KEAM 2027 prospectus replaces it.
      { label: 'Commissioner for Entrance Examinations (CEE), Kerala — official site', url: 'https://cee.kerala.gov.in' },
      { label: 'KEAM 2026 prospectus (CEE Kerala)', url: 'https://cee.kerala.gov.in/keam2026/pdf/Prospectus.pdf' },
    ],
    lastVerified: '2026-09-30',
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
    duration: 'Physics and Chemistry (one combined paper): 120 minutes; Mathematics: 60 minutes; Biology: 60 minutes',
    totalMarks: 'Physics and Chemistry paper: 80 questions, 80 marks; Mathematics: 40 questions, 40 marks; Biology: 40 questions, 40 marks — one mark per correct answer and 0.25 deducted per wrong answer',
    eligibility:
      'Passed or appearing in Class 12 Science: from the Gujarat Secondary and Higher Secondary Education Board, or from CBSE or CISCE through a recognised school in Gujarat, or as otherwise eligible under the admission committee\'s rules (for example, children of Gujarat-origin government officials posted in other states). Science groups: A (Physics, Chemistry, Mathematics), B (Physics, Chemistry, Biology) or AB (all four) (GUJCET 2026 booklet).',
    websiteUrl: 'https://www.gsebeservice.com/',
    costUsd: '₹350 — GUJCET 2026 examination fee, as stated in the GSEB information booklet',
    descriptionEn:
      'GUJCET (Gujarat Common Entrance Test) is conducted by the Gujarat Secondary and Higher Secondary Education Board (GSEB) for admission to degree engineering and degree/diploma pharmacy courses in Gujarat. It is an offline, OMR-based multiple-choice test with a combined Physics and Chemistry paper plus a Mathematics and/or Biology paper. It follows the NCERT-based syllabus GSEB adopts for Class 12 Science, and papers are offered in Gujarati, Hindi and English. The Admission Committee for Professional Courses (ACPC), Gujarat, prepares the merit list from Class 12 theory percentile in Physics, Chemistry and Mathematics/Biology together with the GUJCET percentile, with weightages set in its admission rules; ACPC also publishes a separate JEE Main (All India) seat matrix. Pattern, marking and dates are set by GSEB each year.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the GUJCET 2027 booklet replaces it.
      { label: 'Gujarat Secondary & Higher Secondary Education Board (GSEB) — official site', url: 'https://www.gseb.org' },
      { label: 'GUJCET 2026 information booklet (English), GSEB', url: 'https://gseb.org/GUJCETBooklet(English).pdf' },
      { label: 'GSEB e-service portal — GUJCET notices', url: 'https://www.gsebeservice.com/' },
      { label: 'Admission Committee for Professional Courses (ACPC), Gujarat — BE/B.Tech admissions', url: 'https://gujacpc.admissions.nic.in/be-b-tech/' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'bitsat',
    slug: 'bitsat',
    shortName: 'BITSAT',
    fullName: 'Birla Institute of Technology and Science Admission Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'BITS Pilani (Birla Institute of Technology and Science)',
    frequency: 'Two sessions a year (April and May in the 2026 cycle); a candidate may sit one or both, and the higher score counts',
    mode: 'online',
    duration: '3 hours (no break)',
    totalMarks: '130 multiple-choice questions (Physics 30, Chemistry 30, English proficiency 10, logical reasoning 20, Mathematics or Biology 40), three marks per correct answer and one mark deducted per wrong answer; a candidate who answers all 130 may attempt up to 12 extra questions',
    eligibility:
      'Class 12 (10+2) from a recognised Central or State board or an equivalent, passed in 2025 or taken in 2026 (2024 or earlier is not eligible). At least five subjects are needed, including Physics, Chemistry, Mathematics and a language; Biology may replace Mathematics for B.Pharm., B.E. Environmental & Sustainability Engg. and M.Sc. Biological Sciences. Candidates need at least 75% aggregate in those three subjects and at least 60% in each (BITSAT 2026 brochure).',
    websiteUrl: 'https://admissions.bits-pilani.ac.in',
    costUsd: 'Indian and Nepal centres: ₹3,600 for one session (₹3,100 for female and transgender candidates) or ₹5,600 for both sessions (₹4,600); Dubai centre: ₹7,250 for one session or ₹9,250 for both — BITSAT 2026 brochure',
    descriptionEn:
      'BITSAT is the computer-based admission test BITS Pilani, a deemed-to-be university, conducts for its integrated first-degree programmes — B.E., B.Pharm. and M.Sc. — at the Pilani, K K Birla Goa and Hyderabad campuses. BITS states it is the only route into these programmes and that there is no management quota. The test is in English only and covers Physics, Chemistry, English proficiency, logical reasoning, and Mathematics (or Biology for B.Pharm., B.E. Environmental & Sustainability Engg. and M.Sc. Biological Sciences). The syllabus is published in the brochure, which refers candidates to NCERT textbooks. It is held in two sessions and the higher score counts; the admission merit list uses the BITSAT scores of candidates who meet the Class 12 marks rule. admissions.bits-pilani.ac.in is the official BITS Pilani admission portal. Pattern and dates are set in the brochure each year.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the BITSAT 2027 brochure replaces it.
      { label: 'BITS Pilani — official admission portal', url: 'https://admissions.bits-pilani.ac.in' },
      { label: 'BITSAT 2026 — official page (BITS Pilani)', url: 'https://admissions.bits-pilani.ac.in/BITSAT_LP/index.html' },
      { label: 'BITSAT 2026 brochure (BITS Pilani)', url: 'https://admissions.bits-pilani.ac.in/FD/downloads/BITSAT-2026_Brochure.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'viteee',
    slug: 'viteee',
    shortName: 'VITEEE',
    fullName: 'VIT Engineering Entrance Examination',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'Vellore Institute of Technology (VIT)',
    frequency: 'Once a year; a candidate may take VITEEE only once in a cycle',
    mode: 'online',
    duration: '2 hours 30 minutes',
    totalMarks: '125 multiple-choice questions (Mathematics or Biology 40, Physics 35, Chemistry 35, Aptitude 10, English 5), four marks per correct answer and one mark deducted per wrong answer; no marks for unanswered questions',
    eligibility:
      'Resident or non-resident Indian nationals, OCI or PIO holders (NRI and foreign applicants have separate application routes). For VITEEE 2026, candidates must be born on or after 1 July 2004. They must have completed or be appearing in Class 12 (10+2) or a listed equivalent, with at least 60% aggregate in Mathematics, Physics and Chemistry and at least 50% in Mathematics — or the same with Biology for the programmes open to PCB candidates. The aggregate required is 50% for SC/ST candidates and for those from Jammu & Kashmir, Ladakh and the north-eastern states (viteee.vit.ac.in; VITEEE 2026 prospectus).',
    websiteUrl: 'https://viteee.vit.ac.in',
    costUsd: '₹1,350 application cost (VITEEE 2026, non-refundable); for test centres abroad, the equivalent of USD 90 in INR',
    descriptionEn:
      'VITEEE is the computer-based entrance test Vellore Institute of Technology (VIT) conducts for admission to its B.Tech programmes at VIT Vellore and VIT Chennai (a deemed-to-be university) and at VIT-AP and VIT Bhopal (state private universities), with test centres in India and abroad. The test is in English only and covers Mathematics or Biology, Physics, Chemistry, aptitude and English, on a subject syllabus VIT publishes. Selection is by VITEEE rank through VIT\'s online counselling, where candidates choose a campus and programme. VIT states that Class 12, JEE Main and SAT scores are not considered for B.Tech admission, and that there is no management quota. Pattern and dates are set in the prospectus each year.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the VITEEE 2027 prospectus replaces it.
      { label: 'VITEEE — official site (VIT)', url: 'https://viteee.vit.ac.in' },
      { label: 'VITEEE 2026 prospectus (VIT)', url: 'https://vit.ac.in/files/VITEEE/VITEEE_Prospectus.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'comedk-uget',
    slug: 'comedk-uget',
    shortName: 'COMEDK UGET',
    fullName: 'COMEDK Under Graduate Entrance Test',
    region: 'india',
    domain: 'engineering',
    conductingBody: 'COMEDK (Consortium of Medical, Engineering & Dental Colleges of Karnataka)',
    frequency: 'Once a year (2026: Saturday 9 May, computer-based, possibly in several sessions)',
    mode: 'online',
    duration: 'Not stated in the 2026 brochure or exam page; the session time is printed on the Test Admission Ticket',
    totalMarks: '180 — 180 multiple-choice questions (60 each in Physics, Chemistry and Mathematics), 1 mark each, no negative marking; ranks use percentiles normalised across sessions',
    eligibility:
      'Indian citizens, OCI and PIO candidates who have passed, or are completing, 2nd PUC/Class 12 (10+2) with Physics, Mathematics and English plus Chemistry (or Biotechnology, Biology, Computer Science or Electronics). They need at least 45% aggregate in Physics, Chemistry and Mathematics (40% for SC, ST and OBC candidates of Karnataka), a pass in each subject, and all subjects from one board. Diploma holders are not eligible, as there is no lateral entry. Age follows AICTE/VTU norms.',
    websiteUrl: 'https://www.comedk.org',
    costUsd: '₹1,950 for COMEDK UGET 2026 (₹3,200 if also taking Uni-GAUGE E 2026, held as one combined exam), plus transaction/internet-handling charges; non-refundable. COMEDK lists no category-wise reduction.',
    descriptionEn:
      'COMEDK UGET is the entrance test that COMEDK (the Consortium of Medical, Engineering and Dental Colleges of Karnataka) conducts for first-year B.E./B.Tech admission to the unaided private engineering colleges of KUPECA (the Karnataka Unaided Private Engineering Colleges Association) that take part in its process — around 150 colleges, per the 2026 brochure. It is open to eligible candidates from across India. The computer-based test is in English only. It has 180 multiple-choice questions — 60 each in Physics, Chemistry and Mathematics — based on the CBSE Class 11 and 12 syllabus, with no negative marking. The test may run in several sessions, so ranks use percentile scores normalised across sessions. Seats are allotted through COMEDK\'s centralised single-window counselling. Despite the consortium\'s name, medical and dental admission is through NEET, and B.Arch seats in COMEDK counselling use NATA or JEE scores. A UGET score counts only for that year\'s admissions.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: the UGET 2027 brochure replaces them — re-check the date, fee, eligibility and pattern then.
      { label: 'COMEDK — official site', url: 'https://www.comedk.org' },
      { label: 'COMEDK — UGET 2026 exam page (eligibility, calendar of events, fee, test pattern, FAQs)', url: 'https://www.comedk.org/about-uget-and-notification-2026' },
      { label: 'COMEDK UGET 2026 Information Brochure, notified 3 Feb 2026 (§2 about COMEDK, §3 eligibility, §7 scope and score validity, §12 fee, §16 test pattern, §18.2 normalisation) (PDF)', url: 'https://www.comedk.org/uploads/Information-brochure-2026-version-1.0.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ssc-chsl',
    slug: 'ssc-chsl',
    shortName: 'SSC CHSL',
    fullName: 'Combined Higher Secondary (10+2) Level Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Staff Selection Commission (SSC)',
    frequency: 'Once a year in SSC\'s examination calendar (2026 notice published 7 September 2026; Tier-I and Tier-II dates to be notified)',
    mode: 'online',
    duration: 'Tier-I: 60 minutes. Tier-II: Session-I is 2 hours 15 minutes; Session-II is a skill test (15 minutes, Data Entry Operator posts) or a typing test (10 minutes, LDC/JSA). Candidates eligible for a scribe get more time.',
    totalMarks: 'Tier-I: four parts of 25 questions and 50 marks each, used to shortlist for Tier-II. Tier-II: Sections I and II, 180 marks each, decide merit; Section III (Computer Knowledge Test, 45 marks) and the skill/typing test are qualifying.',
    eligibility:
      'Class 12 (10+2) pass from a recognised board by 7 October 2026 (candidates who have appeared may apply). For Data Entry Operator posts in the Ministry of Consumer Affairs, Food and Public Distribution, SSC and the Ministry of Culture, Class 12 in the Science stream with Mathematics is required. Age 18–27 as on 1 August 2026, with category relaxations per the notice. Open to Indian citizens, and to certain others listed in the notice who hold a Government of India eligibility certificate.',
    websiteUrl: 'https://ssc.gov.in',
    costUsd: '₹100 (CHSL 2026); women and SC, ST, PwBD and Ex-servicemen candidates eligible for reservation are exempt',
    descriptionEn:
      'SSC CHSL is the Staff Selection Commission\'s examination for Group C posts — Lower Division Clerk/Junior Secretariat Assistant and Data Entry Operator (including Grade ‘A’). The posts are in central government ministries, departments and offices, and in various constitutional and statutory bodies and tribunals. It is computer-based and held in two tiers. Tier-I shortlists candidates for Tier-II. The merit list comes from Sections I and II of Tier-II, subject to qualifying its Computer Knowledge Test and the skill test (Data Entry Operators) or typing test (clerk and assistant posts). Wrong answers cost 0.50 marks in Tier-I and 1 mark in Tier-II\'s objective sections. Posts are allotted on merit and the candidate\'s post preferences. Vacancies, dates and cut-offs are set in each year\'s notice.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the CHSL 2027 notice replaces it.
      { label: 'Staff Selection Commission (SSC) — official site', url: 'https://ssc.gov.in' },
      { label: 'SSC — Notice of Combined Higher Secondary (10+2) Level Examination, 2026, published 7 Sep 2026 (§4 nationality, §5 age, §8 qualifications, §10 fee, §13 scheme of examination, §17 mode of selection) (PDF)', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsle_2026.pdf' },
      { label: 'SSC — Tentative Calendar of Examinations 2026-27 (PDF)', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ssc-mts',
    slug: 'ssc-mts',
    shortName: 'SSC MTS',
    fullName: 'Multi-Tasking (Non-Technical) Staff and Havaldar (CBIC & CBN) Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Staff Selection Commission (SSC)',
    frequency: 'Once a year in SSC\'s examination calendar (the 2025 examination\'s computer-based test ran 4–20 February 2026; the 2026 notice had not been published as of 30 September 2026)',
    mode: 'online',
    duration: '90 minutes: two 45-minute sessions on the same day (60 minutes each for candidates eligible for a scribe) — per the 2025 notice',
    totalMarks: 'Session-I: two parts of 20 questions and 60 marks each, no negative marking. Session-II: two parts of 25 questions and 75 marks each, with 1 mark deducted per wrong answer. Both sessions must be qualified, and merit is decided on Session-II alone (2025 notice).',
    eligibility:
      'Class 10 (Matriculation) pass from a recognised board by the cut-off date. Age 18–25 for MTS, or 18–27 for Havaldar and some MTS posts (as on 1 August 2025, with category relaxations per the notice). Havaldar candidates must also pass a Physical Efficiency Test and Physical Standard Test. Open to Indian citizens, and to certain others listed in the notice who hold a Government of India eligibility certificate.',
    websiteUrl: 'https://ssc.gov.in',
    costUsd: '₹100 (2025 notice); women and SC, ST, PwBD and Ex-servicemen candidates eligible for reservation are exempt',
    descriptionEn:
      'SSC MTS is the Staff Selection Commission\'s examination for Multi-Tasking (Non-Technical) Staff — a Group C, non-gazetted, non-ministerial post in central government ministries, departments and offices across states and union territories. It also recruits for Havaldar posts in the Central Board of Indirect Taxes and Customs (CBIC) and the Central Bureau of Narcotics (CBN), under the Ministry of Finance. It is a computer-based examination of two sessions held on the same day. Session-I and the General Awareness section are offered in English, Hindi and 13 regional languages. Both sessions must be qualified, and the merit list comes from Session-II. Havaldar candidates shortlisted on their Session-II scores then take a Physical Efficiency Test and Physical Standard Test run by CBIC and CBN. Vacancies, dates and cut-offs are set in each year\'s notice.',
    collegesAccepting: [],
    sources: [
      // The 2025 notice is still the latest MTS notice (30 Sep 2026) — switch to the 2026 notice once SSC publishes it.
      { label: 'Staff Selection Commission (SSC) — official site', url: 'https://ssc.gov.in' },
      { label: 'SSC — Notice of Multi-Tasking (Non-Technical) Staff and Havaldar (CBIC & CBN) Examination, 2025, published 26 Jun 2025 (§5 nationality, §6 age, §9 qualification, §11 fee, §14 scheme, §18 mode of selection) (PDF)', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_mts_2025.pdf' },
      { label: 'SSC — MTS (NT) and Havaldar Examination 2025: CBE result write-up (exam held 4–20 Feb 2026) (PDF)', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/writeup_mts_03082026.pdf' },
      { label: 'SSC — Notice Board (no 2026 MTS notice as of 30 Sep 2026)', url: 'https://ssc.gov.in/home/notice-board' },
      { label: 'SSC — Tentative Calendar of Examinations 2026-27 (PDF)', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ibps-po',
    slug: 'ibps-po',
    shortName: 'IBPS PO',
    fullName: 'IBPS Common Recruitment Process for Probationary Officers/Management Trainees (CRP PO/MT)',
    region: 'india',
    domain: 'general',
    conductingBody: 'Institute of Banking Personnel Selection (IBPS)',
    frequency: 'Once a year (CRP PO/MT-XVI, for 2027–28 vacancies: Preliminary August 2026, Main October 2026, interviews November–December 2026 — tentative schedule in the notification)',
    mode: 'online',
    duration: 'Preliminary: 60 minutes; Main: 3 hours 10 minutes (160 minutes of objective tests plus a 30-minute descriptive paper)',
    totalMarks: 'Preliminary: 100 (each of the three tests must be qualified). Main: 200 (objective) plus 25 (descriptive). Interview: 100. Final merit weighs the Main exam and the interview 80:20. A quarter of a question\'s marks is deducted for each wrong objective answer.',
    eligibility:
      'Bachelor\'s degree in any discipline, with the result declared by the registration closing date (21 July 2026 for CRP PO/MT-XVI). Age 20–30 as on 1 July 2026, with category relaxations per the notification. Open to Indian citizens, and to certain others listed in the notification who hold a Government of India eligibility certificate.',
    websiteUrl: 'https://www.ibps.in',
    costUsd: '₹850 for most candidates (₹175 for SC, ST and PwBD candidates), inclusive of GST — CRP PO/MT-XVI; bank transaction charges are extra',
    descriptionEn:
      'IBPS PO is the Institute of Banking Personnel Selection\'s Common Recruitment Process for Probationary Officers/Management Trainees in the participating public sector banks listed in each notification (11 for CRP PO/MT-XVI, for 2027–28 vacancies). It has four stages. First comes an online Preliminary exam in English Language, Quantitative Aptitude and Reasoning Ability, and each test must be qualified. Next is an online Main exam of four objective tests plus a descriptive English paper. Shortlisted candidates must then take a non-qualifying Personality Test, followed by an interview conducted by the participating banks. Final merit weighs the Main exam and the interview 80:20. For each wrong objective answer, a quarter of that question\'s marks is deducted. Successful candidates are provisionally allotted to a bank on merit and preference. The process expires one year after provisional allotment, or when a fresh allotment is made, whichever is earlier.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: CRP PO/MT-XVII replaces it.
      { label: 'Institute of Banking Personnel Selection (IBPS) — official site', url: 'https://www.ibps.in' },
      { label: 'IBPS — CRP PO/MT-XVI page (notification, corrigenda, updates)', url: 'https://www.ibps.in/index.php/management-trainees-xvi/' },
      { label: 'IBPS — CRP PO/MT-XVI detailed notification, 1 Jul 2026 (§A participating banks, §B eligibility, §C fee, §D structure incl. Personality Test, §E penalty, §J interview; introduction: validity) (PDF)', url: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ibps-clerk',
    slug: 'ibps-clerk',
    shortName: 'IBPS Clerk',
    fullName: 'IBPS Common Recruitment Process for Customer Service Associates (CRP CSA — clerical cadre)',
    region: 'india',
    domain: 'general',
    conductingBody: 'Institute of Banking Personnel Selection (IBPS)',
    frequency: 'Once a year (CRP CSA-XVI, for 2027–28 vacancies: Preliminary October 2026, Main December 2026 — tentative schedule in the notification)',
    mode: 'online',
    duration: 'Preliminary: 60 minutes; Main: 125 minutes',
    totalMarks: 'Preliminary: 100 (each of the three tests must be qualified). Main: 200, and the Main score alone decides merit (converted to 100 for provisional allotment). A quarter of a question\'s marks is deducted for each wrong answer.',
    eligibility:
      'Bachelor\'s degree in any discipline, with the result by 21 August 2026 for CRP CSA-XVI. Age 20–28 as on 1 August 2026, with category relaxations per the notification. Candidates also need computer literacy and proficiency in the specified local language of the one State or UT they apply for. Open to Indian citizens, and to certain others listed in the notification who hold a Government of India eligibility certificate.',
    websiteUrl: 'https://www.ibps.in',
    costUsd: '₹850 for most candidates (₹175 for SC, ST, PwBD, ESM and DESM candidates), inclusive of GST — CRP CSA-XVI; bank transaction charges are extra',
    descriptionEn:
      'IBPS Clerk is the Institute of Banking Personnel Selection\'s Common Recruitment Process for Customer Service Associates (CRP CSA; earlier rounds were titled CRP Clerical Cadre). It recruits for the participating public sector banks listed in each notification (11 for CRP CSA-XVI, for 2027–28 vacancies). Recruitment is State/UT-wise: a candidate applies for the vacancies of one State or UT only. First comes an online Preliminary exam in English Language, Numerical Ability and Reasoning Ability, and each test must be qualified. It is followed by an online Main exam. The notification\'s process runs from the Main exam straight to provisional allotment, with the Main score alone deciding merit. For each wrong answer, a quarter of that question\'s marks is deducted. Before joining, candidates must qualify a Local Language Proficiency Test, unless their Class 10 or higher records show they studied the language. Provisional allotment is by merit and preference. The process expires one year after provisional allotment, or when a fresh allotment is made, whichever is earlier.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: CRP CSA-XVII replaces it.
      { label: 'Institute of Banking Personnel Selection (IBPS) — official site', url: 'https://www.ibps.in' },
      { label: 'IBPS — CRP CSA (Customer Service Associate) XVI page (notification, corrigendum, updates)', url: 'https://www.ibps.in/index.php/clerical-cadre-xvi/' },
      { label: 'IBPS — CRP CSA-XVI detailed notification, 1 Aug 2026 (§A participating banks and State/UT-wise applications, §B eligibility, §C fee, §D structure, §E penalty, §F cut-off, §H local language test, §K provisional allotment; introduction: validity) (PDF)', url: 'https://www.ibps.in/wp-content/uploads/Notification_CRP_CSA_XVI-Final.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'sbi-po',
    slug: 'sbi-po',
    shortName: 'SBI PO',
    fullName: 'State Bank of India Recruitment of Probationary Officers',
    region: 'india',
    domain: 'general',
    conductingBody: 'State Bank of India (SBI)',
    // The /exams cards cut frequency at the first '(' — the cycle detail stays inside it.
    frequency: 'Once a year (the 2026-27 advertisement, CRPD/PO/2026-27/09, set tentative dates: Preliminary in August 2026, Main in September 2026, Phase III in October/November 2026)',
    mode: 'online',
    duration: 'Preliminary: 1 hour. Main: 3 hours 30 minutes, made up of a 3-hour objective test and a 30-minute typed descriptive paper (2026-27 advertisement)',
    totalMarks: 'Preliminary: 100 (used only to shortlist for the Main). Main: 230 (200 objective + 30 descriptive). Group exercise and interview: 50. The final merit list scales the Main to 75 and Phase III to 25, out of 100 (2026-27 advertisement)',
    eligibility:
      'Indian citizens with a graduation degree in any discipline from a recognised university. Final-year or final-semester students may apply provisionally, but must show they passed by 30 September 2026. Age 21–30 as on 1 April 2026, with upper-age relaxation for reserved categories. There is a limit on attempts: 6 for UR/EWS, 9 for OBC and for PwBD UR/EWS, and no limit for SC/ST. Each Main exam taken counts as an attempt (2026-27 advertisement)',
    websiteUrl: 'https://sbi.bank.in/web/careers/current-openings',
    costUsd: '₹750 for Unreserved, EWS and OBC candidates; nil for SC, ST and PwBD candidates. This is the non-refundable application fee and intimation charge in the SBI PO 2026-27 advertisement (CRPD/PO/2026-27/09)',
    descriptionEn:
      'SBI PO is the State Bank of India\'s own recruitment of Probationary Officers for its officer cadre. Selection runs in three phases: an online preliminary exam; an online main exam of objective tests plus a typed descriptive paper; and Phase III, which is a psychometric test, a group exercise and an interview. Wrong answers in the objective tests lose a quarter of the question\'s marks. The final merit list combines the main exam and Phase III marks; preliminary marks are not counted. Pattern, vacancies and dates are set by SBI each year in the official advertisement.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the 2027-28 advertisement replaces it.
      { label: 'State Bank of India — Recruitment of Probationary Officers 2026-27, detailed advertisement CRPD/PO/2026-27/09 (PDF)', url: 'https://sbi.bank.in/documents/77530/57941/18062026_1_Detailed_Adv.2026.pdf/1f1a9532-8a2f-6e59-08a0-616d62a497b1?t=1781759726353' },
      { label: 'State Bank of India — Careers: current openings (official)', url: 'https://sbi.bank.in/web/careers/current-openings' },
      { label: 'State Bank of India — Careers: Probationary Officers (official)', url: 'https://sbi.bank.in/web/careers/probationary-officers' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'rbi-grade-b',
    slug: 'rbi-grade-b',
    shortName: 'RBI Grade B',
    fullName: 'RBI Officers in Grade \'B\' (Direct Recruitment) — General, DEPR and DSIM cadres',
    region: 'india',
    domain: 'general',
    conductingBody: 'Reserve Bank of India Services Board (RBISB), for the Reserve Bank of India',
    frequency: 'Once per panel year. The PY 2026 notice was published on 29 April 2026, with Phase I on 13–14 June 2026 and Phase II on 25–26 July 2026',
    // General cadre fully online; some DEPR and DSIM papers show the question on screen and take answers on paper (PY 2026 scheme).
    mode: 'both',
    duration: 'Varies by cadre (PY 2026). General: Phase I is 120 minutes; Phase II has three papers of 120, 90 and 120 minutes. DEPR: four papers of 120 minutes each. DSIM: papers of 120, 180 and 90 minutes',
    totalMarks: 'General: Phase I is 200 marks and only shortlists for Phase II. Phase II is 300 marks and the interview 75; the merit list adds Phase II and interview marks. DEPR: 400 across four papers plus a 75-mark interview. DSIM: 300 across three papers plus a 75-mark interview (PY 2026)',
    eligibility:
      'Citizens of India, subjects of Nepal or Bhutan, and certain other categories named in the notice (the latter need a Government of India eligibility certificate). Age 21–30 as on 1 April 2026, with relaxations: for example, the upper limit is 32 with an M.Phil. and 34 with a Ph.D. General cadre: a bachelor\'s degree with at least 60% (50% for SC/ST/PwBD), or a postgraduate degree with at least 55% (pass marks for SC/ST/PwBD). DEPR: a master\'s in economics or finance with at least 55% (50% for SC/ST/PwBD). DSIM: a master\'s in statistics, mathematics, econometrics, data science or a related field with at least 55%, or a four-year bachelor\'s in those fields with at least 60% (50% for SC/ST/PwBD in each case). General and EWS candidates who have already taken Phase I six times may not apply (PY 2026 notice)',
    websiteUrl: 'https://opportunities.rbi.org.in',
    costUsd: '₹850 + 18% GST for General, OBC and EWS candidates (application fee including intimation charges). ₹100 + 18% GST for SC, ST and PwBD candidates (intimation charges only). Nil for eligible RBI staff. Bank and transaction charges are extra. Figures are from the Grade \'B\' PY 2026 notice (RBISB/DA/01/2026-27)',
    descriptionEn:
      'RBI Grade \'B\' (Direct Recruitment) is how the Reserve Bank of India recruits officers in Grade \'B\' for three cadres: General, DEPR (Economic and Policy Research) and DSIM (Statistics and Information Management). The Reserve Bank of India Services Board runs it. The General cadre has an online Phase I objective paper, then an online Phase II of three papers (objective and typed descriptive answers), then an interview. DEPR and DSIM have their own economics or statistics papers (some descriptive answers are handwritten on paper), then an interview. Candidates take a personality assessment before the interview; it carries no marks. Eligibility, pattern, vacancies and dates are set in each panel year\'s official notice.',
    collegesAccepting: [],
    sources: [
      // Per-panel-year documents: the PY 2027 notice replaces them. The RBI hosts serve a bot check to curl; the pages are live in a browser.
      { label: 'Reserve Bank of India — Officers in Grade \'B\' (DR) General/DEPR/DSIM, Panel Year 2026 notice (RBISB/DA/01/2026-27)', url: 'https://opportunities.rbi.org.in/Scripts/bs_viewcontent.aspx?Id=4997' },
      { label: 'Reserve Bank of India — Grade \'B\' (DR) General PY 2026: scheme of selection (Appendix-II, PDF)', url: 'https://rbidocs.rbi.org.in/rdocs/content/pdfs/DEPR29042026_A2.pdf' },
      { label: 'Reserve Bank of India — Grade \'B\' (DR) DEPR and DSIM PY 2026: scheme of selection (Appendix-III, PDF)', url: 'https://rbidocs.rbi.org.in/rdocs/content/pdfs/DEPR29042026_A3.pdf' },
      { label: 'Reserve Bank of India — opportunities/recruitment portal', url: 'https://opportunities.rbi.org.in' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ssc-cgl',
    slug: 'ssc-cgl',
    shortName: 'SSC CGL',
    fullName: 'SSC Combined Graduate Level Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Staff Selection Commission (SSC)',
    // The /exams cards cut frequency at the first '(' — the cycle detail stays inside it.
    frequency: 'Once a year (CGL 2026: Tier-I, computer-based, scheduled for 30 September–30 October 2026 per SSC\'s notice of 12 September 2026; Tier-II tentatively December 2026)',
    mode: 'online',
    duration: 'Tier-I: 1 hour. Tier-II Paper-I: 2 hours 15 minutes (Session I), plus a 15-minute Data Entry Speed Test (Session II). Paper-II (Statistics) and Paper-III (General Studies — Finance and Economics): 2 hours each, only for the posts that require them (CGL 2026 notice)',
    totalMarks: 'Tier-I: 200 (four sections of 50; used only to shortlist for Tier-II). Tier-II Paper-I: Sections I and II carry 390 marks (180 + 210) and decide merit. Section III (Computer Knowledge Test, 60 marks) and Section IV (Data Entry Speed Test) are qualifying only. Paper-II and Paper-III: 200 each, for the posts that require them. The final merit list uses Tier-II only (CGL 2026 notice)',
    eligibility:
      'Citizens of India, subjects of Nepal or Bhutan, and certain persons of Indian origin named in the notice (the latter need a Government of India eligibility certificate). A bachelor\'s degree from a recognised university is required. Junior Statistical Officer and Statistical Investigator Grade-II need specified subjects, and the state-cadre audit and accounts posts need proficiency in the state\'s language. Final-year students may apply if they hold the degree by 1 August 2026. Age limits vary by post — 18–27, 20–30, 18–30 or 18–32 years as on 1 August 2026 — with upper-age relaxation for reserved categories (CGL 2026 notice)',
    websiteUrl: 'https://ssc.gov.in',
    costUsd: '₹100. Women candidates, and SC, ST, PwBD and Ex-servicemen candidates eligible for reservation, pay no fee (CGL 2026 notice)',
    descriptionEn:
      'SSC CGL (Combined Graduate Level) is conducted by the Staff Selection Commission. It fills Group \'B\' and Group \'C\' posts in Government of India ministries, departments and organisations, and in various constitutional and statutory bodies and tribunals. It is a computer-based examination in two tiers: Tier-I shortlists candidates for Tier-II, and the final merit list is based on Tier-II only. Some posts also require Paper-II (Statistics) or Paper-III (General Studies — Finance and Economics). Posts, pattern, vacancies and dates are set in the official notice each year.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: the CGL 2027 notice replaces them.
      { label: 'Staff Selection Commission — Combined Graduate Level Examination, 2026 notice (PDF)', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2026.pdf' },
      { label: 'Staff Selection Commission — Important notice: CGL 2026 Tier-I schedule, 12 September 2026 (PDF)', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Important%20Notice%202026_cgle_2026_12092026.pdf' },
      { label: 'Staff Selection Commission — Tentative calendar of examinations 2026-27 (PDF)', url: 'https://ssc.gov.in/api/attachment/uploads/masterData/ExamCalendar/Tentative_Calendar2026_27_08012026.pdf' },
      { label: 'Staff Selection Commission (SSC) — official site', url: 'https://ssc.gov.in' },
    ],
    lastVerified: '2026-09-30',
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
    // The /exams cards cut frequency at the first '(' — the cycle detail stays inside it.
    frequency: 'Twice a year (CDS (I) and CDS (II)). CDS (II) 2026 was held on 13 September 2026. UPSC\'s 2027 calendar schedules CDS (I) 2027 for 11 April 2027 (notification on 2 December 2026)',
    mode: 'offline',
    duration: '2 hours per paper: three papers for IMA, INA and AFA, and two for OTA (CDS II 2026 notice)',
    totalMarks: 'Written: 300 for IMA, INA and AFA (English, General Knowledge and Elementary Mathematics, 100 each) and 200 for OTA (English and General Knowledge). The SSB interview carries the same maximum as the written exam for each course (CDS II 2026 notice)',
    eligibility:
      'Citizens of India, subjects of Nepal, and certain persons of Indian origin named in the notice; some need a Government of India eligibility certificate. IMA and OTA: a degree from a recognised university. INA: an engineering degree, or a B.Sc. with Physics (with Physics and Mathematics at 10+2). AFA: a degree with Physics and Mathematics at 10+2, or a B.E. Final-year students may apply. Age (CDS II 2026): IMA and INA 19–24, unmarried men. AFA 20–24, or up to 26 with a DGCA Commercial Pilot Licence; candidates under 25 must be unmarried. OTA 19–25: unmarried men, and unmarried women or issueless widows or divorcees who have not remarried. Women are considered only for the OTA Short Service Commission course',
    websiteUrl: 'https://upsc.gov.in',
    costUsd: '₹200; women, SC and ST candidates are exempt (CDS II 2026 notice)',
    descriptionEn:
      'The Combined Defence Services Examination is conducted by UPSC twice a year. It is for admission to officer-training courses at the Indian Military Academy and the Officers\' Training Academy (Army), the Indian Naval Academy and the Air Force Academy. Women are considered only for the Short Service Commission course at OTA. Selection is an offline objective written examination, marked on an OMR sheet with negative marking. It is followed by an intelligence and personality test at a Services Selection Board and a medical examination. Eligibility, pattern, vacancies and dates are set in each UPSC notice.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the CDS (I) 2027 notice (due 2 Dec 2026) replaces it — re-check age, fee and vacancies then.
      { label: 'UPSC — Combined Defence Services Examination (II), 2026 notice No. 11/2026-CDS-II (PDF)', url: 'https://www.upsc.gov.in/sites/default/files/Notif-CDS-II-2026-Engl-200526.pdf' },
      { label: 'UPSC — Combined Defence Services Examination (II), 2026 examination page', url: 'https://www.upsc.gov.in/examinations/Combined%20Defence%20Services%20Examination%20%28II%29%2C%202026' },
      { label: 'UPSC — Programme of examinations 2027 (annual calendar, PDF)', url: 'https://www.upsc.gov.in/sites/default/files/Calendar-Year-2027-Engl-200526.pdf' },
      { label: 'Union Public Service Commission (UPSC) — official site', url: 'https://upsc.gov.in' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'afcat',
    slug: 'afcat',
    shortName: 'AFCAT',
    fullName: 'Air Force Common Admission Test',
    region: 'india',
    domain: 'general',
    conductingBody: 'Indian Air Force',
    frequency: 'Twice a year (Cycle 01 and Cycle 02). AFCAT 01/2026 was held on 31 January 2026 and AFCAT 02/2026 on 8 August 2026',
    mode: 'online',
    duration: '2 hours (AFCAT 02/2026)',
    totalMarks: '300: 100 objective questions, with +3 for a correct answer and −1 for a wrong one (AFCAT 02/2026)',
    eligibility:
      'Indian citizens, men and women, who must be unmarried when the course starts. Age as on 1 July 2027 (AFCAT 02/2026): Flying Branch 20–24, or up to 26 with a valid DGCA Commercial Pilot Licence; Ground Duty branches 20–26. Flying Branch: Physics and Mathematics at 10+2, plus a three-year degree in any discipline or a four-year BE/B.Tech (or AMIE/AeSI Sections A and B). Ground Duty (Technical): Physics and Mathematics at 10+2, plus a four-year engineering degree in listed disciplines. Ground Duty (Non-Technical): a degree matching the branch, for example a B.Com or finance degree for Accounts, or a postgraduate degree for Education. Final-year students may apply',
    websiteUrl: 'https://afcat.edcil.co.in/',
    costUsd: '₹550 + 18% GST, non-refundable (AFCAT 02/2026). Not charged for NCC Special Entry or GATE Score Entry',
    descriptionEn:
      'AFCAT is conducted by the Indian Air Force twice a year. It selects candidates for officer training in the Flying Branch and the Ground Duty (Technical and Non-Technical) branches, with Permanent or Short Service Commission depending on the branch. Candidates who reach the qualifying marks in the online test are called to an Air Force Selection Board (AFSB). AFSB testing has a first-day screening stage (an officer intelligence rating test and a picture perception and discussion test), then psychological tests, group tests and an interview. Recommended Flying Branch candidates also take the Computerised Pilot Selection System. NCC Special Entry and GATE Score Entry candidates are called directly to AFSB testing without taking AFCAT. Eligibility, pattern, vacancies and dates are set in each cycle\'s official notification.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the AFCAT 01/2027 notification replaces it — re-check age, fee and scheme then.
      { label: 'Indian Air Force — AFCAT 02/2026 notification, courses commencing July 2027 (PDF)', url: 'https://afcat.edcil.co.in/assets/images/news/AFCAT_02_2026/Notification%20for%20AFCAT%20Cycle%2002-2026.pdf' },
      { label: 'AFCAT — official portal (Indian Air Force)', url: 'https://afcat.edcil.co.in/' },
      { label: 'Indian Air Force — official website', url: 'https://indianairforce.nic.in/' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'capf-ac',
    slug: 'capf-ac',
    shortName: 'CAPF AC',
    fullName: 'Central Armed Police Forces (Assistant Commandants) Examination',
    region: 'india',
    domain: 'general',
    conductingBody: 'Union Public Service Commission (UPSC)',
    frequency: 'Once a year — the 2026 written examination was held on 19 July 2026, and UPSC\'s programme of examinations for 2027 already lists the 2027 examination (confirm dates on upsc.gov.in)',
    mode: 'offline',
    duration: 'Written examination on one day: Paper I 2 hours (10 AM–12 noon) and Paper II 3 hours (2–5 PM)',
    totalMarks: 'Paper I (General Ability and Intelligence, objective, with negative marking) 250; Paper II (General Studies, Essay and Comprehension) 200; Interview/Personality Test 150 — the final merit list uses the written and interview marks',
    eligibility:
      'Indian citizenship (the Rules also do not debar subjects of Nepal or Bhutan); men and women are both eligible; aged 20 to 25 on 1 August 2026 (born between 2 August 2001 and 1 August 2006), with upper-age relaxation of up to 5 years for SC/ST and 3 years for OBC candidates, among others; a Bachelor\'s degree or equivalent (candidates appearing in the qualifying exam in 2026 may apply); the prescribed physical and medical standards apply. Confirm in the current UPSC notice.',
    websiteUrl: 'https://upsc.gov.in',
    costUsd: '₹200 (CAPF (ACs) Examination 2026); female, SC and ST candidates are exempt; OBC and EWS candidates pay the full fee',
    descriptionEn:
      'The CAPF (ACs) Examination is conducted by UPSC to recruit Assistant Commandants (Group A) for the Border Security Force (BSF), Central Reserve Police Force (CRPF), Central Industrial Security Force (CISF), Indo-Tibetan Border Police (ITBP) and Sashastra Seema Bal (SSB). Selection has four stages: a written examination of two papers (Paper II is evaluated only for candidates who reach the minimum qualifying marks in Paper I), Physical Standards and Physical Efficiency Tests, an Interview/Personality Test, and Medical Standards Tests. The final merit list is drawn from the written and interview marks. Vacancies, dates and eligibility are set in each year\'s UPSC notice.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: the 2027 notice (scheduled for 17 Feb 2027) replaces them.
      { label: 'UPSC — CAPF (ACs) Examination 2026 notice (No. 08/2026-CAPF, 20 Feb 2026)', url: 'https://www.upsc.gov.in/sites/default/files/ExamNotifi_CAPF_AC_Exam_2026_Eng_20022026.pdf' },
      { label: 'UPSC — CAPF (ACs) Examination 2026 written result press note (25 Aug 2026)', url: 'https://www.upsc.gov.in/sites/default/files/WR-NameList-CAPF-26-Engl-080926.pdf' },
      { label: 'UPSC — Programme of Examinations 2027 (as on 20 May 2026)', url: 'https://www.upsc.gov.in/sites/default/files/Calendar-Year-2027-Engl-200526_0.pdf' },
      { label: 'Union Public Service Commission (UPSC) — official site', url: 'https://upsc.gov.in' },
    ],
    lastVerified: '2026-09-30',
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
    frequency: 'Held in numbered editions announced by CBSE — the 21st edition in February 2026; the 22nd is scheduled for 12–13 December 2026 (confirm on ctet.nic.in)',
    mode: 'offline',
    duration: '2 hours 30 minutes per paper (Paper II in the morning shift, Paper I in the afternoon shift)',
    totalMarks: '150 marks per paper — 150 multiple-choice questions of one mark each, no negative marking; under NCTE\'s notification a score of 60% or more is a TET pass (school managements may give concessions to reserved categories)',
    eligibility:
      'The minimum teacher qualifications in NCTE\'s Minimum Qualifications Regulations (as amended), or in the Recruitment Rules of the appropriate government, KVS or NVS; NCTE allows up to 5% relaxation in the qualifying marks of the minimum educational qualification for SC/ST/OBC/differently-abled candidates. Eligibility is finally verified by the recruiting authority — confirm on ctet.nic.in and ncte.gov.in',
    websiteUrl: 'https://ctet.nic.in',
    costUsd: 'CTET September 2026 (22nd edition): General/OBC (NCL) ₹1,000 for one paper or ₹1,200 for both; SC/ST/differently-abled ₹500 for one paper or ₹600 for both; GST extra',
    descriptionEn:
      'CTET is the Central Government\'s teacher eligibility test, conducted by CBSE in pen-and-paper mode on OMR answer sheets. Paper I is for those who intend to teach Classes I–V and Paper II for Classes VI–VIII; anyone who wants to teach both levels takes both papers. It applies to Central Government schools (KVS, NVS, Central Tibetan Schools and others) and to schools under the administrative control of certain Union Territories, including Delhi; unaided private schools may also consider it, a state may consider it if it does not conduct its own TET, and CBSE-affiliated schools require teachers of Classes I–VIII to have passed CTET or a TET. A CTET pass is one of the eligibility criteria for appointment, not a right to a job — recruitment is carried out separately by the school or recruiting authority. The qualifying certificate is valid for life for appointment unless the appropriate government notifies otherwise, and there is no limit on attempts.',
    collegesAccepting: [],
    sources: [
      // Per-edition documents: re-check them when the 23rd edition's bulletin is published. ctet.nic.in drops some TLS connections from scripts; it is live in a browser.
      { label: 'CTET — official portal (CBSE)', url: 'https://ctet.nic.in' },
      { label: 'CBSE — CTET September 2026 Information Bulletin (22nd edition)', url: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2026/05/202605111250310617.pdf' },
      { label: 'CBSE — public notice: 22nd edition of CTET on 12–13 December 2026 (14 Sep 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2026/09/20260914325514446.pdf' },
      { label: 'CBSE — public notice: re-opening of applications for the 22nd edition (25 Aug 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2026/08/20260825641447501.pdf' },
      { label: 'CTET — Eligibility Criteria (CBSE)', url: 'https://ctet.nic.in/eligibility-criteria/' },
      { label: 'CBSE — CTET frequently asked questions (certificate validity)', url: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2025/08/2025080565.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'ugc-net',
    slug: 'ugc-net',
    shortName: 'UGC NET',
    fullName: 'University Grants Commission National Eligibility Test',
    region: 'india',
    domain: 'general',
    conductingBody: 'National Testing Agency (NTA) on behalf of the University Grants Commission (UGC)',
    frequency: 'A June and a December cycle each year (e.g. the December 2025 and June 2026 cycles, each with its own bulletin); the June 2026 exam was held in June–July 2026, with a re-exam for three subjects on 9–10 September 2026 — confirm the next cycle on ugcnet.nta.nic.in',
    mode: 'online',
    duration: '3 hours (180 minutes) — Paper 1 and Paper 2 in one sitting with no break',
    totalMarks: '300 — Paper 1: 50 questions (100 marks); Paper 2: 100 questions (200 marks); 2 marks per correct answer, no negative marking',
    eligibility:
      'For Indian nationals. A Master\'s degree or equivalent with at least 55% (50% for OBC-NCL, SC, ST, PwD/PwBD and third-gender candidates); final-year Master\'s students may apply provisionally. A four-year bachelor\'s degree with at least 75% (5% relaxation for eligible categories) qualifies for JRF and PhD admission, but not for Assistant Professor. JRF upper age limit: 30 years as on 1 June 2026, with relaxations; no upper age limit for Assistant Professor or PhD admission. (UGC-NET June 2026 bulletin)',
    websiteUrl: 'https://ugcnet.nta.nic.in',
    costUsd: 'UGC-NET June 2026: ₹1,150 General/Unreserved; ₹600 Gen-EWS/OBC-NCL; ₹325 SC/ST/PwD/PwBD/third gender; bank or gateway processing charges and GST extra',
    descriptionEn:
      'UGC-NET is conducted by NTA for the University Grants Commission in Computer-Based Test (CBT) mode across a broad range of subjects. It determines eligibility in three categories: award of Junior Research Fellowship (JRF) with appointment as Assistant Professor and PhD admission; appointment as Assistant Professor and PhD admission; and PhD admission only. Paper 1 assesses teaching and research aptitude — reasoning, reading comprehension, divergent thinking and general awareness; Paper 2 is based on the subject the candidate chooses. For PhD admission under categories 2 and 3, NET marks carry 70% weight and the university\'s interview 30%, and they count for one year from the result; JRF-qualified candidates are admitted to a PhD through an interview. NTA publishes subject- and category-wise cut-off marks with each result.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the December 2026 bulletin replaces it.
      { label: 'UGC-NET — official portal (NTA)', url: 'https://ugcnet.nta.nic.in' },
      { label: 'NTA — UGC-NET June 2026 Information Bulletin (as on 30.04.2026)', url: 'https://cdnbbsr.s3waas.gov.in/s301eee509ee2f68dc6014898c309e86bf/uploads/2026/04/202604301078678748.pdf' },
      { label: 'NTA — press release: declaration of UGC-NET June 2026 results (28 Aug 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s301eee509ee2f68dc6014898c309e86bf/uploads/2026/08/20260828605740344.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'csir-net',
    slug: 'csir-net',
    shortName: 'CSIR NET',
    fullName: 'CSIR-UGC National Eligibility Test',
    region: 'india',
    domain: 'science',
    conductingBody: 'National Testing Agency (NTA) on behalf of the Council of Scientific and Industrial Research (CSIR)',
    frequency: 'Twice a year, in June and December cycles; the June 2026 cycle was held on 17–18 July 2026 — confirm the next cycle on csirnet.nta.nic.in',
    mode: 'online',
    duration: '3 hours (180 minutes)',
    totalMarks: '200 marks per subject paper, in three parts (A, B and C); the number of questions, marks per question and negative marking vary by subject — e.g. Part C of Mathematical Sciences has no negative marking',
    eligibility:
      'Indian citizens only. A Master\'s degree or equivalent with at least 55% (50% for OBC-NCL, SC, ST, PwD/PwBD and third-gender candidates); final-year students may apply provisionally. A four-year bachelor\'s degree with at least 75% (5% relaxation for eligible categories) qualifies for JRF and PhD admission, but not for Assistant Professor. JRF upper age limit: 30 years as on 1 July 2026, with relaxations; no upper age limit for Assistant Professor or PhD admission. (Joint CSIR-UGC NET June 2026 bulletin)',
    websiteUrl: 'https://csirnet.nta.nic.in',
    costUsd: 'Joint CSIR-UGC NET June 2026: ₹1,150 General; ₹600 Gen-EWS/OBC-NCL; ₹325 SC/ST/PwD/PwBD/third gender; bank or payment-gateway service charges extra',
    descriptionEn:
      'Joint CSIR-UGC NET is conducted by NTA for the Council of Scientific and Industrial Research in Computer-Based Test (CBT) mode in five subjects: Chemical Sciences; Earth, Atmospheric, Ocean and Planetary Sciences; Life Sciences; Mathematical Sciences; and Physical Sciences. Results fall into three categories: JRF with eligibility for Assistant Professor and PhD admission; eligibility for Assistant Professor and PhD admission; and eligibility for PhD admission only. Each paper has three parts: Part A (general aptitude, common to all subjects), Part B (subject-related conventional multiple-choice questions) and Part C (higher-value analytical questions that apply scientific concepts). For PhD admission under categories 2 and 3, NET marks carry 70% weight and the university\'s interview 30%, and they count for one year from the result; the Assistant Professor certificate has no end date.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the December 2026 bulletin replaces it.
      { label: 'Joint CSIR-UGC NET — official portal (NTA)', url: 'https://csirnet.nta.nic.in' },
      { label: 'NTA — Joint CSIR-UGC NET June 2026 Information Bulletin', url: 'https://cdnbbsr.s3waas.gov.in/s3efdf562ce2fb0ad460fd8e9d33e57f57/uploads/2026/05/202605271224945892.pdf' },
      { label: 'NTA — About Joint CSIR-UGC NET (twice a year; Indian citizens)', url: 'https://csirnet.nta.nic.in/about-joint-csir-ugc/' },
      { label: 'CSIR-HRDG — CSIR-UGC NET syllabus and paper structure', url: 'https://csirhrdg.res.in/Home/Index/1/Default/3485/78' },
      { label: 'NTA — press release: scores of Joint CSIR-UGC NET June 2026 (29 Aug 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s3efdf562ce2fb0ad460fd8e9d33e57f57/uploads/2026/08/20260829458652006.pdf' },
    ],
    lastVerified: '2026-09-30',
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
    fullName: 'Common University Entrance Test for Postgraduate Programmes',
    region: 'india',
    domain: 'graduate-admission',
    conductingBody: 'National Testing Agency (NTA)',
    // The /exams cards cut frequency at the first '(' — the cycle detail stays inside it.
    frequency: 'One edition per admission session (CUET (PG) 2026 was held in March 2026 for 2026–27 admissions; confirm the next edition on exams.nta.nic.in/cuet-pg)',
    mode: 'online',
    duration: '90 minutes per test paper',
    totalMarks: '75 questions per test paper, 4 marks each (300 marks); 1 mark deducted for each wrong answer; candidates may choose up to four test papers',
    eligibility: 'A Bachelor\'s degree or equivalent, or appearing in its final year in 2026; no age limit for the test. Each participating university sets its own programme eligibility, reservation and age rules — check its website before applying.',
    websiteUrl: 'https://exams.nta.nic.in/cuet-pg/',
    costUsd: 'CUET (PG) 2026, for up to two test papers: ₹1,400 General; ₹1,200 Gen-EWS/OBC-NCL; ₹1,100 SC/ST/third gender; ₹1,000 PwD/PwBD (each additional paper ₹700 General, ₹600 other categories); ₹7,000 for test centres outside India (₹3,500 per additional paper); bank or gateway charges and GST extra',
    descriptionEn:
      'CUET (PG) is a computer-based entrance test conducted by NTA for admission to postgraduate programmes at central universities and other participating universities and institutions. Candidates choose up to four test papers mapped to the programmes they are applying for. NTA\'s role ends with the result: each participating university prepares its own merit list and runs its own counselling, applying its own eligibility, reservation and other criteria. The CUET (PG) 2026 score is valid for admission to the 2026–27 academic year only.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the CUET (PG) 2027 bulletin (expected around December 2026) replaces it.
      { label: 'NTA — CUET (PG) official portal', url: 'https://exams.nta.nic.in/cuet-pg/' },
      { label: 'NTA — CUET (PG) Information Bulletin page', url: 'https://exams.nta.nic.in/document/cuet-pg-information-bulletin/' },
      { label: 'NTA — CUET (PG) 2026 Information Bulletin', url: 'https://cdnbbsr.s3waas.gov.in/s388a839f2f6f1427879fc33ee4acf4f66/uploads/2025/12/202512161583029269.pdf' },
      { label: 'NTA — clarification on rescheduled CUET (PG) 2026 papers (Annexure lists total marks 300)', url: 'https://cdnbbsr.s3waas.gov.in/s388a839f2f6f1427879fc33ee4acf4f66/uploads/2026/06/202606141399769113.pdf' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'neet-pg',
    slug: 'neet-pg',
    shortName: 'NEET PG',
    fullName: 'National Eligibility cum Entrance Test (Postgraduate)',
    region: 'india',
    domain: 'medicine',
    conductingBody: 'National Board of Examinations in Medical Sciences (NBEMS)',
    frequency: 'NEET-PG 2026: 30 August 2026, in a single shift — each year\'s date is set in that year\'s Information Bulletin',
    mode: 'online',
    duration: '3 hours 30 minutes (NEET-PG 2026: five timed sections of 42 minutes each)',
    totalMarks: '720 (NEET-PG 2026: 180 multiple-choice questions; +4 for a correct answer, −1 for a wrong one, 0 if unattempted)',
    eligibility: 'An MBBS degree or provisional MBBS pass certificate recognised under the NMC Act, 2019; permanent or provisional MBBS registration with the NMC or a State Medical Council; and one year of internship completed by the bulletin\'s cut-off date (30 September 2026 for NEET-PG 2026). Indian citizens and OCI cardholders whose medical qualification is from outside India must also have qualified the FMGE; a foreign national\'s basic medical qualification must be recognised by the NMC.',
    websiteUrl: 'https://natboard.edu.in/viewnbeexam?exam=neetpg',
    costUsd: '₹3,500 for General, OBC and EWS candidates; ₹2,500 for SC, ST and PwBD candidates (NEET-PG 2026; payment-gateway charges extra)',
    descriptionEn:
      'NEET-PG is the single eligibility-cum-entrance examination for admission to MD, MS and PG Diploma courses in India, prescribed under the National Medical Commission Act, 2019. It covers All India 50% quota seats, state quota seats, private medical colleges and deemed universities, Armed Forces Medical Services institutions, and post-MBBS DNB and NBEMS Diploma courses. AIIMS New Delhi and the other AIIMS, PGIMER Chandigarh, JIPMER Puducherry, NIMHANS Bengaluru and the Sree Chitra Tirunal Institute for Medical Sciences and Technology, Trivandrum are not covered by its centralised MD/MS admissions. NEET-PG 2026 was a computer-based test of 180 multiple-choice questions in English, in five timed sections of 36 questions (42 minutes each); a correct answer earns 4 marks and a wrong one loses 1. The NEET-PG 2026 result counts for the 2026–27 admission session only.',
    collegesAccepting: [],
    sources: [
      // Per-cycle document: the NEET-PG 2027 bulletin replaces it (NBEMS hosts it on Google Drive, linked from its own NEET-PG page).
      { label: 'NBEMS — NEET-PG (overview, bulletin, application, results)', url: 'https://natboard.edu.in/viewnbeexam?exam=neetpg' },
      { label: 'NBEMS — NEET-PG 2026 Information Bulletin (linked from the NBEMS NEET-PG page)', url: 'https://drive.google.com/file/d/1WmFcaFZhEAaRFrBBgTGUENX81cQwQkVT/view' },
      { label: 'NBEMS — NEET-PG results (NEET-PG 2026 result, total score out of 720)', url: 'https://natboard.edu.in/parinam/neetpg/index' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'nata',
    slug: 'nata',
    shortName: 'NATA',
    fullName: 'National Aptitude Test in Architecture',
    region: 'india',
    domain: 'undergraduate-admission',
    conductingBody: 'Council of Architecture (CoA)',
    frequency: 'NATA 2026 — Phase 1: Fridays and Saturdays from 4 April to 13 June 2026 (up to two attempts, for centralised admission counselling); Phase 2: 7–8 August 2026 (one attempt, for seats left vacant after counselling). A candidate may sit only one phase.',
    mode: 'both',
    duration: '3 hours: Part A (drawing and composition, offline) 90 minutes + Part B (computer-based adaptive test) 90 minutes — NATA 2026',
    totalMarks: '200: Part A 80 + Part B 120 (NATA 2026). Phase 1 scorecards show the best raw score and a percentile score; Phase 2 shows a raw score only. No minimum raw score is prescribed for qualifying.',
    eligibility: 'To sit NATA 2026: passed or appearing in Class 10+2 with the subjects the Council prescribes, or in a 10+3 Diploma with Mathematics. For B.Arch. admission (CoA Minimum Standards of Architectural Education Regulations, 2020): 10+2 with Physics and Mathematics as compulsory subjects plus one of Chemistry, Biology, a technical vocational subject, Computer Science, Information Technology, Informatics Practices, Engineering Graphics or Business Studies, with at least 45% aggregate — or a 10+3 Diploma with Mathematics as a compulsory subject and at least 45% aggregate.',
    websiteUrl: 'https://www.nata.in/',
    costUsd: '₹1,750 per test for General and OBC (NCL) candidates; ₹1,250 for SC, ST, EWS and PwD; ₹1,000 for transgender candidates; ₹15,000 for a test outside India (NATA 2026, non-refundable)',
    descriptionEn:
      'NATA (National Aptitude Test in Architecture) is the Council of Architecture\'s aptitude test for admission to the five-year B.Arch. degree in India, held since 2006. CoA regulations require B.Arch. applicants to qualify an aptitude test in architecture — NATA or the NTA\'s JEE — and the admissions themselves are made by state, UT and institutional admission authorities. NATA 2026 had two parts: Part A, an offline drawing and composition test (three questions, 80 marks), and Part B, a computer-based adaptive test (42 multiple-choice and 8 no-choice questions, 120 marks) covering visual reasoning, logical derivation, general knowledge of architecture and design, language interpretation, design sensitivity and numerical ability. The test is set in English and Hindi, and a NATA 2026 score is valid for the 2026–27 academic session.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: brochure V2.0 (10 Apr 2026) is the current NATA 2026 brochure — re-check them for NATA 2027.
      { label: 'Council of Architecture — NATA official site', url: 'https://www.nata.in/' },
      { label: 'NATA 2026 Information Brochure, Version 2.0 (10 April 2026)', url: 'https://www.nata.in/assets/pdf/Final-NATA-BROCHURE-2026.pdf' },
      { label: 'NATA 2026 — fee structure', url: 'https://www.nata.in/fees.html' },
      { label: 'NATA 2026 — schedule of dates', url: 'https://www.nata.in/schedule.html' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'iit-jam',
    slug: 'iit-jam',
    shortName: 'IIT JAM',
    fullName: 'Joint Admission Test for Masters',
    region: 'india',
    domain: 'graduate-admission',
    conductingBody: 'The IITs, through an organising institute that changes by cycle — IIT Kharagpur for JAM 2027 (IIT Bombay organised JAM 2026)',
    frequency: 'JAM 2027: 14 February 2027 (Sunday), in two sessions; applications 11 September–19 October 2026',
    mode: 'online',
    duration: '3 hours per test paper; a candidate may take one or two papers, in different sessions (JAM 2027)',
    totalMarks: '100 marks, 60 questions (JAM 2027): Section A — 30 multiple-choice questions, with 1/3 mark deducted for a wrong 1-mark answer and 2/3 mark for a wrong 2-mark answer; Section B — 10 multiple-select questions; Section C — 20 numerical-answer questions; Sections B and C have no negative marking',
    eligibility: 'An undergraduate degree completed, or the final examination of the qualifying degree in 2027 (JAM 2027); open to all nationalities, with no age limit. The degree must be completed before admission, and each programme sets its own minimum educational qualifications in the brochure.',
    websiteUrl: 'https://jam.iitkgp.ac.in/',
    costUsd: 'JAM 2027: ₹2,000 for one test paper or ₹2,700 for two; ₹1,000 or ₹1,350 for female, SC, ST and PwD candidates (non-refundable; bank or payment-gateway charges extra)',
    descriptionEn:
      'JAM is the computer-based entrance test for postgraduate science programmes at the IITs: M.Sc., M.Sc. (Tech.), MS (Research), M.Sc.–M.Tech. dual degree, Joint M.Sc.–Ph.D., M.Sc.–Ph.D. dual degree and Integrated Ph.D. It has seven test papers — Biotechnology, Chemistry, Economics, Geology, Mathematics, Mathematical Statistics and Physics — and a candidate may take one or two. The organising institute coordinates admission to the IITs on the basis of All India Rank in each paper; result-sharing institutes such as IISc, the NITs, IIEST Shibpur and IISER Pune and Bhopal also use JAM scores, and candidates apply to them directly or through the Centralized Counselling for M.Sc./M.Sc. (Tech) Admission (CCMN). JAM 2027 test centres are in India only.',
    collegesAccepting: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur', 'nit-trichy'],
    sources: [
      // Per-cycle: the organising IIT and its site change each cycle — re-check the site, brochure, fee and pattern for JAM 2028.
      { label: 'JAM 2027 official website (IIT Kharagpur, organising institute)', url: 'https://jam.iitkgp.ac.in/' },
      { label: 'JAM 2027 Information Brochure', url: 'https://jam.iitkgp.ac.in/docs/Info_Brochure_v2.pdf' },
      { label: 'JAM 2027 — application fees', url: 'https://jam.iitkgp.ac.in/appfees.html' },
      { label: 'JAM 2027 — about (admitting IITs, result-sharing institutes)', url: 'https://jam.iitkgp.ac.in/about.html' },
      { label: 'JAM 2026 — about (IIT Bombay, organising institute)', url: 'https://jam2026.iitb.ac.in/About.html' },
      { label: 'IIT Bombay (IEOR) — M.Sc. admission through JAM', url: 'https://www.ieor.iitb.ac.in/admissions/msc' },
      { label: 'IIT Delhi (Economics) — M.Sc. admission through JAM', url: 'https://econ.iitd.ac.in/msc' },
      { label: 'IIT Madras — postgraduate programmes (M.Sc. through JAM)', url: 'https://www.iitm.ac.in/academics/study-at-iitm/postgraduate-programmes' },
      { label: 'IIT Kanpur — admission procedure (M.Sc. through JAM)', url: 'https://www.iitk.ac.in/doaa/admission-procedure' },
      { label: 'NIT Tiruchirappalli — M.Sc. admission (CCMN, JAM score)', url: 'https://www.nitt.edu/home/admissions/msc/' },
    ],
    lastVerified: '2026-09-30',
  },
  {
    id: 'nchm-jee',
    slug: 'nchm-jee',
    shortName: 'NCHM JEE',
    fullName: 'National Council for Hotel Management Joint Entrance Examination',
    region: 'india',
    domain: 'undergraduate-admission',
    conductingBody: 'National Testing Agency (NTA), for the National Council for Hotel Management and Catering Technology (NCHMCT)',
    frequency: 'NCHM JEE 2026: 25 April 2026, 11:00 AM–1:00 PM — each year\'s date is set in NTA\'s Information Bulletin',
    mode: 'online',
    duration: '120 minutes (2 hours) — NCHM JEE 2026',
    totalMarks: '120 multiple-choice questions, 4 marks each; 1 mark deducted for a wrong answer, none for an unanswered one (NCHM JEE 2026)',
    eligibility: 'Class 10+2 or equivalent passed with English as a subject of study, or appearing in 2026 (proof of passing required at counselling or admission, and by 30 September 2026 at the latest); no age limit — NCHM JEE 2026 bulletin',
    websiteUrl: 'https://exams.nta.nic.in/nchm-jee/',
    costUsd: '₹1,000 for General (UR) and OBC-NCL candidates; ₹700 for General-EWS; ₹450 for SC, ST, PwD and third-gender candidates (NCHM JEE 2026; bank/payment-gateway charges and GST extra)',
    descriptionEn:
      'NCHM JEE is the entrance test for the three-year B.Sc. in Hospitality and Hotel Administration (B.Sc. HHA), offered by the National Council for Hotel Management and Catering Technology (NCHMCT, an autonomous body under the Ministry of Tourism) at its affiliated Institutes of Hotel Management and recognised by JNU; every affiliated institute accepts the score for B.Sc. HHA admission. The National Testing Agency has conducted it for NCHMCT since 2019. NCHM JEE 2026 was a computer-based test of 120 multiple-choice questions in English or Hindi — numerical ability and analytical aptitude, reasoning and logical deduction, general knowledge and current affairs, English language, and aptitude for the service sector — with 4 marks for a correct answer and 1 deducted for a wrong one.',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents: the NCHM JEE 2027 bulletin replaces them.
      { label: 'NTA — NCHM JEE exam page', url: 'https://exams.nta.nic.in/nchm-jee/' },
      { label: 'NTA — NCHM JEE 2026 Information Bulletin', url: 'https://cdnbbsr.s3waas.gov.in/s388a839f2f6f1427879fc33ee4acf4f66/uploads/2025/12/20260102470139941.pdf' },
      { label: 'NTA — public notice, NCHM JEE 2026 admit cards and exam date (22 April 2026)', url: 'https://cdnbbsr.s3waas.gov.in/s388a839f2f6f1427879fc33ee4acf4f66/uploads/2026/04/20260422937853205.pdf' },
      { label: 'NCHMCT — official site (Ministry of Tourism)', url: 'https://nchm.gov.in/' },
    ],
    lastVerified: '2026-09-30',
  },
{
    id: 'ipmat',
    slug: 'ipmat',
    shortName: 'IPMAT',
    fullName: 'IPM Aptitude Test (Integrated Programme in Management)',
    region: 'india',
    domain: 'management',
    conductingBody: 'IIM Indore and IIM Rohtak — each conducts its own IPM Aptitude Test (IPM AT), with a separate application',
    frequency: 'IPM AT 2026: IIM Indore on 4 May 2026 (2:00–4:00 PM); IIM Rohtak on 10 May 2026 — each institute sets its own date',
    // Confirmed computer-based for IIM Rohtak only; IIM Indore's official pages do not state its format (30 Sep 2026).
    mode: 'online',
    duration: '120 minutes for each institute\'s IPM AT 2026 (IIM Indore: three sections of 40 minutes each); IIM Rohtak adds a 20-minute legal-reasoning section for Integrated Programme in Law applicants',
    totalMarks: '4 marks per question, 1 mark deducted for a wrong answer (no negative marking in IIM Indore\'s Quantitative Ability short-answer section); IIM Rohtak\'s test has 120 multiple-choice questions — IPM AT 2026',
    descriptionEn:
      'The IPM Aptitude Test (IPM AT, also written IPMAT) is the entrance test for the five-year Integrated Programme in Management (IPM), which students join after Class XII. IIM Indore and IIM Rohtak each run their own test, with separate applications, dates, eligibility rules and patterns. IIM Indore\'s IPM AT 2026 had three 40-minute sections — Quantitative Ability (multiple choice), Quantitative Ability (short answer) and Verbal Ability — and its graduates are awarded a Bachelor of Arts (Foundations of Management) and an MBA under a dual-degree programme. IIM Rohtak\'s IPM AT 2026 was an online test at test centres, with 40 multiple-choice questions each in Quantitative Ability, Logical Reasoning and Verbal Ability (plus a legal-reasoning section for applicants to its Integrated Programme in Law), and its programme leads to a BBA + MBA. Both institutes combine the test score with a personal interview, and IIM Rohtak also weighs Class X and XII marks. IIM Indore\'s admissions page lists other institutions that use its IPM AT 2026 scores, including IIM Amritsar, IIM Ranchi, IIM Sambalpur, IIM Shillong, IIM Sirmaur and the Indian Institute of Foreign Trade.',
    eligibility: 'IIM Indore (2026–31 batch): born on or after 1 August 2006 (1 August 2001 for SC, ST and PwD candidates), Class XII or equivalent passed in 2024 or 2025 or appearing in 2026, and Class X passed. IIM Rohtak (2026–31 batch): at least 60% (55% for SC, ST and DAP candidates) in Class X and in Class XII or equivalent, and no older than 20 (25 for SC and ST) on 30 June 2026; candidates finishing Class XII by June 2026 may apply.',
    websiteUrl: 'https://iimidr.ac.in/programmes/academic-programmes/five-year-integrated-programme-in-management-ipm/ipm-admissions-details/',
    costUsd: 'IPM AT 2026 application fee — IIM Indore: ₹4,130 (₹2,065 for SC, ST and PwD candidates), inclusive of 18% GST; IIM Rohtak: ₹4,937',
    collegesAccepting: [],
    sources: [
      // Per-cycle documents (2026–31 batch): re-check both institutes' 2027 notifications.
      { label: 'IIM Indore — IPM admissions (IPM AT 2026 announcements; institutions using the score)', url: 'https://iimidr.ac.in/programmes/academic-programmes/five-year-integrated-programme-in-management-ipm/ipm-admissions-details/' },
      { label: 'IIM Indore — Admission Procedure, IPM 2026–31 Batch (Domestic Applicants)', url: 'https://iimidr.ac.in/wp-content/uploads/2026/01/AdmissionProcedure_IPM-2026-31_-Domestic-Applicants.pdf' },
      { label: 'IIM Indore — Five Year Integrated Programme in Management (degree awarded)', url: 'https://iimidr.ac.in/programmes/academic-programmes/five-year-integrated-programme-in-management-ipm/' },
      { label: 'IIM Rohtak — IPM Admission 2026', url: 'https://www.iimrohtak.ac.in/ipm-admission.php' },
      { label: 'IIM Rohtak — Integrated Programme in Management', url: 'https://www.iimrohtak.ac.in/ipm.php' },
      { label: 'IIM Rohtak — IPM Batch 08 FAQ 2026', url: 'https://www.iimrohtak.ac.in/panel/assets/IPM%2008_FAQ_2026.pdf' },
      { label: 'IIM Rohtak — IPM AT 2026 summary (test held 10 May 2026)', url: 'https://www.iimrohtak.ac.in/assets/images/IPMAT%202026%20Summary.pdf' },
    ],
    lastVerified: '2026-06-06',
    // Re-verified on 30 Sep 2026 against both institutes' 2026–31 documents except the delivery
    // mode (IIM Indore's official pages do not say whether its IPM AT is computer-based),
    // so lastVerified stays (Content Policy §5).
    contentUpdated: '2026-09-30',
  },
// Set 20 — no new exam records for this set.
];

export const getExamBySlug = (slug: string) =>
  ENTRANCE_EXAMS.find((e) => e.slug === slug);

export const EXAMS_BY_REGION = (region: ExamRegion) =>
  ENTRANCE_EXAMS.filter((e) => e.region === region);

export const EXAMS_BY_DOMAIN = (domain: ExamDomain) =>
  ENTRANCE_EXAMS.filter((e) => e.domain === domain);
