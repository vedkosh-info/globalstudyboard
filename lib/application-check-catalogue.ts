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
    scope: 'March 2027 at Parkville. The degree, subject and English lines were read for applicants generally. Graduate Access Melbourne is the domestic route the page describes. Select your student type on Melbourne’s page.',
    intake: 'March 2027',
    reviewed: '2026-11-06', validThrough: '2026-11-30',
    rules: [
      ...from(melbourne + '/how-to-apply', [{
        id: 'syllabuses', kind: 'prepare', title: 'Course descriptions for your prerequisites',
        detail: 'For completed prerequisite subjects, the application asks for official syllabuses or subject descriptions in English.',
        action: 'Collect English syllabuses for your prerequisite subjects',
      }]),
      ...from(melbourne + '/entry-requirements', [
        {
          id: 'degree', kind: 'confirm', title: 'Bachelor’s degree and weighted average',
          detail: 'On the domestic view of the entry-requirements page, Melbourne asks for a bachelor’s degree, or an equivalent, in any discipline, with a weighted average of at least 65%. If the degree was studied elsewhere, Melbourne assesses that study and may adjust the final average. A grade-conversion calculator on the page is described as an indication. Meeting the minimum is not a selection decision. Select your student type on that page before you rely on the average.',
          action: 'Ask Melbourne how it reads your degree and weighted average',
          ways: [{
            id: 'graduate-access', title: 'Graduate Access Melbourne, for domestic applicants',
            detail: 'The entry-requirements page says Graduate Access Melbourne can consider domestic applicants whose marks are below the standard. The page presents that route for domestic applicants. This check does not apply it to a student-visa applicant.',
            sourceUrl: melbourne + '/entry-requirements', checked: '2026-11-06',
            action: 'If you are a domestic applicant, read the Graduate Access Melbourne conditions',
          }],
        },
        {
          id: 'subjects', kind: 'confirm', title: 'Programming, calculus and linear algebra',
          detail: 'Melbourne specifies a 12.5-point programming subject, MAST10006 Calculus 2 or an equivalent, and MAST10007 Linear Algebra or an equivalent. The university assesses prior study elsewhere.',
          action: 'Check which of your subjects Melbourne accepts as equivalents',
          ways: [
            {
              id: 'coursera-certificate', title: 'Named Coursera courses in Certificate Mode',
              detail: 'The entry-requirements page names approved Coursera courses and says they must be taken in Certificate Mode. For programming it names Python for Everybody Specialization, Learn to Program: The Fundamentals, and An Introduction to Interactive Programming in Python (Part 1). For Calculus 2 it names Mathematics for Machine Learning: Multivariate Calculus. For Linear Algebra it names Mathematics for Machine Learning: Linear Algebra. The page says these subjects may not meet the same prerequisites for other Melbourne courses. The university still confirms the course.',
              sourceUrl: melbourne + '/entry-requirements', checked: '2026-11-06',
              action: 'If you use a named Coursera course, keep the Certificate Mode record',
            },
            {
              id: 'community-access', title: 'Community Access Program single subjects',
              detail: 'The same page says Community Access Program single subjects may be used to meet a missing prerequisite. It also says this option is not available to student visa holders or applicants.',
              sourceUrl: melbourne + '/entry-requirements', checked: '2026-11-06',
              action: 'Read the Community Access Program limit before you rely on a single subject',
            },
          ],
        },
        {
          id: 'english', kind: 'ielts', title: 'IELTS Academic scores',
          detail: 'If you use IELTS Academic, compare your overall band with 6.5 and each skill with 6.0. Melbourne also lists other tests and recognised prior study.',
          action: 'Check the accepted English evidence for your Melbourne application',
          ielts: { overall: 6.5, eachBand: 6 },
          ways: [
            {
              id: 'other-english-tests', title: 'Other tests listed on the entry page',
              detail: 'Beside IELTS Academic, the entry-requirements page lists TOEFL, Pearson, Cambridge, LanguageCert and the Michigan English Test. Read that page for the minimum it states for each. This check does not convert those scores.',
              sourceUrl: melbourne + '/entry-requirements', checked: '2026-11-06',
              action: 'Compare another listed English test with the figure on Melbourne’s page',
            },
            {
              id: 'english-medium-study', title: 'Prior study taught and assessed in English',
              detail: 'The page accepts recognised prior study that was taught and assessed entirely in English. The university confirms whether that study qualifies. This check does not decide it.',
              sourceUrl: melbourne + '/entry-requirements', checked: '2026-11-06',
              action: 'Ask Melbourne whether your prior study meets the English-medium condition',
            },
          ],
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
    reviewed: '2026-11-06', validThrough: '2027-01-31',
    rules: [
      ...from(ubc, [
        {
          id: 'degree', kind: 'confirm', title: 'Degree and grade equivalence',
          detail: 'UBC uses its four-year degree and B+ standard for the final two years and the prerequisites. The admissions page points a three-year degree to Graduate and Postdoctoral Studies country guidance. Lower grades can be explained in the application. Other formal training is a separate exceptions paragraph: admission may be granted on the Program Director’s recommendation and the Dean’s approval. None of those lines is an offer.',
          action: 'Check UBC’s degree and grade guidance for your qualification',
          ways: [
            {
              id: 'three-year-degree', title: 'Three-year degree',
              detail: 'The admissions page says whether a three-year degree is accepted is decided from UBC Graduate and Postdoctoral Studies country guidance. That guidance, not this check, is the place to look up your qualification.',
              sourceUrl: 'https://www.grad.ubc.ca/countries', checked: '2026-11-06',
              action: 'Open UBC’s country guidance for your degree',
            },
            {
              id: 'explain-lower-grades', title: 'Explanation of lower grades',
              detail: 'The admissions page says you may explain relevant work, professional experience or refresher courses if you think they address lower prerequisite grades or averages. It also says personal challenges that affected grades can be explained. An explanation is not an offer of admission.',
              sourceUrl: ubc, checked: '2026-11-06',
              action: 'Add an explanation of lower grades only if you want it in the application',
            },
            {
              id: 'director-exception', title: 'Other formal training or experience',
              detail: 'The admissions page says an applicant who does not meet the stated requirements, but who has other significant formal training, relevant professional experience or demonstrable knowledge, may be admitted on the recommendation of the Program Director and the approval of the Dean.',
              sourceUrl: ubc, checked: '2026-11-06',
              action: 'Read the exceptions paragraph before you rely on other training',
            },
          ],
        },
        {
          id: 'interview', kind: 'confirm', title: 'Recorded interview after submission',
          detail: 'The Vancouver programme sends a separate invitation by email after you submit. Follow that invitation for the recording instructions and your deadline.',
          action: 'Look for UBC Vancouver’s interview invitation after submitting',
        },
      ]),
      ...from('https://masterdatascience.ubc.ca/admissions/prerequisites', [{
        id: 'prerequisites', kind: 'courses', title: 'Proof of three prerequisite courses',
        detail: 'Gather proof of completion or enrolment for three 3-credit courses covering programming, probability or statistics, and either calculus or linear algebra. The prerequisites page describes which kinds of course it accepts. It does not name a list of outside courses.',
        action: 'Gather proof of enrolment or completion for the three UBC prerequisites',
        courses: {
          options: ['Programming', 'Probability or statistics', 'Calculus', 'Linear algebra'],
          groups: [['Programming'], ['Probability or statistics'], ['Calculus', 'Linear algebra']],
        },
        ways: [
          {
            id: 'equivalent-institution', title: 'Course at UBC or another university',
            detail: 'The prerequisites page says these courses can be taken at UBC or at an academic equivalent post-secondary institution. A course from another university does not have to match every listed learning objective, but there should be significant overlap. The page says the UBC Transfer Credit Search is for reference only and can change.',
            sourceUrl: 'https://masterdatascience.ubc.ca/admissions/prerequisites', checked: '2026-11-06',
            action: 'Ask UBC whether your course overlaps the listed prerequisite',
          },
          {
            id: 'accredited-distance', title: 'Accredited distance course on a transcript',
            detail: 'The same page accepts distance courses from accredited universities when they are credit-bearing, graded and listed on an official university transcript. It says online courses such as MOOCs, including Coursera, and adult or continuing-studies courses do not meet the prerequisite. If the prerequisites are already met, it says those online courses can be described as refresher courses.',
            sourceUrl: 'https://masterdatascience.ubc.ca/admissions/prerequisites', checked: '2026-11-06',
            action: 'Check that a distance course is graded, for credit and on a transcript',
          },
          {
            id: 'course-in-progress', title: 'One or two courses still unfinished',
            detail: 'If one or two prerequisites are still in progress, the page says the programme typically asks for an interim mark or a letter from the instructor. A future enrolment needs proof of enrolment. All prerequisites must be finished before the programme starts in September.',
            sourceUrl: 'https://masterdatascience.ubc.ca/admissions/prerequisites', checked: '2026-11-06',
            action: 'Collect an interim mark, instructor letter or proof of enrolment',
          },
        ],
      }]),
      ...from('https://masterdatascience.ubc.ca/admissions/international-students', [{
        id: 'english', kind: 'ielts', title: 'English evidence for Vancouver',
        detail: 'If the official language of instruction of your last undergraduate or graduate degree was not English, the international page requires an English test from the past 24 months. For Vancouver it states IELTS Academic, not General Training, at 7.0 overall and 6.5 in each component. Okanagan and Computational Linguistics use other figures on the same page.',
        action: 'Check the Vancouver English column for your test',
        ielts: { overall: 7, eachBand: 6.5 },
        ways: [
          {
            id: 'other-english-tests', title: 'TOEFL or Duolingo on the Vancouver column',
            detail: 'The same page also lists TOEFL and the Duolingo English Test in the Vancouver column. Read that column for the minimum it states. This check does not convert those scores, and it does not use the date-specific TOEFL figures in the Okanagan column.',
            sourceUrl: 'https://masterdatascience.ubc.ca/admissions/international-students', checked: '2026-11-06',
            action: 'Compare a TOEFL or Duolingo result with the Vancouver column',
          },
          {
            id: 'english-instruction', title: 'Degree taught in English',
            detail: 'The page requires those scores when the official language of instruction of your last undergraduate or graduate degree was not English. If English was the official language of instruction, use that condition on the page and confirm it with the programme. This check does not decide that your degree qualifies.',
            sourceUrl: 'https://masterdatascience.ubc.ca/admissions/international-students', checked: '2026-11-06',
            action: 'Confirm whether your degree’s language of instruction meets UBC’s condition',
          },
        ],
      }]),
    ],
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
    reviewed: '2026-11-06', validThrough: '2026-11-25',
    rules: from(iimb, [
      {
        id: 'references', kind: 'prepare', title: 'Two online references',
        detail: 'Arrange two referees to send their references directly through the IIMB system by the application deadline.',
        action: 'Arrange two referees for the IIMB online references',
      },
      {
        id: 'bachelors', kind: 'confirm', title: 'Bachelor’s degree result',
        detail: 'The admissions page asks for a bachelor’s degree in any discipline with at least 50% marks or an equivalent CGPA. It states 45% or an equivalent CGPA for applicants in the SC, ST and persons-with-disability categories. The page decides which line applies. This check does not convert a grade.',
        action: 'Compare your degree result with the percentage or CGPA line on the IIMB page',
        ways: [{
          id: 'equivalent-cgpa', title: 'Equivalent CGPA',
          detail: 'The page accepts an equivalent cumulative grade point average in place of the percentage. It does not print a conversion table on this page.',
          sourceUrl: iimb, checked: '2026-11-06',
          action: 'Ask IIMB how your CGPA is read against the stated percentage',
        }],
      },
      {
        id: 'scorecard', kind: 'prepare', title: 'GMAT or GRE scorecard',
        detail: 'Use a test-centre result that is valid when you submit. The page says an online GMAT or GRE taken at home will not be accepted for EPGP 2027. It accepts the test-taker copy while the official scorecard has not arrived, and it requires the official report for verification.',
        action: 'Prepare your scorecard and arrange official score delivery to IIMB',
        ways: [{
          id: 'test-taker-copy', title: 'Test-taker copy while the official report is pending',
          detail: 'The page says the application must include the official scorecard or the test-taker copy if the official scorecard has not yet arrived. The official report is still used for verification.',
          sourceUrl: iimb, checked: '2026-11-06',
          action: 'Keep a test-centre scorecard or the test-taker copy with the application',
        }],
      },
      {
        id: 'experience', kind: 'minimum', title: 'Post-degree work experience',
        detail: 'IIMB counts work after your bachelor’s degree and requires at least five years by 31 March 2027. The same page says preferably fewer than 12 years. Check how the dates on your experience records fit this rule.',
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
        detail: 'The master’s page invites Master of Engineering Management applicants to take ALEKS on a set date. A valid GRE or GMAT certificate may be used to request an exemption. A request is not an exemption.',
        action: 'Confirm your ALEKS arrangements or exemption with NU',
        ways: [{
          id: 'gre-gmat-exemption', title: 'Ask about a GRE or GMAT exemption',
          detail: 'The page says applicants who provide a valid GRE or GMAT certificate may request an exemption from ALEKS. It points to the school site for the arrangements. A request is not an exemption.',
          sourceUrl: nu, checked: '2026-11-06',
          action: 'If you have a valid GRE or GMAT certificate, ask NU about an ALEKS exemption',
        }],
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
    reviewed: '2026-11-06', validThrough: '2027-01-06',
    rules: from(oxford, [
      {
        id: 'statement', kind: 'prepare', title: 'Statement of purpose in English',
        detail: 'In up to 1,000 words, explain your relevant studies and experience, your scientific interests and why you want to take this course.',
        action: 'Draft the Oxford course statement within the 1,000-word limit',
      },
      {
        id: 'degree', kind: 'confirm', title: 'Subject and degree classification',
        detail: 'Oxford asks for an achieved or predicted UK first-class honours degree in computer science or mathematics, or an equivalent qualification. The course page also says a background in mathematical notation and basic programming is necessary. It says GRE and GMAT are not sought. Ask Oxford about a qualification the page does not describe.',
        action: 'Check how Oxford treats your subject and degree classification',
        ways: [
          {
            id: 'usa-gpa', title: 'USA bachelor’s GPA stated on the course page',
            detail: 'For a USA bachelor’s degree, the course page states a minimum overall GPA of normally 3.7 out of 4.0. That sentence is Oxford’s statement for that qualification. This check does not convert another grading system into that figure.',
            sourceUrl: oxford, checked: '2026-11-06',
            action: 'If your degree is a USA bachelor’s, read the 3.7 figure on the course page',
          },
          {
            id: 'international-qualifications', title: 'Other countries, on the page Oxford links',
            detail: 'The course page points qualifications from other countries to Oxford’s international qualifications guidance. This check does not decide whether a qualification is equivalent.',
            sourceUrl: oxford, checked: '2026-11-06',
            action: 'Open the qualifications page the course links for your country',
          },
          {
            id: 'programming-projects', title: 'Programming projects, including self-directed study',
            detail: 'The course page says the necessary programming background can include projects in employment, study or self-directed study. It says no specific language is prioritised. A project is not a place on the course.',
            sourceUrl: oxford, checked: '2026-11-06',
            action: 'Note the programming projects you would describe, in any language',
          },
        ],
      },
      {
        id: 'english', kind: 'ielts', title: 'IELTS Academic overall and skill bands',
        detail: 'If IELTS Academic is your English evidence, the course lists 7.5 overall and 7.0 in every skill. Check Oxford’s test date, format and exemption guidance.',
        action: 'Check your IELTS report against Oxford’s higher-level English requirement',
        ielts: { overall: 7.5, eachBand: 7 },
        ways: [
          {
            id: 'other-english-tests', title: 'Other higher-level tests, with the TOEFL date limit',
            detail: 'The course page also lists TOEFL iBT, C1 Advanced, C2 Proficiency and the Oxford Test of English Advanced. Read that page for the figures it states. It says the University will not accept TOEFL tests taken from 21 January 2026 until a review of the revised test is complete. This check does not convert those scores.',
            sourceUrl: oxford, checked: '2026-11-06',
            action: 'Read the listed English test, including the TOEFL date limit',
          },
          {
            id: 'two-year-window', title: 'Test taken within two years of the course start',
            detail: 'The course page says the English test must have been taken no more than two years before the course start date. The start date on the page for 2027–28 is 10 October 2027.',
            sourceUrl: oxford, checked: '2026-11-06',
            action: 'Check that your English test date is within two years of the course start',
          },
        ],
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
