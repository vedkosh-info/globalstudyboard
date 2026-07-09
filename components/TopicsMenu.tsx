'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import { getRegionBySlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

/** One track entry in the mega-menu — a compact, server-computed projection. */
export interface MenuTrack {
  label: string;
  href: string;
  preview: string | null;
}
/** Per-region track projection, keyed by region slug. Built once at build time. */
export type TopicsMenuData = Record<string, MenuTrack[]>;

/**
 * Desktop "Topics" mega-menu — the region-first Track spine. Shows ONLY the
 * effective destination's tracks (India's domestic tracks, or an abroad region's
 * journey tracks), so India-domestic hubs no longer leak into other regions.
 *
 * The tracks are passed in as a compact `menu` projection (labels + hrefs +
 * preview strings) computed server-side in the root layout — mirroring the
 * FOOTER_EXAM_LABELS pattern — so the full `lib/tracks` + `lib/topics` catalogue
 * (≈0.35 MB) NEVER ships to the browser on every page.
 */
export default function TopicsMenu({ menu }: { menu: TopicsMenuData }) {
  const [open, setOpen] = useState(false);
  const { effectiveRegion } = useRegion();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const tracks = menu[effectiveRegion] ?? [];
  const regionName = getRegionBySlug(effectiveRegion)?.displayName ?? '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-stone-700 hover:text-forest-700 px-3 py-2 rounded-md hover:bg-forest-50 transition-colors"
      >
        Topics
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[min(92vw,640px)] bg-cream-50 border border-stone-200 rounded-2xl shadow-xl p-5 z-50">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-3 m-0">
            Explore {regionName} by track
          </p>
          <ul className="list-none p-0 m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
            {tracks.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  onClick={() => setOpen(false)}
                  className="group block rounded-lg px-2 py-1.5 no-underline hover:bg-forest-50"
                >
                  <span className="block text-sm font-medium text-stone-800 group-hover:text-forest-700">
                    {t.label}
                  </span>
                  {t.preview && (
                    <span className="block truncate text-[11px] text-stone-500">{t.preview}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-stone-200 pt-3 mt-3">
            <Link
              href="/topics"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-forest-700 hover:text-forest-800 no-underline"
            >
              Browse all topics →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
