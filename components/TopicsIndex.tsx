'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { TOPIC_GROUP_LABELS, type TopicGroup } from '@/lib/topics';
import type { RegionSlug } from '@/lib/regions';
import { getRegionBySlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

export interface TopicCard {
  slug: string;
  label: string;
  title: string;
  description: string;
  group: TopicGroup;
  /** Region this hub is gated to, or null for always-shown (India/global) hubs. */
  region: RegionSlug | null;
  count: number;
}

const GROUP_ORDER: TopicGroup[] = [
  'exams',
  'fields',
  'after-12th',
  'study-abroad',
  'study-in-usa',
  'study-in-canada',
  'prep-funding',
];

/**
 * Client-side renderer for the /topics index. Region-gated hubs (e.g. the USA
 * `study-in-usa` group) appear ONLY when their region is the effective
 * selection; region-less hubs are always shown. Mirrors the guide-card
 * region filtering in GuidesView so the two surfaces behave identically.
 */
export default function TopicsIndex({ topics }: { topics: TopicCard[] }) {
  const { effectiveRegion } = useRegion();
  const visible = topics.filter((t) => !t.region || t.region === effectiveRegion);
  const regionName = getRegionBySlug(effectiveRegion)?.displayName ?? '';

  return (
    <div className="space-y-14">
      {GROUP_ORDER.map((group) => {
        const inGroup = visible.filter((t) => t.group === group);
        if (inGroup.length === 0) return null;
        const isRegionGroup = inGroup.some((t) => t.region);
        return (
          <section key={group}>
            <div className="section-rule mb-5">
              <span>{TOPIC_GROUP_LABELS[group]}</span>
            </div>
            {isRegionGroup && regionName ? (
              <p className="text-stone-500 text-sm -mt-3 mb-5">
                Hubs for students heading to {regionName}. Switch your destination above to see other regions.
              </p>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inGroup.map((t) => (
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
