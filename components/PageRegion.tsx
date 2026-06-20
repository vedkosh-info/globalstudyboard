'use client';

import { useEffect } from 'react';
import { useRegion } from '@/components/RegionProvider';
import type { RegionSlug } from '@/lib/regions';

/**
 * Invisible marker a destination-specific page renders to declare which study
 * destination it belongs to (a country guide, a college, a region hub). When the
 * visitor has not chosen a destination yet, this provisionally skins the whole
 * site to the page they landed on — e.g. arriving from a search result on a USA
 * guide makes the entire site feel USA-tuned — and pre-selects it in the picker.
 * It is never persisted: an explicit choice via the picker/switcher always wins.
 */
export default function PageRegion({ slug }: { slug: RegionSlug }) {
  const { setPageRegion } = useRegion();
  useEffect(() => {
    setPageRegion(slug);
    return () => setPageRegion(null);
  }, [slug, setPageRegion]);
  return null;
}
