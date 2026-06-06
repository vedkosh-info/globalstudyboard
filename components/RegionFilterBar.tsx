'use client';

import { Globe2, MapPin } from 'lucide-react';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';

interface Props {
  /** The region the list is currently tuned to. */
  regionSlug: RegionSlug;
  /** How many items match the region (shown when filtered). */
  shown: number;
  /** Total items across all regions. */
  total: number;
  /** Plural noun for the content, e.g. "universities". */
  noun: string;
  /** Whether the unfiltered (all-regions) view is active. */
  showAll: boolean;
  onToggle: () => void;
}

/**
 * The control that tells the student which destination a listing is filtered to
 * and lets them flip between "this region only" and "all regions". Shared by the
 * Universities / Exams / Guides views so the affordance is identical everywhere.
 */
export default function RegionFilterBar({ regionSlug, shown, total, noun, showAll, onToggle }: Props) {
  const r = getRegionBySlug(regionSlug);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-forest-200/70 bg-forest-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="m-0 flex items-center gap-2 text-sm text-stone-700">
        {showAll ? (
          <>
            <Globe2 className="h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />
            <span>
              Showing <strong className="font-semibold text-ink">all {total} {noun}</strong> across
              every destination.
            </span>
          </>
        ) : (
          <>
            <span aria-hidden="true" className="text-base leading-none">
              {r?.flag}
            </span>
            <span>
              Showing{' '}
              <strong className="font-semibold text-ink">
                {noun} for {r?.displayName}
              </strong>
              <span className="text-stone-500"> · {shown} of {total}</span>
            </span>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-forest-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50 sm:self-auto"
      >
        {showAll ? (
          <>
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Filter to {r?.displayName}
          </>
        ) : (
          'Show all regions'
        )}
      </button>
    </div>
  );
}
