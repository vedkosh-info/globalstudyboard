'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getRegionBySlug, matchesRegion } from '@/lib/regions';
import { COLLEGES } from '@/lib/colleges';
import { useRegion } from '@/components/RegionProvider';

/** Compact exam summary passed from the server so the full exam catalogue never
 * ships to the browser (keeps the home First-Load JS small). */
export interface ExamLite {
  slug: string;
  shortName: string;
  descriptionEn: string;
  domain: string;
  frequency: string;
}

/**
 * The region-tuned heart of the home page: top universities and key tests for
 * the destination the visitor is currently exploring (their chosen region, or
 * the region of the page they arrived on, or India by default). Re-renders
 * instantly when the destination changes via the picker or header switcher.
 */
export default function HomeSpotlight({ examsBySlug }: { examsBySlug: Record<string, ExamLite> }) {
  const { effectiveRegion } = useRegion();
  const r = getRegionBySlug(effectiveRegion);
  if (!r) return null;

  const universities = [...COLLEGES.filter((c) => matchesRegion(r.slug, c.region, c.regions))]
    .sort((a, b) => (a.ranking?.qs ?? 9999) - (b.ranking?.qs ?? 9999))
    .slice(0, 4);

  const exams = r.keyExamSlugs
    .map((s) => examsBySlug[s])
    .filter((e): e is ExamLite => Boolean(e))
    .slice(0, 6);

  const applyVia = r.primaryApplicationPlatform.split('/')[0].split('(')[0].trim();

  return (
    <>
      {/* Top universities for the chosen destination */}
      {universities.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
                Top universities in {r.displayName}
              </h2>
              <p className="text-stone-600 text-sm">
                The most-searched institutions for your destination — open any for programs, fees and
                how to apply.
              </p>
            </div>
            <Link
              href={`/regions/${r.slug}`}
              className="hidden sm:inline-flex items-center gap-1 text-sm text-forest-700 hover:text-forest-800 font-medium no-underline shrink-0"
            >
              All {r.displayName} universities <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {universities.map((college) => (
              <Link
                key={college.id}
                href={`/colleges/${college.slug}`}
                className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 hover:shadow-sm transition-all group flex flex-col"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span aria-hidden="true" className="text-lg">
                    {r.flag}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 truncate">
                    {college.city}
                    {college.state ? `, ${college.state}` : ''}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-ink group-hover:text-forest-700 transition-colors leading-snug mb-1">
                  {college.nameEn}
                </h3>
                <p className="text-stone-500 text-xs mb-3">Est. {college.established}</p>
                {college.ranking?.qs && (
                  <p className="text-xs text-stone-500 mt-auto">QS World Ranking #{college.ranking.qs}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Key tests for the chosen destination */}
      {exams.length > 0 && (
        <section id="exams">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink mb-1">
                Key tests for {r.displayName}
              </h2>
              <p className="text-stone-600 text-sm">
                The entrance and admissions tests that matter for studying in {r.displayName}.
              </p>
            </div>
            <Link
              href="/exams"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-forest-700 hover:text-forest-800 font-medium no-underline shrink-0"
            >
              All exams <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <Link
                key={exam.slug}
                href={`/exams/${exam.slug}`}
                className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
              >
                <span className="font-display text-xl font-bold text-ink group-hover:text-forest-700 transition-colors mb-2">
                  {exam.shortName}
                </span>
                <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-3">
                  {exam.descriptionEn}
                </p>
                <div className="mt-auto pt-3 text-xs text-stone-500 capitalize">
                  {exam.domain.replace('-', ' ')}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Plan your application — region facts + hub CTA */}
      <section className="rounded-3xl border border-stone-200 bg-cream-100 px-6 sm:px-10 py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-2">
              Planning to study in {r.displayName}?
            </h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              Apply via {applyVia} · main intake {r.intakes[0]} ·{' '}
              {r.visaName ?? 'no student visa needed'}. Get the full step-by-step playbook for your
              destination.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href={`/regions/${r.slug}`}
              className="inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
            >
              The {r.displayName} playbook <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/guides"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-semibold px-6 py-3 rounded-full no-underline transition-colors border border-stone-300"
            >
              {r.displayName} guides
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
