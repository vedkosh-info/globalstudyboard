'use client';

import Link from 'next/link';
import { ArrowUpRight, Compass } from 'lucide-react';

import { getRegionBySlug } from '@/lib/regions';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { useRegion } from '@/components/RegionProvider';

/**
 * Exams-page spotlight: when a destination is chosen, lead with the exams that
 * actually matter for it before the full worldwide list. Renders nothing until
 * a destination is selected.
 */
export default function ExamsDestinationSpotlight() {
  const { region, ready } = useRegion();
  if (!ready || !region) return null;

  const r = getRegionBySlug(region);
  if (!r) return null;

  const exams = r.keyExamSlugs
    .map((slug) => ENTRANCE_EXAMS.find((e) => e.slug === slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  if (exams.length === 0) return null;

  return (
    <section
      aria-label={`Exams for studying in ${r.displayName}`}
      className="relative overflow-hidden rounded-3xl border border-forest-200/70 bg-gradient-to-br from-cream-50 via-white to-forest-50/60 p-6 sm:p-8"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-forest-200/30 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex items-center gap-2">
          <Compass className="h-4 w-4 text-forest-700" />
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-forest-700">
            <span aria-hidden="true">{r.flag}</span> Tuned to {r.displayName}
          </p>
        </div>
        <h2 className="mb-1.5 font-display text-2xl font-bold tracking-editorial text-ink md:text-3xl">
          The exams you&rsquo;ll need for {r.displayName}.
        </h2>
        <p className="mb-6 max-w-2xl text-sm text-stone-600">
          These are the tests that gate admission for your destination. The full worldwide list is
          below if you&rsquo;re comparing options.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <Link
              key={e.id}
              href={`/exams/${e.slug}`}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white/80 p-4 no-underline transition-colors hover:border-forest-300"
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-ink group-hover:text-forest-700">
                  {e.shortName}
                </span>
                <ArrowUpRight className="h-4 w-4 text-stone-400 group-hover:text-forest-700" />
              </div>
              <p className="m-0 line-clamp-2 text-xs leading-relaxed text-stone-600">{e.fullName}</p>
              <span className="mt-3 text-[11px] font-medium capitalize text-stone-500">
                {e.domain.replace('-', ' ')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
