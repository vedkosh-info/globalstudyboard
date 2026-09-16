import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { REGION_CATEGORIES, categoryLabel, regionCategoryPath } from '@/lib/region-nav';
import RegionFlag from '@/components/RegionFlag';
import { gsbAiHref } from '@/lib/gsb-ai-links';

/**
 * "Continue exploring {Region}" strip for content detail pages. It uses the
 * page's OWN destination (e.g. `guide.region`) — not the visitor's cookie — so it
 * is server-rendered, always correct in the HTML, and ties each piece of content
 * back to its destination hub. This closes a real internal-linking gap (detail
 * pages previously had no link back to their region) and reinforces the
 * region-first experience, and links straight into the region's own category
 * pages (universities, exams, guides, scholarships) plus the destination hub.
 */
export default function RegionExplore({ region }: { region: RegionSlug }) {
  const r = getRegionBySlug(region);
  if (!r) return null;

  return (
    <section className="rounded-2xl border border-forest-200/70 bg-forest-50/60 p-6">
      <p className="m-0 mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-forest-700">
        <RegionFlag slug={r.slug} className="h-4" />
        Studying in {r.proseName}
      </p>
      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-editorial text-ink mb-2">
        Continue exploring {r.proseName}
      </h2>
      <p className="text-stone-600 text-sm leading-relaxed mb-4 max-w-2xl">
        Universities, entrance tests, costs and visa facts for {r.proseName} — all in one place,
        each linked to its official source.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {REGION_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={regionCategoryPath(r.slug, cat)}
            prefetch={false}
            className="inline-flex items-center rounded-full border border-forest-300 bg-white px-3 py-1.5 text-sm font-medium text-forest-700 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50"
          >
            {categoryLabel(cat, r.slug)}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/regions/${r.slug}`}
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-cream-50 no-underline transition-colors hover:bg-forest-800"
        >
          Explore {r.proseName}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href={gsbAiHref({ region: r.slug })}
          className="inline-flex items-center gap-2 rounded-full border border-forest-300 bg-white px-5 py-2.5 text-sm font-semibold text-forest-700 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50"
        >
          Ask GSB AI about {r.proseName}
        </Link>
      </div>
    </section>
  );
}
