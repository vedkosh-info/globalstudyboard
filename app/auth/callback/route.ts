import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/supabase/profile';
import { safeNextPath } from '@/lib/security/safe-next';
import { createRateLimiter, clientIp, UUID_RE } from '@/lib/security/request';
import { CONSENT_COOKIE, CONSENT_VERSION, isConsentVersion } from '@/lib/consent';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { AUDIENCE_CHOICES, type AudienceChoice } from '@/lib/audience';

/**
 * Auth callback — every redirect-based sign-in lands here with a `?code=`:
 * Google (OAuth PKCE) and the sign-in LINK in the e-mail (until the owner
 * switches the template to a one-time code). The code is exchanged for a session
 * in this route handler; the resulting auth cookies ride the redirect response
 * (allowed in route handlers — this never touches the static content routes).
 *
 * Open-redirect-safe: `next` goes through lib/security/safe-next (origin
 * compare, never a prefix check). Abuse-safe: the code must look like a GoTrue
 * auth code (a UUID) and the exchange is rate limited per visitor IP, because
 * every exchange leaves this function's shared egress IP and a flood would trip
 * Supabase's per-IP token limit for everyone.
 *
 * Every failure ends at /login with no on-screen detail (an OAuth callback must
 * not leak why it failed), which makes a broken provider invisible — so each
 * failure mode logs a distinct fixed reason. The authorization code is a
 * credential and is never logged; neither is any error message.
 */

export const runtime = 'nodejs';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };
// Per-IP brake on code exchanges. A campus or office NAT presents one address
// for hundreds of students, so the window is sized for a busy hall (one
// exchange per completed sign-in) rather than a single laptop, and a trip
// gets its own /login notice instead of "the link didn't work".
const isRateLimited = createRateLimiter(60, 60_000);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const safeNext = safeNextPath(url.searchParams.get('next'), url.origin);
  const toLogin = (error: string) =>
    NextResponse.redirect(new URL(`/login?error=${error}`, url.origin), { headers: NO_STORE });

  if (!code || !UUID_RE.test(code)) {
    // A cancelled consent screen, a stale bookmark, a provider-side error
    // redirect or a probe. Expected in small numbers; a spike means the OAuth
    // client itself is misconfigured.
    console.warn('[auth-callback] failed: missing-or-malformed-code');
    return toLogin('link');
  }
  if (isRateLimited(clientIp(request))) {
    console.warn('[auth-callback] failed: rate-limited');
    return toLogin('busy');
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    console.error('[auth-callback] failed: supabase-unconfigured');
    return toLogin('unavailable');
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    // Includes the cross-device link case: the PKCE verifier cookie lives in
    // the browser that requested the e-mail, so a link opened elsewhere cannot
    // be exchanged. /login explains the same-device rule.
    console.warn('[auth-callback] failed: code-exchange-rejected');
    return toLogin('link');
  }

  // First sign-in via a redirect door never passes through the form's
  // ensureProfile(), so create the row here — seeded with the destination and
  // audience this device already chose, and with the consent version the form
  // left in a short-lived cookie before redirecting (absent = no consent
  // recorded; the account page will ask).
  const jar = await cookies();
  let consentVersion: string | null = null;
  try {
    // PRESENCE of the marker + the server's own constant: the cookie is
    // JS-settable, so its value must never be trusted as the version (a client
    // could otherwise pre-stamp a future version and silence re-consent).
    const consentCookie = jar.get(CONSENT_COOKIE)?.value ?? '';
    consentVersion = isConsentVersion(consentCookie) ? CONSENT_VERSION : null;
    const regionCookie = jar.get('gsb_region')?.value ?? '';
    const audienceCookie = jar.get('gsb_audience')?.value ?? '';
    const region: RegionSlug | null = getRegionBySlug(regionCookie) ? (regionCookie as RegionSlug) : null;
    const audience = (AUDIENCE_CHOICES as readonly string[]).includes(audienceCookie)
      ? (audienceCookie as AudienceChoice)
      : null;
    await ensureProfile(supabase, data.user, { preferredRegion: region, preferredAudience: audience, consentVersion });
  } catch {
    // Not fatal: /account retries profile creation on load. Sign-in succeeded.
    console.warn('[auth-callback] profile-bootstrap-deferred');
  }

  const response = NextResponse.redirect(new URL(safeNext, url.origin), { headers: NO_STORE });
  // The consent signal is single-use.
  response.cookies.set(CONSENT_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
