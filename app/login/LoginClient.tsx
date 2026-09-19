'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { safeNextPath } from '@/lib/security/safe-next';

/**
 * Page variant of the sign-in form.
 *
 * `?next=` — a same-origin path to return to afterwards, resolved with the same
 * origin-compared `safeNextPath` the callback route uses (a prefix check cannot
 * model the URL parser: `/\evil.com` and `/%09/evil.com` both leave the site).
 * `?error=link` — set by /auth/callback when an e-mailed link could not be
 * exchanged (expired, already used, or opened on a different device/browser
 * than the one that requested it). The notice explains the same-device rule.
 */
function sanitizeNext(raw: string | null): string | undefined {
  if (!raw || typeof window === 'undefined') return undefined;
  const safe = safeNextPath(raw.slice(0, 500), window.location.origin, '');
  return safe || undefined;
}

const NOTICES: Record<string, string> = {
  link: 'That sign-in link didn’t work — it may have expired, been used already, or been opened on a different device than the one that asked for it. Request a new one below and open it here.',
  unavailable: 'Sign-in is temporarily unavailable. Please try again in a few minutes.',
  busy: 'A lot of sign-ins are arriving from your network right now. Wait a minute, then open the link again — it is still valid.',
};

export default function LoginClient() {
  const params = useSearchParams();
  const router = useRouter();
  const { hasSession, ready } = useAuth();
  const next = sanitizeNext(params.get('next'));
  const notice = NOTICES[params.get('error') ?? ''];

  // Already signed in on this device → straight to the account (or `next`).
  useEffect(() => {
    if (ready && hasSession) router.replace(next ?? '/account');
  }, [ready, hasSession, next, router]);

  return (
    <div className="rounded-2xl border border-stone-200 bg-cream-50 p-5 shadow-sm sm:p-6">
      <LoginForm variant="page" next={next} notice={notice} />
      <p className="mt-6 text-xs text-stone-600 leading-relaxed">
        An account is optional — every guide on this site is free to read without one.{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-forest-700">
          How we handle your data
        </Link>
        .
      </p>
    </div>
  );
}
