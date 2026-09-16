import Link from 'next/link';

import { DEFAULT_REGION, getRegionBySlug, matchesRegion, type RegionSlug } from '@/lib/regions';
import { tracksForRegion, trackHref, topicsForTrack } from '@/lib/tracks';
import { guidesForTopic } from '@/lib/topic-guides';
import { getGuideBySlug } from '@/lib/guides';

interface PageQuickLinksProps {
  /** Current page path — filtered out of the guide list. */
  currentPath?: string;
  /**
   * The page's own destination. Drives which tracks and guides are offered; a
   * 'global' unit (a worldwide test) falls back to the default destination.
   */
  region?: RegionSlug | 'global';
  /**
   * Hub slugs the page belongs to (a guide's topics). Their guides are the
   * "popular guides" offered; when absent, the region's flagship guides are.
   */
  hubSlugs?: string[];
}

const MAX_TRACKS = 8;
const MAX_GUIDES = 8;

/**
 * "Quick links" strip at the foot of guide, college and exam pages.
 *
 * Region-aware, server-rendered. It used to hard-code nine India hubs and
 * eight India guides onto all ~2,900 content pages — on a Harvard or Tokyo page
 * that India boilerplate outnumbered the contextual links three to one. Now the
 * tracks are the page's own destination's, and the guides come from the page's
 * own hubs (falling back to the destination's flagship guides). Server component
 * on purpose: lib/tracks and lib/guides must never reach the client bundle.
 */
export default function PageQuickLinks({ currentPath, region, hubSlugs = [] }: PageQuickLinksProps) {
  const regionSlug: RegionSlug = region && region !== 'global' ? region : DEFAULT_REGION;
  const r = getRegionBySlug(regionSlug);

  const tracks = tracksForRegion(regionSlug)
    .filter((t) => topicsForTrack(t).length > 0)
    .slice(0, MAX_TRACKS)
    .map((t) => ({ slug: t.slug, label: t.label, href: trackHref(t) }));

  const seen = new Set<string>();
  const guides: { slug: string; title: string }[] = [];
  const push = (slug: string, title: string) => {
    if (seen.has(slug) || `/guides/${slug}` === currentPath || guides.length >= MAX_GUIDES) return;
    seen.add(slug);
    guides.push({ slug, title });
  };
  // Hub guides first — but only those relevant to the page's own destination
  // (a UK visa guide sits in a destination-neutral "study abroad" hub whose
  // members include USA and Canada guides; those belong on the USA/Canada pages).
  for (const hub of hubSlugs) {
    for (const g of guidesForTopic(hub)) {
      if (matchesRegion(regionSlug, g.region, g.regions)) push(g.slug, g.titleEn);
    }
    if (guides.length >= MAX_GUIDES) break;
  }
  if (guides.length < MAX_GUIDES && r) {
    for (const q of r.popularQueries) {
      const g = getGuideBySlug(q);
      if (g) push(g.slug, g.titleEn);
    }
  }

  if (tracks.length === 0 && guides.length === 0) return null;

  return (
    <div className="no-print mt-10 space-y-3">
      {tracks.length > 0 && (
        <section
          aria-label={`Popular topics for ${r?.proseName ?? 'this destination'}`}
          className="rounded-2xl border border-forest-200 bg-forest-50 px-5 py-4"
        >
          <p className="m-0 mb-3 text-xs font-bold uppercase tracking-[0.12em] text-forest-900">
            Popular topics · {r?.displayName}
          </p>
          <div className="flex flex-wrap gap-2">
            {tracks.map((t) => (
              <Link
                key={t.slug}
                href={t.href}
                className="whitespace-nowrap rounded-full border border-forest-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-forest-900 no-underline transition-colors hover:border-forest-400"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {guides.length > 0 && (
        <section
          aria-label="Popular guides"
          className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-amber-900">
              Popular guides
            </p>
            <Link
              href={`/regions/${regionSlug}/guides`}
              className="whitespace-nowrap text-xs font-bold text-forest-900 no-underline hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="rounded-full border border-amber-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-amber-900 no-underline transition-colors hover:border-amber-400"
              >
                {g.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
