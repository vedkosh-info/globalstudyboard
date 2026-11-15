'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import { getRegionBySlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';
import { TOPICS_MENU_URL, isTopicsMenuData, type TopicsMenuData } from '@/lib/topics-menu-types';

/**
 * One fetch per page session, shared by every mount. A failed fetch clears
 * itself so the next open retries.
 */
let menuPromise: Promise<TopicsMenuData> | null = null;
function loadMenu(): Promise<TopicsMenuData> {
  if (!menuPromise) {
    menuPromise = fetch(TOPICS_MENU_URL, { credentials: 'omit', referrerPolicy: 'no-referrer' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Topics menu request failed');
        const data: unknown = await res.json();
        if (!isTopicsMenuData(data)) throw new Error('Invalid topics menu');
        return data;
      })
      .catch((err: unknown) => {
        menuPromise = null;
        throw err;
      });
  }
  return menuPromise;
}

/**
 * Desktop "Topics" mega-menu — the region-first Track spine. Shows ONLY the
 * effective destination's tracks (India's domestic tracks, or an abroad region's
 * journey tracks), so India-domestic hubs no longer leak into other regions.
 *
 * The tracks are a compact projection (labels + hrefs + preview strings) built
 * server-side by `lib/topics-menu.ts`, so the full `lib/tracks` + `lib/topics`
 * catalogue (≈0.35 MB) never ships to the browser. Since November 2026 it is
 * fetched from a static, CDN-cached JSON file on INTENT (pointer over / focus on
 * the button) instead of riding in every page's HTML + RSC payload as a prop —
 * ~13.6 KB raw per page of origin transfer for a menu whose links are never in
 * the server HTML anyway (they render only when open). "Browse all topics"
 * stays available while loading and if the fetch fails.
 */
export default function TopicsMenu() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<TopicsMenuData | null>(null);
  const [failed, setFailed] = useState(false);
  const { effectiveRegion } = useRegion();
  const ref = useRef<HTMLDivElement>(null);

  // Warm the fetch on intent; the open effect below reads the same promise.
  const prime = () => {
    if (!menu) loadMenu().catch(() => undefined);
  };

  // Opening always (re)tries, so a transient failure recovers on the next open.
  useEffect(() => {
    if (!open || menu) return;
    let live = true;
    setFailed(false);
    loadMenu()
      .then((data) => {
        if (live) setMenu(data);
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [open, menu]);

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

  const tracks = menu?.[effectiveRegion] ?? [];
  const regionName = getRegionBySlug(effectiveRegion)?.displayName ?? '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onPointerEnter={prime}
        onFocus={prime}
        aria-expanded={open}
        className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-stone-700 hover:text-forest-700 px-2 xl:px-3 py-2 rounded-md hover:bg-forest-50 transition-colors"
      >
        Topics
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 max-h-[calc(100dvh-5.5rem)] w-[min(92vw,640px)] overflow-y-auto overscroll-contain bg-cream-50 border border-stone-200 rounded-2xl shadow-xl p-5 z-50">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-3 m-0">
            Explore {regionName} by track
          </p>
          {!menu && (
            <p className="m-0 text-sm text-stone-600" role="status" aria-live="polite">
              {failed ? 'Could not load the tracks. Browse all topics below.' : 'Loading tracks…'}
            </p>
          )}
          {menu && (
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
          )}
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
