'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import RegionFilterBar from '@/components/RegionFilterBar';
import RegionFlag from '@/components/RegionFlag';

export interface GuideCard {
  slug: string;
  titleEn: string;
  descriptionEn: string;
  readMinutes: number;
  /** Topic category key — used to group within the list. */
  category: string;
  /** Primary home region. */
  region: RegionSlug;
  /** Every region this guide displays under (resolved server-side). */
  regions: RegionSlug[];
}

function GuideLink({ g, hidden }: { g: GuideCard; hidden: boolean }) {
  const meta = getRegionBySlug(g.region);
  return (
    <Link
      href={`/guides/${g.slug}`}
      className={`bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col${hidden ? ' hidden' : ''}`}
    >
      <div className="flex items-center gap-2 mb-2">
        {meta && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <RegionFlag slug={g.region} className="h-3.5" />
            {meta.displayName}
          </span>
        )}
        <span className="text-stone-300">·</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {g.readMinutes} min read
        </span>
      </div>
      <h2 className="font-display text-lg font-bold tracking-editorial text-ink leading-snug mb-2 group-hover:text-forest-700">
        {g.titleEn}
      </h2>
      <p className="text-stone-600 text-sm leading-relaxed m-0 flex-1">{g.descriptionEn}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
        Read guide <ArrowUpRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

interface Props {
  items: GuideCard[];
  /** Ordered topic categories (key + label), supplied by the server page. */
  categories: { key: string; label: string }[];
}

export default function GuidesView({ items, categories }: Props) {
  const { effectiveRegion } = useRegion();
  const [showAll, setShowAll] = useState(false);

  const isVisible = (g: GuideCard) => showAll || g.regions.includes(effectiveRegion);
  const shown = useMemo(
    () => items.filter((g) => showAll || g.regions.includes(effectiveRegion)).length,
    [items, effectiveRegion, showAll],
  );

  return (
    <div className="space-y-8">
      <RegionFilterBar
        regionSlug={effectiveRegion}
        shown={shown}
        total={items.length}
        noun="guides"
        showAll={showAll}
        onToggle={() => setShowAll((v) => !v)}
      />

      {/* All guides are always rendered (crawlable in the server HTML), grouped by
          topic; cards and empty groups are hidden until they match the region. */}
      <div className="space-y-12">
        {categories.map((cat) => {
          const group = items.filter((g) => g.category === cat.key);
          if (group.length === 0) return null;
          const anyVisible = group.some(isVisible);
          return (
            <section key={cat.key} className={anyVisible ? undefined : 'hidden'}>
              <div className="section-rule mb-5">
                <span>{cat.label}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.map((g) => (
                  <GuideLink key={g.slug} g={g} hidden={!isVisible(g)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {shown === 0 && !showAll && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="m-0 text-stone-600">
            No guides are tagged to this destination yet. Use{' '}
            <strong className="font-semibold text-ink">Show all regions</strong> above to read every
            guide.
          </p>
        </div>
      )}
    </div>
  );
}
