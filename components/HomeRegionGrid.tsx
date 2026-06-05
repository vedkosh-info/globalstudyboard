'use client';

import { useRouter } from 'next/navigation';
import { ArrowUpRight, Check, MapPin } from 'lucide-react';

import {
  REGIONS,
  PRIMARY_REGION_SLUGS,
  REGION_TAGLINES,
  type RegionSlug,
} from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

// Primary targets first, then the rest — India & core markets up top.
const ORDERED_REGIONS = [
  ...PRIMARY_REGION_SLUGS,
  ...REGIONS.map((r) => r.slug).filter((s) => !PRIMARY_REGION_SLUGS.includes(s)),
]
  .map((slug) => REGIONS.find((r) => r.slug === slug))
  .filter((r): r is NonNullable<typeof r> => Boolean(r));

/**
 * The single destination browser on the Home page. Choosing a region tunes the
 * whole site to it and takes the student to that region's hub. Replaces the old
 * duplicated hero pills + "Browse by region" rail with one premium grid.
 */
export default function HomeRegionGrid() {
  const { region, setRegion } = useRegion();
  const router = useRouter();

  const choose = (slug: RegionSlug) => {
    setRegion(slug);
    router.push(`/regions/${slug}`);
  };

  return (
    <section id="destinations" className="scroll-mt-28">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
            <MapPin className="h-3.5 w-3.5 text-forest-700" />
            {region ? 'Explore another destination' : 'Choose your destination'}
          </p>
          <h2 className="m-0 font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink">
            {region ? 'Switch where you’re headed.' : 'Where do you want to study?'}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-stone-600">
            Pick a destination and the whole site retunes to it — universities, entrance exams,
            scholarships, costs and visas. You can change it anytime.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ORDERED_REGIONS.map((r) => {
          const selected = r.slug === region;
          return (
            <button
              key={r.slug}
              type="button"
              onClick={() => choose(r.slug)}
              aria-pressed={selected}
              className={`group relative flex flex-col text-left rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                selected
                  ? 'border-forest-400 bg-forest-50 ring-1 ring-forest-300'
                  : 'border-stone-200 bg-white hover:border-forest-300'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span aria-hidden="true" className="text-3xl leading-none">
                  {r.flag}
                </span>
                {selected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream-50">
                    <Check className="h-3 w-3" /> Tuned
                  </span>
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-stone-300 transition-all group-hover:translate-x-0.5 group-hover:text-forest-600" />
                )}
              </div>
              <h3 className="m-0 font-display text-lg font-bold leading-snug text-ink group-hover:text-forest-700">
                {r.displayName}
              </h3>
              <p className="mt-1 mb-0 text-sm leading-relaxed text-stone-600">
                {REGION_TAGLINES[r.slug]}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
