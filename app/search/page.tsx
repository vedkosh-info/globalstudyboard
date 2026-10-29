import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Suspense } from 'react';

import SearchClient from '@/components/SearchClient';
import Link from 'next/link';
import { SEARCH_UI } from '@/lib/search-ui';

// A query-driven results page should not be indexed as content.
export const metadata: Metadata = pageMetadata({
  title: 'Search',
  description:
    'Search GlobalStudyBoard — universities, entrance exams, scholarships and admission guides for your chosen study destination.',
  path: '/search',
  robots: { index: false, follow: true },
});

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* The H1 lives outside the Suspense boundary so the static HTML (and a
          no-JS / assistive-tech snapshot) has a page heading; SearchClient reads
          useSearchParams and therefore only renders after hydration. */}
      <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-editorial text-ink mb-2">
        Search
      </h1>
      <Suspense fallback={
        <div className="mt-6 min-h-[calc(100svh-16rem)] space-y-4">
          <div role="status" className="rounded-2xl border border-stone-200 bg-white p-5 text-stone-600">
            {SEARCH_UI.loading}
          </div>
          <noscript><p className="text-stone-600">{SEARCH_UI.noScript}</p></noscript>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/regions" className="underline underline-offset-2">{SEARCH_UI.browseDestinations}</Link>
            <Link href="/topics" className="underline underline-offset-2">{SEARCH_UI.browseTopics}</Link>
          </div>
        </div>
      }>
        <SearchClient />
      </Suspense>
    </div>
  );
}
