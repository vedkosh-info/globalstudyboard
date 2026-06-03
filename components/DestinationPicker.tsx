'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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

export default function DestinationPicker() {
  const { region, setRegion, ready } = useRegion();
  const [dismissed, setDismissed] = useState(false);

  // Lock body scroll while the overlay is open.
  const open = ready && !region && !dismissed;
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const choose = (slug: RegionSlug) => setRegion(slug);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="destination-picker-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-cream-50 rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Skip for now"
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Welcome to GlobalStudyBoard
        </p>
        <h2
          id="destination-picker-title"
          className="font-display text-3xl sm:text-4xl font-bold tracking-editorial leading-tight text-ink mb-2"
        >
          Where do you want to study?
        </h2>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6">
          Pick a destination and we&apos;ll tailor the whole site to it — universities,
          entrance exams, application platforms, visas and costs. You can change this anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ORDERED_REGIONS.map((r) => (
            <button
              key={r.slug}
              type="button"
              onClick={() => choose(r.slug)}
              className="text-left bg-white border border-stone-200 rounded-2xl p-4 hover:border-forest-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span aria-hidden="true" className="text-2xl leading-none">
                  {r.flag}
                </span>
                <span className="font-display text-base font-bold text-ink group-hover:text-forest-700 transition-colors">
                  {r.displayName}
                </span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed">
                {REGION_TAGLINES[r.slug]}
              </p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-6 text-sm text-stone-500 hover:text-forest-700 underline-offset-2 hover:underline"
        >
          I&apos;m just exploring — show me everything
        </button>
      </div>
    </div>
  );
}
