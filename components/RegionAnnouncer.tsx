'use client';

import { useEffect, useRef, useState } from 'react';
import { getRegionBySlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

/**
 * A single visually-hidden polite live region that announces a destination change
 * to screen readers. It is mounted EMPTY and only writes once the effective region
 * actually changes after the first render — so it never announces on initial page
 * load (avoiding unprompted "showing India" noise), only on a real switch.
 */
export default function RegionAnnouncer() {
  const { effectiveRegion, ready } = useRegion();
  const [message, setMessage] = useState('');
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (previous.current !== null && previous.current !== effectiveRegion) {
      const r = getRegionBySlug(effectiveRegion);
      if (r) setMessage(`Now showing content for ${r.displayName}.`);
    }
    previous.current = effectiveRegion;
  }, [effectiveRegion, ready]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
