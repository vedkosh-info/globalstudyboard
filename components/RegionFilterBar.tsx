'use client';

import { MapPin } from 'lucide-react';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import RegionFlag from '@/components/RegionFlag';

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

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The region heading + filter for a listing: it states, prominently, which
 * destination the list is tuned to and lets the student flip between "this
 * destination" and "all destinations". Shared by the Universities / Exams /
 * Guides views so the affordance reads identically everywhere.
 */
export default function RegionFilterBar({ regionSlug, shown, total, noun, showAll, onToggle }: Props) {
  const r = getRegionBySlug(regionSlug);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-forest-200/70 bg-forest-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {showAll ? (
          <span aria-hidden="true" className="shrink-0 text-2xl leading-none">🌐</span>
        ) : (
          <RegionFlag slug={regionSlug} className="h-6" />
        )}
        <div className="min-w-0">
          <p className="m-0 font-display text-lg font-bold leading-snug tracking-editorial text-ink">
            {showAll ? `All ${noun} worldwide` : `${capitalize(noun)} for ${r?.displayName}`}
          </p>
          <p aria-live="polite" className="m-0 text-xs text-stone-600">
            {showAll
              ? `Showing all ${total} ${noun} across every destination.`
              : `${shown} of ${total} ${noun} · tuned to your destination — change it from the bar above.`}
          </p>
        </div>
      </div>
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
