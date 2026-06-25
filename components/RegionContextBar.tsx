'use client';

import { Globe2 } from 'lucide-react';
import { getRegionBySlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';
import AudienceToggle from '@/components/AudienceToggle';

/**
 * The slim, always-present strip under the header that tells the visitor which
 * study destination the site is currently tuned to, and lets them change it in
 * one tap. Together with the header switcher it keeps the chosen destination
 * front-and-centre on every page. Renders only after the client knows the
 * stored/selected region, so it never flashes the wrong destination.
 */
export default function RegionContextBar() {
  const { effectiveRegion, region, pageRegion, openPicker, ready } = useRegion();

  if (!ready) return null;
  const r = getRegionBySlug(effectiveRegion);
  if (!r) return null;

  const label = region
    ? 'Your study destination'
    : pageRegion
      ? 'Showing content for'
      : 'Showing by default';

  return (
    <div className="border-b border-forest-100 bg-forest-50/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="m-0 flex min-w-0 items-center gap-2 text-sm text-stone-600">
          <Globe2 className="h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
          <span className="hidden sm:inline">{label}:</span>
          <RegionFlag slug={r.slug} className="h-4" />
          <strong className="truncate font-semibold text-forest-800">{r.displayName}</strong>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <AudienceToggle />
          <button
            type="button"
            onClick={openPicker}
            data-region-picker-trigger
            className="shrink-0 rounded-full border border-forest-300 bg-white px-3 py-1 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50"
          >
            Change destination
          </button>
        </div>
      </div>
    </div>
  );
}
