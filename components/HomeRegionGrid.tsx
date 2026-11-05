'use client';

import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';

import { REGIONS_ALPHABETICAL, type RegionSlug } from '@/lib/regions';
import { HOME_SECTIONS_UI } from '@/lib/home-sections-ui';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';

/** Crawlable destination browsing, using the header's shared preference engine. */
export default function HomeRegionGrid() {
  const { region, effectiveRegion, setRegion } = useRegion();
  const choose = (slug: RegionSlug) => setRegion(slug);

  return (
    <section id="destinations" aria-labelledby="home-destinations-heading" className="scroll-mt-2">
      <div className="mb-7 max-w-3xl sm:mb-9">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">
          {region ? HOME_SECTIONS_UI.destinationChosenEyebrow : HOME_SECTIONS_UI.destinationEyebrow}
        </p>
        <h2 id="home-destinations-heading" className="m-0 font-display text-3xl font-bold leading-tight tracking-editorial text-ink sm:text-4xl">
          {region ? HOME_SECTIONS_UI.destinationChosenHeading : HOME_SECTIONS_UI.destinationHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
          {HOME_SECTIONS_UI.destinationDescription}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REGIONS_ALPHABETICAL.map((r) => {
          const selected = r.slug === effectiveRegion;
          return (
            <Link
              key={r.slug}
              href={`/regions/${r.slug}`}
              onClick={() => choose(r.slug)}
              aria-current={selected ? 'true' : undefined}
              className={`group flex min-h-24 items-center gap-4 rounded-2xl border px-5 py-5 text-left no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2 ${
                selected
                  ? 'border-forest-300 bg-forest-50'
                  : 'border-stone-200 bg-white hover:border-forest-400 hover:bg-cream-50'
              }`}
            >
              <RegionFlag slug={r.slug} className="h-6 shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="m-0 font-display text-xl font-semibold leading-snug text-ink group-hover:text-forest-700">
                  {r.displayName}
                </h3>
                {selected && (
                  <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700">
                    <Check className="h-3 w-3" aria-hidden="true" />{HOME_SECTIONS_UI.selected}
                  </span>
                )}
              </div>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-forest-700" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
