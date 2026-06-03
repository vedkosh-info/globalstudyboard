'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MapPin, Check } from 'lucide-react';
import { REGIONS, PRIMARY_REGION_SLUGS, type RegionSlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

const ORDERED_REGIONS = [
  ...PRIMARY_REGION_SLUGS,
  ...REGIONS.map((r) => r.slug).filter((s) => !PRIMARY_REGION_SLUGS.includes(s)),
]
  .map((slug) => REGIONS.find((r) => r.slug === slug))
  .filter((r): r is NonNullable<typeof r> => Boolean(r));

export default function RegionSwitcher() {
  const { region, setRegion, ready } = useRegion();
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

  const active = region ? REGIONS.find((r) => r.slug === region) : undefined;

  // Reserve space before hydration to avoid layout shift.
  if (!ready) return <div aria-hidden="true" className="h-8 w-[120px]" />;

  const choose = (slug: RegionSlug) => {
    setRegion(slug);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition-colors hover:border-forest-300 hover:text-forest-700"
      >
        {active ? (
          <>
            <span aria-hidden="true" className="text-base leading-none">
              {active.flag}
            </span>
            <span className="hidden sm:inline max-w-[140px] truncate">{active.displayName}</span>
            <span className="sm:hidden">{active.currency.code}</span>
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 text-forest-700" />
            <span>Choose destination</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Choose your study destination"
          className="absolute right-0 mt-2 w-64 max-h-[70vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-lg p-1.5 z-50"
        >
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
            I want to study in…
          </p>
          {ORDERED_REGIONS.map((r) => {
            const selected = r.slug === region;
            return (
              <button
                key={r.slug}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => choose(r.slug)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                  selected
                    ? 'bg-forest-50 text-forest-800'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {r.flag}
                </span>
                <span className="flex-1 font-medium">{r.displayName}</span>
                {selected && <Check className="w-4 h-4 text-forest-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
