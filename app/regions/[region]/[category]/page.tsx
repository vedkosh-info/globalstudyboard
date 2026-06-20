import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Clock } from 'lucide-react';

import { getRegionBySlug, matchesRegion, REGION_SLUGS, type RegionSlug } from '@/lib/regions';
import {
  REGION_CATEGORIES,
  isRegionCategory,
  categoryLabel,
  categoryNoun,
  regionCategoryPath,
  type RegionCategory,
} from '@/lib/region-nav';
import { COLLEGES, type College } from '@/lib/colleges';
import { ENTRANCE_EXAMS, type EntranceExam } from '@/lib/admission-guides';
import { GUIDES, GUIDE_CATEGORY_LABELS, type Guide, type GuideCategory } from '@/lib/guides';
import { itemListLd } from '@/lib/structured-data';
import RegionRail from '@/components/RegionRail';
import PageRegion from '@/components/PageRegion';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

const BASE = 'https://www.globalstudyboard.com';

interface Props {
  params: Promise<{ region: string; category: string }>;
}

/** 8 regions × 4 categories = 32 statically-generated section pages. */
export function generateStaticParams() {
  return REGION_SLUGS.flatMap((region) =>
    REGION_CATEGORIES.map((category) => ({ region, category })),
  );
}

const GUIDE_CATEGORY_ORDER: GuideCategory[] = [
  'exam-prep',
  'admissions',
  'comparison',
  'career',
  'study-abroad',
  'scholarships',
];

function metaFor(category: RegionCategory, name: string, isIndia: boolean) {
  switch (category) {
    case 'universities':
      return {
        title: `${isIndia ? 'Colleges' : 'Universities'} in ${name} — Profiles & How to Apply`,
        description: `Explore ${isIndia ? 'colleges' : 'universities'} in ${name}: profiles, rankings where available, the entrance tests they accept, and how to apply — each linked to its official source.`,
      };
    case 'exams':
      return {
        title: `Entrance Tests & Exams for Studying in ${name}`,
        description: `The standardized tests and entrance exams used by universities in ${name} — what they assess, eligibility, and official registration links. Free and verified.`,
      };
    case 'guides':
      return {
        title: `${name} Study Guides — Admissions, Visas, Costs & Careers`,
        description: `Plain-language, official-source guides for studying in ${name}: admissions, applications, student visas, costs, scholarships and careers.`,
      };
    case 'scholarships':
      return {
        title: `Scholarships for Studying in ${name}`,
        description: `Scholarships and funding routes for ${name}: who they are for, official links, and how to apply. Always verify amounts and deadlines on the official source.`,
      };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, category } = await params;
  const r = getRegionBySlug(region);
  if (!r || !isRegionCategory(category)) return { title: 'Not found' };
  const m = metaFor(category, r.displayName, r.slug === 'india');
  const url = `${BASE}/regions/${r.slug}/${category}`;
  return {
    title: m.title,
    description: m.description,
    keywords: [
      `${categoryLabel(category, r.slug)} ${r.displayName}`,
      `study in ${r.displayName}`,
      `${r.displayName} ${categoryNoun(category, r.slug)}`,
      `${categoryNoun(category, r.slug)} for international students ${r.displayName}`,
    ],
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title: m.title, description: m.description, images: ['/opengraph-image'] },
    twitter: { card: 'summary_large_image', title: m.title, description: m.description, images: ['/opengraph-image'] },
  };
}

export default async function RegionCategoryPage({ params }: Props) {
  const { region, category } = await params;
  const r = getRegionBySlug(region);
  if (!r || !isRegionCategory(category)) notFound();

  const slug = r.slug;
  const label = categoryLabel(category, slug);
  const noun = categoryNoun(category, slug);
  const m = metaFor(category, r.displayName, slug === 'india');

  const universities =
    category === 'universities'
      ? [...COLLEGES.filter((c) => matchesRegion(slug, c.region, c.regions))].sort(
          (a, b) => (a.ranking?.qs ?? 9999) - (b.ranking?.qs ?? 9999),
        )
      : [];
  const exams =
    category === 'exams' ? ENTRANCE_EXAMS.filter((e) => matchesRegion(slug, e.region, e.regions)) : [];
  const guides =
    category === 'guides' ? GUIDES.filter((g) => matchesRegion(slug, g.region, g.regions)) : [];
  const scholarships =
    category === 'scholarships'
      ? GUIDES.filter((g) => matchesRegion(slug, g.region, g.regions) && g.category === 'scholarships')
      : [];

  const count =
    category === 'universities'
      ? universities.length
      : category === 'exams'
        ? exams.length
        : category === 'scholarships'
          ? scholarships.length
          : guides.length;

  const itemListItems: { name: string; url: string }[] =
    category === 'universities'
      ? universities.map((c) => ({ name: c.nameEn, url: `${BASE}/colleges/${c.slug}` }))
      : category === 'exams'
        ? exams.map((e) => ({ name: e.shortName, url: `${BASE}/exams/${e.slug}` }))
        : category === 'scholarships'
          ? scholarships.map((g) => ({ name: g.titleEn, url: `${BASE}/guides/${g.slug}` }))
          : guides.map((g) => ({ name: g.titleEn, url: `${BASE}/guides/${g.slug}` }));

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE}/regions/${slug}/${category}`,
    name: m.title,
    description: m.description,
    inLanguage: 'en',
    url: `${BASE}/regions/${slug}/${category}`,
    isPartOf: { '@type': 'WebSite', '@id': `${BASE}/#website` },
  };
  const listLd = itemListLd({ name: m.title, items: itemListItems });

  // Guides grouped by sub-category (only known categories with content), in order.
  const guideGroups = GUIDE_CATEGORY_ORDER.map((key) => ({
    key,
    label: GUIDE_CATEGORY_LABELS[key],
    items: guides.filter((g) => g.category === key),
  })).filter((grp) => grp.items.length > 0);

  const chip =
    'inline-flex items-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 no-underline transition-colors hover:border-forest-300 hover:text-forest-700';
  const activeChip =
    'inline-flex items-center rounded-full border border-forest-600 bg-forest-700 px-3.5 py-1.5 text-sm font-semibold text-cream-50 no-underline';

  return (
    <div className="-mx-4 md:-mx-0">
      <PageRegion slug={slug as RegionSlug} />
      <RegionRail activeSlug={slug as RegionSlug} sticky />

      <div className="mx-auto max-w-7xl px-4 md:px-0 space-y-10 mt-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />

        {/* Hero */}
        <header className="max-w-3xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            <span aria-hidden="true" className="text-base leading-none">
              {r.flag}
            </span>
            <Link
              href={`/regions/${slug}`}
              className="text-forest-700 no-underline hover:text-forest-800"
            >
              {r.displayName}
            </Link>
            <span className="text-stone-300">/</span>
            {label}
          </p>
          <h1 className="mb-4 font-display text-4xl font-bold tracking-editorial text-ink md:text-5xl">
            {category === 'scholarships'
              ? `Scholarships for studying in ${r.displayName}`
              : `${label} in ${r.displayName}`}
          </h1>
          <p className="text-lg leading-relaxed text-stone-700">{m.description}</p>
          <LastUpdated date={SITE_REVIEWED} className="mt-5" />
        </header>

        {/* Sibling section nav */}
        <nav aria-label={`${r.displayName} sections`} className="flex flex-wrap gap-2">
          <Link href={`/regions/${slug}`} className={chip}>
            Overview
          </Link>
          {REGION_CATEGORIES.map((cat) => {
            const active = cat === category;
            return (
              <Link
                key={cat}
                href={regionCategoryPath(slug, cat)}
                aria-current={active ? 'page' : undefined}
                className={active ? activeChip : chip}
              >
                {categoryLabel(cat, slug)}
              </Link>
            );
          })}
        </nav>

        <p className="text-sm text-stone-500">
          {count} {noun} for {r.displayName}.
        </p>

        {/* Universities */}
        {category === 'universities' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((c) => (
              <UniCard key={c.id} c={c} flag={r.flag} />
            ))}
          </div>
        )}

        {/* Exams */}
        {category === 'exams' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((e) => (
              <ExamCard key={e.id} e={e} />
            ))}
          </div>
        )}

        {/* Guides — grouped by sub-category */}
        {category === 'guides' && (
          <div className="space-y-12">
            {guideGroups.map((grp) => (
              <section key={grp.key}>
                <div className="section-rule mb-5">
                  <span>{grp.label}</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {grp.items.map((g) => (
                    <GuideCard key={g.slug} g={g} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Scholarships */}
        {category === 'scholarships' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((g) => (
              <GuideCard key={g.slug} g={g} />
            ))}
          </div>
        )}

        {count === 0 && (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="m-0 text-stone-600">
              We don&rsquo;t cover {noun} for {r.displayName} yet.{' '}
              <Link href={`/regions/${slug}`} className="font-semibold text-forest-700">
                Back to the {r.displayName} overview
              </Link>
              .
            </p>
          </div>
        )}

        {/* CTA */}
        <section className="rounded-3xl bg-forest-700 px-6 py-10 text-cream-50 sm:px-12">
          <div className="max-w-2xl">
            <h2 className="mb-3 font-display text-2xl font-bold tracking-editorial md:text-3xl">
              Planning your application to {r.displayName}?
            </h2>
            <p className="m-0 mb-5 text-cream-50/85">
              See the full {r.displayName} overview — application platform, intakes, costs and visa
              facts — or ask GSB AI for tailored guidance.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/regions/${slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-6 py-3 font-semibold text-forest-900 no-underline transition-colors hover:bg-cream-100"
              >
                {r.displayName} overview
              </Link>
              <Link
                href={`/gsb-ai?region=${slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cream-50/30 bg-transparent px-6 py-3 font-semibold text-cream-50 no-underline transition-colors hover:bg-cream-50/10"
              >
                Ask GSB AI about {r.displayName}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function UniCard({ c, flag }: { c: College; flag: string }) {
  return (
    <article className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="m-0 font-display text-lg font-bold leading-snug text-ink">
          <Link
            href={`/colleges/${c.slug}`}
            className="text-ink no-underline transition-colors hover:text-forest-700"
          >
            {c.nameEn}
          </Link>
        </h2>
        {c.ranking?.qs && (
          <span className="mt-1 shrink-0 text-[11px] font-semibold text-stone-500">QS #{c.ranking.qs}</span>
        )}
      </div>
      <p className="mb-3 text-xs text-stone-500">
        <span aria-hidden="true" className="mr-1">
          {flag}
        </span>
        {c.city}
        {c.state ? `, ${c.state}` : ''} · Est. {c.established}
      </p>
      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-stone-700">{c.descriptionEn}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 border-t border-stone-100 pt-3">
        {c.admissionExams.slice(0, 3).map((e) => (
          <span
            key={e}
            className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700"
          >
            {e}
          </span>
        ))}
      </div>
    </article>
  );
}

function ExamCard({ e }: { e: EntranceExam }) {
  return (
    <Link
      href={`/exams/${e.slug}`}
      className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 no-underline transition-colors hover:border-forest-300"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-xl font-bold text-ink transition-colors group-hover:text-forest-700">
          {e.shortName}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {e.domain.replace('-', ' ')}
        </span>
      </div>
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-stone-600">{e.fullName}</p>
      <div className="mt-auto pt-3 text-xs text-stone-500">{e.frequency.split('(')[0].trim()}</div>
    </Link>
  );
}

function GuideCard({ g }: { g: Guide }) {
  return (
    <Link
      href={`/guides/${g.slug}`}
      className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 no-underline transition-colors hover:border-forest-300"
    >
      <span className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {g.readMinutes} min read
      </span>
      <h2 className="mb-2 font-display text-lg font-bold leading-snug tracking-editorial text-ink group-hover:text-forest-700">
        {g.titleEn}
      </h2>
      <p className="m-0 flex-1 text-sm leading-relaxed text-stone-600">{g.descriptionEn}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
        Read guide <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
