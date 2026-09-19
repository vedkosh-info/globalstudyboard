/**
 * Consent record plumbing — isomorphic, no Supabase import.
 *
 * The database only stamps consent when a profile row is created (or updated)
 * with a `consent_version`, and ONLY the two consent-gated sign-in doors send
 * one. Because Google sign-in is a full-page redirect that lands in a server
 * route, the form leaves a short-lived first-party cookie behind it; the
 * callback reads and clears it. The e-mail-code door passes the version
 * directly.
 */

/**
 * ISO date of the LATEST revision of the two documents the sign-in form asks
 * the visitor to accept (Terms of Use, Privacy Policy) — bump it whenever
 * either changes substantively, and /account will ask existing users to
 * re-accept. Never a future date: the database refuses one (migration 0002).
 */
export const CONSENT_VERSION = '2026-09-19';

export const CONSENT_COOKIE = 'gsb_consent';
const CONSENT_COOKIE_MAX_AGE = 15 * 60; // the redirect round-trip is seconds

/** Client-side: remember that the consent box was ticked, for the redirect doors. */
export function markConsentGiven(): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${CONSENT_VERSION}; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function isConsentVersion(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/** True when the stored consent is missing or predates the current documents. */
export function consentNeedsRefresh(stored: string | null | undefined): boolean {
  return !isConsentVersion(stored) || stored < CONSENT_VERSION;
}

/** Client-side: drop the marker once a consent-gated sign-in has completed in-page. */
export function clearConsentMarker(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${CONSENT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
