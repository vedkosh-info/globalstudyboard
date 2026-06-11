import type { Metadata } from 'next';
import { COLLEGES } from '@/lib/colleges';
import { resolveDisplayRegions } from '@/lib/regions';
import CollegesView, { type CollegeCard } from '@/components/CollegesView';

export const metadata: Metadata = {
  title: 'Universities Worldwide — Profiles, Admissions & Courses',
  description:
    'Browse university profiles across the USA, UK, Europe, Canada, Australia, the Middle East and India — with location, degree levels, admission tests and official links for each institution.',
  keywords: [
    'university profiles',
    'best universities worldwide',
    'how to apply to universities abroad',
    'study abroad universities',
    'top universities USA UK Europe',
    'IIT IIM AIIMS NLU',
    'university admissions guide',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/colleges' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/colleges',
    title: 'Universities Worldwide — GlobalStudyBoard',
    description:
      'University profiles across the USA, UK, Europe, Canada, Australia, the Middle East and India.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universities Worldwide — GlobalStudyBoard',
    description: 'Profiles, admissions and courses for top universities across every study destination.',
    images: ['/opengraph-image'],
  },
};

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
  const items: CollegeCard[] = COLLEGES.map((c) => ({
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
      </header>

      <CollegesView items={items} />
    </div>
  );
}
