import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { regionCategoryPath } from '@/lib/region-nav';
import {
  getPlace,
  placeDescription,
  placeHref,
  placeNoun,
  placeKind,
  placeTitle,
  placeRoots,
  publishedPlaces,
  type PlaceNode,
} from '@/lib/college-places';
import { itemListLd } from '@/lib/structured-data';
import { breadcrumbsFor } from '@/lib/cmi';
import { SITE_REVIEWED } from '@/lib/site-meta';
import { pageMetadata, regionOgImage } from '@/lib/seo';
import CollegeDirectoryFilter from '@/components/CollegeDirectoryFilter';
import PlaceDirectory, { PlaceChips, type PlaceGroup } from '@/components/PlaceDirectory';
import RegionRail from '@/components/RegionRail';
import PageRegion from '@/components/PageRegion';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import BreadcrumbsView from '@/components/BreadcrumbsView';

const BASE = 'https://www.globalstudyboard.com';

interface Props {
  params: Promise<{ region: string; category: string; place: string[] }>;
}

// Only places with enough profiles to narrow their parent get a page
// (lib/college-places.ts). Every other path under this route is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedPlaces().map((p) => ({ region: p.region, category: 'universities', place: p.segments }));
}

function resolve(region: string, category: string, place: string[]): PlaceNode | undefined {
  if (category !== 'universities') return undefined;
  const node = getPlace(region, place);
  return node?.published ? node : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, category, place } = await params;
  const node = resolve(region, category, place);
  const r = getRegionBySlug(region);
  if (!node || !r) return { title: 'Not found', robots: { index: false, follow: false } };
  const noun = placeNoun(r.slug).toLowerCase();
  return pageMetadata({
    title: placeTitle(node),
    description: placeDescription(node),
    path: placeHref(node),
    image: regionOgImage(r.slug),
    keywords: [`${noun} in ${node.name}`, `${noun} in ${node.label}`, `study in ${node.name}`],
  });
}

export default async function PlacePage({ params }: Props) {
  const { region, category, place } = await params;
  const node = resolve(region, category, place);
  const r = getRegionBySlug(region);
  if (!node || !r) notFound();

  const slug = r.slug as RegionSlug;
  const noun = placeNoun(slug);
  const path = placeHref(node);
  const heading = `${noun} in ${node.prose}`;
  const description = placeDescription(node);

  const groups: PlaceGroup[] =
    node.children.length > 1
      ? node.children.map((child) => ({
          key: child.segments.join('-'),
          heading: child.label,
          href: child.published ? placeHref(child) : undefined,
          colleges: child.colleges,
        }))
      : [{ key: node.segments.join('-'), heading: node.label, colleges: node.colleges }];

  const childLinks = node.children
    .filter((c) => c.published)
    .map((c) => ({ key: c.segments.join('-'), label: c.name, href: placeHref(c), count: c.colleges.length }));

  const siblings = (node.parent ? node.parent.children : placeRoots(node.region))
    .filter((s) => s !== node && s.published)
    .map((s) => ({ key: s.segments.join('-'), label: s.name, href: placeHref(s), count: s.colleges.length }));

  const up = node.parent?.published
    ? { name: node.parent.prose, href: placeHref(node.parent) }
    : { name: r.proseName, href: regionCategoryPath(slug, 'universities') };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE}${path}`,
    name: heading,
    description,
    inLanguage: 'en',
    url: `${BASE}${path}`,
    isPartOf: { '@type': 'WebSite', '@id': `${BASE}/#website` },
    about: { '@type': 'Place', name: node.label },
  };
  const listLd = itemListLd({
    name: heading,
    items: node.colleges.map((c) => ({ name: c.nameEn, url: `${BASE}/colleges/${c.slug}` })),
  });

  return (
    <div className="-mx-4 md:-mx-0">
      <PageRegion slug={slug} />
      <RegionRail activeSlug={slug} sticky />

      <div className="mx-auto mt-6 max-w-7xl px-4 md:px-0">
        <BreadcrumbsView crumbs={breadcrumbsFor(path)} className="mb-0" />
      </div>

      <div className="mx-auto mt-10 max-w-7xl space-y-10 px-4 md:px-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />

        <header className="max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            <RegionFlag slug={slug} className="h-4" />
            <Link href={regionCategoryPath(slug, 'universities')} className="text-forest-700 no-underline hover:text-forest-800">
              {noun} in {r.displayName}
            </Link>
          </p>
          <h1 className="mb-4 font-display text-4xl font-bold tracking-editorial text-ink md:text-5xl">{heading}</h1>
          <p className="text-lg leading-relaxed text-stone-700">
            {description} Listed alphabetically; the order is not a ranking.
          </p>
          <LastUpdated date={SITE_REVIEWED} className="mt-5" />
        </header>

        <PlaceChips title={`Browse by ${placeKind(node.children).one}`} places={childLinks} />

        <CollegeDirectoryFilter key={path} totalCount={node.colleges.length}>
          <PlaceDirectory groups={groups} label={heading} />
        </CollegeDirectoryFilter>

        <nav aria-label="Nearby places" className="space-y-6 border-t border-stone-200 pt-8">
          <PlaceChips title={`More ${placeKind([node]).many}`} places={siblings} />
          <p className="m-0 text-base">
            <Link href={up.href} className="font-medium text-forest-700 no-underline hover:text-forest-800">
              ← All {noun.toLowerCase()} in {up.name}
            </Link>
          </p>
        </nav>
      </div>
    </div>
  );
}
