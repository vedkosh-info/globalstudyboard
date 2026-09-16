import type { Metadata } from 'next';
import Link from 'next/link';

import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { COLLEGES } from '@/lib/colleges';
import { GUIDES } from '@/lib/guides';
import { REGIONS, matchesRegion, type RegionSlug } from '@/lib/regions';
import { SITE_DESCRIPTION } from '@/lib/site-meta';
import { pageMetadata } from '@/lib/seo';
import HomeHero, { type HomeHeroData } from '@/components/HomeHero';
import ContentImage from '@/components/ContentImage';
import { homeImage } from '@/lib/images';
import HomeRegionGrid from '@/components/HomeRegionGrid';
import HomeDestinations from '@/components/HomeDestinations';
import HomeSpotlight, { type ExamLite, type CollegeLite } from '@/components/HomeSpotlight';

/**
 * Home <title> leads with the query terms, brand last: the site has no brand
 * demand yet (0 backlinks, every top query is long-tail), so the first ~60
 * characters of its most-linked URL must carry query terms, not the name. It is
 * audience-neutral on purpose — the catalogue serves domestic students (India's
 * 400+ guides, home students elsewhere) as well as international ones.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'University Admissions, Entrance Exams & Study Abroad Guide',
    description: SITE_DESCRIPTION,
    path: '',
    keywords: [
      'study abroad guide',
      'university admissions for international students',
      'entrance exams',
      'scholarships for international students',
      'student visa requirements',
      'study in USA',
      'study in UK',
      'study in Canada',
      'study in Europe',
      'study in Australia',
      'study in Asia',
    ],
  }),
  title: {
    absolute: 'University Admissions, Entrance Exams & Study Abroad Guide | GlobalStudyBoard',
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

/**
 * The four top-ranked universities per destination, projected to the handful of
 * fields the spotlight cards render. Computed on the server so the 118-record
 * college catalogue (with every description) no longer ships in the home page's
 * client chunk.
 */
const HOME_UNIVERSITIES_BY_REGION: Record<RegionSlug, CollegeLite[]> = (() => {
  const out = {} as Record<RegionSlug, CollegeLite[]>;
  for (const r of REGIONS) {
    out[r.slug] = COLLEGES.filter((c) => matchesRegion(r.slug, c.region, c.regions))
      .sort((a, b) => (a.ranking?.qs ?? 9999) - (b.ranking?.qs ?? 9999))
      .slice(0, 4)
      .map((c) => ({
        slug: c.slug,
        nameEn: c.nameEn,
        city: c.city,
        state: c.state,
        established: c.established,
        qsRank: c.ranking?.qs,
      }));
  }
  return out;
})();

/** Per-destination hero data (top university + the flagship guides behind `popularQueries`). */
const HOME_HERO_DATA: Record<RegionSlug, HomeHeroData> = (() => {
  const out = {} as Record<RegionSlug, HomeHeroData>;
  for (const r of REGIONS) {
    const top = HOME_UNIVERSITIES_BY_REGION[r.slug][0];
    const popular = r.popularQueries
      .map((q) => {
        const g = GUIDES.find((x) => x.slug === q);
        return g
          ? { href: `/guides/${g.slug}`, label: g.titleEn, isGuide: true }
          : { href: '', label: q.replace(/-/g, ' '), isGuide: false, q: q.replace(/-/g, ' ') };
      })
      .slice(0, 4);
    out[r.slug] = {
      topUniversity: top ? { name: top.nameEn, qsRank: top.qsRank } : null,
      popular,
    };
  }
  return out;
})();

export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-20">

      <HomeHero
        data={HOME_HERO_DATA}
        visual={
          <ContentImage
            asset={homeImage()}
            variant="hero"
            priority
            sizes="(min-width: 1024px) 26rem, (min-width: 640px) 90vw, 100vw"
          />
        }
      />

      <HomeRegionGrid />

      {/* Region-tuned universities + key tests for the chosen destination */}
      <HomeSpotlight examsBySlug={HOME_EXAMS_BY_SLUG} universitiesByRegion={HOME_UNIVERSITIES_BY_REGION} />

      {/* Destination-neutral, server-rendered directory of all nine destinations */}
      <HomeDestinations />

      {/* Why GSB — editorial pitch */}
      <section className="on-dark bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-12 py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-cream-100/70 mb-4">
            Why GlobalStudyBoard
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial leading-tight mb-5">
            One reference, every region.<br />No country-of-origin bias.
          </h2>
          <p className="text-cream-50/85 text-base md:text-lg leading-relaxed mb-6">
            Most college guides start from where their authors live. We start from where <em>you</em> want to go. Every destination — the United States, the United Kingdom and Ireland, continental Europe, Canada, Australia and New Zealand, East and Southeast Asia, the Middle East, Russia and the CIS, and India — gets the same depth of coverage, the same plain-language tone, and the same insistence on linking to the official source.
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
