import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Clock } from 'lucide-react';

import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import {
  tracksForRegion,
  getTrack,
  topicsForTrack,
  trackHref,
  multiHubTracks,
} from '@/lib/tracks';
import { guidesForTopic } from '@/lib/topic-guides';
import { itemListLd } from '@/lib/structured-data';
import RegionRail from '@/components/RegionRail';
import PageRegion from '@/components/PageRegion';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { breadcrumbsFor } from '@/lib/cmi';
import { pageMetadata, regionOgImage } from '@/lib/seo';
import { SITE_REVIEWED } from '@/lib/site-meta';
import { gsbAiHref } from '@/lib/gsb-ai-links';

const BASE = 'https://www.globalstudyboard.com';

interface Props {
  params: Promise<{ region: string; track: string }>;
}

/** Only multi-hub tracks get a landing page (single-hub tracks link straight to their hub). */
export function generateStaticParams() {
  return multiHubTracks().map((t) => ({ region: t.region, track: t.slug }));
}

// Keep this route purely static — any non-prebuilt track URL 404s rather than
// rendering on demand (single-hub track slugs deliberately have no page).
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, track } = await params;
  const r = getRegionBySlug(region);
  const t = r ? getTrack(r.slug, track) : undefined;
  if (!r || !t) return { title: 'Not found', robots: { index: false, follow: false } };
  // Title names the hubs the track holds ("US College Admissions: Common App,
  // Essays, Early Decision") instead of the internal "— Guides & Hubs" suffix.
  // Name the hubs the track holds — but only labels that add information: a
  // label that repeats the track title ("Student Life in Canada: Student Life in
  // Canada") or carries its own colon is skipped. With no distinct label that
  // fits ~70 chars, fall back to the explicit "— Guides & Hubs" form, which can
  // never coincide with a hub's own title.
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const titleNorm = norm(t.title);
  const hubLabels = topicsForTrack(t)
    .map((h) => h.label)
    .filter((l) => !l.includes(':'))
    .filter((l) => {
      const n = norm(l);
      return n !== titleNorm && !titleNorm.includes(n) && !n.includes(titleNorm);
    });
  let title = `${t.title} — Guides & Hubs`;
  for (let n = Math.min(3, hubLabels.length); n >= 1; n--) {
    const candidate = `${t.title}: ${hubLabels.slice(0, n).join(', ')}`;
    if (candidate.length <= 70) {
      title = candidate;
      break;
    }
  }
  return pageMetadata({
    title,
    description: t.description,
    path: `/regions/${r.slug}/track/${t.slug}`,
    image: regionOgImage(r.slug),
    keywords: [t.label, `${t.label} ${r.proseName}`, ...topicsForTrack(t).map((h) => h.label)],
  });
}

export default async function TrackPage({ params }: Props) {
  const { region, track } = await params;
  const r = getRegionBySlug(region);
  const t = r ? getTrack(r.slug, track) : undefined;
  if (!r || !t) notFound();

  const hubs = topicsForTrack(t).map((h) => ({ hub: h, count: guidesForTopic(h.slug).length }));
  const totalGuides = hubs.reduce((n, h) => n + h.count, 0);
  const siblings = tracksForRegion(r.slug);

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE}/regions/${r.slug}/track/${t.slug}`,
    name: t.title,
    description: t.description,
    inLanguage: 'en',
    url: `${BASE}/regions/${r.slug}/track/${t.slug}`,
    isPartOf: { '@type': 'WebSite', '@id': `${BASE}/#website` },
  };
  const listLd = itemListLd({
    name: t.title,
    items: hubs.map(({ hub }) => ({ name: hub.title, url: `${BASE}/topics/${hub.slug}` })),
  });

  const chip =
    'inline-flex items-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 no-underline transition-colors hover:border-forest-300 hover:text-forest-700';
  const activeChip =
    'inline-flex items-center rounded-full border border-forest-600 bg-forest-700 px-3.5 py-1.5 text-sm font-semibold text-cream-50 no-underline';

  return (
    <div className="-mx-4 md:-mx-0">
      <PageRegion slug={r.slug as RegionSlug} />
      <RegionRail activeSlug={r.slug as RegionSlug} sticky />

      <div className="mx-auto max-w-7xl px-4 md:px-0 mt-6">
        <BreadcrumbsView crumbs={breadcrumbsFor(`/regions/${r.slug}/track/${t.slug}`)} className="mb-0" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-0 space-y-10 mt-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />

        {/* Hero */}
        <header className="max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            <RegionFlag slug={r.slug} className="h-4" />
            <Link href={`/regions/${r.slug}`} className="text-forest-700 no-underline hover:text-forest-800">
              {r.displayName}
            </Link>
            <span className="text-stone-300">/</span>
            Track
          </p>
          <h1 className="mb-4 font-display text-4xl font-bold tracking-editorial text-ink md:text-5xl">
            {t.title}
          </h1>
          <p className="text-lg leading-relaxed text-stone-700">{t.description}</p>
          <LastUpdated date={SITE_REVIEWED} className="mt-5" />
        </header>

        {/* Sibling tracks for this region */}
        <nav aria-label={`${r.displayName} tracks`} className="flex flex-wrap gap-2">
          <Link href={`/regions/${r.slug}`} className={chip}>
            Overview
          </Link>
          {siblings.map((s) => {
            const active = s.slug === t.slug;
            return (
              <Link
                key={s.slug}
                href={trackHref(s)}
                aria-current={active ? 'page' : undefined}
                className={active ? activeChip : chip}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>

        <p className="text-sm text-stone-500">
          {hubs.length} topic hub{hubs.length === 1 ? '' : 's'} · {totalGuides} guide
          {totalGuides === 1 ? '' : 's'} in {r.proseName}.
        </p>

        {/* Topic-hub cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hubs.map(({ hub, count }) => (
            <Link
              key={hub.slug}
              href={`/topics/${hub.slug}`}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 no-underline transition-colors hover:border-forest-300"
            >
              <h2 className="mb-2 font-display text-lg font-bold leading-snug tracking-editorial text-ink group-hover:text-forest-700">
                {hub.title}
              </h2>
              <p className="m-0 flex-1 text-sm leading-relaxed text-stone-600 line-clamp-3">
                {hub.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {count} guide{count === 1 ? '' : 's'}
                <ArrowUpRight className="ml-0.5 h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <section className="on-dark rounded-3xl bg-forest-700 px-6 py-10 text-cream-50 sm:px-12">
          <div className="max-w-2xl">
            <h2 className="mb-3 font-display text-2xl font-bold tracking-editorial md:text-3xl">
              Exploring {t.label.toLowerCase()} in {r.proseName}?
            </h2>
            <p className="m-0 mb-5 text-cream-50/85">
              See the full overview for {r.proseName}, or ask GSB AI for tailored guidance on your path.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/regions/${r.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-6 py-3 font-semibold text-forest-900 no-underline transition-colors hover:bg-cream-100"
              >
                {r.displayName} overview
              </Link>
              <Link
                href={gsbAiHref({ region: r.slug })}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-50/30 bg-transparent px-6 py-3 font-semibold text-cream-50 no-underline transition-colors hover:bg-cream-50/10"
              >
                Ask GSB AI about {r.proseName}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
