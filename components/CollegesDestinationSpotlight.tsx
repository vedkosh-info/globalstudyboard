'use client';

import Link from 'next/link';
import { ArrowUpRight, Compass } from 'lucide-react';

import { getRegionBySlug } from '@/lib/regions';
import { COLLEGES } from '@/lib/colleges';
import { useRegion } from '@/components/RegionProvider';

/**
 * Universities-page spotlight: when a destination is chosen, lead with the top
 * universities for it before the full worldwide list. Renders nothing until a
 * destination is selected, so the page is unchanged for first-time visitors.
 */
export default function CollegesDestinationSpotlight() {
  const { region, ready } = useRegion();
  if (!ready || !region) return null;

  const r = getRegionBySlug(region);
  if (!r) return null;

  const universities = [...COLLEGES.filter((c) => c.region === r.slug)]
    .sort((a, b) => (a.ranking?.qs ?? 9999) - (b.ranking?.qs ?? 9999))
    .slice(0, 6);

  if (universities.length === 0) return null;

  return (
    <section
      aria-label={`Universities for studying in ${r.displayName}`}
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
          Top universities in {r.displayName}.
        </h2>
        <p className="mb-6 max-w-2xl text-sm text-stone-600">
          The institutions we cover for your destination. The full worldwide list is below if
          you&rsquo;re comparing options.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {universities.map((c) => (
            <Link
              key={c.id}
              href={`/colleges/${c.slug}`}
              className="group flex flex-col rounded-2xl border border-stone-200 bg-white/80 p-4 no-underline transition-colors hover:border-forest-300"
            >
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <span className="font-display text-base font-bold leading-snug text-ink group-hover:text-forest-700">
                  {c.nameEn}
                </span>
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-stone-400 group-hover:text-forest-700" />
              </div>
              <p className="m-0 text-xs leading-relaxed text-stone-500">
                {c.city}{c.state ? `, ${c.state}` : ''}
              </p>
              {c.ranking?.qs && (
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-forest-50 px-2.5 py-1 text-[11px] font-semibold text-forest-700">
                  QS #{c.ranking.qs}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
