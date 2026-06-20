import type { Metadata } from 'next';
import Link from 'next/link';

import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { REGIONS } from '@/lib/regions';
import HomeHero from '@/components/HomeHero';
import HomeRegionGrid from '@/components/HomeRegionGrid';
import HomeSpotlight, { type ExamLite } from '@/components/HomeSpotlight';

export const metadata: Metadata = {
  title: { absolute: 'GlobalStudyBoard — Universities, Exams & Scholarships Worldwide' },
  description:
    'Free university admission guide for every destination. Compare SAT, ACT, GRE, IELTS, A-Levels and IB. Explore top universities in the USA, UK, Europe, Canada, Australia and India.',
  keywords: [
    'study abroad guide',
    'university admission 2025',
    'SAT ACT score guide',
    'UCAS common app comparison',
    'study in USA international students',
    'study in UK undergraduate',
    'study in Europe English',
    'GRE GMAT prep tips',
    'college scholarships international',
    'student visa requirements',
  ],
  alternates: {
    canonical: 'https://www.globalstudyboard.com',
    types: { 'application/rss+xml': 'https://www.globalstudyboard.com/feed.xml' },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com',
    title: 'GlobalStudyBoard — Universities, Exams & Scholarships Worldwide',
    description: 'Free university admission guide for every destination. Compare exams, explore top universities, and get personalised guidance from GSB AI.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalStudyBoard — Universities, Exams & Scholarships Worldwide',
    description: 'Free university admission guide — USA, UK, Europe, Canada, Australia, India. Compare SAT, ACT, GRE, IELTS, A-Levels.',
    images: ['/opengraph-image'],
  },
};

/**
 * Compact per-exam summaries for every test referenced by a region's
 * `keyExamSlugs`, computed once at build time. The client home spotlight uses
 * this to render region-tuned tests without shipping the full exam catalogue to
 * the browser.
 */
const HOME_EXAMS_BY_SLUG: Record<string, ExamLite> = (() => {
  const slugs = Array.from(new Set(REGIONS.flatMap((r) => r.keyExamSlugs)));
  const map: Record<string, ExamLite> = {};
  for (const slug of slugs) {
    const e = ENTRANCE_EXAMS.find((x) => x.slug === slug);
    if (e) {
      map[slug] = {
        slug: e.slug,
        shortName: e.shortName,
        descriptionEn: e.descriptionEn,
        domain: e.domain,
        frequency: e.frequency,
      };
    }
  }
  return map;
})();

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-20">

      <HomeHero />

      <HomeRegionGrid />

      {/* Region-tuned universities + key tests for the chosen destination */}
      <HomeSpotlight examsBySlug={HOME_EXAMS_BY_SLUG} />

      {/* Why GSB — editorial pitch */}
      <section className="bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-12 py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-cream-100/70 mb-4">
            Why GlobalStudyBoard
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial leading-tight mb-5">
            One reference, every region.<br />No country-of-origin bias.
          </h2>
          <p className="text-cream-50/85 text-base md:text-lg leading-relaxed mb-6">
            Most college guides start from where their authors live. We start from where <em>you</em> want to go. Every region — the United States, the United Kingdom, continental Europe, Canada, Australia, the Middle East, Russia, and India — gets the same depth of coverage, the same plain-language tone, and the same insistence on linking to the official source.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/gsb-ai"
              className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
            >
              Ask GSB AI
            </Link>
            <Link
              href="/regions"
              className="inline-flex items-center justify-center bg-transparent hover:bg-cream-50/10 text-cream-50 font-semibold px-6 py-3 rounded-full no-underline transition-colors border border-cream-50/30"
            >
              See all regions
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
