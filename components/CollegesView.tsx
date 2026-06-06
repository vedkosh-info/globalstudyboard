'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import RegionFilterBar from '@/components/RegionFilterBar';

export interface CollegeCard {
  id: string;
  slug: string;
  nameEn: string;
  city: string;
  state?: string;
  established: number;
  descriptionEn: string;
  /** Primary home region. */
  region: RegionSlug;
  /** Every region this college displays under (resolved server-side). */
  regions: RegionSlug[];
}

function CollegeLink({ c, hidden }: { c: CollegeCard; hidden: boolean }) {
  const meta = getRegionBySlug(c.region);
  return (
    <Link
      href={`/colleges/${c.slug}`}
      className={`bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col${hidden ? ' hidden' : ''}`}
    >
      {meta && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-2">
          <span aria-hidden="true" className="mr-1">
            {meta.flag}
          </span>
          {meta.displayName}
        </span>
      )}
      <h2 className="font-display text-lg font-bold text-ink group-hover:text-forest-700 transition-colors leading-snug m-0 mb-1">
        {c.nameEn}
      </h2>
      <p className="text-stone-500 text-xs mb-3">
        {c.city}
        {c.state ? `, ${c.state}` : ''} · Est. {c.established}
      </p>
      <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mt-auto">{c.descriptionEn}</p>
    </Link>
  );
}

export default function CollegesView({ items }: { items: CollegeCard[] }) {
  const { effectiveRegion } = useRegion();
  const [showAll, setShowAll] = useState(false);

  // Every card is always rendered (so the full set is in the server HTML and
  // crawlable); non-matching cards are hidden with `hidden` until "Show all".
  const shown = useMemo(
    () => items.filter((c) => c.regions.includes(effectiveRegion)).length,
    [items, effectiveRegion],
  );

  return (
    <div className="space-y-8">
      <RegionFilterBar
        regionSlug={effectiveRegion}
        shown={shown}
        total={items.length}
        noun="universities"
        showAll={showAll}
        onToggle={() => setShowAll((v) => !v)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((c) => (
          <CollegeLink
            key={c.id}
            c={c}
            hidden={!showAll && !c.regions.includes(effectiveRegion)}
          />
        ))}
      </div>

      {shown === 0 && !showAll && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="m-0 text-stone-600">
            We don&rsquo;t profile universities for this destination yet. Use{' '}
            <strong className="font-semibold text-ink">Show all regions</strong> above to browse
            every university we cover.
          </p>
        </div>
      )}
    </div>
  );
}
