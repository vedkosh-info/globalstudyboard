import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import { COLLEGES } from '@/lib/colleges';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'Study Abroad by Region — USA, UK, Europe, Canada, Australia & More',
  description:
    'Compare university systems across 8 regions. Top universities, key entrance exams, scholarships, visa requirements and application platforms for every study destination.',
  keywords: [
    'study abroad by region',
    'university guides worldwide',
    'study in USA guide',
    'study in UK guide',
    'study in Europe English',
    'study in Canada universities',
    'study in Australia guide',
    'international student guide',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/regions' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/regions',
    title: 'Study Abroad by Region — USA, UK, Europe, Canada, Australia & More',
    description: 'Compare university systems, entrance exams, scholarships and visa options across 8 global study destinations.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Abroad by Region — GlobalStudyBoard',
    description: 'Compare universities, exams and scholarships across USA, UK, Europe, Canada, Australia and more.',
    images: ['/opengraph-image'],
  },
};

export default function RegionsIndexPage() {
  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Browse by region
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Every region, equal depth.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          The university systems of {REGIONS_ALPHABETICAL.length} regions, side by side. Pick a destination to see top institutions, the application platform, key entrance exams, and what visa and post-study work options look like.
        </p>
        <p className="mt-4">
          <Link
            href="/colleges"
            className="inline-flex items-center gap-1.5 text-forest-700 font-semibold no-underline hover:text-forest-800 transition-colors"
          >
            Browse all {COLLEGES.length} university profiles
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REGIONS_ALPHABETICAL.map((r) => {
          const universityCount = COLLEGES.filter((c) => c.region === r.slug).length;
          return (
            <Link
              key={r.slug}
              href={`/regions/${r.slug}`}
              className="bg-white border border-stone-200 rounded-2xl p-6 no-underline hover:border-forest-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-3xl leading-none">{r.flag}</span>
                  <h2 className="font-display text-2xl font-bold text-ink group-hover:text-forest-700 transition-colors leading-tight m-0">
                    {r.displayName}
                  </h2>
                </div>
                <ArrowUpRight className="w-5 h-5 text-stone-400 group-hover:text-forest-700 transition-colors shrink-0 mt-1" />
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">
                {r.educationSystemSummary}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-stone-500">
                <span><strong className="text-stone-700 font-semibold">{universityCount}</strong> universities</span>
                <span><strong className="text-stone-700 font-semibold">{r.keyExamSlugs.length}</strong> key exams</span>
                <span>Apply via <strong className="text-stone-700 font-semibold">{r.primaryApplicationPlatform.split(' /')[0].split('(')[0].trim()}</strong></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
