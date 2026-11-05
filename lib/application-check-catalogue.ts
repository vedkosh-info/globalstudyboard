// Server-side programme evidence. Each entry points back to the existing university
// profile. A review covers only the listed checks, for the route in scope.
import type { CheckProgramme, CheckRule } from './application-check';

const reviewed = '2026-11-04';
const melbourne = 'https://study.unimelb.edu.au/find/courses/graduate/master-of-data-science';
const ubc = 'https://masterdatascience.ubc.ca/admissions';
const nus = 'https://www.comp.nus.edu.sg/programmes/pg/mcs/application/';
const kth = 'https://www.kth.se/en/studies/master/machine-learning/entry-requirements-machine-learning-1.48539';
const iimb = 'https://www.iimb.ac.in/admissions/epgp-admissions/admission-process';
const mbzuai = 'https://mbzuai.ac.ae/academics/msc-programs/masters-in-ai-machine-learning';
const nu = 'https://nu.edu.kz/admissions/how-to-apply/masters/regular-admissions-masters/';
const oxford = 'https://www.ox.ac.uk/admissions/graduate/courses/msc-advanced-computer-science';
const stanford = 'https://www.cs.stanford.edu/admissions/graduate-application-checklists';

// Reuse the precise evidence URL for rules supported by the same source.
function from(sourceUrl: string, rules: Omit<CheckRule, 'sourceUrl'>[]): CheckRule[] {
  return rules.map(rule => ({ ...rule, sourceUrl }));
}

export const PROGRAMMES: CheckProgramme[] = [
  {
    id: 'melbourne-data-science',
    collegeSlug: 'university-of-melbourne',
    university: 'University of Melbourne',
    name: 'Master of Data Science',
    region: 'australia-nz',
    officialUrl: melbourne,
    scope: 'March 2027 at Parkville. These three requirements apply to both domestic and international applicants. Select your student type on Melbourne’s page for the full instructions.',
    intake: 'March 2027',
    reviewed, validThrough: '2026-11-30',
    rules: [
      ...from(melbourne + '/how-to-apply', [{
        id: 'syllabuses', kind: 'prepare', title: 'Course descriptions for your prerequisites',
        detail: 'For completed prerequisite subjects, the application asks for official syllabuses or subject descriptions in English.',
        action: 'Collect English syllabuses for your prerequisite subjects',
      }]),
      ...from(melbourne + '/entry-requirements', [
        {
          id: 'subjects', kind: 'confirm', title: 'Programming, calculus and linear algebra',
          detail: 'Melbourne specifies a 12.5-point programming subject and its Calculus 2 and Linear Algebra subjects or equivalents. The university assesses prior study elsewhere.',
          action: 'Check which of your subjects Melbourne accepts as equivalents',
        },
        {
          id: 'english', kind: 'ielts', title: 'IELTS Academic scores',
          detail: 'If you use IELTS Academic, compare your overall band with 6.5 and each skill with 6.0. Melbourne also lists other tests and recognised prior study.',
          action: 'Check the accepted English evidence for your Melbourne application',
          ielts: { overall: 6.5, eachBand: 6 },
        },
      ]),
    ],
  },
  {
    id: 'ubc-data-science-vancouver',
    collegeSlug: 'university-of-british-columbia',
    university: 'University of British Columbia',
    name: 'Master of Data Science (Vancouver)',
    region: 'canada',
    officialUrl: ubc,
    scope: 'September 2027 in Vancouver. These checks cover the general Data Science programme. Computational Linguistics and the Okanagan campus have separate instructions.',
    intake: 'September 2027',
    reviewed, validThrough: '2027-01-31',
    rules: from(ubc, [
      {
        id: 'prerequisites', kind: 'courses', title: 'Proof of three prerequisite courses',
        detail: 'Gather proof of completion or enrolment for three 3-credit courses covering programming, probability or statistics, and either calculus or linear algebra.',
        action: 'Gather proof of enrolment or completion for the three UBC prerequisites',
        courses: {
          options: ['Programming', 'Probability or statistics', 'Calculus', 'Linear algebra'],
          groups: [['Programming'], ['Probability or statistics'], ['Calculus', 'Linear algebra']],
        },
      },
      {
        id: 'degree', kind: 'confirm', title: 'Degree and grade equivalence',
        detail: 'UBC uses its four-year degree and B+ standard for final two years and prerequisites. Use its country-specific guidance for your qualification and read the exceptions on the programme page.',
        action: 'Check UBC’s degree and grade guidance for your qualification',
      },
      {
        id: 'interview', kind: 'confirm', title: 'Recorded interview after submission',
        detail: 'The Vancouver programme sends a separate invitation by email after you submit. Follow that invitation for the recording instructions and your deadline.',
        action: 'Look for UBC Vancouver’s interview invitation after submitting',
      },
    ]),
  },
  {
    id: 'nus-computing-computer-science',
    collegeSlug: 'national-university-of-singapore',
    university: 'National University of Singapore',
    name: 'Master of Computing (Computer Science Specialisation)',
    region: 'east-southeast-asia',
    officialUrl: nus,
    scope: 'August 2027. These application materials apply to the Computer Science specialisation of the Master of Computing.',
    intake: 'August 2027',
    reviewed, validThrough: '2027-01-31',
    rules: from(nus, [
      {
        id: 'referee', kind: 'prepare', title: 'A referee for the online report',
        detail: 'Arrange at least one referee. Enter their email in the NUS application so they can send their report through the university system.',
        action: 'Ask a referee to complete the NUS online report',
      },
      {
        id: 'statement', kind: 'prepare', title: 'Personal statement',
        detail: 'Explain why you chose this programme, how you prepared for computer science and what you plan to do afterwards.',
        action: 'Draft your personal statement for NUS Computing',
      },
      {
        id: 'cv', kind: 'prepare', title: 'CV for the application',
        detail: 'Prepare a CV covering your studies, employment and achievements. NUS asks for application documents in PDF format.',
        action: 'Prepare your CV as a PDF for the NUS application',
      },
    ]),
  },
  {
    id: 'kth-machine-learning',
    collegeSlug: 'kth-royal-institute',
    university: 'KTH Royal Institute of Technology',
    name: 'MSc Machine Learning',
    region: 'europe',
    officialUrl: 'https://www.kth.se/en/studies/master/machine-learning/1.615257',
    scope: 'August 2027. These are programme-specific materials for Machine Learning. Check the separate country instructions for your academic records.',
    intake: 'August 2027',
    reviewed, validThrough: '2027-02-01',
    rules: from(kth, [
      {
        id: 'summary', kind: 'prepare', title: 'Machine Learning summary sheet',
        detail: 'Use the programme’s linked form to submit your completed summary sheet directly to KTH. Uploading a file to University Admissions does not complete this step.',
        action: 'Complete the Machine Learning summary sheet through KTH’s link',
      },
      {
        id: 'motivation', kind: 'prepare', title: 'Motivation letter under 500 words',
        detail: 'Write in English about your reasons for choosing Machine Learning and how your experience prepares you. Name this programme if you are applying to several.',
        action: 'Draft the KTH Machine Learning motivation letter',
      },
      {
        id: 'references', kind: 'prepare', title: 'Two recommendation letters',
        detail: 'KTH prefers one academic and one professional referee. Include each referee’s contact details and provide an English translation for a letter written in another language.',
        action: 'Arrange two recommendation letters for KTH',
      },
    ]),
  },
  {
    id: 'iimb-epgp',
    collegeSlug: 'iim-bangalore',
    university: 'Indian Institute of Management Bangalore',
    name: 'Executive Post Graduate Programme in Management (MBA)',
    region: 'india',
    officialUrl: iimb,
    scope: '2027–28 full-time EPGP MBA, bachelor’s-degree route. If you are applying through the CA, ICWA or CS route without a bachelor’s degree, ask IIMB how to count your experience.',
    intake: '2027–28',
    reviewed, validThrough: '2026-11-25',
    rules: from(iimb, [
      {
        id: 'references', kind: 'prepare', title: 'Two online references',
        detail: 'Arrange two referees to send their references directly through the IIMB system by the application deadline.',
        action: 'Arrange two referees for the IIMB online references',
      },
      {
        id: 'scorecard', kind: 'prepare', title: 'GMAT or GRE scorecard',
        detail: 'Use a test-centre result that is valid when you submit. IIMB accepts the test-taker copy while you await the official scorecard and requires direct score reporting.',
        action: 'Prepare your scorecard and arrange official score delivery to IIMB',
      },
      {
        id: 'experience', kind: 'minimum', title: 'Post-degree work experience',
        detail: 'IIMB counts work after your bachelor’s degree and requires at least five years by 31 March 2027. Check how the dates on your experience records fit this rule.',
        action: 'Check your post-degree work dates against the IIMB experience rule',
        minimum: {
          value: 60,
          unit: 'months',
          question: 'How many months of qualifying work experience after your bachelor’s degree will you have by 31 March 2027?',
        },
      },
    ]),
  },
  {
    id: 'mbzuai-ai-machine-learning',
    collegeSlug: 'mbzuai',
    university: 'Mohamed bin Zayed University of Artificial Intelligence',
    name: 'MSc in Artificial Intelligence (Machine Learning)',
    region: 'middle-east',
    officialUrl: mbzuai,
    scope: 'Fall 2027, Machine Learning concentration in the MSc in Artificial Intelligence. These checks cover the September to December 2026 application round.',
    intake: 'Fall 2027',
    reviewed, validThrough: '2026-12-15',
    rules: from(mbzuai, [
      {
        id: 'references', kind: 'prepare', title: 'Academic and work referees',
        detail: 'Nominate at least two people. Include a former instructor or academic research adviser and a current or former work supervisor.',
        action: 'Contact your academic referee and work supervisor for MBZUAI',
      },
      {
        id: 'statement', kind: 'prepare', title: 'Statement about your AI experience',
        detail: 'Use 500 to 1,000 words to explain your preparation, AI projects, motivation and goals. Check the full set of prompts on the programme page.',
        action: 'Plan your statement using MBZUAI’s programme prompts',
      },
      {
        id: 'english', kind: 'ielts', title: 'IELTS Academic overall band',
        detail: 'If you use IELTS Academic, MBZUAI specifies an overall 6.5 from an approved physical test centre. It requires valid evidence at application and lists a two-year period, alternative tests and waiver routes.',
        action: 'Confirm the test centre, date and English evidence MBZUAI accepts',
        ielts: { overall: 6.5 },
      },
    ]),
  },
  {
    id: 'nazarbayev-engineering-management',
    collegeSlug: 'nazarbayev-university',
    university: 'Nazarbayev University',
    name: 'Master of Engineering Management',
    region: 'russia',
    officialUrl: 'https://soe.nu.edu.kz/master_of_em',
    scope: '2027–28 regular master’s admissions in Astana, Kazakhstan. Read the School of Engineering section for the Engineering Management requirements.',
    intake: '2027–28',
    reviewed,
    rules: from(nu, [
      {
        id: 'references', kind: 'prepare', title: 'Two confidential recommendations',
        detail: 'Engineering Management asks for two confidential letters. Arrange your referees and use NU’s instructions for submitting recommendations.',
        action: 'Ask two referees for confidential NU recommendations',
      },
      {
        id: 'statement', kind: 'prepare', title: 'Programme motivation statement',
        detail: 'Prepare a statement explaining your interest in Engineering Management and your motivation for pursuing it.',
        action: 'Draft your Engineering Management statement of purpose',
      },
      {
        id: 'aleks', kind: 'confirm', title: 'ALEKS assessment or exemption',
        detail: 'NU invites applicants to take ALEKS on a specified date. You can request an exemption with a valid GRE or GMAT result. Follow the university’s decision for your application.',
        action: 'Confirm your ALEKS arrangements or exemption with NU',
      },
    ]),
  },
  {
    id: 'oxford-advanced-computer-science',
    collegeSlug: 'university-of-oxford',
    university: 'University of Oxford',
    name: 'MSc in Advanced Computer Science',
    region: 'uk-ireland',
    officialUrl: oxford,
    scope: 'Full-time MSc, 2027–28 entry. These checks cover selected course requirements. Specific studentships can have additional conditions.',
    intake: '2027–28',
    reviewed, validThrough: '2027-01-06',
    rules: from(oxford, [
      {
        id: 'statement', kind: 'prepare', title: 'Statement of purpose in English',
        detail: 'In up to 1,000 words, explain your relevant studies and experience, your scientific interests and why you want to take this course.',
        action: 'Draft the Oxford course statement within the 1,000-word limit',
      },
      {
        id: 'degree', kind: 'confirm', title: 'Subject and degree classification',
        detail: 'Oxford asks for an achieved or predicted UK first-class honours degree in computer science or mathematics, or an equivalent qualification. Ask Oxford to clarify an unfamiliar qualification.',
        action: 'Check how Oxford treats your subject and degree classification',
      },
      {
        id: 'english', kind: 'ielts', title: 'IELTS Academic overall and skill bands',
        detail: 'If IELTS Academic is your English evidence, the course lists 7.5 overall and 7.0 in every skill. Check Oxford’s test date, format and exemption guidance.',
        action: 'Check your IELTS report against Oxford’s higher-level English requirement',
        ielts: { overall: 7.5, eachBand: 7 },
      },
    ]),
  },
  {
    id: 'stanford-computer-science',
    collegeSlug: 'stanford-university',
    university: 'Stanford University',
    name: 'MS in Computer Science',
    region: 'usa',
    officialUrl: 'https://www.cs.stanford.edu/admissions/masters-admissions',
    scope: 'Autumn 2027, standard MS application. Stanford undergraduates applying through the coterminal route have a separate checklist.',
    intake: 'Autumn 2027',
    reviewed, validThrough: '2026-12-08',
    rules: from(stanford, [
      {
        id: 'references', kind: 'prepare', title: 'Three online recommendations',
        detail: 'Ask three people to submit letters through Stanford’s application system. The department recommends choosing at least two academic referees.',
        action: 'Arrange three online recommendations for Stanford CS',
      },
      {
        id: 'statement', kind: 'prepare', title: 'Two-page statement of purpose',
        detail: 'Write a single-spaced statement of up to two pages. Explain your preparation, research interests and plans for graduate study.',
        action: 'Prepare your Stanford CS statement within the two-page limit',
      },
      {
        id: 'transcripts', kind: 'prepare', title: 'Unofficial transcripts for review',
        detail: 'Upload a transcript from each institution where you studied full-time for at least a year. Include your Stanford Non-Degree Option transcript if you have one.',
        action: 'Gather the unofficial transcripts Stanford CS requests',
      },
    ]),
  },
];
