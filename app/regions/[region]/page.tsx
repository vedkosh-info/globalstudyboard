import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Calendar, DollarSign, GraduationCap, Briefcase } from 'lucide-react';

import {
  REGIONS_ALPHABETICAL,
  getRegionBySlug,
  matchesRegion,
  REGION_SLUGS,
  type RegionSlug,
} from '@/lib/regions';
import { COLLEGES } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { GUIDES } from '@/lib/guides';
import { tracksForRegion, trackHref, isMultiHubTrack, topicsForTrack } from '@/lib/tracks';
import AudienceGate from '@/components/AudienceGate';
import { defaultAudienceFor, isAudienceVisible, type Audience } from '@/lib/audience';
import { REGION_CATEGORIES, categoryLabel, categoryNoun, regionCategoryPath } from '@/lib/region-nav';
import RegionRail from '@/components/RegionRail';
import PageRegion from '@/components/PageRegion';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { breadcrumbsFor } from '@/lib/cmi';
import { SITE_REVIEWED, metaDescription } from '@/lib/site-meta';

interface Props {
  params: Promise<{ region: string }>;
}

export function generateStaticParams() {
  return REGION_SLUGS.map((region) => ({ region }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params;
  const r = getRegionBySlug(region);
  if (!r) return { title: 'Region not found' };
  const desc = metaDescription(r.educationSystemSummary);
  return {
    title: `Study in ${r.displayName} — Universities, Exams & Scholarships`,
    description: desc,
    keywords: [
      `study in ${r.displayName}`,
      `${r.displayName} universities`,
      `${r.displayName} student visa`,
      `${r.displayName} scholarships`,
      `apply to ${r.displayName} university`,
      r.primaryApplicationPlatform.split('/')[0].split('(')[0].trim(),
      ...r.keyExamSlugs.map((s) => s.toUpperCase()),
    ],
    alternates: { canonical: `https://www.globalstudyboard.com/regions/${r.slug}` },
    openGraph: {
      type: 'website',
      url: `https://www.globalstudyboard.com/regions/${r.slug}`,
      title: `Study in ${r.displayName} — Universities, Exams & Scholarships`,
      description: desc,
      // og:image comes from the per-region opengraph-image.tsx route convention.
    },
    twitter: {
      card: 'summary_large_image',
      title: `Study in ${r.displayName} — Universities, Exams & Scholarships`,
      description: desc,
      // twitter:image comes from the per-region twitter-image.tsx route convention.
    },
  };
}

export default async function RegionHubPage({ params }: Props) {
  const { region } = await params;
  const r = getRegionBySlug(region);
  if (!r) notFound();

  const universities = COLLEGES.filter((c) => matchesRegion(r.slug, c.region, c.regions));
  const examsForRegion = ENTRANCE_EXAMS.filter((e) => matchesRegion(r.slug, e.region, e.regions));
  const guidesForRegion = GUIDES.filter((g) => matchesRegion(r.slug, g.region, g.regions));
  const categoryCount: Record<string, number> = {
    universities: universities.length,
    exams: examsForRegion.length,
    guides: guidesForRegion.length,
    scholarships: guidesForRegion.filter((g) => g.category === 'scholarships').length,
  };
  const tracks = tracksForRegion(r.slug);
  const pageDefault = defaultAudienceFor(r.slug);

  // Real Q&A from pre-audited region data (lib/regions.ts) — backs the visible FAQ
  // section AND the FAQPage JSON-LD; every answer keeps the verify-on-official nudge.
  const faqItems: { q: string; a: string; audience?: Audience }[] = [
    {
      q: `How do you apply to universities in ${r.displayName}?`,
      a: `Most applicants apply via ${r.primaryApplicationPlatform}. Confirm current requirements on the official university or application-platform website before applying.`,
    },
    {
      q: `When are the main intakes in ${r.displayName}?`,
      a: `The main intake${r.intakes.length > 1 ? 's are' : ' is'} ${r.intakes.join(', ')}. Application deadlines vary by university — always verify on the official source.`,
    },
    ...(r.averageTuitionRangeUsd
      ? [
          {
            q: `How much does it cost to study in ${r.displayName}?`,
            a: `Undergraduate tuition is roughly $${r.averageTuitionRangeUsd.undergrad[0].toLocaleString()}–$${r.averageTuitionRangeUsd.undergrad[1].toLocaleString()} per year (USD). Fees change every academic year — verify on the official university website.`,
          },
        ]
      : []),
    ...(r.visaName
      ? [
          {
            q: `What student visa do you need for ${r.displayName}?`,
            a: `${r.visaName}. Immigration rules change frequently — verify on the official government source before applying.`,
            // Student visa is an international-applicant concern — hidden for home students.
            audience: 'international' as const,
          },
        ]
      : []),
    {
      q: `Can you work while studying in ${r.displayName}?`,
      // Work/visa rules are policy facts (Rule D / §5): keep the verify-nudge.
      // Skip if the source string already carries one (Europe, Russia) — no doubles.
      a: /verify/i.test(r.worksWhileStudying)
        ? r.worksWhileStudying
        : `${r.worksWhileStudying} Work rules can change — verify on the official source before relying on them.`,
    },
  ];
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `https://www.globalstudyboard.com/regions/${r.slug}#faq`,
    mainEntity: faqItems.filter((f) => isAudienceVisible(f.audience, pageDefault)).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="-mx-4 md:-mx-0">
      <PageRegion slug={r.slug as RegionSlug} />
      <RegionRail activeSlug={r.slug as RegionSlug} sticky />

      <div className="mx-auto max-w-7xl px-4 md:px-0 mt-6">
        <BreadcrumbsView crumbs={breadcrumbsFor(`/regions/${r.slug}`)} className="mb-0" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-0 space-y-14 mt-10">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

        {/* Hero */}
        <header className="max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <RegionFlag slug={r.slug} className="h-10" />
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500">
              {r.countries.length === 1 ? 'Region guide' : `${r.countries.length} countries`}
            </p>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-editorial leading-[1.05] text-ink mb-5">
            Study in {r.displayName}
          </h1>
          <p className="editorial-lede text-stone-700 text-lg leading-relaxed">
            {r.educationSystemSummary}
          </p>
          {/*
            The countries this destination actually covers, named in full. The
            eyebrow above says "N countries" but never said WHICH, and for a
            grouping like Europe or the Middle East that is the first thing a
            student needs to know. The destination menu shows a clipped preview;
            this is the complete list it defers to.
          */}
          {r.countries.length > 1 && (
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              <span className="font-semibold text-stone-700">Covers:</span>{' '}
              {r.countries.join(' · ')}
            </p>
          )}
          <LastUpdated date={SITE_REVIEWED} className="mt-4" />
        </header>

        {/* Key facts */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FactCard
            icon={<GraduationCap className="w-5 h-5" />}
            label="Application platform"
            value={r.primaryApplicationPlatform}
          />
          <FactCard
            icon={<Calendar className="w-5 h-5" />}
            label="Intakes"
            value={r.intakes.join(' · ')}
          />
          <FactCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Tuition (USD/yr, undergrad)"
            value={
              r.averageTuitionRangeUsd
                ? `$${r.averageTuitionRangeUsd.undergrad[0].toLocaleString()}–$${r.averageTuitionRangeUsd.undergrad[1].toLocaleString()}`
                : '—'
            }
          />
          <FactCard
            icon={<Briefcase className="w-5 h-5" />}
            label="Student visa"
            value={r.visaName ?? 'N/A'}
          />
        </section>

        {/* How admission works for you — domestic vs international (India pilot) */}
        {r.slug === 'india' && (
          <section>
            <div className="mb-5">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
                How admission works for you
              </h2>
              <p className="text-stone-600 text-sm">
                Switch the <strong>Domestic / International</strong> toggle at the top of the page. Your
                route, eligibility and fees differ — always verify on the official source.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <AudienceGate audience="domestic" pageDefault={pageDefault}>
                <div className="rounded-2xl border border-stone-200 bg-white p-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700">
                    Domestic students · Indian citizens
                  </p>
                  <p className="m-0 text-sm leading-relaxed text-stone-700">
                    Indian citizens apply through the entrance exams each institution accepts — for most
                    engineering institutes that is JEE Main (and JEE Advanced for the IITs) followed by
                    centralised counselling such as JoSAA or CSAB; medicine runs through NEET and MCC or
                    state counselling; many universities now use CUET. Confirm the exact route,
                    eligibility, category provisions and fees on the official institute or counselling
                    website each year.
                  </p>
                </div>
              </AudienceGate>
              <AudienceGate audience="international" pageDefault={pageDefault}>
                <div className="rounded-2xl border border-stone-200 bg-white p-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700">
                    International students · foreign nationals, NRI / OCI
                  </p>
                  <p className="m-0 text-sm leading-relaxed text-stone-700">
                    Foreign nationals, PIO/OCI and many NRI applicants apply through a separate channel
                    with its own eligibility, seats and fees. For many centrally-funded technical
                    institutes (NITs, IIITs, SPAs and other CFTIs) this is the DASA (Direct Admission of
                    Students Abroad) scheme; some institutes offer supernumerary or international quotas,
                    and a student visa is required to study in India. Schemes, seat numbers and fees are
                    set afresh each year — verify on the official institute, DASA and Government of India
                    sources before applying.
                  </p>
                </div>
              </AudienceGate>
            </div>
          </section>
        )}

        {/* Home-student pointer — abroad LIGHT form (shows when a domestic student toggles on a non-India region) */}
        {r.slug !== 'india' && (
          <AudienceGate audience="domestic" pageDefault={pageDefault}>
            <section className="rounded-2xl border border-forest-200/70 bg-forest-50/60 p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-700">
                Home student of {r.displayName}?
              </p>
              <p className="m-0 text-sm leading-relaxed text-stone-700">
                GlobalStudyBoard is built for international students applying to {r.displayName}. If you
                are a citizen or resident, you usually apply as a domestic student — tuition is typically
                lower, you may qualify for home-student finance, and you do not need a student visa. We
                don&rsquo;t cover the domestic home-student route in depth; for fees, funding and the
                home-student application process, use the official {r.displayName} government and
                university sources
                {r.primaryApplicationPlatform
                  ? ` (for example ${r.primaryApplicationPlatform.split('/')[0].split('(')[0].trim()})`
                  : ''}
                .
              </p>
            </section>
          </AudienceGate>
        )}

        {/* Explore sections — region-scoped category pages */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {REGION_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={regionCategoryPath(r.slug, cat)}
                className="group flex items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white p-4 no-underline transition-colors hover:border-forest-300"
              >
                <span className="min-w-0">
                  <span className="block font-display text-base font-bold text-ink group-hover:text-forest-700">
                    {categoryLabel(cat, r.slug)}
                  </span>
                  <span className="text-xs text-stone-500">
                    {categoryCount[cat]} {categoryNoun(cat, r.slug)}
                  </span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-400 transition-colors group-hover:text-forest-700" />
              </Link>
            ))}
          </div>
        </section>

        {/* Universities */}
        {universities.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-7">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
                  Top universities
                </h2>
                <p className="text-stone-600 text-sm">
                  {universities.length} institution{universities.length === 1 ? '' : 's'} we cover in {r.displayName}.
                </p>
              </div>
              {universities.length > 6 && (
                <Link
                  href={regionCategoryPath(r.slug, 'universities')}
                  className="hidden shrink-0 items-center gap-1 text-sm font-medium text-forest-700 no-underline hover:text-forest-800 sm:inline-flex"
                >
                  See all {universities.length}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {universities.slice(0, 6).map((c) => (
                <article
                  key={c.id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-display text-lg font-bold text-ink leading-snug m-0">
                      <Link
                        href={`/colleges/${c.slug}`}
                        className="no-underline text-ink hover:text-forest-700 transition-colors"
                      >
                        {c.nameEn}
                      </Link>
                    </h3>
                    {c.ranking?.qs && (
                      <span className="text-[11px] font-semibold text-stone-500 shrink-0 mt-1">
                        QS #{c.ranking.qs}
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 text-xs mb-3">
                    {c.city}{c.state ? `, ${c.state}` : ''} · Est. {c.established}
                  </p>
                  <p className="text-stone-700 text-sm leading-relaxed mb-4 line-clamp-3">
                    {c.descriptionEn}
                  </p>
                  <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {c.admissionExams.slice(0, 2).map((e) => (
                        <span
                          key={e}
                          className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                    {c.websiteUrl && (
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-forest-700 hover:text-forest-800 inline-flex items-center gap-1 shrink-0"
                      >
                        Visit <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Exams */}
        {examsForRegion.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-7">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
                  Entrance exams
                </h2>
                <p className="text-stone-600 text-sm">
                  Standardised tests used by universities in {r.displayName}.
                </p>
              </div>
              {examsForRegion.length > 6 && (
                <Link
                  href={regionCategoryPath(r.slug, 'exams')}
                  className="hidden shrink-0 items-center gap-1 text-sm font-medium text-forest-700 no-underline hover:text-forest-800 sm:inline-flex"
                >
                  See all {examsForRegion.length}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {examsForRegion.slice(0, 6).map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.slug}`}
                  className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xl font-bold text-ink group-hover:text-forest-700 transition-colors">
                      {exam.shortName}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      {exam.domain.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mb-3">
                    {exam.fullName}
                  </p>
                  <div className="mt-auto pt-3 text-xs text-stone-500">
                    {exam.frequency.split('(')[0].trim()}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Explore by track — the region-shaped spine (region → track → hub → guide) */}
        {tracks.length > 0 && (
          <section>
            <div className="mb-7">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
                Explore {r.displayName} by track
              </h2>
              <p className="text-stone-600 text-sm">
                {tracks.length} curated tracks — pick a path, then go deep hub by hub.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.map((t) => {
                const hubs = topicsForTrack(t);
                const preview = hubs.slice(0, 4).map((h) => h.label).join(' · ');
                return (
                  <Link
                    key={t.slug}
                    href={trackHref(t)}
                    className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-5 no-underline transition-colors hover:border-forest-300"
                  >
                    <h3 className="font-display text-lg font-bold text-ink leading-snug mb-1 group-hover:text-forest-700 m-0">
                      {t.label}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed m-0 mt-1 flex-1 line-clamp-2">
                      {preview}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                      {isMultiHubTrack(t) ? `${hubs.length} topic hubs` : 'Explore'}
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Common questions — visible Q&A backing the FAQPage JSON-LD */}
        <section>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-6">
            Common questions about {r.displayName}
          </h2>
          <div className="flex flex-col gap-3">
            {faqItems.map((f) => (
              <AudienceGate key={f.q} audience={f.audience} pageDefault={pageDefault}>
                <details className="group rounded-2xl border border-stone-200 bg-white p-5 open:border-forest-300">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-lg font-bold text-ink">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-2xl leading-none text-stone-400 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="m-0 mt-3 text-base leading-relaxed text-stone-700">{f.a}</p>
                </details>
              </AudienceGate>
            ))}
          </div>
        </section>

        {/* Popular queries */}
        {r.popularQueries.length > 0 && (
          <section>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-4">
              Questions students ask
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {r.popularQueries.map((q) => (
                <Link
                  key={q}
                  href={`/gsb-ai?q=${encodeURIComponent(q)}`}
                  className="bg-cream-50 border border-stone-200 hover:border-terracotta-300 rounded-xl p-4 no-underline transition-colors group flex items-center justify-between gap-3"
                >
                  <span className="text-stone-700 text-sm group-hover:text-forest-700 transition-colors">
                    {q.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-forest-700 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-12 py-10">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial mb-3">
              Got a specific question about {r.displayName}?
            </h2>
            <p className="text-cream-50/85 mb-5 m-0">
              Ask GSB AI for tailored guidance on applications, scholarships, visa, or course choice.
            </p>
            <Link
              href={`/gsb-ai?region=${r.slug}`}
              className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
            >
              Ask GSB AI →
            </Link>
          </div>
        </section>

        {/* Other regions */}
        <section>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-4">
            Compare with other regions
          </p>
          <div className="flex flex-wrap gap-2">
            {REGIONS_ALPHABETICAL.filter((other) => other.slug !== r.slug).map((other) => (
              <Link
                key={other.slug}
                href={`/regions/${other.slug}`}
                className="bg-white border border-stone-200 hover:border-forest-300 hover:text-forest-700 text-stone-700 text-sm px-3.5 py-1.5 rounded-full no-underline transition-colors inline-flex items-center gap-2"
              >
                <RegionFlag slug={other.slug} className="h-3.5" />
                {other.displayName}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function FactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className="text-forest-700 mb-2">{icon}</div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
        {label}
      </p>
      <p className="text-stone-800 text-sm font-medium leading-snug m-0">{value}</p>
    </div>
  );
}
