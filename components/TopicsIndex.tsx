'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { RegionSlug } from '@/lib/regions';
import { getRegionBySlug } from '@/lib/regions';
import { tracksForRegion, trackForTopic } from '@/lib/tracks';
import { useRegion } from '@/components/RegionProvider';

export interface TopicCard {
  slug: string;
  label: string;
  title: string;
  description: string;
  /** Region this hub is gated to, or null for India/domestic hubs. */
  region: RegionSlug | null;
  count: number;
}

/**
 * Client-side renderer for the /topics index — the region-first Track spine.
 * Shows ONLY the effective destination's tracks; each hub appears once, under
 * its primary track (so cross-listed hubs like JEE are not repeated). Switching
 * destination re-tunes the whole index.
 */
export default function TopicsIndex({ topics }: { topics: TopicCard[] }) {
  const { effectiveRegion } = useRegion();
  const cardBySlug = new Map(topics.map((t) => [t.slug, t]));
  const tracks = tracksForRegion(effectiveRegion);
  const regionName = getRegionBySlug(effectiveRegion)?.displayName ?? '';

  return (
    <div className="space-y-14">
      <p className="text-stone-500 text-sm -mt-6">
        Showing tracks for <span className="font-semibold text-stone-700">{regionName}</span>. Switch
        your destination above to explore another region.
      </p>

      {tracks.map((track) => {
        // Each hub renders once, under the track that is its primary home.
        const cards = track.topicSlugs
          .filter((slug) => trackForTopic(slug)?.slug === track.slug)
          .map((slug) => cardBySlug.get(slug))
          .filter((c): c is TopicCard => Boolean(c));
        if (cards.length === 0) return null;
        return (
          <section key={track.slug}>
            <div className="section-rule mb-5">
              <span>{track.label}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
                >
                  <h2 className="font-display text-lg font-bold tracking-editorial text-ink leading-snug mb-2 group-hover:text-forest-700">
                    {t.title}
                  </h2>
                  <p className="text-stone-600 text-sm leading-relaxed m-0 flex-1">{t.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                    {t.count} guide{t.count === 1 ? '' : 's'} <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
