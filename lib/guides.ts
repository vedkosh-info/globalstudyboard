import type { RegionSlug } from './regions';

// ─────────────────────────────────────────────────────────────────────────────
// Guides — SEO-focused, evergreen explainer content (the questions students
// actually search). One canonical unit per topic, one stable slug, under
// /guides/<slug>. See `.claude/rules/content-policy.md` (Tier-1 facts only, no
// fabricated cutoffs/fees; cite official sources + lastVerified; bilingual with
// graceful English fallback when a *Hi field is absent).
// ─────────────────────────────────────────────────────────────────────────────

export type GuideCategory =
  | 'exam-prep'
  | 'admissions'
  | 'study-abroad'
  | 'career'
  | 'comparison'
  | 'scholarships';

export interface GuideSource {
  /** Short human label, e.g. "NTA — JEE Main information bulletin". */
  label: string;
  /** Tier-1 official URL the facts were verified against. */
  url: string;
}

export interface GuideSection {
  headingEn: string;
  headingHi?: string;
  /** Plain prose; rendered as paragraphs (split on blank lines). */
  bodyEn: string;
  bodyHi?: string;
  /** Optional bullet list rendered under the prose. */
  bullets?: string[];
}

export interface GuideFaq {
  questionEn: string;
  questionHi?: string;
  answerEn: string;
  answerHi?: string;
}

export interface Guide {
  /** Stable slug, unique within guides. */
  slug: string;
  category: GuideCategory;
  /** Owning region (drives breadcrumbs + related links). */
  region: RegionSlug;
  titleEn: string;
  titleHi?: string;
  descriptionEn: string;
  descriptionHi?: string;
  /** Estimated read time in minutes. */
  readMinutes: number;
  sections: GuideSection[];
  faqs: GuideFaq[];
  /** Real exam slugs from admission-guides.ts. */
  relatedExamSlugs: string[];
  /** Real college slugs from colleges.ts. */
  relatedCollegeSlugs: string[];
  /** Other guide slugs to cross-link. */
  relatedGuideSlugs: string[];
  /** Tier-1 official sources the facts were verified against. */
  sources: GuideSource[];
  /** ISO date (YYYY-MM-DD) the facts were last verified. */
  lastVerified: string;
  keywords: string[];
}

const VERIFY = '2026-06-03';

export const GUIDES: Guide[] = [
  // ─────────────────────────────── Set 1 — JEE core ──────────────────────────
  {
    slug: 'jee-main-vs-jee-advanced-difference',
    category: 'comparison',
    region: 'india',
    titleEn: 'JEE Main vs JEE Advanced: What Is the Difference?',
    titleHi: 'जेईई मेन बनाम जेईई एडवांस्ड: क्या अंतर है?',
    descriptionEn:
      'A clear comparison of JEE Main and JEE Advanced — who conducts them, which colleges they lead to, eligibility, attempts, and how the two exams connect.',
    descriptionHi:
      'जेईई मेन और जेईई एडवांस्ड की स्पष्ट तुलना — कौन आयोजित करता है, किन कॉलेजों में प्रवेश मिलता है, पात्रता और दोनों परीक्षाओं का संबंध।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Two exams, one engineering pathway',
        headingHi: 'दो परीक्षाएँ, एक इंजीनियरिंग मार्ग',
        bodyEn:
          'JEE Main and JEE Advanced are two separate stages of the same admission journey to India\'s top engineering institutes. JEE Main comes first and is the qualifying exam; JEE Advanced is the second stage that only the top performers reach.\n\nThe simplest way to remember it: JEE Main opens the door to the NITs, IIITs, and centrally funded institutes, while JEE Advanced is the exam you must clear to enter the IITs.',
      },
      {
        headingEn: 'Who conducts each exam',
        bodyEn:
          'JEE Main is conducted by the National Testing Agency (NTA) and is held twice a year. JEE Advanced is conducted by one of the zonal IITs on a rotating basis, under the Joint Admission Board (JAB), and is held once a year.',
        bullets: [
          'JEE Main → National Testing Agency (NTA), twice a year',
          'JEE Advanced → one IIT (rotating), once a year',
        ],
      },
      {
        headingEn: 'Which colleges each one leads to',
        bodyEn:
          'A JEE Main rank is used for admission to the National Institutes of Technology (NITs), Indian Institutes of Information Technology (IIITs), and Government-Funded Technical Institutes (GFTIs), through the JoSAA counselling process.\n\nA JEE Advanced rank is used only for admission to the Indian Institutes of Technology (IITs) and a few other institutes such as IISc and the IISERs (through their own channels). You cannot sit JEE Advanced without first qualifying through JEE Main.',
      },
      {
        headingEn: 'Eligibility and attempts',
        bodyEn:
          'For JEE Main, candidates who have passed or are appearing in Class 12 (or an equivalent) with the required subjects may apply, and can attempt it in three consecutive years (each year has two sessions). For JEE Advanced, only a limited number of top JEE Main qualifiers are eligible — the official figure is the top 2,50,000 candidates — and it may be attempted a maximum of two times in two consecutive years.\n\nExact eligibility (subject requirements, Class 12 percentage norms for NIT/IIT admission, age and attempt rules) is set every year in the official information bulletin and can change, so confirm the current rules on the official websites before you apply.',
      },
      {
        headingEn: 'Difficulty and exam style',
        bodyEn:
          'JEE Main tests speed and accuracy across Physics, Chemistry, and Mathematics at the Class 11–12 level, with mostly objective questions. JEE Advanced tests deeper conceptual understanding and problem-solving and is widely regarded as significantly tougher, with a more variable pattern set fresh each year by the conducting IIT.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I have to clear JEE Main to write JEE Advanced?',
        answerEn:
          'Yes. JEE Advanced is open only to candidates who rank among the top qualifiers of JEE Main (Paper 1). You cannot register for JEE Advanced independently.',
      },
      {
        questionEn: 'Can I get into an IIT with only a JEE Main score?',
        answerEn:
          'No. IIT admission is based on the JEE Advanced rank. A JEE Main rank is used for NITs, IIITs, and GFTIs through JoSAA, not the IITs.',
      },
      {
        questionEn: 'How many times can I attempt each exam?',
        answerEn:
          'JEE Main can be attempted in three consecutive years (two sessions per year). JEE Advanced can be attempted a maximum of two times in two consecutive years. Verify the current-year rule in the official bulletin.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-delhi', 'nit-trichy'],
    relatedGuideSlugs: ['how-to-get-into-iit', 'josaa-counselling-process-explained', 'iit-vs-nit-which-is-better'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'JEE Advanced — official site', url: 'https://jeeadv.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['jee main vs advanced', 'difference between jee main and jee advanced', 'jee main jee advanced', 'iit nit admission exam'],
  },
  {
    slug: 'jee-main-eligibility-criteria',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'JEE Main Eligibility Criteria Explained',
    titleHi: 'जेईई मेन पात्रता मानदंड',
    descriptionEn:
      'Who can apply for JEE Main — Class 12 subject requirements, number of attempts, age policy, and the percentage norms that apply for NIT/IIIT admission.',
    descriptionHi:
      'जेईई मेन के लिए कौन आवेदन कर सकता है — कक्षा 12 विषय आवश्यकताएँ, प्रयासों की संख्या, आयु नीति और एनआईटी/आईआईआईटी प्रवेश के लिए प्रतिशत मानदंड।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Academic qualification',
        bodyEn:
          'To appear for JEE Main Paper 1 (B.E./B.Tech), you must have passed the Class 12 examination (or an equivalent qualifying examination) with the required subjects, or be appearing in it in the current year. Physics and Mathematics are compulsory subjects, along with one of Chemistry, Biotechnology, Biology, or a technical vocational subject.',
      },
      {
        headingEn: 'Number of attempts',
        bodyEn:
          'Candidates can attempt JEE Main in three consecutive years. JEE Main is conducted twice a year, and a candidate may appear in both sessions in the same year — both sessions in one year together count as one year of attempts.',
      },
      {
        headingEn: 'Age limit',
        bodyEn:
          'There is no age limit to appear for JEE Main. Candidates of any age who meet the qualifying-examination requirement can apply. However, individual institutes you seek admission to may set their own age criteria, so check those separately.',
      },
      {
        headingEn: 'Percentage norms for admission',
        bodyEn:
          'Qualifying for JEE Main and getting admission are two different things. For admission to NITs, IIITs, and GFTIs through JoSAA, candidates generally need to meet a Class 12 performance norm — historically either a minimum aggregate percentage or a position within the top percentile of their board. These norms are set each year and have changed in the past, so always confirm the current requirement in the official information bulletin before relying on it.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is there an age limit for JEE Main?',
        answerEn:
          'No, there is no age limit for appearing in JEE Main. Admitting institutes may, however, have their own age rules.',
      },
      {
        questionEn: 'How many times can I give JEE Main?',
        answerEn:
          'You can appear in three consecutive years, with two sessions available each year.',
      },
      {
        questionEn: 'Do I need Chemistry to write JEE Main?',
        answerEn:
          'Physics and Mathematics are compulsory. The third subject can be Chemistry, Biology, Biotechnology, or a technical vocational subject. Confirm the exact list in the official bulletin.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['nit-trichy', 'iit-bombay'],
    relatedGuideSlugs: ['how-to-apply-for-jee-main', 'jee-main-exam-pattern-and-syllabus', 'jee-main-vs-jee-advanced-difference'],
    sources: [{ label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' }],
    lastVerified: VERIFY,
    keywords: ['jee main eligibility', 'jee main age limit', 'jee main attempts', 'jee main qualification'],
  },
  {
    slug: 'how-to-apply-for-jee-main',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'How to Apply for JEE Main: Step-by-Step',
    titleHi: 'जेईई मेन के लिए आवेदन कैसे करें: चरण-दर-चरण',
    descriptionEn:
      'A step-by-step walkthrough of the JEE Main application — registration, filling the form, uploading documents, paying the fee, and downloading the admit card.',
    descriptionHi:
      'जेईई मेन आवेदन की चरण-दर-चरण मार्गदर्शिका — पंजीकरण, फॉर्म भरना, दस्तावेज़ अपलोड करना, शुल्क भुगतान और एडमिट कार्ड डाउनलोड करना।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Where to apply',
        bodyEn:
          'JEE Main applications are accepted only on the official NTA JEE Main website. Do not use third-party sites to register. Application windows open separately for each session, so note the official dates announced in the information bulletin.',
      },
      {
        headingEn: 'Step-by-step process',
        bodyEn: 'The application follows a standard sequence on the official portal:',
        bullets: [
          'Register with a valid email ID and mobile number to create your application number and password.',
          'Fill in the application form — personal details, academic details, exam city preferences, and paper choice.',
          'Upload scanned documents in the specified format (recent photograph and signature).',
          'Pay the application fee online (the fee varies by category, paper, and centre — see the official bulletin).',
          'Submit and download the confirmation page for your records.',
          'Download the admit card when released, and carry it to the exam centre with a valid photo ID.',
        ],
      },
      {
        headingEn: 'Documents to keep ready',
        bodyEn:
          'Before you start, keep your Class 10 and Class 12 details, a valid photo ID, a recent passport-size photograph, and your signature ready in the formats specified on the official site. Having these ready avoids errors during form-filling.',
      },
      {
        headingEn: 'Fees and corrections',
        bodyEn:
          'The application fee depends on your category, gender, the paper(s) chosen, and whether the centre is in India or abroad. NTA usually opens a short correction window after the application closes, during which limited fields can be edited. Fee amounts and correction rules are set each cycle — verify them on the official website before paying.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can I apply for JEE Main offline?',
        answerEn:
          'No. JEE Main registration is fully online through the official NTA website. There is no offline or paper application.',
      },
      {
        questionEn: 'What if I make a mistake in the form?',
        answerEn:
          'NTA typically provides a correction window after the application period closes, allowing limited edits. Check the official notice for the exact dates and which fields can be changed.',
      },
      {
        questionEn: 'Do I need to apply separately for both sessions?',
        answerEn:
          'You can opt for one or both sessions. Review the current bulletin for how to apply for each session and the associated fee.',
      },
    ],
    relatedExamSlugs: ['jee-main'],
    relatedCollegeSlugs: ['nit-trichy'],
    relatedGuideSlugs: ['jee-main-eligibility-criteria', 'jee-main-exam-pattern-and-syllabus', 'josaa-counselling-process-explained'],
    sources: [{ label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' }],
    lastVerified: VERIFY,
    keywords: ['how to apply for jee main', 'jee main registration', 'jee main application form', 'jee main admit card'],
  },
  {
    slug: 'jee-main-exam-pattern-and-syllabus',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'JEE Main Exam Pattern and Syllabus',
    titleHi: 'जेईई मेन परीक्षा पैटर्न और पाठ्यक्रम',
    descriptionEn:
      'The structure of JEE Main Paper 1 — subjects, question types, marking scheme, duration, and where the syllabus comes from.',
    descriptionHi:
      'जेईई मेन पेपर 1 की संरचना — विषय, प्रश्न प्रकार, अंकन योजना, अवधि और पाठ्यक्रम का स्रोत।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Paper 1 structure',
        bodyEn:
          'JEE Main Paper 1 (for B.E./B.Tech) is a computer-based test covering three subjects — Physics, Chemistry, and Mathematics — with equal weight. The total is 300 marks and the duration is three hours. Each subject is split into two sections: Section A with multiple-choice questions and Section B with numerical-answer questions.',
      },
      {
        headingEn: 'Marking scheme',
        bodyEn:
          'JEE Main uses a +4 / −1 marking scheme: four marks for a correct answer and one mark deducted for a wrong answer. Unattempted questions score zero. The exact number of questions to attempt in the numerical section and the negative-marking rule for it are specified in the official bulletin each year, so confirm the current scheme there.',
        bullets: [
          'Correct answer: +4 marks',
          'Incorrect answer: −1 mark',
          'Unattempted: 0 marks',
        ],
      },
      {
        headingEn: 'Subjects and weight',
        bodyEn:
          'Physics, Chemistry, and Mathematics carry equal marks. Paper 2 is a separate paper for B.Arch and B.Planning aspirants and additionally tests aptitude and drawing/planning, with its own pattern.',
      },
      {
        headingEn: 'Syllabus source',
        bodyEn:
          'The JEE Main syllabus is published officially by NTA and is based on the Class 11 and Class 12 curriculum. Because the official syllabus is occasionally revised, download the current syllabus PDF from the official JEE Main website rather than relying on older copies.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is there negative marking in JEE Main?',
        answerEn:
          'Yes. JEE Main uses +4 for a correct answer and −1 for a wrong answer. Confirm how negative marking applies to the numerical section in the current official bulletin.',
      },
      {
        questionEn: 'How long is JEE Main Paper 1?',
        answerEn: 'Paper 1 is three hours long and is conducted as a computer-based test.',
      },
      {
        questionEn: 'Where can I find the official syllabus?',
        answerEn:
          'The official syllabus is published on the NTA JEE Main website. Always use the latest version, as it can be revised.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'nit-trichy'],
    relatedGuideSlugs: ['jee-main-eligibility-criteria', 'how-to-apply-for-jee-main', 'jee-main-vs-jee-advanced-difference'],
    sources: [{ label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' }],
    lastVerified: VERIFY,
    keywords: ['jee main exam pattern', 'jee main syllabus', 'jee main marking scheme', 'jee main paper 1 structure'],
  },
  {
    slug: 'josaa-counselling-process-explained',
    category: 'admissions',
    region: 'india',
    titleEn: 'JoSAA Counselling Process Explained',
    titleHi: 'जोसा काउंसलिंग प्रक्रिया की व्याख्या',
    descriptionEn:
      'How seat allocation works after JEE — registration, choice filling, rounds, the float/slide/freeze options, and how IIT and NIT seats are allotted.',
    descriptionHi:
      'जेईई के बाद सीट आवंटन कैसे होता है — पंजीकरण, चॉइस फिलिंग, राउंड, फ्लोट/स्लाइड/फ्रीज़ विकल्प और आईआईटी/एनआईटी सीटें कैसे आवंटित होती हैं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What JoSAA does',
        bodyEn:
          'The Joint Seat Allocation Authority (JoSAA) conducts the single, combined counselling process that allots seats across the IITs, NITs, IIITs, and other Government-Funded Technical Institutes (GFTIs). IIT seats are allotted on the basis of the JEE Advanced rank, while NIT, IIIT, and GFTI seats are allotted on the basis of the JEE Main rank.',
      },
      {
        headingEn: 'The step-by-step flow',
        bodyEn: 'JoSAA counselling typically follows this sequence:',
        bullets: [
          'Register on the official JoSAA portal using your JEE credentials.',
          'Fill and lock your choices — list colleges and branches in your true order of preference.',
          'Seats are allotted over several rounds based on rank, category, and your locked choices.',
          'For each allotment you can Freeze (accept and stop), Float (accept but stay open to higher preferences), or Slide (accept but stay open to better branches in the same institute).',
          'Confirm the seat by paying the seat-acceptance fee and completing online reporting / document verification.',
          'Later rounds may upgrade your seat based on your float/slide choice and vacancies.',
        ],
      },
      {
        headingEn: 'Choice filling matters most',
        bodyEn:
          'Your choice list is the single most important step. Allotment is strictly by preference order and rank, so list every option you would genuinely accept, in the order you actually prefer — not in the order you think you will "get". Leaving out an option means you can never be allotted it.',
      },
      {
        headingEn: 'After JoSAA: CSAB special rounds',
        bodyEn:
          'After the main JoSAA rounds conclude, the Central Seat Allocation Board (CSAB) usually conducts special rounds to fill seats that remain vacant in the NIT+ system. These are a separate registration. The number of rounds and exact dates are announced officially each year — verify them on the official JoSAA and CSAB websites.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is JoSAA counselling for both IITs and NITs?',
        answerEn:
          'Yes. JoSAA runs one combined process: IIT seats are allotted on the JEE Advanced rank and NIT/IIIT/GFTI seats on the JEE Main rank.',
      },
      {
        questionEn: 'What is the difference between Float, Slide, and Freeze?',
        answerEn:
          'Freeze means you accept the seat and want no further changes. Float means you accept but remain open to any higher-preference seat. Slide means you accept but remain open only to better branches in the same institute.',
      },
      {
        questionEn: 'What happens if I do not get a seat in JoSAA?',
        answerEn:
          'You can participate in the CSAB special rounds, which fill remaining vacant seats in the NIT+ system through a separate registration.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-delhi', 'iit-madras', 'nit-trichy'],
    relatedGuideSlugs: ['how-to-get-into-iit', 'iit-vs-nit-which-is-better', 'jee-main-vs-jee-advanced-difference'],
    sources: [
      { label: 'JoSAA — official site', url: 'https://josaa.nic.in' },
      { label: 'JEE Advanced — official site', url: 'https://jeeadv.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['josaa counselling', 'josaa choice filling', 'jee seat allocation', 'float slide freeze josaa', 'csab special round'],
  },

  // ──────────────────────────── Set 2 — IIT / NIT ────────────────────────────
  {
    slug: 'how-to-get-into-iit',
    category: 'admissions',
    region: 'india',
    titleEn: 'How to Get Into an IIT: The Complete Path',
    titleHi: 'आईआईटी में प्रवेश कैसे पाएं: पूरा मार्ग',
    descriptionEn:
      'The end-to-end route to an IIT seat — clearing JEE Main, qualifying for JEE Advanced, the Class 12 requirement, and seat allocation through JoSAA.',
    descriptionHi:
      'आईआईटी सीट तक पहुँचने का पूरा रास्ता — जेईई मेन पास करना, जेईई एडवांस्ड के लिए क्वालिफाई करना, कक्षा 12 की आवश्यकता और जोसा के माध्यम से सीट आवंटन।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The route in one line',
        headingHi: 'एक पंक्ति में मार्ग',
        bodyEn:
          'Admission to the IITs runs through a single, fixed pathway: clear JEE Main, finish among the top qualifiers to become eligible for JEE Advanced, clear JEE Advanced, and then secure a seat through the JoSAA counselling process. There is no other entrance route into the IITs for B.Tech programmes.',
      },
      {
        headingEn: 'Step 1 — Class 12 with the right subjects',
        bodyEn:
          'You must have passed (or be appearing in) Class 12 or an equivalent qualifying examination with the required subjects — Physics and Mathematics are compulsory, plus one of Chemistry, Biology, Biotechnology, or a technical vocational subject. IIT admission also has a Class 12 performance norm (historically a minimum aggregate or a top-percentile position of your board), which is set each year, so confirm the current norm in the official information brochure.',
      },
      {
        headingEn: 'Step 2 — Clear JEE Main and qualify for JEE Advanced',
        bodyEn:
          'JEE Main is conducted by the NTA twice a year. Only a limited number of top JEE Main performers become eligible to register for JEE Advanced — the official figure is the top 2,50,000 candidates (across categories). Your goal in JEE Main, if your target is an IIT, is to finish well within this eligibility band.',
        bullets: [
          'JEE Main → qualify within the top band to unlock JEE Advanced',
          'JEE Advanced is attempted a maximum of two times in two consecutive years',
        ],
      },
      {
        headingEn: 'Step 3 — Clear JEE Advanced',
        bodyEn:
          'JEE Advanced is conducted by one of the zonal IITs and is the actual entrance exam for the IITs. It tests deeper conceptual understanding than JEE Main, and the pattern is set fresh each year. Your rank here determines which IITs and branches you can be allotted.',
      },
      {
        headingEn: 'Step 4 — JoSAA counselling',
        bodyEn:
          'A rank alone does not give you a seat — you must register for JoSAA counselling and fill your choices of institute and branch in true order of preference. Seats are allotted over several rounds based on your rank, category, and locked choices. Read our JoSAA guide for the full float/slide/freeze process.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can I get into an IIT through JEE Main alone?',
        answerEn:
          'No. IIT B.Tech admission requires a JEE Advanced rank. JEE Main only decides your eligibility for JEE Advanced (and is used for NITs/IIITs/GFTIs separately).',
      },
      {
        questionEn: 'How many attempts do I get for JEE Advanced?',
        answerEn:
          'JEE Advanced can be attempted a maximum of two times in two consecutive years, and only if you are among the eligible JEE Main qualifiers. Confirm the current rule in the official brochure.',
      },
      {
        questionEn: 'Is there a Class 12 marks requirement for IITs?',
        answerEn:
          'Yes, there is a Class 12 performance norm for IIT admission, set each year. Always check the current requirement in the official JEE Advanced brochure.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur'],
    relatedGuideSlugs: ['jee-main-vs-jee-advanced-difference', 'josaa-counselling-process-explained', 'list-of-all-iits-in-india'],
    sources: [
      { label: 'JEE Advanced — official site', url: 'https://jeeadv.ac.in' },
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'JoSAA — official site', url: 'https://josaa.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to get into iit', 'iit admission process', 'how to crack jee advanced', 'iit eligibility', 'iit btech admission'],
  },
  {
    slug: 'iit-vs-nit-which-is-better',
    category: 'comparison',
    region: 'india',
    titleEn: 'IIT vs NIT: How to Compare Them',
    titleHi: 'आईआईटी बनाम एनआईटी: तुलना कैसे करें',
    descriptionEn:
      'A neutral comparison of IITs and NITs — the entrance route, how seats are allotted, and the factors that actually matter when you choose between them.',
    descriptionHi:
      'आईआईटी और एनआईटी की निष्पक्ष तुलना — प्रवेश मार्ग, सीटें कैसे आवंटित होती हैं और चुनते समय वास्तव में मायने रखने वाले कारक।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Different entrance routes',
        headingHi: 'अलग प्रवेश मार्ग',
        bodyEn:
          'The clearest difference is the exam. The IITs admit through JEE Advanced (which itself requires qualifying through JEE Main first), while the NITs admit through your JEE Main rank. Both then allot seats through the common JoSAA counselling process.',
        bullets: [
          'IITs → JEE Main → JEE Advanced → JoSAA',
          'NITs → JEE Main → JoSAA',
        ],
      },
      {
        headingEn: 'Both are premier government institutes',
        bodyEn:
          'The IITs (Indian Institutes of Technology) and the NITs (National Institutes of Technology) are both Institutes of National Importance, funded by the Government of India. They are highly regarded engineering institutions, and a strong branch at a strong NIT is a sought-after outcome in its own right.',
      },
      {
        headingEn: 'Factors that actually matter when choosing',
        bodyEn:
          'Rather than asking which is "better" in the abstract, weigh the specific institute and branch you are likely to be allotted against your own priorities:',
        bullets: [
          'The specific branch on offer — branch often matters more than the label',
          'Location and proximity to home',
          'The specific institute (IITs and NITs each vary widely between campuses)',
          'Your rank and what is realistically attainable in JoSAA',
          'Programmes, facilities and opportunities relevant to your interests',
        ],
      },
      {
        headingEn: 'How to decide for your case',
        bodyEn:
          'Because allotment depends on your rank and category and on cut-offs that change every year, the right comparison is always between the actual options in front of you — for example, a particular branch at a particular IIT versus a particular branch at a particular NIT. Use JoSAA\'s choice-filling to list every option you would accept in your genuine order of preference, and verify current-year details on the official institute websites.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is the entrance exam the same for IITs and NITs?',
        answerEn:
          'Both start with JEE Main. NIT admission uses the JEE Main rank, while IIT admission additionally requires clearing JEE Advanced. Seat allocation for both happens through JoSAA.',
      },
      {
        questionEn: 'Should I pick branch or institute first?',
        answerEn:
          'There is no universal answer — it depends on your priorities. Many students weigh the specific branch heavily, but location, the specific campus, and your own goals all matter. List your true preferences in JoSAA.',
      },
      {
        questionEn: 'Are NITs government institutes too?',
        answerEn:
          'Yes. Both IITs and NITs are Institutes of National Importance funded by the Government of India.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'nit-trichy', 'iit-madras'],
    relatedGuideSlugs: ['how-to-get-into-iit', 'josaa-counselling-process-explained', 'jee-main-vs-jee-advanced-difference'],
    sources: [
      { label: 'JEE Advanced — official site', url: 'https://jeeadv.ac.in' },
      { label: 'JoSAA — official site', url: 'https://josaa.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['iit vs nit', 'iit or nit', 'difference between iit and nit', 'nit vs iit which is better'],
  },
  {
    slug: 'list-of-all-iits-in-india',
    category: 'admissions',
    region: 'india',
    titleEn: 'List of All IITs in India',
    titleHi: 'भारत के सभी आईआईटी की सूची',
    descriptionEn:
      'A complete list of the Indian Institutes of Technology (IITs) and their locations — the institutes you can be allotted through JEE Advanced and JoSAA.',
    descriptionHi:
      'भारतीय प्रौद्योगिकी संस्थानों (आईआईटी) और उनके स्थानों की पूरी सूची — वे संस्थान जिनमें जेईई एडवांस्ड और जोसा के माध्यम से प्रवेश मिल सकता है।',
    readMinutes: 4,
    sections: [
      {
        headingEn: 'There are 23 IITs',
        headingHi: '23 आईआईटी हैं',
        bodyEn:
          'India currently has 23 Indian Institutes of Technology (IITs), spread across the country. All of them admit B.Tech students through the JEE Advanced exam and the common JoSAA counselling process. The participating IITs for a given year are listed officially on the JEE Advanced website — always confirm the current list there, as the system can change.',
      },
      {
        headingEn: 'The IITs and their locations',
        bodyEn: 'Listed below are the IITs with their host cities:',
        bullets: [
          'IIT Kharagpur — Kharagpur, West Bengal',
          'IIT Bombay — Mumbai, Maharashtra',
          'IIT Madras — Chennai, Tamil Nadu',
          'IIT Kanpur — Kanpur, Uttar Pradesh',
          'IIT Delhi — New Delhi',
          'IIT Guwahati — Guwahati, Assam',
          'IIT Roorkee — Roorkee, Uttarakhand',
          'IIT Ropar — Rupnagar, Punjab',
          'IIT Bhubaneswar — Bhubaneswar, Odisha',
          'IIT Gandhinagar — Gandhinagar, Gujarat',
          'IIT Hyderabad — Hyderabad, Telangana',
          'IIT Jodhpur — Jodhpur, Rajasthan',
          'IIT Patna — Patna, Bihar',
          'IIT Indore — Indore, Madhya Pradesh',
          'IIT Mandi — Mandi, Himachal Pradesh',
          'IIT (BHU) Varanasi — Varanasi, Uttar Pradesh',
          'IIT Palakkad — Palakkad, Kerala',
          'IIT Tirupati — Tirupati, Andhra Pradesh',
          'IIT (ISM) Dhanbad — Dhanbad, Jharkhand',
          'IIT Bhilai — Bhilai, Chhattisgarh',
          'IIT Goa — Goa',
          'IIT Jammu — Jammu, Jammu & Kashmir',
          'IIT Dharwad — Dharwad, Karnataka',
        ],
      },
      {
        headingEn: 'How admission works across all IITs',
        bodyEn:
          'Every IIT in this list admits undergraduates through the same process: clear JEE Main, qualify for and clear JEE Advanced, then choose your institute and branch in JoSAA counselling. Programmes, seat counts, and branches differ between campuses and are revised each year, so check each institute\'s official website for current details.',
      },
    ],
    faqs: [
      {
        questionEn: 'How many IITs are there in India?',
        answerEn:
          'There are 23 IITs. The official participating list for any admission year is published on the JEE Advanced website.',
      },
      {
        questionEn: 'Do all IITs admit through the same exam?',
        answerEn:
          'Yes. All IITs admit B.Tech students through JEE Advanced (which requires qualifying via JEE Main) and JoSAA counselling.',
      },
      {
        questionEn: 'Which is the oldest IIT?',
        answerEn:
          'IIT Kharagpur was the first IIT established. For institute histories and current details, refer to each institute\'s official website.',
      },
    ],
    relatedExamSlugs: ['jee-advanced', 'jee-main'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-delhi', 'iit-madras', 'iit-kanpur', 'iit-kharagpur'],
    relatedGuideSlugs: ['how-to-get-into-iit', 'iit-vs-nit-which-is-better', 'iit-branch-change-rules'],
    sources: [
      { label: 'JEE Advanced — participating institutes', url: 'https://jeeadv.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['list of iits', 'all iits in india', 'how many iits', 'iit list with location', '23 iits'],
  },
  {
    slug: 'iit-branch-change-rules',
    category: 'admissions',
    region: 'india',
    titleEn: 'IIT Branch Change Rules Explained',
    titleHi: 'आईआईटी ब्रांच चेंज नियम',
    descriptionEn:
      'How branch change works at the IITs after the first year — the general process, common conditions, and why the exact rules vary by institute.',
    descriptionHi:
      'पहले वर्ष के बाद आईआईटी में ब्रांच चेंज कैसे होता है — सामान्य प्रक्रिया, सामान्य शर्तें और नियम संस्थान के अनुसार क्यों भिन्न होते हैं।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What "branch change" means',
        headingHi: '"ब्रांच चेंज" का क्या मतलब है',
        bodyEn:
          'Many IITs allow a limited number of students to change their branch (department) after the first year, based mainly on their first-year academic performance. It is a way for students who did very well in the first year to move into a different branch, subject to seats and rules.',
      },
      {
        headingEn: 'How it generally works',
        bodyEn:
          'While the precise policy differs between institutes, the common pattern is:',
        bullets: [
          'Branch change is usually considered after the first year, based on first-year CGPA.',
          'A minimum CGPA threshold typically applies to be eligible to request a change.',
          'Changes are subject to seat availability and caps on how many can leave or join a branch.',
          'It is competitive — higher first-year performance improves your chances.',
        ],
      },
      {
        headingEn: 'Rules vary by institute',
        bodyEn:
          'Crucially, there is no single all-IIT branch-change rule. Each IIT sets its own eligibility criteria, CGPA cut-offs, seat limits, and procedure, and these are revised over time. Do not rely on another institute\'s policy or an old version — read the current academic regulations of the specific IIT you join.',
      },
      {
        headingEn: 'A practical note for applicants',
        bodyEn:
          'Because branch change is limited and competitive, it is safer to treat it as a possible bonus rather than a guaranteed plan. When filling JoSAA choices, list branches and institutes you would genuinely be content to study, instead of assuming you will switch later.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can every IIT student change their branch?',
        answerEn:
          'No. Branch change is limited, competitive, and based largely on first-year performance, subject to seat availability. Eligibility and rules differ by institute.',
      },
      {
        questionEn: 'When does branch change happen?',
        answerEn:
          'It is typically considered after the first year, based on first-year CGPA. Check the specific IIT\'s current academic regulations for exact timing.',
      },
      {
        questionEn: 'Are the branch change rules the same at all IITs?',
        answerEn:
          'No. Each IIT sets its own criteria, CGPA thresholds, and seat limits, and these change over time. Always refer to your institute\'s official regulations.',
      },
    ],
    relatedExamSlugs: ['jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-delhi', 'iit-kanpur'],
    relatedGuideSlugs: ['how-to-get-into-iit', 'list-of-all-iits-in-india', 'iit-vs-nit-which-is-better'],
    sources: [
      { label: 'JEE Advanced — official site (for participating IITs)', url: 'https://jeeadv.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['iit branch change', 'branch change in iit', 'iit branch change rules', 'change branch after first year iit'],
  },
  {
    slug: 'iit-vs-iiit-difference',
    category: 'comparison',
    region: 'india',
    titleEn: 'IIT vs IIIT: What Is the Difference?',
    titleHi: 'आईआईटी बनाम आईआईआईटी: क्या अंतर है?',
    descriptionEn:
      'How IITs and IIITs differ — full names, focus, the entrance exam each uses, and how seats are allotted.',
    descriptionHi:
      'आईआईटी और आईआईआईटी कैसे भिन्न हैं — पूर्ण नाम, फोकस, प्रत्येक की प्रवेश परीक्षा और सीटें कैसे आवंटित होती हैं।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'They are different institute systems',
        headingHi: 'ये अलग संस्थान प्रणालियाँ हैं',
        bodyEn:
          'IIT stands for Indian Institute of Technology, and IIIT stands for Indian Institute of Information Technology. Despite the similar acronyms, they are separate systems of institutes with different focuses and, importantly, different entrance routes.',
      },
      {
        headingEn: 'Focus',
        bodyEn:
          'IITs offer a broad range of engineering, science, and technology disciplines. IIITs, as the name suggests, focus on information technology and related computing fields, though many also offer other engineering branches. Confirm the exact programmes on each institute\'s official website.',
      },
      {
        headingEn: 'The entrance exam differs',
        bodyEn:
          'This is the most practical difference. IITs admit through JEE Advanced (after qualifying via JEE Main). Many IIITs admit through the JEE Main rank via JoSAA, although some IIITs run their own admission process. Always check the admission route for the specific IIIT you are interested in.',
        bullets: [
          'IITs → JEE Advanced (via JEE Main) → JoSAA',
          'Many IIITs → JEE Main → JoSAA (some IIITs have their own process)',
        ],
      },
      {
        headingEn: 'Which to consider',
        bodyEn:
          'Both are respected routes into technology education. The right choice depends on the specific institute, branch, your rank, and your interests — not the acronym alone. As always, compare the actual options available to you in JoSAA and verify current-year details on the official institute and JoSAA websites.',
      },
    ],
    faqs: [
      {
        questionEn: 'What do IIT and IIIT stand for?',
        answerEn:
          'IIT is Indian Institute of Technology; IIIT is Indian Institute of Information Technology. They are separate institute systems.',
      },
      {
        questionEn: 'Do IITs and IIITs use the same entrance exam?',
        answerEn:
          'Not exactly. IITs require JEE Advanced (after JEE Main). Many IIITs admit through the JEE Main rank via JoSAA, while some IIITs run their own admission process. Check the specific IIIT.',
      },
      {
        questionEn: 'Is an IIIT only for IT and computing?',
        answerEn:
          'IIITs focus on information technology and computing, but many also offer other engineering branches. Verify the programmes on each institute\'s official website.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-madras'],
    relatedGuideSlugs: ['iit-vs-nit-which-is-better', 'how-to-get-into-iit', 'jee-main-vs-jee-advanced-difference'],
    sources: [
      { label: 'JEE Advanced — official site', url: 'https://jeeadv.ac.in' },
      { label: 'JoSAA — official site', url: 'https://josaa.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['iit vs iiit', 'difference between iit and iiit', 'iiit vs iit', 'what is iiit'],
  },

  // ─────────────────────────── Set 3 — NEET / medical ────────────────────────
  {
    slug: 'neet-ug-eligibility-criteria',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'NEET UG Eligibility Criteria Explained',
    titleHi: 'नीट यूजी पात्रता मानदंड',
    descriptionEn:
      'Who can apply for NEET UG — the Class 12 subject requirement, the minimum marks norm, age policy, and number of attempts.',
    descriptionHi:
      'नीट यूजी के लिए कौन आवेदन कर सकता है — कक्षा 12 विषय आवश्यकता, न्यूनतम अंक मानदंड, आयु नीति और प्रयासों की संख्या।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Academic qualification',
        headingHi: 'शैक्षणिक योग्यता',
        bodyEn:
          'NEET UG is for candidates who have passed (or are appearing in) Class 12 or an equivalent qualifying examination with Physics, Chemistry, and Biology/Biotechnology, along with English. Biology is essential — NEET is a medical entrance test, so the PCB combination is required.',
      },
      {
        headingEn: 'Minimum marks norm',
        bodyEn:
          'There is a minimum aggregate-marks requirement in the qualifying subjects (Physics, Chemistry, and Biology) that varies by category. These qualifying percentages are set officially each year and have been revised in the past, so confirm the current norm in the official NEET information bulletin rather than relying on older figures.',
      },
      {
        headingEn: 'Age limit',
        bodyEn:
          'A minimum age requirement applies — candidates must reach a specified minimum age by a cut-off date in the admission year. The question of an upper age limit has changed over time and been subject to official notifications, so always verify the current age rule in the official bulletin before applying.',
      },
      {
        headingEn: 'Number of attempts',
        bodyEn:
          'There is no official cap on the number of attempts for NEET UG — candidates may appear in multiple years subject to meeting the eligibility criteria. Because eligibility rules can be updated, check the current bulletin each year.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is Biology compulsory for NEET?',
        answerEn:
          'Yes. NEET UG requires Physics, Chemistry, and Biology/Biotechnology in Class 12. It is a medical entrance test, so the PCB combination is essential.',
      },
      {
        questionEn: 'How many times can I attempt NEET?',
        answerEn:
          'There is no official limit on the number of attempts, as long as you meet the eligibility criteria. Verify the current rules in the official bulletin.',
      },
      {
        questionEn: 'Is there an age limit for NEET UG?',
        answerEn:
          'A minimum age applies. The upper age limit has changed over time through official notifications, so confirm the current age rule in the official NEET bulletin.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: ['aiims-delhi'],
    relatedGuideSlugs: ['neet-exam-pattern-and-syllabus', 'how-to-become-a-doctor-in-india', 'neet-counselling-process-mcc'],
    sources: [
      { label: 'NTA — NEET official site', url: 'https://neet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['neet eligibility', 'neet ug eligibility criteria', 'neet age limit', 'neet qualification', 'neet attempts'],
  },
  {
    slug: 'neet-exam-pattern-and-syllabus',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'NEET Exam Pattern and Syllabus',
    titleHi: 'नीट परीक्षा पैटर्न और पाठ्यक्रम',
    descriptionEn:
      'The structure of NEET UG — subjects, number of questions, marking scheme, mode, duration, and where the official syllabus comes from.',
    descriptionHi:
      'नीट यूजी की संरचना — विषय, प्रश्नों की संख्या, अंकन योजना, मोड, अवधि और आधिकारिक पाठ्यक्रम का स्रोत।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Subjects and mode',
        headingHi: 'विषय और मोड',
        bodyEn:
          'NEET UG is a pen-and-paper (offline) test covering three subjects — Physics, Chemistry, and Biology (Botany and Zoology) — based on the Class 11 and Class 12 curriculum. Biology carries the largest share of questions, reflecting its weight in a medical entrance test.',
      },
      {
        headingEn: 'Marking scheme',
        bodyEn:
          'NEET uses a +4 / −1 marking scheme: four marks for each correct answer and one mark deducted for each wrong answer, with the paper scored out of 720. The exact number of questions, the structure of any optional section, and the negative-marking rule are specified in the official bulletin each year, so confirm the current pattern there.',
        bullets: [
          'Correct answer: +4 marks',
          'Incorrect answer: −1 mark',
          'Unattempted: 0 marks',
          'Total: 720 marks',
        ],
      },
      {
        headingEn: 'Duration',
        bodyEn:
          'NEET UG is conducted over a fixed duration (in recent years, three hours and twenty minutes). As timing has been adjusted in the past, verify the current duration in the official information bulletin before exam day.',
      },
      {
        headingEn: 'Syllabus source',
        bodyEn:
          'The NEET syllabus is published officially and is based on the Class 11 and Class 12 Physics, Chemistry, and Biology curriculum. The syllabus is periodically reviewed, so download the latest official syllabus rather than relying on older copies.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is there negative marking in NEET?',
        answerEn:
          'Yes. NEET uses +4 for a correct answer and −1 for a wrong answer, out of a total of 720 marks. Confirm the current question structure in the official bulletin.',
      },
      {
        questionEn: 'Is NEET online or offline?',
        answerEn:
          'NEET UG is conducted in offline, pen-and-paper (OMR) mode. Confirm the mode for the current year in the official notification.',
      },
      {
        questionEn: 'Which subject has the most questions?',
        answerEn:
          'Biology (Botany and Zoology together) carries the largest share of questions, reflecting its weight in a medical entrance exam.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: ['aiims-delhi'],
    relatedGuideSlugs: ['neet-ug-eligibility-criteria', 'how-to-become-a-doctor-in-india', 'neet-counselling-process-mcc'],
    sources: [
      { label: 'NTA — NEET official site', url: 'https://neet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['neet exam pattern', 'neet syllabus', 'neet marking scheme', 'neet total marks', 'neet 720 marks'],
  },
  {
    slug: 'how-to-become-a-doctor-in-india',
    category: 'career',
    region: 'india',
    titleEn: 'How to Become a Doctor in India',
    titleHi: 'भारत में डॉक्टर कैसे बनें',
    descriptionEn:
      'The step-by-step path to becoming a doctor in India — NEET, the MBBS degree, internship, registration, and the route to specialisation.',
    descriptionHi:
      'भारत में डॉक्टर बनने का चरण-दर-चरण मार्ग — नीट, एमबीबीएस डिग्री, इंटर्नशिप, पंजीकरण और विशेषज्ञता का मार्ग।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The pathway in brief',
        headingHi: 'संक्षेप में मार्ग',
        bodyEn:
          'Becoming a doctor in India follows a defined sequence: take Science with Biology in Class 11–12, clear NEET UG, complete the MBBS degree (which includes a compulsory rotating internship), register with the appropriate medical council, and then optionally pursue a postgraduate specialisation.',
      },
      {
        headingEn: 'Step 1 — Science with Biology, then NEET',
        bodyEn:
          'You must take Physics, Chemistry, and Biology in Class 11 and 12, and then qualify NEET UG — the single national entrance test for MBBS (and BDS/AYUSH) admission in India. There is no separate medical entrance for MBBS beyond NEET for the vast majority of colleges.',
      },
      {
        headingEn: 'Step 2 — MBBS degree and internship',
        bodyEn:
          'After securing a seat through counselling, you study the MBBS undergraduate medical degree, which includes structured academic years followed by a compulsory rotating internship in a hospital. The internship is a required part of the degree before you can practise.',
      },
      {
        headingEn: 'Step 3 — Registration',
        bodyEn:
          'To practise as a doctor in India, you must register with the relevant medical regulatory authority. Registration requirements are set by the official regulator, so confirm the current process and any required assessments on the official regulator\'s website.',
      },
      {
        headingEn: 'Step 4 — Specialisation (optional)',
        bodyEn:
          'Many doctors go on to a postgraduate qualification (such as an MD or MS) to specialise, which involves a separate entrance and selection process. This step is optional and depends on your career goals. Verify current postgraduate entrance and eligibility rules on the official sources.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I need NEET to become a doctor in India?',
        answerEn:
          'Yes. NEET UG is the single national entrance test for MBBS admission in India for the vast majority of medical colleges.',
      },
      {
        questionEn: 'Is an internship part of MBBS?',
        answerEn:
          'Yes. The MBBS degree includes a compulsory rotating internship that must be completed as part of the qualification.',
      },
      {
        questionEn: 'Do I have to specialise after MBBS?',
        answerEn:
          'No. Specialisation through a postgraduate qualification is optional and depends on your goals. It involves a separate entrance and selection process.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: ['aiims-delhi'],
    relatedGuideSlugs: ['neet-ug-eligibility-criteria', 'neet-counselling-process-mcc', 'aiims-vs-government-medical-college'],
    sources: [
      { label: 'NTA — NEET official site', url: 'https://neet.nta.nic.in' },
      { label: 'MCC — Medical Counselling Committee', url: 'https://mcc.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to become a doctor in india', 'mbbs path india', 'doctor career india', 'how to do mbbs', 'medical career after 12th'],
  },
  {
    slug: 'neet-counselling-process-mcc',
    category: 'admissions',
    region: 'india',
    titleEn: 'NEET Counselling Process (MCC) Explained',
    titleHi: 'नीट काउंसलिंग प्रक्रिया (एमसीसी) की व्याख्या',
    descriptionEn:
      'How NEET seat allotment works — the All India Quota and state quota, the role of the MCC, registration, choice filling, and rounds.',
    descriptionHi:
      'नीट सीट आवंटन कैसे होता है — अखिल भारतीय कोटा और राज्य कोटा, एमसीसी की भूमिका, पंजीकरण, चॉइस फिलिंग और राउंड।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'NEET qualifying is not the same as admission',
        headingHi: 'नीट क्वालिफाई होना प्रवेश के समान नहीं है',
        bodyEn:
          'Clearing NEET makes you eligible for admission, but seats are awarded through a separate counselling process. There are broadly two channels: the All India Quota (AIQ) and deemed/central universities, handled by the Medical Counselling Committee (MCC), and the State Quota, handled by each state\'s own counselling authority.',
      },
      {
        headingEn: 'The role of the MCC',
        bodyEn:
          'The Medical Counselling Committee (MCC) conducts the counselling for the All India Quota seats, deemed universities, central universities, and certain other categories. Each state separately conducts counselling for its state-quota seats. You may need to register for both, depending on the seats you are targeting.',
      },
      {
        headingEn: 'The general flow',
        bodyEn: 'MCC counselling typically follows this sequence:',
        bullets: [
          'Register on the official MCC counselling portal within the announced window.',
          'Fill and lock your choices of college and course in order of preference.',
          'Seats are allotted over multiple rounds based on your NEET rank, category, and choices.',
          'Report to the allotted college and complete document verification to confirm the seat.',
          'Later rounds and a mop-up/stray-vacancy round fill remaining seats.',
        ],
      },
      {
        headingEn: 'Verify the current schedule',
        bodyEn:
          'The number of rounds, eligibility for each round, and the exact schedule are announced officially each year and can change. Always follow the current notices on the official MCC website and your state counselling authority\'s website rather than older cycles.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is the difference between MCC and state counselling?',
        answerEn:
          'The MCC conducts counselling for the All India Quota, deemed and central universities, and certain other seats. Each state separately runs counselling for its state-quota seats.',
      },
      {
        questionEn: 'Do I need to register separately for AIQ and state quota?',
        answerEn:
          'Generally yes — All India Quota counselling (MCC) and state-quota counselling are separate registrations. Register for the channels that cover the seats you want.',
      },
      {
        questionEn: 'Does qualifying NEET guarantee an MBBS seat?',
        answerEn:
          'No. Qualifying makes you eligible; a seat depends on your rank, category, choices, and seat availability through the counselling process.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: ['aiims-delhi'],
    relatedGuideSlugs: ['neet-ug-eligibility-criteria', 'how-to-become-a-doctor-in-india', 'aiims-vs-government-medical-college'],
    sources: [
      { label: 'MCC — Medical Counselling Committee', url: 'https://mcc.nic.in' },
      { label: 'NTA — NEET official site', url: 'https://neet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['neet counselling', 'mcc counselling', 'neet seat allotment', 'all india quota neet', 'neet choice filling'],
  },
  {
    slug: 'aiims-vs-government-medical-college',
    category: 'comparison',
    region: 'india',
    titleEn: 'AIIMS vs Government Medical College: How to Compare',
    titleHi: 'एम्स बनाम सरकारी मेडिकल कॉलेज: तुलना कैसे करें',
    descriptionEn:
      'A neutral comparison of AIIMS and other government medical colleges — admission route, how seats are allotted, and the factors that matter when choosing.',
    descriptionHi:
      'एम्स और अन्य सरकारी मेडिकल कॉलेजों की निष्पक्ष तुलना — प्रवेश मार्ग, सीटें कैसे आवंटित होती हैं और चुनते समय मायने रखने वाले कारक।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Both admit through NEET',
        headingHi: 'दोनों नीट के माध्यम से प्रवेश देते हैं',
        bodyEn:
          'A common point of confusion: AIIMS institutes and other government medical colleges now admit MBBS students through NEET UG. AIIMS seats are part of the counselling conducted by the Medical Counselling Committee (MCC). So the entrance exam is the same — the difference lies in the institutes themselves and how their seats are allotted.',
      },
      {
        headingEn: 'What "AIIMS" and "government medical college" mean',
        bodyEn:
          'AIIMS (All India Institutes of Medical Sciences) are autonomous institutes of national importance established across the country. "Government medical college" is a broader term for state- or centrally-run medical colleges, which include long-established and highly regarded institutions. Both are public institutions.',
      },
      {
        headingEn: 'Factors that actually matter when choosing',
        bodyEn:
          'Rather than ranking one type above the other in the abstract, weigh the specific college you can realistically be allotted against your priorities:',
        bullets: [
          'The specific institute and its facilities, hospital, and patient exposure',
          'Location and proximity to home',
          'Your NEET rank and what is realistically attainable in counselling',
          'The counselling channel (AIQ/MCC vs state quota) your seat falls under',
          'Your own academic and career goals',
        ],
      },
      {
        headingEn: 'How to decide for your case',
        bodyEn:
          'Because seat allotment depends on your rank, category, and cut-offs that change every year, the meaningful comparison is always between the actual options in front of you — a specific AIIMS seat versus a specific government medical college seat. List every option you would genuinely accept in your counselling choices, and verify current-year details on the official MCC and institute websites.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is there a separate entrance exam for AIIMS MBBS?',
        answerEn:
          'No longer. AIIMS MBBS admission is now through NEET UG, with seats allotted via the MCC counselling process — the same entrance exam as other medical colleges.',
      },
      {
        questionEn: 'Are AIIMS and government medical colleges both public institutions?',
        answerEn:
          'Yes. AIIMS institutes are autonomous institutes of national importance, and government medical colleges are state- or centrally-run public institutions.',
      },
      {
        questionEn: 'Which should I choose?',
        answerEn:
          'There is no universal answer — it depends on the specific institute you can be allotted, its facilities, location, your rank, and your goals. Compare the actual options available to you in counselling.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: ['aiims-delhi'],
    relatedGuideSlugs: ['how-to-become-a-doctor-in-india', 'neet-counselling-process-mcc', 'neet-ug-eligibility-criteria'],
    sources: [
      { label: 'MCC — Medical Counselling Committee', url: 'https://mcc.nic.in' },
      { label: 'NTA — NEET official site', url: 'https://neet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['aiims vs government medical college', 'aiims vs medical college', 'aiims neet', 'best medical college india'],
  },

  // ───────────────────── Set 4 — Study abroad from India ──────────────────────
  {
    slug: 'how-to-study-in-usa-from-india',
    category: 'study-abroad',
    region: 'usa',
    titleEn: 'How to Study in the USA from India',
    titleHi: 'भारत से अमेरिका में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to U.S. universities — tests, applications, the F-1 student visa process, and where to verify official rules.',
    descriptionHi:
      'अमेरिकी विश्वविद्यालयों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — परीक्षाएँ, आवेदन, एफ-1 छात्र वीज़ा प्रक्रिया और आधिकारिक नियम कहाँ सत्यापित करें।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Studying in the USA from India generally involves four stages: take the required admission and English tests, apply to universities, secure admission and funding, and then complete the student-visa process. Each stage has its own timeline, so it helps to start about a year to eighteen months ahead.',
      },
      {
        headingEn: 'Step 1 — Tests',
        bodyEn:
          'Undergraduate applicants typically take the SAT or ACT, while graduate applicants often take the GRE or GMAT depending on the programme. Most universities also require proof of English proficiency through tests such as TOEFL or IELTS. Always check each university\'s official admissions page for its exact requirements, as test policies vary and change.',
        bullets: [
          'Undergraduate: SAT or ACT + English test (TOEFL/IELTS)',
          'Graduate: GRE or GMAT (programme-dependent) + English test',
        ],
      },
      {
        headingEn: 'Step 2 — Applications',
        bodyEn:
          'Undergraduate applicants commonly apply through the Common App or directly on the university portal; graduate applicants usually apply directly to each department. Applications typically include transcripts, test scores, essays/statements, and letters of recommendation. Note each university\'s official deadlines.',
      },
      {
        headingEn: 'Step 3 — The F-1 student visa (verify on official .gov)',
        bodyEn:
          'After you receive admission and the required institution document, you apply for the F-1 student visa, which is the standard category for academic study in the USA. The official process — including the application form, the SEVIS step, and the visa interview — is set by the U.S. government and changes periodically. Use only the official U.S. government sources below to confirm current requirements, fees, and steps before you act.',
      },
      {
        headingEn: 'Step 4 — Funding and planning',
        bodyEn:
          'Plan for tuition and living costs, and review scholarship and assistantship options published officially by each university. Because costs and funding rules differ by institution and change each year, confirm the current figures on the university\'s official financial-aid pages rather than relying on third-party estimates.',
      },
    ],
    faqs: [
      {
        questionEn: 'Which visa do I need to study in the USA?',
        answerEn:
          'The F-1 visa is the standard category for full-time academic study in the USA. The exact process and requirements are set by the U.S. government — verify them on the official .gov sources before applying.',
      },
      {
        questionEn: 'Do all U.S. universities require the SAT or GRE?',
        answerEn:
          'Not always. Test requirements vary by university and programme and have changed in recent years. Check each university\'s official admissions page for its current policy.',
      },
      {
        questionEn: 'When should I start preparing?',
        answerEn:
          'Many students begin about 12–18 months ahead to allow time for tests, applications, and the visa process. Follow official university deadlines.',
      },
    ],
    relatedExamSlugs: ['sat', 'act', 'gre', 'toefl', 'ielts'],
    relatedCollegeSlugs: ['massachusetts-institute-of-technology', 'harvard-university', 'stanford-university'],
    relatedGuideSlugs: ['how-to-study-in-uk-from-india', 'how-to-study-in-canada-from-india', 'study-in-germany-from-india'],
    sources: [
      { label: 'U.S. Department of State — Student Visa', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html' },
      { label: 'U.S. DHS — Study in the States', url: 'https://studyinthestates.dhs.gov' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in usa from india', 'how to study in usa', 'f1 student visa', 'us universities for indian students', 'study abroad usa'],
  },
  {
    slug: 'how-to-study-in-uk-from-india',
    category: 'study-abroad',
    region: 'uk-ireland',
    titleEn: 'How to Study in the UK from India',
    titleHi: 'भारत से यूके में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to UK universities — UCAS, English tests, the Student visa, and where to verify official rules.',
    descriptionHi:
      'यूके विश्वविद्यालयों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — यूकैस, अंग्रेज़ी परीक्षाएँ, छात्र वीज़ा और आधिकारिक नियम कहाँ सत्यापित करें।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Applying to the UK from India generally involves choosing courses, applying (through UCAS for undergraduate study or directly for postgraduate study), meeting English-language requirements, receiving an offer, and then completing the Student visa process. UK degrees are often shorter than in some other countries, which many applicants find attractive.',
      },
      {
        headingEn: 'Step 1 — Applications via UCAS',
        bodyEn:
          'Undergraduate applications to UK universities are made through UCAS, the centralised application service, which lets you apply to multiple courses. Postgraduate applicants usually apply directly to each university. Applications include academic records, a personal statement, and references. Note official UCAS and university deadlines.',
      },
      {
        headingEn: 'Step 2 — English-language requirement',
        bodyEn:
          'UK universities typically require proof of English proficiency through tests such as IELTS or other accepted qualifications. The accepted tests and required scores vary by university and course, so confirm the exact requirement on each university\'s official admissions page.',
        bullets: [
          'Undergraduate: apply via UCAS + English test (e.g. IELTS)',
          'Postgraduate: apply directly + English test',
        ],
      },
      {
        headingEn: 'Step 3 — The Student visa (verify on official GOV.UK)',
        bodyEn:
          'Once you have an offer and the sponsoring university issues the required confirmation, you apply for the UK Student visa. The official requirements — including the confirmation of acceptance, financial evidence, and any health-related steps — are set by the UK government and change periodically. Use the official GOV.UK source below to confirm the current process before applying.',
      },
      {
        headingEn: 'Step 4 — Funding and planning',
        bodyEn:
          'Budget for tuition and living costs, and review scholarships published officially by each university and recognised bodies. As fees and funding change each year, verify the current figures on official university pages rather than third-party sites.',
      },
    ],
    faqs: [
      {
        questionEn: 'How do I apply to UK universities from India?',
        answerEn:
          'Undergraduate applications go through UCAS, the centralised UK application service. Postgraduate applicants usually apply directly to each university. Follow official deadlines.',
      },
      {
        questionEn: 'Which visa do I need to study in the UK?',
        answerEn:
          'The UK Student visa is the standard route for full-time study. The requirements are set by the UK government — verify them on the official GOV.UK source before applying.',
      },
      {
        questionEn: 'Are UK degrees shorter?',
        answerEn:
          'UK undergraduate and many postgraduate degrees are often shorter than in some other countries. Check the exact course length on the university\'s official page.',
      },
    ],
    relatedExamSlugs: ['ielts', 'toefl', 'pte-academic'],
    relatedCollegeSlugs: ['university-of-oxford', 'university-of-cambridge', 'imperial-college-london'],
    relatedGuideSlugs: ['how-to-study-in-usa-from-india', 'how-to-study-in-canada-from-india', 'study-in-germany-from-india'],
    sources: [
      { label: 'GOV.UK — Student visa', url: 'https://www.gov.uk/student-visa' },
      { label: 'UCAS — official site', url: 'https://www.ucas.com' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in uk from india', 'how to study in uk', 'uk student visa', 'ucas application', 'uk universities for indian students'],
  },
  {
    slug: 'how-to-study-in-canada-from-india',
    category: 'study-abroad',
    region: 'canada',
    titleEn: 'How to Study in Canada from India',
    titleHi: 'भारत से कनाडा में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to Canadian institutions — choosing a designated learning institution, English tests, the study permit, and where to verify official rules.',
    descriptionHi:
      'कनाडाई संस्थानों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — नामित शिक्षण संस्थान चुनना, अंग्रेज़ी परीक्षाएँ, अध्ययन परमिट और आधिकारिक नियम कहाँ सत्यापित करें।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Studying in Canada from India generally involves applying to a Designated Learning Institution (DLI), meeting English-language requirements, receiving a letter of acceptance, and then applying for a study permit. Whether your institution is a designated learning institution matters for the permit, so confirm this officially.',
      },
      {
        headingEn: 'Step 1 — Choose a Designated Learning Institution',
        bodyEn:
          'Canadian study permits are tied to enrolment at a Designated Learning Institution (DLI) — an institution approved by a provincial or territorial government to host international students. The official list of DLIs is published by the Canadian government; confirm an institution\'s DLI status there before applying.',
      },
      {
        headingEn: 'Step 2 — Applications and English test',
        bodyEn:
          'Apply to your chosen institutions and programmes directly, with academic records and any required documents. Most institutions require proof of English proficiency through tests such as IELTS or TOEFL; the accepted tests and scores vary, so check each institution\'s official admissions page.',
        bullets: [
          'Apply to a DLI directly',
          'Provide an English test score (e.g. IELTS/TOEFL) as required',
        ],
      },
      {
        headingEn: 'Step 3 — The study permit (verify on official Canada.ca)',
        bodyEn:
          'After you receive a letter of acceptance, you apply for a study permit, which is the document international students need to study in Canada. The official requirements — including financial evidence and any additional steps — are set by the Canadian government and change periodically. Use the official Government of Canada source below to confirm the current process before applying.',
      },
      {
        headingEn: 'Step 4 — Funding and planning',
        bodyEn:
          'Plan for tuition and living costs, and review scholarships published officially by institutions and recognised bodies. As fees and requirements change each year, verify current figures on official institution and government pages.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is a study permit?',
        answerEn:
          'A study permit is the document international students generally need to study in Canada. It is issued by the Canadian government — verify the requirements on the official Canada.ca source before applying.',
      },
      {
        questionEn: 'What is a Designated Learning Institution (DLI)?',
        answerEn:
          'A DLI is an institution approved to host international students. The study permit is linked to enrolment at a DLI. Check the official DLI list before applying.',
      },
      {
        questionEn: 'Do I need an English test for Canada?',
        answerEn:
          'Most institutions require proof of English proficiency (such as IELTS or TOEFL), but accepted tests and scores vary. Check each institution\'s official admissions page.',
      },
    ],
    relatedExamSlugs: ['ielts', 'toefl', 'gre'],
    relatedCollegeSlugs: ['university-of-toronto', 'university-of-british-columbia', 'mcgill-university'],
    relatedGuideSlugs: ['how-to-study-in-usa-from-india', 'how-to-study-in-uk-from-india', 'study-in-germany-from-india'],
    sources: [
      { label: 'Government of Canada — Study permit', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in canada from india', 'how to study in canada', 'canada study permit', 'designated learning institution', 'canada universities for indian students'],
  },
  {
    slug: 'study-in-germany-from-india',
    category: 'study-abroad',
    region: 'europe',
    titleEn: 'How to Study in Germany from India',
    titleHi: 'भारत से जर्मनी में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to German universities — English- and German-taught programmes, admission, the student visa, and where to verify official rules.',
    descriptionHi:
      'जर्मन विश्वविद्यालयों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — अंग्रेज़ी- और जर्मन-भाषी कार्यक्रम, प्रवेश, छात्र वीज़ा और आधिकारिक नियम कहाँ सत्यापित करें।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Germany is a popular destination partly because many public universities are well regarded and a growing number of programmes are taught in English, especially at the master\'s level. The journey generally involves choosing a programme, meeting its language requirement, applying, and then completing the student-visa process.',
      },
      {
        headingEn: 'Step 1 — English- or German-taught programmes',
        bodyEn:
          'Decide whether you will study in English or German. Many master\'s programmes are offered in English (often requiring an English test such as IELTS or TOEFL), while many bachelor\'s programmes and some others are taught in German and require proof of German proficiency. Check each programme\'s official language requirement.',
        bullets: [
          'English-taught: usually needs an English test (IELTS/TOEFL)',
          'German-taught: needs a recognised German-language qualification',
        ],
      },
      {
        headingEn: 'Step 2 — Admission and applications',
        bodyEn:
          'Apply to your chosen universities or programmes following their official process; some applications are handled centrally and others directly by the university. Requirements typically include academic records and language proof. Confirm deadlines and required documents on each university\'s official page.',
      },
      {
        headingEn: 'Step 3 — The student visa (verify on official German government source)',
        bodyEn:
          'After admission, Indian students generally apply for a national student visa to study in Germany. The official requirements — including documentation and financial evidence — are set by the German government and change periodically. Use the official German government source below to confirm the current process before applying.',
      },
      {
        headingEn: 'Step 4 — Funding and planning',
        bodyEn:
          'Review tuition policies (which vary by state and institution) and scholarships published officially by recognised bodies such as DAAD. As rules and figures change each year, verify the current details on official sources rather than third-party estimates.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can I study in Germany in English?',
        answerEn:
          'Yes, many programmes — especially at master\'s level — are taught in English and require an English test. Many other programmes are taught in German. Check each programme\'s official language requirement.',
      },
      {
        questionEn: 'Do I need to know German?',
        answerEn:
          'It depends on the programme. German-taught programmes require proof of German proficiency, while English-taught ones generally do not. Verify the requirement officially for your chosen course.',
      },
      {
        questionEn: 'Which visa do I need for Germany?',
        answerEn:
          'Indian students generally apply for a national student visa. The requirements are set by the German government — verify them on the official source before applying.',
      },
    ],
    relatedExamSlugs: ['ielts', 'toefl', 'testas', 'gre'],
    relatedCollegeSlugs: ['tu-munich', 'lmu-munich', 'heidelberg-university'],
    relatedGuideSlugs: ['how-to-study-in-usa-from-india', 'how-to-study-in-uk-from-india', 'how-to-study-in-canada-from-india'],
    sources: [
      { label: 'Make it in Germany — official German government portal', url: 'https://www.make-it-in-germany.com/en/' },
      { label: 'DAAD — German Academic Exchange Service', url: 'https://www.daad.de/en/' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in germany from india', 'how to study in germany', 'germany student visa', 'german universities for indian students', 'free education germany'],
  },
  {
    slug: 'mbbs-abroad-from-india-guide',
    category: 'study-abroad',
    region: 'india',
    titleEn: 'MBBS Abroad from India: What to Know',
    titleHi: 'भारत से विदेश में एमबीबीएस: जानने योग्य बातें',
    descriptionEn:
      'Key facts for Indian students considering an MBBS abroad — the NEET requirement, the National Medical Commission guidelines, and the qualifying exam to practise in India.',
    descriptionHi:
      'विदेश में एमबीबीएस पर विचार करने वाले भारतीय छात्रों के लिए मुख्य तथ्य — नीट आवश्यकता, राष्ट्रीय आयुर्विज्ञान आयोग दिशानिर्देश और भारत में अभ्यास के लिए योग्यता परीक्षा।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Start with the India-side rules',
        headingHi: 'भारत-पक्ष के नियमों से शुरू करें',
        bodyEn:
          'If you plan to study MBBS abroad and later practise in India, the most important facts are the Indian regulatory requirements — not just the foreign university\'s. Indian students pursuing a medical degree abroad need to meet the criteria set by India\'s National Medical Commission (NMC), and these rules have been updated over time. Always confirm the current guidelines on the official NMC source before committing.',
      },
      {
        headingEn: 'NEET is required',
        bodyEn:
          'Qualifying NEET UG is required for Indian students seeking to pursue an undergraduate medical course abroad and to be eligible for the steps needed to practise in India afterward. In other words, NEET is not only for admission within India. Verify the current requirement on the official sources.',
      },
      {
        headingEn: 'Meeting NMC guidelines for foreign medical study',
        bodyEn:
          'The NMC publishes guidelines covering aspects of foreign medical education for students who intend to return to India to practise — which can include criteria relating to the course and the qualification. Because these guidelines are periodically revised, you should read the latest version on the official NMC website rather than relying on summaries or older information.',
      },
      {
        headingEn: 'The qualifying exam to practise in India',
        bodyEn:
          'Foreign medical graduates who wish to practise in India are generally required to clear a qualifying/screening examination set by the Indian regulator. Passing this exam, along with meeting other official requirements, is part of the path to registration in India. Confirm the current exam name, eligibility, and process on the official regulator\'s website.',
      },
      {
        headingEn: 'Plan carefully and verify everything',
        bodyEn:
          'Because the rules connect two systems — the foreign university\'s and India\'s regulator — it is essential to verify each requirement against official sources before deciding. Treat third-party agent claims with caution and rely only on the official NMC and exam authority information.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I need NEET to study MBBS abroad?',
        answerEn:
          'Qualifying NEET UG is required for Indian students pursuing an undergraduate medical course abroad and for the steps to practise in India afterward. Verify the current rule on the official sources.',
      },
      {
        questionEn: 'Can I practise in India after an MBBS abroad?',
        answerEn:
          'Foreign medical graduates generally must clear a qualifying/screening examination set by the Indian regulator and meet other official requirements before registering to practise in India. Confirm the current process officially.',
      },
      {
        questionEn: 'Where should I check the rules?',
        answerEn:
          'Use the official National Medical Commission (NMC) website and the official exam authority. Rules change over time, so rely on the latest official version, not third-party summaries.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: ['aiims-delhi'],
    relatedGuideSlugs: ['how-to-become-a-doctor-in-india', 'neet-ug-eligibility-criteria', 'neet-counselling-process-mcc'],
    sources: [
      { label: 'National Medical Commission (NMC) — official site', url: 'https://www.nmc.org.in' },
      { label: 'NTA — NEET official site', url: 'https://neet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['mbbs abroad from india', 'study mbbs abroad', 'neet for mbbs abroad', 'nmc guidelines mbbs abroad', 'foreign medical graduate india'],
  },

  // ──────────────────────── Set 5 — MBA / CAT cluster ─────────────────────────
  {
    slug: 'cat-exam-eligibility-and-pattern',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'CAT Exam: Eligibility and Pattern Explained',
    titleHi: 'कैट परीक्षा: पात्रता और पैटर्न की व्याख्या',
    descriptionEn:
      'Understand who can take the CAT, the broad structure of the exam, and how it is used for admission to the IIMs and other management institutes in India.',
    descriptionHi:
      'समझें कि कैट कौन दे सकता है, परीक्षा की व्यापक संरचना क्या है, और इसका उपयोग आईआईएम तथा भारत के अन्य प्रबंधन संस्थानों में प्रवेश के लिए कैसे होता है।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What is the CAT?',
        headingHi: 'कैट क्या है?',
        bodyEn:
          'The Common Admission Test (CAT) is a national-level management entrance test in India, conducted by the Indian Institutes of Management (IIMs) on a rotating basis. CAT scores are used for admission to the IIMs and accepted by many other management institutes across the country.',
      },
      {
        headingEn: 'Who can take the CAT?',
        bodyEn:
          'Eligibility is based primarily on holding a bachelor\'s degree with the minimum percentage that the IIMs specify, with relaxations for certain reserved categories as defined in the official notification. Final-year undergraduate students are generally also allowed to apply, subject to the conditions stated each year. Because the exact percentage and category criteria are set in the official notification and can change, always confirm them on the official CAT website.',
        bullets: [
          'A recognised bachelor\'s degree (minimum percentage per official notification)',
          'Category relaxations as defined officially',
          'Final-year students may apply, subject to official conditions',
        ],
      },
      {
        headingEn: 'Broad exam structure',
        bodyEn:
          'The CAT is a computer-based test broadly organised into sections covering verbal ability and reading comprehension, data interpretation and logical reasoning, and quantitative ability. The number of questions, sectional timing, and marking scheme are announced in the official notification each year and have changed over time, so check the current pattern on the official site rather than relying on older descriptions.',
      },
      {
        headingEn: 'How CAT scores are used',
        bodyEn:
          'IIMs and many other institutes use the CAT score as one component of their selection process, which can also include academic record, work experience, and later stages such as written assessments and interviews. Each institute publishes its own selection criteria officially.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who conducts the CAT?',
        answerEn:
          'The CAT is conducted by the Indian Institutes of Management (IIMs) on a rotating basis. Details are published on the official CAT website each year.',
      },
      {
        questionEn: 'What is the eligibility for CAT?',
        answerEn:
          'Eligibility is primarily a recognised bachelor\'s degree with the minimum percentage specified in the official notification, with category relaxations. Final-year students may apply subject to official conditions. Verify the current criteria officially.',
      },
      {
        questionEn: 'Is CAT only for the IIMs?',
        answerEn:
          'No. CAT scores are used by the IIMs and accepted by many other management institutes in India. Each institute sets its own selection process.',
      },
    ],
    relatedExamSlugs: ['cat', 'gmat'],
    relatedCollegeSlugs: ['iim-ahmedabad', 'iim-bangalore'],
    relatedGuideSlugs: ['how-to-prepare-for-cat', 'cat-vs-gmat-which-to-take', 'iim-vs-isb-which-is-better'],
    sources: [
      { label: 'IIM CAT — official website', url: 'https://iimcat.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['cat exam eligibility', 'cat exam pattern', 'cat exam', 'common admission test', 'cat for iim'],
  },
  {
    slug: 'how-to-prepare-for-cat',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'How to Prepare for the CAT',
    titleHi: 'कैट की तैयारी कैसे करें',
    descriptionEn:
      'A practical, neutral overview of how candidates commonly approach CAT preparation across its sections, with a focus on fundamentals and consistent practice.',
    descriptionHi:
      'कैट की तैयारी को अनुभाग-वार कैसे किया जाता है, इसका व्यावहारिक और तटस्थ अवलोकन — बुनियादी बातों और नियमित अभ्यास पर ध्यान देते हुए।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Understand the exam first',
        headingHi: 'पहले परीक्षा को समझें',
        bodyEn:
          'Effective preparation starts with understanding the current CAT pattern and sections from the official notification. Knowing what the test actually measures — verbal ability and reading comprehension, data interpretation and logical reasoning, and quantitative ability — helps you plan your time across topics.',
      },
      {
        headingEn: 'Build fundamentals by section',
        bodyEn:
          'Most candidates strengthen the basics in each area before moving to harder problems: reading regularly and practising comprehension for the verbal section; working through data sets and reasoning puzzles for DILR; and revising core mathematics for the quantitative section. The goal is accuracy first, then speed.',
        bullets: [
          'Verbal & RC: read widely and practise comprehension',
          'DILR: practise interpreting data sets and logical puzzles',
          'Quant: revise core mathematics fundamentals',
        ],
      },
      {
        headingEn: 'Practise with mock tests',
        bodyEn:
          'Regular full-length mock tests under timed conditions are a common part of preparation. They help you get used to the on-screen format, manage sectional timing, and identify weak areas to revisit. Reviewing mistakes after each mock is often more valuable than simply taking more tests.',
      },
      {
        headingEn: 'Plan and stay consistent',
        bodyEn:
          'Because the syllabus is broad, a steady study routine over several months usually works better than last-minute effort. Set realistic weekly goals, track progress honestly, and adjust your plan based on your mock-test performance. There is no single "guaranteed" method — consistency and review matter most.',
      },
    ],
    faqs: [
      {
        questionEn: 'How long does CAT preparation take?',
        answerEn:
          'It varies by individual and starting point; many candidates prepare steadily over several months. A consistent routine generally works better than last-minute effort.',
      },
      {
        questionEn: 'Are mock tests important?',
        answerEn:
          'Many candidates use regular timed mock tests to get used to the format and manage sectional timing. Reviewing your mistakes after each mock is a key part of improving.',
      },
      {
        questionEn: 'Is coaching necessary for CAT?',
        answerEn:
          'There is no single required path. Some prepare with coaching and some self-study; what matters is understanding the official pattern, building fundamentals, and practising consistently.',
      },
    ],
    relatedExamSlugs: ['cat', 'gmat'],
    relatedCollegeSlugs: ['iim-ahmedabad', 'iim-bangalore'],
    relatedGuideSlugs: ['cat-exam-eligibility-and-pattern', 'cat-vs-gmat-which-to-take', 'mba-after-engineering-worth-it'],
    sources: [
      { label: 'IIM CAT — official website', url: 'https://iimcat.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to prepare for cat', 'cat preparation', 'cat preparation tips', 'cat mock test', 'cat study plan'],
  },
  {
    slug: 'iim-vs-isb-which-is-better',
    category: 'comparison',
    region: 'india',
    titleEn: 'IIM vs ISB: How to Compare Them',
    titleHi: 'आईआईएम बनाम आईएसबी: तुलना कैसे करें',
    descriptionEn:
      'A neutral comparison framework for the IIMs and the Indian School of Business — programme structure, admission routes, and how to decide based on your own goals.',
    descriptionHi:
      'आईआईएम और इंडियन स्कूल ऑफ बिज़नेस की तटस्थ तुलना के लिए एक ढाँचा — कार्यक्रम संरचना, प्रवेश मार्ग, और अपने लक्ष्यों के आधार पर निर्णय कैसे लें।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Two well-known options, different formats',
        headingHi: 'दो प्रसिद्ध विकल्प, अलग प्रारूप',
        bodyEn:
          'The Indian Institutes of Management (IIMs) and the Indian School of Business (ISB) are both well-known management education options in India, but they differ in programme format and admission routes. Rather than asking which is "better" in the abstract, it is more useful to compare them against your own goals, profile, and stage of career.',
      },
      {
        headingEn: 'Admission routes differ',
        bodyEn:
          'Admission to the flagship IIM programmes is commonly based on the CAT score along with each institute\'s own selection process. ISB\'s flagship programme commonly considers scores such as the GMAT (and other accepted tests) as part of its own process. Because each institute sets and updates its own admission criteria, confirm the current requirements on each official website.',
        bullets: [
          'IIMs: commonly via CAT + each institute\'s selection process',
          'ISB: commonly considers GMAT/other accepted tests + its own process',
        ],
      },
      {
        headingEn: 'Programme format and profile fit',
        bodyEn:
          'Programmes differ in structure, duration, and the typical profile of applicants they attract. Some formats are oriented toward applicants earlier in their careers, while others attract those with more work experience. Review each programme\'s official description to see which aligns with your background and objectives.',
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'A practical approach is to list your goals — such as specialisation interests, programme length, and the entrance test you are better placed to take — and compare each option\'s official details against them. Both are reputable; the right choice depends on individual fit, not a universal ranking.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is an IIM better than ISB?',
        answerEn:
          'Neither is universally "better" — they differ in programme format and admission routes. The right choice depends on your goals, profile, and which entrance test suits you. Compare each official programme description.',
      },
      {
        questionEn: 'What test do I need for each?',
        answerEn:
          'IIM flagship admission is commonly based on the CAT, while ISB\'s flagship programme commonly considers tests such as the GMAT. Each institute sets its own criteria — verify them officially.',
      },
      {
        questionEn: 'How should I choose?',
        answerEn:
          'List your goals (specialisation, programme length, preferred entrance test) and compare each option\'s official details against them. Both are reputable; fit matters more than a single ranking.',
      },
    ],
    relatedExamSlugs: ['cat', 'gmat'],
    relatedCollegeSlugs: ['iim-ahmedabad', 'iim-bangalore'],
    relatedGuideSlugs: ['cat-vs-gmat-which-to-take', 'cat-exam-eligibility-and-pattern', 'mba-after-engineering-worth-it'],
    sources: [
      { label: 'IIM CAT — official website', url: 'https://iimcat.ac.in' },
      { label: 'Indian School of Business (ISB) — official site', url: 'https://www.isb.edu' },
    ],
    lastVerified: VERIFY,
    keywords: ['iim vs isb', 'iim or isb', 'isb vs iim which is better', 'iim isb comparison', 'mba india options'],
  },
  {
    slug: 'mba-after-engineering-worth-it',
    category: 'career',
    region: 'india',
    titleEn: 'Is an MBA After Engineering Worth It?',
    titleHi: 'इंजीनियरिंग के बाद एमबीए करना सही है?',
    descriptionEn:
      'A balanced, neutral look at why many engineering graduates consider an MBA, what it can and cannot do, and how to decide based on your own goals.',
    descriptionHi:
      'कई इंजीनियरिंग स्नातक एमबीए पर विचार क्यों करते हैं, यह क्या कर सकता है और क्या नहीं, और अपने लक्ष्यों के आधार पर निर्णय कैसे लें — इसका संतुलित और तटस्थ विश्लेषण।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Why the question comes up',
        headingHi: 'यह प्रश्न क्यों उठता है',
        bodyEn:
          'Many engineering graduates in India consider an MBA as a way to broaden into management, strategy, finance, product, or general business roles. Whether it is "worth it" is not a yes-or-no answer — it depends on your goals, the path you want, and what you expect the degree to do for you.',
      },
      {
        headingEn: 'What an MBA can offer',
        bodyEn:
          'An MBA typically builds knowledge across business functions, develops a professional network, and can open doors to roles that value management training. For some, it supports a shift away from a purely technical track toward broader responsibilities. These are possibilities, not guarantees — outcomes vary by individual, programme, and effort.',
        bullets: [
          'Broader business knowledge across functions',
          'A professional network and structured learning',
          'Access to roles that value management training',
        ],
      },
      {
        headingEn: 'What to weigh honestly',
        bodyEn:
          'Consider the time and financial commitment, the opportunity cost of pausing work, and whether your target roles actually require an MBA. Some career goals are better served by experience, certifications, or specialised study. There are no guaranteed salary or placement outcomes, so be cautious of any claim that promises them.',
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'Define the specific role or direction you want, then check whether an MBA is the most direct route to it. Talking to people in your target field and reviewing the official outcomes that programmes publish can help you make an informed, individual decision rather than following a general trend.',
      },
    ],
    faqs: [
      {
        questionEn: 'Does an MBA guarantee a higher salary?',
        answerEn:
          'No. There are no guaranteed salary or placement outcomes — results vary by individual, programme, and effort. Be cautious of any claim that promises guaranteed outcomes.',
      },
      {
        questionEn: 'Should every engineer do an MBA?',
        answerEn:
          'Not necessarily. It depends on your goals. Some directions are better served by experience or specialised study. Decide based on the specific role you want.',
      },
      {
        questionEn: 'How do I decide if it is worth it?',
        answerEn:
          'Define your target role, check whether an MBA is the most direct route to it, weigh the time and cost, and review the official outcomes programmes publish.',
      },
    ],
    relatedExamSlugs: ['cat', 'gmat'],
    relatedCollegeSlugs: ['iim-ahmedabad', 'iim-bangalore'],
    relatedGuideSlugs: ['cat-exam-eligibility-and-pattern', 'iim-vs-isb-which-is-better', 'cat-vs-gmat-which-to-take'],
    sources: [
      { label: 'IIM CAT — official website', url: 'https://iimcat.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['mba after engineering', 'is mba worth it', 'mba after btech', 'mba after engineering worth it', 'engineering to management'],
  },
  {
    slug: 'cat-vs-gmat-which-to-take',
    category: 'comparison',
    region: 'india',
    titleEn: 'CAT vs GMAT: Which Should You Take?',
    titleHi: 'कैट बनाम जीमैट: कौन-सी परीक्षा दें?',
    descriptionEn:
      'A neutral comparison of the CAT and the GMAT — what each is commonly used for, how they differ, and how to choose based on the programmes you are targeting.',
    descriptionHi:
      'कैट और जीमैट की तटस्थ तुलना — प्रत्येक का सामान्य उपयोग, उनके बीच अंतर, और जिन कार्यक्रमों को आप लक्षित कर रहे हैं उनके आधार पर चुनाव कैसे करें।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Different tests, different uses',
        headingHi: 'अलग परीक्षाएँ, अलग उपयोग',
        bodyEn:
          'The CAT and the GMAT are both used for management admissions, but they are commonly used in different contexts. The CAT is a national-level test used widely by the IIMs and other Indian institutes, while the GMAT is an internationally recognised test accepted by many business schools worldwide and by some programmes in India. The right test depends on where you plan to apply.',
      },
      {
        headingEn: 'Where each is accepted',
        bodyEn:
          'If your target programmes primarily use the CAT (such as the flagship IIM programmes), the CAT is the natural choice. If you are targeting international business schools — or Indian programmes that accept the GMAT — then the GMAT may fit better. Always confirm which test each programme accepts on its official admissions page, since policies vary and change.',
        bullets: [
          'CAT: widely used by IIMs and many Indian institutes',
          'GMAT: accepted internationally and by some programmes in India',
        ],
      },
      {
        headingEn: 'Format and content differ',
        bodyEn:
          'The two tests differ in structure, content emphasis, scoring, and how often they can be taken. Rather than judging one as harder, it is more useful to look at which test\'s format suits your strengths and, more importantly, which one your target programmes require. Check the current official format for each before deciding.',
      },
      {
        headingEn: 'How to choose',
        bodyEn:
          'Start from your list of target programmes and the tests they accept, then pick the test that keeps the most of your preferred options open. If your shortlist is entirely IIM-focused, the CAT is usually the route; if it includes international schools, the GMAT may be more versatile. The decision follows your goals, not a universal verdict.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is the GMAT harder than the CAT?',
        answerEn:
          'Neither is universally harder — they differ in format, content, and scoring. The more useful question is which test your target programmes require and which format suits your strengths.',
      },
      {
        questionEn: 'Can I use the GMAT for IIM admission?',
        answerEn:
          'Some Indian programmes accept the GMAT, but the flagship IIM programmes are commonly based on the CAT. Always confirm which test a programme accepts on its official admissions page.',
      },
      {
        questionEn: 'Which test should I take?',
        answerEn:
          'Start from your target programmes and the tests they accept. If your shortlist is IIM-focused, the CAT is usually the route; if it includes international schools, the GMAT may be more versatile.',
      },
    ],
    relatedExamSlugs: ['cat', 'gmat', 'gre'],
    relatedCollegeSlugs: ['iim-ahmedabad', 'iim-bangalore'],
    relatedGuideSlugs: ['cat-exam-eligibility-and-pattern', 'how-to-prepare-for-cat', 'iim-vs-isb-which-is-better'],
    sources: [
      { label: 'IIM CAT — official website', url: 'https://iimcat.ac.in' },
      { label: 'GMAT — official site (mba.com)', url: 'https://www.mba.com/exams/gmat-exam' },
    ],
    lastVerified: VERIFY,
    keywords: ['cat vs gmat', 'gmat or cat', 'cat vs gmat which is better', 'cat gmat difference', 'mba entrance exam india'],
  },
  // ─────────────────────────────── Set 6 — Law / CLAT ────────────────────────
  {
    slug: 'clat-eligibility-and-exam-pattern',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'CLAT Eligibility and Exam Pattern Explained',
    titleHi: 'क्लैट पात्रता और परीक्षा पैटर्न',
    descriptionEn:
      'What the Common Law Admission Test (CLAT) is, who can apply, the subject areas it tests, and how the paper is structured — with a reminder to confirm current details on the official source.',
    descriptionHi:
      'कॉमन लॉ एडमिशन टेस्ट (क्लैट) क्या है, कौन आवेदन कर सकता है, यह किन विषयों की परीक्षा लेता है और प्रश्नपत्र कैसे संरचित होता है — आधिकारिक स्रोत पर वर्तमान विवरण की पुष्टि करने की सलाह के साथ।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What CLAT is and who conducts it',
        headingHi: 'क्लैट क्या है और इसे कौन आयोजित करता है',
        bodyEn:
          'The Common Law Admission Test (CLAT) is a national entrance test for admission to law programmes at most of India\'s National Law Universities (NLUs). It is conducted by the Consortium of National Law Universities and is used for both the five-year integrated undergraduate law degree (taken after Class 12) and the postgraduate LLM.\n\nA strong CLAT score is the main gateway to the NLUs, and many other law schools also accept CLAT scores for their own admissions.',
      },
      {
        headingEn: 'Who can apply (eligibility)',
        bodyEn:
          'For the undergraduate (UG) programme, candidates who have passed or are appearing in Class 12 (or an equivalent) are generally eligible, subject to a minimum-marks requirement that differs by category. For the postgraduate LLM, an LLB (or equivalent) degree is required.\n\nThe exact minimum percentage, category relaxations, and any other conditions are fixed in the official notification each year and can change, so confirm the current eligibility on the Consortium\'s official website before you apply.',
      },
      {
        headingEn: 'What the exam tests (pattern)',
        bodyEn:
          'The UG paper is comprehension-based and objective (multiple-choice), drawing questions from five areas, with negative marking for wrong answers. The PG (LLM) paper focuses on law subjects.\n\nThe exact number of questions, total marks, time limit, and marking scheme are set in the official notification for each cycle, so always check the latest pattern on the official source rather than older guides.',
        bullets: [
          'English Language',
          'Current Affairs, including General Knowledge',
          'Legal Reasoning',
          'Logical Reasoning',
          'Quantitative Techniques',
        ],
      },
      {
        headingEn: 'How to use this for preparation',
        bodyEn:
          'Because CLAT rewards reading and reasoning, regular practice with comprehension passages, legal-reasoning sets, and current-affairs reading helps more than rote learning. Start from the official notification so you prepare for the current pattern, and track the official timeline for registration and the test date.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who conducts CLAT?',
        answerEn:
          'CLAT is conducted by the Consortium of National Law Universities. Most NLUs use it for admission, with the notable exception of National Law University, Delhi, which conducts its own test (AILET).',
      },
      {
        questionEn: 'What subjects does CLAT test?',
        answerEn:
          'The undergraduate paper covers English, Current Affairs including General Knowledge, Legal Reasoning, Logical Reasoning, and Quantitative Techniques, in a comprehension-based format.',
      },
      {
        questionEn: 'Does CLAT have negative marking?',
        answerEn:
          'Yes, CLAT applies negative marking for incorrect answers. The exact marks awarded and deducted are stated in the official notification each year — verify the current scheme on the Consortium\'s official site.',
      },
    ],
    relatedExamSlugs: ['clat', 'ailet'],
    relatedCollegeSlugs: ['nlu-delhi'],
    relatedGuideSlugs: ['clat-vs-ailet-difference', 'list-of-national-law-universities', 'how-to-become-a-lawyer-in-india'],
    sources: [
      { label: 'Consortium of National Law Universities — official CLAT site', url: 'https://consortiumofnlus.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['clat eligibility', 'clat exam pattern', 'clat syllabus', 'how to prepare for clat', 'clat law entrance'],
  },
  {
    slug: 'how-to-become-a-lawyer-in-india',
    category: 'career',
    region: 'india',
    titleEn: 'How to Become a Lawyer in India',
    titleHi: 'भारत में वकील कैसे बनें',
    descriptionEn:
      'The two main routes to a law degree in India, the role of the Bar Council and the All India Bar Examination, and how a law career typically begins.',
    descriptionHi:
      'भारत में विधि की डिग्री के दो मुख्य मार्ग, बार काउंसिल और अखिल भारतीय बार परीक्षा की भूमिका, और विधि करियर आमतौर पर कैसे शुरू होता है।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Two routes to a law degree',
        headingHi: 'विधि की डिग्री के दो मार्ग',
        bodyEn:
          'There are two common ways to earn a law degree in India. The first is a five-year integrated undergraduate degree (such as BA LLB) taken after Class 12 — the route most NLU aspirants follow through entrance tests like CLAT or AILET. The second is a three-year LLB taken after completing any bachelor\'s degree.\n\nIn both cases, the degree must be from an institution whose law programme is recognised by the Bar Council of India (BCI), the body that regulates legal education and the legal profession.',
        bullets: [
          'Five-year integrated LLB after Class 12 (e.g. BA LLB, BBA LLB)',
          'Three-year LLB after any bachelor\'s degree',
        ],
      },
      {
        headingEn: 'Entrance tests for law school',
        bodyEn:
          'Admission to the National Law Universities is mainly through CLAT (the Consortium of NLUs) or, for National Law University, Delhi, through AILET. Many states and private universities also conduct their own law entrance tests. Choose your target universities first, then prepare for the test (or tests) they accept.',
      },
      {
        headingEn: 'Enrolment and the Bar exam',
        bodyEn:
          'After earning a recognised law degree, a graduate who wants to practise as an advocate must clear the All India Bar Examination (AIBE), conducted by the Bar Council of India, and hold enrolment with a State Bar Council to receive the Certificate of Practice.\n\nThe AIBE\'s exact format, fees, eligibility, and the order of these steps are set officially and can change, so confirm the current requirements on the Bar Council of India\'s official website.',
      },
      {
        headingEn: 'Where a law career can start',
        bodyEn:
          'New lawyers commonly begin in litigation (working with a senior advocate or chambers), at a law firm, or as in-house counsel in a company. A law degree also opens routes into the judiciary, public service, academia, and policy — covered in the related guide on careers after an LLB.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I need to clear an exam to practise law?',
        answerEn:
          'To practise as an advocate in India you must hold a recognised law degree, clear the All India Bar Examination (AIBE) conducted by the Bar Council of India, and hold enrolment with a State Bar Council. Verify the current sequence and rules on the official BCI site.',
      },
      {
        questionEn: 'Should I do the five-year or three-year law course?',
        answerEn:
          'The five-year integrated LLB is taken right after Class 12; the three-year LLB is taken after another bachelor\'s degree. Both lead to the same profession — choose based on your stage of study and goals.',
      },
      {
        questionEn: 'Is CLAT the only way into law school?',
        answerEn:
          'No. CLAT is the main route to most NLUs, but NLU Delhi uses AILET, and many other universities run their own law entrance tests.',
      },
    ],
    relatedExamSlugs: ['clat', 'ailet'],
    relatedCollegeSlugs: ['nlu-delhi'],
    relatedGuideSlugs: ['career-options-after-llb', 'clat-eligibility-and-exam-pattern', 'list-of-national-law-universities'],
    sources: [
      { label: 'Bar Council of India — official site', url: 'https://www.barcouncilofindia.org' },
      { label: 'Consortium of National Law Universities — official CLAT site', url: 'https://consortiumofnlus.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to become a lawyer in india', 'law career india', 'llb course india', 'bar council of india aibe', 'become advocate india'],
  },
  {
    slug: 'list-of-national-law-universities',
    category: 'admissions',
    region: 'india',
    titleEn: 'National Law Universities in India: An Overview',
    titleHi: 'भारत में राष्ट्रीय विधि विश्वविद्यालय: एक परिचय',
    descriptionEn:
      'What the National Law Universities are, how students are admitted, and how to find the current official list — without rankings or judgments.',
    descriptionHi:
      'राष्ट्रीय विधि विश्वविद्यालय क्या हैं, छात्रों को कैसे प्रवेश मिलता है, और वर्तमान आधिकारिक सूची कैसे प्राप्त करें — बिना रैंकिंग या निर्णय के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the NLUs are',
        headingHi: 'एनएलयू क्या हैं',
        bodyEn:
          'The National Law Universities (NLUs) are a group of public law schools set up by different states to offer specialised legal education. The first, the National Law School of India University (NLSIU) in Bengaluru, was established in 1987, and the model has since expanded across the country.\n\nMost NLUs admit undergraduate students through CLAT; National Law University, Delhi admits through its own test, AILET.',
      },
      {
        headingEn: 'Some of the NLUs',
        bodyEn:
          'Widely known NLUs include those listed below, among others. Because new NLUs have been added over the years, the most reliable way to see the complete, current set — along with their seats and programmes — is the official Consortium list.',
        bullets: [
          'NLSIU, Bengaluru',
          'NALSAR University of Law, Hyderabad',
          'National Law University, Delhi (admits via AILET)',
          'The West Bengal National University of Juridical Sciences (WBNUJS), Kolkata',
          'National Law University, Jodhpur',
          'Gujarat National Law University, Gandhinagar',
        ],
      },
      {
        headingEn: 'How admission works',
        bodyEn:
          'For most NLUs, undergraduate and postgraduate admission is based on the CLAT score through the Consortium\'s common process; NLU Delhi uses AILET. Seats, categories, and counselling steps are set officially each year, so check the Consortium and the individual university websites for current details.',
      },
      {
        headingEn: 'Choosing without rankings',
        bodyEn:
          'Rather than relying on unofficial "best NLU" lists, compare universities on factors you can verify officially — location, programmes offered, seat numbers, and fees published on each university\'s own site. What suits one student may not suit another.',
      },
    ],
    faqs: [
      {
        questionEn: 'How many NLUs are there in India?',
        answerEn:
          'The number of NLUs has grown over the years as new universities were established. For the current, complete count and list, refer to the official Consortium of NLUs website.',
      },
      {
        questionEn: 'How do I get into an NLU?',
        answerEn:
          'Most NLUs admit students through CLAT, conducted by the Consortium of National Law Universities. National Law University, Delhi admits through AILET instead.',
      },
      {
        questionEn: 'Which is the oldest NLU?',
        answerEn:
          'The National Law School of India University (NLSIU), Bengaluru, established in 1987, was the first National Law University in India.',
      },
    ],
    relatedExamSlugs: ['clat', 'ailet'],
    relatedCollegeSlugs: ['nlu-delhi'],
    relatedGuideSlugs: ['clat-eligibility-and-exam-pattern', 'clat-vs-ailet-difference', 'how-to-become-a-lawyer-in-india'],
    sources: [
      { label: 'Consortium of National Law Universities — official site', url: 'https://consortiumofnlus.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['national law universities', 'list of nlus in india', 'nlu colleges', 'clat colleges', 'law universities india'],
  },
  {
    slug: 'clat-vs-ailet-difference',
    category: 'comparison',
    region: 'india',
    titleEn: 'CLAT vs AILET: What Is the Difference?',
    titleHi: 'क्लैट बनाम एलैट: क्या अंतर है?',
    descriptionEn:
      'A neutral comparison of CLAT and AILET — who conducts each, which universities they lead to, and how to decide which test (or both) to take.',
    descriptionHi:
      'क्लैट और एलैट की निष्पक्ष तुलना — कौन आयोजित करता है, किन विश्वविद्यालयों में प्रवेश मिलता है, और कौन-सी परीक्षा (या दोनों) देनी है, यह कैसे तय करें।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Two separate law entrance tests',
        headingHi: 'दो अलग विधि प्रवेश परीक्षाएँ',
        bodyEn:
          'CLAT and AILET are both national-level law entrance tests, but they are conducted by different bodies and used by different universities. CLAT is conducted by the Consortium of National Law Universities and is accepted by most NLUs. AILET is conducted by National Law University, Delhi for admission to its own programmes.',
      },
      {
        headingEn: 'Which universities each leads to',
        bodyEn:
          'A CLAT score is used for admission to the majority of NLUs through a common process. AILET is used only by NLU Delhi, which does not admit through CLAT. Many private and state law schools also accept CLAT.',
        bullets: [
          'CLAT → most National Law Universities (via the Consortium)',
          'AILET → National Law University, Delhi only',
        ],
      },
      {
        headingEn: 'How they are similar',
        bodyEn:
          'Both tests focus on comprehension and reasoning rather than rote memorisation, covering areas such as English, current affairs and general knowledge, legal and logical reasoning, and quantitative ability. The exact pattern, number of questions, and marking for each are set in their official notifications and can change year to year.',
      },
      {
        headingEn: 'Which one should you take?',
        bodyEn:
          'This is not a question of which test is "better" — it depends on where you want to study. If NLU Delhi is one of your targets, you will need AILET; if you are aiming at other NLUs, you will need CLAT. Many aspirants prepare for both, since the skills overlap. Decide from your own list of target universities and confirm each test\'s current rules officially.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is AILET only for NLU Delhi?',
        answerEn:
          'Yes. AILET is conducted by National Law University, Delhi for admission to its own programmes; NLU Delhi does not admit through CLAT.',
      },
      {
        questionEn: 'Can I take both CLAT and AILET?',
        answerEn:
          'Many candidates take both, because the tested skills overlap and the two tests open different universities. Check each test\'s official dates and notification.',
      },
      {
        questionEn: 'Which is harder, CLAT or AILET?',
        answerEn:
          'Difficulty is subjective and varies by year and individual. Rather than ranking them, prepare on the official pattern for whichever test(s) your target universities require.',
      },
    ],
    relatedExamSlugs: ['clat', 'ailet'],
    relatedCollegeSlugs: ['nlu-delhi'],
    relatedGuideSlugs: ['clat-eligibility-and-exam-pattern', 'list-of-national-law-universities', 'how-to-become-a-lawyer-in-india'],
    sources: [
      { label: 'Consortium of National Law Universities — official CLAT site', url: 'https://consortiumofnlus.ac.in' },
      { label: 'National Law University, Delhi — official site (AILET)', url: 'https://nludelhi.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['clat vs ailet', 'ailet vs clat difference', 'ailet nlu delhi', 'law entrance exams india', 'clat ailet comparison'],
  },
  {
    slug: 'career-options-after-llb',
    category: 'career',
    region: 'india',
    titleEn: 'Career Options After an LLB',
    titleHi: 'एलएलबी के बाद करियर विकल्प',
    descriptionEn:
      'A balanced look at the paths open after a law degree in India — litigation, corporate law, judiciary, public service, academia, and more — with no income guarantees.',
    descriptionHi:
      'भारत में विधि की डिग्री के बाद खुलने वाले मार्गों पर एक संतुलित दृष्टि — मुकदमेबाज़ी, कॉर्पोरेट विधि, न्यायपालिका, लोक सेवा, शिक्षा और अधिक — बिना किसी आय की गारंटी के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'A law degree opens many doors',
        headingHi: 'विधि की डिग्री कई द्वार खोलती है',
        bodyEn:
          'An LLB qualifies you for far more than courtroom practice. Graduates work in litigation, corporate and commercial law, the judiciary, government and public service, academia, and a growing set of policy and legal-technology roles. The right path depends on your interests and strengths, not on any single "best" option.',
      },
      {
        headingEn: 'Practice and corporate roles',
        bodyEn:
          'Many graduates begin in litigation, working with a senior advocate, chambers, or a law firm; practising as an advocate requires clearing the All India Bar Examination and holding State Bar Council enrolment. Others join companies as in-house counsel or work in law firms on corporate, tax, intellectual-property, or dispute-resolution matters.',
        bullets: [
          'Litigation / advocacy (AIBE + Bar Council enrolment)',
          'Law firms (corporate, IP, tax, disputes)',
          'In-house / corporate counsel',
          'Alternative dispute resolution (arbitration, mediation)',
        ],
      },
      {
        headingEn: 'Judiciary, public service and academia',
        bodyEn:
          'Law graduates can enter the judiciary through state judicial-services examinations, serve as public prosecutors, or appear for civil-services examinations. Others pursue an LLM and move into teaching and legal research, or work with policy organisations, regulators, and the non-profit sector.',
      },
      {
        headingEn: 'Plan with realistic expectations',
        bodyEn:
          'Outcomes, earnings, and timelines vary widely by role, location, employer, and experience, and no guide can promise a specific salary or placement. Treat any "guaranteed package" claim with caution, and base your decisions on official information about each path and your own goals.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do all law graduates become courtroom lawyers?',
        answerEn:
          'No. Litigation is one common path, but LLB graduates also work in corporate law, the judiciary, public service, academia, policy, and legal technology.',
      },
      {
        questionEn: 'Do I need to clear the Bar exam for every legal career?',
        answerEn:
          'Practising as an advocate requires clearing the All India Bar Examination and State Bar Council enrolment. Some non-litigation roles have different requirements — check the official rules for the specific path.',
      },
      {
        questionEn: 'How much do lawyers earn in India?',
        answerEn:
          'Earnings vary widely by role, employer, location, and experience, so this guide does not quote figures. Be wary of any source promising a guaranteed salary.',
      },
    ],
    relatedExamSlugs: ['clat'],
    relatedCollegeSlugs: ['nlu-delhi'],
    relatedGuideSlugs: ['how-to-become-a-lawyer-in-india', 'list-of-national-law-universities', 'clat-eligibility-and-exam-pattern'],
    sources: [
      { label: 'Bar Council of India — official site', url: 'https://www.barcouncilofindia.org' },
    ],
    lastVerified: VERIFY,
    keywords: ['career options after llb', 'jobs after law degree', 'law career paths india', 'what to do after llb', 'legal careers india'],
  },
  // ─────────────────────────── Set 7 — Career options after 12th ─────────────
  {
    slug: 'career-options-after-12th-science',
    category: 'career',
    region: 'india',
    titleEn: 'Career Options After 12th Science',
    titleHi: '12वीं विज्ञान के बाद करियर विकल्प',
    descriptionEn:
      'A clear map of the paths open after Class 12 Science in India — engineering, medical and life sciences, pure sciences, technology, and cross-stream options — without salary claims.',
    descriptionHi:
      'भारत में 12वीं विज्ञान के बाद खुलने वाले मार्गों का स्पष्ट नक्शा — इंजीनियरिंग, चिकित्सा एवं जीव विज्ञान, शुद्ध विज्ञान, प्रौद्योगिकी और अंतर-धारा विकल्प — बिना वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Science keeps many doors open',
        headingHi: 'विज्ञान कई द्वार खुले रखता है',
        bodyEn:
          'Class 12 Science is usually taken with Mathematics (PCM), Biology (PCB), or both. Beyond the well-known engineering and medical routes, a science background also leads to pure sciences, technology, research, design, defence, and even commerce or management later. There is no single "best" path — the right choice depends on your interests and strengths.',
      },
      {
        headingEn: 'Engineering and technology (mainly PCM)',
        bodyEn:
          'Students with Mathematics commonly pursue a B.Tech or B.E. in engineering. Admission to the NITs, IIITs, and centrally funded institutes is through JEE Main, while the IITs admit through JEE Advanced; many states and private universities run their own entrance tests. Other options include BSc, BCA, architecture, and design.',
        bullets: [
          'B.Tech / B.E. via JEE Main (NITs/IIITs) and JEE Advanced (IITs)',
          'State and university-level engineering entrance tests',
          'BSc, BCA, architecture, and design programmes',
        ],
      },
      {
        headingEn: 'Medical and life sciences (mainly PCB)',
        bodyEn:
          'Students with Biology often aim for medical and allied fields. Admission to MBBS, BDS, AYUSH, and several nursing courses is through NEET UG. Beyond NEET, a Biology background also supports pharmacy, biotechnology, microbiology, agriculture, and pure life-science degrees, many of which have their own admission routes.',
      },
      {
        headingEn: 'Pure sciences, research and beyond',
        bodyEn:
          'A BSc followed by an MSc and research is a strong route for those who enjoy a subject for its own sake, leading into fields like data science, environmental science, and academia. The Common University Entrance Test (CUET) is used by many central universities. Confirm eligibility and the current process on each official source before applying.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is science only for doctors and engineers?',
        answerEn:
          'No. Science also leads to pure sciences, technology, research, pharmacy, biotechnology, design, defence, and cross-stream paths in commerce and management.',
      },
      {
        questionEn: 'Do I need JEE for every engineering college?',
        answerEn:
          'JEE Main is the route to the NITs and IIITs, and JEE Advanced to the IITs, but many state and private universities run their own engineering entrance tests. Check each institution\'s official admissions page.',
      },
      {
        questionEn: 'Can a science student switch to commerce or arts later?',
        answerEn:
          'Yes. Many B.Com, BBA, economics, and humanities programmes accept students from any stream — confirm the specific eligibility on the university\'s official site.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'neet-ug'],
    relatedCollegeSlugs: ['iit-bombay', 'aiims-delhi'],
    relatedGuideSlugs: ['courses-after-12th-pcm', 'courses-after-12th-pcb', 'career-options-after-12th-commerce'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'NTA — NEET UG official site', url: 'https://neet.nta.nic.in' },
      { label: 'NTA — CUET (Common University Entrance Test) official site', url: 'https://cuet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['career options after 12th science', 'courses after 12th science', 'what to do after 12th science', 'pcm pcb career', 'after 12th science options'],
  },
  {
    slug: 'career-options-after-12th-commerce',
    category: 'career',
    region: 'india',
    titleEn: 'Career Options After 12th Commerce',
    titleHi: '12वीं वाणिज्य के बाद करियर विकल्प',
    descriptionEn:
      'The main paths after Class 12 Commerce in India — degrees, professional qualifications like CA/CS/CMA, and cross-stream routes — explained neutrally, with no income guarantees.',
    descriptionHi:
      'भारत में 12वीं वाणिज्य के बाद के मुख्य मार्ग — डिग्री, सीए/सीएस/सीएमए जैसी पेशेवर योग्यताएँ और अंतर-धारा विकल्प — निष्पक्ष रूप से समझाए गए, बिना किसी आय की गारंटी के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What commerce leads to',
        headingHi: 'वाणिज्य किस ओर ले जाता है',
        bodyEn:
          'Class 12 Commerce builds a base for business, finance, accounting, economics, and law. Students can pursue a degree, a professional qualification, or both together — and, like other streams, can also move into law, design, or civil services later. The best route depends on your interests, not on any single ranking.',
      },
      {
        headingEn: 'Degree paths',
        bodyEn:
          'Common degrees include B.Com (including Honours), BBA, BMS, and BA in Economics. The Common University Entrance Test (CUET) is used by many central universities, while other universities admit on board marks or their own tests. Some finance and economics courses prefer applicants who studied Mathematics.',
        bullets: [
          'B.Com / B.Com (Hons)',
          'BBA / BMS (management)',
          'BA Economics and allied programmes',
        ],
      },
      {
        headingEn: 'Professional qualifications',
        bodyEn:
          'Commerce students often pursue professional courses alongside or after a degree. Chartered Accountancy (CA) is offered by the Institute of Chartered Accountants of India (ICAI); Company Secretary (CS) by the Institute of Company Secretaries of India (ICSI); and Cost and Management Accountancy (CMA) by ICMAI. Each has its own stages and eligibility — confirm the current structure on the official body\'s website.',
      },
      {
        headingEn: 'Cross-stream and competitive routes',
        bodyEn:
          'A commerce background also supports a five-year integrated law degree after Class 12 (through tests like CLAT), as well as design, data and analytics courses, and later the civil services. Choose based on aptitude and interest rather than promises of a particular salary.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can a commerce student become a Chartered Accountant?',
        answerEn:
          'Yes. CA is offered by the Institute of Chartered Accountants of India (ICAI) and is a common route for commerce students. Check the current stages and eligibility on the official ICAI website.',
      },
      {
        questionEn: 'Do commerce courses require Mathematics?',
        answerEn:
          'Some courses, especially in economics and finance, prefer or require Mathematics, while many B.Com and BBA programmes do not. Confirm the requirement for each course officially.',
      },
      {
        questionEn: 'Is CA the only good option after commerce?',
        answerEn:
          'No. Commerce leads to many degree, professional (CA/CS/CMA), and cross-stream paths including law and management — there is no single "best" option for everyone.',
      },
    ],
    relatedExamSlugs: ['clat', 'cat'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-12th-science', 'career-options-after-12th-arts', 'how-to-become-a-lawyer-in-india'],
    sources: [
      { label: 'Institute of Chartered Accountants of India (ICAI) — official site', url: 'https://www.icai.org' },
      { label: 'Institute of Company Secretaries of India (ICSI) — official site', url: 'https://www.icsi.edu' },
      { label: 'Institute of Cost Accountants of India (ICMAI) — official site', url: 'https://icmai.in' },
      { label: 'NTA — CUET (Common University Entrance Test) official site', url: 'https://cuet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['career options after 12th commerce', 'courses after 12th commerce', 'what to do after 12th commerce', 'ca cs cma after 12th', 'commerce career options'],
  },
  {
    slug: 'career-options-after-12th-arts',
    category: 'career',
    region: 'india',
    titleEn: 'Career Options After 12th Arts (Humanities)',
    titleHi: '12वीं कला (मानविकी) के बाद करियर विकल्प',
    descriptionEn:
      'A neutral overview of the wide range of paths after Class 12 Arts/Humanities in India — degrees, law, design, media, and competitive routes — with no stereotypes or income claims.',
    descriptionHi:
      'भारत में 12वीं कला/मानविकी के बाद के विविध मार्गों का निष्पक्ष अवलोकन — डिग्री, विधि, डिज़ाइन, मीडिया और प्रतियोगी मार्ग — बिना किसी रूढ़िवादिता या आय के दावे के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Arts is a broad, flexible stream',
        headingHi: 'कला एक व्यापक, लचीली धारा है',
        bodyEn:
          'Class 12 Arts (Humanities) opens a wide range of fields — from the social sciences and languages to law, design, media, and public service. It is not a "lesser" stream; it suits students interested in people, ideas, society, and communication. As with any stream, the right path depends on individual interest and aptitude.',
      },
      {
        headingEn: 'Degree paths',
        bodyEn:
          'Common degrees include BA and BA (Hons) in subjects such as history, political science, psychology, economics, sociology, and literature, along with BFA (fine arts), BSW (social work), and BJMC (journalism and mass communication). The Common University Entrance Test (CUET) is used by many central universities for admission.',
        bullets: [
          'BA / BA (Hons) across humanities and social sciences',
          'BFA, BSW, and BJMC (media)',
          'Psychology, economics, and language programmes',
        ],
      },
      {
        headingEn: 'Professional and creative routes',
        bodyEn:
          'A five-year integrated law degree after Class 12 (through tests such as CLAT or AILET) is open to arts students, as are design programmes (admission through institute-specific tests), hotel management, and education. These combine an arts foundation with a professional qualification.',
      },
      {
        headingEn: 'Competitive examinations and beyond',
        bodyEn:
          'Many arts graduates later appear for the civil services and other competitive examinations, or move into teaching, research, policy, and the social sector. Base your plan on your strengths and verified official information rather than on assumptions about which stream "earns more".',
      },
    ],
    faqs: [
      {
        questionEn: 'Is arts a good stream after 10th or 12th?',
        answerEn:
          'Arts offers a wide set of options across humanities, law, design, media, and public service. Whether it suits you depends on your interests — no stream is universally "better" than another.',
      },
      {
        questionEn: 'Can arts students study law?',
        answerEn:
          'Yes. The five-year integrated law degree after Class 12 is open to students from any stream, including arts, through tests such as CLAT or AILET.',
      },
      {
        questionEn: 'What can I study after 12th arts?',
        answerEn:
          'Options include BA/BA (Hons), BFA, BSW, BJMC, psychology, law, design, and hotel management, among others. CUET is used for admission to many central universities.',
      },
    ],
    relatedExamSlugs: ['clat'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-12th-commerce', 'career-options-after-12th-science', 'how-to-become-a-lawyer-in-india'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
      { label: 'Consortium of National Law Universities — official CLAT site', url: 'https://consortiumofnlus.ac.in' },
      { label: 'National Law University, Delhi — official site (AILET)', url: 'https://nludelhi.ac.in' },
      { label: 'NTA — CUET (Common University Entrance Test) official site', url: 'https://cuet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['career options after 12th arts', 'courses after 12th arts', 'what to do after 12th arts', 'humanities career options', 'after 12th arts options'],
  },
  {
    slug: 'courses-after-12th-pcm',
    category: 'career',
    region: 'india',
    titleEn: 'Courses After 12th PCM (Physics, Chemistry, Maths)',
    titleHi: '12वीं पीसीएम (भौतिकी, रसायन, गणित) के बाद कोर्स',
    descriptionEn:
      'The main courses open to PCM students after Class 12 — engineering, architecture, pure sciences, computer applications, defence, and more — explained without rankings or salary claims.',
    descriptionHi:
      'पीसीएम छात्रों के लिए 12वीं के बाद खुले मुख्य कोर्स — इंजीनियरिंग, वास्तुकला, शुद्ध विज्ञान, कंप्यूटर अनुप्रयोग, रक्षा और अधिक — बिना रैंकिंग या वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'PCM is a versatile combination',
        headingHi: 'पीसीएम एक बहुमुखी संयोजन है',
        bodyEn:
          'Physics, Chemistry, and Mathematics together open more than just engineering. PCM students can pursue technology, architecture, pure sciences, computer applications, design, defence, and quantitative fields in economics and finance. The right course depends on what you enjoy and where your aptitude lies.',
      },
      {
        headingEn: 'Engineering and technology',
        bodyEn:
          'B.Tech and B.E. programmes are the most common PCM route. Admission to the NITs, IIITs, and GFTIs is through JEE Main, and to the IITs through JEE Advanced; state CETs and private universities offer additional routes. Branches range from computer science and electronics to mechanical, civil, and many newer fields.',
        bullets: [
          'B.Tech / B.E. via JEE Main and JEE Advanced',
          'State CETs and private-university engineering admissions',
          'Emerging branches such as data science and AI',
        ],
      },
      {
        headingEn: 'Beyond engineering',
        bodyEn:
          'PCM also leads to architecture (B.Arch, with admission tests such as NATA), BSc in physics, chemistry, or mathematics, BCA and computer applications, design (B.Des), and defence entry through the National Defence Academy route. Many commerce and economics programmes also welcome PCM students.',
      },
      {
        headingEn: 'How to choose',
        bodyEn:
          'Rather than chasing a "top" branch or course, match the subject to your interests and verify eligibility, seats, and fees on each official source. Keeping options open early — for example, preparing for JEE while exploring BSc or architecture — is a reasonable strategy.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is PCM only useful for engineering?',
        answerEn:
          'No. PCM also supports architecture, pure sciences, computer applications, design, defence, and quantitative economics or finance, among other fields.',
      },
      {
        questionEn: 'Do I need JEE to study engineering?',
        answerEn:
          'JEE Main leads to the NITs and IIITs and JEE Advanced to the IITs, but state CETs and private universities run their own engineering admissions. Check each one officially.',
      },
      {
        questionEn: 'Can PCM students take commerce courses?',
        answerEn:
          'Yes. Many B.Com, BBA, and economics programmes accept students from any stream — confirm the specific eligibility on the university\'s official site.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'nit-trichy'],
    relatedGuideSlugs: ['career-options-after-12th-science', 'how-to-get-into-iit', 'iit-vs-nit-which-is-better'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'Council of Architecture — NATA official site', url: 'https://nata.in' },
      { label: 'UPSC — National Defence Academy & Naval Academy Examination', url: 'https://upsc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['courses after 12th pcm', 'pcm career options', 'what to do after 12th pcm', 'options after pcm besides engineering', 'pcm courses list'],
  },
  {
    slug: 'courses-after-12th-pcb',
    category: 'career',
    region: 'india',
    titleEn: 'Courses After 12th PCB (Physics, Chemistry, Biology)',
    titleHi: '12वीं पीसीबी (भौतिकी, रसायन, जीव विज्ञान) के बाद कोर्स',
    descriptionEn:
      'The main courses open to PCB students after Class 12 — medical and allied fields, pharmacy, life sciences, agriculture, and more — beyond MBBS, with no salary or guarantee claims.',
    descriptionHi:
      'पीसीबी छात्रों के लिए 12वीं के बाद खुले मुख्य कोर्स — चिकित्सा एवं संबद्ध क्षेत्र, फार्मेसी, जीव विज्ञान, कृषि और अधिक — एमबीबीएस से परे, बिना वेतन या गारंटी के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'PCB goes well beyond MBBS',
        headingHi: 'पीसीबी एमबीबीएस से कहीं आगे जाता है',
        bodyEn:
          'Physics, Chemistry, and Biology open medical and allied health fields, but also pharmacy, life sciences, biotechnology, agriculture, nursing, and research. MBBS is competitive and is far from the only rewarding path, so it helps to know the full range before deciding.',
      },
      {
        headingEn: 'The medical route (NEET UG)',
        bodyEn:
          'Admission to MBBS, BDS, AYUSH courses, and many nursing programmes is through NEET UG, a single national entrance test. The eligibility, pattern, and counselling are set officially each year — the related NEET guides cover this in more detail, and you should confirm current rules on the official source.',
      },
      {
        headingEn: 'Options that may not require NEET',
        bodyEn:
          'Many science and health-related courses have their own admission routes rather than NEET, including pharmacy (B.Pharm), BSc in biotechnology, microbiology, zoology, or biochemistry, several allied-health and nursing programmes, and agriculture. Check each course\'s official eligibility, since requirements vary.',
        bullets: [
          'B.Pharm and allied-health programmes',
          'BSc in biotechnology, microbiology, zoology, biochemistry',
          'Agriculture and life-science degrees',
        ],
      },
      {
        headingEn: 'How to choose',
        bodyEn:
          'Decide based on your interests and strengths rather than the assumption that only MBBS is worthwhile. No guide can promise a specific salary or seat, so use official information about each course and route to plan realistically.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is NEET required for every PCB career?',
        answerEn:
          'No. NEET UG is required for MBBS, BDS, AYUSH, and many nursing courses, but pharmacy, biotechnology, allied-health, agriculture, and many BSc programmes have their own admission routes.',
      },
      {
        questionEn: 'What can I do after PCB besides MBBS?',
        answerEn:
          'Options include B.Pharm, BSc in life sciences, nursing and allied-health courses, biotechnology, microbiology, and agriculture, among others.',
      },
      {
        questionEn: 'Can PCB students take up engineering?',
        answerEn:
          'Engineering usually requires Mathematics (PCM), so most PCB students do not qualify directly. Some interdisciplinary options exist — verify the eligibility for any specific course officially.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: ['aiims-delhi'],
    relatedGuideSlugs: ['career-options-after-12th-science', 'how-to-become-a-doctor-in-india', 'neet-ug-eligibility-criteria'],
    sources: [
      { label: 'NTA — NEET UG official site', url: 'https://neet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['courses after 12th pcb', 'pcb career options', 'what to do after 12th pcb', 'options after pcb besides mbbs', 'pcb courses list'],
  },
  // ─────────────────────────── Set 8 — Engineering branches ──────────────────
  {
    slug: 'computer-science-engineering-overview',
    category: 'career',
    region: 'india',
    titleEn: 'Computer Science Engineering (CSE): An Overview',
    titleHi: 'कंप्यूटर साइंस इंजीनियरिंग (सीएसई): एक परिचय',
    descriptionEn:
      'What computer science engineering covers, what students learn, where the degree can lead, and how to get in — explained neutrally, without rankings or salary claims.',
    descriptionHi:
      'कंप्यूटर साइंस इंजीनियरिंग में क्या शामिल है, छात्र क्या सीखते हैं, यह डिग्री कहाँ ले जा सकती है और प्रवेश कैसे मिलता है — निष्पक्ष रूप से, बिना रैंकिंग या वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What CSE is about',
        headingHi: 'सीएसई किस बारे में है',
        bodyEn:
          'Computer Science Engineering is the study of computing — how software and computer systems are designed and built. It is much broader than just writing code, covering programming, data structures and algorithms, operating systems, databases, computer networks, and the theory behind them.',
      },
      {
        headingEn: 'What you study and specialise in',
        bodyEn:
          'Alongside core computer science, most programmes offer electives and newer allied branches such as artificial intelligence and machine learning, data science, and cybersecurity. The exact curriculum and specialisations vary by university, so check each programme\'s official syllabus.',
        bullets: [
          'Core: programming, algorithms, systems, databases, networks',
          'Electives: AI/ML, data science, cybersecurity, and more',
          'Project work, internships, and a final-year project',
        ],
      },
      {
        headingEn: 'Where the degree can lead',
        bodyEn:
          'CSE graduates work across many industries — not only in technology companies but also in finance, healthcare, manufacturing, and the public sector — in roles spanning software development, data, cloud, security, and research. Many also pursue higher study (M.Tech or MS, often through GATE or the GRE) or research.',
      },
      {
        headingEn: 'How to get in and how to choose',
        bodyEn:
          'Admission to a B.Tech in CSE at the NITs and IITs is through JEE Main and JEE Advanced respectively, with many state and private universities offering their own routes. Choose CSE because the subject interests you rather than because it is popular — fit matters more than hype, and the related guide on choosing a branch can help.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is CSE only about coding?',
        answerEn:
          'No. Coding is one part; CSE also covers algorithms, systems, databases, networks, theory, and specialisations like AI and security. It leads to many roles beyond pure programming.',
      },
      {
        questionEn: 'Do I need an IIT to study CSE?',
        answerEn:
          'No. The IITs (via JEE Advanced) and NITs (via JEE Main) are well known, but many state and private universities also offer strong CSE programmes. Compare curricula and admission routes officially.',
      },
      {
        questionEn: 'Is CSE the best engineering branch?',
        answerEn:
          'There is no universally "best" branch. CSE is popular, but the right choice depends on your interests and goals — see the related guide on how to choose a branch.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-delhi'],
    relatedGuideSlugs: ['best-engineering-branches', 'btech-vs-bsc-which-to-choose', 'courses-after-12th-pcm'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['computer science engineering', 'cse course details', 'what is cse engineering', 'cse career options', 'cse syllabus overview'],
  },
  {
    slug: 'mechanical-engineering-career-scope',
    category: 'career',
    region: 'india',
    titleEn: 'Mechanical Engineering: Career Scope',
    titleHi: 'मैकेनिकल इंजीनियरिंग: करियर की संभावनाएँ',
    descriptionEn:
      'What mechanical engineering involves, the sectors and roles it leads to, the place of GATE and higher study, and how to decide if it suits you — without salary or placement claims.',
    descriptionHi:
      'मैकेनिकल इंजीनियरिंग में क्या शामिल है, यह किन क्षेत्रों और भूमिकाओं की ओर ले जाती है, गेट एवं उच्च शिक्षा की भूमिका, और यह आपके लिए उपयुक्त है या नहीं — बिना वेतन या प्लेसमेंट के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What mechanical engineering is',
        headingHi: 'मैकेनिकल इंजीनियरिंग क्या है',
        bodyEn:
          'Mechanical engineering deals with the design, manufacture, and maintenance of machines and mechanical systems. Core subjects include thermodynamics, mechanics, materials, manufacturing processes, and machine design — often described as one of the broadest engineering disciplines.',
      },
      {
        headingEn: 'Sectors and roles',
        bodyEn:
          'Mechanical engineers work across manufacturing, automotive, aerospace, energy, robotics, and heating-and-cooling systems, in roles from design and production to research and development. The breadth of the field also makes it possible to move into adjacent areas such as data, operations, and management.',
        bullets: [
          'Manufacturing, automotive, and aerospace',
          'Energy, robotics, and automation',
          'Design, production, quality, and R&D roles',
        ],
      },
      {
        headingEn: 'Higher study and public-sector roles',
        bodyEn:
          'Many graduates pursue an M.Tech or MS, or appear for the Graduate Aptitude Test in Engineering (GATE), which is used both for postgraduate admission and for recruitment by several public-sector undertakings. Check the official GATE portal of the conducting institute for current details.',
      },
      {
        headingEn: 'How to get in and how to choose',
        bodyEn:
          'Admission to a B.Tech in mechanical engineering follows the usual routes — JEE Main and JEE Advanced for the NITs and IITs, plus state and private-university tests. Choose it if you enjoy how physical systems and machines work; demand varies by sector and over time, so base your decision on interest rather than absolute claims.',
      },
    ],
    faqs: [
      {
        questionEn: 'Does mechanical engineering still have scope?',
        answerEn:
          'Mechanical engineering remains broad across many industries, though demand varies by sector and economic conditions. Rather than treating it as universally "in" or "out", weigh your own interest and the areas you want to work in.',
      },
      {
        questionEn: 'What is the role of GATE for mechanical engineers?',
        answerEn:
          'GATE is used for admission to postgraduate engineering programmes and for recruitment by several public-sector undertakings. Refer to the official GATE portal for the current pattern and process.',
      },
      {
        questionEn: 'Are there only "core" jobs in mechanical engineering?',
        answerEn:
          'No. Beyond core design and manufacturing roles, mechanical graduates also move into data, operations, management, and cross-disciplinary fields.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'gate'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-madras'],
    relatedGuideSlugs: ['best-engineering-branches', 'computer-science-engineering-overview', 'courses-after-12th-pcm'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['mechanical engineering scope', 'mechanical engineering career', 'is mechanical engineering good', 'mechanical engineering jobs', 'mechanical engineering future'],
  },
  {
    slug: 'electrical-engineering-overview',
    category: 'career',
    region: 'india',
    titleEn: 'Electrical Engineering: An Overview',
    titleHi: 'इलेक्ट्रिकल इंजीनियरिंग: एक परिचय',
    descriptionEn:
      'What electrical engineering covers, the sectors and roles it leads to, the place of GATE and higher study, and how to decide if it suits you — without salary or ranking claims.',
    descriptionHi:
      'इलेक्ट्रिकल इंजीनियरिंग में क्या शामिल है, यह किन क्षेत्रों और भूमिकाओं की ओर ले जाती है, गेट एवं उच्च शिक्षा की भूमिका, और यह आपके लिए उपयुक्त है या नहीं — बिना वेतन या रैंकिंग के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What electrical engineering is',
        headingHi: 'इलेक्ट्रिकल इंजीनियरिंग क्या है',
        bodyEn:
          'Electrical engineering focuses on the generation, transmission, and use of electrical energy, as well as electronics, control systems, signals, and electrical machines. Some programmes lean towards power systems, while others overlap with electronics and communication.',
      },
      {
        headingEn: 'Sectors and roles',
        bodyEn:
          'Electrical engineers work in power and energy, electronics, telecommunications, automation, embedded systems, and increasingly in renewable energy. Roles range from design and testing to operations, maintenance, and research.',
        bullets: [
          'Power, energy, and renewable energy',
          'Electronics, telecom, and embedded systems',
          'Automation, control, and R&D roles',
        ],
      },
      {
        headingEn: 'Higher study and public-sector roles',
        bodyEn:
          'As with other core branches, many electrical graduates pursue an M.Tech or MS or appear for GATE, which is used for postgraduate admission and for recruitment by several public-sector undertakings. Confirm the current process on the official GATE portal.',
      },
      {
        headingEn: 'How to get in and how to choose',
        bodyEn:
          'Admission follows the standard engineering routes — JEE Main and JEE Advanced for the NITs and IITs, and state or private-university tests elsewhere. If you are drawn to how electrical and electronic systems work, it is worth comparing the curricula of electrical and electronics-and-communication programmes before choosing.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is the difference between EE and ECE?',
        answerEn:
          'Electrical engineering (EE) tends to emphasise power and energy systems, while electronics and communication engineering (ECE) focuses more on electronics and communication. Curricula overlap and vary by university — compare them officially.',
      },
      {
        questionEn: 'Is electrical engineering in demand?',
        answerEn:
          'Electrical engineers work across power, electronics, telecom, and renewable energy, but demand varies by sector and over time. Choose based on interest rather than absolute "in demand" claims.',
      },
      {
        questionEn: 'What is GATE used for?',
        answerEn:
          'GATE is used for postgraduate engineering admission and for recruitment by several public-sector undertakings. See the official GATE portal for the current details.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'gate'],
    relatedCollegeSlugs: ['iit-delhi', 'iit-kanpur'],
    relatedGuideSlugs: ['best-engineering-branches', 'mechanical-engineering-career-scope', 'computer-science-engineering-overview'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['electrical engineering overview', 'electrical engineering career', 'ee vs ece', 'electrical engineering jobs', 'electrical engineering scope'],
  },
  {
    slug: 'best-engineering-branches',
    category: 'comparison',
    region: 'india',
    titleEn: 'How to Choose an Engineering Branch',
    titleHi: 'इंजीनियरिंग शाखा कैसे चुनें',
    descriptionEn:
      'There is no single "best" engineering branch — this guide explains the factors that actually matter and how to choose the branch that fits you, with no rankings.',
    descriptionHi:
      'कोई एक "सर्वश्रेष्ठ" इंजीनियरिंग शाखा नहीं होती — यह मार्गदर्शिका बताती है कि वास्तव में कौन-से कारक मायने रखते हैं और अपने लिए उपयुक्त शाखा कैसे चुनें, बिना किसी रैंकिंग के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'There is no universally "best" branch',
        headingHi: 'कोई सार्वभौमिक "सर्वश्रेष्ठ" शाखा नहीं होती',
        bodyEn:
          'It is tempting to ask which engineering branch is "best", but there is no single right answer. The popularity and demand of branches shift over time, and a branch that suits one student may not suit another. The more useful question is which branch fits your interests, strengths, and goals.',
      },
      {
        headingEn: 'Factors that actually matter',
        bodyEn:
          'Instead of chasing a ranking, weigh the things that genuinely affect your experience and options. The combination of branch and institute usually matters more than either alone.',
        bullets: [
          'Your genuine interest and aptitude for the subject',
          'The kind of work the branch typically leads to',
          'Scope for higher study and switching fields later',
          'The specific institute and its programme, not just the branch name',
        ],
      },
      {
        headingEn: 'The common branches, neutrally',
        bodyEn:
          'Widely offered branches include computer science, mechanical, electrical, civil, electronics and communication, and chemical engineering, among others. Each opens different kinds of work, and several allied and interdisciplinary branches (such as AI and data science) have emerged. Read each programme\'s official curriculum rather than relying on reputation alone.',
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'Talk to students and professionals in fields you are curious about, look closely at curricula, and keep your options open early. Choosing a branch you find genuinely interesting tends to serve you better than following short-lived trends — and this guide deliberately avoids declaring any branch superior.',
      },
    ],
    faqs: [
      {
        questionEn: 'Which engineering branch has the best scope?',
        answerEn:
          'There is no universal answer — scope depends on your interests, the institute, and demand that changes over time. Choose a branch that fits you rather than one labelled "best".',
      },
      {
        questionEn: 'Is computer science always the best choice?',
        answerEn:
          'CSE is popular, but "best" is personal. A branch is a good choice when it matches your interests and goals, not simply because it is currently in demand.',
      },
      {
        questionEn: 'Should I choose the branch or the college first?',
        answerEn:
          'Both matter, and the combination usually matters most. Weigh the specific branch-and-institute pairing rather than treating either in isolation.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'nit-trichy'],
    relatedGuideSlugs: ['computer-science-engineering-overview', 'mechanical-engineering-career-scope', 'electrical-engineering-overview', 'iit-vs-nit-which-is-better'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['best engineering branches', 'how to choose engineering branch', 'which engineering branch is best', 'engineering branch selection', 'choosing a btech branch'],
  },
  {
    slug: 'btech-vs-bsc-which-to-choose',
    category: 'comparison',
    region: 'india',
    titleEn: 'B.Tech vs BSc: Which to Choose?',
    titleHi: 'बीटेक बनाम बीएससी: कौन-सा चुनें?',
    descriptionEn:
      'A neutral comparison of B.Tech and BSc — what each degree is, what it suits, how admission and duration differ, and how to decide based on your goals.',
    descriptionHi:
      'बीटेक और बीएससी की निष्पक्ष तुलना — प्रत्येक डिग्री क्या है, किसके लिए उपयुक्त है, प्रवेश एवं अवधि में क्या अंतर है, और अपने लक्ष्यों के आधार पर कैसे तय करें।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Two different kinds of degree',
        headingHi: 'दो अलग प्रकार की डिग्री',
        bodyEn:
          'A B.Tech is a professional engineering degree, usually four years, focused on applying science and mathematics to build and design. A BSc is a science degree, usually three years, focused on the fundamentals of a subject and on building a base for research and postgraduate study. Neither is universally better — they serve different goals.',
      },
      {
        headingEn: 'What each one suits',
        bodyEn:
          'A B.Tech tends to suit students who want an applied, engineering-oriented path. A BSc tends to suit those who enjoy a science subject in depth and may pursue an MSc, research, teaching, or fields like data and analytics. Both can lead to strong careers, and many science graduates move into industry through further study.',
        bullets: [
          'B.Tech: applied engineering, four-year professional degree',
          'BSc: science fundamentals, three years, strong base for an MSc/research',
        ],
      },
      {
        headingEn: 'Admission and duration differ',
        bodyEn:
          'B.Tech admission is typically through engineering entrance tests such as JEE Main (and JEE Advanced for the IITs) or state and university tests. BSc admission is often through CUET, board marks, or university-level tests. Confirm the current eligibility and process on each official source.',
      },
      {
        headingEn: 'How to choose',
        bodyEn:
          'Ask whether you prefer applying engineering to build things now, or studying a science deeply with research and postgraduate options in mind. Both routes remain open to higher study and varied careers, so decide on interest and goals rather than on which "earns more".',
      },
    ],
    faqs: [
      {
        questionEn: 'Is B.Tech better than BSc?',
        answerEn:
          'Not universally. B.Tech is an applied engineering degree and BSc is a science degree with a research-friendly base. The better choice depends on your interests and goals, not on a ranking.',
      },
      {
        questionEn: 'Can a BSc lead to a good career?',
        answerEn:
          'Yes. A BSc can lead to research, teaching, data and analytics, and many industry roles, often via a postgraduate degree such as an MSc.',
      },
      {
        questionEn: 'Can I move into technology after a BSc?',
        answerEn:
          'Often yes, through postgraduate study or conversion programmes. Check the specific eligibility for the path you have in mind on the official source.',
      },
    ],
    relatedExamSlugs: ['jee-main'],
    relatedCollegeSlugs: ['iit-bombay'],
    relatedGuideSlugs: ['courses-after-12th-pcm', 'career-options-after-12th-science', 'best-engineering-branches'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['btech vs bsc', 'bsc or btech', 'btech vs bsc which is better', 'difference between btech and bsc', 'should i do btech or bsc'],
  },
  // ─────────────────────── Set 9 — Tests for studying abroad ─────────────────
  {
    slug: 'ielts-vs-toefl-which-to-take',
    category: 'comparison',
    region: 'india',
    titleEn: 'IELTS vs TOEFL: Which to Take?',
    titleHi: 'आईईएलटीएस बनाम टॉफेल: कौन-सा दें?',
    descriptionEn:
      'A neutral comparison of IELTS and TOEFL for Indian students — what each tests, who accepts them, and how to decide which English test fits your plans.',
    descriptionHi:
      'भारतीय छात्रों के लिए आईईएलटीएस और टॉफेल की निष्पक्ष तुलना — प्रत्येक क्या परखता है, कौन स्वीकार करता है, और कौन-सा अंग्रेज़ी टेस्ट आपकी योजनाओं के लिए उपयुक्त है, यह कैसे तय करें।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Two widely accepted English tests',
        headingHi: 'दो व्यापक रूप से स्वीकृत अंग्रेज़ी टेस्ट',
        bodyEn:
          'IELTS and TOEFL are two of the most widely accepted tests of English proficiency for study abroad. Both assess listening, reading, writing, and speaking, but they differ in style, scoring, and delivery. The right choice usually comes down to where you plan to apply and which test you are more comfortable with.',
      },
      {
        headingEn: 'How they differ',
        bodyEn:
          'IELTS (jointly delivered by the British Council, IDP, and Cambridge) is reported on a band scale and is available in Academic and General Training versions on computer or paper. TOEFL (from ETS) is most commonly taken as the internet-based TOEFL iBT. The exact section formats, timing, and scoring are set by each test owner and are updated periodically.',
        bullets: [
          'IELTS — band-scale scoring; Academic and General Training; computer or paper',
          'TOEFL — internet-based iBT, widely used for the United States',
          'Both test listening, reading, writing, and speaking',
        ],
      },
      {
        headingEn: 'Who accepts each',
        bodyEn:
          'Both tests are accepted very widely across the UK, USA, Canada, Australia, and Europe, though individual universities and visa systems may prefer or require a particular test or score. Always check the accepted tests and the required score on the official admissions and visa pages for your specific destination and course.',
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'This is not a question of which test is "better" — pick the one your target universities accept and that suits your style (for example, accent familiarity or typing vs handwriting). Confirm current formats and fees on the official test websites before booking.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is IELTS or TOEFL better for the USA?',
        answerEn:
          'Both are widely accepted in the USA. Neither is universally "better" — check each university\'s official admissions page for the tests and scores it accepts, then choose the one that suits you.',
      },
      {
        questionEn: 'Do both tests cover the same skills?',
        answerEn:
          'Yes — both assess listening, reading, writing, and speaking, but the question styles, scoring, and delivery differ. Review the official format of each before deciding.',
      },
      {
        questionEn: 'How long are the scores valid?',
        answerEn:
          'Validity is set by each test owner and the institution accepting the score. Confirm the current validity period on the official IELTS or TOEFL website.',
      },
    ],
    relatedExamSlugs: ['ielts', 'toefl'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-prepare-for-ielts', 'how-to-study-in-usa-from-india', 'how-to-study-in-uk-from-india'],
    sources: [
      { label: 'IELTS — official site', url: 'https://www.ielts.org' },
      { label: 'ETS — TOEFL official site', url: 'https://www.ets.org/toefl' },
    ],
    lastVerified: VERIFY,
    keywords: ['ielts vs toefl', 'toefl or ielts', 'ielts vs toefl which is better', 'difference between ielts and toefl', 'english test for study abroad'],
  },
  {
    slug: 'how-to-prepare-for-ielts',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'How to Prepare for IELTS',
    titleHi: 'आईईएलटीएस की तैयारी कैसे करें',
    descriptionEn:
      'A practical, format-first approach to preparing for IELTS — understanding the four sections, building skills, and using official materials, with no score guarantees.',
    descriptionHi:
      'आईईएलटीएस की तैयारी के लिए एक व्यावहारिक, प्रारूप-केंद्रित दृष्टिकोण — चार खंडों को समझना, कौशल बनाना और आधिकारिक सामग्री का उपयोग करना, बिना किसी स्कोर की गारंटी के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Understand the format first',
        headingHi: 'पहले प्रारूप समझें',
        bodyEn:
          'IELTS tests four skills — listening, reading, writing, and speaking — and is offered in Academic and General Training versions. Before preparing, confirm which version your university or visa route needs, and read the official test format so you practise the right task types.',
      },
      {
        headingEn: 'Build each skill',
        bodyEn:
          'Effective preparation works on all four skills rather than just vocabulary. Listening and reading improve with regular, varied English input; writing and speaking improve with practice and feedback against the official assessment criteria.',
        bullets: [
          'Listening: practise with varied accents and note-taking',
          'Reading: practise skimming, scanning, and timing',
          'Writing: practise the task types and review against the criteria',
          'Speaking: practise aloud, ideally with feedback',
        ],
      },
      {
        headingEn: 'Use official materials',
        bodyEn:
          'Prepare with official IELTS practice materials and sample tests so the question styles match the real test. Free and paid official resources are listed on the IELTS website; be cautious of unofficial sources that promise guaranteed bands.',
      },
      {
        headingEn: 'Plan and book sensibly',
        bodyEn:
          'Give yourself enough time to practise, take timed mock tests to build stamina, and book your test date to align with your application deadlines. Confirm the current fees, dates, and the score your destination requires on the official site — no preparation can "guarantee" a particular band.',
      },
    ],
    faqs: [
      {
        questionEn: 'How long does it take to prepare for IELTS?',
        answerEn:
          'It varies with your current English level and target band. Plan enough time to practise all four skills and take mock tests; there is no fixed duration that works for everyone.',
      },
      {
        questionEn: 'Which is harder — Academic or General Training?',
        answerEn:
          'They are designed for different purposes (study vs migration/work), not strictly ranked by difficulty. Take the version your university or visa route requires, confirmed on the official site.',
      },
      {
        questionEn: 'Can a course guarantee a high band?',
        answerEn:
          'No. Be wary of any course or source promising a guaranteed band. Your score reflects your performance on test day against the official criteria.',
      },
    ],
    relatedExamSlugs: ['ielts', 'toefl'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['ielts-vs-toefl-which-to-take', 'how-to-study-in-uk-from-india', 'how-to-study-in-canada-from-india'],
    sources: [
      { label: 'IELTS — official site', url: 'https://www.ielts.org' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to prepare for ielts', 'ielts preparation', 'ielts study plan', 'ielts tips', 'ielts academic preparation'],
  },
  {
    slug: 'gre-guide-for-indian-students',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'GRE Guide for Indian Students',
    titleHi: 'भारतीय छात्रों के लिए जीआरई गाइड',
    descriptionEn:
      'What the GRE is, who needs it, how the test is structured, and how to approach preparation — for Indian students applying to graduate programmes abroad, with no score or fee claims.',
    descriptionHi:
      'जीआरई क्या है, किसे इसकी आवश्यकता है, टेस्ट कैसे संरचित है, और तैयारी कैसे करें — विदेश में स्नातकोत्तर कार्यक्रमों के लिए आवेदन करने वाले भारतीय छात्रों के लिए, बिना स्कोर या शुल्क के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the GRE is and who needs it',
        headingHi: 'जीआरई क्या है और किसे चाहिए',
        bodyEn:
          'The GRE General Test, administered by ETS, is used in admissions for many graduate programmes — especially master\'s and PhD courses abroad — and is accepted by some business schools too. Not every programme requires it, and test policies have changed in recent years, so check whether your target programmes need a GRE score.',
      },
      {
        headingEn: 'How the test is structured',
        bodyEn:
          'The GRE General Test measures verbal reasoning, quantitative reasoning, and analytical writing. The exact number of questions, timing, and the score scale are set by ETS and have been revised over time, so confirm the current structure on the official GRE site before you prepare.',
        bullets: [
          'Verbal Reasoning',
          'Quantitative Reasoning',
          'Analytical Writing',
        ],
      },
      {
        headingEn: 'How to prepare',
        bodyEn:
          'Start with official GRE materials so the question types match the real test. Build vocabulary and reading skills for the verbal section, revise fundamentals for the quantitative section, and practise structured essays for analytical writing. Timed practice tests help build pacing.',
      },
      {
        headingEn: 'Plan around your applications',
        bodyEn:
          'Book the test to leave time before your application deadlines, and check the score each programme expects rather than aiming for an arbitrary number. Confirm current fees, dates, and any score-reporting rules on the official ETS GRE website — no score is "guaranteed" by preparation alone.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do all master\'s programmes abroad require the GRE?',
        answerEn:
          'No. Many do, but a growing number are GRE-optional or do not require it. Check each programme\'s official admissions page for its current requirement.',
      },
      {
        questionEn: 'Is the GRE used for MBA admissions?',
        answerEn:
          'Some business schools accept the GRE in place of the GMAT. Confirm on each school\'s official admissions page which test it accepts.',
      },
      {
        questionEn: 'How long is a GRE score valid?',
        answerEn:
          'Score validity is set by ETS and the accepting institution. Verify the current validity period on the official GRE website.',
      },
    ],
    relatedExamSlugs: ['gre', 'gmat'],
    relatedCollegeSlugs: ['massachusetts-institute-of-technology', 'stanford-university'],
    relatedGuideSlugs: ['how-to-study-in-usa-from-india', 'gmat-guide-for-indian-students', 'ielts-vs-toefl-which-to-take'],
    sources: [
      { label: 'ETS — GRE official site', url: 'https://www.ets.org/gre' },
    ],
    lastVerified: VERIFY,
    keywords: ['gre guide for indian students', 'what is gre exam', 'gre preparation', 'gre for ms abroad', 'gre exam structure'],
  },
  {
    slug: 'gmat-guide-for-indian-students',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'GMAT Guide for Indian Students',
    titleHi: 'भारतीय छात्रों के लिए जीमैट गाइड',
    descriptionEn:
      'What the GMAT is, who needs it, how it is structured, and how to prepare — for Indian students applying to business and management programmes, with no score or fee claims.',
    descriptionHi:
      'जीमैट क्या है, किसे चाहिए, यह कैसे संरचित है, और तैयारी कैसे करें — व्यवसाय एवं प्रबंधन कार्यक्रमों के लिए आवेदन करने वाले भारतीय छात्रों के लिए, बिना स्कोर या शुल्क के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the GMAT is and who needs it',
        headingHi: 'जीमैट क्या है और किसे चाहिए',
        bodyEn:
          'The GMAT, administered by GMAC, is used in admissions for many MBA and management programmes worldwide. Some programmes also accept the GRE, and a few are test-optional, so check what each target school requires before committing to the GMAT.',
      },
      {
        headingEn: 'How the test is structured',
        bodyEn:
          'The GMAT has been updated to the GMAT Focus Edition, which changed its sections and scoring from earlier versions. Because the structure has recently changed, confirm the current sections, timing, and score scale on the official GMAC site rather than relying on older descriptions.',
      },
      {
        headingEn: 'How to prepare',
        bodyEn:
          'Use official GMAC practice materials so the question styles match the current test. The GMAT rewards reasoning and problem-solving under time pressure, so practise the question types, review your errors, and take timed mock tests to build pacing and stamina.',
      },
      {
        headingEn: 'Plan around your applications',
        bodyEn:
          'Schedule the test to leave time before business-school deadlines and any rounds, and aim for the range each programme indicates rather than an arbitrary target. Confirm current fees, dates, and scoring on the official GMAC website — preparation improves your chances but cannot "guarantee" a score.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is the GMAT required for every MBA?',
        answerEn:
          'No. Many programmes require the GMAT, but some accept the GRE and others are test-optional. Check each school\'s official admissions page.',
      },
      {
        questionEn: 'What is the GMAT Focus Edition?',
        answerEn:
          'It is the updated version of the GMAT, with revised sections and scoring compared with earlier formats. Confirm the current structure on the official GMAC site.',
      },
      {
        questionEn: 'GMAT or GRE for an MBA?',
        answerEn:
          'It depends on the schools you target and your own strengths. Many schools accept both — check each school\'s policy and see the related GMAT-versus-CAT and MBA guides.',
      },
    ],
    relatedExamSlugs: ['gmat', 'gre'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['gre-guide-for-indian-students', 'mba-after-engineering-worth-it', 'cat-vs-gmat-which-to-take'],
    sources: [
      { label: 'GMAC — GMAT official site (mba.com)', url: 'https://www.mba.com/exams/gmat' },
    ],
    lastVerified: VERIFY,
    keywords: ['gmat guide for indian students', 'what is gmat exam', 'gmat focus edition', 'gmat preparation', 'gmat for mba abroad'],
  },
  {
    slug: 'duolingo-english-test-explained',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'The Duolingo English Test, Explained',
    titleHi: 'डुओलिंगो इंग्लिश टेस्ट, समझाया गया',
    descriptionEn:
      'What the Duolingo English Test is, how it works, and how to check whether your universities accept it — a neutral overview for Indian students, with no fee or score claims.',
    descriptionHi:
      'डुओलिंगो इंग्लिश टेस्ट क्या है, यह कैसे काम करता है, और यह जाँचना कि आपके विश्वविद्यालय इसे स्वीकार करते हैं या नहीं — भारतीय छात्रों के लिए एक निष्पक्ष अवलोकन, बिना शुल्क या स्कोर के दावों के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What the Duolingo English Test is',
        headingHi: 'डुओलिंगो इंग्लिश टेस्ट क्या है',
        bodyEn:
          'The Duolingo English Test (DET) is an online test of English proficiency that can be taken from home on a computer with a webcam. It is adaptive, meaning question difficulty adjusts to your responses, and it is generally shorter than some traditional English tests.',
      },
      {
        headingEn: 'How it works',
        bodyEn:
          'The test combines language tasks with remote proctoring, and results are typically returned within a few days. The exact format, scoring scale, and rules are set by Duolingo and updated periodically, so read the official test description before booking.',
      },
      {
        headingEn: 'Check acceptance carefully',
        bodyEn:
          'Acceptance of the DET has grown, but not every university or visa route accepts it, and some accept it only for certain programmes or with a minimum score. The single most important step is to confirm, on each institution\'s official admissions page, whether the DET is accepted for your specific course.',
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'The DET can be convenient because it is online and quick, but convenience matters only if your destinations accept it. Compare it against IELTS and TOEFL based on where you are applying, and confirm current fees and acceptance on the official sources.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is the Duolingo English Test accepted everywhere?',
        answerEn:
          'No. Acceptance has grown but is not universal, and some institutions accept it only for certain programmes. Confirm acceptance on each university\'s official admissions page.',
      },
      {
        questionEn: 'Can I take the Duolingo English Test from home?',
        answerEn:
          'Yes, it is taken online with remote proctoring and a webcam. Check the official technical and ID requirements before booking.',
      },
      {
        questionEn: 'Is the Duolingo test easier than IELTS or TOEFL?',
        answerEn:
          'It is a different format rather than simply "easier". Choose based on acceptance at your target universities and your own comfort, confirmed on the official sites.',
      },
    ],
    relatedExamSlugs: ['duolingo-english-test', 'ielts', 'toefl'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['ielts-vs-toefl-which-to-take', 'how-to-prepare-for-ielts', 'how-to-study-in-usa-from-india'],
    sources: [
      { label: 'Duolingo English Test — official site', url: 'https://englishtest.duolingo.com' },
    ],
    lastVerified: VERIFY,
    keywords: ['duolingo english test', 'duolingo english test explained', 'is duolingo test accepted', 'det for study abroad', 'duolingo vs ielts'],
  },
  // ──────────────── Set 10 — Student visas & application essentials ───────────
  {
    slug: 'us-f1-student-visa-guide',
    category: 'study-abroad',
    region: 'usa',
    titleEn: 'US F-1 Student Visa: A Factual Guide',
    titleHi: 'अमेरिकी एफ-1 छात्र वीज़ा: एक तथ्यात्मक मार्गदर्शिका',
    descriptionEn:
      'A neutral, factual overview of the US F-1 student visa — what it is and the official steps — with official US government sources to verify. This is general information, not immigration advice.',
    descriptionHi:
      'अमेरिकी एफ-1 छात्र वीज़ा का निष्पक्ष, तथ्यात्मक अवलोकन — यह क्या है और आधिकारिक चरण — सत्यापन हेतु आधिकारिक अमेरिकी सरकारी स्रोतों के साथ। यह सामान्य जानकारी है, आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the F-1 visa is',
        headingHi: 'एफ-1 वीज़ा क्या है',
        bodyEn:
          'The F-1 visa is the standard United States visa category for full-time academic study. The rules, forms, and fees are set by the US government and are updated from time to time. This guide explains the process in general terms only — always confirm the current requirements on the official US government sources before acting.',
      },
      {
        headingEn: 'The official steps, in outline',
        bodyEn:
          'After you are admitted, the institution issues the document required for the visa application, and you then complete the official application, the related system steps, and a visa interview. The exact forms, fees, and sequence are defined by the US government, so treat the outline below as a starting point and verify each step officially.',
        bullets: [
          'Receive admission and the institution\'s required document',
          'Complete the official visa application and any system/registration steps',
          'Pay the official fees and attend the visa interview',
        ],
      },
      {
        headingEn: 'Where to verify (official .gov)',
        bodyEn:
          'The authoritative sources are the US Department of State and the Department of Homeland Security. Their official websites publish the current forms, fees, timelines, and rules, which can change. Use only these official sources — not third-party agents — to confirm what applies to you.',
      },
      {
        headingEn: 'Important notes',
        bodyEn:
          'Visa decisions are made by the US authorities according to official rules; no guide, agent, or service can promise a visa. This page provides general factual information, not immigration or legal advice. If your situation is complex, rely on the official sources and, where appropriate, a qualified professional.',
      },
    ],
    faqs: [
      {
        questionEn: 'Which visa do I need to study in the USA?',
        answerEn:
          'The F-1 visa is the standard category for full-time academic study. Confirm the current requirements on the official US government sources before applying.',
      },
      {
        questionEn: 'Can anyone guarantee my US student visa?',
        answerEn:
          'No. Visa decisions are made by the US authorities under official rules. Be cautious of anyone promising a guaranteed visa — this guide offers factual information only.',
      },
      {
        questionEn: 'Where can I find the official rules?',
        answerEn:
          'Use the official US Department of State and Department of Homeland Security websites linked below; rules and fees change, so always check the current version.',
      },
    ],
    relatedExamSlugs: ['sat', 'gre', 'toefl'],
    relatedCollegeSlugs: ['massachusetts-institute-of-technology', 'harvard-university'],
    relatedGuideSlugs: ['how-to-study-in-usa-from-india', 'how-to-write-statement-of-purpose', 'letter-of-recommendation-guide'],
    sources: [
      { label: 'U.S. Department of State — Student Visa', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html' },
      { label: 'U.S. DHS — Study in the States', url: 'https://studyinthestates.dhs.gov' },
    ],
    lastVerified: VERIFY,
    keywords: ['f1 student visa', 'us student visa guide', 'how to apply for f1 visa', 'study visa usa', 'f1 visa process'],
  },
  {
    slug: 'uk-student-visa-guide',
    category: 'study-abroad',
    region: 'uk-ireland',
    titleEn: 'UK Student Visa: A Factual Guide',
    titleHi: 'यूके छात्र वीज़ा: एक तथ्यात्मक मार्गदर्शिका',
    descriptionEn:
      'A neutral, factual overview of the UK Student visa — what it is and the official steps — with the official GOV.UK source to verify. This is general information, not immigration advice.',
    descriptionHi:
      'यूके छात्र वीज़ा का निष्पक्ष, तथ्यात्मक अवलोकन — यह क्या है और आधिकारिक चरण — सत्यापन हेतु आधिकारिक GOV.UK स्रोत के साथ। यह सामान्य जानकारी है, आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the UK Student visa is',
        headingHi: 'यूके छात्र वीज़ा क्या है',
        bodyEn:
          'The Student visa is the main route for international students coming to the UK for higher education. The eligibility, evidence, and fees are set by the UK government and change periodically. This guide describes the process in general terms only — confirm the current rules on the official GOV.UK source.',
      },
      {
        headingEn: 'The official steps, in outline',
        bodyEn:
          'After receiving an offer, the sponsoring university issues a confirmation that supports the visa application; you then apply online, provide the required evidence, and complete any further steps the government specifies. The exact documents, financial evidence, and fees are defined officially, so verify each before applying.',
        bullets: [
          'Receive an offer and the university\'s confirmation of acceptance',
          'Apply online and provide the required evidence',
          'Pay the official fees and complete any further required steps',
        ],
      },
      {
        headingEn: 'Where to verify (official GOV.UK)',
        bodyEn:
          'GOV.UK is the authoritative source for the UK Student visa. It publishes the current eligibility, documents, fees, and processing information, all of which can change. Use the official GOV.UK page rather than third-party agents to confirm what applies to you.',
      },
      {
        headingEn: 'Important notes',
        bodyEn:
          'Visa decisions are made by the UK authorities under official rules; no service can promise a visa. This page provides general factual information, not immigration or legal advice. For complex situations, rely on the official source and, where appropriate, a qualified professional.',
      },
    ],
    faqs: [
      {
        questionEn: 'What visa do I need to study in the UK?',
        answerEn:
          'The Student visa is the main route for higher education in the UK. Confirm the current eligibility and steps on the official GOV.UK page before applying.',
      },
      {
        questionEn: 'Can anyone guarantee a UK student visa?',
        answerEn:
          'No. Decisions are made by the UK authorities under official rules. Treat any guaranteed-visa claim with caution; this guide gives factual information only.',
      },
      {
        questionEn: 'Where are the official UK visa rules?',
        answerEn:
          'On GOV.UK, linked below. The rules, evidence requirements, and fees change, so always check the current version.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: ['university-of-oxford', 'university-of-cambridge'],
    relatedGuideSlugs: ['how-to-study-in-uk-from-india', 'us-f1-student-visa-guide', 'how-to-write-statement-of-purpose'],
    sources: [
      { label: 'GOV.UK — Student visa', url: 'https://www.gov.uk/student-visa' },
    ],
    lastVerified: VERIFY,
    keywords: ['uk student visa', 'uk student visa guide', 'how to apply for uk student visa', 'study visa uk', 'uk student visa process'],
  },
  {
    slug: 'canada-study-permit-guide',
    category: 'study-abroad',
    region: 'canada',
    titleEn: 'Canada Study Permit: A Factual Guide',
    titleHi: 'कनाडा अध्ययन परमिट: एक तथ्यात्मक मार्गदर्शिका',
    descriptionEn:
      'A neutral, factual overview of the Canada study permit — what it is and the official steps — with the official Government of Canada source to verify. This is general information, not immigration advice.',
    descriptionHi:
      'कनाडा अध्ययन परमिट का निष्पक्ष, तथ्यात्मक अवलोकन — यह क्या है और आधिकारिक चरण — सत्यापन हेतु आधिकारिक कनाडा सरकार स्रोत के साथ। यह सामान्य जानकारी है, आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the study permit is',
        headingHi: 'अध्ययन परमिट क्या है',
        bodyEn:
          'Most international students need a study permit to study in Canada. It is issued by Immigration, Refugees and Citizenship Canada (IRCC), and the requirements and fees are set by the Government of Canada and change from time to time. This guide is a general outline only — confirm the current rules on the official Government of Canada source.',
      },
      {
        headingEn: 'The official steps, in outline',
        bodyEn:
          'You generally need an acceptance from a Designated Learning Institution (DLI) before applying for a study permit. You then complete the official application, provide the required documents and evidence, and pay the official fees. The exact requirements are defined by the Government of Canada, so verify each step officially.',
        bullets: [
          'Receive acceptance from a Designated Learning Institution (DLI)',
          'Complete the official study-permit application with required documents',
          'Pay the official fees and complete any further required steps',
        ],
      },
      {
        headingEn: 'Where to verify (official Government of Canada)',
        bodyEn:
          'The authoritative source is the Government of Canada (canada.ca / IRCC). It publishes the current eligibility, documents, fees, and processing details, which can change. Use the official source rather than third-party agents.',
      },
      {
        headingEn: 'Important notes',
        bodyEn:
          'Study-permit decisions are made by Canadian authorities under official rules; no service can promise approval. This page provides general factual information, not immigration or legal advice. For complex cases, rely on the official source and, where appropriate, a qualified professional.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I need a study permit to study in Canada?',
        answerEn:
          'Most international students need a study permit, usually after acceptance from a Designated Learning Institution. Confirm the current requirements on the official Government of Canada source.',
      },
      {
        questionEn: 'What is a DLI?',
        answerEn:
          'A Designated Learning Institution is a school approved to host international students. You generally need acceptance from a DLI to apply for a study permit — verify the current list and rules officially.',
      },
      {
        questionEn: 'Can a study permit be guaranteed?',
        answerEn:
          'No. Decisions are made by Canadian authorities under official rules. Be cautious of guaranteed-approval claims; this guide offers factual information only.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: ['university-of-toronto', 'university-of-british-columbia'],
    relatedGuideSlugs: ['how-to-study-in-canada-from-india', 'us-f1-student-visa-guide', 'uk-student-visa-guide'],
    sources: [
      { label: 'Government of Canada (IRCC) — Study in Canada', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html' },
    ],
    lastVerified: VERIFY,
    keywords: ['canada study permit', 'canada study permit guide', 'how to apply for canada study permit', 'study visa canada', 'dli canada'],
  },
  {
    slug: 'how-to-write-statement-of-purpose',
    category: 'admissions',
    region: 'india',
    titleEn: 'How to Write a Statement of Purpose (SOP)',
    titleHi: 'स्टेटमेंट ऑफ़ पर्पस (एसओपी) कैसे लिखें',
    descriptionEn:
      'A practical guide to writing a strong, original statement of purpose or personal statement — what it covers, how to structure it, and what to avoid, with no guarantees.',
    descriptionHi:
      'एक सशक्त, मौलिक स्टेटमेंट ऑफ़ पर्पस या व्यक्तिगत वक्तव्य लिखने की व्यावहारिक मार्गदर्शिका — इसमें क्या शामिल होता है, इसे कैसे संरचित करें, और किससे बचें, बिना किसी गारंटी के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What an SOP is for',
        headingHi: 'एसओपी किसलिए होता है',
        bodyEn:
          'A statement of purpose (sometimes called a personal statement or admissions essay) is your chance to explain, in your own words, your motivation, background, and goals, and why a particular programme fits them. Different applications use different names and formats — for example, the personal essay on the Common App or the personal statement on UCAS — so always follow the specific prompt and word limit.',
      },
      {
        headingEn: 'What to include',
        bodyEn:
          'A strong statement is specific and honest. It usually connects your interests and experiences to what you want to study and why this programme in particular suits you, with concrete examples rather than generic claims.',
        bullets: [
          'Your motivation and what sparked your interest',
          'Relevant experiences, with specific examples',
          'Why this programme and how it fits your goals',
          'What you hope to do next',
        ],
      },
      {
        headingEn: 'How to structure and revise it',
        bodyEn:
          'Open with something genuine rather than a clichéd quote, develop a clear thread through the body, and close by linking back to your goals. Write several drafts, cut filler, and ask a teacher or mentor for honest feedback. Keep within the official word or character limit.',
      },
      {
        headingEn: 'What to avoid',
        bodyEn:
          'Do not exaggerate, fabricate, or copy text from samples or other people — admissions processes value authenticity, and plagiarism can lead to rejection. Tailor each statement to the specific programme rather than sending one generic essay everywhere. No essay can "guarantee" admission; a clear, honest statement simply presents you well.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is the difference between an SOP and a personal statement?',
        answerEn:
          'The terms overlap and vary by application. Some use "statement of purpose", others "personal statement" or "personal essay". Follow the specific name, prompt, and length each application specifies.',
      },
      {
        questionEn: 'How long should an SOP be?',
        answerEn:
          'Length is set by each application or platform, so follow the official word or character limit rather than a fixed rule. Quality and relevance matter more than length.',
      },
      {
        questionEn: 'Can I reuse one SOP for every application?',
        answerEn:
          'It is better to tailor each statement to the specific programme. Reusing a generic essay tends to read as generic — and you must never copy someone else\'s text.',
      },
    ],
    relatedExamSlugs: ['gre', 'toefl'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['letter-of-recommendation-guide', 'how-to-study-in-usa-from-india', 'us-f1-student-visa-guide'],
    sources: [
      { label: 'Common App — official application platform', url: 'https://www.commonapp.org' },
      { label: 'UCAS — official UK application service', url: 'https://www.ucas.com' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to write statement of purpose', 'sop for university', 'statement of purpose tips', 'personal statement guide', 'sop format'],
  },
  {
    slug: 'letter-of-recommendation-guide',
    category: 'admissions',
    region: 'india',
    titleEn: 'Letter of Recommendation: A Student\'s Guide',
    titleHi: 'अनुशंसा पत्र: छात्रों के लिए मार्गदर्शिका',
    descriptionEn:
      'How letters of recommendation work, who to ask, and how to help your recommender — ethically and effectively — with no shortcuts and no guarantees.',
    descriptionHi:
      'अनुशंसा पत्र कैसे काम करते हैं, किससे अनुरोध करें, और अपने अनुशंसाकर्ता की मदद कैसे करें — नैतिक एवं प्रभावी ढंग से — बिना किसी शॉर्टकट या गारंटी के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What a letter of recommendation is',
        headingHi: 'अनुशंसा पत्र क्या है',
        bodyEn:
          'A letter of recommendation (LOR) is written by someone who knows your academic or professional work — usually a teacher, professor, or supervisor — to give the admissions committee an independent view of your abilities. Many applications collect it directly from the recommender through their official systems, such as the recommender features on the Common App or references on UCAS.',
      },
      {
        headingEn: 'Who to ask',
        bodyEn:
          'Choose recommenders who know you well and can speak specifically about your strengths, rather than the most senior person who barely knows you. A detailed letter from a teacher who taught you closely is usually more useful than a generic one from a distant authority.',
      },
      {
        headingEn: 'How to help your recommender',
        bodyEn:
          'Ask early and politely, and give them what they need to write well — your goals, the programmes and deadlines, your CV or transcript, and a reminder of work you did with them. Make their job easier without dictating what they write.',
        bullets: [
          'Ask well before the deadline',
          'Share your goals, CV, and the programme details',
          'Remind them of specific work you did together',
        ],
      },
      {
        headingEn: 'Keep it honest',
        bodyEn:
          'The letter must be written by the recommender, not by you. Writing your own letter for someone to sign, or forging a reference, is a serious integrity violation that can lead to rejection or worse. A genuine letter from someone who knows you is both the ethical and the more effective choice — and no letter can "guarantee" admission.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who should I ask for a letter of recommendation?',
        answerEn:
          'Ask someone who knows your work well and can give specific examples — often a teacher, professor, or supervisor — rather than the most senior person who hardly knows you.',
      },
      {
        questionEn: 'Can I write my own recommendation letter?',
        answerEn:
          'No. The letter must be written by your recommender. Writing it yourself for a signature, or forging one, is an integrity violation that can lead to rejection.',
      },
      {
        questionEn: 'How many letters do I need?',
        answerEn:
          'It depends on the application — follow the number and format each programme specifies on its official admissions page.',
      },
    ],
    relatedExamSlugs: ['gre'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-write-statement-of-purpose', 'how-to-study-in-usa-from-india', 'how-to-study-in-uk-from-india'],
    sources: [
      { label: 'Common App — official application platform', url: 'https://www.commonapp.org' },
      { label: 'UCAS — official UK application service', url: 'https://www.ucas.com' },
    ],
    lastVerified: VERIFY,
    keywords: ['letter of recommendation', 'lor for university', 'how to ask for a recommendation letter', 'lor guide students', 'recommendation letter tips'],
  },
  // ──────────────────────────────── Set 11 — Scholarships ────────────────────
  {
    slug: 'scholarships-for-indian-students-abroad',
    category: 'scholarships',
    region: 'india',
    titleEn: 'Scholarships for Indian Students Going Abroad',
    titleHi: 'विदेश जाने वाले भारतीय छात्रों के लिए छात्रवृत्तियाँ',
    descriptionEn:
      'How to find legitimate scholarships for studying abroad — the main types, well-known official programmes, and how to verify details and avoid scams. No amounts or deadlines are quoted here.',
    descriptionHi:
      'विदेश में पढ़ाई के लिए वैध छात्रवृत्तियाँ कैसे खोजें — मुख्य प्रकार, प्रसिद्ध आधिकारिक कार्यक्रम, और विवरण कैसे सत्यापित करें एवं धोखाधड़ी से कैसे बचें। यहाँ कोई राशि या समय-सीमा नहीं दी गई है।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The main types of scholarships',
        headingHi: 'छात्रवृत्तियों के मुख्य प्रकार',
        bodyEn:
          'Funding for study abroad generally comes from three sources: the universities themselves (merit or need-based awards and assistantships), government-funded programmes, and external organisations and foundations. Most awards are based on academic merit, financial need, or a specific field of study, so always read the official, published eligibility criteria for each one.',
        bullets: [
          'University scholarships and assistantships',
          'Government-funded programmes (of the home or host country)',
          'External foundations and field-specific awards',
        ],
      },
      {
        headingEn: 'Some well-known official programmes',
        bodyEn:
          'Examples of established, official programmes include the Fulbright-Nehru fellowships for study and research in the United States (administered for India by USIEF) and DAAD scholarships for Germany. The UK\'s Chevening and the Commonwealth scholarships are other well-known government programmes. Eligibility, levels, and funding differ by programme and year, so always check each programme\'s own official site.',
      },
      {
        headingEn: 'Where to look and how to apply',
        bodyEn:
          'Start with the official financial-aid pages of the universities you are applying to, then the official government and foundation programme sites. Note that deadlines for scholarships are often earlier than admission deadlines, so plan ahead and follow each official source for the current process.',
      },
      {
        headingEn: 'Avoid scams and false promises',
        bodyEn:
          'Be cautious of anyone charging large fees to "guarantee" a scholarship, or asking for money to release an award — legitimate scholarships do not work that way. Verify every offer on the official programme website, and never share sensitive personal or financial details with unofficial intermediaries.',
      },
    ],
    faqs: [
      {
        questionEn: 'Where do scholarships for studying abroad come from?',
        answerEn:
          'Mainly from universities, government-funded programmes, and external foundations. Check the official site of each for current eligibility and funding — details change each year.',
      },
      {
        questionEn: 'Can a scholarship be guaranteed for a fee?',
        answerEn:
          'No. Be very cautious of anyone promising a guaranteed scholarship for a fee. Legitimate awards are based on published criteria and never require paying to "release" funds.',
      },
      {
        questionEn: 'When should I apply for scholarships?',
        answerEn:
          'Often earlier than admission deadlines. Plan ahead and follow the official dates for each programme and university.',
      },
    ],
    relatedExamSlugs: ['gre', 'toefl'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['fulbright-scholarship-for-indians', 'daad-scholarship-for-indians', 'how-to-study-in-usa-from-india'],
    sources: [
      { label: 'USIEF — Fulbright-Nehru (official, India)', url: 'https://www.usief.org.in' },
      { label: 'DAAD — German Academic Exchange Service (official)', url: 'https://www.daad.de' },
      { label: 'Chevening — UK Government scholarships (official)', url: 'https://www.chevening.org' },
      { label: 'Commonwealth Scholarship Commission (UK) — official', url: 'https://cscuk.fcdo.gov.uk' },
    ],
    lastVerified: VERIFY,
    keywords: ['scholarships for indian students abroad', 'study abroad scholarships', 'scholarships to study overseas', 'fully funded scholarships abroad', 'how to find scholarships abroad'],
  },
  {
    slug: 'national-scholarship-portal-guide',
    category: 'scholarships',
    region: 'india',
    titleEn: 'National Scholarship Portal (NSP): A Guide',
    titleHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (एनएसपी): एक मार्गदर्शिका',
    descriptionEn:
      'What the National Scholarship Portal is, how it works as a single platform for government scholarships, and how to apply — with all scheme-specific details deferred to the official site.',
    descriptionHi:
      'राष्ट्रीय छात्रवृत्ति पोर्टल क्या है, यह सरकारी छात्रवृत्तियों के लिए एकल मंच के रूप में कैसे काम करता है, और आवेदन कैसे करें — सभी योजना-विशिष्ट विवरण आधिकारिक साइट पर छोड़े गए हैं।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What the NSP is',
        headingHi: 'एनएसपी क्या है',
        bodyEn:
          'The National Scholarship Portal (NSP) is an official Government of India platform that brings together a range of central and state government scholarship schemes in one place, so students can find and apply for the ones they are eligible for online. Schemes are based on official, published criteria such as academic merit or financial need.',
      },
      {
        headingEn: 'How it works',
        bodyEn:
          'Students register on the portal, complete a single profile, and apply to the schemes for which they qualify; applications are then verified by the relevant institutions and authorities. The exact list of schemes, eligibility, documents, and timelines is set officially and changes each cycle, so use the portal itself as the source of truth.',
      },
      {
        headingEn: 'How to apply sensibly',
        bodyEn:
          'Read each scheme\'s official eligibility before applying, keep your documents ready, and note that scheme deadlines vary. Apply only through the official portal, and be cautious of unofficial sites or agents claiming to process NSP applications for a fee.',
        bullets: [
          'Register and complete one profile on the official portal',
          'Check each scheme\'s official eligibility before applying',
          'Track official deadlines, which vary by scheme',
        ],
      },
      {
        headingEn: 'Verify everything officially',
        bodyEn:
          'Because schemes and rules change every year, this guide does not list specific amounts or dates. Always confirm the current schemes, eligibility, and deadlines on the official National Scholarship Portal.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is the National Scholarship Portal?',
        answerEn:
          'It is an official Government of India platform that lists many central and state government scholarship schemes in one place and lets eligible students apply online.',
      },
      {
        questionEn: 'Do I pay to apply on the NSP?',
        answerEn:
          'Applying through the official portal does not require paying an agent. Be cautious of unofficial sites or intermediaries that charge fees, and use only the official portal.',
      },
      {
        questionEn: 'How do I know which scheme I qualify for?',
        answerEn:
          'Each scheme lists official eligibility criteria on the portal. Read them carefully, since criteria and deadlines change each cycle.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['inspire-scholarship-guide', 'scholarships-for-indian-students-abroad', 'career-options-after-12th-science'],
    sources: [
      { label: 'National Scholarship Portal (NSP) — Government of India', url: 'https://scholarships.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['national scholarship portal', 'nsp scholarship', 'scholarships.gov.in', 'government scholarships india', 'nsp apply online'],
  },
  {
    slug: 'inspire-scholarship-guide',
    category: 'scholarships',
    region: 'india',
    titleEn: 'INSPIRE Scholarship Guide (Science Students)',
    titleHi: 'इंस्पायर छात्रवृत्ति मार्गदर्शिका (विज्ञान छात्र)',
    descriptionEn:
      'What the INSPIRE scholarship is, who it is broadly aimed at, and where to confirm official eligibility — for students pursuing the sciences, with no amounts or cut-offs quoted.',
    descriptionHi:
      'इंस्पायर छात्रवृत्ति क्या है, यह मोटे तौर पर किसके लिए है, और आधिकारिक पात्रता कहाँ सत्यापित करें — विज्ञान के क्षेत्र में पढ़ाई करने वाले छात्रों के लिए, बिना किसी राशि या कट-ऑफ के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What INSPIRE is',
        headingHi: 'इंस्पायर क्या है',
        bodyEn:
          'INSPIRE (Innovation in Science Pursuit for Inspired Research) is an initiative of the Department of Science and Technology (DST), Government of India, that encourages talented students to take up the study of science. Its scholarship component supports students pursuing science degrees, based on official merit criteria.',
      },
      {
        headingEn: 'Who it is broadly for',
        bodyEn:
          'The scholarship is aimed at students who perform well academically and choose to study the natural and basic sciences at the undergraduate and postgraduate levels. The precise eligibility — including the qualifying criteria and the courses covered — is defined officially by DST and can change, so confirm the current rules on the official INSPIRE portal.',
      },
      {
        headingEn: 'How to apply',
        bodyEn:
          'Eligible students apply through the official INSPIRE portal, following the published process and timeline. Keep your academic documents ready, and apply only through the official site. Government scholarships like this do not require paying an agent, so be cautious of anyone charging a fee to "secure" an award.',
      },
      {
        headingEn: 'Verify on the official portal',
        bodyEn:
          'This guide does not quote scholarship amounts, cut-offs, or dates, because they are set officially and revised over time. Always confirm the current eligibility, benefits, and deadlines on the official INSPIRE portal.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who is the INSPIRE scholarship for?',
        answerEn:
          'Broadly, for academically strong students who pursue the basic and natural sciences. The exact eligibility is set by the Department of Science and Technology — confirm it on the official INSPIRE portal.',
      },
      {
        questionEn: 'Which department runs INSPIRE?',
        answerEn:
          'INSPIRE is an initiative of the Department of Science and Technology (DST), Government of India.',
      },
      {
        questionEn: 'How much does the INSPIRE scholarship pay?',
        answerEn:
          'Amounts are set officially and can change, so this guide does not quote a figure. Check the current benefit on the official INSPIRE portal.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['national-scholarship-portal-guide', 'career-options-after-12th-science', 'courses-after-12th-pcb'],
    sources: [
      { label: 'INSPIRE — Department of Science and Technology (official portal)', url: 'https://online-inspire.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['inspire scholarship', 'inspire scholarship eligibility', 'dst inspire', 'inspire scholarship for science students', 'inspire she scholarship'],
  },
  {
    slug: 'fulbright-scholarship-for-indians',
    category: 'scholarships',
    region: 'india',
    titleEn: 'Fulbright-Nehru Fellowships for Indians',
    titleHi: 'भारतीयों के लिए फुलब्राइट-नेहरू फेलोशिप',
    descriptionEn:
      'What the Fulbright-Nehru programme is, who administers it for India, and where to confirm official eligibility — a neutral overview with no amounts or deadlines quoted.',
    descriptionHi:
      'फुलब्राइट-नेहरू कार्यक्रम क्या है, इसे भारत के लिए कौन संचालित करता है, और आधिकारिक पात्रता कहाँ सत्यापित करें — बिना किसी राशि या समय-सीमा के एक निष्पक्ष अवलोकन।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What the Fulbright-Nehru programme is',
        headingHi: 'फुलब्राइट-नेहरू कार्यक्रम क्या है',
        bodyEn:
          'The Fulbright-Nehru fellowships support study, research, and academic exchange between India and the United States. For India, they are administered by the United States-India Educational Foundation (USIEF). Awards are merit-based and aimed largely at postgraduate study, research, and academic professionals.',
      },
      {
        headingEn: 'Who it is broadly for',
        bodyEn:
          'Different fellowship categories target master\'s applicants, doctoral researchers, and academic or professional candidates. Each category has its own official eligibility, fields, and selection process, which are set by USIEF and updated each cycle — so check the official USIEF site for what applies to you.',
      },
      {
        headingEn: 'How to apply',
        bodyEn:
          'Applications are made through USIEF\'s official process for the relevant category and cycle. Because the programme is competitive and selective, applicants typically prepare well in advance; follow the official guidance and timeline rather than third-party summaries. Apply only through USIEF\'s official process, and be cautious of anyone promising a guaranteed fellowship for a fee.',
      },
      {
        headingEn: 'Verify on the official site',
        bodyEn:
          'This guide does not quote funding amounts, deadlines, or selection numbers, as these are set officially and change each year. Confirm the current categories, eligibility, and process on the official USIEF website.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who administers Fulbright fellowships in India?',
        answerEn:
          'The United States-India Educational Foundation (USIEF) administers the Fulbright-Nehru fellowships for India. Confirm the current categories and eligibility on the official USIEF site.',
      },
      {
        questionEn: 'Is Fulbright mainly for postgraduate study?',
        answerEn:
          'The fellowships largely support postgraduate study, research, and academic or professional candidates, across several categories. Check USIEF for the category that fits you.',
      },
      {
        questionEn: 'How competitive is it?',
        answerEn:
          'It is a selective, merit-based programme. This guide does not quote selection figures — see the official USIEF site for current details and prepare well in advance.',
      },
    ],
    relatedExamSlugs: ['gre', 'toefl'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['scholarships-for-indian-students-abroad', 'how-to-study-in-usa-from-india', 'daad-scholarship-for-indians'],
    sources: [
      { label: 'USIEF — Fulbright-Nehru fellowships (official, India)', url: 'https://www.usief.org.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['fulbright scholarship for indians', 'fulbright nehru fellowship', 'usief fulbright', 'fulbright india eligibility', 'fulbright scholarship usa'],
  },
  {
    slug: 'daad-scholarship-for-indians',
    category: 'scholarships',
    region: 'india',
    titleEn: 'DAAD Scholarships for Indian Students',
    titleHi: 'भारतीय छात्रों के लिए डीएएडी छात्रवृत्तियाँ',
    descriptionEn:
      'What DAAD is, the kinds of scholarships it offers for study and research in Germany, and where to confirm official eligibility — with no amounts or deadlines quoted.',
    descriptionHi:
      'डीएएडी क्या है, यह जर्मनी में अध्ययन एवं शोध के लिए किस प्रकार की छात्रवृत्तियाँ प्रदान करता है, और आधिकारिक पात्रता कहाँ सत्यापित करें — बिना किसी राशि या समय-सीमा के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What DAAD is',
        headingHi: 'डीएएडी क्या है',
        bodyEn:
          'DAAD (the German Academic Exchange Service) is an official organisation that supports international academic exchange, including scholarships for international students — among them students from India — to study and research in Germany. Its awards are academic and merit-based.',
      },
      {
        headingEn: 'The kinds of scholarships',
        bodyEn:
          'DAAD offers a range of scholarships across levels — for master\'s study, doctoral research, and shorter research stays — often through a searchable official scholarship database. The categories, fields, and funding differ, and are set officially, so use the DAAD database to find what matches your level and subject.',
      },
      {
        headingEn: 'How to apply',
        bodyEn:
          'Applicants typically search the official DAAD scholarship database, check the eligibility for a specific programme, and apply through the official process and timeline. DAAD also has an India office whose official pages provide India-specific guidance. Apply only through DAAD\'s official channels, and be wary of anyone charging a fee to "guarantee" a scholarship.',
      },
      {
        headingEn: 'Verify on the official site',
        bodyEn:
          'This guide does not quote funding amounts, deadlines, or eligibility cut-offs, since they are set officially and change. Confirm the current programmes and rules on the official DAAD website and its scholarship database.',
      },
    ],
    faqs: [
      {
        questionEn: 'What does DAAD stand for?',
        answerEn:
          'DAAD is the German Academic Exchange Service, an official organisation supporting international academic exchange, including scholarships to study and research in Germany.',
      },
      {
        questionEn: 'Does DAAD fund only postgraduate study?',
        answerEn:
          'DAAD offers scholarships across several levels, including master\'s, doctoral, and research stays. Use the official DAAD database to find programmes for your level and field.',
      },
      {
        questionEn: 'How do I find a DAAD scholarship that fits me?',
        answerEn:
          'Search the official DAAD scholarship database and read each programme\'s official eligibility, since categories and funding differ and change over time.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: ['tu-munich', 'heidelberg-university'],
    relatedGuideSlugs: ['study-in-germany-from-india', 'scholarships-for-indian-students-abroad', 'fulbright-scholarship-for-indians'],
    sources: [
      { label: 'DAAD — German Academic Exchange Service (official)', url: 'https://www.daad.de' },
      { label: 'DAAD India — official regional site', url: 'https://www.daad.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['daad scholarship for indians', 'daad germany scholarship', 'daad scholarship eligibility', 'study in germany scholarship', 'daad scholarship database'],
  },
  // ───────────────────────────── Set 12 — Management (deeper) ────────────────
  {
    slug: 'top-iims-in-india-list',
    category: 'admissions',
    region: 'india',
    titleEn: 'IIMs in India: An Overview',
    titleHi: 'भारत के आईआईएम: एक परिचय',
    descriptionEn:
      'What the Indian Institutes of Management are, how admission works through CAT, and how to find the current official list — without rankings or "best IIM" claims.',
    descriptionHi:
      'भारतीय प्रबंधन संस्थान क्या हैं, कैट के माध्यम से प्रवेश कैसे होता है, और वर्तमान आधिकारिक सूची कैसे प्राप्त करें — बिना रैंकिंग या "सर्वश्रेष्ठ आईआईएम" के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the IIMs are',
        headingHi: 'आईआईएम क्या हैं',
        bodyEn:
          'The Indian Institutes of Management (IIMs) are a group of public business schools set up by the Government of India, offering postgraduate management programmes such as the two-year flagship MBA/PGP, along with doctoral and executive programmes. The earliest IIMs were established in the 1960s, and the network has expanded across the country since.',
      },
      {
        headingEn: 'Some of the IIMs',
        bodyEn:
          'Widely known IIMs include those listed below, among others. Because newer IIMs have been added over the years, the most reliable way to see the complete, current set — with their programmes and seats — is the official CAT site, which lists the participating institutes.',
        bullets: [
          'IIM Ahmedabad',
          'IIM Bangalore',
          'IIM Calcutta',
          'IIM Lucknow',
          'IIM Kozhikode',
          'IIM Indore',
        ],
      },
      {
        headingEn: 'How admission works',
        bodyEn:
          'Admission to the flagship MBA/PGP at the IIMs is based mainly on the Common Admission Test (CAT) score, followed by stages such as written ability tests, group discussions, and personal interviews that each institute conducts. The exact weightings and shortlisting criteria are set by each IIM and published officially each year.',
      },
      {
        headingEn: 'Choosing without rankings',
        bodyEn:
          'Rather than relying on unofficial "best IIM" lists, compare institutes on factors you can verify officially — programmes offered, location, fees, and selection criteria published on each IIM\'s own site. The right fit depends on your goals, not a single ranking.',
      },
    ],
    faqs: [
      {
        questionEn: 'How many IIMs are there?',
        answerEn:
          'The number has grown over the years as new IIMs were established. For the current, complete list, refer to the official CAT site, which lists the participating institutes.',
      },
      {
        questionEn: 'How do I get into an IIM?',
        answerEn:
          'Admission to the flagship MBA/PGP is based mainly on the CAT score, followed by each institute\'s own selection stages such as written ability tests, group discussions, and interviews.',
      },
      {
        questionEn: 'Which is the best IIM?',
        answerEn:
          'There is no single "best" IIM — it depends on your goals and the programme. Compare institutes on official, verifiable factors rather than unofficial rankings.',
      },
    ],
    relatedExamSlugs: ['cat'],
    relatedCollegeSlugs: ['iim-ahmedabad', 'iim-bangalore'],
    relatedGuideSlugs: ['mba-specializations-explained', 'iim-vs-isb-which-is-better', 'cat-exam-eligibility-and-pattern'],
    sources: [
      { label: 'IIM CAT — official site (participating institutes)', url: 'https://iimcat.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['iims in india', 'list of iims', 'top iims in india', 'iim colleges', 'iim mba admission'],
  },
  {
    slug: 'mba-specializations-explained',
    category: 'career',
    region: 'india',
    titleEn: 'MBA Specializations Explained',
    titleHi: 'एमबीए विशेषज्ञताएँ समझाई गईं',
    descriptionEn:
      'A neutral overview of common MBA specializations — finance, marketing, operations, HR, and more — to help you understand what each focuses on, with no rankings or salary claims.',
    descriptionHi:
      'सामान्य एमबीए विशेषज्ञताओं का निष्पक्ष अवलोकन — वित्त, विपणन, संचालन, मानव संसाधन और अधिक — यह समझने में मदद के लिए कि प्रत्येक किस पर केंद्रित है, बिना रैंकिंग या वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What a specialization means',
        headingHi: 'विशेषज्ञता का अर्थ क्या है',
        bodyEn:
          'Most MBA programmes begin with a common foundation and then let students focus on a specialization (sometimes called a major or concentration) in their second year. A specialization shapes your electives and often your projects, but the core management training stays broad. There is no universally "best" specialization — it depends on your interests and goals.',
      },
      {
        headingEn: 'Common specializations',
        bodyEn:
          'Business schools offer a range of specializations, and the exact list varies by institute. Some of the most common ones are described below; check each programme\'s official curriculum for what it actually offers.',
        bullets: [
          'Finance — financial management, investment, and analysis',
          'Marketing — brand, sales, and consumer behaviour',
          'Operations and supply chain — processes and logistics',
          'Human resources — people, talent, and organisation',
          'Information systems and business analytics — data and technology',
          'Strategy and general management',
        ],
      },
      {
        headingEn: 'How to choose a specialization',
        bodyEn:
          'Pick a specialization based on the kind of work you find engaging and your longer-term goals, not on claims about which one pays most. Many roles draw on more than one area, and some students keep their choice broad. Talking to people working in a field is a useful way to understand what the day-to-day is really like.',
      },
      {
        headingEn: 'Specialization is one factor among many',
        bodyEn:
          'Your specialization matters, but so do the programme, your internships, and the skills you build. Treat it as one part of your overall plan rather than a single decision that fixes your career.',
      },
    ],
    faqs: [
      {
        questionEn: 'Which MBA specialization is best?',
        answerEn:
          'There is no universally "best" specialization — it depends on your interests and goals. Choose based on the work you find engaging, not on claims about pay.',
      },
      {
        questionEn: 'Can I work outside my specialization?',
        answerEn:
          'Often yes. Many roles draw on more than one area, and the core MBA training is broad. A specialization shapes your focus rather than locking you into one path.',
      },
      {
        questionEn: 'Do all MBAs require choosing a specialization?',
        answerEn:
          'It varies by programme — some require a major, others allow a general management track. Check each institute\'s official curriculum.',
      },
    ],
    relatedExamSlugs: ['cat'],
    relatedCollegeSlugs: ['iim-ahmedabad'],
    relatedGuideSlugs: ['top-iims-in-india-list', 'executive-mba-vs-regular-mba', 'mba-after-engineering-worth-it'],
    sources: [
      { label: 'IIM CAT — official site', url: 'https://iimcat.ac.in' },
      { label: 'IIM Ahmedabad — official site (programmes)', url: 'https://www.iima.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['mba specializations', 'mba specializations explained', 'types of mba', 'mba majors', 'which mba specialization to choose'],
  },
  {
    slug: 'executive-mba-vs-regular-mba',
    category: 'comparison',
    region: 'india',
    titleEn: 'Executive MBA vs Regular MBA',
    titleHi: 'एग्जीक्यूटिव एमबीए बनाम नियमित एमबीए',
    descriptionEn:
      'A neutral comparison of the Executive MBA and the regular full-time MBA — who each is designed for, how they differ, and how to decide which suits your stage.',
    descriptionHi:
      'एग्जीक्यूटिव एमबीए और नियमित पूर्णकालिक एमबीए की निष्पक्ष तुलना — प्रत्येक किसके लिए बनाया गया है, ये कैसे भिन्न हैं, और आपके चरण के लिए कौन-सा उपयुक्त है, यह कैसे तय करें।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Two formats for different stages',
        headingHi: 'विभिन्न चरणों के लिए दो प्रारूप',
        bodyEn:
          'A regular MBA is usually a full-time programme aimed at students relatively early in their careers, while an Executive MBA (EMBA) is designed for working professionals with more experience, often studied part-time or in modules so they can keep working. Neither is universally better — they target different stages and goals.',
      },
      {
        headingEn: 'How they differ',
        bodyEn:
          'The two formats typically differ in their entry expectations, schedule, and the profile of the cohort. Exact eligibility (including the work experience expected) and the format vary by institute, so check each programme\'s official details.',
        bullets: [
          'Regular MBA — usually full-time, earlier-career students',
          'Executive MBA — for experienced professionals, often part-time/modular',
          'Eligibility, work-experience norms, and schedule vary by institute',
        ],
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'The decision usually comes down to your experience and whether you want to study full-time or alongside a job. If you are early in your career and can study full-time, a regular MBA may fit; if you are an experienced professional who wants to keep working, an EMBA may suit better. Confirm the eligibility and format on the official source.',
      },
      {
        headingEn: 'Look beyond the label',
        bodyEn:
          'Rather than asking which is "better", compare the specific programmes you are considering on their curriculum, format, eligibility, and fees as published officially. The right choice depends on where you are in your career and what you want next.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is an Executive MBA better than a regular MBA?',
        answerEn:
          'Neither is universally better. They are designed for different stages — a regular MBA for earlier-career students and an EMBA for experienced professionals. Choose based on your experience and goals.',
      },
      {
        questionEn: 'Do I need work experience for an Executive MBA?',
        answerEn:
          'EMBA programmes generally expect professional experience, but the exact requirement varies by institute. Check the official eligibility for each programme.',
      },
      {
        questionEn: 'Can I do an MBA while working?',
        answerEn:
          'Executive and part-time MBA formats are designed for this. Confirm the schedule and eligibility on the official programme page.',
      },
    ],
    relatedExamSlugs: ['cat', 'gmat'],
    relatedCollegeSlugs: ['iim-ahmedabad'],
    relatedGuideSlugs: ['mba-specializations-explained', 'iim-vs-isb-which-is-better', 'gmat-guide-for-indian-students'],
    sources: [
      { label: 'IIM CAT — official site', url: 'https://iimcat.ac.in' },
      { label: 'IIM Ahmedabad — official site (programmes)', url: 'https://www.iima.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['executive mba vs regular mba', 'emba vs mba', 'difference between executive mba and mba', 'is executive mba worth it', 'part time mba vs full time'],
  },
  {
    slug: 'cat-percentile-vs-marks-explained',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'CAT Percentile vs Marks, Explained',
    titleHi: 'कैट पर्सेंटाइल बनाम अंक, समझाया गया',
    descriptionEn:
      'A clear explanation of how CAT percentiles relate to marks — what a percentile means, why scores are normalized, and how IIMs use cut-offs, with no fabricated numbers.',
    descriptionHi:
      'कैट पर्सेंटाइल और अंकों के बीच संबंध की स्पष्ट व्याख्या — पर्सेंटाइल का अर्थ क्या है, स्कोर को सामान्यीकृत क्यों किया जाता है, और आईआईएम कट-ऑफ का उपयोग कैसे करते हैं, बिना किसी मनगढ़ंत संख्या के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Marks and percentile are not the same',
        headingHi: 'अंक और पर्सेंटाइल एक समान नहीं हैं',
        bodyEn:
          'Your marks are the score you earn on the test, while your percentile shows how you performed relative to everyone else who took it. A percentile of, say, 90 broadly means you scored higher than about 90% of test-takers. Because admissions use percentile, your standing depends not just on your marks but on how others did.',
      },
      {
        headingEn: 'Why CAT scores are normalized',
        bodyEn:
          'CAT is conducted in more than one session, and different sessions can have slightly different difficulty. To be fair, the conducting IIM applies a normalization process before converting scores to percentiles, so that candidates are compared on a level basis across sessions. The exact method is defined officially.',
      },
      {
        headingEn: 'How IIMs use percentiles',
        bodyEn:
          'IIMs and other business schools set their own percentile cut-offs for shortlisting, which can differ by institute, programme, and category, and can change year to year. A percentile alone does not guarantee admission, since later stages such as written ability tests and interviews also count.',
      },
      {
        headingEn: 'What this means for you',
        bodyEn:
          'Focus on accuracy and overall performance rather than a fixed "target marks" figure, because the marks needed for a given percentile shift each year with difficulty and the candidate pool. For current cut-offs and the official normalization method, always refer to the official CAT source and each institute\'s announcements.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is the difference between marks and percentile in CAT?',
        answerEn:
          'Marks are your raw score; percentile shows your standing relative to other test-takers. A 90 percentile broadly means you scored higher than about 90% of candidates.',
      },
      {
        questionEn: 'Why does CAT use normalization?',
        answerEn:
          'Because the test runs in multiple sessions of slightly different difficulty, normalization adjusts scores so candidates are compared fairly before percentiles are calculated. The official method is defined by the conducting IIM.',
      },
      {
        questionEn: 'How many marks do I need for a 99 percentile?',
        answerEn:
          'There is no fixed answer — the marks for any percentile change each year with difficulty and the candidate pool. This guide does not quote a figure; check official sources for past trends.',
      },
    ],
    relatedExamSlugs: ['cat'],
    relatedCollegeSlugs: ['iim-ahmedabad', 'iim-bangalore'],
    relatedGuideSlugs: ['cat-exam-eligibility-and-pattern', 'how-to-prepare-for-cat', 'gd-pi-preparation-guide'],
    sources: [
      { label: 'IIM CAT — official site', url: 'https://iimcat.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['cat percentile vs marks', 'cat percentile explained', 'cat normalization', 'how is cat percentile calculated', 'cat marks vs percentile'],
  },
  {
    slug: 'gd-pi-preparation-guide',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'GD-PI Preparation Guide',
    titleHi: 'जीडी-पीआई तैयारी मार्गदर्शिका',
    descriptionEn:
      'How to prepare for the group discussion, written ability test, and personal interview stages that follow exams like CAT — what they assess and how to approach them, with no guarantees.',
    descriptionHi:
      'कैट जैसी परीक्षाओं के बाद आने वाले समूह चर्चा, लिखित योग्यता परीक्षण और व्यक्तिगत साक्षात्कार चरणों की तैयारी कैसे करें — ये क्या परखते हैं और इन्हें कैसे करें, बिना किसी गारंटी के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the GD-PI stage is',
        headingHi: 'जीडी-पीआई चरण क्या है',
        bodyEn:
          'After shortlisting on a test score such as CAT, many business schools assess candidates through some combination of a group discussion (GD), a written ability test (WAT), and a personal interview (PI). These stages look at communication, reasoning, awareness, and fit — qualities a written test alone cannot fully capture.',
      },
      {
        headingEn: 'What each stage assesses',
        bodyEn:
          'A group discussion looks at how you reason and engage with others on a topic; a written ability test checks how clearly you can argue in writing; and the interview explores your background, motivation, and awareness. The exact format varies by institute and is announced officially.',
        bullets: [
          'GD — clarity, reasoning, and listening, not just speaking the most',
          'WAT — structured, clear written argument',
          'PI — your story, motivation, and awareness',
        ],
      },
      {
        headingEn: 'How to prepare',
        bodyEn:
          'Read widely so you can discuss current topics with perspective, practise speaking and writing concisely, and prepare to talk honestly about your background and goals. Mock GDs and interviews with feedback help you improve, but rehearsed, inauthentic answers tend to show.',
      },
      {
        headingEn: 'Approach it honestly',
        bodyEn:
          'Be genuine rather than trying to give "model" answers — interviewers generally value clarity and authenticity over memorised lines. No preparation can guarantee selection, but clear thinking and honest communication present you at your best.',
      },
    ],
    faqs: [
      {
        questionEn: 'What does GD-PI stand for?',
        answerEn:
          'Group Discussion and Personal Interview — often alongside a Written Ability Test (WAT). These stages follow the shortlisting based on a test score such as CAT.',
      },
      {
        questionEn: 'How important is speaking the most in a group discussion?',
        answerEn:
          'Speaking the most is not the goal. Group discussions assess clarity, reasoning, and listening, so a few well-made points can count for more than constant talking.',
      },
      {
        questionEn: 'Can coaching guarantee I clear the interview?',
        answerEn:
          'No. Preparation helps, but no coaching can guarantee selection. Authentic, clear communication tends to matter more than rehearsed answers.',
      },
    ],
    relatedExamSlugs: ['cat'],
    relatedCollegeSlugs: ['iim-bangalore'],
    relatedGuideSlugs: ['cat-percentile-vs-marks-explained', 'how-to-prepare-for-cat', 'top-iims-in-india-list'],
    sources: [
      { label: 'IIM CAT — official site (selection process)', url: 'https://iimcat.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['gd pi preparation', 'group discussion tips', 'wat pi preparation', 'mba interview preparation', 'cat gd pi'],
  },
  // ─────────────────────────── Set 13 — Medical alternatives ─────────────────
  {
    slug: 'career-options-after-neet-besides-mbbs',
    category: 'career',
    region: 'india',
    titleEn: 'Career Options After NEET Besides MBBS',
    titleHi: 'एमबीबीएस के अलावा नीट के बाद करियर विकल्प',
    descriptionEn:
      'NEET opens far more than MBBS — dental, AYUSH, veterinary, nursing, and allied courses. A neutral overview of the options, with no health claims or salary promises.',
    descriptionHi:
      'नीट एमबीबीएस से कहीं अधिक खोलता है — दंत, आयुष, पशु चिकित्सा, नर्सिंग और संबद्ध कोर्स। विकल्पों का निष्पक्ष अवलोकन, बिना किसी स्वास्थ्य दावे या वेतन के वादे के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'NEET is a gateway to many courses',
        headingHi: 'नीट कई कोर्स का प्रवेश-द्वार है',
        bodyEn:
          'A NEET score is used for admission to several health-science courses, not only MBBS. Depending on your rank and choices, it can lead to dental, AYUSH, veterinary, and some nursing programmes. Knowing the full range helps you plan beyond a single option.',
      },
      {
        headingEn: 'Courses commonly linked to NEET',
        bodyEn:
          'The courses below are commonly admitted through NEET, though the exact use of NEET, eligibility, and counselling vary by course, state, and year. Always confirm the current rules on the official sources.',
        bullets: [
          'BDS — dental surgery',
          'AYUSH degrees such as BAMS, BHMS, BUMS, and BSMS',
          'BVSc — veterinary science (NEET is used in many cases)',
          'Certain nursing programmes (varies by institution)',
        ],
      },
      {
        headingEn: 'Options that may not need NEET',
        bodyEn:
          'Several health and life-science paths have their own admission routes rather than NEET, including pharmacy, many BSc nursing and allied-health programmes, biotechnology, and basic-science degrees. These are covered in the related guides.',
      },
      {
        headingEn: 'Choose on interest, not just MBBS',
        bodyEn:
          'MBBS is one option among many, and it is also the most competitive. Looking at the wider set of courses lets you match a path to your interests and rank rather than assuming only MBBS is worthwhile. This guide does not make medical claims or quote earnings — confirm course details officially.',
      },
    ],
    faqs: [
      {
        questionEn: 'What can I do with a NEET score besides MBBS?',
        answerEn:
          'Depending on your rank, NEET can lead to BDS, AYUSH courses (such as BAMS, BHMS), veterinary science in many cases, and some nursing programmes. Confirm how NEET applies to each on the official sources.',
      },
      {
        questionEn: 'Is MBBS the only worthwhile medical course?',
        answerEn:
          'No. Dental, AYUSH, veterinary, nursing, pharmacy, and allied-health courses are all established paths. The right choice depends on your interests and rank, not on a single option.',
      },
      {
        questionEn: 'Do all these courses require NEET?',
        answerEn:
          'Not all — the use of NEET varies by course, state, and year. Some programmes have their own admission routes. Check the official rules for each.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: ['aiims-delhi'],
    relatedGuideSlugs: ['bds-dental-course-guide', 'bams-ayurveda-course-guide', 'how-to-become-a-doctor-in-india'],
    sources: [
      { label: 'NTA — NEET UG official site', url: 'https://neet.nta.nic.in' },
      { label: 'National Medical Commission (NMC) — official site', url: 'https://www.nmc.org.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['career options after neet besides mbbs', 'courses through neet', 'neet courses other than mbbs', 'what to do after neet', 'neet career options'],
  },
  {
    slug: 'bds-dental-course-guide',
    category: 'career',
    region: 'india',
    titleEn: 'BDS (Dental) Course Guide',
    titleHi: 'बीडीएस (दंत) कोर्स मार्गदर्शिका',
    descriptionEn:
      'What the BDS dental course is, how admission works through NEET, and what graduates broadly do — a factual overview with no health claims or income promises.',
    descriptionHi:
      'बीडीएस दंत कोर्स क्या है, नीट के माध्यम से प्रवेश कैसे होता है, और स्नातक मोटे तौर पर क्या करते हैं — एक तथ्यात्मक अवलोकन, बिना किसी स्वास्थ्य दावे या आय के वादे के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What BDS is',
        headingHi: 'बीडीएस क्या है',
        bodyEn:
          'BDS (Bachelor of Dental Surgery) is the recognised undergraduate degree in dentistry in India. It combines academic study with clinical training and includes a compulsory internship before a graduate can register to practise. The exact course duration and structure are set officially and overseen by the national dental regulator.',
      },
      {
        headingEn: 'How admission works',
        bodyEn:
          'Admission to BDS is through NEET UG, the same national entrance test used for MBBS, followed by the relevant counselling process. The eligibility, seats, and counselling are set officially each year, so confirm the current rules on the official sources before applying.',
      },
      {
        headingEn: 'After BDS',
        bodyEn:
          'After registering with the appropriate authority, BDS graduates can practise dentistry, and many go on to a postgraduate degree (MDS) to specialise, or into roles in public health, teaching, or research. This guide describes paths in general terms and makes no clinical or earnings claims.',
      },
      {
        headingEn: 'Plan with official information',
        bodyEn:
          'Because eligibility, seats, and registration rules can change, base your plan on the official NEET and regulator sources rather than third-party summaries, and verify the current requirements before each step.',
      },
    ],
    faqs: [
      {
        questionEn: 'How do I get admission to BDS?',
        answerEn:
          'Admission to BDS is through NEET UG, followed by the relevant counselling process. Confirm the current eligibility and counselling on the official sources.',
      },
      {
        questionEn: 'Is BDS admission separate from MBBS?',
        answerEn:
          'Both use the same NEET UG score; you choose courses and colleges during counselling based on your rank. The exact process is set officially each year.',
      },
      {
        questionEn: 'What can I do after BDS?',
        answerEn:
          'After registering to practise, options include working as a dentist, pursuing an MDS to specialise, or roles in public health, teaching, and research. Verify registration requirements officially.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-neet-besides-mbbs', 'how-to-become-a-doctor-in-india', 'neet-ug-eligibility-criteria'],
    sources: [
      { label: 'NTA — NEET UG official site', url: 'https://neet.nta.nic.in' },
      { label: 'National Dental Commission (dental regulator) — official site', url: 'https://dciindia.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['bds course', 'bds dental course', 'bds admission neet', 'bachelor of dental surgery', 'bds eligibility'],
  },
  {
    slug: 'bams-ayurveda-course-guide',
    category: 'career',
    region: 'india',
    titleEn: 'BAMS (Ayurveda) Course Guide',
    titleHi: 'बीएएमएस (आयुर्वेद) कोर्स मार्गदर्शिका',
    descriptionEn:
      'What the BAMS course is as a recognised medical degree, how admission works through NEET, and what graduates broadly do — a factual, secular overview with no health claims.',
    descriptionHi:
      'बीएएमएस कोर्स एक मान्यता प्राप्त चिकित्सा डिग्री के रूप में क्या है, नीट के माध्यम से प्रवेश कैसे होता है, और स्नातक मोटे तौर पर क्या करते हैं — एक तथ्यात्मक, धर्मनिरपेक्ष अवलोकन, बिना किसी स्वास्थ्य दावे के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What BAMS is',
        headingHi: 'बीएएमएस क्या है',
        bodyEn:
          'BAMS (Bachelor of Ayurvedic Medicine and Surgery) is a recognised undergraduate medical degree in Ayurveda, one of the officially recognised Indian systems of medicine. It combines academic study with clinical training and includes a compulsory internship. The course is overseen by the national regulator for Indian systems of medicine.',
      },
      {
        headingEn: 'How admission works',
        bodyEn:
          'Admission to BAMS is through NEET UG, the same national entrance test used for other medical courses, followed by the relevant counselling. Eligibility, seats, and counselling are set officially each year, so confirm the current rules on the official sources before applying.',
      },
      {
        headingEn: 'After BAMS',
        bodyEn:
          'After completing the degree and registering with the appropriate authority, graduates can practise as registered Ayurveda practitioners, pursue postgraduate study (MD/MS in the field), or move into teaching, research, or public health roles. This guide describes courses and careers only and makes no claims about treatments or outcomes.',
      },
      {
        headingEn: 'Plan with official information',
        bodyEn:
          'Because eligibility and registration rules can change, rely on the official NEET and regulator sources rather than third-party summaries, and verify the current requirements before each step.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is BAMS a recognised medical degree?',
        answerEn:
          'Yes. BAMS is a recognised undergraduate degree in Ayurveda, one of the officially recognised Indian systems of medicine, overseen by the national regulator for those systems.',
      },
      {
        questionEn: 'How do I get admission to BAMS?',
        answerEn:
          'Admission is through NEET UG, followed by the relevant counselling. Confirm the current eligibility and process on the official sources.',
      },
      {
        questionEn: 'What can I do after BAMS?',
        answerEn:
          'After registering to practise, graduates can work as registered Ayurveda practitioners, pursue postgraduate study, or move into teaching, research, or public health. Verify registration requirements officially.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-neet-besides-mbbs', 'bds-dental-course-guide', 'neet-ug-eligibility-criteria'],
    sources: [
      { label: 'NTA — NEET UG official site', url: 'https://neet.nta.nic.in' },
      { label: 'NCISM (regulator for Indian systems of medicine) — official site', url: 'https://ncismindia.org' },
    ],
    lastVerified: VERIFY,
    keywords: ['bams course', 'bams ayurveda course', 'bams admission neet', 'bachelor of ayurvedic medicine', 'bams eligibility'],
  },
  {
    slug: 'nursing-courses-in-india',
    category: 'career',
    region: 'india',
    titleEn: 'Nursing Courses in India: A Guide',
    titleHi: 'भारत में नर्सिंग कोर्स: एक मार्गदर्शिका',
    descriptionEn:
      'The main nursing courses in India, how admission generally works, and what the field involves — a factual overview with no health claims or salary promises.',
    descriptionHi:
      'भारत में मुख्य नर्सिंग कोर्स, प्रवेश आमतौर पर कैसे होता है, और इस क्षेत्र में क्या शामिल है — एक तथ्यात्मक अवलोकन, बिना किसी स्वास्थ्य दावे या वेतन के वादे के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'The main nursing courses',
        headingHi: 'मुख्य नर्सिंग कोर्स',
        bodyEn:
          'Nursing education in India is offered at several levels, regulated by the Indian Nursing Council and state councils. The common qualifications are listed below; the exact eligibility and structure are set officially and can change.',
        bullets: [
          'ANM — Auxiliary Nurse Midwifery (diploma)',
          'GNM — General Nursing and Midwifery (diploma)',
          'B.Sc Nursing (degree) and Post Basic B.Sc Nursing',
          'Higher study: M.Sc Nursing and beyond',
        ],
      },
      {
        headingEn: 'How admission works',
        bodyEn:
          'Admission routes vary by programme, institution, and state — some B.Sc Nursing admissions use NEET or a state/university entrance test, while diploma courses may use other criteria. Always confirm the current admission route for the specific programme and state on the official sources.',
      },
      {
        headingEn: 'What the field involves',
        bodyEn:
          'Nursing is a regulated profession centred on patient care in hospitals, clinics, community health, and specialised settings, with options to specialise or move into education, administration, and research over time. This guide describes courses and roles only and makes no clinical or earnings claims.',
      },
      {
        headingEn: 'Plan with official information',
        bodyEn:
          'Because admission and registration rules differ across states and change over time, verify the current requirements with the relevant nursing council and institution before applying.',
      },
    ],
    faqs: [
      {
        questionEn: 'What are the main nursing courses in India?',
        answerEn:
          'Common qualifications include ANM and GNM diplomas, B.Sc Nursing and Post Basic B.Sc Nursing degrees, and M.Sc Nursing for higher study. Confirm eligibility on the official sources.',
      },
      {
        questionEn: 'Do nursing courses require NEET?',
        answerEn:
          'It varies — some B.Sc Nursing admissions use NEET or a state/university test, while diploma courses may use other criteria. Check the route for the specific programme and state.',
      },
      {
        questionEn: 'Who regulates nursing education in India?',
        answerEn:
          'The Indian Nursing Council, along with state nursing councils, regulates nursing education and registration. Verify the current rules with the relevant council.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-neet-besides-mbbs', 'allied-health-sciences-careers', 'courses-after-12th-pcb'],
    sources: [
      { label: 'NTA — NEET UG official site', url: 'https://neet.nta.nic.in' },
      { label: 'Ministry of Health and Family Welfare — official site', url: 'https://www.mohfw.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['nursing courses in india', 'bsc nursing', 'gnm anm nursing', 'nursing course admission', 'nursing courses after 12th'],
  },
  {
    slug: 'allied-health-sciences-careers',
    category: 'career',
    region: 'india',
    titleEn: 'Allied Health Sciences: Careers Overview',
    titleHi: 'संबद्ध स्वास्थ्य विज्ञान: करियर अवलोकन',
    descriptionEn:
      'What allied and healthcare science courses are, the range of roles they lead to, and how the field is regulated — a factual overview with no health claims or salary promises.',
    descriptionHi:
      'संबद्ध एवं स्वास्थ्य विज्ञान कोर्स क्या हैं, ये किन भूमिकाओं की ओर ले जाते हैं, और यह क्षेत्र कैसे विनियमित है — एक तथ्यात्मक अवलोकन, बिना किसी स्वास्थ्य दावे या वेतन के वादे के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What allied health sciences are',
        headingHi: 'संबद्ध स्वास्थ्य विज्ञान क्या हैं',
        bodyEn:
          'Allied and healthcare sciences cover a broad group of professions that support diagnosis, treatment, and care alongside doctors and nurses. In India, this field is increasingly organised under a national framework for allied and healthcare professions, which defines recognised courses and standards.',
      },
      {
        headingEn: 'Common courses and roles',
        bodyEn:
          'There are many allied-health courses across diagnostics, therapy, and technology. The examples below are among the more common ones; the exact courses, eligibility, and recognition vary by institution and state.',
        bullets: [
          'Medical laboratory technology',
          'Radiology and medical imaging technology',
          'Physiotherapy and occupational therapy',
          'Optometry and operation-theatre technology',
        ],
      },
      {
        headingEn: 'How admission and recognition work',
        bodyEn:
          'Admission routes vary by course and institution rather than following a single national test, and recognition is moving towards the national allied-healthcare framework. Confirm that a course is recognised and check its admission route on the official sources before enrolling.',
      },
      {
        headingEn: 'A growing, varied field',
        bodyEn:
          'Allied health offers a wide range of roles for students interested in healthcare beyond becoming a doctor or nurse. This guide describes courses and roles only and makes no clinical or earnings claims; verify recognition and prospects officially.',
      },
    ],
    faqs: [
      {
        questionEn: 'What are allied health science courses?',
        answerEn:
          'They are healthcare courses that support diagnosis, treatment, and care — such as medical lab technology, radiology/imaging, physiotherapy, and optometry — alongside doctors and nurses.',
      },
      {
        questionEn: 'Do allied-health courses need NEET?',
        answerEn:
          'Generally no single national test applies; admission routes vary by course and institution. Check the specific programme\'s official admission route and recognition.',
      },
      {
        questionEn: 'How do I know a course is recognised?',
        answerEn:
          'Recognition is moving towards the national allied and healthcare professions framework. Confirm a course\'s recognition on the official sources before enrolling.',
      },
    ],
    relatedExamSlugs: ['neet-ug'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['nursing-courses-in-india', 'career-options-after-neet-besides-mbbs', 'courses-after-12th-pcb'],
    sources: [
      { label: 'Ministry of Health and Family Welfare — official site', url: 'https://www.mohfw.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['allied health sciences', 'allied health courses', 'paramedical courses india', 'allied healthcare careers', 'health science courses'],
  },
  // ───────────────────────────── Set 14 — Commerce & finance ─────────────────
  {
    slug: 'ca-chartered-accountancy-guide',
    category: 'career',
    region: 'india',
    titleEn: 'Chartered Accountancy (CA): A Guide',
    titleHi: 'चार्टर्ड अकाउंटेंसी (सीए): एक मार्गदर्शिका',
    descriptionEn:
      'What Chartered Accountancy is, how the ICAI course is structured, and what CAs broadly do — a factual overview with no fabricated fees, pass rates, or salary claims.',
    descriptionHi:
      'चार्टर्ड अकाउंटेंसी क्या है, आईसीएआई कोर्स कैसे संरचित है, और सीए मोटे तौर पर क्या करते हैं — एक तथ्यात्मक अवलोकन, बिना किसी मनगढ़ंत शुल्क, उत्तीर्ण दर या वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What Chartered Accountancy is',
        headingHi: 'चार्टर्ड अकाउंटेंसी क्या है',
        bodyEn:
          'Chartered Accountancy (CA) is a professional qualification in accounting, auditing, taxation, and finance, awarded by the Institute of Chartered Accountants of India (ICAI), a statutory body. It is known for being rigorous and is pursued by many commerce students, though students from other streams can also take it.',
      },
      {
        headingEn: 'How the course is structured',
        bodyEn:
          'The CA qualification is organised in stages — a foundation level, an intermediate level, and a final level — combined with a period of practical training (articleship) under a practising CA. You can typically begin after Class 12 or after graduation through different entry routes. The exact stages, eligibility, fees, and durations are set by ICAI and revised over time, so confirm the current scheme officially.',
        bullets: [
          'Foundation, Intermediate, and Final levels',
          'Practical training (articleship) with a practising CA',
          'Entry after Class 12 or after graduation (routes differ)',
        ],
      },
      {
        headingEn: 'What CAs do',
        bodyEn:
          'Qualified CAs work in audit and assurance, taxation, financial reporting, advisory, and finance roles, in practice (their own or a firm) or in industry. Many also move into leadership and entrepreneurship over time.',
      },
      {
        headingEn: 'Plan with official information',
        bodyEn:
          'Because the scheme, fees, and pass criteria change, base your plan on the official ICAI website rather than third-party summaries. This guide does not quote pass rates or earnings — both vary widely and are not promised by any course.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can I start CA after Class 12?',
        answerEn:
          'Yes, there is an entry route after Class 12, and another after graduation. The exact eligibility and stages are set by ICAI — confirm the current scheme on the official site.',
      },
      {
        questionEn: 'Is CA only for commerce students?',
        answerEn:
          'No. Commerce students commonly take it, but students from other streams can pursue CA too. Check the eligibility on the official ICAI site.',
      },
      {
        questionEn: 'How hard is CA and what do CAs earn?',
        answerEn:
          'CA is widely regarded as demanding, but pass rates and earnings vary widely and are not something this guide quotes or guarantees. Focus on the official syllabus and steady preparation.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['cs-company-secretary-guide', 'bcom-vs-bba-which-to-choose', 'career-options-after-12th-commerce'],
    sources: [
      { label: 'Institute of Chartered Accountants of India (ICAI) — official site', url: 'https://www.icai.org' },
    ],
    lastVerified: VERIFY,
    keywords: ['chartered accountancy', 'ca course guide', 'how to become a ca', 'icai ca course', 'ca after 12th'],
  },
  {
    slug: 'cs-company-secretary-guide',
    category: 'career',
    region: 'india',
    titleEn: 'Company Secretary (CS): A Guide',
    titleHi: 'कंपनी सेक्रेटरी (सीएस): एक मार्गदर्शिका',
    descriptionEn:
      'What a Company Secretary does, how the ICSI course is structured, and where it leads — a factual overview with no fabricated fees or salary promises.',
    descriptionHi:
      'कंपनी सेक्रेटरी क्या करता है, आईसीएसआई कोर्स कैसे संरचित है, और यह कहाँ ले जाता है — एक तथ्यात्मक अवलोकन, बिना किसी मनगढ़ंत शुल्क या वेतन के वादे के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What a Company Secretary is',
        headingHi: 'कंपनी सेक्रेटरी क्या है',
        bodyEn:
          'A Company Secretary (CS) is a professional focused on corporate governance, company law, and regulatory compliance. The qualification is awarded by the Institute of Company Secretaries of India (ICSI), a statutory body, and is valued in companies for keeping them compliant with the law.',
      },
      {
        headingEn: 'How the course is structured',
        bodyEn:
          'The CS qualification is organised in stages — an entrance level, an executive level, and a professional level — along with practical training. Entry routes differ for students starting after Class 12 versus after graduation. The exact stages, eligibility, and fees are set by ICSI and change over time, so confirm the current scheme officially.',
        bullets: [
          'Entrance, Executive, and Professional stages',
          'Practical training as required by ICSI',
          'Entry after Class 12 or after graduation (routes differ)',
        ],
      },
      {
        headingEn: 'What Company Secretaries do',
        bodyEn:
          'Company Secretaries work in corporate governance, secretarial and legal compliance, and advisory roles, in companies or in practice. The role connects the company\'s management, board, and regulators.',
      },
      {
        headingEn: 'Plan with official information',
        bodyEn:
          'Because the scheme and fees change, rely on the official ICSI website for the current structure and eligibility. This guide does not quote earnings, which vary by role and experience and are not promised by any course.',
      },
    ],
    faqs: [
      {
        questionEn: 'What does a Company Secretary do?',
        answerEn:
          'A Company Secretary focuses on corporate governance, company law, and regulatory compliance, helping companies follow the law. The qualification is awarded by ICSI.',
      },
      {
        questionEn: 'Can I start CS after Class 12?',
        answerEn:
          'Yes, there is an entry route after Class 12 and another after graduation. The exact eligibility and stages are set by ICSI — confirm on the official site.',
      },
      {
        questionEn: 'Is CS the same as CA?',
        answerEn:
          'No. CA focuses on accounting, audit, and taxation; CS focuses on corporate governance and compliance. They are separate qualifications from different institutes.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['ca-chartered-accountancy-guide', 'career-options-after-12th-commerce', 'bcom-vs-bba-which-to-choose'],
    sources: [
      { label: 'Institute of Company Secretaries of India (ICSI) — official site', url: 'https://www.icsi.edu' },
    ],
    lastVerified: VERIFY,
    keywords: ['company secretary course', 'cs course guide', 'how to become a company secretary', 'icsi cs course', 'cs after 12th'],
  },
  {
    slug: 'bcom-vs-bba-which-to-choose',
    category: 'comparison',
    region: 'india',
    titleEn: 'B.Com vs BBA: Which to Choose?',
    titleHi: 'बीकॉम बनाम बीबीए: कौन-सा चुनें?',
    descriptionEn:
      'A neutral comparison of B.Com and BBA — what each focuses on, what they suit, and how to decide based on your goals, with no rankings or salary claims.',
    descriptionHi:
      'बीकॉम और बीबीए की निष्पक्ष तुलना — प्रत्येक किस पर केंद्रित है, ये किसके लिए उपयुक्त हैं, और अपने लक्ष्यों के आधार पर कैसे तय करें, बिना रैंकिंग या वेतन के दावों के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Two related but different degrees',
        headingHi: 'दो संबंधित किंतु भिन्न डिग्री',
        bodyEn:
          'B.Com (Bachelor of Commerce) and BBA (Bachelor of Business Administration) are both popular undergraduate degrees after Class 12. B.Com leans towards commerce, accounting, economics, and finance, while BBA leans towards management and business administration. Neither is universally better — they suit different interests.',
      },
      {
        headingEn: 'What each tends to focus on',
        bodyEn:
          'A B.Com often emphasises accounting, taxation, and finance fundamentals, and pairs naturally with professional courses like CA or CS. A BBA often emphasises management, marketing, and organisational subjects, with case studies and projects. Exact curricula vary by university, so read each programme officially.',
        bullets: [
          'B.Com — commerce, accounting, finance; pairs with CA/CS',
          'BBA — management and business administration focus',
        ],
      },
      {
        headingEn: 'Where each can lead',
        bodyEn:
          'Both can lead to further study (such as an MBA, often after a few years of work) and to a wide range of business and finance roles. Your degree choice does not lock you into a single path — the skills you build and later study matter too.',
      },
      {
        headingEn: 'How to choose',
        bodyEn:
          'Choose based on whether you prefer the commerce-and-accounting orientation of B.Com or the management orientation of BBA, and on the specific programme and university. Decide on interest and fit rather than on claims about which "earns more".',
      },
    ],
    faqs: [
      {
        questionEn: 'Is BBA better than B.Com?',
        answerEn:
          'Neither is universally better. B.Com leans towards commerce and accounting; BBA leans towards management. The better choice depends on your interests and goals.',
      },
      {
        questionEn: 'Which is better for an MBA later?',
        answerEn:
          'Both can lead to an MBA. Admission to good MBA programmes depends on entrance tests and your overall profile, not simply on whether you did B.Com or BBA.',
      },
      {
        questionEn: 'Can I do CA after B.Com or BBA?',
        answerEn:
          'Professional courses like CA are open to graduates of various streams. B.Com aligns closely with its subjects, but check the official eligibility for the route you plan to take.',
      },
    ],
    relatedExamSlugs: ['cat'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-12th-commerce', 'ca-chartered-accountancy-guide', 'how-to-become-investment-banker-india'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['bcom vs bba', 'bba or bcom', 'bcom vs bba which is better', 'difference between bcom and bba', 'should i do bcom or bba'],
  },
  {
    slug: 'how-to-become-investment-banker-india',
    category: 'career',
    region: 'india',
    titleEn: 'How to Become an Investment Banker in India',
    titleHi: 'भारत में इन्वेस्टमेंट बैंकर कैसे बनें',
    descriptionEn:
      'A realistic, neutral overview of the routes into investment banking in India — backgrounds, qualifications, and skills — with no guaranteed salaries or placements.',
    descriptionHi:
      'भारत में इन्वेस्टमेंट बैंकिंग में प्रवेश के मार्गों का यथार्थवादी, निष्पक्ष अवलोकन — पृष्ठभूमि, योग्यताएँ और कौशल — बिना किसी निश्चित वेतन या प्लेसमेंट के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'There is no single fixed path',
        headingHi: 'कोई एक निश्चित मार्ग नहीं है',
        bodyEn:
          'Investment banking is a competitive field, and people enter it from several backgrounds — commerce, economics, finance, engineering, and others. There is no single official qualification that makes someone an investment banker; instead, a mix of strong academics, relevant skills, internships, and qualifications tends to matter.',
      },
      {
        headingEn: 'Common routes and qualifications',
        bodyEn:
          'Many enter through a strong undergraduate degree followed by an MBA from a well-regarded business school, while others build credibility through qualifications such as the CFA or CA, or through finance-focused master\'s degrees. Internships in finance and a solid grasp of accounting, valuation, and markets are commonly valued.',
        bullets: [
          'Strong undergraduate degree (commerce, economics, engineering, etc.)',
          'Often an MBA, or qualifications like CFA or CA',
          'Internships and demonstrable finance skills',
        ],
      },
      {
        headingEn: 'Skills that matter',
        bodyEn:
          'Beyond credentials, the field values analytical ability, financial modelling, communication, and the capacity to work hard under pressure. Building these through projects, internships, and continuous learning is usually more useful than any single certificate.',
      },
      {
        headingEn: 'Be realistic and avoid false promises',
        bodyEn:
          'Investment banking in India operates within the country\'s securities-market framework, which is overseen by the regulator, SEBI. Roles are limited and highly competitive, and no course, coaching, or guide can guarantee a job or a particular salary. Be cautious of anyone promising guaranteed placement or specific packages, and plan based on building genuine skills over time.',
      },
    ],
    faqs: [
      {
        questionEn: 'What should I study to become an investment banker?',
        answerEn:
          'There is no single required degree. Common routes include a strong undergraduate degree plus an MBA, or qualifications like CFA or CA, along with internships and finance skills. Many backgrounds can work.',
      },
      {
        questionEn: 'Do I need an MBA for investment banking?',
        answerEn:
          'An MBA from a well-regarded school is one common route, but not the only one. Some enter through qualifications like the CFA or through finance roles and internships.',
      },
      {
        questionEn: 'Can a course guarantee an investment banking job?',
        answerEn:
          'No. The field is highly competitive and no course can guarantee a job or salary. Be cautious of anyone promising guaranteed placement.',
      },
    ],
    relatedExamSlugs: ['cat', 'gmat'],
    relatedCollegeSlugs: ['iim-ahmedabad'],
    relatedGuideSlugs: ['cfa-guide-for-indians', 'mba-specializations-explained', 'career-options-after-12th-commerce'],
    sources: [
      { label: 'CFA Institute — official site', url: 'https://www.cfainstitute.org' },
      { label: 'SEBI — Securities and Exchange Board of India (official)', url: 'https://www.sebi.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to become investment banker india', 'investment banking career india', 'investment banker qualifications', 'investment banking path', 'careers in investment banking'],
  },
  {
    slug: 'cfa-guide-for-indians',
    category: 'career',
    region: 'india',
    titleEn: 'CFA Guide for Indian Students',
    titleHi: 'भारतीय छात्रों के लिए सीएफए गाइड',
    descriptionEn:
      'What the CFA programme is, how it is structured, and who it suits — for Indian students interested in investment and finance, with no fee or salary claims.',
    descriptionHi:
      'सीएफए कार्यक्रम क्या है, यह कैसे संरचित है, और यह किसके लिए उपयुक्त है — निवेश एवं वित्त में रुचि रखने वाले भारतीय छात्रों के लिए, बिना किसी शुल्क या वेतन के दावों के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What the CFA programme is',
        headingHi: 'सीएफए कार्यक्रम क्या है',
        bodyEn:
          'The CFA (Chartered Financial Analyst) programme is a globally recognised qualification in investment management and financial analysis, offered by the CFA Institute, a global professional body. It is self-study based and is often pursued by people aiming for roles in investment, research, and portfolio management.',
      },
      {
        headingEn: 'How it is structured',
        bodyEn:
          'The programme has three levels — Level I, Level II, and Level III — each with its own exam, and earning the charter also requires relevant qualified work experience and membership. The exact eligibility, fees, exam windows, and requirements are set by the CFA Institute and change over time, so confirm them on the official site.',
        bullets: [
          'Three exam levels (I, II, III)',
          'Qualified work experience required for the charter',
          'Self-study with official curriculum',
        ],
      },
      {
        headingEn: 'Who it suits',
        bodyEn:
          'The CFA tends to suit people committed to investment and finance who can study consistently over a few years alongside work or study. It is demanding, and many candidates take time to clear all levels — so it works best as a long-term commitment rather than a quick credential.',
      },
      {
        headingEn: 'Plan with official information',
        bodyEn:
          'Because eligibility, fees, and exam details change, rely on the official CFA Institute website rather than third-party summaries. This guide does not quote fees or earnings, which vary and are not guaranteed by the qualification.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is the CFA qualification?',
        answerEn:
          'The CFA (Chartered Financial Analyst) is a globally recognised qualification in investment management and financial analysis, offered by the CFA Institute. It has three exam levels and a work-experience requirement.',
      },
      {
        questionEn: 'Can I do the CFA alongside a job or studies?',
        answerEn:
          'Yes — the programme is self-study based and many candidates prepare while working or studying. It is demanding and usually takes a few years to complete all levels.',
      },
      {
        questionEn: 'Does a CFA guarantee a high-paying finance job?',
        answerEn:
          'No. The CFA can strengthen your profile in finance, but no qualification guarantees a job or salary. Outcomes depend on many factors beyond any single credential.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-become-investment-banker-india', 'ca-chartered-accountancy-guide', 'career-options-after-12th-commerce'],
    sources: [
      { label: 'CFA Institute — official site', url: 'https://www.cfainstitute.org' },
    ],
    lastVerified: VERIFY,
    keywords: ['cfa guide for indians', 'what is cfa', 'cfa course india', 'cfa levels explained', 'cfa for finance career'],
  },
  // ───────────────────────────── Set 15 — Arts & design ──────────────────────
  {
    slug: 'career-options-in-design-after-12th',
    category: 'career',
    region: 'india',
    titleEn: 'Career Options in Design After 12th',
    titleHi: '12वीं के बाद डिज़ाइन में करियर विकल्प',
    descriptionEn:
      'The main design fields open after Class 12 — fashion, communication, product, UX, and more — how admission works, and what the work involves, with no salary claims.',
    descriptionHi:
      '12वीं के बाद खुलने वाले मुख्य डिज़ाइन क्षेत्र — फैशन, संचार, उत्पाद, यूएक्स और अधिक — प्रवेश कैसे होता है, और कार्य में क्या शामिल है, बिना किसी वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Design is a broad field',
        headingHi: 'डिज़ाइन एक व्यापक क्षेत्र है',
        bodyEn:
          'Design spans many areas — fashion, graphic and communication design, product and industrial design, user-experience (UX/UI) design, interior design, and animation, among others. Design programmes are usually open to students from any stream after Class 12, since they value aptitude and creativity rather than a specific subject combination.',
        bullets: [
          'Fashion and textile design',
          'Graphic, communication, and UX/UI design',
          'Product, industrial, and interior design',
          'Animation and multimedia',
        ],
      },
      {
        headingEn: 'How admission works',
        bodyEn:
          'Most design schools admit through their own aptitude-based entrance tests rather than a single national exam. Well-known routes include the entrance processes of leading design institutes and the design aptitude tests used for programmes at various universities; some institutes also ask for a portfolio or studio test. Confirm each institute\'s official process.',
      },
      {
        headingEn: 'What design work involves',
        bodyEn:
          'Design combines creativity with problem-solving — understanding users or audiences and creating something that works for them. Building a portfolio of your work, learning relevant tools, and practising visual and design thinking matter more than any single subject mark.',
      },
      {
        headingEn: 'How to start',
        bodyEn:
          'Explore the different design fields to see which appeals to you, look at the official admission process for institutes you are interested in, and begin building a portfolio. This guide does not quote fees or earnings, which vary widely — confirm details on each institute\'s official site.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can I study design after any stream in 12th?',
        answerEn:
          'Usually yes. Most design programmes are open to students from any stream and assess aptitude and creativity through their own entrance tests, rather than requiring a specific subject combination.',
      },
      {
        questionEn: 'Do I need a portfolio for design admission?',
        answerEn:
          'Many design institutes ask for a portfolio or a studio/aptitude test as part of admission. Check each institute\'s official requirements, as they vary.',
      },
      {
        questionEn: 'Which design field is best?',
        answerEn:
          'There is no single "best" design field — it depends on your interests and strengths. Explore a few areas and choose the one that genuinely engages you.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['nift-nid-entrance-guide', 'career-options-after-12th-arts', 'courses-after-12th-pcm'],
    sources: [
      { label: 'National Institute of Fashion Technology (NIFT) — official site', url: 'https://www.nift.ac.in' },
      { label: 'National Institute of Design (NID) — official site', url: 'https://www.nid.edu' },
    ],
    lastVerified: VERIFY,
    keywords: ['design career options after 12th', 'design courses after 12th', 'how to get into design', 'careers in design india', 'design fields explained'],
  },
  {
    slug: 'nift-nid-entrance-guide',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'NIFT and NID Entrance: A Guide',
    titleHi: 'एनआईएफटी और एनआईडी प्रवेश: एक मार्गदर्शिका',
    descriptionEn:
      'How admission to leading design institutes like NIFT and NID broadly works, what their entrance processes assess, and how to prepare — with no guarantees or fabricated details.',
    descriptionHi:
      'एनआईएफटी और एनआईडी जैसे प्रमुख डिज़ाइन संस्थानों में प्रवेश मोटे तौर पर कैसे होता है, उनकी प्रवेश प्रक्रियाएँ क्या परखती हैं, और तैयारी कैसे करें — बिना किसी गारंटी या मनगढ़ंत विवरण के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Two leading design institutes',
        headingHi: 'दो प्रमुख डिज़ाइन संस्थान',
        bodyEn:
          'The National Institute of Fashion Technology (NIFT) and the National Institute of Design (NID) are among India\'s best-known design institutes. NIFT focuses strongly on fashion and related design fields, while NID offers a broad range of design disciplines. Each conducts its own admission process.',
      },
      {
        headingEn: 'What the entrance processes assess',
        bodyEn:
          'Design entrance tests generally assess creative aptitude, observation, visualisation, and design thinking rather than rote knowledge, and often include a studio or situation test and an interview. NID\'s admission uses a Design Aptitude Test, and NIFT admission is through the NIFT entrance examination (conducted by the NTA). The exact stages and pattern are set officially each year.',
        bullets: [
          'Creative aptitude and visualisation',
          'A studio/situation test in many cases',
          'Portfolio or interview, depending on the institute',
        ],
      },
      {
        headingEn: 'How to prepare',
        bodyEn:
          'Preparation works best when it builds genuine design skills — regular sketching and observation, practising the official question types, and developing a portfolio. Because these tests reward original thinking, copied or templated answers tend to score poorly.',
      },
      {
        headingEn: 'Use official information',
        bodyEn:
          'Always prepare from the official NIFT and NID notifications for the current pattern, eligibility, and dates, as these change. This guide does not quote fees, cut-offs, or seat numbers, and no preparation can "guarantee" admission to a selective institute.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is the difference between NIFT and NID?',
        answerEn:
          'NIFT focuses strongly on fashion and related design fields, while NID offers a broad range of design disciplines. Each runs its own admission process — check both official sites.',
      },
      {
        questionEn: 'What do design entrance tests assess?',
        answerEn:
          'They generally assess creative aptitude, visualisation, and design thinking, often with a studio/situation test and an interview, rather than rote knowledge. The exact pattern is set officially each year.',
      },
      {
        questionEn: 'Can coaching guarantee a NIFT or NID seat?',
        answerEn:
          'No. These are selective institutes, and no coaching can guarantee admission. Building genuine design skills and practising the official pattern is the most useful approach.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-in-design-after-12th', 'career-options-after-12th-arts', 'career-options-after-12th-commerce'],
    sources: [
      { label: 'National Institute of Fashion Technology (NIFT) — official site', url: 'https://www.nift.ac.in' },
      { label: 'National Institute of Design (NID) — official site', url: 'https://www.nid.edu' },
    ],
    lastVerified: VERIFY,
    keywords: ['nift nid entrance', 'nift entrance exam', 'nid dat preparation', 'design entrance exams', 'how to prepare for nift nid'],
  },
  {
    slug: 'journalism-mass-communication-courses',
    category: 'career',
    region: 'india',
    titleEn: 'Journalism and Mass Communication Courses',
    titleHi: 'पत्रकारिता एवं जनसंचार कोर्स',
    descriptionEn:
      'What journalism and mass communication courses cover, how admission generally works, and the range of roles they lead to — a neutral overview with no salary claims.',
    descriptionHi:
      'पत्रकारिता एवं जनसंचार कोर्स में क्या शामिल है, प्रवेश आमतौर पर कैसे होता है, और ये किन भूमिकाओं की ओर ले जाते हैं — एक निष्पक्ष अवलोकन, बिना किसी वेतन के दावों के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What these courses cover',
        headingHi: 'ये कोर्स क्या कवर करते हैं',
        bodyEn:
          'Journalism and mass communication courses cover reporting, writing, editing, media production, public relations, advertising, and digital media. Common qualifications include a BA or BA (Hons) in journalism or mass communication (often abbreviated BJMC) at the undergraduate level, and master\'s programmes for further study.',
      },
      {
        headingEn: 'How admission works',
        bodyEn:
          'Admission varies by institution: many universities admit through the Common University Entrance Test (CUET) or their own entrance tests, while some well-known institutes run their own selection. Check each programme\'s official admission process and eligibility.',
      },
      {
        headingEn: 'Where it can lead',
        bodyEn:
          'Graduates work across print, broadcast, and digital journalism, public relations, content and communications, advertising, and media production. The field rewards clear writing, communication, and curiosity, and increasingly digital and multimedia skills.',
        bullets: [
          'Reporting, editing, and broadcast journalism',
          'Public relations and corporate communications',
          'Content, digital media, and advertising',
        ],
      },
      {
        headingEn: 'How to begin',
        bodyEn:
          'Build writing and communication skills, follow the news and media critically, and look at the official admission process for programmes you are interested in. This guide does not quote fees or earnings, which vary by role and employer.',
      },
    ],
    faqs: [
      {
        questionEn: 'What can I do after a journalism or mass communication degree?',
        answerEn:
          'Roles include journalism (print, broadcast, digital), public relations, corporate communications, content, advertising, and media production. The field values writing, communication, and digital skills.',
      },
      {
        questionEn: 'How do I get admission to these courses?',
        answerEn:
          'Many universities admit through CUET or their own entrance tests, while some institutes run their own selection. Check each programme\'s official admission process.',
      },
      {
        questionEn: 'Do I need a specific stream in 12th for journalism?',
        answerEn:
          'Generally no — journalism and mass communication programmes are usually open to students from any stream. Confirm the eligibility on each programme\'s official page.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-12th-arts', 'psychology-courses-and-careers', 'career-options-in-design-after-12th'],
    sources: [
      { label: 'NTA — CUET (Common University Entrance Test) official site', url: 'https://cuet.nta.nic.in' },
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['journalism mass communication courses', 'bjmc course', 'mass communication career', 'journalism courses after 12th', 'media studies india'],
  },
  {
    slug: 'psychology-courses-and-careers',
    category: 'career',
    region: 'india',
    titleEn: 'Psychology Courses and Careers',
    titleHi: 'मनोविज्ञान कोर्स और करियर',
    descriptionEn:
      'What psychology courses cover, the main specialisations and career paths, and what practising in regulated areas requires — a factual overview with no clinical advice or salary claims.',
    descriptionHi:
      'मनोविज्ञान कोर्स में क्या शामिल है, मुख्य विशेषज्ञताएँ एवं करियर मार्ग, और विनियमित क्षेत्रों में अभ्यास के लिए क्या आवश्यक है — एक तथ्यात्मक अवलोकन, बिना किसी नैदानिक सलाह या वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What you study in psychology',
        headingHi: 'मनोविज्ञान में आप क्या पढ़ते हैं',
        bodyEn:
          'Psychology is the study of the mind and behaviour. A typical path is a BA or BSc in Psychology, followed by a master\'s (MA or MSc) and, for some careers, further specialised study. Programmes cover areas such as cognitive, social, developmental, and clinical psychology, along with research methods.',
      },
      {
        headingEn: 'Main specialisations and careers',
        bodyEn:
          'Psychology leads to several paths, including clinical and counselling psychology, organisational (industrial) psychology, research and academia, and applied roles in education, human resources, and user research. Each path may need different further study.',
        bullets: [
          'Clinical and counselling psychology',
          'Organisational / industrial psychology',
          'Research and academia',
          'Applied roles in education, HR, and UX research',
        ],
      },
      {
        headingEn: 'Practising in regulated areas',
        bodyEn:
          'Some roles — particularly clinical psychology — require specific recognised qualifications and registration with the relevant statutory body before you can practise. The exact requirements are set officially and can change, so anyone aiming for a regulated clinical role should confirm the current path with the official regulator.',
      },
      {
        headingEn: 'How to begin',
        bodyEn:
          'Start with a psychology degree, explore the specialisations through electives and projects, and check the official requirements early if you are aiming at a regulated path like clinical psychology. This guide describes courses and careers only — it offers no clinical advice and quotes no earnings.',
      },
    ],
    faqs: [
      {
        questionEn: 'What can I do with a psychology degree?',
        answerEn:
          'Paths include clinical and counselling psychology, organisational psychology, research and academia, and applied roles in education, HR, and UX research. Some paths need further specialised study.',
      },
      {
        questionEn: 'Can I become a clinical psychologist with just a BA in psychology?',
        answerEn:
          'Generally no — clinical practice requires specific recognised qualifications and registration with the relevant statutory body. Confirm the current official requirements before planning that path.',
      },
      {
        questionEn: 'Is psychology an arts or science subject?',
        answerEn:
          'It can be studied as either a BA or a BSc depending on the university and programme. Check each programme\'s structure and eligibility officially.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-12th-arts', 'journalism-mass-communication-courses', 'career-options-after-12th-science'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['psychology courses and careers', 'psychology course after 12th', 'how to become a psychologist india', 'clinical psychology career', 'careers in psychology'],
  },
  {
    slug: 'hotel-management-course-guide',
    category: 'career',
    region: 'india',
    titleEn: 'Hotel Management Course Guide',
    titleHi: 'होटल प्रबंधन कोर्स मार्गदर्शिका',
    descriptionEn:
      'What hotel management courses cover, how admission generally works, and the range of careers in hospitality — a factual overview with no salary claims.',
    descriptionHi:
      'होटल प्रबंधन कोर्स में क्या शामिल है, प्रवेश आमतौर पर कैसे होता है, और आतिथ्य में करियर की श्रृंखला — एक तथ्यात्मक अवलोकन, बिना किसी वेतन के दावों के।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What hotel management covers',
        headingHi: 'होटल प्रबंधन में क्या शामिल है',
        bodyEn:
          'Hotel management (also called hospitality management) prepares students for the hospitality industry. Common qualifications include the B.Sc. in Hospitality and Hotel Administration (B.Sc. HHA) offered through the Institutes of Hotel Management, and the Bachelor of Hotel Management (BHM) or similar degrees and diplomas at other institutes — covering areas such as food production (culinary), food and beverage service, front office, and housekeeping, along with management subjects.',
      },
      {
        headingEn: 'How admission works',
        bodyEn:
          'Admission to the Institutes of Hotel Management (IHMs) and many other institutes is commonly through the NCHM JEE, a national entrance test for hotel management, with private institutes also offering their own routes. The eligibility and process are set officially each year, so confirm the current details before applying.',
      },
      {
        headingEn: 'Careers in hospitality',
        bodyEn:
          'Graduates work across hotels and resorts, food and beverage, event management, aviation and travel, and the wider service sector, in operations, guest relations, and management roles. The field values service orientation, communication, and the willingness to work flexible hours.',
        bullets: [
          'Hotels, resorts, and food & beverage',
          'Event management and catering',
          'Aviation, travel, and the broader service sector',
        ],
      },
      {
        headingEn: 'How to begin',
        bodyEn:
          'Look at the official admission process for the IHMs and other institutes, and consider whether the service-focused, hands-on nature of hospitality suits you. This guide does not quote fees or earnings, which vary by role and employer.',
      },
    ],
    faqs: [
      {
        questionEn: 'How do I get admission to hotel management?',
        answerEn:
          'Admission to the IHMs and many institutes is commonly through the NCHM JEE national entrance test, while private institutes may have their own routes. Confirm the current process officially.',
      },
      {
        questionEn: 'What does a hotel management course cover?',
        answerEn:
          'It typically covers food production, food and beverage service, front office, and housekeeping, along with management subjects, preparing students for the hospitality industry.',
      },
      {
        questionEn: 'What careers does hotel management lead to?',
        answerEn:
          'Roles span hotels and resorts, food and beverage, event management, aviation and travel, and the wider service sector, in operations, guest relations, and management.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['career-options-after-12th-arts', 'career-options-after-12th-commerce', 'career-options-in-design-after-12th'],
    sources: [
      { label: 'National Council for Hotel Management and Catering Technology (NCHMCT) — official site', url: 'https://www.nchm.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['hotel management course', 'bhm course', 'nchm jee', 'hotel management admission', 'hospitality management course'],
  },
  // ──────────────────────── Set 16 — Government recruitment exams ─────────────
  {
    slug: 'how-to-prepare-for-upsc',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'How to Prepare for the UPSC Civil Services Exam',
    titleHi: 'यूपीएससी सिविल सेवा परीक्षा की तैयारी कैसे करें',
    descriptionEn:
      'A neutral, factual overview of the UPSC Civil Services Examination — its three stages and how to approach preparation — with all eligibility and cut-offs deferred to the official source.',
    descriptionHi:
      'यूपीएससी सिविल सेवा परीक्षा का निष्पक्ष, तथ्यात्मक अवलोकन — इसके तीन चरण और तैयारी कैसे करें — सभी पात्रता एवं कट-ऑफ आधिकारिक स्रोत पर छोड़े गए हैं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What the exam is',
        headingHi: 'परीक्षा क्या है',
        bodyEn:
          'The Union Public Service Commission (UPSC) conducts the Civil Services Examination (CSE) to recruit officers for services such as the IAS, IPS, and IFS, among others. It is open to graduates and has a broad, multi-subject syllabus and a three-stage selection process.',
      },
      {
        headingEn: 'The three stages',
        bodyEn:
          'The examination has three stages: a preliminary objective test used for screening, a written main examination, and a personality test (interview). Each stage has its own structure, and the exact pattern, eligibility, age limits, and number of attempts are set officially and can change.',
        bullets: [
          'Preliminary examination (objective, for screening)',
          'Main examination (written)',
          'Personality test (interview)',
        ],
      },
      {
        headingEn: 'How to approach preparation',
        bodyEn:
          'A common approach is to build strong fundamentals (often starting with standard school-level textbooks), follow current affairs consistently, practise answer writing for the main examination, and choose an optional subject thoughtfully. Regular revision and mock tests help more than accumulating material you cannot revise.',
      },
      {
        headingEn: 'Plan with official information',
        bodyEn:
          'Because eligibility, the syllabus, and the schedule are set officially and revised over time, base your plan on the official UPSC notification rather than third-party summaries. This guide does not quote cut-offs or success rates, and no preparation can guarantee selection in a competitive examination.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who can appear for the UPSC Civil Services Exam?',
        answerEn:
          'It is open to graduates, subject to official eligibility including age limits and a set number of attempts that vary by category. Confirm the current eligibility in the official UPSC notification.',
      },
      {
        questionEn: 'How many stages does the exam have?',
        answerEn:
          'Three: a preliminary objective test, a written main examination, and a personality test (interview). The exact pattern is set officially each year.',
      },
      {
        questionEn: 'How long does it take to prepare?',
        answerEn:
          'It varies widely by individual and background, and there is no fixed timeline. Consistent preparation and revision matter more than a specific number of months.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['ssc-cgl-exam-guide', 'bank-po-exam-guide', 'career-options-after-12th-arts'],
    sources: [
      { label: 'Union Public Service Commission (UPSC) — official site', url: 'https://www.upsc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to prepare for upsc', 'upsc civil services exam', 'ias preparation', 'upsc cse stages', 'upsc preparation strategy'],
  },
  {
    slug: 'ssc-cgl-exam-guide',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'SSC CGL Exam Guide',
    titleHi: 'एसएससी सीजीएल परीक्षा मार्गदर्शिका',
    descriptionEn:
      'A neutral overview of the SSC Combined Graduate Level exam — what it is, its tiered structure, and how to prepare — with eligibility and cut-offs deferred to the official source.',
    descriptionHi:
      'एसएससी संयुक्त स्नातक स्तर परीक्षा का निष्पक्ष अवलोकन — यह क्या है, इसकी स्तरीय संरचना, और तैयारी कैसे करें — पात्रता एवं कट-ऑफ आधिकारिक स्रोत पर छोड़े गए हैं।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What SSC CGL is',
        headingHi: 'एसएससी सीजीएल क्या है',
        bodyEn:
          'The Staff Selection Commission (SSC) conducts the Combined Graduate Level (CGL) examination to recruit for various posts in government departments and organisations. It is open to graduates, and the specific posts and eligibility are set officially each cycle.',
      },
      {
        headingEn: 'How the exam is structured',
        bodyEn:
          'SSC CGL is conducted in tiers (stages), typically including computer-based tests covering areas such as reasoning, quantitative aptitude, English, and general awareness, with further stages depending on the posts. The exact tiers, pattern, and marking are set officially and can change.',
        bullets: [
          'Computer-based objective stages',
          'Reasoning, quantitative aptitude, English, general awareness',
          'Further stages depending on the posts',
        ],
      },
      {
        headingEn: 'How to prepare',
        bodyEn:
          'Preparation usually focuses on building speed and accuracy in quantitative aptitude and reasoning, strengthening English, and keeping up with general awareness. Regular timed practice and revision of basics tend to help most.',
      },
      {
        headingEn: 'Use official information',
        bodyEn:
          'Confirm the current posts, eligibility, tiers, and schedule on the official SSC notification, as these change. This guide does not quote cut-offs or vacancy numbers, and no preparation guarantees selection.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who can apply for SSC CGL?',
        answerEn:
          'It is open to graduates, with specific eligibility set officially for each cycle. Confirm the current requirements in the official SSC notification.',
      },
      {
        questionEn: 'What does the SSC CGL exam test?',
        answerEn:
          'It typically tests reasoning, quantitative aptitude, English, and general awareness across computer-based stages, with further stages depending on the posts. The exact pattern is set officially.',
      },
      {
        questionEn: 'Is SSC CGL only for commerce graduates?',
        answerEn:
          'No. It is open to graduates from various streams; specific posts may have their own requirements. Check the official notification.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-prepare-for-upsc', 'bank-po-exam-guide', 'career-options-after-12th-commerce'],
    sources: [
      { label: 'Staff Selection Commission (SSC) — official site', url: 'https://ssc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['ssc cgl exam', 'ssc cgl guide', 'ssc cgl preparation', 'ssc cgl eligibility', 'ssc combined graduate level'],
  },
  {
    slug: 'bank-po-exam-guide',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'Bank PO Exam Guide',
    titleHi: 'बैंक पीओ परीक्षा मार्गदर्शिका',
    descriptionEn:
      'A neutral overview of how Bank Probationary Officer recruitment works in India — the common exam stages and how to prepare — with eligibility and cut-offs deferred to official sources.',
    descriptionHi:
      'भारत में बैंक प्रोबेशनरी ऑफिसर भर्ती कैसे होती है इसका निष्पक्ष अवलोकन — सामान्य परीक्षा चरण और तैयारी कैसे करें — पात्रता एवं कट-ऑफ आधिकारिक स्रोतों पर छोड़े गए हैं।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What a Bank PO exam is',
        headingHi: 'बैंक पीओ परीक्षा क्या है',
        bodyEn:
          'Bank Probationary Officer (PO) recruitment selects entry-level officers for banks. For many public-sector banks, recruitment is conducted through the Institute of Banking Personnel Selection (IBPS), while some banks, such as the State Bank of India, conduct their own PO recruitment separately. It is generally open to graduates.',
      },
      {
        headingEn: 'Common exam stages',
        bodyEn:
          'These exams are usually conducted in stages — commonly a preliminary objective test, a main examination, and an interview (and sometimes other stages). They typically test reasoning, quantitative aptitude, English, and awareness, including banking and general awareness. The exact pattern is set officially by each conducting body.',
        bullets: [
          'Preliminary objective test',
          'Main examination',
          'Interview (and other stages as specified)',
        ],
      },
      {
        headingEn: 'How to prepare',
        bodyEn:
          'Preparation usually focuses on speed and accuracy in reasoning and quantitative sections, strong English, and current and banking awareness. Regular timed mock tests and revision help build the pace these exams require.',
      },
      {
        headingEn: 'Use official information',
        bodyEn:
          'Because eligibility, participating banks, and patterns change, confirm the current details on the official IBPS or the specific bank\'s notification. This guide does not quote cut-offs or vacancies, and no course guarantees selection.',
      },
    ],
    faqs: [
      {
        questionEn: 'How is a Bank PO selected?',
        answerEn:
          'Through a staged exam, commonly a preliminary test, a main examination, and an interview. Many public-sector banks recruit through IBPS, while some banks conduct their own process. Confirm the current pattern officially.',
      },
      {
        questionEn: 'Who can apply for Bank PO?',
        answerEn:
          'It is generally open to graduates, with specific eligibility (including age limits) set officially. Check the IBPS or bank notification for the current requirements.',
      },
      {
        questionEn: 'Is IBPS the only way to become a Bank PO?',
        answerEn:
          'No. IBPS conducts recruitment for many public-sector banks, but some banks, such as SBI, run their own PO recruitment. Check each bank\'s official process.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['ssc-cgl-exam-guide', 'how-to-prepare-for-upsc', 'career-options-after-12th-commerce'],
    sources: [
      { label: 'Institute of Banking Personnel Selection (IBPS) — official site', url: 'https://www.ibps.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['bank po exam', 'bank po guide', 'ibps po preparation', 'how to become bank po', 'bank po exam pattern'],
  },
  {
    slug: 'nda-entrance-guide',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'NDA Entrance Guide',
    titleHi: 'एनडीए प्रवेश मार्गदर्शिका',
    descriptionEn:
      'A neutral, factual overview of the National Defence Academy entrance — what it is, the broad selection process, and how to approach it — with eligibility deferred to the official source.',
    descriptionHi:
      'राष्ट्रीय रक्षा अकादमी प्रवेश का निष्पक्ष, तथ्यात्मक अवलोकन — यह क्या है, व्यापक चयन प्रक्रिया, और इसे कैसे करें — पात्रता आधिकारिक स्रोत पर छोड़ी गई है।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What the NDA entrance is',
        headingHi: 'एनडीए प्रवेश क्या है',
        bodyEn:
          'The National Defence Academy (NDA) trains cadets for the Army, Navy, and Air Force. Entry is through an examination conducted by the Union Public Service Commission (UPSC), generally held twice a year, and is one of the routes to join the armed forces after Class 12.',
      },
      {
        headingEn: 'The broad selection process',
        bodyEn:
          'Selection usually involves a written examination followed by the Services Selection Board (SSB) interview, along with medical and other requirements. Eligibility includes age, marital status, and subject conditions — for example, the Air Force and Navy wings generally require Physics and Mathematics. The exact eligibility and pattern are set officially.',
        bullets: [
          'Written examination (conducted by UPSC)',
          'SSB interview and medical requirements',
          'Subject and age eligibility set officially',
        ],
      },
      {
        headingEn: 'How to prepare',
        bodyEn:
          'Preparation typically covers mathematics and a general ability paper, alongside physical fitness and awareness for the later stages. Building fundamentals and steady practice, along with fitness, suits the multi-stage nature of the process.',
      },
      {
        headingEn: 'Use official information',
        bodyEn:
          'Confirm the current eligibility, subjects, and pattern in the official UPSC NDA notification, as these are set officially and can change. This guide does not quote cut-offs, and no preparation can guarantee selection.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who conducts the NDA entrance exam?',
        answerEn:
          'The written examination is conducted by the Union Public Service Commission (UPSC), generally twice a year, followed by the SSB interview and other requirements.',
      },
      {
        questionEn: 'Can I join the NDA after Class 12?',
        answerEn:
          'Yes, the NDA is one route to the armed forces after Class 12, subject to official eligibility including age and, for some wings, Physics and Mathematics. Confirm in the official notification.',
      },
      {
        questionEn: 'Do all NDA wings need Physics and Maths?',
        answerEn:
          'The Air Force and Navy wings generally require Physics and Mathematics, while the Army wing has different subject requirements. Check the current official eligibility.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-prepare-for-upsc', 'courses-after-12th-pcm', 'career-options-after-12th-science'],
    sources: [
      { label: 'Union Public Service Commission (UPSC) — official site', url: 'https://www.upsc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['nda entrance exam', 'nda exam guide', 'how to join nda', 'nda eligibility', 'nda preparation'],
  },
  {
    slug: 'railway-exams-overview',
    category: 'exam-prep',
    region: 'india',
    titleEn: 'Railway Exams: An Overview',
    titleHi: 'रेलवे परीक्षाएँ: एक अवलोकन',
    descriptionEn:
      'A neutral overview of how recruitment to Indian Railways through the Railway Recruitment Boards broadly works — common exam types and stages — with details deferred to official sources.',
    descriptionHi:
      'रेलवे भर्ती बोर्डों के माध्यम से भारतीय रेलवे में भर्ती मोटे तौर पर कैसे होती है इसका निष्पक्ष अवलोकन — सामान्य परीक्षा प्रकार और चरण — विवरण आधिकारिक स्रोतों पर छोड़े गए हैं।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'How railway recruitment works',
        headingHi: 'रेलवे भर्ती कैसे होती है',
        bodyEn:
          'Recruitment for many posts in Indian Railways is carried out through the Railway Recruitment Boards (RRBs). The RRBs hold different examinations for different categories of posts, with eligibility ranging from Class 10 or ITI level up to graduation depending on the post.',
      },
      {
        headingEn: 'Common exam categories',
        bodyEn:
          'The RRBs conduct several well-known recruitment examinations for different post groups — for example, non-technical popular categories, assistant loco pilot and technician posts, and entry-level posts. The exact exams, eligibility, and stages are notified officially and change with each recruitment cycle.',
        bullets: [
          'Non-technical popular categories (graduate and undergraduate posts)',
          'Assistant loco pilot and technician posts',
          'Entry-level posts (often Class 10 / ITI eligibility)',
        ],
      },
      {
        headingEn: 'How the exams are structured',
        bodyEn:
          'These recruitments are usually conducted as computer-based tests, sometimes in multiple stages, and may include skill or physical tests and document verification depending on the post. They commonly assess mathematics, reasoning, general awareness, and general science.',
      },
      {
        headingEn: 'Use official information',
        bodyEn:
          'Because the boards, posts, and patterns vary by cycle and region, confirm the current details on the official Indian Railways and Railway Recruitment Board notifications. This guide does not quote vacancies or cut-offs, and no preparation guarantees selection.',
      },
    ],
    faqs: [
      {
        questionEn: 'Who conducts railway recruitment exams?',
        answerEn:
          'Recruitment for many railway posts is conducted by the Railway Recruitment Boards (RRBs). The specific board and process depend on the post and region — check the official notifications.',
      },
      {
        questionEn: 'What qualifications do railway exams need?',
        answerEn:
          'Eligibility ranges from Class 10 or ITI level up to graduation depending on the post. Confirm the requirement for the specific post in the official notification.',
      },
      {
        questionEn: 'Are railway exams computer-based?',
        answerEn:
          'Many are conducted as computer-based tests, sometimes in multiple stages with skill or physical tests for certain posts. The exact format is set officially for each recruitment.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['ssc-cgl-exam-guide', 'bank-po-exam-guide', 'how-to-prepare-for-upsc'],
    sources: [
      { label: 'Indian Railways — official site (Ministry of Railways)', url: 'https://indianrailways.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['railway exams', 'rrb exams overview', 'railway recruitment board', 'railway jobs exam', 'rrb ntpc group d'],
  },
  // ──────────────────── Set 17 — Study-abroad destinations (§14) ──────────────
  {
    slug: 'study-in-australia-from-india',
    category: 'study-abroad',
    region: 'australia-nz',
    titleEn: 'How to Study in Australia from India',
    titleHi: 'भारत से ऑस्ट्रेलिया में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to Australian universities — tests, applications, the student visa, and where to verify official rules. General information, not immigration advice.',
    descriptionHi:
      'ऑस्ट्रेलियाई विश्वविद्यालयों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — परीक्षाएँ, आवेदन, छात्र वीज़ा और आधिकारिक नियम कहाँ सत्यापित करें। सामान्य जानकारी, आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Studying in Australia from India generally involves choosing a course and university, meeting English-language requirements, securing an offer and the enrolment confirmation, and then completing the student-visa process. Start about a year ahead to allow time for each stage.',
      },
      {
        headingEn: 'Applications and English requirement',
        bodyEn:
          'Most applicants apply directly to universities or through their authorised representatives, submitting academic records and proof of English proficiency through tests such as IELTS or other accepted qualifications. Required scores vary by university and course, so confirm them on each university\'s official admissions page.',
      },
      {
        headingEn: 'The student visa (verify on official .gov.au)',
        bodyEn:
          'International students study in Australia on the Student visa (subclass 500). The eligibility, financial evidence, health, and English requirements are set by the Australian government and change periodically. Use only the official Australian government sources below to confirm the current process — this guide is general information, not immigration advice.',
      },
      {
        headingEn: 'Funding and planning',
        bodyEn:
          'Plan for tuition and living costs, and review scholarships published officially by each university and by Study Australia. Because costs and rules change each year, verify the current figures on official sources rather than third-party estimates.',
      },
    ],
    faqs: [
      {
        questionEn: 'Which visa do I need to study in Australia?',
        answerEn:
          'International students generally study on the Student visa (subclass 500). The exact requirements are set by the Australian government — verify them on the official sources before applying.',
      },
      {
        questionEn: 'Do Australian universities require IELTS?',
        answerEn:
          'Most require proof of English through IELTS or another accepted test, but the accepted tests and scores vary by university and course. Check each university\'s official admissions page.',
      },
      {
        questionEn: 'Can anyone guarantee my Australian student visa?',
        answerEn:
          'No. Visa decisions rest with the Australian authorities under official rules. Be cautious of guaranteed-visa claims; this guide provides factual information only.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: ['university-of-melbourne', 'university-of-sydney'],
    relatedGuideSlugs: ['study-in-new-zealand-from-india', 'how-to-study-in-uk-from-india', 'scholarships-for-indian-students-abroad'],
    sources: [
      { label: 'Study Australia — official Australian Government site', url: 'https://www.studyaustralia.gov.au' },
      { label: 'Australian Government — Department of Home Affairs (Student visa)', url: 'https://immi.homeaffairs.gov.au' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in australia from india', 'australia student visa', 'how to study in australia', 'australian universities for indian students', 'study abroad australia'],
  },
  {
    slug: 'study-in-ireland-from-india',
    category: 'study-abroad',
    region: 'uk-ireland',
    titleEn: 'How to Study in Ireland from India',
    titleHi: 'भारत से आयरलैंड में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to Irish universities — applications, English requirements, the study visa and permission, and where to verify official rules. Not immigration advice.',
    descriptionHi:
      'आयरिश विश्वविद्यालयों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — आवेदन, अंग्रेज़ी आवश्यकताएँ, अध्ययन वीज़ा एवं अनुमति, और आधिकारिक नियम कहाँ सत्यापित करें। आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Studying in Ireland from India generally involves choosing a course, applying (often directly to universities for postgraduate study, or through the central system for some undergraduate routes), meeting English requirements, receiving an offer, and then completing the study-visa and registration process.',
      },
      {
        headingEn: 'Applications and English requirement',
        bodyEn:
          'Applicants submit academic records and proof of English proficiency through accepted tests such as IELTS. The accepted tests and required scores vary by university and course, so confirm the exact requirement on each university\'s official admissions page and the official Education in Ireland resources.',
      },
      {
        headingEn: 'The study visa and permission (verify officially)',
        bodyEn:
          'Indian students generally need a study visa to enter Ireland and then register for permission to stay after arrival. The eligibility, financial evidence, and steps are set by the Irish authorities and change periodically. Use the official Irish immigration sources below to confirm the current process — this guide is general information, not immigration advice.',
      },
      {
        headingEn: 'Funding and planning',
        bodyEn:
          'Budget for tuition and living costs, and review scholarships published officially by each university and by Education in Ireland. As fees and rules change each year, verify the current figures on official sources.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I need a visa to study in Ireland?',
        answerEn:
          'Indian students generally need a study visa to enter Ireland and must register for permission to stay after arrival. Confirm the current requirements on the official Irish immigration sources.',
      },
      {
        questionEn: 'What English test does Ireland accept?',
        answerEn:
          'Universities commonly accept IELTS and other recognised tests, but the accepted tests and scores vary by course. Check each university\'s official admissions page.',
      },
      {
        questionEn: 'Can a study visa for Ireland be guaranteed?',
        answerEn:
          'No. Visa decisions rest with the Irish authorities under official rules. Be cautious of guaranteed-visa claims; this guide provides factual information only.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: ['trinity-college-dublin', 'university-college-dublin'],
    relatedGuideSlugs: ['how-to-study-in-uk-from-india', 'study-in-france-from-india', 'scholarships-for-indian-students-abroad'],
    sources: [
      { label: 'Education in Ireland — official site', url: 'https://www.educationinireland.com' },
      { label: 'Irish Immigration Service — official site', url: 'https://www.irishimmigration.ie' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in ireland from india', 'ireland student visa', 'how to study in ireland', 'irish universities for indian students', 'study abroad ireland'],
  },
  {
    slug: 'study-in-france-from-india',
    category: 'study-abroad',
    region: 'europe',
    titleEn: 'How to Study in France from India',
    titleHi: 'भारत से फ्रांस में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to French institutions — applications via Campus France, language and English-taught options, the student visa, and where to verify. Not immigration advice.',
    descriptionHi:
      'फ्रांसीसी संस्थानों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — कैंपस फ्रांस के माध्यम से आवेदन, भाषा एवं अंग्रेज़ी-माध्यम विकल्प, छात्र वीज़ा, और कहाँ सत्यापित करें। आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Studying in France from India generally involves choosing a programme (many are taught in English, while others are in French), applying through the official Campus France process for India, receiving an offer, and then completing the student-visa process. Campus France is the official agency that guides international students.',
      },
      {
        headingEn: 'Applications and language',
        bodyEn:
          'France offers a growing number of English-taught programmes alongside French-taught ones. English-taught programmes typically require a test such as IELTS, and French-taught programmes require French proficiency. Confirm the language and test requirements on each institution\'s official page and through Campus France.',
      },
      {
        headingEn: 'The student visa (verify officially)',
        bodyEn:
          'Indian students generally need a long-stay student visa for France. The eligibility, financial evidence, and steps are set by the French government and change periodically. Use the official Campus France and France-Visas sources below to confirm the current process — this guide is general information, not immigration advice.',
      },
      {
        headingEn: 'Funding and planning',
        bodyEn:
          'Budget for tuition and living costs, and review scholarships published officially by the French government, institutions, and Campus France. As fees and rules change, verify current figures on official sources.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I need to know French to study in France?',
        answerEn:
          'Not always — France offers many English-taught programmes, which usually require an English test such as IELTS. French-taught programmes require French proficiency. Check each programme\'s official requirements.',
      },
      {
        questionEn: 'How do Indian students apply to study in France?',
        answerEn:
          'Indian students typically apply through the official Campus France process, which guides applications and the visa steps. Confirm the current process on the official Campus France site.',
      },
      {
        questionEn: 'Can a French student visa be guaranteed?',
        answerEn:
          'No. Visa decisions rest with the French authorities under official rules. Be cautious of guaranteed-visa claims; this guide provides factual information only.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: ['sorbonne-university', 'sciences-po'],
    relatedGuideSlugs: ['study-in-netherlands-from-india', 'study-in-germany-from-india', 'scholarships-for-indian-students-abroad'],
    sources: [
      { label: 'Campus France — official agency for international students', url: 'https://www.campusfrance.org' },
      { label: 'France-Visas — official French Government visa site', url: 'https://france-visas.gouv.fr' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in france from india', 'france student visa', 'how to study in france', 'campus france', 'study abroad france'],
  },
  {
    slug: 'study-in-netherlands-from-india',
    category: 'study-abroad',
    region: 'europe',
    titleEn: 'How to Study in the Netherlands from India',
    titleHi: 'भारत से नीदरलैंड में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to Dutch universities — applications, English-taught programmes, the residence permit for study, and where to verify. Not immigration advice.',
    descriptionHi:
      'डच विश्वविद्यालयों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — आवेदन, अंग्रेज़ी-माध्यम कार्यक्रम, अध्ययन हेतु निवास परमिट, और कहाँ सत्यापित करें। आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Studying in the Netherlands from India generally involves choosing a programme (the Netherlands is known for many English-taught programmes), applying to universities, meeting English requirements, receiving an offer, and then completing the residence and entry process, which the university often helps arrange.',
      },
      {
        headingEn: 'Applications and English requirement',
        bodyEn:
          'Dutch universities offer a wide range of English-taught bachelor\'s and master\'s programmes, which usually require a test such as IELTS. Required scores vary by university and programme, so confirm them on each institution\'s official page and the official Study in NL resources.',
      },
      {
        headingEn: 'Residence permit and entry (verify officially)',
        bodyEn:
          'Indian students generally need a residence permit to study in the Netherlands, and often an entry visa, which the university typically applies for on the student\'s behalf through the Dutch immigration service (IND). The requirements are set by the Dutch government and change periodically. Use the official sources below to confirm the current process — this guide is general information, not immigration advice.',
      },
      {
        headingEn: 'Funding and planning',
        bodyEn:
          'Budget for tuition and living costs, and review scholarships published officially by universities, the Dutch government, and Study in NL. As fees and rules change each year, verify current figures on official sources.',
      },
    ],
    faqs: [
      {
        questionEn: 'Are there English-taught programmes in the Netherlands?',
        answerEn:
          'Yes — the Netherlands offers many English-taught bachelor\'s and master\'s programmes, usually requiring an English test such as IELTS. Check each programme\'s official requirements.',
      },
      {
        questionEn: 'Do I arrange the Dutch student permit myself?',
        answerEn:
          'In many cases the university applies for the residence permit and entry visa on the student\'s behalf through the Dutch immigration service (IND). Confirm the current process on the official sources.',
      },
      {
        questionEn: 'Can a Dutch study permit be guaranteed?',
        answerEn:
          'No. Decisions rest with the Dutch authorities under official rules. Be cautious of guaranteed-approval claims; this guide provides factual information only.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: ['tu-delft', 'university-of-amsterdam'],
    relatedGuideSlugs: ['study-in-france-from-india', 'study-in-germany-from-india', 'scholarships-for-indian-students-abroad'],
    sources: [
      { label: 'Study in NL (Nuffic) — official site', url: 'https://www.studyinnl.org' },
      { label: 'IND — Dutch Immigration and Naturalisation Service (official)', url: 'https://ind.nl' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in netherlands from india', 'netherlands student visa', 'how to study in netherlands', 'dutch universities for indian students', 'study abroad netherlands'],
  },
  {
    slug: 'study-in-new-zealand-from-india',
    category: 'study-abroad',
    region: 'australia-nz',
    titleEn: 'How to Study in New Zealand from India',
    titleHi: 'भारत से न्यूज़ीलैंड में पढ़ाई कैसे करें',
    descriptionEn:
      'A step-by-step overview for Indian students applying to New Zealand universities — applications, English requirements, the student visa, and where to verify official rules. Not immigration advice.',
    descriptionHi:
      'न्यूज़ीलैंड विश्वविद्यालयों में आवेदन करने वाले भारतीय छात्रों के लिए चरण-दर-चरण मार्गदर्शिका — आवेदन, अंग्रेज़ी आवश्यकताएँ, छात्र वीज़ा, और आधिकारिक नियम कहाँ सत्यापित करें। आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'The big picture',
        headingHi: 'समग्र चित्र',
        bodyEn:
          'Studying in New Zealand from India generally involves choosing a course and university, meeting English-language requirements, securing an offer of place, and then completing the student-visa process. Starting about a year ahead gives time for each stage.',
      },
      {
        headingEn: 'Applications and English requirement',
        bodyEn:
          'Applicants apply to universities with their academic records and proof of English proficiency through accepted tests such as IELTS. The accepted tests and required scores vary by university and course, so confirm them on each university\'s official admissions page and the official Study with New Zealand resources.',
      },
      {
        headingEn: 'The student visa (verify on official .govt.nz)',
        bodyEn:
          'International students generally need a student visa, which usually requires an offer of place from an approved institution. The eligibility, financial evidence, and steps are set by the New Zealand government and change periodically. Use the official Immigration New Zealand sources below to confirm the current process — this guide is general information, not immigration advice.',
      },
      {
        headingEn: 'Funding and planning',
        bodyEn:
          'Budget for tuition and living costs, and review scholarships published officially by universities and by Study with New Zealand. As fees and rules change each year, verify the current figures on official sources.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I need a student visa for New Zealand?',
        answerEn:
          'International students generally need a student visa, usually requiring an offer of place from an approved institution. Confirm the current requirements on the official Immigration New Zealand sources.',
      },
      {
        questionEn: 'What English test does New Zealand accept?',
        answerEn:
          'Universities commonly accept IELTS and other recognised tests, but the accepted tests and scores vary by course. Check each university\'s official admissions page.',
      },
      {
        questionEn: 'Can a New Zealand student visa be guaranteed?',
        answerEn:
          'No. Visa decisions rest with the New Zealand authorities under official rules. Be cautious of guaranteed-visa claims; this guide provides factual information only.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: ['university-of-auckland', 'university-of-otago'],
    relatedGuideSlugs: ['study-in-australia-from-india', 'how-to-study-in-canada-from-india', 'scholarships-for-indian-students-abroad'],
    sources: [
      { label: 'Study with New Zealand — official New Zealand Government site', url: 'https://www.studywithnewzealand.govt.nz' },
      { label: 'Immigration New Zealand — official site', url: 'https://www.immigration.govt.nz' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in new zealand from india', 'new zealand student visa', 'how to study in new zealand', 'nz universities for indian students', 'study abroad new zealand'],
  },
  // ───────────────────────── Set 18 — Application essentials ─────────────────
  {
    slug: 'how-to-choose-a-university-abroad',
    category: 'study-abroad',
    region: 'india',
    titleEn: 'How to Choose a University Abroad',
    titleHi: 'विदेश में विश्वविद्यालय कैसे चुनें',
    descriptionEn:
      'A practical framework for choosing a university abroad — the factors that actually matter and how to verify them officially — without rankings hype or salary claims.',
    descriptionHi:
      'विदेश में विश्वविद्यालय चुनने के लिए एक व्यावहारिक ढाँचा — वे कारक जो वास्तव में मायने रखते हैं और उन्हें आधिकारिक रूप से कैसे सत्यापित करें — बिना रैंकिंग के प्रचार या वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Start with fit, not just rankings',
        headingHi: 'केवल रैंकिंग नहीं, उपयुक्तता से शुरू करें',
        bodyEn:
          'Rankings can be one input, but they are not the whole picture — and different ranking bodies measure different things. A more useful starting question is which universities fit your subject, goals, budget, and circumstances. The "best" university is the one that is best for you.',
      },
      {
        headingEn: 'Factors that actually matter',
        bodyEn:
          'Weigh the things that genuinely shape your experience and outcomes, and verify each on official university pages rather than third-party summaries.',
        bullets: [
          'The specific programme and its curriculum',
          'Official admission requirements and your eligibility',
          'Total cost (tuition + living) and funding options',
          'Location, support services, and any work or post-study rules',
        ],
      },
      {
        headingEn: 'How to research and verify',
        bodyEn:
          'Use official university websites for requirements, fees, and deadlines; official government sources for visa and work rules; and recognised ranking bodies only for their own rankings, attributed to them. Shortlist a mix of options rather than fixating on one name.',
      },
      {
        headingEn: 'Make a balanced shortlist',
        bodyEn:
          'A practical approach is to build a shortlist across a range of selectivity and cost, so you have realistic choices. Base the final decision on fit and verified official information rather than reputation alone. This guide does not rank universities or quote outcomes.',
      },
    ],
    faqs: [
      {
        questionEn: 'Should I choose a university purely by ranking?',
        answerEn:
          'No. Rankings are one input among many and different bodies measure different things. Fit with your subject, goals, budget, and circumstances usually matters more — verify details officially.',
      },
      {
        questionEn: 'How many universities should I apply to?',
        answerEn:
          'There is no fixed number. A balanced shortlist across different levels of selectivity and cost is a common, practical approach. Follow each university\'s official application rules.',
      },
      {
        questionEn: 'Where should I verify university information?',
        answerEn:
          'Use official university websites for requirements and fees, official government sources for visa and work rules, and ranking bodies only for their own rankings.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-study-in-usa-from-india', 'education-loan-for-study-abroad', 'scholarships-for-indian-students-abroad'],
    sources: [
      { label: 'EducationUSA — official U.S. Department of State network', url: 'https://educationusa.state.gov' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to choose a university abroad', 'choosing a university overseas', 'how to shortlist universities abroad', 'study abroad university selection', 'best university for me abroad'],
  },
  {
    slug: 'education-loan-for-study-abroad',
    category: 'study-abroad',
    region: 'india',
    titleEn: 'Education Loans for Studying Abroad',
    titleHi: 'विदेश में पढ़ाई के लिए शिक्षा ऋण',
    descriptionEn:
      'A factual overview of how education loans for studying abroad generally work and what to check — general information only, not financial advice, with no interest rates or amounts quoted.',
    descriptionHi:
      'विदेश में पढ़ाई के लिए शिक्षा ऋण आमतौर पर कैसे काम करते हैं और क्या जाँचें इसका तथ्यात्मक अवलोकन — केवल सामान्य जानकारी, वित्तीय सलाह नहीं, बिना किसी ब्याज दर या राशि के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'How education loans generally work',
        headingHi: 'शिक्षा ऋण आमतौर पर कैसे काम करते हैं',
        bodyEn:
          'Education loans are one way some students fund studying abroad. In India they are offered by banks, non-banking financial companies (NBFCs), and through government-linked channels, with terms that vary by lender and by your specific case. This guide explains the general idea only — it is not financial advice.',
      },
      {
        headingEn: 'What to understand before borrowing',
        bodyEn:
          'If you consider a loan, read the official terms carefully and compare lenders on the factors below. Because terms differ widely and change, rely on each lender\'s official documents rather than informal summaries.',
        bullets: [
          'Interest rate and how it is calculated',
          'Whether collateral or a guarantor is required',
          'Any moratorium period and when repayment begins',
          'Processing fees, currency, and total cost over the loan',
        ],
      },
      {
        headingEn: 'Official starting points',
        bodyEn:
          'The Government of India\'s official education-loan portal (PM-Vidyalaxmi) brings together information on education-loan schemes from multiple banks in one place. You can use official portals and lender websites to understand options, then verify the exact terms with the lender directly.',
      },
      {
        headingEn: 'Borrow carefully and seek qualified advice',
        bodyEn:
          'A loan is a long-term commitment, so understand the repayment obligation before signing. This guide provides general information, not financial or legal advice — for decisions about your situation, consult the official terms and a qualified financial advisor.',
      },
    ],
    faqs: [
      {
        questionEn: 'Where can I find official information on education loans?',
        answerEn:
          'The Government of India\'s official education-loan portal (PM-Vidyalaxmi) consolidates education-loan scheme information from multiple banks. Always verify the exact terms with the lender\'s official documents.',
      },
      {
        questionEn: 'Do education loans need collateral?',
        answerEn:
          'It depends on the lender, the amount, and your case — some loans require collateral or a guarantor and some may not. Check each lender\'s official terms; this guide does not advise on specific products.',
      },
      {
        questionEn: 'What interest rate will I get?',
        answerEn:
          'Rates vary by lender and case and change over time, so this guide does not quote figures. Compare current official rates directly from lenders before deciding.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['cost-of-studying-in-usa-for-indians', 'scholarships-for-indian-students-abroad', 'how-to-choose-a-university-abroad'],
    sources: [
      { label: 'PM-Vidyalaxmi — Government of India education-loan portal (official)', url: 'https://pmvidyalaxmi.co.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['education loan for study abroad', 'student loan abroad', 'study abroad loan india', 'vidya lakshmi education loan', 'education loan guide'],
  },
  {
    slug: 'cost-of-studying-in-usa-for-indians',
    category: 'study-abroad',
    region: 'usa',
    titleEn: 'Cost of Studying in the USA for Indian Students',
    titleHi: 'भारतीय छात्रों के लिए अमेरिका में पढ़ाई की लागत',
    descriptionEn:
      'What goes into the cost of studying in the USA and how to find the official figures for each university — with no invented numbers, since costs vary widely and change every year.',
    descriptionHi:
      'अमेरिका में पढ़ाई की लागत में क्या-क्या शामिल है और प्रत्येक विश्वविद्यालय के आधिकारिक आँकड़े कैसे प्राप्त करें — बिना किसी मनगढ़ंत संख्या के, क्योंकि लागत बहुत भिन्न होती है और हर साल बदलती है।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Cost is more than tuition',
        headingHi: 'लागत केवल ट्यूशन से अधिक है',
        bodyEn:
          'The cost of studying in the USA includes far more than tuition. Universities publish an official "cost of attendance" that brings together the main components, and these vary widely between public and private universities and between cities. Because figures change every year, this guide explains the components rather than quoting numbers.',
        bullets: [
          'Tuition and university fees',
          'Living costs (housing, food, transport)',
          'Health insurance',
          'Books, supplies, travel, and application/test fees',
        ],
      },
      {
        headingEn: 'Find the official cost of attendance',
        bodyEn:
          'Each U.S. university publishes its official cost of attendance on its own financial-aid or admissions pages, usually broken down by component and updated each academic year. This is the most reliable figure to plan with — far better than third-party estimates.',
      },
      {
        headingEn: 'Funding can change the real cost',
        bodyEn:
          'Scholarships, assistantships, and aid published officially by universities can significantly change what you actually pay, so look at the net cost after any funding, not just the headline figure. The related scholarships and education-loan guides cover funding options.',
      },
      {
        headingEn: 'Plan with current official figures',
        bodyEn:
          'Convert costs using current exchange rates only when planning, and never rely on outdated or invented numbers. Always confirm the current cost of attendance on each university\'s official pages and official U.S. student-advising resources.',
      },
    ],
    faqs: [
      {
        questionEn: 'How much does it cost to study in the USA?',
        answerEn:
          'It varies widely by university (public vs private), city, and programme, and changes each year, so this guide does not quote a figure. Use each university\'s official "cost of attendance" page for reliable numbers.',
      },
      {
        questionEn: 'What is "cost of attendance"?',
        answerEn:
          'It is the official estimate a university publishes covering tuition, living costs, health insurance, books, and other expenses for an academic year. It is the best basis for planning.',
      },
      {
        questionEn: 'Can funding reduce the cost?',
        answerEn:
          'Yes. Scholarships, assistantships, and official aid can change what you actually pay, so consider the net cost after funding, not just tuition.',
      },
    ],
    relatedExamSlugs: ['sat', 'gre'],
    relatedCollegeSlugs: ['massachusetts-institute-of-technology', 'harvard-university'],
    relatedGuideSlugs: ['how-to-study-in-usa-from-india', 'education-loan-for-study-abroad', 'us-f1-student-visa-guide'],
    sources: [
      { label: 'EducationUSA — official U.S. Department of State network', url: 'https://educationusa.state.gov' },
    ],
    lastVerified: VERIFY,
    keywords: ['cost of studying in usa for indians', 'cost of studying in usa', 'usa study expenses', 'cost of attendance usa', 'study in usa budget'],
  },
  {
    slug: 'part-time-jobs-for-international-students',
    category: 'study-abroad',
    region: 'india',
    titleEn: 'Part-Time Jobs for International Students',
    titleHi: 'अंतरराष्ट्रीय छात्रों के लिए अंशकालिक नौकरियाँ',
    descriptionEn:
      'How part-time work for international students generally works, why the rules differ by country, and where to verify them — neutral official facts only, not immigration advice.',
    descriptionHi:
      'अंतरराष्ट्रीय छात्रों के लिए अंशकालिक कार्य आमतौर पर कैसे होता है, नियम देश के अनुसार क्यों भिन्न होते हैं, और उन्हें कहाँ सत्यापित करें — केवल निष्पक्ष आधिकारिक तथ्य, आव्रजन सलाह नहीं।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Work rules depend on the country and visa',
        headingHi: 'कार्य नियम देश और वीज़ा पर निर्भर करते हैं',
        bodyEn:
          'Many countries allow international students to work part-time during their studies, but the rules — including any limit on hours, where you can work, and what permission you need — are set by each government and attached to your visa. They differ by country and change over time, so treat the rules as something to verify, not assume.',
      },
      {
        headingEn: 'Common patterns (verify each officially)',
        bodyEn:
          'Some countries allow a set number of working hours during term and more during official breaks; some restrict on-campus versus off-campus work; and some require specific authorisation. Because the exact conditions are official immigration rules that change, confirm them on the destination\'s official government source before working.',
        bullets: [
          'Possible limits on hours during term vs breaks',
          'On-campus vs off-campus restrictions',
          'Any authorisation or eligibility conditions',
        ],
      },
      {
        headingEn: 'Why following the rules matters',
        bodyEn:
          'Working beyond what your visa permits can have serious consequences for your student status. This guide is general information, not immigration advice, so always rely on the official government source for your destination and, if unsure, qualified guidance.',
      },
      {
        headingEn: 'Where to check',
        bodyEn:
          'Use the official immigration website of your destination country and your university\'s international-student office for the current, exact rules that apply to your visa and situation.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can international students work part-time?',
        answerEn:
          'Many countries allow it during studies, but the rules — including any hour limits and permissions — are set by each government and attached to your visa. Verify the current rules on the destination\'s official source.',
      },
      {
        questionEn: 'How many hours can I work as a student?',
        answerEn:
          'It varies by country and visa and changes over time, so this guide does not state a number. Check the official immigration source for your destination.',
      },
      {
        questionEn: 'What happens if I work more than allowed?',
        answerEn:
          'Working beyond what your visa permits can seriously affect your student status. Always follow the official rules and seek qualified guidance if unsure.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['post-study-work-options-by-country', 'how-to-study-in-usa-from-india', 'us-f1-student-visa-guide'],
    sources: [
      { label: 'U.S. DHS — Study in the States (official)', url: 'https://studyinthestates.dhs.gov' },
      { label: 'GOV.UK — Student visa (official)', url: 'https://www.gov.uk/student-visa' },
    ],
    lastVerified: VERIFY,
    keywords: ['part time jobs for international students', 'student work hours abroad', 'can international students work', 'part time work study abroad', 'student visa work rules'],
  },
  {
    slug: 'post-study-work-options-by-country',
    category: 'study-abroad',
    region: 'india',
    titleEn: 'Post-Study Work Options by Country',
    titleHi: 'देश के अनुसार अध्ययन-पश्चात कार्य विकल्प',
    descriptionEn:
      'An overview of how post-study work routes generally work across popular destinations and why you must check the official rules — neutral official facts only, not immigration advice.',
    descriptionHi:
      'लोकप्रिय गंतव्यों में अध्ययन-पश्चात कार्य मार्ग आमतौर पर कैसे काम करते हैं और आपको आधिकारिक नियम क्यों जाँचने चाहिए इसका अवलोकन — केवल निष्पक्ष आधिकारिक तथ्य, आव्रजन सलाह नहीं।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What post-study work routes are',
        headingHi: 'अध्ययन-पश्चात कार्य मार्ग क्या हैं',
        bodyEn:
          'Several countries offer a way for international graduates to stay and work for a period after completing their studies, often through a named scheme tied to the student visa. These routes, their eligibility, and their duration are set by each government and change frequently, so they must be checked on official sources rather than assumed.',
      },
      {
        headingEn: 'Named schemes differ by country (verify each)',
        bodyEn:
          'Popular destinations have their own official post-study work routes — for example, schemes associated with the United States, the United Kingdom, Canada, Australia, and others. The names, eligibility, and length of these routes vary and are revised periodically, so this guide does not state durations or conditions.',
        bullets: [
          'Each country has its own named route and rules',
          'Eligibility and duration change over time',
          'Always confirm on the official government source',
        ],
      },
      {
        headingEn: 'Why this matters for planning',
        bodyEn:
          'Post-study work rules can influence where you choose to study, so it helps to understand them early — but only from official sources, because outdated information is common online. This guide is general information, not immigration advice.',
      },
      {
        headingEn: 'Where to check',
        bodyEn:
          'Use the official immigration website of each destination country for the current post-study work route, its eligibility, and its duration, and your university\'s international office for support.',
      },
    ],
    faqs: [
      {
        questionEn: 'Can I work in the country after I graduate?',
        answerEn:
          'Several countries offer a post-study work route for international graduates, usually through a named scheme. Eligibility and duration vary by country and change, so verify the current rules on the official government source.',
      },
      {
        questionEn: 'How long can I stay to work after studying?',
        answerEn:
          'It depends entirely on the country and its current scheme, which change over time. This guide does not state durations — check the official immigration source for your destination.',
      },
      {
        questionEn: 'Do post-study work rules change?',
        answerEn:
          'Yes, frequently. Because of this, rely only on official government sources for the current eligibility and duration, not on older summaries.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['part-time-jobs-for-international-students', 'how-to-study-in-usa-from-india', 'us-f1-student-visa-guide'],
    sources: [
      { label: 'GOV.UK — official UK Government site', url: 'https://www.gov.uk' },
      { label: 'Government of Canada (IRCC) — official site', url: 'https://www.canada.ca' },
    ],
    lastVerified: VERIFY,
    keywords: ['post study work options', 'post study work visa by country', 'work after studying abroad', 'stay back option after study', 'post study work permit'],
  },
  // ───────────────────────────── Set 19 — Emerging tech ──────────────────────
  {
    slug: 'data-science-courses-in-india',
    category: 'career',
    region: 'india',
    titleEn: 'Data Science Courses in India',
    titleHi: 'भारत में डेटा साइंस कोर्स',
    descriptionEn:
      'What data science is, the kinds of courses available in India, the skills involved, and where it can lead — a factual overview with no rankings or salary claims.',
    descriptionHi:
      'डेटा साइंस क्या है, भारत में किस प्रकार के कोर्स उपलब्ध हैं, इसमें कौन-से कौशल शामिल हैं, और यह कहाँ ले जा सकता है — एक तथ्यात्मक अवलोकन, बिना रैंकिंग या वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What data science is',
        headingHi: 'डेटा साइंस क्या है',
        bodyEn:
          'Data science combines statistics, programming, and domain knowledge to draw useful insights from data, and overlaps with machine learning. It is studied both as a focused degree and as a specialisation within computer science or statistics programmes.',
      },
      {
        headingEn: 'Types of courses in India',
        bodyEn:
          'Options range from full degrees (such as a B.Tech or B.Sc with a data-science focus) to postgraduate programmes and shorter certificate courses, including online programmes offered by universities and institutes. Recognition and curriculum vary, so check that a degree programme is recognised by the relevant authority and read its official syllabus.',
        bullets: [
          'Degrees (B.Tech / B.Sc and postgraduate programmes)',
          'University and institute certificate courses, including online',
          'Data-science specialisations within CS or statistics degrees',
        ],
      },
      {
        headingEn: 'Skills you build',
        bodyEn:
          'Most paths develop a mix of mathematics and statistics, programming, data handling, and machine learning, along with the ability to communicate findings. Practical projects and a portfolio often matter as much as the course title.',
      },
      {
        headingEn: 'Where it can lead',
        bodyEn:
          'Data-science skills are used across many industries in roles spanning analysis, modelling, and engineering. The field evolves quickly, so continuous learning helps. This guide does not rank programmes or quote earnings — verify course details on official sources.',
      },
    ],
    faqs: [
      {
        questionEn: 'Do I need a specific degree for data science?',
        answerEn:
          'No single degree is required. People enter from computer science, statistics, mathematics, and other backgrounds, through degrees, specialisations, or certificate courses. Skills and projects matter alongside the qualification.',
      },
      {
        questionEn: 'Are online data-science courses useful?',
        answerEn:
          'They can be, but recognition and quality vary. For a degree, check that the programme is recognised by the relevant authority; for certificates, look at the curriculum and what you will actually build.',
      },
      {
        questionEn: 'Is data science the same as machine learning?',
        answerEn:
          'They overlap but are not identical — data science is broader (including statistics and data handling), while machine learning is a set of techniques often used within it.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'gate'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-madras'],
    relatedGuideSlugs: ['ai-courses-in-india', 'btech-cse-vs-data-science', 'computer-science-engineering-overview'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['data science courses in india', 'data science degree india', 'how to learn data science', 'data science career india', 'data science course details'],
  },
  {
    slug: 'ai-courses-in-india',
    category: 'career',
    region: 'india',
    titleEn: 'AI Courses in India',
    titleHi: 'भारत में एआई कोर्स',
    descriptionEn:
      'What artificial intelligence courses cover, the options available in India, the skills involved, and where the field can lead — a factual overview with no rankings or salary claims.',
    descriptionHi:
      'आर्टिफिशियल इंटेलिजेंस कोर्स में क्या शामिल है, भारत में उपलब्ध विकल्प, कौशल, और यह क्षेत्र कहाँ ले जा सकता है — एक तथ्यात्मक अवलोकन, बिना रैंकिंग या वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What AI courses cover',
        headingHi: 'एआई कोर्स क्या कवर करते हैं',
        bodyEn:
          'Artificial intelligence (AI) courses cover how machines can perform tasks such as learning, reasoning, and perception, with machine learning at the core. They combine mathematics, programming, and the study of models and their applications.',
      },
      {
        headingEn: 'Options available in India',
        bodyEn:
          'AI can be studied through dedicated B.Tech or postgraduate programmes, as a specialisation within computer science, or through university and institute certificate courses, including online ones. Recognition and depth vary, so check that a degree is recognised by the relevant authority and review its official curriculum.',
        bullets: [
          'B.Tech / postgraduate programmes in AI or ML',
          'AI specialisations within computer science degrees',
          'University and institute certificate courses, including online',
        ],
      },
      {
        headingEn: 'Skills you build',
        bodyEn:
          'AI study typically develops mathematics (such as linear algebra, probability, and calculus), programming, and an understanding of machine-learning models and how to apply them responsibly. Hands-on projects help turn theory into capability.',
      },
      {
        headingEn: 'Where the field is heading',
        bodyEn:
          'AI is used across many industries and continues to evolve quickly, so ongoing learning is part of the field. This guide does not rank courses or quote earnings — confirm programme details and recognition on official sources.',
      },
    ],
    faqs: [
      {
        questionEn: 'What should I study for a career in AI?',
        answerEn:
          'A foundation in mathematics and programming, plus machine learning, is common. You can build this through a degree, an AI specialisation, or certificate courses — what matters is genuine skill and projects.',
      },
      {
        questionEn: 'Do I need a B.Tech to work in AI?',
        answerEn:
          'Not necessarily. People enter AI from computer science, mathematics, statistics, and other backgrounds. Check the recognition and curriculum of any programme you consider.',
      },
      {
        questionEn: 'Are online AI courses worthwhile?',
        answerEn:
          'They can be, but quality and recognition vary. For degrees, confirm official recognition; for certificates, focus on the curriculum and what you will be able to build.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'gate'],
    relatedCollegeSlugs: ['iit-bombay'],
    relatedGuideSlugs: ['data-science-courses-in-india', 'cyber-security-career-guide', 'computer-science-engineering-overview'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['ai courses in india', 'artificial intelligence course india', 'how to learn ai', 'ai career india', 'machine learning courses india'],
  },
  {
    slug: 'cyber-security-career-guide',
    category: 'career',
    region: 'india',
    titleEn: 'Cyber Security Career Guide',
    titleHi: 'साइबर सुरक्षा करियर मार्गदर्शिका',
    descriptionEn:
      'What a career in cyber security involves, the courses and skills that help, and the kinds of roles in the field — a factual, ethics-first overview with no salary claims.',
    descriptionHi:
      'साइबर सुरक्षा में करियर में क्या शामिल है, कौन-से कोर्स और कौशल मदद करते हैं, और इस क्षेत्र में किस प्रकार की भूमिकाएँ हैं — एक तथ्यात्मक, नैतिकता-प्रथम अवलोकन, बिना वेतन के दावों के।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'What cyber security is',
        headingHi: 'साइबर सुरक्षा क्या है',
        bodyEn:
          'Cyber security is the practice of protecting systems, networks, and data from attacks and unauthorised access. It is a defensive, protective field — the goal is to keep people and organisations safe, and all legitimate work in it is done lawfully and with proper authorisation.',
      },
      {
        headingEn: 'Courses and skills that help',
        bodyEn:
          'Useful foundations include computer networks, operating systems, and programming, on top of which you build security-specific knowledge. People enter from computer-science degrees, dedicated cyber-security programmes, and recognised professional certifications. Practical, hands-on practice in lawful, authorised settings (such as labs and approved exercises) is valuable.',
        bullets: [
          'Foundations: networks, operating systems, programming',
          'Security degrees or specialisations, and recognised certifications',
          'Hands-on practice in lawful, authorised environments only',
        ],
      },
      {
        headingEn: 'Roles in the field',
        bodyEn:
          'The field includes roles such as security analyst, security operations (SOC) analyst, security engineer, and governance, risk, and compliance (GRC), among others. Activities like penetration testing are carried out only with explicit authorisation, as part of protecting an organisation.',
      },
      {
        headingEn: 'How to get started',
        bodyEn:
          'Build strong fundamentals, practise ethically in authorised settings, and consider recognised courses or certifications. This guide describes the field and careers only, makes no earnings claims, and does not provide any instructions for unauthorised access.',
      },
    ],
    faqs: [
      {
        questionEn: 'What do I need to start a cyber security career?',
        answerEn:
          'A foundation in networks, operating systems, and programming, plus security-specific knowledge from a degree, specialisation, or recognised certification. Lawful, hands-on practice in authorised settings helps.',
      },
      {
        questionEn: 'Is ethical hacking a real career?',
        answerEn:
          'Yes — security testing such as penetration testing is a legitimate role, but it is always done with explicit authorisation as part of protecting an organisation. Unauthorised access is illegal.',
      },
      {
        questionEn: 'Do I need a specific degree for cyber security?',
        answerEn:
          'No single degree is required. People enter from computer science, dedicated security programmes, and certifications. Skills and lawful, hands-on experience matter alongside qualifications.',
      },
    ],
    relatedExamSlugs: ['jee-main'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['ai-courses-in-india', 'data-science-courses-in-india', 'computer-science-engineering-overview'],
    sources: [
      { label: 'Ministry of Electronics and Information Technology (MeitY) — houses CERT-In', url: 'https://www.meity.gov.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['cyber security career', 'cyber security course india', 'how to become a cyber security expert', 'ethical hacking career', 'cybersecurity jobs india'],
  },
  {
    slug: 'btech-cse-vs-data-science',
    category: 'comparison',
    region: 'india',
    titleEn: 'B.Tech CSE vs Data Science: Which to Choose?',
    titleHi: 'बीटेक सीएसई बनाम डेटा साइंस: कौन-सा चुनें?',
    descriptionEn:
      'A neutral comparison of B.Tech Computer Science and a data-science focus — what each emphasises, how they overlap, and how to decide based on your interests.',
    descriptionHi:
      'बीटेक कंप्यूटर साइंस और डेटा साइंस फोकस की निष्पक्ष तुलना — प्रत्येक किस पर ज़ोर देता है, ये कैसे ओवरलैप करते हैं, और अपनी रुचि के आधार पर कैसे तय करें।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Related fields with different emphasis',
        headingHi: 'अलग ज़ोर वाले संबंधित क्षेत्र',
        bodyEn:
          'Computer Science Engineering (CSE) is a broad discipline covering programming, systems, algorithms, networks, and more, while a data-science focus concentrates on statistics, data handling, and machine learning. They overlap a great deal — data science builds on computing — and neither is universally better.',
      },
      {
        headingEn: 'What each emphasises',
        bodyEn:
          'CSE gives a wide foundation across computing, keeping many doors open including data science later. A dedicated data-science programme goes deeper into statistics and machine learning earlier, but may cover less of the broader computer-science core. Curricula vary, so compare the official syllabi.',
        bullets: [
          'CSE — broad computing foundation, flexible',
          'Data science — earlier, deeper focus on data and ML',
          'Significant overlap; curricula differ by university',
        ],
      },
      {
        headingEn: 'How to choose',
        bodyEn:
          'If you want a broad base and flexibility, CSE is a common choice; if you are already sure you want to specialise in data and machine learning, a data-science programme may suit you. You can also reach data science through CSE. Decide on interest and the specific programme rather than on which sounds more current.',
      },
      {
        headingEn: 'Look at the programme, not just the name',
        bodyEn:
          'Two programmes with the same title can differ, so read the official curriculum, electives, and project opportunities. This guide does not rank the options or quote outcomes — fit matters more than the label.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is data science better than CSE?',
        answerEn:
          'Neither is universally better. CSE is broader and flexible; a data-science programme specialises earlier. The right choice depends on your interests and the specific programme.',
      },
      {
        questionEn: 'Can I do data science after a CSE degree?',
        answerEn:
          'Yes. CSE provides a strong computing base, and many people move into data science through electives, projects, or further study after CSE.',
      },
      {
        questionEn: 'Do both lead to similar careers?',
        answerEn:
          'There is significant overlap, though a data-science focus leans towards data and machine-learning roles. Compare the official curricula and the kind of work each path emphasises.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'iit-delhi'],
    relatedGuideSlugs: ['computer-science-engineering-overview', 'data-science-courses-in-india', 'best-engineering-branches'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['btech cse vs data science', 'cse or data science', 'computer science vs data science', 'data science vs cse which is better', 'cse vs data science degree'],
  },
  {
    slug: 'online-degree-vs-regular-degree',
    category: 'comparison',
    region: 'india',
    titleEn: 'Online Degree vs Regular Degree',
    titleHi: 'ऑनलाइन डिग्री बनाम नियमित डिग्री',
    descriptionEn:
      'A neutral comparison of online and regular (on-campus) degrees — how they differ, why recognition matters, and how to decide — with recognition treated as an official fact to verify.',
    descriptionHi:
      'ऑनलाइन और नियमित (ऑन-कैंपस) डिग्री की निष्पक्ष तुलना — ये कैसे भिन्न हैं, मान्यता क्यों मायने रखती है, और कैसे तय करें — मान्यता को सत्यापित करने योग्य आधिकारिक तथ्य के रूप में।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'Two modes of study',
        headingHi: 'अध्ययन के दो तरीके',
        bodyEn:
          'A regular degree is studied on campus, while an online degree is delivered remotely. Both can be valid routes to a qualification, and the better choice depends on your circumstances, the subject, and — crucially — whether the programme is properly recognised.',
      },
      {
        headingEn: 'Why recognition matters most',
        bodyEn:
          'In India, the University Grants Commission (UGC) regulates higher education, and under its regulations a UGC-recognised online degree from an entitled university is treated as equivalent to the corresponding conventional degree. Note that certain regulated professional programmes — such as medical, dental, pharmacy, law, and most undergraduate engineering degrees — are generally not permitted in online mode under current UGC and AICTE rules. Recognition varies by university and programme, so the single most important step is to verify a programme\'s recognition and permissibility on the official UGC source before enrolling.',
      },
      {
        headingEn: 'How they differ in practice',
        bodyEn:
          'Online study offers flexibility and is often suited to working students or those who cannot relocate, while on-campus study offers in-person interaction, facilities, and campus life. Some hands-on or lab-based subjects suit on-campus study better. Consider what the subject needs and how you learn best.',
        bullets: [
          'Online — flexible, location-independent',
          'On-campus — in-person interaction, facilities, campus life',
          'Some practical subjects suit on-campus study better',
        ],
      },
      {
        headingEn: 'How to choose',
        bodyEn:
          'First confirm the programme is recognised; then weigh flexibility against the in-person experience for your subject and situation. Neither mode is universally better — decide on recognition, fit, and your circumstances rather than assumptions.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is an online degree valid in India?',
        answerEn:
          'A UGC-recognised online degree from an entitled university is, under UGC regulations, treated as equivalent to the corresponding conventional degree. However, regulated professional programmes (such as medical, dental, pharmacy, law, and most undergraduate engineering) are generally not permitted in online mode. Recognition varies, so verify the specific programme on the official UGC source.',
      },
      {
        questionEn: 'Is an online degree as good as a regular one?',
        answerEn:
          'Neither is universally better. What matters most is recognition, followed by fit with your subject and circumstances. Some practical subjects suit on-campus study more.',
      },
      {
        questionEn: 'How do I check if an online degree is recognised?',
        answerEn:
          'Verify the university\'s entitlement and the programme\'s recognition on the official UGC source before enrolling, since recognition varies by university and programme.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['btech-vs-bsc-which-to-choose', 'data-science-courses-in-india', 'how-to-choose-a-university-abroad'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['online degree vs regular degree', 'is online degree valid', 'online vs offline degree', 'ugc online degree', 'online degree recognition india'],
  },
  // ─────────────────────── Set 20 — Decision guides (evergreen) ──────────────
  {
    slug: 'private-vs-government-college-india',
    category: 'comparison',
    region: 'india',
    titleEn: 'Private vs Government College in India',
    titleHi: 'भारत में निजी बनाम सरकारी कॉलेज',
    descriptionEn:
      'A neutral comparison of private and government colleges in India — how they tend to differ, what actually matters, and how to decide — without declaring either type better.',
    descriptionHi:
      'भारत में निजी और सरकारी कॉलेजों की निष्पक्ष तुलना — ये आमतौर पर कैसे भिन्न होते हैं, वास्तव में क्या मायने रखता है, और कैसे तय करें — बिना किसी प्रकार को बेहतर बताए।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Two broad categories, wide variation',
        headingHi: 'दो व्यापक श्रेणियाँ, व्यापक भिन्नता',
        bodyEn:
          'Government (public) colleges are funded and run with government support, while private colleges are run by private trusts or societies. Both categories include strong and weaker institutions, so the type alone does not determine quality — there is wide variation within each.',
      },
      {
        headingEn: 'How they tend to differ',
        bodyEn:
          'Government colleges often have lower fees and long-established reputations, while private colleges vary widely in fees, facilities, and focus. Rather than generalising, compare the specific colleges you are considering on factors you can verify officially.',
        bullets: [
          'Fees and funding structure',
          'Recognition and accreditation (e.g. UGC, AICTE, NAAC/NBA)',
          'Programmes, faculty, and facilities',
          'Location and the specific course you want',
        ],
      },
      {
        headingEn: 'What actually matters',
        bodyEn:
          'For any college, the most important checks are that it is recognised by the relevant authority, that your programme is accredited where applicable, and that it fits your goals and budget. A recognised, well-matched college matters more than the private-versus-government label.',
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'Shortlist specific colleges, verify their recognition and programme details on official sources, and weigh fees, fit, and your circumstances. This guide does not declare either type better or disparage any institution — the right choice is the one that fits you.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is a government college better than a private one?',
        answerEn:
          'Neither type is universally better — both include strong and weaker institutions. Compare specific colleges on recognition, accreditation, fees, and fit rather than on the label.',
      },
      {
        questionEn: 'What should I check before choosing a college?',
        answerEn:
          'Check that the college is recognised by the relevant authority, that your programme is accredited where applicable, and that the fees, location, and course fit your goals — all verifiable on official sources.',
      },
      {
        questionEn: 'Are private colleges always more expensive?',
        answerEn:
          'Fees vary widely in both categories, though government colleges often have lower fees. Compare the actual published fees of the specific colleges you are considering.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'neet-ug'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-choose-engineering-college', 'deemed-vs-state-university', 'iit-vs-nit-which-is-better'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['private vs government college', 'government vs private college india', 'which is better private or government college', 'choosing private or government college', 'private college vs sarkari college'],
  },
  {
    slug: 'study-in-india-vs-abroad',
    category: 'comparison',
    region: 'india',
    titleEn: 'Study in India vs Abroad: How to Decide',
    titleHi: 'भारत बनाम विदेश में पढ़ाई: कैसे तय करें',
    descriptionEn:
      'A neutral framework for deciding between studying in India and studying abroad — the factors that matter and how to weigh them for your situation, with no claims that one is better.',
    descriptionHi:
      'भारत में पढ़ाई और विदेश में पढ़ाई के बीच निर्णय लेने का निष्पक्ष ढाँचा — कौन-से कारक मायने रखते हैं और अपनी स्थिति के लिए उन्हें कैसे तौलें, बिना यह दावा किए कि कोई एक बेहतर है।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'There is no single right answer',
        headingHi: 'कोई एक सही उत्तर नहीं है',
        bodyEn:
          'Both India and other countries offer strong options, and the better choice depends entirely on your goals, subject, finances, and circumstances. Rather than asking which is "better" in general, ask which fits you for this specific decision.',
      },
      {
        headingEn: 'Factors to weigh',
        bodyEn:
          'Consider the things that genuinely differ and matter to you, and verify each on official sources rather than anecdotes.',
        bullets: [
          'Total cost (tuition + living) and funding options',
          'The specific programmes and their strengths',
          'Visa, work, and post-study rules abroad (official sources)',
          'Distance from home, support, and your circumstances',
        ],
      },
      {
        headingEn: 'Be realistic about cost and logistics',
        bodyEn:
          'Studying abroad usually involves higher costs and a visa process, while studying in India avoids those but has its own competitive admissions. Look at the full picture — including funding and the net cost — rather than the headline appeal of any option.',
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'Define your goals and budget first, then compare specific programmes (in India and abroad) against them using official information. This guide does not claim either option is better or quote outcomes — the right path is personal.',
      },
    ],
    faqs: [
      {
        questionEn: 'Is studying abroad better than studying in India?',
        answerEn:
          'Neither is universally better. Both offer strong options, and the right choice depends on your goals, subject, finances, and circumstances. Compare specific programmes against your own priorities.',
      },
      {
        questionEn: 'Is studying abroad always more expensive?',
        answerEn:
          'It often involves higher tuition and living costs plus a visa process, but funding can change the net cost. Look at the full, official figures for the specific programmes you are comparing.',
      },
      {
        questionEn: 'How do I choose between India and abroad?',
        answerEn:
          'Start from your goals and budget, then compare specific programmes in each on cost, strengths, and (for abroad) visa and work rules from official sources.',
      },
    ],
    relatedExamSlugs: ['ielts'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-study-in-usa-from-india', 'how-to-choose-a-university-abroad', 'private-vs-government-college-india'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
      { label: 'EducationUSA — official U.S. Department of State network', url: 'https://educationusa.state.gov' },
    ],
    lastVerified: VERIFY,
    keywords: ['study in india vs abroad', 'india or abroad for studies', 'should i study abroad or in india', 'study abroad vs india', 'india vs abroad education'],
  },
  {
    slug: 'drop-year-for-jee-neet-worth-it',
    category: 'comparison',
    region: 'india',
    titleEn: 'Is a Drop Year for JEE/NEET Worth It?',
    titleHi: 'क्या जेईई/नीट के लिए ड्रॉप ईयर सही है?',
    descriptionEn:
      'A balanced look at taking a drop year to reattempt JEE or NEET — what to weigh, and why there are no guarantees — to help you make your own informed decision.',
    descriptionHi:
      'जेईई या नीट दोबारा देने के लिए ड्रॉप ईयर लेने पर एक संतुलित दृष्टि — क्या तौलें, और क्यों कोई गारंटी नहीं है — ताकि आप अपना सूचित निर्णय ले सकें।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'A personal decision, not a formula',
        headingHi: 'एक व्यक्तिगत निर्णय, कोई सूत्र नहीं',
        bodyEn:
          'Taking a year to reattempt JEE or NEET is a common but deeply personal choice. It can give focused time to improve, but it is not a guaranteed path to a better result, and what works for one student may not work for another. The aim of this guide is to help you weigh it honestly, not to push you either way.',
      },
      {
        headingEn: 'What a drop year can offer',
        bodyEn:
          'A focused year can allow you to strengthen weak areas, get used to the exam, and attempt again with more preparation. For some students, this leads to a meaningful improvement — though never a certain one.',
      },
      {
        headingEn: 'What to weigh honestly',
        bodyEn:
          'Set against the potential upside are real considerations: there is no guarantee your result will improve, you delay your next step by a year, and a long preparation year can be demanding. Think about your motivation, your plan to improve, alternative options, and your well-being.',
        bullets: [
          'No guaranteed improvement in rank or score',
          'The opportunity cost of a year',
          'Your motivation and a concrete plan to do better',
          'Backup options and your mental well-being',
        ],
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'Be honest about why your earlier attempt fell short and whether a year would realistically change that, and consider all your options — including other courses and exams — rather than treating a drop year as the only path. If the pressure feels overwhelming, talk to people you trust. This guide does not promise any outcome.',
      },
    ],
    faqs: [
      {
        questionEn: 'Does a drop year guarantee a better rank?',
        answerEn:
          'No. A focused year can help some students improve, but there is no guarantee of a better rank or score. Be cautious of anyone promising guaranteed results.',
      },
      {
        questionEn: 'Is taking a drop year a bad idea?',
        answerEn:
          'It is neither universally good nor bad — it depends on your situation, motivation, and a realistic plan to improve. Weigh the potential upside against the opportunity cost and your well-being.',
      },
      {
        questionEn: 'What are the alternatives to a drop year?',
        answerEn:
          'Alternatives include joining a course you have qualified for, exploring other exams or fields, or combining study with another path. Consider all options before deciding.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'neet-ug'],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['how-to-get-into-iit', 'how-to-become-a-doctor-in-india', 'how-to-choose-engineering-college'],
    sources: [
      { label: 'NTA — JEE Main official site', url: 'https://jeemain.nta.nic.in' },
      { label: 'NTA — NEET UG official site', url: 'https://neet.nta.nic.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['drop year for jee neet', 'is a drop year worth it', 'jee neet drop year', 'should i take a drop year', 'drop year preparation'],
  },
  {
    slug: 'how-to-choose-engineering-college',
    category: 'admissions',
    region: 'india',
    titleEn: 'How to Choose an Engineering College',
    titleHi: 'इंजीनियरिंग कॉलेज कैसे चुनें',
    descriptionEn:
      'A practical framework for choosing an engineering college in India — the factors that matter, how to verify them officially, and why the branch-and-college fit beats rankings alone.',
    descriptionHi:
      'भारत में इंजीनियरिंग कॉलेज चुनने के लिए एक व्यावहारिक ढाँचा — कौन-से कारक मायने रखते हैं, उन्हें आधिकारिक रूप से कैसे सत्यापित करें, और शाखा-व-कॉलेज की उपयुक्तता केवल रैंकिंग से बेहतर क्यों है।',
    readMinutes: 6,
    sections: [
      {
        headingEn: 'Look beyond the ranking number',
        headingHi: 'केवल रैंकिंग संख्या से आगे देखें',
        bodyEn:
          'Rankings can be one input, but choosing an engineering college well means looking at several factors together. The combination of the right branch at the right college usually matters more than a single ranking position.',
      },
      {
        headingEn: 'Factors that matter',
        bodyEn:
          'Weigh the things you can verify officially, and check accreditation and recognition before anything else.',
        bullets: [
          'Recognition (AICTE/UGC) and accreditation (NBA/NAAC)',
          'The branch you want and its curriculum',
          'Fees, location, and admission route (JEE or state/university test)',
          'Facilities and the overall branch-and-college fit',
        ],
      },
      {
        headingEn: 'How to research and verify',
        bodyEn:
          'Use official college and admission websites for requirements, fees, and accreditation status, and recognised bodies only for their own rankings. Be wary of marketing claims and unofficial "top college" lists that cannot be verified.',
      },
      {
        headingEn: 'Make a balanced shortlist',
        bodyEn:
          'Shortlist colleges across a range that matches your expected rank and budget, so you have realistic options during counselling or admissions. This guide does not rank colleges or quote placements — base your decision on verified fit, not reputation alone.',
      },
    ],
    faqs: [
      {
        questionEn: 'Should I choose an engineering college only by ranking?',
        answerEn:
          'No. Rankings are one input; recognition, accreditation, your branch, fees, and the branch-and-college fit usually matter more. Verify these on official sources.',
      },
      {
        questionEn: 'How do I check if an engineering college is recognised?',
        answerEn:
          'Check its recognition (AICTE/UGC) and accreditation (NBA/NAAC) on official sources before applying, rather than relying on marketing or unofficial lists.',
      },
      {
        questionEn: 'Is the branch or the college more important?',
        answerEn:
          'Both matter, and the combination usually matters most. Weigh the specific branch-and-college pairing against your interests and verified information.',
      },
    ],
    relatedExamSlugs: ['jee-main', 'jee-advanced'],
    relatedCollegeSlugs: ['iit-bombay', 'nit-trichy'],
    relatedGuideSlugs: ['best-engineering-branches', 'private-vs-government-college-india', 'deemed-vs-state-university'],
    sources: [
      { label: 'AICTE — All India Council for Technical Education', url: 'https://www.aicte.gov.in' },
      { label: 'NAAC — National Assessment and Accreditation Council (official)', url: 'https://www.naac.gov.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['how to choose engineering college', 'choosing engineering college', 'how to select engineering college', 'engineering college selection', 'best engineering college for me'],
  },
  {
    slug: 'deemed-vs-state-university',
    category: 'comparison',
    region: 'india',
    titleEn: 'Deemed University vs State University',
    titleHi: 'डीम्ड विश्वविद्यालय बनाम राज्य विश्वविद्यालय',
    descriptionEn:
      'A neutral explainer of what "deemed-to-be-university" and "state university" mean in India, how they differ, and why recognition matters more than the label.',
    descriptionHi:
      'भारत में "डीम्ड-टू-बी-यूनिवर्सिटी" और "राज्य विश्वविद्यालय" का क्या अर्थ है, ये कैसे भिन्न हैं, और मान्यता लेबल से अधिक क्यों मायने रखती है, इसका निष्पक्ष विवरण।',
    readMinutes: 5,
    sections: [
      {
        headingEn: 'What the terms mean',
        headingHi: 'इन शब्दों का अर्थ',
        bodyEn:
          'A state university is established by a state legislature through an Act. A deemed-to-be-university is an institution granted that status by the central government, on the advice of the University Grants Commission (UGC), under the UGC Act. Both can award their own degrees within the rules that apply to them.',
      },
      {
        headingEn: 'How they differ',
        bodyEn:
          'The main differences are in how they are established and governed. These can affect aspects such as autonomy and the range of programmes, but they do not by themselves indicate quality, which varies within both categories.',
        bullets: [
          'State university — established by a state legislature Act',
          'Deemed-to-be-university — granted status by the central government via UGC',
          'Both award recognised degrees within their applicable rules',
        ],
      },
      {
        headingEn: 'Recognition matters more than the label',
        bodyEn:
          'For a student, the practical questions are whether the institution and your programme are recognised and accredited, and whether they fit your goals — not simply whether it is "deemed" or "state". Verify recognition and accreditation on the official UGC source.',
      },
      {
        headingEn: 'How to decide',
        bodyEn:
          'Compare the specific institutions and programmes you are considering on recognition, accreditation, fees, and fit, using official information. This guide does not declare either category better or disparage any institution.',
      },
    ],
    faqs: [
      {
        questionEn: 'What is a deemed university?',
        answerEn:
          'A deemed-to-be-university is an institution granted that status by the central government, on the advice of the UGC, under the UGC Act. It can award its own degrees within the applicable rules.',
      },
      {
        questionEn: 'Is a deemed university better than a state university?',
        answerEn:
          'Neither is universally better — quality varies within both. What matters more is whether the institution and your programme are recognised and accredited and fit your goals.',
      },
      {
        questionEn: 'How do I verify a university\'s status?',
        answerEn:
          'Check the institution\'s recognition and accreditation on the official UGC source before enrolling, rather than relying on the label or marketing.',
      },
    ],
    relatedExamSlugs: [],
    relatedCollegeSlugs: [],
    relatedGuideSlugs: ['private-vs-government-college-india', 'how-to-choose-engineering-college', 'online-degree-vs-regular-degree'],
    sources: [
      { label: 'University Grants Commission (UGC) — official site', url: 'https://www.ugc.gov.in' },
      { label: 'UGC — Deemed Universities portal (official)', url: 'https://deemed.ugc.ac.in' },
    ],
    lastVerified: VERIFY,
    keywords: ['deemed vs state university', 'deemed university meaning', 'deemed university vs state university', 'what is a deemed university', 'types of universities india'],
  },
];

export const getGuideBySlug = (slug: string): Guide | undefined =>
  GUIDES.find((g) => g.slug === slug);

export const getGuidesByRegion = (region: RegionSlug): Guide[] =>
  GUIDES.filter((g) => g.region === region);

export const GUIDE_CATEGORY_LABELS: Record<GuideCategory, string> = {
  'exam-prep': 'Exam prep',
  admissions: 'Admissions',
  'study-abroad': 'Study abroad',
  career: 'Career',
  comparison: 'Comparison',
  scholarships: 'Scholarships',
};
