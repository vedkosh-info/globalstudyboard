import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { GUIDES } from '@/lib/guides';
import { REGIONS_ALPHABETICAL, matchesRegion } from '@/lib/regions';
import { tracksForRegion, trackHref, topicsForTrack } from '@/lib/tracks';
import { regionCategoryPath } from '@/lib/region-nav';
import { pageMetadata, SITE_URL } from '@/lib/seo';
import LastUpdated from '@/components/LastUpdated';
import RegionFlag from '@/components/RegionFlag';
import { SITE_REVIEWED, formatReviewed } from '@/lib/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Study Guides — Admissions, Exams, Visas & Careers for Every Destination',
  description:
    'Official-source guides to entrance exams, university admissions, scholarships, student visas and careers for the USA, UK, Canada, Europe, Australia, Asia, the Gulf, Russia and India — updated for the 2026–27 cycle.',
  path: '/guides',
  keywords: [
    'study guides',
    'university admission guides',
    'entrance exam guides',
    'study abroad guides',
    'student visa guides',
    'scholarship guides',
    'career guides',
  ],
});

const NEWEST_PER_REGION = 8;

/**
 * The /guides directory.
 *
 * This page used to render all 2,701 guide cards in one document — 8.6 MB of
 * HTML, 46,000 DOM nodes, a mobile Lighthouse score of 52 and an LCP of 5.9 s —
 * with 2,279 of the cards hidden behind the India default. It is now a static
 * directory: for each of the nine destinations, the tracks that organise its
 * guides plus its most recently verified ones, each section linking to the
 * destination's own complete, prerendered listing at /regions/{slug}/guides.
 * Every guide remains reachable (hubs, region listings, sitemap, RSS); this
 * page just stops being the place that lists all of them at once.
 */
export default function GuidesIndexPage() {
  const sections = REGIONS_ALPHABETICAL.map((r) => {
    const own = GUIDES.filter((g) => matchesRegion(r.slug, g.region, g.regions));
    const newest = [...own]
      .sort((a, b) => (a.lastVerified < b.lastVerified ? 1 : a.lastVerified > b.lastVerified ? -1 : 0))
      .slice(0, NEWEST_PER_REGION);
    const tracks = tracksForRegion(r.slug).map((t) => ({
      slug: t.slug,
      label: t.label,
      href: trackHref(t),
      hubs: topicsForTrack(t).length,
    }));
    return { region: r, count: own.length, newest, tracks };
  });

  const collectionJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE_URL}/guides`,
    name: 'Study guides by destination',
    url: `${SITE_URL}/guides`,
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    hasPart: sections.map((s) => ({
      '@type': 'CollectionPage',
      name: `Guides to studying in ${s.region.proseName}`,
      url: `${SITE_URL}${regionCategoryPath(s.region.slug, 'guides')}`,
    })),
  });

  return (
    <div className="space-y-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionJson }} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Study guides
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Guides that answer what students actually ask.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          {GUIDES.length.toLocaleString('en-US')} step-by-step explainers on entrance exams,
          admissions, scholarships, student visas and careers across nine study destinations —
          written in plain language and checked against official sources. Every time-sensitive fact
          links to the official site, because rules change each year.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      {/* Destination jump list */}
      <nav aria-label="Guides by destination" className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <a
            key={s.region.slug}
            href={`#guides-${s.region.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm text-stone-700 no-underline hover:border-forest-300 hover:text-forest-700"
          >
            <RegionFlag slug={s.region.slug} className="h-3.5" />
            {s.region.displayName}
            <span className="text-xs text-stone-600">{s.count}</span>
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        {sections.map((s) => (
          <section key={s.region.slug} id={`guides-${s.region.slug}`} className="scroll-mt-28">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  <RegionFlag slug={s.region.slug} className="h-4" />
                  {s.count} guides
                </p>
                <h2 className="m-0 font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink">
                  Studying in {s.region.proseName}
                </h2>
              </div>
              <Link
                href={regionCategoryPath(s.region.slug, 'guides')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-forest-700 no-underline hover:text-forest-800"
              >
                All {s.count} guides for {s.region.proseName} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <div className="rounded-2xl border border-stone-200 bg-cream-50/60 p-5">
                <h3 className="m-0 mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Browse by track
                </h3>
                <ul className="m-0 list-none p-0 space-y-1.5">
                  {s.tracks.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={t.href}
                        className="inline-flex items-baseline gap-2 text-sm text-stone-800 no-underline hover:text-forest-700"
                      >
                        {t.label}
                        <span className="text-xs text-stone-600">
                          {t.hubs} hub{t.hubs === 1 ? '' : 's'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h3 className="m-0 mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Recently verified
                </h3>
                <ul className="m-0 list-none p-0 divide-y divide-stone-100">
                  {s.newest.map((g) => (
                    <li key={g.slug} className="py-2 first:pt-0 last:pb-0">
                      <Link
                        href={`/guides/${g.slug}`}
                        className="block text-sm font-medium text-ink no-underline hover:text-forest-700"
                      >
                        {g.titleEn}
                      </Link>
                      <span className="text-xs text-stone-500">
                        Verified {formatReviewed(g.lastVerified).display} · {g.readMinutes} min read
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
