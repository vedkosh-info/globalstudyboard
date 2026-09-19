/**
 * Request helpers shared by the account/admin API routes.
 *
 * `clientIp()` — `x-real-ip` first (Vercel sets it to the connecting client),
 * then the first hop of `x-forwarded-for`, else 'unknown'. Mirrors
 * app/api/tester-invite/route.ts so every route agrees on who "the caller" is.
 *
 * `createRateLimiter()` — per-IP sliding window in one in-memory Map per
 * serverless instance (the same shape as the existing routes). It is NOT shared
 * across instances, so it is a brake on casual abuse only; the real limits on
 * sign-in are Supabase Auth's own (one OTP per address per 60 s, per-IP caps).
 * Instance recycling only ever RELAXES the limit, never tightens it.
 */

import type { NextRequest } from 'next/server';

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

interface Entry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(limit: number, windowMs: number) {
  const bucket = new Map<string, Entry>();
  let requests = 0;
  const prune = () => {
    if (++requests % 100 !== 0) return;
    const now = Date.now();
    for (const [key, entry] of bucket) if (now > entry.resetAt) bucket.delete(key);
  };
  /** True when `key` has exceeded `limit` calls in the current window. */
  return function isRateLimited(key: string): boolean {
    prune();
    const now = Date.now();
    const entry = bucket.get(key);
    if (!entry || now > entry.resetAt) {
      bucket.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  };
}

/** Headers for any response that reflects or mutates a session. */
export const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' } as const;

/** Strict UUID v4-ish shape; anything else is rejected unread. */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
