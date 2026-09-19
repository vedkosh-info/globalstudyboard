/**
 * Server-side Supabase clients — ROUTE HANDLERS ONLY.
 *
 * This file imports `next/headers`, so importing it from a client component is a
 * build error (good), and calling it from a page or layout would force that route
 * to render dynamically and break the static build (content-policy §16.2: never
 * read cookies in a server component). Every page on this site is a static shell;
 * only `app/api/**` and `app/auth/callback` may use these helpers.
 *
 * - getSupabaseServerClient(): cookie-bound client for the current request. Reads
 *   the session from request cookies; if it has to refresh an expired access
 *   token the new pair is written back through `cookies().set` (allowed in route
 *   handlers). Responses that touch auth cookies are always sent `no-store`.
 * - getSupabaseServiceClient(): privileged client for the GoTrue admin API and
 *   the tables users cannot write (account deletion, admin console). BYPASSES
 *   RLS — server only, never expose, no session persistence.
 *
 * Both return null when the corresponding env vars are absent so every route can
 * degrade to a clean 503 instead of throwing.
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isAuthConfigured } from './config';

export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!isAuthConfigured()) return null;
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: { secure: process.env.NODE_ENV === 'production' },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Only reachable if someone calls this during a Server Component render,
          // where cookie mutation is forbidden. Not fatal: the browser client
          // refreshes on its own. (Nothing on this site does that — see docblock.)
        }
      },
    },
  });
}

/** Privileged client. `SUPABASE_SECRET_KEY` (new scheme) or the legacy service-role key. */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !secret) return null;
  return createClient(SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * The authenticated user for the current request, or null.
 * Uses `getUser()` — verified against Supabase Auth on every call. NEVER use
 * `getSession()` for an authorization decision: it only decodes the cookie.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
