import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Calendar, DollarSign, GraduationCap, Globe2, Briefcase } from 'lucide-react';

import {
  REGIONS_ALPHABETICAL,
  getRegionBySlug,
  matchesRegion,
  REGION_SLUGS,
  type RegionSlug,
} from '@/lib/regions';
import { COLLEGES } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import RegionRail from '@/components/RegionRail';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

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
  const desc = `${r.educationSystemSummary.slice(0, 155)}…`;
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
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Study in ${r.displayName} — Universities, Exams & Scholarships`,
      description: desc,
      images: ['/opengraph-image'],
    },
  };
}

export default async function RegionHubPage({ params }: Props) {
  const { region } = await params;
  const r = getRegionBySlug(region);
  if (!r) notFound();

  const universities = COLLEGES.filter((c) => matchesRegion(r.slug, c.region, c.regions));
  const examsForRegion = ENTRANCE_EXAMS.filter((e) => matchesRegion(r.slug, e.region, e.regions));

  return (
    <div className="-mx-4 md:-mx-0">
      <RegionRail activeSlug={r.slug as RegionSlug} sticky />

      <div className="mx-auto max-w-7xl px-4 md:px-0 space-y-14 mt-10">

        {/* Hero */}
        <header className="max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <span aria-hidden="true" className="text-5xl leading-none">{r.flag}</span>
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {universities.map((c) => (
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
            <div className="mb-7">
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
                Entrance exams
              </h2>
              <p className="text-stone-600 text-sm">
                Standardised tests used by universities in {r.displayName}.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {examsForRegion.map((exam) => (
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

        {/* Visa & work info */}
        <section className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <Globe2 className="w-6 h-6 text-forest-700 shrink-0 mt-1" />
            <div>
              <h2 className="font-display text-2xl font-bold tracking-editorial text-ink mb-3">
                Working while studying
              </h2>
              <p className="text-stone-700 text-base leading-relaxed m-0">
                {r.worksWhileStudying}
              </p>
            </div>
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
                <span aria-hidden="true">{other.flag}</span>
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
