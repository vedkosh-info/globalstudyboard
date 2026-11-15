/**
 * Closed vocabularies and pure helpers for university profiles.
 *
 * Catalogue-free on purpose: this module never value-imports `lib/colleges.ts`
 * so it cannot create a circular dependency and stays safe for server and
 * client modules alike.
 */

import type { College, CollegeCountry, CollegeType } from '@/lib/colleges';

/** What kind of institution this is. Five values, all nine regions. */
export type CollegeCategory =
  | 'public-research-university'
  | 'private-research-university'
  | 'institute-of-technology'
  | 'liberal-arts-college'
  | 'specialist-school';

export const COLLEGE_CATEGORIES: readonly CollegeCategory[] = [
  'public-research-university',
  'private-research-university',
  'institute-of-technology',
  'liberal-arts-college',
  'specialist-school',
] as const;

/** Lowercase noun phrases with no article, used in the identity line and eyebrows. */
export const CATEGORY_LABELS: Record<CollegeCategory, string> = {
  'public-research-university': 'public research university',
  'private-research-university': 'private research university',
  'institute-of-technology': 'institute of technology',
  'liberal-arts-college': 'liberal arts college',
  'specialist-school': 'specialist school',
};

/** Sentence-case labels for filter buttons and directory rows. */
export const CATEGORY_ROW_LABELS: Record<CollegeCategory, string> = {
  'public-research-university': 'Public research university',
  'private-research-university': 'Private research university',
  'institute-of-technology': 'Institute of technology',
  'liberal-arts-college': 'Liberal arts college',
  'specialist-school': 'Specialist school',
};

/**
 * A named statutory or constitutional family, not a ranking club.
 * Ivy League, Russell Group, Go8, and "Public Ivy" are not systems:
 * they are editorial or membership claims and stay out of this field.
 */
export type CollegeSystem =
  | 'iit'
  | 'nit'
  | 'iim'
  | 'aiims'
  | 'nlu'
  | 'iisc';

export const COLLEGE_SYSTEMS: readonly CollegeSystem[] = [
  'iit',
  'nit',
  'iim',
  'aiims',
  'nlu',
  'iisc',
] as const;

export const SYSTEM_LABELS: Record<CollegeSystem, string> = {
  iit: 'Indian Institute of Technology (IIT)',
  nit: 'National Institute of Technology (NIT)',
  iim: 'Indian Institute of Management (IIM)',
  aiims: 'All India Institute of Medical Sciences (AIIMS)',
  nlu: 'National Law University (NLU)',
  iisc: 'Indian Institute of Science (IISc)',
};

/**
 * Fields a university is organised around. Not a course catalogue.
 * A value is stored only when `organisation` names a faculty, school,
 * college, or equivalent unit on the official site that maps to it.
 */
export type Specialization =
  | 'engineering'
  | 'computing'
  | 'natural-sciences'
  | 'mathematics'
  | 'medicine-health'
  | 'business'
  | 'law'
  | 'social-sciences'
  | 'arts-humanities'
  | 'architecture-design'
  | 'education'
  | 'agriculture-environment'
  | 'media-communication';

export const SPECIALIZATIONS: readonly Specialization[] = [
  'engineering',
  'computing',
  'natural-sciences',
  'mathematics',
  'medicine-health',
  'business',
  'law',
  'social-sciences',
  'arts-humanities',
  'architecture-design',
  'education',
  'agriculture-environment',
  'media-communication',
] as const;

export const SPECIALIZATION_LABELS: Record<Specialization, string> = {
  engineering: 'Engineering',
  computing: 'Computing',
  'natural-sciences': 'Natural sciences',
  mathematics: 'Mathematics',
  'medicine-health': 'Medicine & health',
  business: 'Business',
  law: 'Law',
  'social-sciences': 'Social sciences',
  'arts-humanities': 'Arts & humanities',
  'architecture-design': 'Architecture & design',
  education: 'Education',
  'agriculture-environment': 'Agriculture & environment',
  'media-communication': 'Media & communication',
};

/** Set only when the official about page states it. Never inferred from the country. */
export type CollegeControl = 'public' | 'private';

export const CONTROL_LABELS: Record<CollegeControl, string> = {
  public: 'Public',
  private: 'Private',
};

/** Human label + ISO 3166-1 alpha-2 code for each country a college can sit in. */
export const COLLEGE_COUNTRY_INFO: Record<CollegeCountry, { label: string; iso: string }> = {
  usa: { label: 'USA', iso: 'US' },
  canada: { label: 'Canada', iso: 'CA' },
  uk: { label: 'UK', iso: 'GB' },
  ireland: { label: 'Ireland', iso: 'IE' },
  germany: { label: 'Germany', iso: 'DE' },
  france: { label: 'France', iso: 'FR' },
  netherlands: { label: 'Netherlands', iso: 'NL' },
  switzerland: { label: 'Switzerland', iso: 'CH' },
  sweden: { label: 'Sweden', iso: 'SE' },
  denmark: { label: 'Denmark', iso: 'DK' },
  norway: { label: 'Norway', iso: 'NO' },
  finland: { label: 'Finland', iso: 'FI' },
  austria: { label: 'Austria', iso: 'AT' },
  poland: { label: 'Poland', iso: 'PL' },
  italy: { label: 'Italy', iso: 'IT' },
  spain: { label: 'Spain', iso: 'ES' },
  belgium: { label: 'Belgium', iso: 'BE' },
  czechia: { label: 'Czechia', iso: 'CZ' },
  hungary: { label: 'Hungary', iso: 'HU' },
  portugal: { label: 'Portugal', iso: 'PT' },
  romania: { label: 'Romania', iso: 'RO' },
  bulgaria: { label: 'Bulgaria', iso: 'BG' },
  georgia: { label: 'Georgia', iso: 'GE' },
  australia: { label: 'Australia', iso: 'AU' },
  'new-zealand': { label: 'New Zealand', iso: 'NZ' },
  russia: { label: 'Russia', iso: 'RU' },
  kazakhstan: { label: 'Kazakhstan', iso: 'KZ' },
  kyrgyzstan: { label: 'Kyrgyzstan', iso: 'KG' },
  uzbekistan: { label: 'Uzbekistan', iso: 'UZ' },
  armenia: { label: 'Armenia', iso: 'AM' },
  uae: { label: 'UAE', iso: 'AE' },
  qatar: { label: 'Qatar', iso: 'QA' },
  'saudi-arabia': { label: 'Saudi Arabia', iso: 'SA' },
  oman: { label: 'Oman', iso: 'OM' },
  bahrain: { label: 'Bahrain', iso: 'BH' },
  kuwait: { label: 'Kuwait', iso: 'KW' },
  israel: { label: 'Israel', iso: 'IL' },
  singapore: { label: 'Singapore', iso: 'SG' },
  'hong-kong': { label: 'Hong Kong', iso: 'HK' },
  japan: { label: 'Japan', iso: 'JP' },
  'south-korea': { label: 'South Korea', iso: 'KR' },
  malaysia: { label: 'Malaysia', iso: 'MY' },
  taiwan: { label: 'Taiwan', iso: 'TW' },
  china: { label: 'China', iso: 'CN' },
  philippines: { label: 'Philippines', iso: 'PH' },
  thailand: { label: 'Thailand', iso: 'TH' },
  india: { label: 'India', iso: 'IN' },
};

/** Unique specializations from official organisation units, in vocabulary order. */
export function deriveSpecializations(
  organisation?: readonly { specialization: Specialization }[],
): Specialization[] {
  if (!organisation || organisation.length === 0) return [];
  const present = new Set(organisation.map((u) => u.specialization));
  return SPECIALIZATIONS.filter((s) => present.has(s));
}

/**
 * Place string that omits a state or country token already contained in the city
 * (so "Singapore, Singapore", "Hong Kong, Hong Kong", and "New York, New York" are avoided).
 */
export function identityPlace(c: Pick<College, 'city' | 'state' | 'country'>): string {
  const country = COLLEGE_COUNTRY_INFO[c.country].label;
  const cityHas = (token: string) => c.city.toLowerCase().includes(token.toLowerCase());
  const parts = [c.city];
  if (c.state && !cityHas(c.state)) parts.push(c.state);
  if (!cityHas(country)) parts.push(country);
  return parts.join(', ');
}

/**
 * Generated one-sentence identity line for a categorized college record.
 */
export function collegeIdentityLine(
  c: Pick<College, 'nameEn' | 'category' | 'city' | 'state' | 'country' | 'established'>,
): string {
  const kind = CATEGORY_LABELS[c.category!];
  const article = /^[aeiou]/i.test(kind) ? 'an' : 'a';
  return `${c.nameEn} is ${article} ${kind} in ${identityPlace(c)}, established in ${c.established}.`;
}

/**
 * Map a record to the directory filter's category token, or null when only "All" matches.
 */
export function categoryForFilter(c: Pick<College, 'category' | 'type'>): CollegeCategory | null {
  if (c.category) return c.category;
  switch (c.type) {
    case 'institute-of-technology':
    case 'iit':
    case 'nit':
    case 'iisc':
      return 'institute-of-technology';
    case 'liberal-arts':
      return 'liberal-arts-college';
    case 'medical-school':
    case 'law-school':
    case 'business-school':
    case 'iim':
    case 'aiims':
    case 'nlu':
      return 'specialist-school';
    default:
      // research-university, public-university, private-university.
      // 82 + 16 + 3 = 101 of 130 rows today. They match only "All".
      return null;
  }
}

/**
 * Fixed legacy `CollegeType` mapping for categorized records (§2 table).
 */
export function legacyTypeFor(
  c: Pick<College, 'category' | 'system' | 'organisation' | 'specializations'>,
): CollegeType {
  switch (c.category) {
    case 'public-research-university':
      return 'public-university';
    case 'private-research-university':
      return 'private-university';
    case 'institute-of-technology':
      if (c.system === 'iit' || c.system === 'nit' || c.system === 'iisc') return c.system;
      return 'institute-of-technology';
    case 'liberal-arts-college':
      return 'liberal-arts';
    case 'specialist-school': {
      if (c.system === 'iim' || c.system === 'aiims' || c.system === 'nlu') return c.system;
      const specs = c.specializations ?? deriveSpecializations(c.organisation);
      if (specs.includes('medicine-health')) return 'medical-school';
      if (specs.includes('law')) return 'law-school';
      if (specs.includes('business')) return 'business-school';
      return 'research-university';
    }
    default:
      return 'research-university';
  }
}

/** Banned editorial/promotional words on categorized college prose fields. */
export const BANNED_COLLEGE_PROSE_RE =
  /\b(?:top|best|famous|prestigious|selective|ivy|guarantee|ranked\s+among)\b/i;
