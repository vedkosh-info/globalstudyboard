/**
 * Same-origin gate for state-changing account/admin routes — CSRF defence in depth.
 *
 * The Supabase session cookies are `SameSite=Lax`, which already blocks the
 * classic cross-site form POST. This is a SECOND, independent check so a single
 * browser quirk or a future cookie-attribute regression cannot silently re-open
 * CSRF on destructive endpoints (delete account, admin ban/delete).
 *
 * Accepts the request only when it demonstrably came from our own site:
 *   1. `Sec-Fetch-Site: same-origin` (or `none`, a user-typed/bookmarked
 *      navigation) — sent by every modern browser, not forgeable by page JS.
 *   2. Failing that (older clients), the `Origin` header must equal the request's
 *      own host or one of the site's production origins.
 *
 * Deliberately conservative: with neither signal present we FAIL CLOSED. These
 * endpoints are only ever called by our own signed-in UI via fetch(), which
 * always sends both headers, so a legitimate call never lacks them.
 */

import type { NextRequest } from 'next/server';

/** Production origins accepted in addition to the request's own host. */
const ALLOWED_ORIGINS = new Set<string>(['https://www.globalstudyboard.com', 'https://globalstudyboard.com']);

export function isSameOriginRequest(request: NextRequest): boolean {
  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'same-origin' || secFetchSite === 'none') return true;
  // 'cross-site' / 'same-site' (a sibling subdomain) are explicitly rejected.
  if (secFetchSite) return false;

  const origin = request.headers.get('origin');
  if (!origin) return false; // fail closed — our fetch() always sends one
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}
