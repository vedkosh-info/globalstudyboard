export type RegionSlug =
  | 'usa'
  | 'canada'
  | 'uk-ireland'
  | 'europe'
  | 'australia-nz'
  | 'russia'
  | 'middle-east'
  | 'india'
  | 'east-southeast-asia';

export interface Region {
  slug: RegionSlug;
  displayName: string;
  flag: string;
  countries: string[];
  currency: { code: string; symbol: string };
  primaryApplicationPlatform: string;
  educationSystemSummary: string;
  keyExamSlugs: string[];
  popularQueries: string[];
  intakes: string[];
  averageTuitionRangeUsd: { undergrad: [number, number]; grad: [number, number] } | null;
  visaName: string | null;
  worksWhileStudying: string;
}

export const REGIONS: Region[] = [
  {
    slug: 'usa',
    displayName: 'United States',
    flag: '🇺🇸',
    countries: ['United States'],
    currency: { code: 'USD', symbol: '$' },
    primaryApplicationPlatform: 'Common App',
    educationSystemSummary:
      'Four-year bachelor\'s programs with a flexible major/minor system, two-year master\'s programs, and PhDs that combine coursework and research. Liberal arts colleges focus on undergraduate breadth; research universities emphasize graduate work. Most applicants apply via the Common App or Coalition App to multiple schools at once.',
    keyExamSlugs: ['sat', 'act', 'gre', 'gmat', 'toefl', 'duolingo-english-test'],
    popularQueries: [
      'how-to-apply-to-us-universities',
      'sat-vs-act',
      'common-app-essay-prompts',
      'f1-visa-interview',
      'need-blind-universities-international-students',
    ],
    intakes: ['Fall (Aug/Sep)', 'Spring (Jan)'],
    averageTuitionRangeUsd: { undergrad: [11000, 65000], grad: [25000, 75000] },
    visaName: 'F-1 Student Visa',
    worksWhileStudying: 'Up to 20 hrs/week on-campus during term; full-time on breaks. OPT after graduation.',
  },
  {
    slug: 'canada',
    displayName: 'Canada',
    flag: '🇨🇦',
    countries: ['Canada'],
    currency: { code: 'CAD', symbol: 'C$' },
    primaryApplicationPlatform: 'OUAC (Ontario) or direct via university portal',
    educationSystemSummary:
      'Three- or four-year bachelor\'s programs, one- or two-year master\'s, three-to-five-year PhDs. Public universities dominate; the Group of Canadian Research Universities (U15) sets the research benchmark. Ontario applicants use OUAC; other provinces apply directly to each institution.',
    keyExamSlugs: ['sat', 'gre', 'gmat', 'ielts', 'toefl', 'duolingo-english-test'],
    popularQueries: [
      'study-in-canada-without-ielts',
      'post-graduation-work-permit-canada',
      'cost-of-living-canada-students',
      'best-co-op-universities-canada',
    ],
    intakes: ['Fall (Sep)', 'Winter (Jan)', 'Summer (May)'],
    averageTuitionRangeUsd: { undergrad: [12000, 35000], grad: [10000, 45000] },
    visaName: 'Study Permit',
    worksWhileStudying: 'Up to 24 hrs/week off-campus during term; full-time on breaks. PGWP up to 3 years after graduation.',
  },
  {
    slug: 'uk-ireland',
    displayName: 'United Kingdom & Ireland',
    flag: '🇬🇧',
    countries: ['United Kingdom', 'Ireland'],
    currency: { code: 'GBP', symbol: '£' },
    primaryApplicationPlatform: 'UCAS (UK) / CAO (Ireland)',
    educationSystemSummary:
      'Three-year bachelor\'s (or four with placement year/Scotland), one-year master\'s, three-to-four-year PhDs. UK applications go through UCAS with up to five course choices; Ireland uses the CAO points system. Specialist degrees start day one — you apply to the subject, not the school.',
    keyExamSlugs: ['ielts', 'toefl', 'pte-academic', 'gre', 'gmat', 'ucat'],
    popularQueries: [
      'how-to-study-in-the-uk-complete-guide',
      'ucas-application-process-explained',
      'uk-student-visa-requirements-and-process',
      'uk-graduate-route-visa-explained',
      'ireland-student-visa-and-stamp-2-explained',
      'chevening-scholarship-guide',
    ],
    intakes: ['Autumn (Sep/Oct)'],
    averageTuitionRangeUsd: { undergrad: [12000, 45000], grad: [15000, 55000] },
    visaName: 'Student Visa (UK) / Stamp 2 (Ireland)',
    worksWhileStudying: 'UK: 20 hrs/week during term, full-time on breaks. Graduate Route: 2 years stay after degree.',
  },
  {
    slug: 'europe',
    displayName: 'Europe',
    flag: '🇪🇺',
    countries: [
      'Germany',
      'France',
      'Netherlands',
      'Switzerland',
      'Sweden',
      'Denmark',
      'Norway',
      'Finland',
      'Italy',
      'Spain',
      'Belgium',
      'Austria',
      'Poland',
      'Czechia',
    ],
    currency: { code: 'EUR', symbol: '€' },
    primaryApplicationPlatform: 'Uni-Assist (DE) / Campus France / Studielink (NL) / direct',
    educationSystemSummary:
      'The Bologna Process aligns most EU degrees: 3-year bachelor\'s, 2-year master\'s, 3-4 year PhDs. Many programs are tuition-free or low-fee for international students, especially in Germany, Norway, and parts of Scandinavia. English-taught programs are widely available at the master\'s level; bachelor\'s programs increasingly so. Erasmus+ supports exchange across the EU.',
    keyExamSlugs: ['ielts', 'toefl', 'testas', 'gre', 'gmat', 'duolingo-english-test'],
    popularQueries: [
      'free-tuition-universities-europe',
      'english-taught-bachelors-germany',
      'studienkolleg-do-i-need-it',
      'blocked-account-germany',
      'scholarships-eu-students',
      'apply-to-eth-zurich-international',
    ],
    intakes: ['Winter (Sep/Oct)', 'Summer (Mar/Apr) — varies'],
    averageTuitionRangeUsd: { undergrad: [0, 25000], grad: [0, 30000] },
    visaName: 'National Student Visa (Schengen long-stay)',
    worksWhileStudying: 'Typically 20 hrs/week or up to 140 full (280 half) days per year — varies by country; verify on the official source. Post-study work visas: Germany 18 months, Netherlands 1 year, France 1-2 years.',
  },
  {
    slug: 'australia-nz',
    displayName: 'Australia & New Zealand',
    flag: '🇦🇺',
    countries: ['Australia', 'New Zealand'],
    currency: { code: 'AUD', symbol: 'A$' },
    primaryApplicationPlatform: 'Direct via university / UAC (NSW) / VTAC (VIC)',
    educationSystemSummary:
      'Three- or four-year bachelor\'s (honours adds one year), one- or two-year master\'s by coursework or research, three-to-four-year PhDs. Australia\'s Group of Eight (Go8) leads research output. International students apply directly to most universities; New South Wales uses UAC for undergraduate.',
    keyExamSlugs: ['ielts', 'toefl', 'pte-academic', 'gre', 'gmat', 'duolingo-english-test'],
    popularQueries: [
      'australia-student-visa-financial-requirements',
      'temporary-graduate-visa-485',
      'new-zealand-post-study-work',
      'best-universities-australia-engineering',
    ],
    intakes: ['Semester 1 (Feb/Mar)', 'Semester 2 (Jul/Aug)'],
    averageTuitionRangeUsd: { undergrad: [20000, 45000], grad: [22000, 50000] },
    visaName: 'Subclass 500 (AU) / Fee-Paying Student Visa (NZ)',
    worksWhileStudying: 'Australia: 48 hrs per fortnight during term. Post-study work visa 2-6 years depending on degree.',
  },
  {
    slug: 'russia',
    displayName: 'Russia & CIS',
    flag: '🇷🇺',
    countries: ['Russia', 'Kazakhstan'],
    currency: { code: 'RUB', symbol: '₽' },
    primaryApplicationPlatform: 'Direct via university / Russia.Study portal',
    educationSystemSummary:
      'Four-year bachelor\'s, two-year master\'s, three-to-four-year aspirantura (PhD-equivalent). Specialist degrees (5-6 years, integrated) common in medicine and engineering. The Russian government offers a quota scholarship (Open Doors) for international students. English-medium programs available at top universities like HSE, MIPT, ITMO, and Skoltech.',
    keyExamSlugs: ['ielts', 'toefl'],
    popularQueries: [
      'how-to-study-in-russia-complete-guide',
      'mbbs-in-russia-for-indian-students',
      'mbbs-abroad-eligibility-neet-and-nmc-rules',
      'russian-government-scholarship-and-open-doors',
      'russia-student-visa-guide',
      'english-taught-programs-in-russia',
    ],
    intakes: ['September'],
    averageTuitionRangeUsd: { undergrad: [3000, 12000], grad: [3500, 14000] },
    visaName: 'Russian Student Visa (type O)',
    worksWhileStudying: 'Full-time students at state-accredited universities may work without a separate work permit; verify current rules on the official source.',
  },
  {
    slug: 'middle-east',
    displayName: 'Middle East',
    flag: '🇦🇪',
    countries: ['United Arab Emirates', 'Qatar', 'Saudi Arabia', 'Oman', 'Bahrain', 'Israel'],
    currency: { code: 'USD', symbol: '$' },
    primaryApplicationPlatform: 'Direct via university',
    educationSystemSummary:
      'A growing destination with American-style universities (NYU Abu Dhabi, AUS, AUD), branch campuses (Texas A&M Qatar, Carnegie Mellon Qatar), and research institutions (KAUST, Khalifa, Technion). Most programs in English. Generous scholarships are common for top international applicants. Hub cities Dubai, Abu Dhabi, and Doha offer multicultural campuses.',
    keyExamSlugs: ['sat', 'ielts', 'toefl', 'gre', 'gmat'],
    popularQueries: [
      'how-to-study-in-the-gulf-complete-guide',
      'kaust-fellowship-guide',
      'uae-student-visa-guide',
      'qatar-education-city-universities-guide',
      'scholarships-for-international-students-in-the-uae',
      'are-gulf-universities-tuition-free',
    ],
    intakes: ['Fall (Aug/Sep)', 'Spring (Jan)'],
    averageTuitionRangeUsd: { undergrad: [0, 65000], grad: [0, 60000] },
    visaName: 'Student Residence Visa',
    worksWhileStudying: 'Generally restricted; some universities permit on-campus work.',
  },
  {
    slug: 'india',
    displayName: 'India',
    flag: '🇮🇳',
    countries: ['India'],
    currency: { code: 'INR', symbol: '₹' },
    primaryApplicationPlatform: 'JoSAA / CSAB (engineering), CAT/CAP (MBA), CLAT consortium (law), NEET counselling (medicine)',
    educationSystemSummary:
      'Centralized entrance exams gate admission to top public institutions: JEE (engineering — IITs, NITs, IIITs), NEET (medicine — AIIMS, government colleges), CAT (MBA — IIMs), CLAT (law — NLUs). Bachelor\'s programs run three years (arts/sciences/commerce) or four years (engineering, B.Tech). The IITs, IIMs, AIIMS, NLUs, and IISc are India\'s elite institutions. Private universities (Ashoka, Manipal, BITS) admit via their own entrance tests.',
    keyExamSlugs: ['jee-main', 'jee-advanced', 'neet-ug', 'cat', 'clat', 'gate'],
    popularQueries: [
      'jee-vs-neet-which-easier',
      'iit-bombay-vs-iit-delhi-cse',
      'cat-percentile-for-iim-call',
      'study-mbbs-abroad-from-india',
      'best-private-engineering-colleges-india',
    ],
    intakes: ['July/August'],
    averageTuitionRangeUsd: { undergrad: [500, 8000], grad: [600, 12000] },
    visaName: 'N/A (domestic) / Student Visa for international applicants',
    worksWhileStudying: 'On-campus only at most institutions; internships standard in summer.',
  },
  {
    slug: 'east-southeast-asia',
    displayName: 'East & Southeast Asia',
    flag: '🇯🇵',
    countries: [
      'Japan',
      'Singapore',
      'South Korea',
      'Malaysia',
      'Hong Kong',
      'Taiwan',
      'China',
      'Philippines',
      'Thailand',
    ],
    currency: { code: 'USD', symbol: '$' },
    primaryApplicationPlatform:
      'Direct via each university (no single regional platform; Japan via university portals/JASSO, Hong Kong undergraduate via JUPAS for local students)',
    educationSystemSummary:
      "A fast-growing, high-quality study region led by globally top-ranked universities in Singapore, Japan, Hong Kong and South Korea. Bachelor's degrees run three to four years, master's one to two, and PhDs three to five. English-taught programs are widely available in Singapore, Hong Kong and Malaysia and are expanding fast in Japan (MEXT/SGU), South Korea, Taiwan and mainland China. Most international applicants apply directly to each university; government scholarships (Japan MEXT, Korea GKS, Taiwan MOE/ICDF, China CSC, and Singapore awards) are a major draw. Malaysia hosts branch campuses of UK and Australian universities, and China and the Philippines are common, NEET-and-NMC-governed routes for Indian students seeking medicine abroad.",
    keyExamSlugs: ['ielts', 'toefl', 'gre', 'gmat'],
    popularQueries: [
      'how-to-study-in-japan-from-india',
      'mext-scholarship-guide-for-indian-students',
      'how-to-study-in-singapore-from-india',
      'gks-korean-government-scholarship-guide',
      'english-taught-degrees-in-east-and-southeast-asia',
      'mbbs-in-china-and-philippines-for-indian-students',
    ],
    intakes: [
      'Varies by country — Japan: April & Sept/Oct; Singapore & Malaysia: Aug/Sept; South Korea & China: March & Sept',
    ],
    averageTuitionRangeUsd: { undergrad: [3000, 40000], grad: [3000, 45000] },
    visaName: 'Student visa / pass (varies by country)',
    worksWhileStudying:
      'Varies by country — many allow limited part-time work during term (for example Japan up to 28 hrs/week with permission; Singapore restricted); verify current rules on the official source before relying on them.',
  },
];

export const getRegionBySlug = (slug: string): Region | undefined =>
  REGIONS.find((r) => r.slug === slug);

export const REGION_SLUGS: RegionSlug[] = REGIONS.map((r) => r.slug);

/** Every region a piece of content can belong to (alias of REGION_SLUGS). */
export const ALL_REGION_SLUGS: readonly RegionSlug[] = REGION_SLUGS;

/**
 * The default study destination. When a visitor has not (yet) chosen one, the
 * whole site is tuned to India — our primary audience — so it always feels
 * tailored from the first paint. Common / cross-region content is filed here too.
 */
export const DEFAULT_REGION: RegionSlug = 'india';

/**
 * Regions in alphabetical order by display name — the canonical order for every
 * user-facing region picker (header dropdown, first-visit modal, region grid,
 * region rail). Sorting lives here so no component re-implements it.
 */
export const REGIONS_ALPHABETICAL: Region[] = [...REGIONS].sort((a, b) =>
  a.displayName.localeCompare(b.displayName),
);

/**
 * Resolve the full set of regions a content unit should DISPLAY under.
 *
 * Content is unique (one canonical page) but can be relevant to several regions
 * (e.g. IELTS is required in the UK, Canada, Australia…). A unit declares a
 * `primary` home region plus an optional `extra` set of additional regions:
 *   - `extra` present  → that explicit set (always including the primary home).
 *   - primary `'global'` (legacy exams) → ALL regions.
 *   - otherwise        → just the primary region.
 * The result is returned in canonical region order.
 */
export function resolveDisplayRegions(
  primary: RegionSlug | 'global',
  extra?: readonly RegionSlug[],
): RegionSlug[] {
  if (extra && extra.length > 0) {
    const set = new Set<RegionSlug>(extra);
    if (primary !== 'global') set.add(primary);
    return REGION_SLUGS.filter((s) => set.has(s));
  }
  if (primary === 'global') return [...REGION_SLUGS];
  return [primary];
}

/** True if `selected` is one of the regions the unit displays under. */
export function matchesRegion(
  selected: RegionSlug,
  primary: RegionSlug | 'global',
  extra?: readonly RegionSlug[],
): boolean {
  return resolveDisplayRegions(primary, extra).includes(selected);
}

/**
 * Destinations we target most heavily. Retained for any priority-ordered
 * surface; user-facing pickers use REGIONS_ALPHABETICAL instead.
 */
export const PRIMARY_REGION_SLUGS: RegionSlug[] = [
  'india',
  'usa',
  'uk-ireland',
  'canada',
  'australia-nz',
  'europe',
  'east-southeast-asia',
];

/** Short, second-person tagline used across the personalised UI. */
export const REGION_TAGLINES: Record<RegionSlug, string> = {
  india: 'IITs, NITs, IIMs, AIIMS & NLUs — cracked exam by exam.',
  usa: 'Common App, the SAT, and need-blind aid — decoded.',
  canada: 'Study permits, co-op terms, and a 3-year work runway.',
  'uk-ireland': 'UCAS, A-Levels, and the 2-year Graduate Route.',
  europe: 'Low-fee, English-taught degrees across the Bologna zone.',
  'australia-nz': 'Go8 universities and generous post-study work visas.',
  russia: 'Affordable English-medium degrees and the Open Doors quota.',
  'middle-east': 'American-style campuses and big merit scholarships.',
  'east-southeast-asia': 'NUS, Tokyo, KAIST & HKU — English-taught degrees and big government scholarships.',
};
