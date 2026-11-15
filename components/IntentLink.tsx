'use client';

import Link from 'next/link';
import { useState, type ComponentProps } from 'react';

type IntentLinkProps = Omit<ComponentProps<typeof Link>, 'prefetch'>;

/**
 * A `next/link` that prefetches on INTENT (hover, keyboard focus, touch) instead
 * of on entering the viewport.
 *
 * Why it exists (cost, November 2026): every prerendered page is served from
 * Vercel's ISR cache, and a default `<Link>` to a static route prefetches the
 * target's FULL RSC payload (~90 KB uncompressed for a guide) as soon as it
 * scrolls into view. A guide's "Related", "More in this hub" and "Popular
 * guides" blocks point at ~25 long-tail pages that are rarely warm at the CDN,
 * so every reader who scrolled to the foot of a guide pulled ~2 MB of origin
 * transfer for pages they almost never opened. Use this for dense lists of
 * long-tail links; keep plain `<Link>` for the few hot chrome destinations.
 *
 * SEO-neutral: it renders the same `<a href>`; prefetching is browser-only.
 * The pattern is the one in the Next.js prefetching guide ("hover-triggered
 * prefetch"): `prefetch={false}` until intent, then `null` (the default).
 */
export default function IntentLink({ onMouseEnter, onFocus, onTouchStart, ...props }: IntentLinkProps) {
  const [active, setActive] = useState(false);
  return (
    <Link
      {...props}
      prefetch={active ? null : false}
      onMouseEnter={(e) => {
        setActive(true);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        setActive(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setActive(true);
        onTouchStart?.(e);
      }}
    />
  );
}
