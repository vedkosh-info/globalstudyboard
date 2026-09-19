/**
 * Resolve a caller-supplied "return to" path to a guaranteed same-origin path.
 *
 * A prefix check like `startsWith('/') && !startsWith('//')` is NOT enough: the
 * WHATWG URL parser strips ASCII tab/newline and treats a backslash as a slash
 * for special schemes, so `/\evil.com` and `/%09/evil.com` both resolve to
 * `https://evil.com/`. Resolving against the origin and comparing ORIGINS is the
 * only check that models the parser. Anything off-site — or pointing back into
 * the auth machinery — falls back to /account.
 *
 * The origin check alone is still not enough, because the RETURNED value is a
 * path that every consumer resolves again: a same-origin absolute URL such as
 * `https://www.globalstudyboard.com//evil.com` passes the origin comparison
 * with a pathname of `//evil.com`, and `location.href = '//evil.com'` is a
 * scheme-relative jump off-site (found by an independent review, 18 Sep 2026).
 * So a pathname that begins with two or more slashes is refused outright — a
 * path that starts with a single `/` and no second slash can only ever resolve
 * on this origin.
 *
 * Isomorphic (no Supabase import): used by the /auth/callback route, the /login
 * page and the sign-in form's own post-sign-in navigation.
 */
export function safeNextPath(nextPath: string | null | undefined, origin: string, fallback = '/account'): string {
  if (!nextPath) return fallback;
  try {
    const resolved = new URL(nextPath, origin);
    if (resolved.origin !== origin) return fallback;
    // A pathname that starts with two or more slashes is never a page of ours —
    // it is the scheme-relative payload — so it gets the fallback, not a 404.
    if (/^\/\/+/.test(resolved.pathname)) return fallback;
    const pathname = resolved.pathname;
    if (pathname.startsWith('/auth/') || pathname === '/login' || pathname.startsWith('/api/')) {
      return fallback;
    }
    return pathname + resolved.search + resolved.hash;
  } catch {
    return fallback;
  }
}
