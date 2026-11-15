import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { COLLEGES } from '@/lib/colleges';
import {
  CATEGORY_ROW_LABELS,
  COLLEGE_CATEGORIES,
  SPECIALIZATIONS,
  SPECIALIZATION_LABELS,
  categoryForFilter,
} from '@/lib/college-taxonomy';
import { REGIONS, REGION_SLUGS, matchesRegion, resolveDisplayRegions } from '@/lib/regions';
import CollegeDirectoryFilter, { type CollegeFilterRow } from '@/components/CollegeDirectoryFilter';
import CollegeDirectoryRow from '@/components/CollegeDirectoryRow';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Universities Worldwide: Profiles, Rankings & How to Apply',
  description:
    `Browse ${COLLEGES.length} university profiles across the USA, UK & Ireland, Canada, Europe, Australia & NZ, East & Southeast Asia, the Middle East, Russia & CIS and India — location, degree levels, admission tests and official links for each institution.`,
  path: '/colleges',
  keywords: [
    'university profiles',
    'how to apply to universities abroad',
    'study abroad universities',
    'IIT IIM AIIMS NLU',
    'university admissions guide',
  ],
});

const CATEGORY_OPTIONS = COLLEGE_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_ROW_LABELS[value],
}));

const FIELD_OPTIONS = SPECIALIZATIONS.map((value) => ({
  value,
  label: SPECIALIZATION_LABELS[value],
}));


export default function CollegesIndexPage() {
  // Destination order (the nav's order), alphabetical by English name within each
  // destination — neutral ordering with no implied rank.
  const ordered = [...COLLEGES].sort(
    (a, b) =>
      REGION_SLUGS.indexOf(a.region) - REGION_SLUGS.indexOf(b.region) ||
      a.nameEn.localeCompare(b.nameEn),
  );

  const itemListJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://www.globalstudyboard.com/colleges',
    name: 'Universities Worldwide — GlobalStudyBoard',
    description:
      'University profiles across the USA, UK & Ireland, Canada, Europe, Australia & NZ, East & Southeast Asia, the Middle East, Russia & CIS and India.',
    numberOfItems: ordered.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: ordered.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.nameEn,
      url: `https://www.globalstudyboard.com/colleges/${c.slug}`,
    })),
  });

  const filterRows: CollegeFilterRow[] = ordered.map((c) => ({
    slug: c.slug,
    region: c.region,
    regions: resolveDisplayRegions(c.region, c.regions),
    category: categoryForFilter(c),
    specializations: c.specializations ?? [],
  }));

  const groups = REGIONS.map((r) => ({
    region: r,
    colleges: ordered.filter((c) => matchesRegion(r.slug, c.region, c.regions)),
  })).filter((g) => g.colleges.length > 0);

  return (
    <div className="space-y-12">
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

      <CollegeDirectoryFilter
        rows={filterRows}
        scope="worldwide"
        categoryOptions={CATEGORY_OPTIONS}
        fieldOptions={FIELD_OPTIONS}
      >
        <div className="space-y-12">
          {groups.map(({ region, colleges }) => (
            <section
              key={region.slug}
              id={`universities-${region.slug}`}
              data-region-section={region.slug}
              aria-labelledby={`heading-${region.slug}`}
              className="scroll-mt-24"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-stone-900 pb-3 mb-2">
                <h2
                  id={`heading-${region.slug}`}
                  className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink m-0 flex items-center gap-2.5"
                >
                  <RegionFlag slug={region.slug} className="h-5" />
                  <Link
                    href={`/regions/${region.slug}/universities`}
                    className="text-ink no-underline hover:text-forest-700"
                  >
                    {region.displayName}
                  </Link>
                  <span className="text-sm font-sans font-medium text-stone-500">
                    ({colleges.length})
                  </span>
                </h2>
                <Link
                  href={`/regions/${region.slug}/universities`}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-700 no-underline hover:text-forest-800"
                >
                  {region.shortName} universities →
                </Link>
              </div>
              <ul className="m-0 list-none p-0">
                {colleges.map((c) => (
                  <CollegeDirectoryRow key={`${region.slug}-${c.slug}`} c={c} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </CollegeDirectoryFilter>
    </div>
  );
}
