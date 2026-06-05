'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Compass, ArrowRight } from 'lucide-react';
import {
  REGIONS,
  PRIMARY_REGION_SLUGS,
  REGION_TAGLINES,
  type RegionSlug,
} from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

// Primary targets first, then the rest — keeps India & core markets up top.
const ORDERED_REGIONS = [
  ...PRIMARY_REGION_SLUGS,
  ...REGIONS.map((r) => r.slug).filter((s) => !PRIMARY_REGION_SLUGS.includes(s)),
]
  .map((slug) => REGIONS.find((r) => r.slug === slug))
  .filter((r): r is NonNullable<typeof r> => Boolean(r));

/**
 * First-visit destination picker. Appears once per browser session when a
 * student lands on the Home page without a chosen destination. Choosing a
 * region tunes the whole site to it and takes the student straight to that
 * region's guide. Skipping is remembered for the session so it never nags.
 */
export default function DestinationPicker() {
  const { region, setRegion, promptedThisSession, markPrompted, ready } = useRegion();
  const pathname = usePathname();
  const router = useRouter();

  // Only on the Home page, only once per session, only until a region is set.
  const open = ready && pathname === '/' && !region && !promptedThisSession;

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const choose = (slug: RegionSlug) => {
    setRegion(slug);
    router.push(`/regions/${slug}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="destination-picker-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/55 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-cream-50 rounded-3xl border border-stone-200 shadow-2xl">
        {/* Decorative top band */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-forest-50 to-transparent" />

        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={markPrompted}
            aria-label="Skip for now"
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-forest-700 mb-3">
            <Compass className="w-4 h-4" />
            Welcome to GlobalStudyBoard
          </p>
          <h2
            id="destination-picker-title"
            className="font-display text-3xl sm:text-4xl font-bold tracking-editorial leading-tight text-ink mb-2"
          >
            Where are you headed?
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
            Tell us where you&apos;re looking for admissions or study resources, and we&apos;ll tune the
            whole site to it — universities, entrance exams, scholarships, costs and visas for your
            destination. You can change this anytime.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ORDERED_REGIONS.map((r) => (
              <button
                key={r.slug}
                type="button"
                onClick={() => choose(r.slug)}
                className="text-left bg-white border border-stone-200 rounded-2xl p-4 hover:border-forest-400 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-2 min-w-0">
                    <span aria-hidden="true" className="text-2xl leading-none">
                      {r.flag}
                    </span>
                    <span className="font-display text-base font-bold text-ink group-hover:text-forest-700 transition-colors truncate">
                      {r.displayName}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-stone-300 group-hover:text-forest-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-stone-500 text-xs leading-relaxed m-0">
                  {REGION_TAGLINES[r.slug]}
                </p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={markPrompted}
            className="mt-6 text-sm text-stone-500 hover:text-forest-700 underline-offset-2 hover:underline"
          >
            I&apos;m just exploring — show me everything
          </button>
        </div>
      </div>
    </div>
  );
}
