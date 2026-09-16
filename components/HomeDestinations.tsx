import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import { REGION_CATEGORIES, categoryLabel, regionCategoryPath } from '@/lib/region-nav';
import { tracksForRegion, trackHref } from '@/lib/tracks';
import { getGuideBySlug } from '@/lib/guides';
import RegionFlag from '@/components/RegionFlag';

/**
 * Server-rendered directory of ALL nine destinations for the home page.
 *
 * The home page's other sections re-tune to the visitor's destination on the
 * client, which is right for a student — but a crawler has no cookie, so the
 * crawlable home page used to be an India page: its only in-content links were
 * four IITs, six Indian exams and the India hub, and the destination grid was
 * nine <button>s with no href. This block is destination-neutral, fully in the
 * server HTML, and hands every destination the same set of links: its hub, its
 * four section pages, its top tracks and two flagship guides. It also gives the
 * eight abroad hubs their only home-page links.
 *
 * Server component on purpose — it reads lib/tracks + lib/guides, which must
 * never reach the client bundle (see the client-bundle guard in CLAUDE.md).
 * It deliberately does NOT repeat each destination's tagline: the "Where do you
 * want to study?" grid above already carries it, so this block is the depth
 * (sections, tracks, guides) rather than a second copy of the same nine cards.
 */
export default function HomeDestinations() {
  return (
    <section aria-labelledby="explore-destinations-heading">
      <div className="mb-7">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Explore by destination
        </p>
        <h2
          id="explore-destinations-heading"
          className="m-0 font-display text-3xl md:text-4xl font-bold tracking-editorial text-ink"
        >
          Nine study destinations, one standard.
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-stone-600">
          Universities, entrance exams, scholarships and official student-visa facts for each
          destination — every page linked to its official source.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REGIONS_ALPHABETICAL.map((r) => {
          const tracks = tracksForRegion(r.slug).slice(0, 4);
          const flagship = r.popularQueries
            .map((q) => getGuideBySlug(q))
            .filter((g): g is NonNullable<typeof g> => Boolean(g))
            .slice(0, 2);
          return (
            <article
              key={r.slug}
              className="rounded-2xl border border-stone-200 bg-white p-5 flex flex-col"
            >
              <div className="mb-2 flex items-center gap-2">
                <RegionFlag slug={r.slug} className="h-5" />
                <h3 className="m-0 font-display text-lg font-bold leading-snug text-ink">
                  <Link href={`/regions/${r.slug}`} className="no-underline hover:text-forest-700">
                    Study in {r.proseName}
                  </Link>
                </h3>
              </div>

              <ul className="m-0 mb-3 flex flex-wrap gap-1.5 list-none p-0">
                {REGION_CATEGORIES.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={regionCategoryPath(r.slug, cat)}
                      className="inline-flex rounded-full border border-stone-200 bg-cream-50 px-2.5 py-1 text-xs font-semibold text-stone-700 no-underline hover:border-forest-300 hover:text-forest-700"
                    >
                      {categoryLabel(cat, r.slug)}
                    </Link>
                  </li>
                ))}
              </ul>

              {tracks.length > 0 && (
                <ul className="m-0 mb-3 list-none p-0 space-y-1 text-sm">
                  {tracks.map((t) => (
                    <li key={t.slug}>
                      <Link href={trackHref(t)} className="text-forest-700 no-underline hover:underline">
                        {t.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {flagship.length > 0 && (
                <ul className="m-0 mt-auto list-none p-0 space-y-1 border-t border-stone-100 pt-3 text-sm">
                  {flagship.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/guides/${g.slug}`}
                        className="inline-flex items-start gap-1 text-stone-700 no-underline hover:text-forest-700"
                      >
                        <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
                        <span>{g.titleEn}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
