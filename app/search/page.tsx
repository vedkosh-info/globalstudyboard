import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Suspense } from 'react';

import SearchClient from '@/components/SearchClient';
import { CONTENT_INDEX } from '@/lib/cmi';

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
      <Suspense fallback={<div className="h-6 w-72 animate-pulse rounded-lg bg-stone-200" />}>
        <SearchClient index={CONTENT_INDEX} />
      </Suspense>
    </div>
  );
}
