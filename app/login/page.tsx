import type { Metadata } from 'next';
import { Suspense } from 'react';
import { pageMetadata } from '@/lib/seo';
import LoginClient from '@/app/login/LoginClient';

/**
 * Sign in / create account. A static shell: the form itself is a client
 * component that talks to Supabase from the browser, so this page prerenders
 * like every other route (no cookie reads on the server). Not indexed — it is
 * a utility page, not content — but left crawlable so the noindex is honoured.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Sign in',
  description:
    'Sign in to GlobalStudyBoard or create a free account with your e-mail address — no password needed.',
  path: '/login',
  robots: { index: false, follow: false },
});

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      {/* The H1 lives outside the Suspense boundary so the static HTML (and a
          no-JS / assistive-tech snapshot) has a page heading; the form inside
          reads useSearchParams and only renders after hydration. */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-editorial text-ink mb-5">Sign in</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-stone-200" />}>
        <LoginClient />
      </Suspense>
    </div>
  );
}
