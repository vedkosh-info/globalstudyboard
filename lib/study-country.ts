import type { CollegeCountry } from '@/lib/colleges';

/**
 * The destination country name (`countries` in lib/regions.ts) for a college's
 * country key. Null when that country is not on its destination's list
 * (Technion sits in the Middle East catalogue; Israel is not one of that
 * destination's countries). A value import of the catalogue must never reach
 * a client component — this map is the names only.
 */
export const REGION_COUNTRY_NAME: Record<CollegeCountry, string | null> = {
  usa: 'United States',
  canada: 'Canada',
  uk: 'United Kingdom',
  ireland: 'Ireland',
  germany: 'Germany',
  france: 'France',
  netherlands: 'Netherlands',
  switzerland: 'Switzerland',
  sweden: 'Sweden',
  denmark: 'Denmark',
  italy: 'Italy',
  spain: 'Spain',
  belgium: 'Belgium',
  australia: 'Australia',
  'new-zealand': 'New Zealand',
  russia: 'Russia',
  kazakhstan: 'Kazakhstan',
  uzbekistan: 'Uzbekistan',
  armenia: 'Armenia',
  kyrgyzstan: 'Kyrgyzstan',
  uae: 'United Arab Emirates',
  qatar: 'Qatar',
  'saudi-arabia': 'Saudi Arabia',
  oman: 'Oman',
  bahrain: 'Bahrain',
  kuwait: 'Kuwait',
  israel: null,
  singapore: 'Singapore',
  'hong-kong': 'Hong Kong',
  japan: 'Japan',
  'south-korea': 'South Korea',
  malaysia: 'Malaysia',
  taiwan: 'Taiwan',
  china: 'China',
  philippines: 'Philippines',
  thailand: 'Thailand',
  india: 'India',
};

/**
 * The currency a new budget uses when that country is chosen. Only codes the
 * cost planner already stores. Romania, Georgia, Uzbekistan, Armenia and
 * Kyrgyzstan are absent: the budget keeps the destination currency.
 */
const COUNTRY_CURRENCY: Record<string, string> = {
  'United States': 'USD',
  Canada: 'CAD',
  'United Kingdom': 'GBP',
  Ireland: 'EUR',
  Germany: 'EUR',
  France: 'EUR',
  Netherlands: 'EUR',
  Switzerland: 'CHF',
  Sweden: 'SEK',
  Denmark: 'DKK',
  Norway: 'NOK',
  Finland: 'EUR',
  Italy: 'EUR',
  Spain: 'EUR',
  Belgium: 'EUR',
  Austria: 'EUR',
  Poland: 'PLN',
  Czechia: 'CZK',
  Hungary: 'HUF',
  Portugal: 'EUR',
  Bulgaria: 'EUR',
  Australia: 'AUD',
  'New Zealand': 'NZD',
  Russia: 'RUB',
  Kazakhstan: 'KZT',
  'United Arab Emirates': 'AED',
  'Saudi Arabia': 'SAR',
  Qatar: 'QAR',
  Oman: 'OMR',
  Bahrain: 'BHD',
  Kuwait: 'KWD',
  India: 'INR',
  Japan: 'JPY',
  Singapore: 'SGD',
  'South Korea': 'KRW',
  Malaysia: 'MYR',
  'Hong Kong': 'HKD',
  Taiwan: 'TWD',
  China: 'CNY',
  Philippines: 'PHP',
  Thailand: 'THB',
};

/** ISO code for a country the budget can store, or null to keep the destination currency. */
export function currencyForCountry(country: string): string | null {
  return COUNTRY_CURRENCY[country] ?? null;
}
