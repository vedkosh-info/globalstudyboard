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
  | 'study-in-europe' // Europe destination hubs (shown only when the Europe region is selected)
  | 'study-in-middle-east' // Middle East (Gulf) destination hubs (shown only when that region is selected)
  | 'study-in-russia-cis' // Russia & CIS destination hubs (shown only when that region is selected)
  | 'study-in-uk-ireland' // UK & Ireland destination hubs (shown only when that region is selected)
  | 'prep-funding'; // exam strategy + scholarships

export const TOPIC_GROUP_LABELS: Record<TopicGroup, string> = {
  exams: 'Entrance & Competitive Exams',
  fields: 'Fields & Careers',
  'after-12th': 'After 12th',
  'study-abroad': 'Study Abroad',
  'study-in-usa': 'Study in the USA',
  'study-in-canada': 'Study in Canada',
  'study-in-australia-nz': 'Study in Australia & NZ',
  'study-in-europe': 'Study in Europe',
  'study-in-middle-east': 'Study in the Middle East',
  'study-in-russia-cis': 'Study in Russia & CIS',
  'study-in-uk-ireland': 'Study in the UK & Ireland',
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
{
  "slug": "russian-higher-education-system-and-degrees-explained",
  "label": "Russian Higher-Ed System",
  "title": "Russian Higher-Education System & Degrees",
  "description": "The Russian higher-education system — bachelor, specialist, master and aspirantura levels, state vs private universities, the official admission portal, and accreditation.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "russian-higher-education-degree-levels-explained",
    "specialist-degree-vs-bachelor-and-master-russia-cis",
    "state-vs-private-universities-in-russia-cis",
    "rossotrudnichestvo-admission-portal-explained-russia",
    "state-accreditation-and-diploma-recognition-russia-cis"
  ],
  "examSlugs": [],
  "keywords": [
    "russian higher-ed system",
    "russian higher education degree levels explained",
    "specialist degree vs bachelor and master russia cis",
    "state vs private universities in russia cis"
  ]
},
{
  "slug": "cis-admissions-and-application-systems-in-depth",
  "label": "CIS Admissions Systems",
  "title": "CIS Admissions & Application Systems",
  "description": "How admission works across the CIS — Kazakhstan, Kyrgyzstan, Uzbekistan and Armenia — application routes, intakes and documents, country by country.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "kazakhstan-unt-and-direct-admission-routes-explained",
    "uzbekistan-admission-system-and-branch-campus-applications",
    "armenia-university-admission-intakes-and-credential-evaluation",
    "cis-admission-document-checklist-and-timelines-compared",
    "government-quotas-and-direct-admission-in-cis-countries"
  ],
  "examSlugs": [],
  "keywords": [
    "cis admissions systems",
    "kazakhstan unt and direct admission routes explained",
    "uzbekistan admission system and branch campus applications",
    "armenia university admission intakes and credential evaluation"
  ]
},
{
  "slug": "preparatory-faculty-and-russian-foundation-year-in-depth",
  "label": "Preparatory Faculty In Depth",
  "title": "Preparatory Faculty (Podfak) In Depth",
  "description": "The preparatory faculty and foundation year in Russia and the CIS — Russian language plus subject basics, its length, who needs it and how to choose.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "what-the-preparatory-faculty-teaches-russia-cis",
    "who-needs-a-preparatory-year-before-a-russia-cis-degree",
    "preparatory-faculty-streams-medical-engineering-economics-humanities",
    "how-to-choose-a-preparatory-faculty-in-russia-cis",
    "preparatory-faculty-length-completion-and-progression-russia-cis"
  ],
  "examSlugs": [],
  "keywords": [
    "preparatory faculty in depth",
    "what the preparatory faculty teaches russia cis",
    "who needs a preparatory year before a russia cis degree",
    "preparatory faculty streams medical engineering economics humanities"
  ]
},
{
  "slug": "russian-universities-by-field-and-type-in-depth",
  "label": "Russian Universities by Field",
  "title": "Russian Universities by Field & Type",
  "description": "Russian universities by field and type — federal and national-research universities and the leading universities for engineering, IT, the sciences and medicine.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "federal-and-national-research-universities-russia-explained",
    "russian-universities-for-engineering-and-it-by-field",
    "russian-universities-for-natural-and-applied-sciences",
    "types-of-medical-universities-in-russia-cis-india-side-view",
    "reading-official-recognition-and-accreditation-russia-cis"
  ],
  "examSlugs": [],
  "keywords": [
    "russian universities by field",
    "federal and national research universities russia explained",
    "russian universities for engineering and it by field",
    "russian universities for natural and applied sciences"
  ]
},
{
  "slug": "cis-universities-by-country-in-depth",
  "label": "CIS Universities In Depth",
  "title": "CIS Universities by Country In Depth",
  "description": "The leading universities of the CIS — Kazakhstan, Kyrgyzstan, Uzbekistan and Armenia — their strengths and how to choose.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "nazarbayev-university-kazakhstan-in-depth",
    "al-farabi-kaznu-vs-nazarbayev-which-kazakh-university",
    "yerevan-state-medical-university-armenia-in-depth",
    "leading-universities-in-uzbekistan-and-kyrgyzstan-compared",
    "how-cis-universities-differ-in-academic-strengths"
  ],
  "examSlugs": [],
  "keywords": [
    "cis universities in depth",
    "nazarbayev university kazakhstan in depth",
    "al farabi kaznu vs nazarbayev which kazakh university",
    "yerevan state medical university armenia in depth"
  ]
},
{
  "slug": "how-to-verify-and-compare-russia-cis-universities",
  "label": "Verify & Compare Universities",
  "title": "Verify & Compare Universities",
  "description": "How to verify and compare Russia/CIS universities — state accreditation and recognition, official registers and the WHO directory for medical schools, and comparing by programme, language and cost.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "how-to-check-state-accreditation-russia-cis-universities",
    "verify-medical-university-who-world-directory-russia-cis",
    "compare-universities-programme-language-cost-russia-cis",
    "official-registers-and-databases-russia-cis-universities",
    "red-flags-when-verifying-a-russia-cis-university"
  ],
  "examSlugs": [],
  "keywords": [
    "verify & compare universities",
    "how to check state accreditation russia cis universities",
    "verify medical university who world directory russia cis",
    "compare universities programme language cost russia cis"
  ]
},
{
  "slug": "mbbs-abroad-india-licensing-fmge-next-in-depth",
  "label": "MBBS: India Licensing In Depth",
  "title": "MBBS Abroad: India Licensing In Depth",
  "description": "The India-side path for an MBBS done abroad — NEET, NMC guidelines, the FMGE/NExT screening, the internship and State Medical Council registration to practise in India. Deferred to NMC/NEET/NBEMS.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "neet-requirement-for-mbbs-abroad-explained",
    "nmc-eligibility-certificate-and-guidelines-for-mbbs-abroad",
    "next-replacing-fmge-what-mbbs-abroad-students-should-know",
    "compulsory-internship-rules-after-mbbs-abroad-in-india",
    "state-medical-council-registration-after-mbbs-abroad"
  ],
  "examSlugs": [
    "neet-ug"
  ],
  "keywords": [
    "mbbs: india licensing in depth",
    "neet requirement for mbbs abroad explained",
    "nmc eligibility certificate and guidelines for mbbs abroad",
    "next replacing fmge what mbbs abroad students should know"
  ]
},
{
  "slug": "verifying-and-choosing-an-mbbs-university-abroad-india-side",
  "label": "Choosing an MBBS University",
  "title": "Choosing an MBBS University Abroad",
  "description": "How an Indian student verifies and chooses a medical university abroad — the NMC framework and eligibility, official directories, a checklist, and avoiding agent and guaranteed-seat scams. India-side.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "nmc-recognised-medical-college-list-russia-cis-how-to-check",
    "questions-to-ask-before-choosing-an-mbbs-university-russia-cis",
    "red-flags-and-guaranteed-seat-scams-mbbs-russia-cis",
    "working-with-or-without-an-agent-for-mbbs-russia-cis",
    "matching-an-mbbs-university-to-your-neet-and-nmc-eligibility-russia-cis"
  ],
  "examSlugs": [
    "neet-ug"
  ],
  "keywords": [
    "choosing an mbbs university",
    "nmc recognised medical college list russia cis how to check",
    "questions to ask before choosing an mbbs university russia cis",
    "red flags and guaranteed seat scams mbbs russia cis"
  ]
},
{
  "slug": "studying-sciences-and-mathematics-in-russia-cis",
  "label": "Sciences & Mathematics",
  "title": "Sciences & Mathematics (Russia & CIS)",
  "description": "Studying physics, chemistry, biology and mathematics in Russia and the CIS — a regional academic strength — what these degrees cover and where they lead.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "studying-physics-in-russia-and-cis",
    "studying-mathematics-in-russia-and-cis",
    "studying-chemistry-in-russia-and-cis",
    "studying-biology-and-life-sciences-in-russia-and-cis",
    "degree-structure-and-research-in-russia-cis-sciences"
  ],
  "examSlugs": [],
  "keywords": [
    "sciences & mathematics",
    "studying physics in russia and cis",
    "studying mathematics in russia and cis",
    "studying chemistry in russia and cis"
  ]
},
{
  "slug": "studying-arts-humanities-and-social-sciences-russia-cis",
  "label": "Arts & Social Sciences",
  "title": "Arts, Humanities & Social Sciences",
  "description": "Studying psychology, economics, linguistics, history and the social sciences in Russia and the CIS — degree structures and directions.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "studying-psychology-in-russia-and-cis-degree-structure",
    "economics-and-finance-degrees-in-russia-and-cis",
    "linguistics-and-language-studies-degrees-in-russia-cis",
    "studying-history-and-humanities-in-russia-and-cis",
    "social-sciences-degrees-in-russia-and-cis-sociology-political-science"
  ],
  "examSlugs": [],
  "keywords": [
    "arts & social sciences",
    "studying psychology in russia and cis degree structure",
    "economics and finance degrees in russia and cis",
    "linguistics and language studies degrees in russia cis"
  ]
},
{
  "slug": "creative-arts-music-and-performing-arts-russia-cis",
  "label": "Creative & Performing Arts",
  "title": "Creative & Performing Arts (Russia & CIS)",
  "description": "Studying music and conservatoire study, ballet and dance, theatre and fine arts in Russia and the CIS — including auditions and portfolios.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "studying-music-and-conservatoire-in-russia-cis",
    "ballet-and-dance-training-in-russia-cis",
    "theatre-and-drama-schools-in-russia-cis",
    "fine-and-applied-arts-portfolio-russia-cis",
    "creative-arts-auditions-and-portfolios-russia-cis"
  ],
  "examSlugs": [],
  "keywords": [
    "creative & performing arts",
    "studying music and conservatoire in russia cis",
    "ballet and dance training in russia cis",
    "theatre and drama schools in russia cis"
  ]
},
{
  "slug": "it-engineering-and-energy-specialisations-russia-cis",
  "label": "IT, Engineering & Energy",
  "title": "IT, Engineering & Energy (Russia & CIS)",
  "description": "Civilian IT, engineering and energy specialisations in Russia and the CIS — software and data, civil and chemical engineering, and energy, petroleum and geology.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "software-and-data-science-degrees-in-russia-cis",
    "petroleum-and-geology-degrees-in-russia-and-kazakhstan",
    "energy-and-power-engineering-degrees-in-russia-cis",
    "civil-engineering-and-architecture-degrees-in-russia-cis",
    "chemical-and-materials-engineering-degrees-in-russia-cis"
  ],
  "examSlugs": [],
  "keywords": [
    "it, engineering & energy",
    "software and data science degrees in russia cis",
    "petroleum and geology degrees in russia and kazakhstan",
    "energy and power engineering degrees in russia cis"
  ]
},
{
  "slug": "graduate-and-research-study-aspirantura-russia-cis",
  "label": "Graduate & Research Study",
  "title": "Graduate & Research Study (Aspirantura)",
  "description": "Graduate and research study in Russia and the CIS — the master’s and the aspirantura (PhD route and Candidate of Sciences), research admission and supervision, and funding.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "aspirantura-phd-route-in-russia-cis-explained",
    "how-research-supervision-and-scientific-advisor-works-russia-cis",
    "how-to-write-a-research-proposal-for-aspirantura-russia-cis",
    "funding-and-stipends-for-graduate-and-research-study-russia-cis",
    "academic-publishing-and-dissertation-defence-russia-cis"
  ],
  "examSlugs": [
    "gre",
    "gmat"
  ],
  "keywords": [
    "graduate & research study",
    "aspirantura phd route in russia cis explained",
    "how research supervision and scientific advisor works russia cis",
    "how to write a research proposal for aspirantura russia cis"
  ]
},
{
  "slug": "russian-government-scholarship-and-open-doors-in-depth",
  "label": "Govt Scholarship & Open Doors",
  "title": "Govt Scholarship & Open Doors In Depth",
  "description": "The Russian Government Scholarship (quota) and the Open Doors olympiad — the official application via the Rossotrudnichestvo portal, the stages and selection. Deferred to official.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "rossotrudnichestvo-portal-step-by-step-quota-application",
    "russian-government-quota-selection-stages-explained",
    "open-doors-olympiad-for-postgraduate-places-in-russia",
    "choosing-quota-or-open-doors-route-to-funded-study-russia",
    "russian-government-scholarship-quota-application-mistakes-to-avoid"
  ],
  "examSlugs": [],
  "keywords": [
    "govt scholarship & open doors",
    "rossotrudnichestvo portal step by step quota application",
    "russian government quota selection stages explained",
    "open doors olympiad for postgraduate places in russia"
  ]
},
{
  "slug": "budgeting-and-student-costs-in-russia-cis-in-depth",
  "label": "Budgeting & Student Costs",
  "title": "Budgeting & Student Costs (Russia & CIS)",
  "description": "Budgeting and student costs in Russia and the CIS — tuition ranges (deferred to each university), accommodation, food and transport by city, and planning a monthly budget. Not financial advice.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "monthly-student-budget-template-russia-cis",
    "student-living-costs-by-city-russia-cis",
    "what-to-budget-for-before-arriving-russia-cis",
    "dormitory-vs-private-rental-cost-russia-cis",
    "how-to-estimate-total-cost-of-a-degree-russia-cis"
  ],
  "examSlugs": [],
  "keywords": [
    "budgeting & student costs",
    "monthly student budget template russia cis",
    "student living costs by city russia cis",
    "what to budget for before arriving russia cis"
  ]
},
{
  "slug": "russia-student-visa-invitation-and-migration-in-depth",
  "label": "Russia Visa & Migration",
  "title": "Russia Student Visa, Invitation & Migration",
  "description": "The Russian student visa, invitation letter and migration registration — how the invitation is issued, the consular application, arrival registration and extension. Not immigration advice.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "russia-official-invitation-letter-process-explained",
    "russia-student-visa-consulate-application-step-by-step",
    "migration-registration-after-arrival-russia",
    "converting-single-entry-to-multi-entry-student-visa-russia",
    "cis-invitation-and-migration-registration-kazakhstan-kyrgyzstan-uzbekistan-armenia"
  ],
  "examSlugs": [],
  "keywords": [
    "russia visa & migration",
    "russia official invitation letter process explained",
    "russia student visa consulate application step by step",
    "migration registration and the 7 day rule russia"
  ]
},
{
  "slug": "cis-student-visas-and-residence-permits-in-depth",
  "label": "CIS Visas & Residence",
  "title": "CIS Student Visas & Residence In Depth",
  "description": "Student visas and residence for the CIS — Kazakhstan, Kyrgyzstan, Uzbekistan and Armenia — the entry, registration and residence steps by country. Not immigration advice.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "residence-permit-after-arrival-kazakhstan-kyrgyzstan-uzbekistan-armenia",
    "address-registration-rules-for-students-in-cis-countries",
    "student-visa-invitation-and-entry-permission-for-cis-countries",
    "visa-free-vs-visa-required-entry-for-cis-student-destinations",
    "extending-and-renewing-your-student-residence-in-cis-countries"
  ],
  "examSlugs": [],
  "keywords": [
    "cis visas & residence",
    "residence permit after arrival kazakhstan kyrgyzstan uzbekistan armenia",
    "address registration rules for students in cis countries",
    "student visa invitation and entry permission for cis countries"
  ]
},
{
  "slug": "learning-russian-and-the-torfl-in-depth",
  "label": "Learning Russian & TORFL",
  "title": "Learning Russian & the TORFL In Depth",
  "description": "Learning Russian and the TORFL test — the proficiency levels, what level programmes need, the preparatory-faculty Russian course, and practical ways to learn and certify.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "torfl-levels-explained-a1-to-c2",
    "what-torfl-level-do-you-need-for-russian-taught-programmes",
    "how-the-preparatory-faculty-russian-course-works",
    "how-to-prepare-for-and-register-for-the-torfl-exam",
    "ways-to-learn-russian-before-arriving-in-russia-cis"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "learning russian & torfl",
    "torfl levels explained a1 to c2",
    "what torfl level do you need for russian taught programmes",
    "how the preparatory faculty russian course works"
  ]
},
{
  "slug": "living-in-russian-and-cis-cities-a-practical-guide",
  "label": "Living in Cities",
  "title": "Living in Russia & CIS Cities",
  "description": "A city-by-city guide to student life in Russia and the CIS — Moscow, St Petersburg, Kazan, Almaty, Tashkent, Bishkek and Yerevan — getting around, climate and costs.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "student-guide-to-living-in-moscow",
    "student-guide-to-living-in-saint-petersburg",
    "student-life-in-kazan-and-regional-russian-cities",
    "student-guide-to-living-in-almaty-and-tashkent",
    "student-guide-to-living-in-bishkek-and-yerevan"
  ],
  "examSlugs": [],
  "keywords": [
    "living in cities",
    "student guide to living in moscow",
    "student guide to living in saint petersburg",
    "student life in kazan and regional russian cities"
  ]
},
{
  "slug": "adjusting-and-student-wellbeing-russia-cis",
  "label": "Adjusting & Wellbeing",
  "title": "Adjusting & Wellbeing (Russia & CIS)",
  "description": "Settling in and student wellbeing in Russia and the CIS — adjusting to a new country and a cold climate, support services, staying healthy, and building community.",
  "group": "study-in-russia-cis",
  "region": "russia",
  "guideSlugs": [
    "adjusting-to-a-cold-climate-in-russia-cis",
    "university-student-support-services-russia-cis",
    "using-your-student-health-insurance-in-russia-cis",
    "eating-well-on-a-student-budget-in-russia-cis",
    "making-friends-and-building-community-russia-cis"
  ],
  "examSlugs": [],
  "keywords": [
    "adjusting & wellbeing",
    "adjusting to a cold climate in russia cis",
    "university student support services russia cis",
    "using your student health insurance in russia cis"
  ]
},
{
  "slug": "uae-higher-education-system-and-recognition",
  "label": "UAE Higher-Ed System",
  "title": "UAE Higher-Education System & Recognition",
  "description": "The UAE higher-education system — federal and private universities, CAA/MOHESR accreditation, and how to check a university and programme are recognised.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "uae-higher-education-system-explained",
    "uae-university-accreditation-caa-mohesr-explained",
    "how-to-check-a-gulf-university-is-officially-recognised",
    "free-zone-and-licensed-branch-institutions-in-the-uae-explained",
    "higher-education-regulators-across-the-gcc-compared"
  ],
  "examSlugs": [],
  "keywords": [
    "uae higher-ed system",
    "uae higher education system explained",
    "uae university accreditation caa mohesr explained",
    "how to check a gulf university is officially recognised"
  ]
},
{
  "slug": "saudi-higher-education-system-and-recognition",
  "label": "Saudi Higher-Ed System",
  "title": "Saudi Higher-Education System & Recognition",
  "description": "The Saudi Arabian higher-education system — public and private universities, the Ministry of Education and ETEC, the official international-student platform, and recognition.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "saudi-higher-education-system-explained",
    "role-of-the-saudi-ministry-of-education-in-universities",
    "etec-accreditation-and-quality-assurance-in-saudi-arabia",
    "studyinsaudi-official-international-student-platform-explained",
    "degree-recognition-and-equivalency-in-saudi-arabia"
  ],
  "examSlugs": [],
  "keywords": [
    "saudi higher-ed system",
    "saudi higher education system explained",
    "role of the saudi ministry of education in universities",
    "etec accreditation and quality assurance in saudi arabia"
  ]
},
{
  "slug": "credential-attestation-and-equivalency-gulf-in-depth",
  "label": "Attestation & Equivalency",
  "title": "Attestation & Equivalency (Gulf) In Depth",
  "description": "Certificate attestation and equivalency for Gulf study — the attestation chain by country, equivalency of certificates, and getting a Gulf degree recognised elsewhere.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "document-attestation-chain-for-gulf-study-step-by-step",
    "gcc-embassy-attestation-requirements-by-country",
    "school-certificate-equivalency-for-gulf-universities",
    "degree-equivalency-and-recognition-in-the-gulf",
    "getting-a-gulf-degree-recognised-in-other-countries"
  ],
  "examSlugs": [],
  "keywords": [
    "attestation & equivalency",
    "document attestation chain for gulf study step by step",
    "gcc embassy attestation requirements by country",
    "school certificate equivalency for gulf universities"
  ]
},
{
  "slug": "uae-national-and-private-universities-in-depth",
  "label": "UAE Universities In Depth",
  "title": "UAE National & Private Universities In Depth",
  "description": "UAE national and private universities beyond the most-ranked — UAE University, Zayed, Sharjah, Ajman and others — and how to choose.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "uae-national-vs-private-universities-explained",
    "uae-university-zayed-and-sharjah-strengths-compared",
    "affordable-universities-in-the-uae-beyond-the-top-ranked",
    "how-uae-universities-are-licensed-and-accredited",
    "choosing-a-uae-university-by-emirate-and-campus-setting"
  ],
  "examSlugs": [],
  "keywords": [
    "uae universities in depth",
    "uae national vs private universities explained",
    "uae university zayed and sharjah strengths compared",
    "affordable universities in the uae beyond the top ranked"
  ]
},
{
  "slug": "choosing-a-gulf-country-for-study",
  "label": "Choosing a Gulf Country",
  "title": "Choosing a Gulf Country to Study In",
  "description": "Comparing the UAE, Saudi Arabia, Qatar, Oman, Bahrain and Kuwait on programmes, cost, language, the visa route and student life — neutrally, decide by your goals.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "how-to-choose-a-gulf-country-to-study-in",
    "language-of-instruction-across-gulf-countries-compared",
    "cost-of-study-compared-across-gulf-countries",
    "student-visa-routes-compared-across-gulf-countries",
    "which-gulf-country-fits-your-study-goals"
  ],
  "examSlugs": [],
  "keywords": [
    "choosing a gulf country",
    "how to choose a gulf country to study in",
    "language of instruction across gulf countries compared",
    "cost of study compared across gulf countries"
  ]
},
{
  "slug": "branch-campus-accreditation-and-quality-gulf",
  "label": "Branch-Campus Accreditation",
  "title": "Branch-Campus Accreditation & Quality",
  "description": "How to judge a Gulf branch campus — verifying home and host accreditation, what \"same degree as home campus\" means, and the questions to ask.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "how-to-verify-branch-campus-accreditation-in-the-gulf",
    "host-country-quality-regulators-for-gulf-branch-campuses",
    "does-a-gulf-branch-campus-give-the-same-degree-as-the-home-campus",
    "comparing-faculty-and-facilities-at-gulf-branch-campuses",
    "questions-to-ask-before-enrolling-in-a-gulf-branch-campus"
  ],
  "examSlugs": [],
  "keywords": [
    "branch-campus accreditation",
    "how to verify branch campus accreditation in the gulf",
    "host country quality regulators for gulf branch campuses",
    "does a gulf branch campus give the same degree as the home campus"
  ]
},
{
  "slug": "dubai-academic-clusters-and-free-zones-explained",
  "label": "Dubai Academic Free-Zones",
  "title": "Dubai Academic Free-Zones Explained",
  "description": "The Dubai academic free-zones — Dubai International Academic City and Knowledge Park — how the model works for branch campuses and what it means for students.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "how-academic-free-zones-work-in-dubai",
    "dubai-international-academic-city-explained-for-students",
    "dubai-knowledge-park-explained-for-students",
    "free-zone-vs-mainland-universities-in-the-gulf",
    "degree-accreditation-and-licensing-in-dubai-free-zones"
  ],
  "examSlugs": [],
  "keywords": [
    "dubai academic free-zones",
    "how academic free zones work in dubai",
    "dubai international academic city explained for students",
    "dubai knowledge park explained for students"
  ]
},
{
  "slug": "funded-graduate-scholarships-and-assistantships-gulf",
  "label": "Funded Graduate Awards",
  "title": "Funded Graduate Awards (Gulf)",
  "description": "Funded graduate study in the Gulf — full PhD and master’s funding, stipends and assistantships at research universities, and how funded admission works. Secular criteria only.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "funded-phd-positions-at-gulf-research-universities",
    "research-and-teaching-assistantships-in-the-gulf",
    "phd-and-masters-stipends-in-the-gulf-explained",
    "how-to-secure-research-funding-for-graduate-study-in-the-gulf",
    "finding-funded-graduate-supervisors-and-labs-in-the-gulf"
  ],
  "examSlugs": [
    "gre",
    "gmat"
  ],
  "keywords": [
    "funded graduate awards",
    "funded phd positions at gulf research universities",
    "research and teaching assistantships in the gulf",
    "phd and masters stipends in the gulf explained"
  ]
},
{
  "slug": "managing-money-and-banking-for-students-gulf",
  "label": "Money & Banking (Gulf)",
  "title": "Money & Banking for Students (Gulf)",
  "description": "Managing money in the Gulf — budgeting by city, student bank accounts, currency and remittances, and what part-time work can contribute. Not financial advice.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "cost-of-living-by-gulf-city-for-students",
    "using-a-student-bank-account-and-cards-in-the-gulf",
    "sending-money-home-from-the-gulf-remittances-guide",
    "currency-and-exchange-rates-for-gulf-students",
    "how-much-part-time-work-can-cover-for-gulf-students"
  ],
  "examSlugs": [],
  "keywords": [
    "money & banking (gulf)",
    "cost of living by gulf city for students",
    "using a student bank account and cards in the gulf",
    "sending money home from the gulf remittances guide"
  ]
},
{
  "slug": "gulf-work-and-residency-after-study-in-depth",
  "label": "Work & Residency After Study",
  "title": "Work & Residency After Study (Gulf)",
  "description": "Working and staying in the Gulf after study — converting to a work or job-seeking route, employer sponsorship and freelance permits, by country. Not immigration advice.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "converting-a-gulf-student-visa-to-a-work-permit",
    "employer-sponsorship-and-work-visas-in-the-gulf-explained",
    "uae-job-seeker-and-self-sponsored-residency-visas-for-graduates",
    "freelance-and-remote-work-permits-in-the-gulf",
    "gulf-graduate-residency-rules-by-country-uae-saudi-qatar-oman-bahrain-kuwait"
  ],
  "examSlugs": [],
  "keywords": [
    "work & residency after study",
    "converting a gulf student visa to a work permit",
    "employer sponsorship and work visas in the gulf explained",
    "uae job seeker and self sponsored residency visas for graduates"
  ]
},
{
  "slug": "uae-golden-visa-and-long-term-residency-explained",
  "label": "UAE Golden Visa In Depth",
  "title": "UAE Golden Visa & Long-Term Residency",
  "description": "The UAE Golden Visa and long-term residency for outstanding students and graduates — the categories and criteria, deferred to the UAE government. Not immigration advice.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "uae-golden-visa-outstanding-students-category-explained",
    "uae-golden-visa-for-top-graduates-and-academic-excellence",
    "how-to-apply-for-the-uae-golden-visa-as-a-student",
    "sponsoring-family-on-a-uae-golden-visa-as-a-graduate",
    "long-term-residency-routes-for-graduates-across-the-gulf"
  ],
  "examSlugs": [],
  "keywords": [
    "uae golden visa in depth",
    "uae golden visa outstanding students category explained",
    "uae golden visa for top graduates and academic excellence",
    "how to apply for the uae golden visa as a student"
  ]
},
{
  "slug": "sciences-and-mathematics-degrees-in-the-gulf",
  "label": "Sciences & Maths (Gulf)",
  "title": "Sciences & Mathematics Degrees (Gulf)",
  "description": "Studying biology, chemistry, physics, mathematics and environmental science in the Gulf — what these degrees cover, research options and directions.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "studying-biology-and-life-sciences-in-the-gulf",
    "chemistry-and-materials-science-degrees-in-the-gulf",
    "studying-physics-and-astronomy-in-the-gulf",
    "mathematics-statistics-and-data-science-degrees-in-the-gulf",
    "environmental-and-marine-science-studies-in-the-gulf"
  ],
  "examSlugs": [],
  "keywords": [
    "sciences & maths (gulf)",
    "studying biology and life sciences in the gulf",
    "chemistry and materials science degrees in the gulf",
    "studying physics and astronomy in the gulf"
  ]
},
{
  "slug": "architecture-design-and-creative-arts-in-the-gulf",
  "label": "Architecture, Design & Arts",
  "title": "Architecture, Design & Creative Arts (Gulf)",
  "description": "Studying architecture, design and the creative arts in the Gulf — architecture, interior and graphic design and fine arts — including portfolios.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "studying-architecture-in-the-gulf",
    "portfolio-requirements-for-gulf-design-and-arts-programs",
    "interior-design-courses-in-the-gulf",
    "graphic-and-visual-communication-design-in-the-gulf",
    "fine-and-applied-arts-degrees-in-the-gulf"
  ],
  "examSlugs": [],
  "keywords": [
    "architecture, design & arts",
    "studying architecture in the gulf",
    "portfolio requirements for gulf design and arts programs",
    "interior design courses in the gulf"
  ]
},
{
  "slug": "aviation-aerospace-and-logistics-in-the-gulf",
  "label": "Aviation & Logistics",
  "title": "Aviation, Aerospace & Logistics (Gulf)",
  "description": "Studying aviation, aerospace and logistics in the Gulf — aviation and airport management, aerospace engineering and supply-chain and logistics.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "aviation-and-airport-management-studies-in-the-gulf",
    "aerospace-engineering-programs-in-the-gulf",
    "logistics-and-supply-chain-management-studies-in-the-gulf",
    "aviation-degree-vs-pilot-training-in-the-gulf",
    "maritime-and-ports-studies-in-the-gulf"
  ],
  "examSlugs": [],
  "keywords": [
    "aviation & logistics",
    "aviation and airport management studies in the gulf",
    "aerospace engineering programs in the gulf",
    "logistics and supply chain management studies in the gulf"
  ]
},
{
  "slug": "hospitality-tourism-and-events-in-the-gulf",
  "label": "Hospitality & Tourism",
  "title": "Hospitality, Tourism & Events (Gulf)",
  "description": "Studying hospitality, tourism and event management in the Gulf — degree and diploma routes, internships, and where these careers lead.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "hospitality-and-tourism-degrees-in-the-gulf",
    "diploma-and-vocational-hospitality-courses-in-the-gulf",
    "internships-and-placements-in-gulf-hospitality-and-tourism",
    "event-management-and-mice-studies-in-the-gulf",
    "careers-after-studying-hospitality-and-tourism-in-the-gulf"
  ],
  "examSlugs": [],
  "keywords": [
    "hospitality & tourism",
    "hospitality and tourism degrees in the gulf",
    "diploma and vocational hospitality courses in the gulf",
    "internships and placements in gulf hospitality and tourism"
  ]
},
{
  "slug": "finance-banking-and-fintech-in-the-gulf",
  "label": "Finance & Fintech",
  "title": "Finance, Banking & Fintech (Gulf)",
  "description": "Studying finance, banking and fintech in the Gulf — finance and accounting degrees and banking/financial-technology specialisations — what they cover and where they lead.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "finance-and-accounting-degrees-in-the-gulf",
    "fintech-and-financial-technology-studies-in-the-gulf",
    "islamic-finance-as-an-academic-specialisation-in-the-gulf",
    "banking-and-investment-specialisations-in-the-gulf",
    "professional-finance-certifications-alongside-a-gulf-degree"
  ],
  "examSlugs": [],
  "keywords": [
    "finance & fintech",
    "finance and accounting degrees in the gulf",
    "fintech and financial technology studies in the gulf",
    "islamic finance as an academic specialisation in the gulf"
  ]
},
{
  "slug": "graduate-careers-and-employability-in-the-gulf",
  "label": "Graduate Careers (Gulf)",
  "title": "Graduate Careers & Employability (Gulf)",
  "description": "Building employability after study in the Gulf — internships and co-ops, career services, professional licensing for regulated fields, and the graduate job search.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "how-to-build-your-cv-and-graduate-job-search-in-the-gulf",
    "professional-licensing-and-registration-for-regulated-careers-in-the-gulf",
    "how-to-use-university-career-services-in-the-gulf",
    "finding-internships-and-co-ops-while-studying-in-the-gulf",
    "graduate-employability-skills-employers-look-for-in-the-gulf"
  ],
  "examSlugs": [],
  "keywords": [
    "graduate careers (gulf)",
    "how to build your cv and graduate job search in the gulf",
    "professional licensing and registration for regulated careers in the gulf",
    "how to use university career services in the gulf"
  ]
},
{
  "slug": "school-qualifications-and-entrance-tests-gulf",
  "label": "School Quals & Entrance Tests",
  "title": "School Qualifications & Entrance Tests (Gulf)",
  "description": "How school qualifications and entrance tests work for Gulf universities — recognition of school certificates and the IB/A-Levels, the EmSAT by subject, and placement tests.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "will-my-school-board-be-recognized-by-gulf-universities",
    "emsat-subject-tests-explained-by-subject-area",
    "high-school-gpa-and-percentage-thresholds-for-gulf-universities",
    "country-specific-entrance-and-placement-tests-in-the-gulf",
    "ib-and-a-levels-for-gulf-university-admission"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "school quals & entrance tests",
    "will my school board be recognized by gulf universities",
    "emsat subject tests explained by subject area",
    "high school gpa and percentage thresholds for gulf universities"
  ]
},
{
  "slug": "living-in-gulf-cities-a-practical-guide",
  "label": "Living in Gulf Cities",
  "title": "Living in Gulf Cities: A Practical Guide",
  "description": "A city-by-city guide to student life in the Gulf — Dubai, Abu Dhabi, Sharjah, Doha, Riyadh, Jeddah, Muscat, Manama and Kuwait City — getting around, climate and costs.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "choosing-which-gulf-city-to-study-in",
    "living-as-a-student-in-dubai-neighbourhoods-and-daily-life",
    "finding-student-neighbourhoods-near-gulf-campuses",
    "climate-and-seasonal-living-in-gulf-student-cities",
    "daily-student-costs-across-gulf-cities-compared"
  ],
  "examSlugs": [],
  "keywords": [
    "living in gulf cities",
    "choosing which gulf city to study in",
    "living as a student in dubai neighbourhoods and daily life",
    "finding student neighbourhoods near gulf campuses"
  ]
},
{
  "slug": "cultural-adjustment-and-student-wellbeing-gulf",
  "label": "Adjusting & Wellbeing",
  "title": "Adjusting & Wellbeing (Gulf)",
  "description": "Settling in and student wellbeing in the Gulf — adjusting to a new country, university support and wellbeing services, staying healthy in the climate, and practical tips.",
  "group": "study-in-middle-east",
  "region": "middle-east",
  "guideSlugs": [
    "coping-with-culture-shock-in-the-gulf",
    "university-counselling-and-wellbeing-services-in-the-gulf",
    "staying-healthy-in-the-gulf-heat-as-a-student",
    "food-dining-and-daily-life-for-students-in-the-gulf",
    "local-etiquette-and-everyday-customs-in-the-gulf"
  ],
  "examSlugs": [],
  "keywords": [
    "adjusting & wellbeing",
    "coping with culture shock in the gulf",
    "university counselling and wellbeing services in the gulf",
    "staying healthy in the gulf heat as a student"
  ]
},
{
  "slug": "application-strategy-and-offers-anz",
  "label": "Application Strategy & Offers",
  "title": "Application Strategy & Offers (ANZ)",
  "description": "Strategy across Australian and NZ applications — shortlisting courses, applying to several universities, conditional and packaged offers, and accepting, deferring or declining.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "how-to-shortlist-universities-and-courses-australia-new-zealand",
    "how-many-universities-to-apply-to-australia-new-zealand",
    "conditional-vs-unconditional-offers-australia-new-zealand",
    "packaged-offers-and-pathway-programs-australia-new-zealand",
    "accepting-deferring-or-declining-an-offer-australia-new-zealand"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "application strategy & offers",
    "how to shortlist universities and courses australia new zealand",
    "how many universities to apply to australia new zealand",
    "conditional vs unconditional offers australia new zealand"
  ]
},
{
  "slug": "qualification-recognition-and-pathways-anz",
  "label": "Qualifications & Pathways",
  "title": "Qualifications & Pathways (ANZ)",
  "description": "How qualifications are recognised and the pathways into Australian and NZ universities — the AQF and NZQF, foundation and diploma pathways, and credit transfer.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "aqf-australian-qualifications-framework-explained",
    "nzqf-new-zealand-qualifications-framework-explained",
    "foundation-and-pathway-programs-australia-new-zealand",
    "diploma-to-degree-pathways-australia-new-zealand",
    "recognition-of-indian-qualifications-and-credit-transfer-australia-nz"
  ],
  "examSlugs": [
    "international-baccalaureate"
  ],
  "keywords": [
    "qualifications & pathways",
    "aqf australian qualifications framework explained",
    "nzqf new zealand qualifications framework explained",
    "foundation and pathway programs australia new zealand"
  ]
},
{
  "slug": "new-zealand-admissions-in-depth",
  "label": "New Zealand: Admissions",
  "title": "New Zealand: Admissions In Depth",
  "description": "How admission to New Zealand universities works — the NZQF, NCEA equivalence, direct application, and intakes and timelines.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "international-qualification-equivalence-for-new-zealand-universities",
    "direct-application-to-new-zealand-universities-explained",
    "conditional-vs-unconditional-offers-new-zealand-universities",
    "new-zealand-university-intakes-and-application-timelines"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "new zealand: admissions",
    "international qualification equivalence for new zealand universities",
    "direct application to new zealand universities explained",
    "conditional vs unconditional offers new zealand universities"
  ]
},
{
  "slug": "australian-universities-beyond-the-go8",
  "label": "Beyond the Go8",
  "title": "Australian Universities Beyond the Go8",
  "description": "Australian universities beyond the Group of Eight — the Australian Technology Network and other strong universities, and how the ranking systems differ.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "australian-technology-network-atn-universities-guide",
    "choosing-an-australian-university-by-subject-strength-not-overall-rank",
    "how-university-ranking-systems-differ-australia-new-zealand",
    "strong-non-go8-universities-in-australia-by-city",
    "beyond-top-ranked-new-zealand-universities-comparing-all-eight"
  ],
  "examSlugs": [],
  "keywords": [
    "beyond the go8",
    "australian technology network atn universities guide",
    "choosing an australian university by subject strength not overall rank",
    "how university ranking systems differ australia new zealand"
  ]
},
{
  "slug": "new-zealand-universities-in-depth",
  "label": "New Zealand Universities",
  "title": "New Zealand Universities In Depth",
  "description": "New Zealand’s eight universities — beyond Auckland and Otago: Victoria Wellington, Canterbury, Massey, Waikato, AUT and Lincoln — and how to choose.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "victoria-university-of-wellington-and-canterbury-guide",
    "massey-and-lincoln-universities-new-zealand-guide",
    "aut-and-university-of-waikato-guide",
    "choosing-among-new-zealands-eight-universities-by-strength",
    "beyond-go8-and-auckland-otago-hidden-strengths-australia-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "new zealand universities",
    "victoria university of wellington and canterbury guide",
    "massey and lincoln universities new zealand guide",
    "aut and university of waikato guide"
  ]
},
{
  "slug": "studying-sciences-in-australia-and-new-zealand",
  "label": "Sciences in Australia & NZ",
  "title": "Sciences in Australia & New Zealand",
  "description": "Studying biology, chemistry, physics, mathematics and environmental science in Australia and NZ — what they cover, honours years and research options.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "science-degrees-in-australia-and-new-zealand-overview",
    "honours-year-in-australian-and-new-zealand-science-degrees",
    "environmental-and-earth-science-degrees-in-australia-and-new-zealand",
    "physics-chemistry-and-mathematics-degrees-in-australia-and-new-zealand",
    "research-pathways-and-phd-in-science-australia-and-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "sciences in australia & nz",
    "science degrees in australia and new zealand overview",
    "honours year in australian and new zealand science degrees",
    "environmental and earth science degrees in australia and new zealand"
  ]
},
{
  "slug": "studying-arts-humanities-and-social-sciences-anz",
  "label": "Arts & Social Sciences (ANZ)",
  "title": "Arts, Humanities & Social Sciences (ANZ)",
  "description": "Studying psychology, education, social work, communications and the humanities in Australia and NZ — degree structures and careers.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "psychology-degrees-in-australia-and-new-zealand-guide",
    "teaching-and-education-degrees-in-australia-and-new-zealand",
    "social-work-degrees-in-australia-and-new-zealand-guide",
    "media-and-communications-courses-in-australia-and-new-zealand",
    "humanities-and-social-sciences-degrees-in-australia-and-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "arts & social sciences (anz)",
    "psychology degrees in australia and new zealand guide",
    "teaching and education degrees in australia and new zealand",
    "social work degrees in australia and new zealand guide"
  ]
},
{
  "slug": "health-and-medical-professions-anz-in-depth",
  "label": "Health & Medical Professions",
  "title": "Health & Medical Professions (ANZ)",
  "description": "Health and medical professions in Australia and NZ — entry to medicine (the GAMSAT and UCAT ANZ), dentistry, pharmacy, allied health, and AHPRA registration.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "how-to-study-medicine-in-australia-and-new-zealand",
    "studying-dentistry-in-australia-and-new-zealand",
    "studying-pharmacy-in-australia-and-new-zealand",
    "physiotherapy-and-allied-health-courses-in-australia-and-new-zealand",
    "ahpra-registration-and-practising-as-a-health-professional-in-australia-nz"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "health & medical professions",
    "how to study medicine in australia and new zealand",
    "studying dentistry in australia and new zealand",
    "studying pharmacy in australia and new zealand"
  ]
},
{
  "slug": "agriculture-environment-and-marine-studies-anz",
  "label": "Agriculture, Environment & Marine",
  "title": "Agriculture, Environment & Marine (ANZ)",
  "description": "Studying agriculture, environmental science, marine and veterinary sciences in Australia and NZ — a regional strength — and where these degrees lead.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "agricultural-science-degrees-in-australia-and-new-zealand",
    "environmental-science-and-sustainability-courses-australia-new-zealand",
    "marine-science-and-oceanography-degrees-australia-new-zealand",
    "veterinary-science-degrees-in-australia-and-new-zealand-for-international-students",
    "forestry-fisheries-and-natural-resource-careers-australia-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "agriculture, environment & marine",
    "agricultural science degrees in australia and new zealand",
    "environmental science and sustainability courses australia new zealand",
    "marine science and oceanography degrees australia new zealand"
  ]
},
{
  "slug": "law-and-business-professions-anz",
  "label": "Law & Business Professions",
  "title": "Law & Business Professions (ANZ)",
  "description": "Studying law and business professions in Australia and NZ — the LLB and JD and admission to practice, and accounting and finance with CPA Australia and CA ANZ.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "llb-vs-jd-in-australia-and-new-zealand",
    "admission-to-legal-practice-in-australia-and-new-zealand",
    "cpa-australia-vs-ca-anz-accountancy-pathways",
    "accredited-accounting-degrees-in-australia-and-new-zealand",
    "law-degree-recognition-for-international-students-australia-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "law & business professions",
    "llb vs jd in australia and new zealand",
    "admission to legal practice in australia and new zealand",
    "cpa australia vs ca anz accountancy pathways"
  ]
},
{
  "slug": "australia-student-visa-subclass-500-in-depth",
  "label": "Subclass 500 In Depth",
  "title": "Subclass 500 Student Visa In Depth",
  "description": "The Australian subclass 500 student visa — the Genuine Student responses, the CoE, ImmiAccount lodgement, evidence and visa conditions. Not immigration advice.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "subclass-500-coe-and-confirmation-of-enrolment-explained",
    "writing-genuine-student-gs-responses-for-subclass-500",
    "lodging-the-subclass-500-in-immiaccount-step-by-step",
    "subclass-500-supporting-evidence-types-explained",
    "subclass-500-visa-conditions-after-grant-explained"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "subclass 500 in depth",
    "subclass 500 coe and confirmation of enrolment explained",
    "writing genuine student gs responses for subclass 500",
    "lodging the subclass 500 in immiaccount step by step"
  ]
},
{
  "slug": "new-zealand-student-visa-in-depth",
  "label": "NZ Student Visa In Depth",
  "title": "NZ Student Visa In Depth",
  "description": "The New Zealand student visa — the Immigration NZ application, conditions, work rights during study, and the pathway student visa. Not immigration advice.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "new-zealand-student-visa-conditions-explained",
    "new-zealand-student-visa-online-application-immionline-walkthrough",
    "new-zealand-pathway-student-visa-explained",
    "new-zealand-student-visa-work-rights-allowance-explained",
    "new-zealand-student-visa-extension-and-variation-of-conditions"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "nz student visa in depth",
    "new zealand student visa conditions explained",
    "new zealand student visa online application immionline walkthrough",
    "new zealand pathway student visa explained"
  ]
},
{
  "slug": "scholarships-and-funding-anz-in-depth",
  "label": "Scholarships & Funding In Depth",
  "title": "Scholarships & Funding (ANZ) In Depth",
  "description": "Scholarships and funding for Australia and NZ — beyond Australia Awards and Destination Australia: university and NZ government scholarships, and how to apply.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "university-merit-and-equity-scholarships-australia",
    "new-zealand-government-scholarships-for-international-students",
    "new-zealand-university-scholarships-guide",
    "how-to-find-and-apply-for-scholarships-australia-new-zealand",
    "postgraduate-research-funding-australia-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "scholarships & funding in depth",
    "university merit and equity scholarships australia",
    "new zealand government scholarships for international students",
    "new zealand university scholarships guide"
  ]
},
{
  "slug": "budgeting-and-money-management-anz",
  "label": "Budgeting & Money (ANZ)",
  "title": "Budgeting & Money (ANZ)",
  "description": "Managing money as a student in Australia and NZ — budgeting by city, part-time earnings, accounts and superannuation, and the tax file/IRD number. Not financial advice.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "monthly-student-budget-by-city-australia-and-new-zealand",
    "how-far-part-time-work-stretches-student-budget-australia-nz",
    "superannuation-for-international-students-in-australia-explained",
    "ird-number-and-student-tax-in-new-zealand-guide",
    "currency-exchange-and-sending-money-to-australia-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "budgeting & money (anz)",
    "monthly student budget by city australia and new zealand",
    "how far part time work stretches student budget australia nz",
    "superannuation for international students in australia explained"
  ]
},
{
  "slug": "temporary-graduate-visa-485-in-depth",
  "label": "Subclass 485 In Depth",
  "title": "Subclass 485 Graduate Visa In Depth",
  "description": "The Australian Temporary Graduate visa (485) — the post-higher-education and post-vocational streams, eligibility, duration by qualification and recent changes. Not immigration advice.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "subclass-485-post-higher-education-work-stream-guide",
    "subclass-485-post-vocational-education-work-stream-guide",
    "subclass-485-visa-duration-by-qualification-explained",
    "subclass-485-recent-changes-and-age-english-requirements",
    "australia-485-vs-new-zealand-post-study-work-eligibility-compared"
  ],
  "examSlugs": [],
  "keywords": [
    "subclass 485 in depth",
    "subclass 485 post higher education work stream guide",
    "subclass 485 post vocational education work stream guide",
    "subclass 485 visa duration by qualification explained"
  ]
},
{
  "slug": "skilled-migration-and-pr-pathways-anz-in-depth",
  "label": "Skilled Migration & PR In Depth",
  "title": "Skilled Migration & PR (ANZ) In Depth",
  "description": "Skilled migration and PR in Australia and NZ — the points test and EOI, occupation lists, state/regional nomination, and NZ’s Skilled Migrant Category and Green List. Not immigration advice.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "skillselect-eoi-expression-of-interest-australia-guide",
    "australia-points-test-breakdown-skilled-migration",
    "skills-assessment-for-australian-skilled-migration-guide",
    "australia-skilled-occupation-lists-mltssl-stsol-rol-explained",
    "state-and-regional-nomination-for-skilled-migration-australia-nz"
  ],
  "examSlugs": [],
  "keywords": [
    "skilled migration & pr in depth",
    "skillselect eoi expression of interest australia guide",
    "australia points test breakdown skilled migration",
    "skills assessment for australian skilled migration guide"
  ]
},
{
  "slug": "graduate-careers-and-employability-anz",
  "label": "Graduate Careers & Employability",
  "title": "Graduate Careers & Employability (ANZ)",
  "description": "Finding work in Australia and NZ — Australian-style CVs, professional accreditation (Engineers Australia, CPA, AHPRA), internships, networking and graduate programs.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "australian-style-cv-and-job-application-guide",
    "professional-accreditation-for-graduates-australia-new-zealand",
    "internships-and-work-placements-australia-new-zealand",
    "professional-networking-for-students-australia-new-zealand",
    "graduate-programs-and-employer-schemes-australia-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "graduate careers & employability",
    "australian style cv and job application guide",
    "professional accreditation for graduates australia new zealand",
    "internships and work placements australia new zealand"
  ]
},
{
  "slug": "english-tests-for-admission-vs-visa-anz",
  "label": "English: Admission vs Visa",
  "title": "English: Admission vs Visa (ANZ)",
  "description": "Which English tests Australia and NZ accept for admission vs the student visa — the nuance that some tests (e.g. Duolingo) may be accepted for admission but not the visa.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "english-test-admission-vs-visa-australia-new-zealand",
    "duolingo-english-test-accepted-australia-nz-visa",
    "english-score-requirements-admission-vs-visa-australia-nz",
    "approved-english-tests-list-subclass-500-and-nz-student-visa",
    "english-test-exemptions-and-waivers-admission-vs-visa-australia-nz"
  ],
  "examSlugs": [
    "ielts",
    "toefl",
    "pte-academic"
  ],
  "keywords": [
    "english: admission vs visa",
    "english test admission vs visa australia new zealand",
    "duolingo english test accepted australia nz visa",
    "english score requirements admission vs visa australia nz"
  ]
},
{
  "slug": "arriving-and-settling-in-anz-in-depth",
  "label": "Arriving & Settling In",
  "title": "Arriving & Settling In (ANZ)",
  "description": "Arriving and settling into Australia or NZ — the arrival checklist, using your health cover, transport cards, finding housing, a SIM and banking, by city.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "first-week-arrival-checklist-australia-new-zealand",
    "how-to-use-your-oshc-and-health-cover-australia-new-zealand",
    "transport-cards-opal-myki-at-hop-explained-australia-nz",
    "getting-a-sim-and-mobile-plan-australia-new-zealand-students",
    "finding-housing-after-you-arrive-australia-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "arriving & settling in",
    "first week arrival checklist australia new zealand",
    "how to use your oshc and health cover australia new zealand",
    "transport cards opal myki at hop explained australia nz"
  ]
},
{
  "slug": "student-life-culture-and-support-anz",
  "label": "Student Life, Culture & Support",
  "title": "Student Life, Culture & Support (ANZ)",
  "description": "Student life and support in Australia and NZ — campus culture and clubs, wellbeing and international-student support, Indigenous and Māori support, safety and working culture.",
  "group": "study-in-australia-nz",
  "region": "australia-nz",
  "guideSlugs": [
    "campus-culture-and-student-clubs-australia-new-zealand",
    "international-student-support-and-wellbeing-services-australia-nz",
    "indigenous-and-maori-student-support-australia-new-zealand",
    "staying-safe-as-a-student-in-australia-and-new-zealand",
    "adjusting-to-life-and-workplace-culture-in-australia-and-new-zealand"
  ],
  "examSlugs": [],
  "keywords": [
    "student life, culture & support",
    "campus culture and student clubs australia new zealand",
    "international student support and wellbeing services australia nz",
    "indigenous and maori student support australia new zealand"
  ]
},
{
  "slug": "france-admissions-pathways-in-depth",
  "label": "France: Admissions Pathways",
  "title": "France: Admissions Pathways In Depth",
  "description": "French higher-education routes — universities vs grandes écoles and CPGE, Parcoursup vs Études en France, the DAP, and the licence-master-doctorat structure.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "france-universities-vs-grandes-ecoles-explained",
    "cpge-preparatory-classes-and-grandes-ecoles-entrance",
    "parcoursup-vs-etudes-en-france-which-applies-to-you",
    "dap-application-for-first-year-bachelor-in-france",
    "licence-master-doctorat-french-degree-system-explained"
  ],
  "examSlugs": [],
  "keywords": [
    "france: admissions pathways",
    "france universities vs grandes ecoles explained",
    "cpge preparatory classes and grandes ecoles entrance",
    "parcoursup vs etudes en france which applies to you"
  ]
},
{
  "slug": "netherlands-admissions-in-depth",
  "label": "Netherlands: Admissions",
  "title": "Netherlands: Admissions In Depth",
  "description": "Dutch admissions — Studielink, the numerus fixus selection, research universities (WO) vs universities of applied sciences (HBO), and university colleges.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "studielink-application-process-netherlands-explained",
    "numerus-fixus-selection-procedure-netherlands",
    "wo-vs-hbo-dutch-universities-difference",
    "university-colleges-liberal-arts-netherlands-guide",
    "matching-and-study-choice-check-netherlands"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "netherlands: admissions",
    "studielink application process netherlands explained",
    "numerus fixus selection procedure netherlands",
    "wo vs hbo dutch universities difference"
  ]
},
{
  "slug": "italy-admissions-in-depth",
  "label": "Italy: Admissions",
  "title": "Italy: Admissions In Depth",
  "description": "Italian admissions for international students — Universitaly pre-enrolment, the Declaration of Value and CIMEA, the IMAT for medicine, and the embassy timeline.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "universitaly-pre-enrolment-guide-for-international-students",
    "declaration-of-value-and-cimea-credential-recognition-italy",
    "imat-exam-guide-for-english-taught-medicine-in-italy",
    "italy-university-application-timeline-via-embassy",
    "italian-university-admission-requirements-for-international-students"
  ],
  "examSlugs": [],
  "keywords": [
    "italy: admissions",
    "universitaly pre enrolment guide for international students",
    "declaration of value and cimea credential recognition italy",
    "imat exam guide for english taught medicine in italy"
  ]
},
{
  "slug": "ects-credits-and-degree-recognition-europe",
  "label": "ECTS & Degree Recognition",
  "title": "ECTS & Degree Recognition in Europe",
  "description": "European credits and recognition — the ECTS system, the Diploma Supplement, ENIC-NARIC recognition, and how credits transfer between programmes.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "ects-credit-system-explained-for-international-students",
    "diploma-supplement-explained-what-it-is-and-why-it-matters",
    "enic-naric-credential-recognition-explained",
    "how-to-transfer-ects-credits-between-european-universities",
    "how-european-degree-recognition-works-in-india-for-returning-students"
  ],
  "examSlugs": [],
  "keywords": [
    "ects & degree recognition",
    "ects credit system explained for international students",
    "diploma supplement explained what it is and why it matters",
    "enic naric credential recognition explained"
  ]
},
{
  "slug": "erasmus-and-joint-degrees-in-depth",
  "label": "Erasmus & Joint Degrees",
  "title": "Erasmus & Joint Degrees In Depth",
  "description": "European mobility and multi-country degrees — Erasmus+ exchange, Erasmus Mundus Joint Master Degrees (the degree structure), and double/joint degrees.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "erasmus-plus-exchange-during-your-degree-explained",
    "erasmus-mundus-joint-master-degree-structure-explained",
    "double-degree-vs-joint-degree-in-europe-explained",
    "how-to-apply-to-erasmus-mundus-joint-masters-as-an-international-student",
    "visa-and-mobility-logistics-for-multi-country-erasmus-degrees"
  ],
  "examSlugs": [],
  "keywords": [
    "erasmus & joint degrees",
    "erasmus plus exchange during your degree explained",
    "erasmus mundus joint master degree structure explained",
    "double degree vs joint degree in europe explained"
  ]
},
{
  "slug": "studying-engineering-in-europe-in-depth",
  "label": "Engineering in Europe",
  "title": "Engineering in Europe In Depth",
  "description": "The European engineering landscape — Germany’s TU9, the French engineering grandes écoles, leading schools like TU Delft and ETH, and integrated MSc routes.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "germany-tu9-universities-for-engineering-explained",
    "french-engineering-grandes-ecoles-admission-explained",
    "diplom-ingenieur-vs-bachelor-master-engineering-europe",
    "how-to-apply-to-eth-and-tu-delft-engineering-compared",
    "english-taught-engineering-masters-in-germany-explained"
  ],
  "examSlugs": [
    "testas"
  ],
  "keywords": [
    "engineering in europe",
    "germany tu9 universities for engineering explained",
    "french engineering grandes ecoles admission explained",
    "diplom ingenieur vs bachelor master engineering europe"
  ]
},
{
  "slug": "studying-social-sciences-and-humanities-in-europe",
  "label": "Social Sciences & Humanities",
  "title": "Social Sciences & Humanities in Europe",
  "description": "Studying economics, politics and IR, psychology and history in Europe — English-taught programmes and the liberal-arts/university-college model.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "study-economics-in-europe-in-english",
    "political-science-and-international-relations-in-europe",
    "european-liberal-arts-and-university-colleges-explained",
    "study-psychology-in-europe-in-english",
    "study-history-and-humanities-in-europe"
  ],
  "examSlugs": [],
  "keywords": [
    "social sciences & humanities",
    "study economics in europe in english",
    "political science and international relations in europe",
    "european liberal arts and university colleges explained"
  ]
},
{
  "slug": "medicine-and-health-degrees-in-europe-in-depth",
  "label": "Medicine & Health in Europe",
  "title": "Medicine & Health Degrees in Europe",
  "description": "English-taught medicine and health degrees in Europe — the country routes (e.g. the IMAT in Italy), dentistry and pharmacy, and recognition to practise back home.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "english-taught-medicine-country-routes-europe-compared",
    "recognition-to-practise-medicine-back-home-after-europe",
    "studying-dentistry-in-europe-for-international-students",
    "studying-pharmacy-in-europe-for-international-students"
  ],
  "examSlugs": [],
  "keywords": [
    "medicine & health in europe",
    "imat italy medicine entrance exam guide",
    "english taught medicine country routes europe compared",
    "recognition to practise medicine back home after europe"
  ]
},
{
  "slug": "phd-and-research-funding-in-europe-in-depth",
  "label": "PhD & Research Funding",
  "title": "PhD & Research Funding in Europe",
  "description": "Doctoral study and research funding in Europe — structured vs employee PhDs, Marie Skłodowska-Curie Actions and ERC positions, and finding funded vacancies.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "structured-vs-individual-phd-models-in-europe-explained",
    "employee-phd-positions-in-germany-and-nordics-explained",
    "marie-sklodowska-curie-actions-phd-fellowships-explained",
    "erc-funded-phd-and-research-positions-in-europe",
    "how-to-find-funded-phd-vacancies-in-europe"
  ],
  "examSlugs": [
    "gre"
  ],
  "keywords": [
    "phd & research funding",
    "structured vs individual phd models in europe explained",
    "employee phd positions in germany and nordics explained",
    "marie sklodowska curie actions phd fellowships explained"
  ]
},
{
  "slug": "country-scholarships-in-europe-in-depth",
  "label": "Country Scholarships In Depth",
  "title": "Country Scholarships in Europe In Depth",
  "description": "Government and university scholarships across Europe — beyond DAAD and Erasmus: Italian, Spanish, Dutch, Swiss and Austrian awards. Secular criteria only.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "italian-government-scholarships-and-university-funding-guide",
    "spanish-government-and-university-scholarships-guide",
    "dutch-scholarships-beyond-holland-scholarship-guide",
    "swiss-government-excellence-scholarships-guide",
    "austrian-government-and-oead-scholarships-guide"
  ],
  "examSlugs": [],
  "keywords": [
    "country scholarships in depth",
    "italian government scholarships and university funding guide",
    "spanish government and university scholarships guide",
    "dutch scholarships beyond holland scholarship guide"
  ]
},
{
  "slug": "blocked-accounts-and-proof-of-funds-europe",
  "label": "Blocked Accounts & Proof of Funds",
  "title": "Blocked Accounts & Proof of Funds",
  "description": "Proving you can fund study across Europe — the German blocked account and its alternatives, and how proof-of-funds requirements differ by country. Amounts deferred to official.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "proof-of-funds-for-european-student-visas-by-country",
    "german-blocked-account-providers-compared",
    "alternatives-to-a-blocked-account-for-germany",
    "blocked-account-requirements-france-netherlands-austria",
    "how-to-show-proof-of-funds-with-an-education-loan-or-sponsor-for-europe"
  ],
  "examSlugs": [],
  "keywords": [
    "blocked accounts & proof of funds",
    "proof of funds for european student visas by country",
    "german blocked account providers compared",
    "alternatives to a blocked account for germany"
  ]
},
{
  "slug": "europe-student-visa-process-in-depth",
  "label": "Student Visa Process In Depth",
  "title": "Europe Student Visa Process In Depth",
  "description": "The European student visa/residence-permit process — national long-stay (type D) vs Schengen, the embassy/document process, and converting to a residence permit. Not immigration advice.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "national-type-d-visa-vs-schengen-short-stay-for-students",
    "student-visa-embassy-appointment-and-document-checklist-europe",
    "converting-student-visa-into-residence-permit-after-arrival-europe",
    "germany-national-visa-to-aufenthaltstitel-residence-permit-process",
    "france-vls-ts-validation-and-residence-permit-process"
  ],
  "examSlugs": [],
  "keywords": [
    "student visa process in depth",
    "national type d visa vs schengen short stay for students",
    "student visa embassy appointment and document checklist europe",
    "converting student visa into residence permit after arrival europe"
  ]
},
{
  "slug": "eu-blue-card-and-work-permits-in-depth",
  "label": "EU Blue Card & Work Permits",
  "title": "EU Blue Card & Work Permits In Depth",
  "description": "Working in Europe after study — the EU Blue Card (employment-based, not a study permit) and national work permits, salary thresholds and switching by country. Not immigration advice.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "eu-blue-card-salary-thresholds-by-country",
    "switching-from-student-permit-to-work-permit-in-europe",
    "germany-eu-blue-card-vs-national-work-permit",
    "netherlands-highly-skilled-migrant-vs-eu-blue-card",
    "eu-blue-card-intra-eu-mobility-and-job-changes"
  ],
  "examSlugs": [],
  "keywords": [
    "eu blue card & work permits",
    "eu blue card salary thresholds by country",
    "switching from student permit to work permit in europe",
    "germany eu blue card vs national work permit"
  ]
},
{
  "slug": "staying-in-europe-pr-and-citizenship-pathways",
  "label": "PR & Citizenship Pathways",
  "title": "PR & Citizenship Pathways in Europe",
  "description": "Long-term settlement in Europe — how PR and naturalisation timelines differ by country and the EU long-term residence permit. Deferred to each country; not immigration advice.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "naturalisation-and-citizenship-timelines-in-europe-by-country",
    "dual-citizenship-rules-in-european-countries-explained",
    "citizenship-and-integration-test-requirements-in-europe",
    "counting-student-years-toward-pr-and-citizenship-in-europe",
    "eu-long-term-residence-vs-national-permanent-residence-in-europe"
  ],
  "examSlugs": [],
  "keywords": [
    "pr & citizenship pathways",
    "naturalisation and citizenship timelines in europe by country",
    "dual citizenship rules in european countries explained",
    "citizenship and integration test requirements in europe"
  ]
},
{
  "slug": "learning-european-languages-for-study-and-life",
  "label": "European Languages for Study & Life",
  "title": "European Languages for Study & Life",
  "description": "Learning French, Italian, Spanish, Dutch or German for study and daily life — which programmes need the local language, language schools, integration courses and CEFR levels.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "learn-french-italian-spanish-dutch-for-study-in-europe",
    "english-taught-vs-local-language-programmes-in-europe",
    "cefr-levels-explained-for-studying-in-europe",
    "university-language-integration-courses-in-europe",
    "language-tests-for-french-italian-spanish-dutch-universities"
  ],
  "examSlugs": [
    "testdaf"
  ],
  "keywords": [
    "european languages for study & life",
    "learn french italian spanish dutch for study in europe",
    "english taught vs local language programmes in europe",
    "cefr levels explained for studying in europe"
  ]
},
{
  "slug": "settling-in-europe-residence-registration-in-depth",
  "label": "Residence Registration & Settling",
  "title": "Residence Registration & Settling In",
  "description": "First steps after arriving in Europe — registering your address (e.g. the German Anmeldung), the BSN/codice fiscale/NIE, collecting a residence permit and opening a bank account, by country.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "germany-anmeldung-address-registration-explained",
    "netherlands-bsn-and-gemeente-registration-guide",
    "spain-nie-and-tie-residence-card-guide",
    "italy-codice-fiscale-and-permesso-di-soggiorno-guide",
    "collecting-your-residence-permit-card-in-europe-by-country"
  ],
  "examSlugs": [],
  "keywords": [
    "residence registration & settling",
    "germany anmeldung address registration explained",
    "netherlands bsn and gemeente registration guide",
    "spain nie and tie residence card guide"
  ]
},
{
  "slug": "student-life-and-culture-across-europe",
  "label": "Student Life & Culture",
  "title": "Student Life & Culture Across Europe",
  "description": "Student life and culture across Europe — the semester structure and exam culture, student associations, transport and Schengen travel, and adapting across countries.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "semester-structure-and-exam-culture-in-europe",
    "student-associations-mensa-and-campus-life-in-europe",
    "getting-around-europe-student-transport-passes-and-bikes",
    "adjusting-to-life-in-a-new-european-country-culture-shock",
    "germany-anmeldung-and-student-registration-formalities"
  ],
  "examSlugs": [],
  "keywords": [
    "student life & culture",
    "semester structure and exam culture in europe",
    "student associations mensa and campus life in europe",
    "getting around europe student transport passes and bikes"
  ]
},
{
  "slug": "germany-admissions-systems-in-depth",
  "label": "Germany: Admissions Systems",
  "title": "Germany: Admissions Systems In Depth",
  "description": "How German admissions work — the APS, Hochschulstart and the numerus clausus, FH vs Universität, admission rounds, and Studienkolleg routes.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "aps-certificate-germany-guide-for-indian-students",
    "numerus-clausus-and-hochschulstart-germany-explained",
    "fachhochschule-vs-universitaet-germany",
    "germany-winter-vs-summer-intake-admission-timeline",
    "studienkolleg-admission-and-feststellungspruefung-explained"
  ],
  "examSlugs": [
    "testdaf",
    "testas"
  ],
  "keywords": [
    "germany: admissions systems",
    "aps certificate germany guide for indian students",
    "numerus clausus and hochschulstart germany explained",
    "fachhochschule vs universitaet germany"
  ]
},
{
  "slug": "nordics-admissions-in-depth",
  "label": "Nordics: Admissions",
  "title": "Nordics: Admissions In Depth",
  "description": "Admissions across the Nordics — universityadmissions.se and the Danish, Norwegian and Finnish portals, merit-based selection, and free vs fee-paying status.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "universityadmissions-se-sweden-application-portal-explained",
    "denmark-university-application-portal-and-admission-explained",
    "norway-university-admission-and-application-portal-explained",
    "finland-university-application-portal-studyinfo-explained",
    "nordic-admissions-ranking-and-merit-selection-explained"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "nordics: admissions",
    "universityadmissions se sweden application portal explained",
    "denmark university application portal and admission explained",
    "norway university admission and application portal explained"
  ]
},
{
  "slug": "studying-natural-sciences-and-maths-in-europe",
  "label": "Sciences & Maths in Europe",
  "title": "Sciences & Maths in Europe",
  "description": "Studying physics, chemistry, biology and mathematics in Europe — English-taught options and research-led bachelor and master routes.",
  "group": "study-in-europe",
  "region": "europe",
  "guideSlugs": [
    "physics-and-maths-bachelors-in-europe-in-english",
    "studying-chemistry-and-biology-in-the-netherlands",
    "research-masters-in-natural-sciences-in-germany",
    "pure-vs-applied-mathematics-degrees-in-europe",
    "science-bachelors-in-the-nordic-countries-in-english"
  ],
  "examSlugs": [],
  "keywords": [
    "sciences & maths in europe",
    "physics and maths bachelors in europe in english",
    "studying chemistry and biology in the netherlands",
    "research masters in natural sciences in germany"
  ]
},
{
  "slug": "ontario-universities-and-ouac-in-depth",
  "label": "Ontario Universities & OUAC",
  "title": "Ontario Universities & OUAC In Depth",
  "description": "Studying in Ontario — OUAC 101 vs 105, the major Ontario universities and how they differ, and the supplementary applications some programs require.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "ouac-101-vs-105-which-application-to-use",
    "comparing-major-ontario-universities",
    "ontario-supplementary-applications-and-assessments",
    "how-to-fill-the-ouac-application-step-by-step",
    "ontario-university-program-choice-strategy"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "ontario universities & ouac",
    "ouac 101 vs 105 which application to use",
    "comparing major ontario universities",
    "ontario supplementary applications and assessments"
  ]
},
{
  "slug": "western-canada-universities-bc-and-alberta",
  "label": "Western Canada Universities",
  "title": "Western Canada Universities (BC & Alberta)",
  "description": "Studying in British Columbia and Alberta — UBC, SFU and UVic via EducationPlannerBC, and Alberta and Calgary via ApplyAlberta.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "educationplannerbc-application-guide",
    "applyalberta-application-guide",
    "western-canada-university-application-deadlines",
    "ubc-sfu-uvic-which-bc-university",
    "alberta-vs-calgary-university-strengths"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "western canada universities",
    "educationplannerbc application guide",
    "applyalberta application guide",
    "western canada university application deadlines"
  ]
},
{
  "slug": "quebec-universities-and-the-cegep-system",
  "label": "Quebec Universities & CEGEP",
  "title": "Quebec Universities & the CEGEP System",
  "description": "Studying in Quebec — McGill, Concordia, Montréal and Laval, the CEGEP system, English vs French study, and the CAQ alongside the study permit.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "quebec-acceptance-certificate-caq-guide",
    "cegep-system-in-quebec-explained-for-international-students",
    "english-vs-french-universities-in-quebec",
    "french-language-requirements-for-studying-in-quebec",
    "quebec-tuition-tiers-for-international-and-out-of-province-students"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "quebec universities & cegep",
    "quebec acceptance certificate caq guide",
    "cegep system in quebec explained for international students",
    "english vs french universities in quebec"
  ]
},
{
  "slug": "atlantic-and-prairie-universities-canada",
  "label": "Atlantic & Prairie Universities",
  "title": "Atlantic & Prairie Universities",
  "description": "Studying in Canada’s Atlantic and Prairie provinces — Dalhousie, Memorial, UNB, Manitoba and Saskatchewan — often lower-cost, with their own routes and strengths.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "atlantic-canada-universities-guide",
    "prairie-universities-canada-manitoba-saskatchewan",
    "low-cost-canadian-universities-atlantic-prairies",
    "memorial-university-newfoundland-international-guide",
    "atlantic-prairie-provinces-pnp-stay-after-study"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "atlantic & prairie universities",
    "atlantic canada universities guide",
    "prairie universities canada manitoba saskatchewan",
    "low cost canadian universities atlantic prairies"
  ]
},
{
  "slug": "canadian-college-diploma-programs-in-depth",
  "label": "College Diploma Programs",
  "title": "Canadian College Diploma Programs",
  "description": "The Canadian college (applied) route — diplomas, advanced diplomas and post-graduate certificates, the practical fields they cover, and how they differ from degrees.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "canadian-college-credentials-explained",
    "post-graduate-certificate-programs-in-canada",
    "applied-fields-at-canadian-colleges",
    "how-canadian-college-diplomas-are-taught-and-assessed",
    "choosing-a-program-at-a-canadian-college"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "college diploma programs",
    "canadian college credentials explained",
    "post graduate certificate programs in canada",
    "applied fields at canadian colleges"
  ]
},
{
  "slug": "studying-sciences-in-canada",
  "label": "Science Degrees in Canada",
  "title": "Science Degrees in Canada",
  "description": "Studying biology, chemistry, physics, mathematics, biotechnology and environmental science in Canada — what they cover, co-op options and directions.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "biology-and-life-sciences-degrees-in-canada",
    "chemistry-degrees-in-canada-for-international-students",
    "physics-and-mathematics-degrees-in-canada",
    "biotechnology-degrees-in-canada",
    "environmental-science-degrees-in-canada"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "science degrees in canada",
    "biology and life sciences degrees in canada",
    "chemistry degrees in canada for international students",
    "physics and mathematics degrees in canada"
  ]
},
{
  "slug": "studying-arts-humanities-and-social-sciences-canada",
  "label": "Arts & Social Sciences",
  "title": "Arts, Humanities & Social Sciences in Canada",
  "description": "Studying psychology, economics, political science, communications and sociology in Canada — degree structures, joint majors and careers.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "arts-and-social-science-degrees-in-canada-explained",
    "studying-psychology-in-canada",
    "studying-economics-in-canada",
    "political-science-and-international-relations-in-canada",
    "communications-and-sociology-degrees-in-canada"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "arts & social sciences",
    "arts and social science degrees in canada explained",
    "studying psychology in canada",
    "studying economics in canada"
  ]
},
{
  "slug": "studying-trades-and-applied-fields-canada",
  "label": "Trades & Applied Fields",
  "title": "Trades & Applied Fields in Canada",
  "description": "Applied and vocational fields in Canada — trades and apprenticeships, hospitality, aviation, agriculture and design/animation — mostly via colleges.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "skilled-trades-and-apprenticeships-in-canada",
    "hospitality-and-tourism-management-in-canada",
    "aviation-and-pilot-training-in-canada",
    "agriculture-and-agri-food-programs-in-canada",
    "animation-game-design-and-vfx-programs-in-canada"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "trades & applied fields",
    "skilled trades and apprenticeships in canada",
    "hospitality and tourism management in canada",
    "aviation and pilot training in canada"
  ]
},
{
  "slug": "co-op-and-experiential-learning-canada-in-depth",
  "label": "Co-op & Experiential Learning",
  "title": "Co-op & Experiential Learning In Depth",
  "description": "Co-operative education in Canada — the Waterloo model, the co-op work permit, internships and capstones, and which schools are known for it.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "waterloo-co-op-model-explained",
    "how-co-op-terms-and-the-co-op-work-permit-work-together",
    "co-op-vs-internship-vs-capstone-in-canada",
    "best-canadian-universities-and-programs-for-co-op",
    "how-to-succeed-in-a-co-op-job-search-in-canada"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "co-op & experiential learning",
    "waterloo co op model explained",
    "how co op terms and the co op work permit work together",
    "co op vs internship vs capstone in canada"
  ]
},
{
  "slug": "canadian-application-components-in-depth",
  "label": "Application Components In Depth",
  "title": "Canadian Application Components In Depth",
  "description": "The components of a Canadian application — supplementary applications and video/written assessments, references, the personal profile, and program portfolios.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "canadian-supplementary-applications-explained",
    "video-and-written-assessments-canada-toronto-waterloo",
    "personal-profile-for-canadian-applications",
    "references-for-canadian-university-applications",
    "portfolios-and-auditions-for-canadian-programs"
  ],
  "examSlugs": [
    "ielts",
    "toefl"
  ],
  "keywords": [
    "application components in depth",
    "canadian supplementary applications explained",
    "video and written assessments canada toronto waterloo",
    "personal profile for canadian applications"
  ]
},
{
  "slug": "grades-and-credential-recognition-canada",
  "label": "Grades & Credential Recognition",
  "title": "Grades & Credential Recognition (Canada)",
  "description": "How grades and qualifications are recognised for Canadian admission — provincial GPA mapping, IB/A-Level recognition, prerequisites, and WES/IQAS/ICES evaluation.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "provincial-grade-to-gpa-mapping-canada",
    "ib-and-a-levels-recognition-for-canadian-universities",
    "prerequisite-courses-for-canadian-university-admission",
    "credential-evaluation-wes-vs-iqas-vs-ices-canada",
    "getting-foreign-school-systems-recognised-in-canada"
  ],
  "examSlugs": [
    "ielts",
    "international-baccalaureate"
  ],
  "keywords": [
    "grades & credential recognition",
    "provincial grade to gpa mapping canada",
    "ib and a levels recognition for canadian universities",
    "prerequisite courses for canadian university admission"
  ]
},
{
  "slug": "canada-study-permit-process-in-depth",
  "label": "Study Permit Process In Depth",
  "title": "Canada Study Permit Process In Depth",
  "description": "The Canada study permit application in depth — the IRCC account, study permit conditions, changing school or programme, and refusal nuances. Not immigration advice.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "ircc-secure-account-and-study-permit-application-portal",
    "what-happened-to-the-student-direct-stream-sds",
    "study-permit-conditions-you-must-follow-in-canada",
    "changing-your-school-or-program-on-a-canada-study-permit",
    "study-permit-extension-and-restoration-of-status-canada"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "study permit process in depth",
    "ircc secure account and study permit application portal",
    "what happened to the student direct stream sds",
    "study permit conditions you must follow in canada"
  ]
},
{
  "slug": "pgwp-eligibility-and-rules-in-depth",
  "label": "PGWP Eligibility & Rules",
  "title": "PGWP Eligibility & Rules In Depth",
  "description": "Post-Graduation Work Permit eligibility — eligible institutions and programmes, field-of-study and language requirements, length and timing. Deferred to IRCC; not immigration advice.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "pgwp-eligible-institutions-and-programs-canada",
    "pgwp-field-of-study-requirements-canada",
    "pgwp-language-test-requirements-canada",
    "pgwp-permit-length-rules-canada",
    "when-to-apply-for-pgwp-timing-and-deadlines-canada"
  ],
  "examSlugs": [],
  "keywords": [
    "pgwp eligibility & rules",
    "pgwp eligible institutions and programs canada",
    "pgwp field of study requirements canada",
    "pgwp language test requirements canada"
  ]
},
{
  "slug": "pathways-to-permanent-residence-for-students-canada",
  "label": "Pathways to PR for Students",
  "title": "Pathways to PR for Students (Canada)",
  "description": "PR pathways for graduates — Express Entry and the CRS, Provincial Nominee streams, the Canadian Experience Class and Quebec routes. Deferred to IRCC; not immigration advice.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "crs-score-for-international-graduates-canada",
    "provincial-nominee-streams-for-graduates-by-province",
    "canadian-experience-class-for-recent-graduates",
    "quebec-immigration-pathways-for-graduates",
    "french-language-advantage-for-pr-in-canada"
  ],
  "examSlugs": [],
  "keywords": [
    "pathways to pr for students",
    "crs score for international graduates canada",
    "provincial nominee streams for graduates by province",
    "canadian experience class for recent graduates"
  ]
},
{
  "slug": "canadian-scholarships-and-funding-in-depth",
  "label": "Scholarships & Funding In Depth",
  "title": "Canadian Scholarships & Funding In Depth",
  "description": "Scholarships and funding for Canada — automatic entrance scholarships, university and external awards, and graduate funding (TA/RA). Secular criteria only.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "automatic-entrance-scholarships-canadian-universities",
    "graduate-funding-in-canada-ta-ra-and-scholarships",
    "how-to-find-scholarships-for-canada",
    "how-to-write-a-winning-scholarship-application-canada",
    "external-and-third-party-scholarships-for-canada"
  ],
  "examSlugs": [],
  "keywords": [
    "scholarships & funding in depth",
    "automatic entrance scholarships canadian universities",
    "graduate funding in canada ta ra and scholarships",
    "how to find scholarships for canada"
  ]
},
{
  "slug": "paying-for-canada-and-managing-money",
  "label": "Paying & Managing Money",
  "title": "Paying for Canada & Managing Money",
  "description": "Paying for study and managing money in Canada — the GIC and proof of funds, paying tuition, budgeting by city, and what part-time work can contribute. Not financial advice.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "gic-explained-how-it-works-in-canada",
    "paying-tuition-and-money-transfers-to-canada",
    "student-budget-by-city-in-canada",
    "what-part-time-work-can-cover-in-canada",
    "managing-money-banking-credit-taxes-canada"
  ],
  "examSlugs": [],
  "keywords": [
    "paying & managing money",
    "gic explained how it works in canada",
    "paying tuition and money transfers to canada",
    "student budget by city in canada"
  ]
},
{
  "slug": "graduate-study-in-canada-in-depth",
  "label": "Graduate Study In Depth",
  "title": "Graduate Study in Canada In Depth",
  "description": "Graduate study in Canada — course vs thesis masters, PhD admission and funding (TA/RA, Mitacs), finding a supervisor, and how grad applications differ.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "course-based-vs-thesis-masters-in-canada",
    "phd-admission-and-funding-in-canada",
    "how-to-find-and-contact-a-supervisor-in-canada",
    "funding-a-graduate-degree-ta-ra-and-mitacs-canada",
    "graduate-vs-undergraduate-applications-canada"
  ],
  "examSlugs": [
    "gre",
    "gmat"
  ],
  "keywords": [
    "graduate study in depth",
    "course based vs thesis masters in canada",
    "phd admission and funding in canada",
    "how to find and contact a supervisor in canada"
  ]
},
{
  "slug": "english-and-french-tests-for-canada-in-depth",
  "label": "English & French Tests In Depth",
  "title": "English & French Tests for Canada In Depth",
  "description": "English and French tests for Canada — IELTS, TOEFL, PTE and Duolingo for admission, study-permit requirements since the SDS ended, and where CELPIP/TEF fit.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "choosing-an-english-test-for-canada",
    "english-test-scores-for-canadian-universities",
    "language-tests-for-the-canada-study-permit",
    "french-tests-for-canada-tef-vs-tcf",
    "celpip-and-tef-for-canadian-immigration"
  ],
  "examSlugs": [
    "ielts",
    "toefl",
    "duolingo-english-test",
    "pte-academic"
  ],
  "keywords": [
    "english & french tests in depth",
    "choosing an english test for canada",
    "english test scores for canadian universities",
    "language tests for the canada study permit"
  ]
},
{
  "slug": "settling-and-living-in-canada-in-depth",
  "label": "Settling & Living In Depth",
  "title": "Settling & Living in Canada In Depth",
  "description": "Settling into Canada — provincial health coverage (OHIP, MSP), winter prep, housing and tenant rights, banking and credit, transit, and the SIN and taxes.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "provincial-health-coverage-for-students-in-canada",
    "preparing-for-canadian-winter-as-a-student",
    "housing-types-and-tenant-rights-in-canada",
    "building-credit-and-banking-in-canada-for-students",
    "sin-and-basic-taxes-for-students-in-canada"
  ],
  "examSlugs": [],
  "keywords": [
    "settling & living in depth",
    "provincial health coverage for students in canada",
    "preparing for canadian winter as a student",
    "housing types and tenant rights in canada"
  ]
},
{
  "slug": "canadian-campus-and-community-life-in-depth",
  "label": "Campus & Community Life",
  "title": "Canadian Campus & Community Life",
  "description": "Campus and community life in Canada — clubs and student unions, international-student services, mental-health support, equity and Indigenous support, and finding community.",
  "group": "study-in-canada",
  "region": "canada",
  "guideSlugs": [
    "student-clubs-and-unions-canada",
    "international-student-services-and-orientation-canada",
    "mental-health-and-wellness-support-canada-universities",
    "equity-diversity-and-indigenous-support-canada-campuses",
    "campus-jobs-and-finding-community-canada"
  ],
  "examSlugs": [],
  "keywords": [
    "campus & community life",
    "student clubs and unions canada",
    "international student services and orientation canada",
    "mental health and wellness support canada universities"
  ]
},
{
  "slug": "ucas-application-in-depth-uk",
  "label": "UCAS Application In Depth",
  "title": "The UCAS Application In Depth",
  "description": "The UCAS undergraduate application in depth — the personal statement, references and predicted grades, UCAS Extra, deferred entry, offers and Confirmation/results day.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "ucas-personal-statement-three-questions-format-explained",
    "ucas-firm-and-insurance-choice-strategy",
    "ucas-extra-and-extra-choices-explained",
    "contextual-and-unconditional-offers-explained",
    "ucas-confirmation-and-results-day-explained"
  ],
  "examSlugs": [
    "a-levels",
    "international-baccalaureate"
  ],
  "keywords": [
    "ucas application in depth",
    "ucas personal statement three questions format explained",
    "ucas firm and insurance choice strategy",
    "ucas extra and extra choices explained"
  ]
},
{
  "slug": "uk-entry-routes-and-qualifications",
  "label": "Entry Routes & Qualifications",
  "title": "UK Entry Routes & Qualifications",
  "description": "How A-Levels, BTEC and T-Levels, the IB, Scottish Highers, Access to HE and foundation routes enter UK and Irish universities — and how entry requirements map across them.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "uk-a-levels-entry-requirements-explained",
    "btec-and-t-levels-for-uk-university-entry",
    "international-baccalaureate-for-uk-and-ireland-universities",
    "scottish-highers-and-advanced-highers-for-university-entry",
    "access-to-he-and-mature-student-entry-routes-uk-ireland"
  ],
  "examSlugs": [
    "a-levels",
    "international-baccalaureate"
  ],
  "keywords": [
    "entry routes & qualifications",
    "uk a levels entry requirements explained",
    "btec and t levels for uk university entry",
    "international baccalaureate for uk and ireland universities"
  ]
},
{
  "slug": "ireland-cao-and-leaving-cert-in-depth",
  "label": "Ireland: CAO & Leaving Cert",
  "title": "Ireland: CAO & Leaving Cert In Depth",
  "description": "Applying to Irish universities — how CAO points work, the Leaving Certificate, the HPAT for medicine, the QQI/FET route and mature/international applicants.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "how-cao-points-are-calculated-leaving-cert",
    "qqi-fet-route-to-irish-universities-explained",
    "mature-applicant-route-to-irish-universities",
    "eu-vs-non-eu-applicants-to-irish-universities"
  ],
  "examSlugs": [
    "international-baccalaureate"
  ],
  "keywords": [
    "ireland: cao & leaving cert",
    "how cao points are calculated leaving cert",
    "hpat for medicine in ireland explained",
    "qqi fet route to irish universities explained"
  ]
},
{
  "slug": "oxbridge-and-the-collegiate-system",
  "label": "Oxbridge & the Collegiate System",
  "title": "Oxbridge & the Collegiate System",
  "description": "How Oxford and Cambridge work — the collegiate system, choosing or being pooled to a college, the tutorial/supervision model, and the admissions-test and interview landscape.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "oxbridge-collegiate-system-explained",
    "how-to-choose-an-oxbridge-college",
    "open-application-vs-college-choice-oxbridge",
    "oxbridge-tutorial-and-supervision-system-explained",
    "oxbridge-admissions-tests-and-interviews-landscape"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "oxbridge & the collegiate system",
    "oxbridge collegiate system explained",
    "how to choose an oxbridge college",
    "open application vs college choice oxbridge"
  ]
},
{
  "slug": "russell-group-universities-in-depth",
  "label": "Russell Group In Depth",
  "title": "Russell Group Universities In Depth",
  "description": "Choosing among Russell Group universities by subject strength and setting — collegiate, civic and campus universities, and strong options beyond London and Oxbridge.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "collegiate-vs-civic-vs-campus-universities-uk",
    "how-to-choose-a-russell-group-university-by-subject-strength",
    "research-intensity-and-the-ref-for-uk-university-choice",
    "northern-powerhouse-russell-group-universities-explained",
    "russell-group-vs-non-russell-group-universities-uk"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "russell group in depth",
    "collegiate vs civic vs campus universities uk",
    "how to choose a russell group university by subject strength",
    "research intensity and the ref for uk university choice"
  ]
},
{
  "slug": "uk-university-groups-and-league-tables",
  "label": "University Groups & League Tables",
  "title": "UK University Groups & League Tables",
  "description": "Making sense of UK university groupings and rankings — Russell Group, Mission Group and post-92, and how the UK league tables are built and what they measure.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "uk-university-mission-groups-explained",
    "pre-92-vs-post-92-universities-uk-explained",
    "how-uk-university-league-tables-are-compiled",
    "uk-league-tables-vs-global-rankings-explained",
    "what-uk-university-rankings-do-not-measure"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "university groups & league tables",
    "uk university mission groups explained",
    "pre 92 vs post 92 universities uk explained",
    "how uk university league tables are compiled"
  ]
},
{
  "slug": "scotland-wales-northern-ireland-study",
  "label": "Scotland, Wales & NI",
  "title": "Studying in Scotland, Wales & Northern Ireland",
  "description": "The UK’s devolved systems — Scotland’s four-year degrees, Welsh universities and Northern Ireland — and how fees and funding differ by nation.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "why-scottish-degrees-take-four-years-explained",
    "studying-in-wales-universities-and-the-welsh-medium",
    "studying-in-northern-ireland-universities-guide",
    "how-uk-tuition-fees-and-funding-differ-by-nation",
    "saas-student-funding-in-scotland-explained"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "scotland, wales & ni",
    "why scottish degrees take four years explained",
    "studying in wales universities and the welsh medium",
    "studying in northern ireland universities guide"
  ]
},
{
  "slug": "studying-economics-and-finance-uk-ireland",
  "label": "Economics & Finance Degrees",
  "title": "Economics & Finance Degrees (UK & Ireland)",
  "description": "Studying economics, finance and accounting in the UK and Ireland — degree structures, joint honours, and professional accreditation like ICAEW and ACCA.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "studying-economics-in-the-uk-and-ireland",
    "ppe-and-economics-joint-honours-degrees-explained",
    "studying-accounting-and-finance-in-the-uk-and-ireland",
    "professional-accounting-accreditation-icaew-acca-cima-explained",
    "finance-careers-and-degrees-banking-and-fintech-uk-ireland"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "economics & finance degrees",
    "studying economics in the uk and ireland",
    "ppe and economics joint honours degrees explained",
    "studying accounting and finance in the uk and ireland"
  ]
},
{
  "slug": "studying-psychology-uk-ireland",
  "label": "Psychology Degrees",
  "title": "Psychology Degrees (UK & Ireland)",
  "description": "Studying psychology in the UK and Ireland — BPS/PSI accreditation, conversion courses, applied vs research routes and careers.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "studying-psychology-in-the-uk-and-ireland-bps-psi-accreditation",
    "graduate-basis-for-chartered-membership-gbc-explained",
    "psychology-conversion-courses-in-the-uk-and-ireland",
    "applied-vs-research-psychology-degree-routes-uk-ireland",
    "psychology-career-pathways-uk-ireland-clinical-educational-and-beyond"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "psychology degrees",
    "studying psychology in the uk and ireland bps psi accreditation",
    "graduate basis for chartered membership gbc explained",
    "psychology conversion courses in the uk and ireland"
  ]
},
{
  "slug": "studying-natural-and-life-sciences-uk-ireland",
  "label": "Natural & Life Sciences",
  "title": "Natural & Life Sciences Degrees (UK & Ireland)",
  "description": "Studying biology, biomedical sciences, chemistry, physics and natural sciences in the UK and Ireland — including integrated masters and placements.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "studying-biological-and-biomedical-sciences-in-the-uk-and-ireland",
    "integrated-masters-msci-and-mphys-science-degrees-explained",
    "natural-sciences-degrees-in-the-uk-and-ireland-explained",
    "science-degrees-with-a-year-in-industry-or-research-placement",
    "choosing-and-applying-for-physics-and-chemistry-degrees-uk-ireland"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "natural & life sciences",
    "studying biological and biomedical sciences in the uk and ireland",
    "integrated masters msci and mphys science degrees explained",
    "natural sciences degrees in the uk and ireland explained"
  ]
},
{
  "slug": "studying-humanities-and-social-sciences-uk-ireland",
  "label": "Humanities & Social Sciences",
  "title": "Humanities & Social Sciences (UK & Ireland)",
  "description": "Studying history, English, politics, sociology, philosophy and joint degrees like PPE in the UK and Ireland — what they involve and where they lead.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "studying-humanities-and-social-sciences-in-the-uk-and-ireland",
    "joint-honours-and-combined-degrees-in-the-uk-explained",
    "studying-ppe-philosophy-politics-economics-in-the-uk",
    "studying-history-and-english-literature-in-the-uk-and-ireland",
    "where-humanities-degrees-lead-careers-after-arts-and-social-sciences-uk"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "humanities & social sciences",
    "studying humanities and social sciences in the uk and ireland",
    "joint honours and combined degrees in the uk explained",
    "studying ppe philosophy politics economics in the uk"
  ]
},
{
  "slug": "studying-art-design-and-architecture-uk-ireland",
  "label": "Art, Design & Architecture",
  "title": "Art, Design & Architecture (UK & Ireland)",
  "description": "Studying art, design and architecture in the UK and Ireland — the art foundation, portfolio degrees, architecture (RIBA/ARB) and the conservatoire route.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "art-foundation-diploma-uk-explained",
    "building-an-art-and-design-portfolio-for-uk-applications",
    "how-to-study-architecture-in-the-uk-riba-arb-part-1",
    "ucas-conservatoires-music-and-drama-route-explained",
    "top-uk-and-ireland-art-design-and-architecture-schools-for-international-students"
  ],
  "examSlugs": [
    "a-levels"
  ],
  "keywords": [
    "art, design & architecture",
    "art foundation diploma uk explained",
    "building an art and design portfolio for uk applications",
    "how to study architecture in the uk riba arb part 1"
  ]
},
{
  "slug": "uk-ireland-admissions-tests-in-depth",
  "label": "Admissions Tests In Depth",
  "title": "UK & Ireland Admissions Tests In Depth",
  "description": "The UK and Ireland university admissions tests — UCAT, TMUA and ESAT, STEP, MAT and PAT, the LNAT and the HPAT — what each assesses and how to prepare.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "tmua-and-esat-admissions-tests-explained",
    "step-maths-exam-guide-for-uk-universities",
    "pat-physics-aptitude-test-guide-for-oxford",
    "hpat-exam-guide-for-irish-medicine",
    "how-to-prepare-for-uk-and-ireland-admissions-tests"
  ],
  "examSlugs": [
    "ucat"
  ],
  "keywords": [
    "admissions tests in depth",
    "tmua and esat admissions tests explained",
    "step maths exam guide for uk universities",
    "pat physics aptitude test guide for oxford"
  ]
},
{
  "slug": "healthcare-degrees-beyond-medicine-uk-ireland",
  "label": "Healthcare Degrees Beyond Medicine",
  "title": "Healthcare Degrees Beyond Medicine (UK & Ireland)",
  "description": "Nursing and midwifery, pharmacy, physiotherapy, allied health and optometry in the UK and Ireland — including the regulators and registration.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "how-to-study-nursing-and-midwifery-in-the-uk-and-ireland",
    "how-to-study-pharmacy-in-the-uk-and-ireland",
    "how-to-study-physiotherapy-in-the-uk-and-ireland",
    "allied-health-professions-degrees-in-the-uk-and-ireland-explained",
    "healthcare-regulators-and-registration-for-international-graduates-uk-ireland"
  ],
  "examSlugs": [
    "ucat"
  ],
  "keywords": [
    "healthcare degrees beyond medicine",
    "how to study nursing and midwifery in the uk and ireland",
    "how to study pharmacy in the uk and ireland",
    "how to study physiotherapy in the uk and ireland"
  ]
},
{
  "slug": "uk-ireland-tuition-and-funding-in-depth",
  "label": "Tuition & Funding In Depth",
  "title": "UK & Ireland Tuition & Funding In Depth",
  "description": "How home vs international fee status is decided, what Student Finance covers for eligible students, university bursaries and postgraduate loans. Not financial advice.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "uk-home-vs-international-fee-status-explained",
    "uk-student-finance-loans-explained-tuition-and-maintenance",
    "ireland-free-fees-initiative-and-susi-grants-explained",
    "university-bursaries-hardship-and-access-funds-uk-ireland",
    "postgraduate-loans-and-funding-uk-and-ireland-explained"
  ],
  "examSlugs": [],
  "keywords": [
    "tuition & funding in depth",
    "uk home vs international fee status explained",
    "uk student finance loans explained tuition and maintenance",
    "ireland free fees initiative and susi grants explained"
  ]
},
{
  "slug": "uk-student-visa-process-in-depth",
  "label": "Student Visa Process In Depth",
  "title": "UK Student Visa Process In Depth",
  "description": "The UK Student visa process — the eVisa, ATAS, points-based requirements and credibility, biometrics, and the Short-term study route. Not immigration advice.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "uk-evisa-and-share-code-for-students-explained",
    "atas-clearance-for-uk-student-visas-explained",
    "uk-student-visa-points-and-credibility-requirements",
    "uk-student-visa-biometrics-and-decision-process",
    "short-term-study-and-visitor-routes-for-short-courses-uk"
  ],
  "examSlugs": [
    "ielts"
  ],
  "keywords": [
    "student visa process in depth",
    "uk evisa and share code for students explained",
    "atas clearance for uk student visas explained",
    "uk student visa points and credibility requirements"
  ]
},
{
  "slug": "uk-graduate-and-work-visa-routes-in-depth",
  "label": "Graduate & Work Visa Routes",
  "title": "UK & Ireland Graduate & Work Visa Routes",
  "description": "Staying to work — the Graduate Route, the Skilled Worker route and sponsorship, Global Talent and High Potential Individual, and Ireland’s Stamp 1G. Not immigration advice.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "switching-from-graduate-route-to-skilled-worker-visa-uk",
    "uk-skilled-worker-sponsorship-and-finding-a-licensed-sponsor",
    "uk-global-talent-and-high-potential-individual-visa-routes",
    "ireland-stamp-1g-to-employment-permit-and-stamp-1-pathway",
    "uk-and-ireland-path-to-settlement-after-work-visas"
  ],
  "examSlugs": [],
  "keywords": [
    "graduate & work visa routes",
    "switching from graduate route to skilled worker visa uk",
    "uk skilled worker sponsorship and finding a licensed sponsor",
    "uk global talent and high potential individual visa routes"
  ]
},
{
  "slug": "graduate-careers-and-employability-uk-ireland",
  "label": "Graduate Careers & Employability",
  "title": "Graduate Careers & Employability (UK & Ireland)",
  "description": "Building employability — placement years and internships, professional accreditation, careers services and graduate schemes in the UK and Ireland.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "placement-years-and-internships-in-the-uk-and-ireland",
    "professional-accreditation-for-uk-and-ireland-degrees",
    "using-university-careers-services-in-the-uk-and-ireland",
    "uk-and-ireland-graduate-schemes-explained",
    "building-employability-skills-while-studying-in-the-uk-and-ireland"
  ],
  "examSlugs": [],
  "keywords": [
    "graduate careers & employability",
    "placement years and internships in the uk and ireland",
    "professional accreditation for uk and ireland degrees",
    "using university careers services in the uk and ireland"
  ]
},
{
  "slug": "settling-into-uk-ireland-student-life",
  "label": "Settling In: Practicalities",
  "title": "Settling Into UK & Ireland Student Life",
  "description": "Settling in — the BRP/eVisa, registering with a GP and TB tests, council-tax exemption, bank accounts, SIM and transport, and term dates.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "collecting-your-brp-or-activating-your-uk-evisa",
    "registering-with-a-gp-and-tb-test-requirements-uk-ireland",
    "council-tax-exemption-for-students-in-the-uk",
    "opening-a-student-bank-account-and-getting-a-uk-or-irish-sim",
    "student-transport-cards-and-term-dates-in-the-uk-and-ireland"
  ],
  "examSlugs": [],
  "keywords": [
    "settling in: practicalities",
    "collecting your brp or activating your uk evisa",
    "registering with a gp and tb test requirements uk ireland",
    "council tax exemption for students in the uk"
  ]
},
{
  "slug": "postgraduate-and-research-study-uk-ireland",
  "label": "Postgraduate & Research Study",
  "title": "Postgraduate & Research Study (UK & Ireland)",
  "description": "Taught vs research masters, the one-year masters and MRes, PhD funding and studentships, and postgraduate loans in the UK and Ireland.",
  "group": "study-in-uk-ireland",
  "region": "uk-ireland",
  "guideSlugs": [
    "taught-vs-research-masters-in-the-uk-and-ireland",
    "mres-and-one-year-masters-formats-explained",
    "how-to-fund-a-phd-in-the-uk-and-ireland",
    "how-to-find-a-phd-supervisor-and-write-a-research-proposal",
    "postgraduate-masters-loans-for-uk-and-ireland-study"
  ],
  "examSlugs": [
    "gre",
    "gmat"
  ],
  "keywords": [
    "postgraduate & research study",
    "taught vs research masters in the uk and ireland",
    "mres and one year masters formats explained",
    "how to fund a phd in the uk and ireland"
  ]
},
{
  "slug": "ivy-and-elite-admissions-deep-dive",
  "label": "Elite Admissions Deep-Dive",
  "title": "Elite & Ivy Admissions, In Depth",
  "description": "How highly selective US admissions really work — holistic review, institutional priorities, hooks and demonstrated interest — beyond the basics, with official sources.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "how-elite-colleges-shape-a-class",
    "admissions-hooks-explained",
    "demonstrated-interest-at-elite-schools",
    "what-moves-the-needle-elite-admissions",
    "how-holistic-review-is-scored"
  ],
  "examSlugs": [
    "sat",
    "act",
    "ap-exams"
  ],
  "keywords": [
    "elite admissions deep-dive",
    "how elite colleges shape a class",
    "admissions hooks explained",
    "demonstrated interest at elite schools"
  ]
},
{
  "slug": "public-universities-and-systems-usa",
  "label": "Public Universities & Systems",
  "title": "US Public Universities & State Systems",
  "description": "The US public-university landscape — the UC system, state flagships, in-state vs out-of-state tuition and honors colleges — and how to weigh public vs private.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "university-of-california-system-and-application-guide",
    "state-flagship-universities-explained",
    "in-state-vs-out-of-state-admission-and-tuition",
    "honors-colleges-at-public-universities-guide",
    "public-vs-private-university-value-comparison"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "public universities & systems",
    "university of california system and application guide",
    "state flagship universities explained",
    "in state vs out of state admission and tuition"
  ]
},
{
  "slug": "choosing-and-comparing-us-colleges",
  "label": "Choosing & Comparing Colleges",
  "title": "Choosing & Comparing US Colleges",
  "description": "How to choose and compare US colleges beyond rankings — fit, visits, outcomes data and building a balanced list — with neutral, official-source guidance.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "college-fit-how-to-define-it",
    "campus-visits-and-virtual-tours-guide",
    "what-college-rankings-do-and-dont-measure",
    "college-location-size-and-setting-guide",
    "retention-graduation-and-outcomes-data-guide"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "choosing & comparing colleges",
    "college fit how to define it",
    "campus visits and virtual tours guide",
    "what college rankings do and dont measure"
  ]
},
{
  "slug": "stem-majors-deep-dive-usa",
  "label": "STEM Majors Deep-Dive",
  "title": "US STEM Majors, In Depth",
  "description": "Specific US STEM majors — physics, biology, chemistry, mathematics, statistics, neuroscience and environmental science — what each studies and where it leads.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "physics-and-astronomy-major-guide-usa",
    "biology-major-guide-usa",
    "chemistry-major-guide-usa",
    "mathematics-and-statistics-majors-usa",
    "neuroscience-and-environmental-science-majors-usa"
  ],
  "examSlugs": [
    "sat",
    "act",
    "ap-exams"
  ],
  "keywords": [
    "stem majors deep-dive",
    "physics and astronomy major guide usa",
    "biology major guide usa",
    "chemistry major guide usa"
  ]
},
{
  "slug": "engineering-disciplines-usa",
  "label": "Engineering Disciplines",
  "title": "US Engineering Disciplines",
  "description": "The specific US engineering disciplines — mechanical, electrical, civil, chemical, aerospace, biomedical and industrial — what sets each apart, plus ABET accreditation.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "abet-accreditation-explained",
    "biomedical-engineering-major-usa",
    "industrial-and-systems-engineering-major-usa",
    "how-to-choose-an-engineering-discipline",
    "engineering-licensure-fe-and-pe-exams-explained"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "engineering disciplines",
    "abet accreditation explained",
    "biomedical engineering major usa",
    "industrial and systems engineering major usa"
  ]
},
{
  "slug": "business-and-economics-majors-usa",
  "label": "Business & Economics Majors",
  "title": "US Business & Economics Majors",
  "description": "Specific US business and economics majors — accounting, marketing, management, economics and entrepreneurship — and the undergraduate business-school route.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "accounting-major-guide-usa",
    "economics-vs-business-major-which-to-choose",
    "marketing-major-guide-usa",
    "supply-chain-and-operations-management-major-usa",
    "how-to-get-into-undergraduate-business-school-usa"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "business & economics majors",
    "accounting major guide usa",
    "economics vs business major which to choose",
    "marketing major guide usa"
  ]
},
{
  "slug": "humanities-and-social-science-majors-usa",
  "label": "Humanities & Social Sciences",
  "title": "US Humanities & Social-Science Majors",
  "description": "US humanities and social-science majors — psychology, political science, sociology, history, English and communications — what they study and career directions.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "psychology-major-guide-usa",
    "political-science-and-international-relations-majors-usa",
    "history-and-philosophy-majors-career-value-usa",
    "english-and-communications-majors-usa",
    "sociology-and-the-social-sciences-major-guide-usa"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "humanities & social sciences",
    "psychology major guide usa",
    "political science and international relations majors usa",
    "history and philosophy majors career value usa"
  ]
},
{
  "slug": "health-profession-majors-usa",
  "label": "Health-Profession Majors",
  "title": "US Health-Profession Majors",
  "description": "US health-profession and pre-professional majors — public health, kinesiology, nutrition and the pre-dental, pre-pharmacy and pre-vet tracks — described factually.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "public-health-major-guide-usa",
    "kinesiology-and-exercise-science-major-usa",
    "nutrition-and-dietetics-major-usa",
    "pre-dental-track-explained-usa",
    "pre-pharmacy-and-pre-vet-tracks-usa"
  ],
  "examSlugs": [
    "sat",
    "act",
    "mcat"
  ],
  "keywords": [
    "health-profession majors",
    "public health major guide usa",
    "kinesiology and exercise science major usa",
    "nutrition and dietetics major usa"
  ]
},
{
  "slug": "arts-architecture-design-majors-usa",
  "label": "Arts, Architecture & Design Majors",
  "title": "US Arts, Architecture & Design Majors",
  "description": "US arts and design majors and how their admission differs — architecture, design, film, music, theater and fine arts — including portfolios and auditions.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "art-and-design-portfolio-for-us-colleges",
    "applying-to-us-architecture-programs-barch-vs-bs",
    "music-and-theater-auditions-for-us-colleges",
    "film-and-media-arts-majors-admission-usa",
    "bfa-vs-ba-in-arts-which-degree-to-choose"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "arts, architecture & design majors",
    "art and design portfolio for us colleges",
    "applying to us architecture programs barch vs bs",
    "music and theater auditions for us colleges"
  ]
},
{
  "slug": "application-components-deep-dive-usa",
  "label": "Application Components Deep-Dive",
  "title": "US Application Components, In Depth",
  "description": "The pieces of a US application in depth — the activities list, additional-information section, portfolios, interviews and strong recommendations.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "activities-list-strategy-common-app",
    "additional-information-section-explained",
    "portfolios-and-auditions-for-us-colleges",
    "college-admissions-interview-guide",
    "how-to-ask-for-strong-recommendation-letters"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "application components deep-dive",
    "activities list strategy common app",
    "additional information section explained",
    "portfolios and auditions for us colleges"
  ]
},
{
  "slug": "college-essay-mastery-usa",
  "label": "College Essay Mastery",
  "title": "Mastering the US College Essay",
  "description": "Going deeper on the US college essay — brainstorming, structuring the personal statement, voice and revision, the diversity essay and common mistakes.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "how-to-brainstorm-college-essay-topics",
    "how-to-structure-a-personal-statement",
    "developing-voice-and-revising-college-essays",
    "writing-the-diversity-and-identity-essay",
    "common-college-essay-mistakes-to-avoid"
  ],
  "examSlugs": [],
  "keywords": [
    "college essay mastery",
    "how to brainstorm college essay topics",
    "how to structure a personal statement",
    "developing voice and revising college essays"
  ]
},
{
  "slug": "admissions-strategy-and-positioning-usa",
  "label": "Admissions Strategy & Positioning",
  "title": "US Admissions Strategy & Positioning",
  "description": "Strategy across the whole US application — spike vs well-rounded, narrative, school-list strategy by selectivity, Early Decision and fee waivers.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "spike-vs-well-rounded-applicant",
    "building-a-coherent-application-narrative",
    "balancing-your-college-list-by-selectivity",
    "when-early-decision-is-worth-it",
    "college-application-fee-waivers-explained"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "admissions strategy & positioning",
    "spike vs well rounded applicant",
    "building a coherent application narrative",
    "balancing your college list by selectivity"
  ]
},
{
  "slug": "ap-ib-and-college-credit-usa",
  "label": "AP, IB & College Credit",
  "title": "AP, IB & US College Credit",
  "description": "Earning and using US college credit — choosing AP courses by subject, AP score requirements, IB credit, CLEP exams and how credit transfers.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "ap-courses-by-subject-which-to-take",
    "how-ap-score-requirements-vary-by-college",
    "ib-diploma-college-credit-in-usa",
    "clep-exams-for-college-credit-explained",
    "how-college-credit-transfers-between-schools"
  ],
  "examSlugs": [
    "ap-exams",
    "international-baccalaureate"
  ],
  "keywords": [
    "ap, ib & college credit",
    "ap courses by subject which to take",
    "how ap score requirements vary by college",
    "ib diploma college credit in usa"
  ]
},
{
  "slug": "test-prep-and-test-day-deep-dive-usa",
  "label": "Test Prep & Test Day",
  "title": "SAT/ACT Prep & Test Day, In Depth",
  "description": "Deeper SAT/ACT prep and logistics — the digital SAT section by section, ACT strategies, score choice, retaking, accommodations and test-day readiness.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "digital-sat-section-by-section-strategy",
    "act-section-strategies-and-pacing",
    "sat-act-score-choice-and-which-scores-to-send",
    "should-you-retake-the-sat-or-act",
    "sat-act-testing-accommodations-explained"
  ],
  "examSlugs": [
    "sat",
    "act"
  ],
  "keywords": [
    "test prep & test day",
    "digital sat section by section strategy",
    "act section strategies and pacing",
    "sat act score choice and which scores to send"
  ]
},
{
  "slug": "scholarships-deep-dive-usa",
  "label": "Scholarships Deep-Dive",
  "title": "US Scholarships, In Depth",
  "description": "Specific US scholarship types and how to win them — state, departmental, ROTC, employer and external awards — with scam-avoidance and secular criteria only.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "state-scholarships-and-grants-usa",
    "departmental-and-merit-scholarships-from-colleges",
    "rotc-and-military-scholarships-explained",
    "external-and-private-scholarship-databases",
    "how-to-avoid-scholarship-scams"
  ],
  "examSlugs": [],
  "keywords": [
    "scholarships deep-dive",
    "state scholarships and grants usa",
    "departmental and merit scholarships from colleges",
    "rotc and military scholarships explained"
  ]
},
{
  "slug": "financing-strategies-and-loans-usa",
  "label": "Financing Strategies & Loans",
  "title": "Paying for College: Strategies & Loans",
  "description": "Strategies and tools for paying for US college — 529 plans, aid appeals, federal vs private loans and repayment — factual, not financial advice.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "529-college-savings-plans-explained",
    "how-to-appeal-a-financial-aid-offer",
    "student-loan-repayment-plans-explained",
    "plus-loans-and-private-student-loans-explained",
    "budgeting-for-college-as-a-student"
  ],
  "examSlugs": [],
  "keywords": [
    "financing strategies & loans",
    "529 college savings plans explained",
    "how to appeal a financial aid offer",
    "student loan repayment plans explained"
  ]
},
{
  "slug": "graduate-programs-by-field-usa",
  "label": "Graduate Programs by Field",
  "title": "US Graduate Programs by Field",
  "description": "US graduate admissions by field — MS in engineering and CS, MPH, MFA, MEd, MSW, MPP and MS finance — how each programme’s admissions and funding differ.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "ms-engineering-cs-admissions-funding-usa",
    "mph-admissions-and-funding-usa",
    "mfa-admissions-portfolio-funding-usa",
    "med-msw-mpp-admissions-funding-usa",
    "ms-finance-vs-mba-admissions-funding-usa"
  ],
  "examSlugs": [
    "gre",
    "gmat"
  ],
  "keywords": [
    "graduate programs by field",
    "ms engineering cs admissions funding usa",
    "mph admissions and funding usa",
    "mfa admissions portfolio funding usa"
  ]
},
{
  "slug": "professional-school-admissions-usa",
  "label": "Professional School Admissions",
  "title": "US Professional-School Admissions",
  "description": "US professional-school admissions in depth — medical (MCAT/AMCAS), law (LSAT/LSAC), and dental, pharmacy, veterinary, optometry and PA routes.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "mcat-and-amcas-medical-school-application-guide",
    "lsat-and-lsac-cas-law-school-application-guide",
    "dental-and-pharmacy-school-admissions-usa",
    "veterinary-and-optometry-school-admissions-usa",
    "physician-assistant-school-admissions-usa"
  ],
  "examSlugs": [
    "mcat",
    "lsat",
    "gre"
  ],
  "keywords": [
    "professional school admissions",
    "mcat and amcas medical school application guide",
    "lsat and lsac cas law school application guide",
    "dental and pharmacy school admissions usa"
  ]
},
{
  "slug": "international-student-life-and-work-usa",
  "label": "International Student Life & Work",
  "title": "International Student Life & Work in the USA",
  "description": "Practicalities for international students in the US — maintaining F-1 status and SEVIS, work rules, travel, taxes and banking — neutral facts, not immigration advice.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "maintaining-f1-status-and-sevis-rules",
    "off-campus-work-authorization-for-f1-students",
    "f1-travel-and-reentry-to-the-usa",
    "taxes-for-international-students-in-usa",
    "settling-in-as-an-international-student-usa"
  ],
  "examSlugs": [
    "toefl",
    "ielts",
    "duolingo-english-test"
  ],
  "keywords": [
    "international student life & work",
    "maintaining f1 status and sevis rules",
    "off campus work authorization for f1 students",
    "f1 travel and reentry to the usa"
  ]
},
{
  "slug": "campus-life-and-student-support-usa",
  "label": "Campus Life & Student Support",
  "title": "US Campus Life & Student Support",
  "description": "US campus life and support systems — housing, clubs, mental-health and career services, study abroad, safety, disability and first-generation support.",
  "group": "study-in-usa",
  "region": "usa",
  "guideSlugs": [
    "greek-life-fraternities-sororities-explained",
    "campus-mental-health-and-wellness-resources",
    "college-career-services-and-internships",
    "study-abroad-programs-during-us-college",
    "campus-safety-and-disability-support-services"
  ],
  "examSlugs": [],
  "keywords": [
    "campus life & student support",
    "greek life fraternities sororities explained",
    "campus mental health and wellness resources",
    "college career services and internships"
  ]
},
{
  "slug": "foreign-nri-admission-routes",
  "label": "Foreign & NRI Admission Routes",
  "title": "Foreign & NRI Admission Routes to Indian Colleges",
  "description": "How foreign nationals, NRIs and OCI/PIO students get into Indian colleges — the DASA scheme, NRI and supernumerary seats, and the engineering, medical and university routes — each deferred to its official source.",
  "group": "fields",
  "guideSlugs": [
    "how-foreign-nationals-apply-to-indian-colleges",
    "dasa-scheme-for-foreign-and-nri-students",
    "nri-quota-and-supernumerary-seats-explained",
    "oci-and-pio-students-studying-in-india",
    "engineering-admission-in-india-for-foreign-students",
    "mbbs-in-india-for-foreign-and-nri-students",
    "university-admission-in-india-for-foreign-students"
  ],
  "examSlugs": [],
  "keywords": [
    "foreign & nri admission routes",
    "foreign students india",
    "nri oci admission india"
  ]
},
{
  "slug": "studying-in-india-as-an-international-student",
  "label": "Studying in India as an International Student",
  "title": "Studying in India as an International Student",
  "description": "The practical side for foreign students in India — the Indian student visa, fees, ICCR and Study in India scholarships, and FRRO registration — neutral, official-source facts.",
  "group": "fields",
  "guideSlugs": [
    "student-visa-for-studying-in-india",
    "fees-for-international-students-in-india",
    "scholarships-for-international-students-in-india",
    "study-in-india-programme-explained",
    "living-in-india-as-an-international-student"
  ],
  "examSlugs": [],
  "keywords": [
    "studying in india as an international student",
    "foreign students india",
    "nri oci admission india"
  ]
},
{
  "slug": "medical-pg-and-specialisation",
  "label": "Medical PG & Specialisation",
  "title": "Medical PG & Specialisation in India",
  "description": "Postgraduate medicine after MBBS — NEET-PG, MD/MS and DNB, super-specialities, and the licensing exams — with official regulator sources.",
  "group": "fields",
  "guideSlugs": [
    "md-vs-ms-which-specialisation-to-choose",
    "how-to-become-a-medical-specialist-in-india",
    "neet-ss-and-super-specialty-courses",
    "fmge-and-next-licensing-exam-guide",
    "dnb-vs-md-ms-explained"
  ],
  "examSlugs": [],
  "keywords": [
    "medical pg & specialisation",
    "md vs ms which specialisation to choose",
    "how to become a medical specialist in india",
    "neet ss and super specialty courses"
  ]
},
{
  "slug": "ayush-and-alternative-medicine",
  "label": "AYUSH & Alternative Medicine",
  "title": "AYUSH & Alternative Medicine Courses",
  "description": "Secular, regulated AYUSH degree courses after NEET — homeopathy, Unani, naturopathy and Ayurveda — plus veterinary science, with official sources.",
  "group": "fields",
  "guideSlugs": [
    "bhms-homeopathy-course-guide",
    "bums-unani-medicine-course-guide",
    "bnys-naturopathy-and-yoga-course-guide",
    "ayush-courses-and-careers",
    "how-to-become-a-veterinary-doctor"
  ],
  "examSlugs": [],
  "keywords": [
    "ayush & alternative medicine",
    "bhms homeopathy course guide",
    "bums unani medicine course guide",
    "bnys naturopathy and yoga course guide"
  ]
},
{
  "slug": "allied-and-paramedical-health",
  "label": "Allied & Paramedical Health",
  "title": "Allied & Paramedical Health Courses",
  "description": "Allied-health and paramedical degrees — occupational therapy, optometry, lab technology, imaging and nutrition — and how to qualify, from official sources.",
  "group": "fields",
  "guideSlugs": [
    "occupational-therapy-course-guide",
    "optometry-course-and-career-guide",
    "medical-lab-technology-course-guide",
    "radiology-and-imaging-technology-courses",
    "nutrition-and-dietetics-course-guide"
  ],
  "examSlugs": [],
  "keywords": [
    "allied & paramedical health",
    "occupational therapy course guide",
    "optometry course and career guide",
    "medical lab technology course guide"
  ]
},
{
  "slug": "emerging-tech-careers",
  "label": "Emerging Tech Careers",
  "title": "Emerging Tech Careers",
  "description": "Fast-evolving technology careers — cloud, DevOps, blockchain, data engineering and IoT — and the skills and routes into each, framed neutrally.",
  "group": "fields",
  "guideSlugs": [
    "cloud-computing-career-guide",
    "devops-engineer-career-guide",
    "blockchain-developer-career-guide",
    "how-to-become-a-data-engineer",
    "iot-and-embedded-systems-career-guide"
  ],
  "examSlugs": [],
  "keywords": [
    "emerging tech careers",
    "cloud computing career guide",
    "devops engineer career guide",
    "blockchain developer career guide"
  ]
},
{
  "slug": "more-engineering-branches",
  "label": "More Engineering Branches",
  "title": "More Engineering Branches",
  "description": "Beyond the core branches — robotics & mechatronics, instrumentation, mining, petroleum and environmental engineering — what each involves and where it leads.",
  "group": "fields",
  "guideSlugs": [
    "robotics-and-mechatronics-engineering",
    "instrumentation-engineering-overview",
    "mining-engineering-career-scope",
    "petroleum-engineering-overview",
    "environmental-engineering-career-guide"
  ],
  "examSlugs": [],
  "keywords": [
    "more engineering branches",
    "robotics and mechatronics engineering",
    "instrumentation engineering overview",
    "mining engineering career scope"
  ]
},
{
  "slug": "finance-professional-qualifications",
  "label": "Finance & Professional Qualifications",
  "title": "Finance & Professional Qualifications",
  "description": "Professional finance routes — actuary, FRM, ACCA, CMA and financial analyst — their structure and official bodies, with no income guarantees.",
  "group": "fields",
  "guideSlugs": [
    "how-to-become-an-actuary-in-india",
    "frm-financial-risk-manager-guide",
    "acca-guide-for-indian-students",
    "cma-cost-and-management-accountancy-guide",
    "how-to-become-a-financial-analyst"
  ],
  "examSlugs": [],
  "keywords": [
    "finance & professional qualifications",
    "how to become an actuary in india",
    "frm financial risk manager guide",
    "acca guide for indian students"
  ]
},
{
  "slug": "mba-specialisations-and-schools",
  "label": "MBA Specialisations & B-Schools",
  "title": "MBA Specialisations & B-Schools",
  "description": "Choosing an MBA specialisation — finance, marketing, analytics, HR — and the MBA-vs-PGDM question, described neutrally with official context.",
  "group": "fields",
  "guideSlugs": [
    "mba-in-finance-specialisation",
    "mba-in-marketing-specialisation",
    "mba-in-business-analytics",
    "mba-in-human-resources",
    "mba-vs-pgdm-which-is-better"
  ],
  "examSlugs": [],
  "keywords": [
    "mba specialisations & b-schools",
    "mba in finance specialisation",
    "mba in marketing specialisation",
    "mba in business analytics"
  ]
},
{
  "slug": "law-entrance-preparation",
  "label": "Law Entrance Preparation",
  "title": "Law Entrance Preparation",
  "description": "Preparing for law entrances — CLAT and AILET strategy, 5-year vs 3-year LLB, integrated-degree variants, and the AIBE — from official sources.",
  "group": "fields",
  "guideSlugs": [
    "how-to-prepare-for-clat",
    "how-to-prepare-for-ailet",
    "5-year-vs-3-year-llb-which-to-choose",
    "ba-llb-vs-bba-llb-which-to-choose",
    "aibe-all-india-bar-exam-guide"
  ],
  "examSlugs": [],
  "keywords": [
    "law entrance preparation",
    "how to prepare for clat",
    "how to prepare for ailet",
    "5 year vs 3 year llb which to choose"
  ]
},
{
  "slug": "law-careers-and-specialisations",
  "label": "Law Careers & Specialisations",
  "title": "Law Careers & Specialisations",
  "description": "Where a law degree leads — corporate law, IP law, litigation and the LLM — described neutrally, with official regulator sources.",
  "group": "fields",
  "guideSlugs": [
    "corporate-law-career-guide",
    "how-to-become-a-corporate-lawyer",
    "intellectual-property-law-career",
    "llm-in-india-guide",
    "litigation-vs-corporate-law-which-to-choose"
  ],
  "examSlugs": [],
  "keywords": [
    "law careers & specialisations",
    "corporate law career guide",
    "how to become a corporate lawyer",
    "intellectual property law career"
  ]
},
{
  "slug": "design-fields-and-entrances",
  "label": "Design Fields & Entrances",
  "title": "Design Fields & Entrances",
  "description": "Design career fields — fashion, interior, graphic and product design — plus how to build a portfolio, with official entrance-exam sources.",
  "group": "fields",
  "guideSlugs": [
    "fashion-design-course-and-career",
    "interior-design-course-and-career",
    "graphic-design-career-guide",
    "product-design-career-guide",
    "how-to-build-a-design-portfolio"
  ],
  "examSlugs": [],
  "keywords": [
    "design fields & entrances",
    "fashion design course and career",
    "interior design course and career",
    "graphic design career guide"
  ]
},
{
  "slug": "media-and-communication-careers",
  "label": "Media & Communication Careers",
  "title": "Media & Communication Careers",
  "description": "Careers in media — journalism, film-making, advertising & PR, content writing and broadcast production — and the courses behind them, neutrally framed.",
  "group": "fields",
  "guideSlugs": [
    "how-to-become-a-journalist-in-india",
    "film-making-and-cinematography-courses",
    "advertising-and-public-relations-careers",
    "content-writing-career-guide",
    "radio-and-tv-production-courses"
  ],
  "examSlugs": [],
  "keywords": [
    "media & communication careers",
    "how to become a journalist in india",
    "film making and cinematography courses",
    "advertising and public relations careers"
  ]
},
{
  "slug": "humanities-and-social-sciences",
  "label": "Humanities & Social Sciences",
  "title": "Humanities & Social Sciences",
  "description": "Where humanities degrees lead — economics, political science, sociology, history and English literature — courses and careers, described neutrally.",
  "group": "fields",
  "guideSlugs": [
    "economics-honours-courses-and-careers",
    "political-science-courses-and-careers",
    "sociology-courses-and-careers",
    "history-courses-and-careers",
    "english-literature-courses-and-careers"
  ],
  "examSlugs": [],
  "keywords": [
    "humanities & social sciences",
    "economics honours courses and careers",
    "political science courses and careers",
    "sociology courses and careers"
  ]
},
{
  "slug": "research-and-phd-pathways",
  "label": "Research & PhD Pathways",
  "title": "Research & PhD Pathways",
  "description": "The route into research — how a PhD works in India, admissions, preparing for UGC-NET and CSIR-NET, and research fellowships, from official sources.",
  "group": "fields",
  "guideSlugs": [
    "how-to-do-a-phd-in-india",
    "phd-admission-process-in-india",
    "how-to-prepare-for-ugc-net",
    "how-to-prepare-for-csir-net",
    "research-fellowships-in-india"
  ],
  "examSlugs": [],
  "keywords": [
    "research & phd pathways",
    "how to do a phd in india",
    "phd admission process in india",
    "how to prepare for ugc net"
  ]
},
{
  "slug": "civil-services-and-government-careers",
  "label": "Civil Services & Government Careers",
  "title": "Civil Services & Government Careers",
  "description": "Routes into government service — IFS, IRS, IFoS, bank PO and ISRO/DRDO scientist — strictly neutral, with official commission and recruiter sources.",
  "group": "fields",
  "guideSlugs": [
    "how-to-become-an-ifs-officer-foreign-service",
    "how-to-become-an-irs-officer",
    "how-to-become-a-bank-po",
    "how-to-become-a-forest-officer-ifos",
    "how-to-become-an-isro-drdo-scientist"
  ],
  "examSlugs": [],
  "keywords": [
    "civil services & government careers",
    "how to become an ifs officer foreign service",
    "how to become an irs officer",
    "how to become a bank po"
  ]
},
{
  "slug": "modern-and-creative-careers",
  "label": "Modern & Creative Careers",
  "title": "Modern & Creative Careers",
  "description": "Newer career paths — data analyst, content creator, entrepreneur, chef and photographer — the skills and realistic routes, with no income guarantees.",
  "group": "fields",
  "guideSlugs": [
    "how-to-become-a-data-analyst",
    "how-to-become-a-content-creator",
    "how-to-become-an-entrepreneur",
    "how-to-become-a-chef-in-india",
    "how-to-become-a-photographer"
  ],
  "examSlugs": [],
  "keywords": [
    "modern & creative careers",
    "how to become a data analyst",
    "how to become a content creator",
    "how to become an entrepreneur"
  ]
},
{
  "slug": "more-pathways-after-12th",
  "label": "More Pathways After 12th",
  "title": "More Pathways After 12th",
  "description": "Wider options after Class 12 — courses without maths, PCMB pathways, short-term and integrated courses, and distance learning, described neutrally.",
  "group": "after-12th",
  "guideSlugs": [
    "courses-after-12th-without-maths",
    "best-courses-after-12th-pcmb",
    "short-term-job-oriented-courses-after-12th",
    "integrated-and-dual-degree-courses-after-12th",
    "distance-and-open-learning-after-12th"
  ],
  "examSlugs": [],
  "keywords": [
    "more pathways after 12th",
    "courses after 12th without maths",
    "best courses after 12th pcmb",
    "short term job oriented courses after 12th"
  ]
},
{
  "slug": "mba-and-management-entrances",
  "label": "MBA & Management Entrances",
  "title": "MBA & Management Entrance Exams",
  "description": "Beyond CAT — XAT, SNAP, NMAT and CMAT, and how to prepare for MBA entrances — structure and eligibility deferred to each official source.",
  "group": "exams",
  "guideSlugs": [
    "xat-exam-guide",
    "snap-exam-guide",
    "nmat-exam-guide",
    "cmat-exam-guide",
    "how-to-prepare-for-mba-entrance-exams"
  ],
  "examSlugs": [],
  "keywords": [
    "mba & management entrances",
    "xat exam guide",
    "snap exam guide",
    "nmat exam guide"
  ]
},
{
  "slug": "design-and-aptitude-entrances",
  "label": "Design & Aptitude Entrances",
  "title": "Design & Aptitude Entrance Exams",
  "description": "Design and aptitude entrances — UCEED, CEED and NID DAT — plus the B.Des route and how to prepare, with official exam-board sources.",
  "group": "exams",
  "guideSlugs": [
    "uceed-exam-guide",
    "ceed-exam-guide",
    "nid-dat-exam-guide",
    "bdes-bachelor-of-design-course-guide",
    "how-to-prepare-for-design-entrance-exams"
  ],
  "examSlugs": [],
  "keywords": [
    "design & aptitude entrances",
    "uceed exam guide",
    "ceed exam guide",
    "nid dat exam guide"
  ]
},
{
  "slug": "indian-scholarships-in-depth",
  "label": "Indian Scholarships in Depth",
  "title": "Indian Scholarships in Depth",
  "description": "How Indian scholarships work — the National Scholarship Portal, merit-cum-means, girl-student, corporate and sports scholarships — secular criteria only.",
  "group": "prep-funding",
  "guideSlugs": [
    "how-to-apply-on-national-scholarship-portal",
    "merit-cum-means-scholarships-guide",
    "scholarships-for-girl-students-in-india",
    "corporate-and-private-scholarships-in-india",
    "sports-scholarships-in-india"
  ],
  "examSlugs": [],
  "keywords": [
    "indian scholarships in depth",
    "how to apply on national scholarship portal",
    "merit cum means scholarships guide",
    "scholarships for girl students in india"
  ]
},
{
  "slug": "education-loans-and-funding",
  "label": "Education Loans & Funding",
  "title": "Education Loans & Funding",
  "description": "Funding higher education in India — education loans, collateral-free options, interest-subsidy schemes and how to decide — factual, not financial advice.",
  "group": "prep-funding",
  "guideSlugs": [
    "education-loan-without-collateral-guide",
    "how-to-apply-for-an-education-loan",
    "education-loan-interest-subsidy-schemes",
    "education-loan-vs-self-funding",
    "how-to-fund-higher-education-in-india"
  ],
  "examSlugs": [],
  "keywords": [
    "education loans & funding",
    "education loan without collateral guide",
    "how to apply for an education loan",
    "education loan interest subsidy schemes"
  ]
},
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

  // ───────────── Europe top-100 — region-gated hubs (region: 'europe') ─────────────
  {
    slug: 'europe-admissions',
    label: 'Europe Admissions',
    title: 'Studying in Europe: Admissions Guide for International Students',
    description:
      'How to apply to universities across Europe — choosing a country and programme, understanding the Bologna degree system, finding English-taught programmes, and preparing your application documents.',
    intro:
      'Europe has no single application portal — each country runs its own system, and degrees across many countries share the Bologna structure and ECTS credits. These guides walk international students through choosing where to study, finding English-taught programmes, and preparing the documents universities ask for. Always confirm fees, deadlines, and requirements on each official source.',
    group: 'study-in-europe',
    region: 'europe',
    guideSlugs: [
      'how-to-study-in-europe-complete-guide-for-international-students',
      'european-higher-education-and-bologna-process-explained',
      'english-taught-programs-in-europe',
      'how-to-choose-a-country-to-study-in-europe',
      'application-documents-for-european-universities',
      'how-to-study-in-germany-complete-guide',
      'uni-assist-application-guide',
      'studienkolleg-do-i-need-it',
      'how-to-study-in-france-complete-guide',
      'campus-france-application-process',
      'how-to-study-in-netherlands-complete-guide',
      'english-taught-bachelors-germany',
      'how-to-study-in-italy-complete-guide',
      'how-to-study-in-spain-complete-guide',
      'how-to-study-in-sweden-complete-guide',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'pte-academic',
      'duolingo-english-test',
    ],
    keywords: [
      'how to study in europe',
      'study in europe for international students',
      'english taught programs in europe',
      'bologna process explained',
      'apply to european universities',
      'best country to study in europe',
    ],
  },
  {
    slug: 'europe-student-visas',
    label: 'Europe Student Visas',
    title: 'Student Visas for Europe: National, Schengen, Funds and Insurance',
    description:
      'Understand the visas international students need to study in Europe — long-stay national (type D) visas versus short-stay Schengen visas, proof of funds, the German blocked account, and required health insurance. Neutral official facts, with a verify-on-the-official-source nudge.',
    intro:
      'Studying in Europe usually means a long-stay national (type D) visa or residence permit from the country you choose — not a short-stay Schengen visa. These guides explain that distinction, the proof-of-funds rules (including Germany’s blocked account), and the health insurance you need to enrol. All of it is presented as general information, not immigration advice: requirements and amounts change, so always confirm them on the official government source for your destination.',
    group: 'study-in-europe',
    region: 'europe',
    guideSlugs: [
      'germany-student-visa-guide-from-india',
      'blocked-account-germany',
      'germany-student-visa-financial-requirements',
      'health-insurance-for-students-in-germany',
      'student-visa-types-in-europe-schengen-explained',
      'france-student-visa-guide-from-india',
      'netherlands-student-visa-and-residence-permit',
      'italy-student-visa-guide-from-india',
      'spain-student-visa-guide-from-india',
      'sweden-student-residence-permit-guide',
    ],
    examSlugs: [
      'ielts',
      'testas',
    ],
    keywords: [
      'germany student visa',
      'blocked account germany',
      'schengen visa vs national visa',
      'proof of funds germany student visa',
      'health insurance for students in germany',
      'student visa for europe',
    ],
  },
  {
    slug: 'europe-universities',
    label: 'Europe Universities',
    title: 'Top Universities in Europe — Admissions Guides for International Students',
    description:
      'How to choose and apply to leading universities across Europe — neutral overviews, official admission processes, and step-by-step guides for institutions in Germany, the Netherlands, and beyond.',
    intro:
      'Europe has many strong, research-intensive universities across Germany, the Netherlands, France, Italy, Spain, Sweden, Switzerland and more — but no single \'best\' one. These guides describe well-known universities neutrally, explain how to read rankings (attributed to QS or THE) without treating any as fact, and walk through the official admission process for specific institutions such as the Technical University of Munich, LMU Munich, Heidelberg University, and TU Delft. Every fee, deadline, and requirement should be verified on the official source before you apply.',
    group: 'study-in-europe',
    region: 'europe',
    guideSlugs: [
      'top-universities-in-europe-for-international-students',
      'how-to-get-admission-in-tu-munich',
      'how-to-get-admission-in-lmu-munich',
      'how-to-get-admission-in-heidelberg-university',
      'how-to-get-admission-in-tu-delft',
      'apply-to-eth-zurich-international',
      'how-to-get-admission-in-epfl',
      'how-to-get-admission-in-sorbonne-university',
      'how-to-get-admission-in-sciences-po',
      'how-to-get-admission-in-university-of-amsterdam',
      'how-to-get-admission-in-bocconi-university',
      'how-to-get-admission-in-kth-royal-institute',
      'how-to-get-admission-in-karolinska-institute',
      'how-to-get-admission-in-ku-leuven',
      'how-to-get-admission-in-aarhus-university',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'testas',
    ],
    keywords: [
      'top universities in europe',
      'best universities in europe for international students',
      'tu munich admission',
      'tu delft admission',
      'universities in europe taught in english',
      'how to get into european universities',
    ],
  },
  {
    slug: 'europe-courses-careers',
    label: 'Courses & Careers',
    title: 'Courses and Careers — Study in Europe',
    description:
      'Explore the most popular fields to study in Europe — engineering, computer science and IT, business and the MBA, and English-taught medicine — with neutral, official-source guidance on programmes, entry requirements, and how to choose.',
    intro:
      'Europe offers thousands of programmes across almost every field, many of them taught in English. This hub gathers neutral, decision-focused guides on the courses international students most often consider — engineering, computer science and IT, business and the MBA, and English-taught medicine — plus how to choose the right one for you. We describe fields on their own terms, attribute any rankings to the body that issued them, and make no guarantees about salaries or jobs. Always confirm course details, language of instruction, entry requirements, and deadlines on the official university and national sources.',
    group: 'study-in-europe',
    region: 'europe',
    guideSlugs: [
      'best-courses-to-study-in-europe',
      'engineering-courses-in-europe-for-international-students',
      'computer-science-and-it-courses-in-europe',
      'business-and-mba-courses-in-europe',
      'study-medicine-in-europe-in-english',
      'data-science-and-ai-courses-in-europe',
      'masters-in-europe-for-international-students',
      'phd-and-research-opportunities-in-europe',
      'masters-in-germany-without-german-language',
      'how-to-choose-a-course-to-study-in-europe',
    ],
    examSlugs: [
      'ielts',
      'toefl',
      'gre',
      'gmat',
    ],
    keywords: [
      'best courses to study in europe',
      'engineering courses in europe',
      'computer science courses in europe',
      'mba in europe',
      'study medicine in europe in english',
      'english taught courses in europe',
    ],
  },
  {
    slug: 'europe-tuition-scholarships',
    label: 'Tuition & Scholarships',
    title: 'Tuition Fees and Scholarships to Study in Europe',
    description:
      'Costs and funding for studying in Europe — tuition at public universities, the cost of living, free and low-tuition options, and scholarships including DAAD and the Deutschlandstipendium.',
    intro:
      'Studying in Europe can be affordable, but the details matter. This hub explains what tuition really costs at public universities (and where international students still pay), the main living-cost components, and the scholarships open to international students — from EU-wide and national schemes to Germany\'s DAAD and Deutschlandstipendium. All amounts and deadlines are deferred to official sources you should verify before applying; no scholarship or admission can be guaranteed.',
    group: 'study-in-europe',
    region: 'europe',
    guideSlugs: [
      'daad-scholarships-for-international-students',
      'cost-of-studying-and-living-in-germany',
      'free-tuition-universities-europe',
      'scholarships-eu-students',
      'deutschlandstipendium-and-germany-scholarships',
      'erasmus-mundus-scholarships-guide',
      'erasmus-plus-programme-explained',
      'eiffel-scholarship-france-guide',
      'swedish-institute-and-nordic-scholarships-guide',
      'holland-scholarship-and-netherlands-funding-guide',
      'cost-of-studying-in-europe-by-country',
      'cheapest-european-countries-to-study-for-international-students',
      'cost-of-living-for-students-in-europe',
      'education-loans-for-studying-in-europe',
      'tuition-fees-for-international-students-in-europe',
    ],
    keywords: [
      'study in europe scholarships',
      'free tuition universities europe',
      'cost of studying in germany',
      'daad scholarship',
      'deutschlandstipendium',
      'cheap universities in europe for international students',
    ],
  },
  {
    slug: 'work-and-stay-europe',
    label: 'Work & Stay in Europe',
    title: 'Working and Staying in Europe After Your Studies',
    description:
      'Post-study work permits, the EU Blue Card, working while studying, and job-search residence permits across European countries — neutral official facts, with every figure deferred to the official government source.',
    intro:
      'Once you finish a degree in Europe, your options to work and stay are set country by country, not by one Europe-wide rule. These guides explain how working while studying differs by country, how post-study job-search permits work in Germany, the Netherlands, France and beyond, and what the employment-based EU Blue Card is (and is not). Everything here is general information, not immigration advice — always confirm the current rule on the official government or immigration source for your destination.',
    group: 'study-in-europe',
    region: 'europe',
    guideSlugs: [
      'working-while-studying-in-europe-rules-by-country',
      'eu-blue-card-explained-for-graduates',
      'post-study-work-visa-options-in-europe-by-country',
      'germany-job-seeker-visa-18-months-explained',
      'netherlands-orientation-year-zoekjaar-explained',
      'france-post-study-work-visa-aps-explained',
      'sweden-and-nordics-post-study-work-options',
      'italy-and-spain-post-study-stay-back-options',
      'how-to-find-a-job-in-europe-after-graduation',
      'working-while-studying-in-germany-rules',
      'permanent-residence-pathways-in-europe-explained',
      'eu-long-term-residence-permit-explained',
      'germany-permanent-residence-after-study-explained',
      'netherlands-permanent-residence-after-study-explained',
      'is-europe-good-for-international-students',
    ],
    keywords: [
      'post study work visa europe',
      'eu blue card explained',
      'working while studying in europe',
      'germany 18 month job seeker visa',
      'netherlands orientation year zoekjaar',
      'stay back options europe after masters',
    ],
  },
  {
    slug: 'europe-student-life',
    label: 'Student Life in Europe',
    title: 'Student Life in Europe: Housing, Insurance, Banking & Travel',
    description:
      'Practical guides for living as an international student in Europe — finding accommodation, health insurance, opening a bank account, part-time work and budgeting, and travelling within the Schengen area.',
    intro:
      'Settling into student life in Europe involves more than your course. These guides cover the everyday essentials — where to live, how health insurance and banking work, how part-time work and budgeting fit each country\'s visa rules, and what to know about Schengen travel. Volatile details such as costs, work-hour limits, and visa amounts change and differ by country, so each guide points you to the official source to verify before you act.',
    group: 'study-in-europe',
    region: 'europe',
    guideSlugs: [
      'student-accommodation-in-europe-guide',
      'health-insurance-for-students-in-europe',
      'opening-a-bank-account-as-a-student-in-europe',
      'part-time-work-and-budgeting-for-students-in-europe',
      'schengen-travel-for-students-in-europe',
      'best-cities-to-study-in-europe',
      'how-to-study-in-the-nordic-countries',
      'how-to-study-in-switzerland-from-india-complete-guide',
      'why-study-in-europe-for-international-students',
      'europe-vs-uk-vs-usa-for-international-students',
    ],
    keywords: [
      'student life in europe',
      'living costs for students in europe',
      'student accommodation europe',
      'health insurance students europe',
      'part time work students europe',
      'schengen travel student visa',
    ],
  },
  {
    slug: 'europe-language-tests',
    label: 'Europe Language Tests',
    title: 'German Language Tests & Requirements for Studying in Europe',
    description:
      'German-language requirements, the TestDaF, DSH, TestAS and Goethe-Zertifikat exams, CEFR levels, and how to learn German for university study in Germany.',
    intro:
      'Studying in Germany often means meeting a German-language requirement, while many programmes are taught in English. This hub explains when German is needed, how the main proofs (TestDaF, DSH, recognised Goethe-Institut certificates) and the TestAS aptitude test work, what the CEFR levels A1 to C2 mean, and how to plan your German learning. Exact scores, levels, formats and fees are set by official bodies and universities and can change, so always verify on the official source for your programme.',
    group: 'study-in-europe',
    region: 'europe',
    guideSlugs: [
      'german-language-requirements-for-university',
      'testdaf-vs-dsh-german-language-tests',
      'testas-exam-for-germany-explained',
      'goethe-zertifikat-and-german-cefr-levels-explained',
      'learn-german-for-studying-in-germany',
      'language-requirements-for-studying-in-europe',
      'ielts-and-toefl-for-european-universities',
      'french-language-tests-delf-dalf-tcf-explained',
      'duolingo-and-pte-acceptance-in-europe',
      'do-you-need-to-learn-the-local-language-to-study-in-europe',
    ],
    examSlugs: [
      'testas',
    ],
    keywords: [
      'german language requirements for university',
      'testdaf vs dsh',
      'testas exam for germany',
      'goethe zertifikat cefr levels',
      'learn german for studying in germany',
      'german language test for study in germany',
    ],
  },

  // ───────────── Middle East top-100 — region-gated hubs (region: 'middle-east') ─────────────
  {
    slug: 'middle-east-admissions',
    label: 'Gulf Admissions',
    title: 'Gulf University Admissions: How to Apply in the UAE, Saudi Arabia, Qatar & More',
    description:
      'Step-by-step guides to applying to universities in the Gulf (GCC) — the UAE, Saudi Arabia, Qatar, Oman, Bahrain, and Kuwait — covering how to apply, accreditation, requirements, and application timelines.',
    intro:
      'There is no single Gulf-wide application portal — international students apply directly to each university, and each country has its own higher-education framework. These guides walk through choosing a country and university, applying, the typical requirements (transcripts, English proof, and sometimes an admission test), and a realistic application timeline, with every volatile detail pointed back to the official source so you can verify deadlines, fees, and visa rules yourself.',
    group: 'study-in-middle-east',
    region: 'middle-east',
    guideSlugs: [
      'how-to-study-in-the-gulf-complete-guide',
      'how-to-apply-to-universities-in-the-uae',
      'how-to-apply-to-universities-in-saudi-arabia',
      'how-to-apply-to-universities-in-qatar',
      'application-timeline-for-gulf-universities',
      'admission-requirements-for-gulf-universities',
      'documents-needed-for-gulf-university-applications',
      'certificate-attestation-and-equivalency-for-the-gulf',
      'english-language-requirements-for-gulf-universities',
      'how-to-choose-a-university-in-the-gulf',
      'how-to-apply-to-universities-in-oman',
      'how-to-apply-to-universities-in-bahrain',
      'how-to-apply-to-universities-in-kuwait',
      'foundation-and-preparatory-year-programs-in-the-gulf',
      'transferring-universities-within-the-gulf',
    ],
    examSlugs: [
      'sat',
      'ielts',
      'toefl',
    ],
    keywords: [
      'study in the gulf for international students',
      'how to apply to universities in uae',
      'study in saudi arabia for international students',
      'how to apply to universities in qatar',
      'gulf university application timeline',
      'gcc universities admissions',
    ],
  },
  {
    slug: 'middle-east-universities',
    label: 'Gulf Universities',
    title: 'Top Universities in the Gulf (UAE, Saudi Arabia, Qatar & more)',
    description:
      'Well-known universities across the Gulf for international students — NYU Abu Dhabi, Khalifa University, the American University of Sharjah, MBZUAI and more, with official admission steps and where to verify the details.',
    intro:
      'Choosing a university in the Gulf starts with understanding what each institution focuses on, how its admissions work, and where the official requirements live. This hub gathers practical, English-only guides to leading universities in the United Arab Emirates and the wider Gulf — covering programmes, language of instruction, standardized tests, scholarships and the student-visa basics. Every figure that changes year to year, including fees, scholarship amounts and rankings, is deferred to the official source with a verify-on-the-official-source nudge.',
    group: 'study-in-middle-east',
    region: 'middle-east',
    guideSlugs: [
      'top-universities-in-the-uae-for-international-students',
      'how-to-get-admission-in-nyu-abu-dhabi',
      'how-to-get-admission-in-khalifa-university',
      'how-to-get-admission-in-american-university-of-sharjah',
      'how-to-get-admission-in-mbzuai',
      'how-to-get-admission-in-kaust',
      'how-to-get-admission-in-kfupm',
      'how-to-get-admission-in-king-saud-university',
      'how-to-get-admission-in-qatar-university',
      'how-to-get-admission-in-hamad-bin-khalifa-university',
      'how-to-get-admission-in-sultan-qaboos-university',
      'best-universities-in-saudi-arabia-for-international-students',
      'best-universities-in-qatar-for-international-students',
      'universities-in-oman-bahrain-and-kuwait',
      'top-engineering-and-technology-universities-in-the-gulf',
    ],
    examSlugs: [
      'sat',
      'act',
      'ielts',
      'toefl',
      'gre',
    ],
    keywords: [
      'top universities in uae for international students',
      'nyu abu dhabi admission',
      'khalifa university admission',
      'american university of sharjah admission',
      'mbzuai full scholarship',
      'study in the gulf for international students',
    ],
  },
  {
    slug: 'middle-east-branch-campuses',
    label: 'Branch Campuses',
    title: 'International Branch Campuses in the Gulf',
    description:
      'Understand international branch campuses in the Gulf — who awards the degree, how recognition and local equivalency work, Qatar\'s Education City, and how to apply.',
    intro:
      'Several universities from the United States, Europe, and elsewhere run physical branch campuses in Gulf countries, where students study locally while following programmes aligned with the home university. These guides explain what a branch campus is, who awards the degree, how recognition and local equivalency work, the universities hosted in Qatar\'s Education City, how a branch-campus degree compares with a home-campus one, and how to apply. Specifics such as fees, deadlines, and recognition are deferred to official sources — always verify on the university\'s official site and the relevant government portal before deciding.',
    group: 'study-in-middle-east',
    region: 'middle-east',
    guideSlugs: [
      'western-branch-campuses-in-the-gulf-explained',
      'qatar-education-city-universities-guide',
      'are-branch-campus-degrees-recognized',
      'branch-campus-vs-home-campus-degree',
      'how-to-apply-to-a-branch-campus-in-the-gulf',
      'branch-campuses-in-dubai-guide',
      'indian-university-campuses-in-dubai',
      'uk-and-australian-university-campuses-in-the-uae',
      'cost-of-a-branch-campus-degree-in-the-gulf',
      'how-to-choose-between-branch-campuses-in-the-gulf',
    ],
    examSlugs: [
      'sat',
      'act',
      'ielts',
      'toefl',
    ],
    keywords: [
      'international branch campus gulf',
      'qatar education city universities',
      'are branch campus degrees recognized',
      'branch campus vs home campus degree',
      'how to apply to a branch campus in the gulf',
      'study at a us university branch campus middle east',
    ],
  },
  {
    slug: 'middle-east-scholarships',
    label: 'Gulf Scholarships',
    title: 'Scholarships in the Gulf: Funded Study in the UAE, Saudi Arabia, Qatar & More',
    description:
      'Guides to scholarships and full funding for international students in the Gulf (GCC) — the KAUST Fellowship in Saudi Arabia, the MBZUAI full scholarship in the UAE, Qatar University and Education City awards, and how to find and apply for fully funded study across the region safely.',
    intro:
      'Full funding in the Gulf is most often offered by specific universities rather than a single regional scheme — for example the KAUST Fellowship for admitted MS and PhD students in Saudi Arabia, and the MBZUAI full scholarship for AI graduate students in the UAE. These guides explain who is funded, what packages typically cover, and how to apply, with every amount, eligibility rule, and deadline pointed back to the official source so you can verify the current details. Eligibility is based on secular academic and admission criteria only, and genuine scholarships are never sold — never pay for a "guaranteed" award.',
    group: 'study-in-middle-east',
    region: 'middle-east',
    guideSlugs: [
      'kaust-fellowship-guide',
      'mbzuai-full-scholarship-guide',
      'scholarships-for-international-students-in-the-uae',
      'qatar-university-and-education-city-scholarships',
      'fully-funded-scholarships-in-the-gulf',
      'scholarships-to-study-in-saudi-arabia',
      'khalifa-university-scholarships-guide',
      'scholarships-for-international-students-in-qatar',
      'merit-and-need-based-aid-at-gulf-universities',
      'gulf-government-scholarships-for-international-students',
      'are-gulf-universities-tuition-free',
      'cost-of-studying-in-the-gulf-for-international-students',
      'how-to-get-a-full-ride-scholarship-in-the-gulf',
      'how-to-apply-for-gulf-university-scholarships',
      'avoiding-scholarship-and-admission-scams-in-the-gulf',
    ],
    examSlugs: [
      'gre',
      'gmat',
      'ielts',
      'toefl',
    ],
    keywords: [
      'scholarships in the gulf for international students',
      'kaust fellowship',
      'mbzuai full scholarship',
      'fully funded scholarships gcc',
      'scholarships for international students in uae',
      'qatar university scholarships',
    ],
  },
  {
    slug: 'middle-east-student-visas',
    label: 'Gulf Student Visas',
    title: 'Student Visas for the Gulf: UAE, Saudi Arabia, Qatar & GCC Guides',
    description:
      'Guides to student visas and residence permits for studying in the Gulf (GCC) — the UAE student residence visa with its medical fitness test and Emirates ID, the Saudi Arabia study-visa pathway, the Qatar educational residence visa, and the documents commonly required across the region. Neutral official facts with verify-on-the-official-source nudges.',
    intro:
      'In most Gulf (GCC) countries the student visa or residence permit is sponsored by the admitting university or institution, and the process usually begins after you hold a confirmed offer — running broadly from offer to visa to medical to ID. These guides set out the practical, student-facing steps for the UAE, Saudi Arabia, Qatar and the wider Gulf, with every fee, document and timeline pointed back to the official government source so you can verify the current rule. This is general information, not immigration advice: working while studying is generally restricted in the Gulf, rules change frequently, and you should always confirm details on the official government portal for your destination before acting.',
    group: 'study-in-middle-east',
    region: 'middle-east',
    guideSlugs: [
      'gulf-student-visa-guide-overview',
      'uae-student-visa-guide',
      'saudi-arabia-student-visa-guide',
      'qatar-student-visa-guide',
      'student-visa-requirements-for-the-gulf',
      'oman-bahrain-and-kuwait-student-visa-guide',
      'uae-golden-visa-for-students-and-graduates',
      'working-while-studying-in-the-gulf-rules',
      'bringing-family-on-a-gulf-student-visa',
      'post-graduation-stay-options-in-the-gulf',
    ],
    examSlugs: [
      'ielts',
      'toefl',
    ],
    keywords: [
      'gulf student visa',
      'uae student visa',
      'saudi arabia student visa',
      'qatar student visa',
      'student visa requirements for the gulf',
      'student residence visa gcc',
    ],
  },
  {
    slug: 'middle-east-courses-careers',
    label: 'Gulf Courses & Careers',
    title: 'Courses & Careers in the Gulf: What to Study in the UAE, Saudi Arabia, Qatar & More',
    description:
      'Guides to the most widely offered fields of study across Gulf (GCC) universities — engineering and petroleum, computer science and AI, business and the MBA, and medicine and health sciences — with practical advice on choosing a course and where to verify entry requirements officially.',
    intro:
      'Gulf universities offer a broad spread of programmes, with particular depth in engineering and energy (for example at KFUPM and Khalifa University), computer science and artificial intelligence (for example at MBZUAI), business and management (for example at the American University of Sharjah and Qatar University), and health sciences. These guides describe each field neutrally — what is typically offered, where it is well established, and how entry usually works — without quoting fees, cut-offs, demand figures or salaries, which change every year. Every programme, requirement and deadline is pointed back to the official university website or the relevant government education authority so you can verify the current details, and no course or university can guarantee admission or a job.',
    group: 'study-in-middle-east',
    region: 'middle-east',
    guideSlugs: [
      'popular-courses-to-study-in-the-gulf',
      'engineering-and-petroleum-studies-in-the-gulf',
      'computer-science-and-ai-studies-in-the-gulf',
      'business-and-management-studies-in-the-gulf',
      'medicine-and-health-sciences-in-the-gulf',
      'careers-and-job-prospects-after-studying-in-the-gulf',
      'internships-and-co-op-opportunities-in-the-gulf',
      'masters-and-phd-options-in-the-gulf',
      'most-popular-degrees-for-the-gulf-job-market',
      'how-to-choose-a-major-for-studying-in-the-gulf',
    ],
    examSlugs: [
      'sat',
      'act',
      'gre',
      'gmat',
      'ielts',
      'toefl',
    ],
    keywords: [
      'popular courses to study in the gulf',
      'best courses to study in uae',
      'study engineering in saudi arabia',
      'study ai in uae',
      'mba in the gulf',
      'study medicine in the gulf',
    ],
  },
  {
    slug: 'middle-east-tests-english',
    label: 'Gulf Entrance & English Tests',
    title: 'Entrance & English Tests for Gulf Universities: SAT, ACT, EmSAT, IELTS & TOEFL',
    description:
      'Guides to the entrance and English-language tests used by universities across the Gulf (GCC) — SAT and ACT at American-style and international universities, the UAE\'s EmSAT, and IELTS and TOEFL for English-taught programmes. Understand which test each university asks for, how requirements differ, and where to confirm every minimum score officially.',
    intro:
      'There is no single Gulf-wide entrance exam — each university, and often each programme, sets its own requirements. American-style and international universities such as NYU Abu Dhabi and the American University of Sharjah commonly use the SAT or ACT, UAE public universities use the EmSAT run by the Ministry of Education, and English-taught programmes across the UAE, Saudi Arabia, Qatar, Oman, Bahrain and Kuwait usually ask for IELTS or TOEFL. These guides explain how each test fits into admission and how waivers can work, while pointing every minimum score and rule back to the official university and government sources so you can verify the current details. No test score by itself guarantees admission — always confirm requirements on the official source before you apply.',
    group: 'study-in-middle-east',
    region: 'middle-east',
    guideSlugs: [
      'entrance-tests-for-gulf-universities-overview',
      'sat-for-gulf-universities',
      'emsat-emirates-standardized-test-explained',
      'ielts-and-toefl-for-gulf-universities',
      'english-test-requirements-for-gulf-universities',
      'gre-for-gulf-graduate-programs',
      'gmat-for-gulf-business-schools',
      'test-optional-and-test-waiver-policies-at-gulf-universities',
      'how-to-prepare-for-gulf-university-admission-tests',
      'score-requirements-for-gulf-universities',
    ],
    examSlugs: [
      'sat',
      'act',
      'ielts',
      'toefl',
    ],
    keywords: [
      'entrance exams for gulf universities',
      'english test requirements gulf universities',
      'sat for universities in uae',
      'emsat emirates standardized test',
      'ielts toefl for gulf universities',
      'admission tests gcc universities',
    ],
  },
  {
    slug: 'middle-east-student-life',
    label: 'Gulf Student Life',
    title: 'Student Life in the Gulf: Costs, Housing, Health Insurance & Budgeting',
    description:
      'Practical, official-source guidance on living as a student in the Gulf — cost of living in the UAE, Qatar, and Saudi Arabia, on-campus and off-campus accommodation, health insurance, and how to build a realistic budget.',
    intro:
      'Planning the day-to-day side of studying in the Gulf — the UAE, Saudi Arabia, Qatar, Oman, Bahrain, and Kuwait — means getting practical about housing, costs, health insurance, and budgeting. These guides break down the main living costs in cities like Dubai, Abu Dhabi, Doha, and Riyadh, explain on-campus versus off-campus accommodation, and show how to build a budget that holds up. Costs vary by city and lifestyle, so we plan in ranges and point you to official government and university sources to verify current figures before you commit.',
    group: 'study-in-middle-east',
    region: 'middle-east',
    guideSlugs: [
      'cost-of-living-for-students-in-the-uae',
      'cost-of-living-for-students-in-qatar-and-saudi-arabia',
      'student-accommodation-in-the-gulf',
      'health-insurance-for-students-in-the-gulf',
      'budgeting-as-a-student-in-the-gulf',
      'student-life-in-the-uae',
      'student-life-in-qatar-and-saudi-arabia',
      'getting-around-gulf-cities-as-a-student',
      'opening-a-bank-account-as-a-student-in-the-gulf',
      'staying-connected-sim-and-internet-in-the-gulf',
      'settling-in-as-an-international-student-in-the-gulf',
      'healthcare-for-students-in-the-gulf',
      'safety-and-practical-tips-for-students-in-the-gulf',
      'studying-in-the-gulf-vs-other-destinations',
      'is-the-gulf-a-good-place-for-international-students',
    ],
    keywords: [
      'cost of living in uae for students',
      'student accommodation in the gulf',
      'student budget dubai',
      'cost of living in qatar for students',
      'health insurance for students in the gulf',
      'living expenses for students in saudi arabia',
    ],
  },

  // ───────────── Russia & CIS top-100 — region-gated hubs (region: 'russia') ─────────────
  {
    slug: 'russia-cis-admissions',
    label: 'Russia & CIS Admissions',
    title: 'Studying in Russia & CIS: Admissions Guides for International Students',
    description:
      'How to choose a university and programme in Russia and key CIS countries, apply directly, secure a student visa, and plan your timeline — with all volatile details deferred to official sources.',
    intro:
      'Russia and the key CIS destinations — Kazakhstan, Kyrgyzstan, Uzbekistan and Armenia — each have their own universities and admission rules, and you apply directly to each institution. These guides walk through choosing a programme, the official Russian government portals (studyinrussia.ru for information and education-in-russia.com for the Russian Government Scholarship), the application process, the invitation and student-visa steps, and a typical September-intake timeline. Fees, deadlines and visa procedures are set by each university and government and change each cycle, so always verify the current details on the official source before you act.',
    group: 'study-in-russia-cis',
    region: 'russia',
    guideSlugs: [
      'how-to-study-in-russia-complete-guide',
      'how-to-study-in-russia-and-cis-from-india',
      'how-to-apply-to-russian-universities',
      'application-process-for-cis-universities',
      'application-timeline-russia-cis',
      'admission-requirements-russian-universities',
      'documents-needed-for-russia-cis-application',
      'document-legalisation-and-apostille-russia-cis',
      'english-vs-russian-medium-programs',
      'how-to-choose-a-university-in-russia-cis',
      'how-to-study-in-kazakhstan',
      'how-to-study-in-kyrgyzstan',
      'how-to-study-in-uzbekistan',
      'how-to-study-in-armenia',
      'preparatory-faculty-and-foundation-year-russia-cis',
    ],
    examSlugs: [
      'ielts',
      'toefl',
    ],
    keywords: [
      'study in russia for international students',
      'how to apply to russian universities',
      'study in cis countries',
      'study in russia from india',
      'russia student visa process',
      'russia cis application timeline',
    ],
  },
  {
    slug: 'russia-cis-universities',
    label: 'Russia & CIS Universities',
    title: 'Universities in Russia & the CIS for International Students',
    description:
      'Guides to well-known universities across Russia and the CIS for international students — how to apply, English-taught and Russian-taught programmes, language preparation, and where to verify the official admission process.',
    intro:
      'Explore how international students apply to universities in Russia and the CIS. These guides cover notable institutions, programme types and languages of instruction, the official application route, and how to confirm current requirements, tuition and scholarships on official sources. Rankings are attributed to the bodies that issue them (QS/THE) and specific figures should always be verified on the official site.',
    group: 'study-in-russia-cis',
    region: 'russia',
    guideSlugs: [
      'top-universities-in-russia-for-international-students',
      'how-to-get-admission-in-lomonosov-moscow-state-university',
      'how-to-get-admission-in-mipt',
      'how-to-get-admission-in-hse-university',
      'how-to-get-admission-in-itmo-university',
      'how-to-get-admission-in-skoltech',
      'best-engineering-and-technology-universities-in-russia',
      'medical-universities-in-russia-for-international-students',
      'english-taught-programs-in-russia',
      'how-to-verify-a-university-is-officially-recognised-russia-cis',
      'top-universities-in-kazakhstan-for-international-students',
      'universities-in-kyrgyzstan-for-international-students',
      'universities-in-uzbekistan-for-international-students',
      'universities-in-armenia-for-international-students',
      'choosing-between-russia-and-cis-universities',
    ],
    examSlugs: [
      'ielts',
      'toefl',
    ],
    keywords: [
      'universities in russia for international students',
      'study in russia for indian students',
      'how to get admission in russian universities',
      'english taught programmes russia',
      'lomonosov moscow state university admission',
      'hse itmo mipt admission international students',
    ],
  },
  {
    slug: 'russia-cis-mbbs',
    label: 'MBBS in Russia & CIS',
    title: 'MBBS in Russia & CIS for Indian Students',
    description:
      'India-side guidance for studying MBBS in Russia and the CIS — the NEET requirement, National Medical Commission rules, the screening exam to practise in India, and how to choose a medical university abroad.',
    intro:
      'Studying medicine in Russia or a CIS country is governed first by India\'s own rules. These guides explain the India-side essentials in plain English: why NEET-UG is mandatory for Indian students, what the National Medical Commission (NMC) requires of a foreign medical degree, and the screening exam (FMGE, transitioning to NExT) plus internship needed to register and practise in India. Every specific figure and rule is deferred to the official NMC, NEET, and NBEMS sources — always verify the current position there before you act. The guides are neutral and factual, do not rank universities or countries, and make no guarantees about admission, recognition, or licensing.',
    group: 'study-in-russia-cis',
    region: 'russia',
    guideSlugs: [
      'mbbs-in-russia-for-indian-students',
      'mbbs-abroad-eligibility-neet-and-nmc-rules',
      'fmge-and-licensing-to-practise-in-india-after-mbbs-abroad',
      'how-to-choose-a-medical-university-abroad',
      'mbbs-in-russia-cis-vs-india-what-to-know',
      'mbbs-in-kazakhstan-for-indian-students',
      'mbbs-in-kyrgyzstan-for-indian-students',
      'mbbs-in-uzbekistan-for-indian-students',
      'mbbs-in-armenia-for-indian-students',
      'mbbs-abroad-application-process-for-indian-students',
      'cost-of-mbbs-in-russia-and-cis',
      'duration-and-structure-of-mbbs-in-russia-cis',
      'documents-required-for-mbbs-abroad',
      'medical-pg-options-after-mbbs-abroad',
      'common-questions-about-mbbs-abroad-for-indian-students',
    ],
    examSlugs: [
      'neet-ug',
    ],
    keywords: [
      'mbbs in russia for indian students',
      'mbbs abroad eligibility neet',
      'nmc rules mbbs abroad',
      'fmge after mbbs abroad',
      'how to choose a medical university abroad',
      'mbbs in russia vs india',
    ],
  },
  {
    slug: 'russia-cis-scholarships',
    label: 'Russia & CIS Scholarships',
    title: 'Scholarships to Study in Russia & CIS',
    description:
      'Funding routes for international students across Russia and key CIS countries — the Russian Government Scholarship (quota), the Open Doors olympiad, and university and national scholarships — with secular eligibility and official sources.',
    intro:
      'Looking to study in Russia or a CIS country on funding? This hub gathers neutral, official-facts guides to the main routes — the Russian Government Scholarship (the government quota via the Russia.Study portal), the Open Doors international olympiad for master\'s and PhD applicants, and scholarships or fee waivers offered by universities and national schemes across Kazakhstan, Kyrgyzstan, Uzbekistan, and Armenia. Eligibility is secular and merit-based, no route is guaranteed, and every amount and deadline should be verified on the official source before you act.',
    group: 'study-in-russia-cis',
    region: 'russia',
    guideSlugs: [
      'russian-government-scholarship-and-open-doors',
      'scholarships-for-international-students-in-russia',
      'how-to-apply-for-the-russian-government-scholarship',
      'scholarships-to-study-in-cis-countries',
      'fully-funded-options-in-russia-and-cis',
      'cost-of-studying-in-russia-for-international-students',
      'tuition-fees-at-russian-and-cis-universities',
      'budgeting-and-living-costs-in-russia-cis',
      'university-scholarships-and-fee-waivers-russia-cis',
      'avoiding-admission-and-scholarship-scams-russia-cis',
    ],
    keywords: [
      'scholarships to study in russia',
      'russian government scholarship',
      'open doors russia olympiad',
      'scholarships for international students in russia',
      'fully funded study russia and cis',
      'kazakhstan scholarships for international students',
    ],
  },
  {
    slug: 'russia-cis-student-visas',
    label: 'Russia & CIS Student Visas',
    title: 'Student Visas for Russia & CIS',
    description:
      'A plain-English, official-facts-only guide to student visas for Russia and the CIS — the university invitation route, document requirements, migration registration after arrival, and a high-level overview for Kazakhstan, Kyrgyzstan, Uzbekistan, and Armenia.',
    intro:
      'Planning to study in Russia or a CIS country starts with understanding the student-visa route. These guides explain the essentials in neutral, practical terms: how a Russian student visa is issued on the basis of an official university invitation (приглашение), the documents commonly required, how the invitation is obtained, the standard migration-registration step after arrival, and a country-by-country overview for Kazakhstan, Kyrgyzstan, Uzbekistan, and Armenia. Everything here is general information, not immigration advice. Visa rules, document lists, fees, and timelines are set by each country\'s official authorities and can change, so every guide defers the specifics to the official government source and asks you to verify the current position there before you act. No guarantees are made about any visa outcome.',
    group: 'study-in-russia-cis',
    region: 'russia',
    guideSlugs: [
      'russia-student-visa-guide',
      'student-visa-requirements-for-russia',
      'how-to-get-a-student-invitation-letter-russia',
      'migration-registration-after-arrival-russia',
      'student-visa-overview-for-cis-countries',
      'kazakhstan-student-visa-guide',
      'kyrgyzstan-and-uzbekistan-student-visa-guide',
      'armenia-student-visa-and-residence-guide',
      'medical-certificate-and-insurance-for-russia-cis-visa',
      'arrival-checklist-for-students-in-russia-cis',
    ],
    keywords: [
      'russia student visa',
      'student visa requirements for russia',
      'russia student invitation letter',
      'migration registration russia',
      'student visa cis countries',
      'study visa for russia and cis',
    ],
  },
  {
    slug: 'russia-cis-courses-careers',
    label: 'Courses & Careers',
    title: 'Courses and Careers: Study in Russia and CIS',
    description:
      'Explore the study fields students commonly pursue in Russia and key CIS countries — engineering and technology, medicine, IT and computer science, business and economics — with neutral guidance on how to choose and verify a course.',
    intro:
      'Russia and key CIS countries (Kazakhstan, Kyrgyzstan, Uzbekistan, and Armenia) offer a broad range of programmes across the sciences, technology, medicine, and the humanities. These guides describe popular fields neutrally and explain how to choose a course that fits your goals. No course or university can guarantee a job or outcome, and volatile details such as tuition, duration, and entry requirements change over time, so always verify them on the official university and authority sources before applying.',
    group: 'study-in-russia-cis',
    region: 'russia',
    guideSlugs: [
      'popular-courses-to-study-in-russia-and-cis',
      'engineering-and-technology-studies-in-russia',
      'studying-medicine-in-russia-cis-overview',
      'it-and-computer-science-studies-in-russia',
      'business-and-economics-studies-in-russia-cis',
      'careers-after-studying-in-russia-and-cis',
      'masters-and-phd-options-in-russia',
      'research-opportunities-in-russia-and-cis',
      'most-popular-degrees-for-international-students-russia-cis',
      'how-to-choose-a-major-in-russia-cis',
    ],
    examSlugs: [
      'neet-ug',
    ],
    keywords: [
      'courses to study in russia',
      'study in russia for indian students',
      'engineering in russia',
      'computer science in russia',
      'business and economics in russia',
      'study in cis countries',
    ],
  },
  {
    slug: 'russia-cis-language-tests',
    label: 'Russia & CIS Language Tests',
    title: 'Language Tests for Russia & CIS: Russian, TORFL, IELTS and TOEFL',
    description:
      'When Russian-language proficiency is needed versus an English-medium programme, how the TORFL and the preparatory faculty fit in, and when IELTS or TOEFL is asked for across Russia and key CIS countries — with all thresholds deferred to official sources.',
    intro:
      'Whether you need a language test to study in Russia or a key CIS country depends entirely on the language your programme is taught in. Russian-medium programmes usually expect Russian proficiency — shown through the TORFL (Test of Russian as a Foreign Language) or built through a preparatory year — while English-medium programmes typically ask for IELTS or TOEFL. These guides explain the options across Russia, Kazakhstan, Kyrgyzstan, Uzbekistan and Armenia. Required levels, accepted tests and minimum scores are set by each university and can change each cycle, so always verify the current details on the official source before applying.',
    group: 'study-in-russia-cis',
    region: 'russia',
    guideSlugs: [
      'russian-language-requirements-for-universities',
      'torfl-russian-language-test-explained',
      'english-taught-programs-and-ielts-toefl-russia-cis',
      'do-you-need-russian-to-study-in-russia',
      'language-options-in-cis-universities',
      'ielts-and-toefl-for-russian-universities',
      'learning-russian-as-an-international-student',
      'russian-language-proficiency-levels-explained',
      'language-of-instruction-for-mbbs-in-russia-cis',
      'language-tips-for-studying-in-cis',
    ],
    examSlugs: [
      'ielts',
      'toefl',
    ],
    keywords: [
      'language tests for russia cis universities',
      'torfl russian language test',
      'ielts toefl for study in russia',
      'do i need russian to study in russia',
      'english medium programmes russia cis',
      'language options cis universities',
    ],
  },
  {
    slug: 'russia-cis-student-life',
    label: 'Student Life in Russia & CIS',
    title: 'Student Life in Russia & CIS: Cost, Housing, Climate & Healthcare',
    description:
      'Practical, neutral guides to everyday student life in Russia and the CIS — living costs, accommodation and dormitories, campus life, weather and packing, and healthcare and insurance.',
    intro:
      'Settling into student life in Russia and the CIS (Kazakhstan, Kyrgyzstan, Uzbekistan, and Armenia) is easier when you know what to expect day to day. These guides cover the practical essentials — budgeting for living costs, choosing between a university dormitory and a private rental, getting around campus and city, preparing for cold winters, and arranging health insurance. Throughout, we point you to official university and government sources, because costs, rules, and requirements change over time and should always be verified before you rely on them.',
    group: 'study-in-russia-cis',
    region: 'russia',
    guideSlugs: [
      'cost-of-living-for-students-in-russia',
      'student-accommodation-and-dormitories-in-russia',
      'student-life-in-russia',
      'weather-and-what-to-pack-for-russia-cis',
      'healthcare-and-insurance-for-students-in-russia-cis',
      'student-life-in-kazakhstan-and-cis',
      'getting-around-russian-cities-as-a-student',
      'settling-in-as-an-international-student-in-russia-cis',
      'staying-connected-sim-and-internet-russia-cis',
      'safety-and-practical-tips-for-students-russia-cis',
      'food-and-daily-life-for-students-in-russia-cis',
      'studying-in-russia-cis-vs-other-destinations',
      'is-russia-cis-good-for-international-students',
      'after-graduation-options-in-russia-cis',
      'frequently-asked-questions-about-studying-in-russia-cis',
    ],
    keywords: [
      'student life in russia',
      'cost of living in russia for students',
      'student accommodation russia dormitory',
      'what to pack for russia',
      'health insurance for students in russia',
      'studying in russia and cis',
    ],
  },

  // ───────────── UK & Ireland top-100 — region-gated hubs (region: 'uk-ireland') ─────────────
  {
    slug: 'uk-ireland-admissions',
    label: 'UK & Ireland Admissions',
    title: 'UK & Ireland Admissions: UCAS, CAO and How to Apply',
    description:
      'How to apply to universities in the United Kingdom and Ireland — UCAS and the CAO, entry and English requirements, the application timeline and deadlines, and step-by-step guidance for international students.',
    intro:
      'Applying to study in the UK or Ireland starts with understanding the application systems. Most UK undergraduate courses go through UCAS (up to five choices, one personal statement), while Irish undergraduate courses go through the CAO; postgraduate courses are usually applied for directly. These guides walk through the whole journey — choosing a course, meeting entry and English-language requirements, the UCAS timeline and its October and January deadlines, and what happens after you receive offers. Volatile details such as exact deadlines and fees change every cycle, so always verify them on the official source (ucas.com, cao.ie, gov.uk).',
    group: 'study-in-uk-ireland',
    region: 'uk-ireland',
    guideSlugs: [
      'how-to-study-in-the-uk-complete-guide',
      'how-to-study-in-ireland-complete-guide',
      'ucas-application-process-explained',
      'how-to-apply-to-uk-universities-step-by-step',
      'uk-university-application-timeline-and-deadlines',
      'how-to-write-a-ucas-personal-statement',
      'ucas-points-and-tariff-explained',
      'predicted-grades-and-references-explained',
      'ucas-clearing-and-adjustment-explained',
      'how-to-choose-uk-university-courses',
      'cao-application-process-for-ireland-explained',
      'uk-vs-ireland-for-international-students',
      'entry-requirements-for-uk-universities',
      'international-foundation-year-explained',
      'how-to-apply-to-uk-and-ireland-as-a-postgraduate',
    ],
    examSlugs: [
      'ielts',
      'ucat',
      'a-levels',
      'international-baccalaureate',
    ],
    keywords: [
      'uk universities application',
      'ucas application process',
      'how to apply to uk universities',
      'study in ireland cao',
      'uk university deadlines',
      'study in uk for international students',
    ],
  },
  {
    slug: 'uk-ireland-universities',
    label: 'UK & Ireland Universities',
    title: 'UK & Ireland Universities: Top Institutions, Russell Group & Oxbridge',
    description:
      'Research well-known universities across the United Kingdom and Ireland — what the Russell Group is, how to read rankings sensibly, and the official admissions process for Oxford and Cambridge.',
    intro:
      'Choosing a university in the UK or Ireland starts with understanding the landscape: research-intensive institutions, league tables published by bodies like QS and THE, and the distinctive Oxbridge process. These guides describe notable universities neutrally and point you to official sources for every entry requirement, deadline, and fee. Use them as a starting point, then verify the current details on UCAS and each university\'s own site before you apply.',
    group: 'study-in-uk-ireland',
    region: 'uk-ireland',
    guideSlugs: [
      'top-universities-in-the-uk-for-international-students',
      'russell-group-universities-explained',
      'how-to-get-into-oxford-or-cambridge',
      'how-to-get-admission-in-university-of-oxford',
      'how-to-get-admission-in-university-of-cambridge',
      'how-to-get-admission-in-imperial-college-london',
      'how-to-get-admission-in-ucl',
      'how-to-get-admission-in-lse',
      'how-to-get-admission-in-kings-college-london',
      'studying-in-london-as-an-international-student',
      'how-to-get-admission-in-university-of-edinburgh',
      'studying-in-scotland-universities-and-four-year-degrees',
      'top-russell-group-universities-outside-london',
      'top-universities-in-ireland-for-international-students',
      'how-to-get-admission-in-trinity-college-dublin',
    ],
    examSlugs: [
      'ucat',
      'a-levels',
      'international-baccalaureate',
      'ielts',
    ],
    keywords: [
      'top universities in uk for international students',
      'russell group universities',
      'how to get into oxford',
      'how to get into cambridge',
      'uk university rankings',
      'study in uk universities',
    ],
  },
  {
    slug: 'uk-ireland-medicine-competitive',
    label: 'Medicine & Competitive Courses',
    title: 'Medicine, Dentistry & Competitive Courses in the UK & Ireland',
    description:
      'How to apply for Medicine and Dentistry in the UK and Ireland — A-levels, the UCAT admissions test, the HPAT for Irish/EU medicine, interviews, and graduate-entry routes, with every requirement deferred to the official source.',
    intro:
      'Medicine and Dentistry are among the most competitive courses in the UK and Ireland. These guides explain the standard routes — A-level (and equivalent) subjects, the UCAT for UK medical and dental schools, the HPAT and CAO route for Irish/EU medicine, Multiple Mini Interviews, and graduate-entry programmes for degree-holders. Entry requirements, tests, deadlines, and fees vary by school and change each year, so always verify the current details on each medical or dental school\'s official pages and the official admissions-test sources. This is general information and is not a guarantee of admission.',
    group: 'study-in-uk-ireland',
    region: 'uk-ireland',
    guideSlugs: [
      'how-to-study-medicine-in-the-uk',
      'ucat-exam-guide-for-uk-medicine',
      'how-to-study-dentistry-in-the-uk',
      'how-to-study-medicine-in-ireland',
      'graduate-entry-medicine-in-the-uk-and-ireland',
      'how-to-study-law-in-the-uk',
      'lnat-and-uk-law-admissions-tests-explained',
      'how-to-study-veterinary-medicine-in-the-uk',
      'oxbridge-and-university-admissions-tests-explained',
      'how-to-prepare-for-competitive-uk-course-interviews',
    ],
    examSlugs: [
      'ucat',
      'a-levels',
    ],
    keywords: [
      'study medicine in the uk',
      'ucat exam for medicine',
      'study dentistry in the uk',
      'study medicine in ireland hpat',
      'graduate entry medicine uk ireland',
      'uk medical school requirements',
    ],
  },
  {
    slug: 'uk-ireland-student-visas',
    label: 'UK & Ireland Student Visas',
    title: 'UK & Ireland Student Visas: Routes, CAS, IHS and Documents',
    description:
      'Plain-English guides to studying in the UK and Ireland legally — the UK Student visa, CAS, financial requirements, the Immigration Health Surcharge, and document checklists. General information, not immigration advice; verify everything on the official government source.',
    intro:
      'Getting your student visa right is one of the most important steps in studying in the United Kingdom or Ireland. These guides explain how the UK Student visa works — the CAS your university issues, the financial evidence you must show, the Immigration Health Surcharge, and the documents you typically prepare — in clear, neutral terms. Immigration rules change frequently, so every guide points you to the official gov.uk pages and reminds you that this is general information, not immigration advice. No service can guarantee a visa; the decision always rests with the authorities.',
    group: 'study-in-uk-ireland',
    region: 'uk-ireland',
    guideSlugs: [
      'uk-student-visa-requirements-and-process',
      'cas-confirmation-of-acceptance-for-studies-explained',
      'uk-student-visa-financial-requirements',
      'immigration-health-surcharge-ihs-explained',
      'uk-student-visa-documents-checklist',
      'ireland-student-visa-and-stamp-2-explained',
      'ireland-student-visa-financial-requirements',
      'bringing-dependants-on-a-uk-student-visa',
      'english-language-requirements-for-uk-student-visa',
      'uk-student-visa-interview-and-credibility-tips',
    ],
    examSlugs: [
      'ielts',
    ],
    keywords: [
      'uk student visa',
      'uk student visa requirements',
      'cas confirmation of acceptance for studies',
      'immigration health surcharge',
      'uk student visa documents checklist',
      'uk student visa financial requirements',
    ],
  },
  {
    slug: 'uk-ireland-tuition-scholarships',
    label: 'UK & Ireland Tuition & Scholarships',
    title: 'UK & Ireland Scholarships and Funding for International Students',
    description:
      'Plain-English guides to funding study in the UK and Ireland — Chevening, Commonwealth, GREAT and university scholarships for the UK, plus Government of Ireland and institutional awards for Ireland. Secular eligibility only; amounts and deadlines change every cycle, so verify everything on the official source. No service can guarantee an award.',
    intro:
      'Studying in the United Kingdom or Ireland is an investment, and scholarships can make it far more affordable. These guides explain the major funding routes in clear, neutral terms — for the UK: the government-funded Chevening and Commonwealth scholarships, the British Council GREAT Scholarships, and the awards individual universities run; for Ireland: the Government of Ireland International Education Scholarships and university-level support. Every award is described by its secular, official eligibility only — never by faith or background. Amounts, eligible countries and deadlines change each cycle, so each guide points you to the official programme page and reminds you to verify the current rules there. Be cautious of anyone asking you to pay for a \'guaranteed\' scholarship: legitimate awards never work that way, and no service can guarantee funding.',
    group: 'study-in-uk-ireland',
    region: 'uk-ireland',
    guideSlugs: [
      'scholarships-to-study-in-the-uk-for-international-students',
      'chevening-scholarship-guide',
      'commonwealth-scholarship-guide',
      'great-scholarships-and-uk-university-scholarships',
      'scholarships-to-study-in-ireland-for-international-students',
      'cost-of-studying-in-the-uk-for-international-students',
      'cost-of-studying-in-ireland-for-international-students',
      'tuition-fees-at-uk-universities-explained',
      'how-to-fund-your-studies-in-the-uk-and-ireland',
      'budgeting-and-living-costs-for-uk-students',
    ],
    examSlugs: [
      'ielts',
    ],
    keywords: [
      'scholarships to study in uk for international students',
      'chevening scholarship',
      'commonwealth scholarship',
      'great scholarships uk',
      'scholarships to study in ireland',
      'uk university scholarships international students',
    ],
  },
  {
    slug: 'uk-ireland-courses-careers',
    label: 'UK & Ireland Courses & Careers',
    title: 'Courses & Careers in the UK & Ireland',
    description:
      'Understand UK and Ireland degree structures, course types and study routes — from degree classifications and one-year master\'s degrees to foundation years, International Year One and sandwich placements.',
    intro:
      'Choosing where to study in the UK or Ireland starts with understanding how the degrees are built. This hub explains the common degree types and honours classifications, the difference between undergraduate and postgraduate study, the UK\'s one-year taught master\'s, the bridging routes (foundation year vs International Year One), and sandwich courses with a placement year. Every guide describes the routes neutrally and defers fees, entry requirements and visa rules to the official sources, with a reminder to verify the current details before you apply.',
    group: 'study-in-uk-ireland',
    region: 'uk-ireland',
    guideSlugs: [
      'uk-degree-types-and-classifications-explained',
      'undergraduate-vs-postgraduate-study-in-the-uk',
      'one-year-masters-in-the-uk-explained',
      'foundation-year-vs-international-year-one',
      'sandwich-courses-and-placement-years-explained',
      'most-popular-courses-for-international-students-in-the-uk',
      'studying-business-and-management-in-the-uk',
      'studying-engineering-and-computer-science-in-the-uk',
      'conversion-courses-and-changing-fields-in-the-uk',
      'choosing-a-degree-subject-in-the-uk-and-ireland',
    ],
    examSlugs: [
      'ielts',
      'a-levels',
      'international-baccalaureate',
    ],
    keywords: [
      'uk degree types explained',
      'undergraduate vs postgraduate uk',
      'one year masters in uk',
      'foundation year vs international year one',
      'sandwich course placement year uk',
      'study in uk and ireland courses',
    ],
  },
  {
    slug: 'work-and-stay-uk-ireland',
    label: 'Work & Stay (UK & Ireland)',
    title: 'Working and Staying On After Study in the UK & Ireland',
    description:
      'Official, neutral guidance on working during your studies and staying on to work after graduation in the United Kingdom and Ireland — the UK Graduate Route, Ireland\'s Third Level Graduate Programme (Stamp 1G), term-time work hours, and onward routes, all pointed back to official government sources.',
    intro:
      'Many international students want to gain experience working in the UK or Ireland — both while they study and after they graduate. These guides explain the official routes neutrally: the UK Graduate Route and Student-visa work rules, and Ireland\'s Third Level Graduate Programme (Stamp 1G) and student work permissions. Every detail — eligibility, durations, hour limits, fees, and conditions — is set by each government and can change, so each guide defers to the official source (GOV.UK and irishimmigration.ie) with a verify-on-the-official-source nudge. This is general information, not immigration advice, and no route guarantees a job or a long-term stay.',
    group: 'study-in-uk-ireland',
    region: 'uk-ireland',
    guideSlugs: [
      'uk-graduate-route-visa-explained',
      'working-while-studying-in-the-uk',
      'ireland-third-level-graduate-programme-stamp-1g',
      'working-while-studying-in-ireland',
      'post-study-work-options-in-the-uk-and-ireland',
      'finding-part-time-jobs-as-a-student-in-the-uk',
      'internships-and-placements-for-international-students-uk',
      'how-to-find-a-graduate-job-in-the-uk',
      'uk-skilled-worker-visa-after-graduation-overview',
      'staying-in-ireland-after-graduation-overview',
    ],
    keywords: [
      'uk graduate route visa',
      'working while studying in uk',
      'ireland stamp 1g',
      'working while studying in ireland',
      'post study work uk and ireland',
      'stay and work after graduation uk ireland',
    ],
  },
  {
    slug: 'uk-ireland-student-life',
    label: 'UK & Ireland Student Life',
    title: 'Student Life in the UK & Ireland',
    description:
      'Practical guides to everyday student life in the UK and Ireland — accommodation, cost of living, opening a bank account, and accessing healthcare.',
    intro:
      'Settling into student life in the United Kingdom or Ireland means sorting out the practical essentials: where you will live, how much daily life costs, how to manage money, and how to access healthcare. These guides explain how each works in clear, neutral terms — from university halls and private housing to the NHS and the Immigration Health Surcharge — and always point you to the official sources for current figures, because costs, fees, and rules change every year. They offer general information to help you plan, not financial, legal, or medical advice.',
    group: 'study-in-uk-ireland',
    region: 'uk-ireland',
    guideSlugs: [
      'student-accommodation-in-the-uk-explained',
      'student-accommodation-in-ireland-explained',
      'cost-of-living-for-students-in-the-uk',
      'opening-a-uk-bank-account-as-a-student',
      'healthcare-and-the-nhs-for-international-students-uk',
      'settling-in-as-an-international-student-in-the-uk',
      'uk-student-life-and-culture-overview',
      'transport-and-getting-around-as-a-student-in-the-uk',
      'healthcare-and-insurance-for-international-students-in-ireland',
      'staying-safe-and-student-support-services-in-the-uk',
      'english-language-tests-for-uk-and-ireland-universities',
      'ielts-for-uk-and-ireland-study-and-visa',
      'toefl-and-pte-for-uk-and-ireland-universities',
      'duolingo-english-test-for-uk-and-ireland',
      'english-requirements-and-exemptions-explained',
      'is-the-uk-a-good-place-to-study-for-international-students',
      'studying-in-the-uk-vs-other-destinations',
      'uk-vs-ireland-which-to-choose-for-study',
      'after-graduation-options-in-the-uk-and-ireland',
      'frequently-asked-questions-about-studying-in-the-uk-and-ireland',
    ],
    keywords: [
      'student life in the uk',
      'student accommodation uk ireland',
      'cost of living for students in the uk',
      'nhs for international students',
      'opening a uk bank account',
      'student housing ireland',
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

// Region → tracks → hubs grouping lives in ./tracks (region-first navigation
// backbone). Topic hubs no longer carry their own per-region nav helper here.

// guidesForTopic() + topicsForGuide() live in ./topic-guides — they depend on the
// heavy GUIDES data array and are kept out of this module so Client Components can
// import the lightweight TOPICS array + labels here without bundling GUIDES into
// the browser. Import those helpers from '@/lib/topic-guides' (server-side only).
