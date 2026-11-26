import type { Metadata } from 'next';
import { COLLEGES } from '@/lib/colleges';
import { matchesRegion, REGIONS_ALPHABETICAL } from '@/lib/regions';
import { regionCategoryPath } from '@/lib/region-nav';
import { pageMetadata, SITE_URL } from '@/lib/seo';
import { SITE_REVIEWED } from '@/lib/site-meta';
import { itemListLd } from '@/lib/structured-data';
import CollegeDestinationGrid from '@/components/CollegeDestinationGrid';
import LastUpdated from '@/components/LastUpdated';

export const metadata: Metadata = pageMetadata({
  title: 'Universities and Colleges by Study Destination',
  description:
    'Browse universities and colleges by destination. Find institution profiles with locations, degree levels and links to official sites.',
  path: '/colleges',
});

export default function CollegesIndexPage() {
  const destinations = REGIONS_ALPHABETICAL.map((region) => ({
    slug: region.slug,
    name: region.displayName,
    href: regionCategoryPath(region.slug, 'universities'),
    count: COLLEGES.filter((college) => matchesRegion(region.slug, college.region, college.regions)).length,
  }));

  const list = itemListLd({
    name: 'University directories by study destination',
    items: destinations.map(({ name, href }) => ({ name, url: SITE_URL + href })),
  });

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(list) }} />
      <header className="max-w-3xl">
        <h1 className="mb-4 font-display text-4xl font-bold tracking-editorial text-ink md:text-5xl">
          Universities and colleges by study destination
        </h1>
        <p className="text-lg leading-relaxed text-stone-700">
          Browse {COLLEGES.length} institution profiles. Choose a destination to explore the directory, filter by field and find official links.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      <CollegeDestinationGrid destinations={destinations} />
    </div>
  );
}
