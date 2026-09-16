'use client';

import Link from 'next/link';
import { REGION_CATEGORIES, chromeCategoryLabel, chromeCategoryPath } from '@/lib/region-nav';
import { useRegion } from '@/components/RegionProvider';

/**
 * The primary desktop nav — region-scoped. Each category links to the current
 * destination's section page (/regions/{effectiveRegion}/{category}) with a
 * region-adaptive label (India is domestic → "Colleges" / "Entrance Exams"), so
 * the whole nav re-tunes when the visitor changes destination.
 */
export default function RegionNav() {
  const { effectiveRegion, pageRegion, ready } = useRegion();
  // Region-scoped hrefs + labels only once the destination is genuinely known
  // (see chromeCategoryPath); the neutral pair is baked into the static HTML.
  const tunedIsKnown = ready || pageRegion !== null;
  return (
    <>
      {REGION_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={chromeCategoryPath(cat, effectiveRegion, tunedIsKnown)}
          className="whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium xl:px-3 text-stone-700 no-underline transition-colors hover:bg-forest-50 hover:text-forest-700"
        >
          {chromeCategoryLabel(cat, effectiveRegion, tunedIsKnown)}
        </Link>
      ))}
    </>
  );
}
