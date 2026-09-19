/**
 * Supabase / accounts configuration — isomorphic (safe in client and server code).
 *
 * Accounts are DORMANT until the two public env vars exist: with them unset,
 * `isAuthConfigured()` is false, `getSupabaseBrowserClient()` returns null, every
 * account route answers 503 and the chrome renders no sign-in control at all. So
 * the code can ship ahead of (or independently of) the Supabase project — the
 * same accelerate-later pattern VedKosh uses.
 *
 * NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
 * MUST be read by static member access (`process.env.NEXT_PUBLIC_X`), never
 * through a dynamic key. Changing one in Vercel does nothing until a redeploy.
 *
 * Key naming: the project was created on Supabase's new key scheme
 * (`sb_publishable_…` / `sb_secret_…`). The legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * / `SUPABASE_SERVICE_ROLE_KEY` names are accepted as fallbacks so a VedKosh-style
 * env block also works.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when a Supabase project is wired up (accounts active). */
export function isAuthConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}

/**
 * True when Google Sign-In is actually usable.
 *
 * The provider must ALSO be enabled inside Supabase (Auth → Sign In / Providers →
 * Google, with a Google Cloud OAuth client). If it is not, clicking the button
 * redirects to Supabase and dumps a raw JSON error at the visitor:
 *   {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
 * That happened to real VedKosh visitors in July 2026. Supabase exposes no
 * client-side way to ask "is this provider on?", so the button is gated behind
 * this explicit flag. Email sign-in is unaffected either way.
 */
export function isGoogleAuthEnabled(): boolean {
  return isAuthConfigured() && process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';
}

/**
 * True once the sign-in e-mail carries a one-time CODE ({{ .Token }}).
 *
 * A fresh Supabase project sends a magic LINK only: its default "Magic link or
 * OTP" template has no `{{ .Token }}`, and templates cannot be edited until custom
 * SMTP is configured (Auth → Emails). Until the owner has done both (SMTP + a
 * template that prints the code), the login form leads with "open the link in the
 * e-mail" and keeps the code field as the secondary path. Flip this to 'true' and
 * redeploy once the e-mail really contains a code — never before, or the copy lies.
 */
export function emailDeliversCode(): boolean {
  return process.env.NEXT_PUBLIC_EMAIL_OTP_CODE === 'true';
}

/**
 * This project's ref (the first label of the API hostname) — the session cookie
 * `@supabase/ssr` writes is named `sb-<ref>-auth-token` (chunked `.0`, `.1`, …
 * above ~3 KB). Keyed to OUR ref on purpose: on `localhost` cookies are shared
 * across ports, so a generic `sb-*-auth-token` pattern lit up the "Account"
 * control from another project's dev session.
 */
export const SUPABASE_PROJECT_REF = (() => {
  try {
    return SUPABASE_URL ? new URL(SUPABASE_URL).hostname.split('.')[0] ?? '' : '';
  } catch {
    return '';
  }
})();

/**
 * The chrome uses PRESENCE of this cookie — never its contents — to decide
 * whether to render "Sign in" or "Account". That keeps every Supabase byte out
 * of the global client bundle (the layout chunk must stay small; see the
 * bundle-guard note in components/Breadcrumbs.tsx). Presence is a hint for the
 * UI only; every API route re-verifies the session with `getUser()`.
 */
export const AUTH_COOKIE_RE = SUPABASE_PROJECT_REF
  ? new RegExp(`(?:^|;\\s*)sb-${SUPABASE_PROJECT_REF}-auth-token(?:\\.\\d+)?=`)
  : /$^/;

/** Client-side only: is a session cookie for THIS project present on this device? */
export function hasAuthCookie(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    return AUTH_COOKIE_RE.test(document.cookie);
  } catch {
    return false;
  }
}
