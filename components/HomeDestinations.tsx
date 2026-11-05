import Link from 'next/link';
import { ArrowUpRight, Minus, Plus } from 'lucide-react';

import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import { REGION_CATEGORIES, categoryLabel, regionCategoryPath } from '@/lib/region-nav';
import { tracksForRegion, trackHref } from '@/lib/tracks';
import { getGuideBySlug } from '@/lib/guides';
import { HOME_SECTIONS_UI } from '@/lib/home-sections-ui';
import RegionFlag from '@/components/RegionFlag';

/**
 * A destination-neutral server directory. Native details keep the lower page
 * quiet while every hub, category, track and flagship-guide link remains in
 * the crawlable HTML. Each column flows independently when a group is opened.
 * No catalogue or accordion code is added to the client bundle.
 */
export default function HomeDestinations() {
  const columnSize = Math.ceil(REGIONS_ALPHABETICAL.length / 3);
  const columns = Array.from({ length: 3 }, (_, index) =>
    REGIONS_ALPHABETICAL.slice(index * columnSize, (index + 1) * columnSize),
  ).filter((column) => column.length > 0);

  return (
    <section aria-labelledby="explore-destinations-heading" className="border-t border-stone-200 pt-10 sm:pt-12">
      <div className="mb-7 max-w-3xl sm:mb-9">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">
          {HOME_SECTIONS_UI.directoryEyebrow}
        </p>
        <h2 id="explore-destinations-heading" className="m-0 font-display text-3xl font-bold leading-tight tracking-editorial text-ink sm:text-4xl">
          {HOME_SECTIONS_UI.directoryHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
          {HOME_SECTIONS_UI.directoryDescription}
        </p>
      </div>

      <div className="grid gap-x-8 lg:grid-cols-3">
        {columns.map((column) => (
          <div key={column[0].slug}>
            {column.map((r) => {
              const tracks = tracksForRegion(r.slug).slice(0, 4);
              const flagship = r.popularQueries
                .map((q) => getGuideBySlug(q))
                .filter((g): g is NonNullable<typeof g> => Boolean(g))
                .slice(0, 2);
              return (
                <details key={r.slug} className="group border-b border-stone-200">
                  <summary className="flex min-h-20 cursor-pointer list-none items-center gap-3 py-5 focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                    <RegionFlag slug={r.slug} className="h-5 shrink-0" />
                    <h3 className="m-0 flex-1 font-display text-xl font-semibold leading-snug text-ink">
                      {r.displayName}
                    </h3>
                    <Plus className="h-4 w-4 shrink-0 text-forest-700 group-open:hidden" aria-hidden="true" />
                    <Minus className="hidden h-4 w-4 shrink-0 text-forest-700 group-open:block" aria-hidden="true" />
                  </summary>

                  <div className="pb-6">
                    <Link href={`/regions/${r.slug}`} className="mb-4 inline-flex min-h-10 items-center gap-2 text-base font-semibold text-forest-800 no-underline hover:underline">
                      {HOME_SECTIONS_UI.destinationOverview}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <ul className="m-0 mb-5 flex list-none flex-wrap gap-2 p-0">
                      {REGION_CATEGORIES.map((cat) => (
                        <li key={cat}>
                          <Link href={regionCategoryPath(r.slug, cat)} className="inline-flex min-h-10 items-center rounded-full border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 no-underline transition-colors hover:border-forest-400 hover:text-forest-800">
                            {categoryLabel(cat, r.slug)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {tracks.length > 0 && (
                      <ul className="m-0 mb-5 list-none space-y-3 p-0 text-base leading-relaxed">
                        {tracks.map((t) => (
                          <li key={t.slug}>
                            <Link href={trackHref(t)} className="text-forest-800 no-underline underline-offset-4 hover:underline">
                              {t.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {flagship.length > 0 && (
                      <ul className="m-0 list-none space-y-3 border-t border-stone-200 p-0 pt-4 text-base leading-relaxed">
                        {flagship.map((g) => (
                          <li key={g.slug}>
                            <Link href={`/guides/${g.slug}`} className="flex items-start gap-2 text-stone-700 no-underline underline-offset-4 hover:text-forest-800 hover:underline">
                              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />
                              <span>{g.titleEn}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
