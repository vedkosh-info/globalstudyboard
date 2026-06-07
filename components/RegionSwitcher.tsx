'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Check, Globe2 } from 'lucide-react';
import { REGIONS_ALPHABETICAL, getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

/**
 * The site-wide study-destination dropdown that lives in the header menu bar on
 * every page. It always shows the region the site is currently tuned to (India
 * by default) and lets the student switch in one tap — re-tuning the whole site.
 * The region list is alphabetical (see REGIONS_ALPHABETICAL).
 */
export default function RegionSwitcher() {
  const { effectiveRegion, region, setRegion } = useRegion();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Always render a real region (India until the student picks otherwise), so the
  // control is never blank and reads clearly as a destination selector.
  const active = getRegionBySlug(effectiveRegion);

  const choose = (slug: RegionSlug) => {
    setRegion(slug);
    setOpen(false);
    // Re-tune in place. The one exception: when standing on a region hub URL,
    // move to the new region's hub so the page matches the chosen destination.
    if (pathname?.startsWith('/regions/')) router.push(`/regions/${slug}`);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Study destination: ${active?.displayName ?? 'choose'} — change`}
        className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-forest-300 bg-white px-2.5 text-sm font-semibold text-forest-800 shadow-sm transition-colors hover:border-forest-400 hover:bg-forest-50 sm:px-3"
      >
        <Globe2 className="h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
        <span className="hidden max-w-[150px] truncate sm:inline">
          {active?.displayName ?? 'Choose destination'}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Choose your study destination"
          className="absolute right-0 z-50 mt-2 max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xl"
        >
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            I want to study in…
          </p>
          {REGIONS_ALPHABETICAL.map((r) => {
            const selected = r.slug === effectiveRegion;
            return (
              <button
                key={r.slug}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => choose(r.slug)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  selected ? 'bg-forest-50 text-forest-800' : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {r.flag}
                </span>
                <span className="flex-1 font-medium">{r.displayName}</span>
                {selected && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-forest-600">
                    {region ? <Check className="h-4 w-4" /> : 'Default'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
