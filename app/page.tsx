import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { COLLEGES } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { REGIONS } from '@/lib/regions';
import HomeHero from '@/components/HomeHero';
import HomeRegionGrid from '@/components/HomeRegionGrid';

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

// One featured university per region, in region rail order.
const FEATURED_UNIVERSITIES = REGIONS.map((r) => {
  const matches = COLLEGES.filter((c) => c.region === r.slug);
  // Prefer the highest-ranked university we have for the region
  const ranked = [...matches].sort((a, b) => (a.ranking?.qs ?? 9999) - (b.ranking?.qs ?? 9999));
  return ranked[0];
}).filter(Boolean);

// US/EU exams first, then global English tests, then India
const FEATURED_EXAM_SLUGS = ['sat', 'gre', 'a-levels', 'testas', 'ielts', 'toefl', 'jee-advanced', 'cat'];
const FEATURED_EXAMS = FEATURED_EXAM_SLUGS
  .map((slug) => ENTRANCE_EXAMS.find((e) => e.slug === slug))
  .filter((e): e is NonNullable<typeof e> => Boolean(e));

const APPLICATION_PLATFORMS = [
  {
    name: 'Common App',
    region: 'United States',
    summary: 'One application to 1,000+ U.S. colleges. Opens August 1 each year.',
    url: 'https://www.commonapp.org',
  },
  {
    name: 'UCAS',
    region: 'United Kingdom',
    summary: 'Up to five UK courses on one application. October deadline for Oxbridge & medicine.',
    url: 'https://www.ucas.com',
  },
  {
    name: 'Uni-Assist',
    region: 'Germany',
    summary: 'Document evaluation for international applicants to most German universities.',
    url: 'https://www.uni-assist.de',
  },
  {
    name: 'OUAC',
    region: 'Canada (Ontario)',
    summary: 'Centralised application for Ontario undergraduate programs.',
    url: 'https://www.ouac.on.ca',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-20">

      <HomeHero />

      <HomeRegionGrid />

      {/* Featured universities — one per region */}
      <section>
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
              Universities at a glance
            </h2>
            <p className="text-stone-600 text-sm">
              One institution from each region we cover — open any to see programs, application platform, and admission exams.
            </p>
          </div>
          <Link
            href="/regions"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-forest-700 hover:text-forest-800 font-medium no-underline shrink-0"
          >
            All regions <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_UNIVERSITIES.map((college) => {
            const region = REGIONS.find((r) => r.slug === college.region);
            return (
              <Link
                key={college.id}
                href={`/regions/${college.region}`}
                className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 hover:shadow-sm transition-all group flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span aria-hidden="true" className="text-lg">{region?.flag}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    {region?.displayName}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-ink group-hover:text-forest-700 transition-colors leading-snug mb-1">
                  {college.nameEn}
                </h3>
                <p className="text-stone-500 text-xs mb-3">
                  {college.city}{college.state ? `, ${college.state}` : ''} · Est. {college.established}
                </p>
                {college.ranking?.qs && (
                  <p className="text-xs text-stone-500 mt-auto">
                    QS World Ranking #{college.ranking.qs}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Application platforms */}
      <section>
        <div className="mb-7">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
            Application platforms
          </h2>
          <p className="text-stone-600 text-sm max-w-2xl">
            One application can reach dozens of universities. Each region runs its own platform — here are the four you need to know.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {APPLICATION_PLATFORMS.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-terracotta-300 transition-colors flex flex-col"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-terracotta-500 mb-2">
                {p.region}
              </span>
              <h3 className="font-display text-xl font-bold text-ink mb-2">{p.name}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{p.summary}</p>
              <span className="mt-auto pt-3 text-xs text-stone-500 inline-flex items-center gap-1">
                Visit site <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Featured exams */}
      <section id="exams">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
              Major entrance exams
            </h2>
            <p className="text-stone-600 text-sm">
              The tests that gate top universities, by region. Most are accepted across multiple countries.
            </p>
          </div>
          <Link
            href="/exams"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-forest-700 hover:text-forest-800 font-medium no-underline shrink-0"
          >
            All exams <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_EXAMS.map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.slug}`}
              className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-xl font-bold text-ink group-hover:text-forest-700 transition-colors">
                  {exam.shortName}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  {exam.region}
                </span>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-3">
                {exam.descriptionEn}
              </p>
              <div className="mt-auto pt-3 text-xs text-stone-500 capitalize">
                {exam.domain.replace('-', ' ')} · {exam.frequency.split('(')[0].trim().toLowerCase()}
              </div>
            </Link>
          ))}
        </div>
      </section>

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
