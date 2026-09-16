import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { COLLEGES } from '@/lib/colleges';
import { REGION_SLUGS, resolveDisplayRegions } from '@/lib/regions';
import CollegesView, { type CollegeCard } from '@/components/CollegesView';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Universities Worldwide: Profiles, Rankings & How to Apply',
  description:
    'Browse 118 university profiles across the USA, UK & Ireland, Canada, Europe, Australia & NZ, East & Southeast Asia, the Middle East, Russia & CIS and India \u2014 location, degree levels, admission tests and official links for each institution.',
  path: '/colleges',
  keywords: [
    'university profiles',
    'best universities worldwide',
    'how to apply to universities abroad',
    'study abroad universities',
    'top universities USA UK Europe',
    'IIT IIM AIIMS NLU',
    'university admissions guide',
  ],
});

export default function CollegesIndexPage() {
  const itemListJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://www.globalstudyboard.com/colleges',
    name: 'Universities Worldwide — GlobalStudyBoard',
    description: 'University profiles across the USA, UK, Europe, Canada, Australia, the Middle East and India.',
    numberOfItems: COLLEGES.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: COLLEGES.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.nameEn,
      url: `https://www.globalstudyboard.com/colleges/${c.slug}`,
    })),
  });
  // Destination order (the nav's order), QS rank within a destination — the raw
  // catalogue order put the newest batch (Asia) first on a "worldwide" page.
  const ordered = [...COLLEGES].sort(
    (a, b) =>
      REGION_SLUGS.indexOf(a.region) - REGION_SLUGS.indexOf(b.region) ||
      (a.ranking?.qs ?? 9999) - (b.ranking?.qs ?? 9999),
  );
  const items: CollegeCard[] = ordered.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameEn: c.nameEn,
    city: c.city,
    state: c.state,
    established: c.established,
    descriptionEn: c.descriptionEn,
    region: c.region,
    regions: resolveDisplayRegions(c.region, c.regions),
  }));

  return (
    <div className="space-y-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListJsonLd }} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          University profiles
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Universities, destination by destination.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          {COLLEGES.length} institutions across the world&apos;s major study destinations. Open any
          profile for location, degree levels, the entrance tests it accepts, and the official site.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      <CollegesView items={items} unfilteredByDefault />
    </div>
  );
}
