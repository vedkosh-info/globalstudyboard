'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check, ChevronRight, Globe2 } from 'lucide-react';
import {
  REGIONS,
  PRIMARY_REGION_SLUGS,
  REGION_TAGLINES,
  getRegionBySlug,
  type RegionSlug,
} from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

const ORDERED_REGIONS = [
  ...PRIMARY_REGION_SLUGS,
  ...REGIONS.map((r) => r.slug).filter((s) => !PRIMARY_REGION_SLUGS.includes(s)),
]
  .map((slug) => REGIONS.find((r) => r.slug === slug))
  .filter((r): r is NonNullable<typeof r> => Boolean(r));

/**
 * A slim, site-wide context bar that sits directly under the header on every
 * page. It tells the student which destination the site is tuned to and lets
 * them switch in one tap — the persistent backbone of the personalised
 * experience.
 */
export default function DestinationBar() {
  const { region, setRegion, ready } = useRegion();
  const router = useRouter();
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

  // Reserve height before hydration to avoid layout shift / SSR mismatch.
  if (!ready) return <div aria-hidden="true" className="h-11" />;

  const active = region ? getRegionBySlug(region) : undefined;

  const choose = (slug: RegionSlug) => {
    setRegion(slug);
    setOpen(false);
    // A deliberate region change takes the student to that region's hub.
    router.push(`/regions/${slug}`);
  };

  return (
    <div
      ref={ref}
      className="sticky top-16 z-30 border-b border-stone-200/70 bg-cream-50/80 backdrop-blur supports-[backdrop-filter]:bg-cream-50/70"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-11 items-center justify-between gap-3">
          {/* Status */}
          {active ? (
            <p className="m-0 flex min-w-0 items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-forest-600" />
              </span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 sm:inline">
                Tuned to
              </span>
              <span aria-hidden="true" className="text-base leading-none">
                {active.flag}
              </span>
              <span className="truncate font-display font-bold text-ink">
                {active.displayName}
              </span>
            </p>
          ) : (
            <p className="m-0 flex min-w-0 items-center gap-2 text-sm text-stone-600">
              <Sparkles className="h-4 w-4 shrink-0 text-forest-700" />
              <span className="truncate">
                <span className="font-semibold text-ink">Make it yours</span>
                <span className="hidden sm:inline"> — pick a destination for a tailored guide.</span>
              </span>
            </p>
          )}

          {/* Changer */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-forest-200 bg-white/70 px-3.5 py-1 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-white"
          >
            {active ? 'Change' : 'Choose destination'}
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : 'group-hover:translate-x-0.5'}`}
            />
          </button>
        </div>

        {/* Inline destination panel */}
        {open && (
          <div className="pb-3 pt-1">
            <div className="rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-sm backdrop-blur">
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <Globe2 className="h-3.5 w-3.5 text-stone-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  I want to study in…
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {ORDERED_REGIONS.map((r) => {
                  const selected = r.slug === region;
                  return (
                    <button
                      key={r.slug}
                      type="button"
                      onClick={() => choose(r.slug)}
                      className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left transition-all ${
                        selected
                          ? 'border-forest-300 bg-forest-50'
                          : 'border-transparent bg-stone-50 hover:border-forest-200 hover:bg-white'
                      }`}
                    >
                      <span aria-hidden="true" className="mt-0.5 text-lg leading-none">
                        {r.flag}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1">
                          <span className="truncate text-sm font-semibold text-ink">
                            {r.displayName}
                          </span>
                          {selected && <Check className="h-3.5 w-3.5 shrink-0 text-forest-600" />}
                        </span>
                        <span className="line-clamp-1 text-[11px] text-stone-500">
                          {REGION_TAGLINES[r.slug]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
