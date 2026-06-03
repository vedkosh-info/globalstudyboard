import type { Metadata } from 'next';
import Link from 'next/link';
import { COLLEGES } from '@/lib/colleges';
import { REGIONS } from '@/lib/regions';

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
  alternates: {
    canonical: 'https://www.globalstudyboard.com/colleges',
    languages: {
      en: 'https://www.globalstudyboard.com/colleges',
      hi: 'https://www.globalstudyboard.com/hi/colleges',
      'x-default': 'https://www.globalstudyboard.com/colleges',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/colleges',
    title: 'Universities Worldwide — GlobalStudyBoard',
    description:
      'University profiles across the USA, UK, Europe, Canada, Australia, the Middle East and India.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universities Worldwide — GlobalStudyBoard',
    description: 'Profiles, admissions and courses for top universities across every study destination.',
  },
};

const REGION_ORDER = ['usa', 'uk-ireland', 'europe', 'canada', 'australia-nz', 'middle-east', 'russia', 'india'];

export default function CollegesIndexPage() {
  const byRegion = COLLEGES.reduce<Record<string, typeof COLLEGES>>((acc, c) => {
    (acc[c.region] ??= []).push(c);
    return acc;
  }, {});
  const orderedRegions = REGION_ORDER.filter((r) => byRegion[r]);

  return (
    <div className="space-y-14">
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

      {orderedRegions.map((regionSlug) => {
        const region = REGIONS.find((r) => r.slug === regionSlug);
        const colleges = byRegion[regionSlug];
        return (
          <section key={regionSlug}>
            <div className="section-rule mb-5">
              <span>
                <span aria-hidden="true" className="mr-2">{region?.flag}</span>
                {region?.displayName ?? regionSlug}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {colleges.map((c) => (
                <Link
                  key={c.id}
                  href={`/colleges/${c.slug}`}
                  className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
                >
                  <h2 className="font-display text-lg font-bold text-ink group-hover:text-forest-700 transition-colors leading-snug m-0 mb-1">
                    {c.nameEn}
                  </h2>
                  <p className="text-stone-500 text-xs mb-3">
                    {c.city}{c.state ? `, ${c.state}` : ''} · Est. {c.established}
                  </p>
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mt-auto">
                    {c.descriptionEn}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
