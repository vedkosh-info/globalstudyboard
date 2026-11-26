// ─────────────────────────────────────────────────────────────────────────────
// Place registry — the canonical names behind the university place pages
// (/regions/{region}/universities/{country}/{state}/{city}).
//
// Pure data. It imports no catalogue, so a client file may import it without
// pulling COLLEGES into its chunk.
//
// Rules (docs/GLOBAL_COLLEGE_DIRECTORY_ARCHITECTURE.md):
// - A country, a subdivision and a city each have ONE slug. URLs never change
//   when content grows, so the subdivision level of a country is decided here,
//   once, before any page for that country is published.
// - Names are the administrative names in plain English. They carry no claim
//   about sovereignty or status. Hong Kong and Taiwan appear as places on the
//   same footing as every other entry (content-policy §4.D).
// - A subdivision is listed only where students commonly search by it (US
//   states, Indian states, Canadian provinces, UK nations, Australian states).
//   Everywhere else the city sits directly under the country.
// ─────────────────────────────────────────────────────────────────────────────
import type { CollegeCountry } from './colleges';
import type { RegionSlug } from './regions';

export interface PlaceCountry {
  /** Full English name, used in headings: "United Kingdom". */
  name: string;
  /** Name inside a sentence after "in": "the United Kingdom". */
  proseName: string;
}

export const PLACE_COUNTRIES: Record<CollegeCountry, PlaceCountry> = {
  usa: { name: 'United States', proseName: 'the United States' },
  canada: { name: 'Canada', proseName: 'Canada' },
  uk: { name: 'United Kingdom', proseName: 'the United Kingdom' },
  ireland: { name: 'Ireland', proseName: 'Ireland' },
  germany: { name: 'Germany', proseName: 'Germany' },
  france: { name: 'France', proseName: 'France' },
  netherlands: { name: 'Netherlands', proseName: 'the Netherlands' },
  switzerland: { name: 'Switzerland', proseName: 'Switzerland' },
  sweden: { name: 'Sweden', proseName: 'Sweden' },
  denmark: { name: 'Denmark', proseName: 'Denmark' },
  norway: { name: 'Norway', proseName: 'Norway' },
  finland: { name: 'Finland', proseName: 'Finland' },
  austria: { name: 'Austria', proseName: 'Austria' },
  poland: { name: 'Poland', proseName: 'Poland' },
  italy: { name: 'Italy', proseName: 'Italy' },
  spain: { name: 'Spain', proseName: 'Spain' },
  belgium: { name: 'Belgium', proseName: 'Belgium' },
  czechia: { name: 'Czechia', proseName: 'Czechia' },
  hungary: { name: 'Hungary', proseName: 'Hungary' },
  portugal: { name: 'Portugal', proseName: 'Portugal' },
  romania: { name: 'Romania', proseName: 'Romania' },
  bulgaria: { name: 'Bulgaria', proseName: 'Bulgaria' },
  georgia: { name: 'Georgia', proseName: 'Georgia' },
  australia: { name: 'Australia', proseName: 'Australia' },
  'new-zealand': { name: 'New Zealand', proseName: 'New Zealand' },
  russia: { name: 'Russia', proseName: 'Russia' },
  kazakhstan: { name: 'Kazakhstan', proseName: 'Kazakhstan' },
  kyrgyzstan: { name: 'Kyrgyzstan', proseName: 'Kyrgyzstan' },
  uzbekistan: { name: 'Uzbekistan', proseName: 'Uzbekistan' },
  armenia: { name: 'Armenia', proseName: 'Armenia' },
  uae: { name: 'United Arab Emirates', proseName: 'the United Arab Emirates' },
  qatar: { name: 'Qatar', proseName: 'Qatar' },
  'saudi-arabia': { name: 'Saudi Arabia', proseName: 'Saudi Arabia' },
  oman: { name: 'Oman', proseName: 'Oman' },
  bahrain: { name: 'Bahrain', proseName: 'Bahrain' },
  kuwait: { name: 'Kuwait', proseName: 'Kuwait' },
  jordan: { name: 'Jordan', proseName: 'Jordan' },
  israel: { name: 'Israel', proseName: 'Israel' },
  singapore: { name: 'Singapore', proseName: 'Singapore' },
  'hong-kong': { name: 'Hong Kong', proseName: 'Hong Kong' },
  japan: { name: 'Japan', proseName: 'Japan' },
  'south-korea': { name: 'South Korea', proseName: 'South Korea' },
  malaysia: { name: 'Malaysia', proseName: 'Malaysia' },
  taiwan: { name: 'Taiwan', proseName: 'Taiwan' },
  china: { name: 'China', proseName: 'China' },
  philippines: { name: 'Philippines', proseName: 'the Philippines' },
  thailand: { name: 'Thailand', proseName: 'Thailand' },
  india: { name: 'India', proseName: 'India' },
};

/**
 * Destinations that are one country. Their region page already IS the country
 * page, so their place paths start at the state: /regions/india/universities/karnataka.
 */
export const SINGLE_COUNTRY_REGIONS: Partial<Record<RegionSlug, CollegeCountry>> = {
  usa: 'usa',
  canada: 'canada',
  india: 'india',
};

export interface PlaceSubdivision {
  slug: string;
  name: string;
  /** Other spellings a record may use. Matched case- and accent-insensitively. */
  aliases?: string[];
}

export interface SubdivisionScheme {
  /** Singular noun for headings: "state", "province or territory". */
  noun: string;
  /** Plural noun for "Browse by …": "states", "provinces and territories". */
  plural: string;
  entries: PlaceSubdivision[];
}

const s = (name: string, aliases?: string[]): PlaceSubdivision => ({
  slug: name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''),
  name,
  ...(aliases ? { aliases } : {}),
});

/**
 * Countries whose universities are grouped by a subdivision. Every college in
 * one of these countries MUST carry a `state` that resolves here
 * (scripts/check-places.ts fails the build otherwise). Adding a country to this
 * table changes that country's city URLs, so do it before its first city page
 * is published, never after.
 */
export const SUBDIVISIONS: Partial<Record<CollegeCountry, SubdivisionScheme>> = {
  india: {
    noun: 'state or union territory',
    plural: 'states and union territories',
    entries: [
      s('Andhra Pradesh'),
      s('Arunachal Pradesh'),
      s('Assam'),
      s('Bihar'),
      s('Chhattisgarh'),
      s('Goa'),
      s('Gujarat'),
      s('Haryana'),
      s('Himachal Pradesh'),
      s('Jharkhand'),
      s('Karnataka'),
      s('Kerala'),
      s('Madhya Pradesh'),
      s('Maharashtra'),
      s('Manipur'),
      s('Meghalaya'),
      s('Mizoram'),
      s('Nagaland'),
      s('Odisha', ['Orissa']),
      s('Punjab'),
      s('Rajasthan'),
      s('Sikkim'),
      s('Tamil Nadu'),
      s('Telangana'),
      s('Tripura'),
      s('Uttar Pradesh'),
      s('Uttarakhand'),
      s('West Bengal'),
      s('Andaman and Nicobar Islands'),
      s('Chandigarh'),
      s('Dadra and Nagar Haveli and Daman and Diu'),
      s('Delhi', ['NCT of Delhi', 'National Capital Territory of Delhi']),
      s('Jammu and Kashmir'),
      s('Ladakh'),
      s('Lakshadweep'),
      s('Puducherry', ['Pondicherry']),
    ],
  },
  usa: {
    noun: 'state',
    plural: 'states',
    entries: [
      s('Alabama'),
      s('Alaska'),
      s('Arizona'),
      s('Arkansas'),
      s('California'),
      s('Colorado'),
      s('Connecticut'),
      s('Delaware'),
      s('District of Columbia', ['Washington, D.C.', 'Washington DC', 'D.C.']),
      s('Florida'),
      s('Georgia'),
      s('Hawaii'),
      s('Idaho'),
      s('Illinois'),
      s('Indiana'),
      s('Iowa'),
      s('Kansas'),
      s('Kentucky'),
      s('Louisiana'),
      s('Maine'),
      s('Maryland'),
      s('Massachusetts'),
      s('Michigan'),
      s('Minnesota'),
      s('Mississippi'),
      s('Missouri'),
      s('Montana'),
      s('Nebraska'),
      s('Nevada'),
      s('New Hampshire'),
      s('New Jersey'),
      s('New Mexico'),
      s('New York'),
      s('North Carolina'),
      s('North Dakota'),
      s('Ohio'),
      s('Oklahoma'),
      s('Oregon'),
      s('Pennsylvania'),
      s('Rhode Island'),
      s('South Carolina'),
      s('South Dakota'),
      s('Tennessee'),
      s('Texas'),
      s('Utah'),
      s('Vermont'),
      s('Virginia'),
      s('Washington', ['Washington State']),
      s('West Virginia'),
      s('Wisconsin'),
      s('Wyoming'),
    ],
  },
  canada: {
    noun: 'province or territory',
    plural: 'provinces and territories',
    entries: [
      s('Alberta'),
      s('British Columbia'),
      s('Manitoba'),
      s('New Brunswick'),
      s('Newfoundland and Labrador'),
      s('Nova Scotia'),
      s('Ontario'),
      s('Prince Edward Island'),
      s('Quebec', ['Québec']),
      s('Saskatchewan'),
      s('Northwest Territories'),
      s('Nunavut'),
      s('Yukon'),
    ],
  },
  uk: {
    noun: 'nation',
    plural: 'nations',
    entries: [s('England'), s('Scotland'), s('Wales'), s('Northern Ireland')],
  },
  australia: {
    noun: 'state or territory',
    plural: 'states and territories',
    entries: [
      s('New South Wales'),
      s('Victoria'),
      s('Queensland'),
      s('Western Australia'),
      s('South Australia'),
      s('Tasmania'),
      s('Australian Capital Territory'),
      s('Northern Territory'),
    ],
  },
};

/**
 * One spelling per city. A record that uses an older or alternative name is
 * grouped under the canonical one, so "Bangalore" and "Bengaluru" never become
 * two city pages. Keys are `${country}:${normalized name}`.
 */
export const CITY_ALIASES: Record<string, string> = {
  'usa:new york': 'New York City',
  'india:bangalore': 'Bengaluru',
  'india:bombay': 'Mumbai',
  'india:madras': 'Chennai',
  'india:calcutta': 'Kolkata',
  'india:gurgaon': 'Gurugram',
  'india:trivandrum': 'Thiruvananthapuram',
  'india:benares': 'Varanasi',
  'india:banaras': 'Varanasi',
  'russia:st petersburg': 'Saint Petersburg',
  'russia:st. petersburg': 'Saint Petersburg',
};

// Census regions group the U.S. directory's links without adding URL levels.
// https://www.census.gov/data/data-tools/survey-explorer/geo.html
export const USA_CENSUS_REGIONS: readonly { label: string; subdivisions: readonly string[] }[] = [
  {
    label: 'Northeast',
    subdivisions: ['connecticut', 'maine', 'massachusetts', 'new-hampshire', 'new-jersey', 'new-york', 'pennsylvania', 'rhode-island', 'vermont'],
  },
  {
    label: 'Midwest',
    subdivisions: ['illinois', 'indiana', 'iowa', 'kansas', 'michigan', 'minnesota', 'missouri', 'nebraska', 'north-dakota', 'ohio', 'south-dakota', 'wisconsin'],
  },
  {
    label: 'South',
    subdivisions: ['alabama', 'arkansas', 'delaware', 'district-of-columbia', 'florida', 'georgia', 'kentucky', 'louisiana', 'maryland', 'mississippi', 'north-carolina', 'oklahoma', 'south-carolina', 'tennessee', 'texas', 'virginia', 'west-virginia'],
  },
  {
    label: 'West',
    subdivisions: ['alaska', 'arizona', 'california', 'colorado', 'hawaii', 'idaho', 'montana', 'nevada', 'new-mexico', 'oregon', 'utah', 'washington', 'wyoming'],
  },
];

/** Minimum university profiles before a place gets its own page. */
export const MIN_PLACE_PROFILES = 3;
