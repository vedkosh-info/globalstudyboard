'use client';

import Link from 'next/link';
import { REGION_CATEGORIES, categoryLabel, regionCategoryPath } from '@/lib/region-nav';
import { useRegion } from '@/components/RegionProvider';

/**
 * The primary desktop nav — region-scoped. Each category links to the current
 * destination's section page (/regions/{effectiveRegion}/{category}) with a
 * region-adaptive label (India is domestic → "Colleges" / "Entrance Exams"), so
 * the whole nav re-tunes when the visitor changes destination.
 */
export default function RegionNav() {
  const { effectiveRegion } = useRegion();
  return (
    <>
      {REGION_CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={regionCategoryPath(effectiveRegion, cat)}
          className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-stone-700 no-underline transition-colors hover:bg-forest-50 hover:text-forest-700"
        >
          {categoryLabel(cat, effectiveRegion)}
        </Link>
      ))}
    </>
  );
}
