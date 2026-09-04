'use client';

import Link from 'next/link';
import { Check, Globe2 } from 'lucide-react';
import { REGIONS_ALPHABETICAL, type RegionSlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';

/**
 * THE destination list — the single rendering of "where do you want to study?"
 * on the whole site.
 *
 * There used to be three different-looking ways to change it (a header dropdown
 * of bare names, a "Change destination" button in the context bar, and a
 * full-screen modal with a two-column card grid), so the same nine values
 * appeared in three shapes and the visitor had to learn each one. Now the header
 * control is the only one, and it renders this list. The rich card grid on the
 * home page (`HomeRegionGrid`) is the browsing surface — a content section, not
 * chrome — and reads its values from the same `REGIONS_ALPHABETICAL` source.
 * Never re-implement the list: extend this.
 *
 * Order is `REGIONS_ALPHABETICAL`, so the position of a destination never
 * changes between the two surfaces or between visits (Fitts/muscle memory).
 *
 * Every option carries `data-destination-option` so a host can implement roving
 * arrow-key focus over the rows without knowing how they are built.
 */
export default function DestinationMenu({
  onChoose,
  onNavigate,
  showBrowseAll = false,
  labelId,
}: {
  /** Called with the chosen destination. The host decides what to do next. */
  onChoose: (slug: RegionSlug) => void;
  /** Let the host close itself when the "compare all" link is followed. */
  onNavigate?: () => void;
  /** Show the "Compare all destinations" link under the list. */
  showBrowseAll?: boolean;
  /** id for the list's own heading, so a host dialog can point aria-labelledby at it. */
  labelId?: string;
}) {
  const { effectiveRegion, region } = useRegion();

  return (
    <div>
      <p
        id={labelId}
        className="m-0 flex items-center gap-1.5 px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-600"
      >
        <Globe2 className="h-3.5 w-3.5 shrink-0 text-forest-600" aria-hidden="true" />
        I want to study in…
      </p>

      {/* Preflight is disabled site-wide, so list styling must be reset explicitly. */}
      <ul className="m-0 list-none p-0">
        {REGIONS_ALPHABETICAL.map((r) => {
          const selected = r.slug === effectiveRegion;
          return (
            <li key={r.slug}>
              <button
                type="button"
                data-destination-option
                data-region-slug={r.slug}
                /* aria-current, not role="option": these are real buttons, and a
                   listbox whose options are buttons is invalid ARIA. */
                aria-current={selected ? 'true' : undefined}
                onClick={() => onChoose(r.slug)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
                  selected ? 'bg-forest-50' : 'hover:bg-stone-50'
                }`}
              >
                <RegionFlag slug={r.slug} className="h-5" />
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-sm font-semibold ${
                      selected ? 'text-forest-800' : 'text-stone-800'
                    }`}
                  >
                    {r.displayName}
                  </span>
                </span>
                {selected &&
                  (region ? (
                    <Check className="h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />
                  ) : (
                    /* Honest about WHY India is highlighted before anyone picks:
                       it is the default, not a choice the visitor made. */
                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600 ring-1 ring-stone-200">
                      Default
                    </span>
                  ))}
              </button>
            </li>
          );
        })}
      </ul>

      {showBrowseAll && (
        <div className="mt-1 border-t border-stone-200 pt-1">
          <Link
            href="/regions"
            onClick={onNavigate}
            className="block rounded-xl px-3 py-2 text-sm font-semibold text-forest-700 no-underline transition-colors hover:bg-stone-50"
          >
            Compare all destinations →
          </Link>
        </div>
      )}
    </div>
  );
}
