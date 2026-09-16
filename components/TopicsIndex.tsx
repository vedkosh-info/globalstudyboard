'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { RegionSlug } from '@/lib/regions';
import { getRegionBySlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';

export interface TopicCard {
  slug: string;
  label: string;
  title: string;
  description: string;
  count: number;
}

export interface TrackSection {
  slug: string;
  label: string;
  /** Track landing page (multi-hub) or the single hub. */
  href: string;
  cards: TopicCard[];
}

export interface RegionSection {
  region: RegionSlug;
  tracks: TrackSection[];
}

/**
 * The /topics index — the region-first Track spine for ALL nine destinations.
 *
 * Every destination's tracks and hubs are in the server HTML (this component
 * receives a fully computed, serialisable projection from the server page, so
 * lib/tracks and lib/topics stay out of the client bundle). The visitor's
 * destination is ordered first and expanded; the other eight are collapsed
 * <details> sections — still crawlable, still linked. Before this, the index
 * rendered ONLY the effective destination's tracks, so the 318 abroad hubs were
 * absent from the crawlable and rendered DOM (present only in JSON-LD), which is
 * exactly the set Search Console listed as "Discovered / Crawled – currently
 * not indexed".
 */
export default function TopicsIndex({ sections }: { sections: RegionSection[] }) {
  const { effectiveRegion } = useRegion();
  const ordered = [
    ...sections.filter((s) => s.region === effectiveRegion),
    ...sections.filter((s) => s.region !== effectiveRegion),
  ];

  return (
    <div className="space-y-10">
      {ordered.map((section) => {
        const r = getRegionBySlug(section.region);
        const isCurrent = section.region === effectiveRegion;
        const hubCount = section.tracks.reduce((n, t) => n + t.cards.length, 0);
        return (
          <details
            key={section.region}
            open={isCurrent}
            className="group rounded-3xl border border-stone-200 bg-cream-50/60 open:bg-white"
          >
            <summary className="flex cursor-pointer list-none flex-col items-start gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-7 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <RegionFlag slug={section.region} className="h-5 shrink-0" />
                <h2 className="m-0 inline min-w-0 font-display text-xl font-bold tracking-editorial text-ink sm:text-2xl">
                  {r ? `Topics for ${r.proseName}` : section.region}
                </h2>
                {isCurrent && (
                  <span className="whitespace-nowrap rounded-full bg-forest-700 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cream-50">
                    Your destination
                  </span>
                )}
              </span>
              <span className="shrink-0 whitespace-nowrap text-xs font-semibold text-stone-500">
                {section.tracks.length} tracks · {hubCount} hubs
                <span className="ml-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
                  ›
                </span>
              </span>
            </summary>

            <div className="space-y-12 px-5 pb-7 pt-2 sm:px-7">
              {section.tracks.map((track) => (
                <section key={track.slug} aria-label={track.label}>
                  <div className="section-rule mb-5">
                    <h3 className="m-0 font-sans text-[length:inherit] font-semibold leading-[inherit] tracking-[inherit] text-inherit">
                      <Link href={track.href} className="no-underline hover:text-forest-700">
                        {track.label}
                      </Link>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {track.cards.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/topics/${t.slug}`}
                        className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group/card flex flex-col"
                      >
                        <h4 className="font-display text-lg font-bold tracking-editorial text-ink leading-snug mb-2 group-hover/card:text-forest-700">
                          {t.title}
                        </h4>
                        <p className="text-stone-600 text-sm leading-relaxed m-0 flex-1">{t.description}</p>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                          {t.count} guide{t.count === 1 ? '' : 's'} <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
