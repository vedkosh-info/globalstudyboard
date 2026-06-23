'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import RegionFilterBar from '@/components/RegionFilterBar';
import RegionFlag from '@/components/RegionFlag';

export interface ExamCard {
  id: string;
  slug: string;
  shortName: string;
  fullName: string;
  domain: string;
  frequency: string;
  costUsd?: string;
  /** Primary home region, or 'global' for a test accepted everywhere. */
  region: RegionSlug | 'global';
  /** Every region this exam displays under (resolved server-side). */
  regions: RegionSlug[];
}

function examRegionLabel(region: RegionSlug | 'global'): { flag: string; name: string } {
  if (region === 'global') return { flag: '🌐', name: 'Worldwide' };
  const r = getRegionBySlug(region);
  return { flag: r?.flag ?? '', name: r?.displayName ?? region };
}

function ExamLink({ e, hidden }: { e: ExamCard; hidden: boolean }) {
  const region = examRegionLabel(e.region);
  return (
    <Link
      href={`/exams/${e.slug}`}
      className={`bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col${hidden ? ' hidden' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-xl font-bold text-ink group-hover:text-forest-700 transition-colors">
          {e.shortName}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {e.domain.replace('-', ' ')}
        </span>
      </div>
      <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mb-3">{e.fullName}</p>
      <div className="mt-auto pt-3 text-xs text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1 font-medium text-stone-600">
          {e.region === 'global' ? (
            <span aria-hidden="true">🌐</span>
          ) : (
            <RegionFlag slug={e.region} className="h-3.5" />
          )}
          {region.name}
        </span>
        <span>· {e.frequency.split('(')[0].trim()}</span>
        {e.costUsd && <span>· {e.costUsd}</span>}
      </div>
    </Link>
  );
}

export default function ExamsView({ items }: { items: ExamCard[] }) {
  const { effectiveRegion } = useRegion();
  const [showAll, setShowAll] = useState(false);

  const shown = useMemo(
    () => items.filter((e) => e.regions.includes(effectiveRegion)).length,
    [items, effectiveRegion],
  );

  return (
    <div className="space-y-8">
      <RegionFilterBar
        regionSlug={effectiveRegion}
        shown={shown}
        total={items.length}
        noun="exams"
        showAll={showAll}
        onToggle={() => setShowAll((v) => !v)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((e) => (
          <ExamLink key={e.id} e={e} hidden={!showAll && !e.regions.includes(effectiveRegion)} />
        ))}
      </div>

      {shown === 0 && !showAll && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="m-0 text-stone-600">
            No exams are tagged to this destination yet. Use{' '}
            <strong className="font-semibold text-ink">Show all regions</strong> above to see every
            exam we cover.
          </p>
        </div>
      )}
    </div>
  );
}
