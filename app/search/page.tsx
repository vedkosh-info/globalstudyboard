import type { Metadata } from 'next';
import { Suspense } from 'react';

import SearchClient from '@/components/SearchClient';
import { CONTENT_INDEX } from '@/lib/cmi';

export const metadata: Metadata = {
  title: 'Search',
  description:
    'Search GlobalStudyBoard — universities, entrance exams, scholarships and admission guides for your chosen study destination.',
  alternates: { canonical: 'https://www.globalstudyboard.com/search' },
  // A query-driven results page should not be indexed as content.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl">
          <div className="h-12 w-40 animate-pulse rounded-lg bg-stone-200" />
        </div>
      }
    >
      <SearchClient index={CONTENT_INDEX} />
    </Suspense>
  );
}
