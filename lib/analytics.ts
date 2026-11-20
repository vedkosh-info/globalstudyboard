/** Small, catalogue-free analytics policy shared by the browser and QA. */
export const ANALYTICS_ORIGIN = 'https://www.globalstudyboard.com';
export const ANALYTICS_STORAGE_KEY = 'gsb_analytics_consent';
export const ANALYTICS_OPEN_EVENT = 'gsb:analytics-preferences';
export const ANALYTICS_CHANGE_EVENT = 'gsb:analytics-choice';
export const ANALYTICS_CONSENT_VERSION = '2026-11-19';
export const ANALYTICS_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
export const ANALYTICS_COOKIE_PREFIX = 'gsb';

export type AnalyticsChoice = 'granted' | 'denied';
export interface AnalyticsConsent {
  version: typeof ANALYTICS_CONSENT_VERSION;
  choice: AnalyticsChoice;
  expiresAt: number;
}

export const ANALYTICS_UI = {
  title: 'Your analytics choice',
  description: 'If you are 18 or over, you can allow Google Analytics cookies to help us understand which public pages are useful. Browsing works either way.',
  privacy: 'We do not send your saved plans, form answers or questions to Google Analytics.',
  allow: 'Allow analytics (18+)',
  decline: 'Decline analytics',
  turnOff: 'Turn off analytics',
  preferences: 'Analytics preferences',
  details: 'How we use cookies',
  close: 'Close preferences',
  on: 'Google Analytics is allowed on this browser.',
  off: 'Google Analytics is off on this browser.',
  signal: 'Your browser requests no tracking. Google Analytics stays off while that setting is on.',
  memoryOnly: 'Your browser could not save this choice. It applies to this tab until you reload.',
  savedOn: 'Analytics allowed. Change your choice anytime using Analytics preferences in the footer.',
  savedOff: 'Google Analytics is off. Change your choice anytime using Analytics preferences in the footer.',
} as const;

export function analyticsMeasurementId(value: string | undefined): string | null {
  return value && /^G-[A-Z0-9]{6,16}$/.test(value) ? value : null;
}

export const GA_MEASUREMENT_ID = analyticsMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

export function parseAnalyticsConsent(value: string | null, now = Date.now()): AnalyticsConsent | null {
  if (!value) return null;
  try {
    const consent: unknown = JSON.parse(value);
    if (!consent || typeof consent !== 'object') return null;
    const record = consent as Partial<AnalyticsConsent>;
    if (record.version !== ANALYTICS_CONSENT_VERSION || !['granted', 'denied'].includes(record.choice ?? '') ||
      typeof record.expiresAt !== 'number' || !Number.isFinite(record.expiresAt) ||
      record.expiresAt <= now || record.expiresAt > now + ANALYTICS_MAX_AGE_SECONDS * 1000) return null;
    return record as AnalyticsConsent;
  } catch {
    return null;
  }
}

export function newAnalyticsConsent(choice: AnalyticsChoice, now = Date.now()): AnalyticsConsent {
  return { version: ANALYTICS_CONSENT_VERSION, choice, expiresAt: now + ANALYTICS_MAX_AGE_SECONDS * 1000 };
}

// A route shape alone is insufficient: an arbitrary /guides/private-name 404
// must not become an analytics URL. analyticsPage also requires the rendered
// self-referential canonical to match the current path. A stale Next head fails
// closed until its metadata arrives. No account, form, question or tool route.
const PUBLIC_PAGES = new Set([
  '/', '/about', '/contact', '/privacy', '/cookies', '/terms', '/disclaimer',
  '/accessibility', '/editorial-policy', '/sources', '/topics', '/regions',
  '/guides', '/colleges', '/exams', '/scholarships', '/tools',
]);
const PUBLIC_DETAIL = /^\/(?:guides|colleges|exams|topics)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PUBLIC_REGION = /^\/regions\/(?:india|usa|uk-ireland|canada|europe|australia-nz|middle-east|russia|east-southeast-asia)(?:\/(?:guides|universities|exams|scholarships)|\/track\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/;

export function isAnalyticsPublicPath(pathname: string): boolean {
  return pathname.length <= 200 && (PUBLIC_PAGES.has(pathname) || PUBLIC_DETAIL.test(pathname) || PUBLIC_REGION.test(pathname));
}

export interface AnalyticsPage {
  location: string;
  title: string;
}

export function analyticsPage(href: string, canonical: string | null): AnalyticsPage | null {
  if (!canonical) return null;
  try {
    const url = new URL(href);
    const published = new URL(canonical);
    if (url.origin !== ANALYTICS_ORIGIN || published.origin !== ANALYTICS_ORIGIN ||
      published.search || published.hash || published.username || published.password ||
      url.username || url.password || url.pathname.length > 200 || published.pathname !== url.pathname ||
      !isAnalyticsPublicPath(url.pathname)) return null;
    // Never read document.title: private UI and stale SPA metadata are not data.
    const section = url.pathname.split('/')[1];
    const label = section ? section[0].toUpperCase() + section.slice(1) : 'Home';
    return { location: `${ANALYTICS_ORIGIN}${url.pathname}`, title: `${label} | GlobalStudyBoard` };
  } catch {
    return null;
  }
}

/** Origin only, including for internal referrals: no paths, queries or tokens. */
export function analyticsReferrer(value: string): string {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.origin + '/' : '';
  } catch {
    return '';
  }
}

export function analyticsPrivacySignal(browser: { globalPrivacyControl?: boolean; doNotTrack?: string | null }): boolean {
  return browser.globalPrivacyControl === true || browser.doNotTrack === '1' || browser.doNotTrack === 'yes';
}
