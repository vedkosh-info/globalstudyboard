import type { Metadata } from 'next';
import { Suspense } from 'react';
import { pageMetadata } from '@/lib/seo';
import AccountClient from '@/app/account/AccountClient';

/**
 * Your account. A static shell (no server cookie reads — content-policy §16.2):
 * AccountClient resolves the session in the browser and renders a sign-in card
 * when there is none. Noindex, but crawlable so the noindex is honoured; never
 * listed in the sitemap.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Your account',
  description: 'Your GlobalStudyBoard account — saved pages, remembered study destination, data download and account deletion.',
  path: '/account',
  robots: { index: false, follow: false },
});

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-editorial text-ink mb-5">Your account</h1>
      {/* AccountClient reads ?tab= with useSearchParams, which on a static page
          must sit under a Suspense boundary (the fallback is the same skeleton
          the client shows while it resolves the session). */}
      <Suspense
        fallback={
          <div className="space-y-4" role="status" aria-busy="true">
            <span className="sr-only">Loading your account…</span>
            <div className="h-28 animate-pulse rounded-2xl bg-stone-200" aria-hidden="true" />
            <div className="h-40 animate-pulse rounded-2xl bg-stone-200" aria-hidden="true" />
          </div>
        }
      >
        <AccountClient />
      </Suspense>
    </div>
  );
}
