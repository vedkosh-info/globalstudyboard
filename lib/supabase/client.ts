'use client';

/**
 * Browser-side Supabase client (singleton).
 *
 * `createBrowserClient` from @supabase/ssr keeps the session in COOKIES (not
 * localStorage), so route handlers can read it server-side. Token refresh happens
 * client-side through `document.cookie` — deliberately NO middleware involvement:
 * every content page stays a static, CDN-cacheable file (there is no middleware.ts
 * on this site at all, see next.config.js).
 *
 * BUNDLE GUARD: this module (and everything that imports @supabase/*) must only be
 * reached through `next/dynamic` or `import()` from the globally-mounted chrome,
 * and statically only from the /login, /account and /admin client components.
 * The layout chunk must contain zero Supabase code.
 *
 * Returns null when accounts are not configured — callers must handle that state
 * (control hidden / "accounts are not available yet" notice).
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isAuthConfigured } from './config';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isAuthConfigured()) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      // @supabase/ssr's defaults are path=/ SameSite=Lax maxAge=400d and NO
      // `secure`. Production is HTTPS-only (HSTS preload), so mark the session
      // cookie Secure there; `next dev` on http://localhost could not set it.
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
    });
  }
  return browserClient;
}
