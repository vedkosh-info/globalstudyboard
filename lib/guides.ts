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
