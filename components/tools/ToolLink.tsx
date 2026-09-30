'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, type ComponentProps } from 'react';
import { resumableFragment } from '@/lib/auth-events';
import { handOffToTool, releaseHandOff, type ToolHandOff } from '@/components/tools/useDestinationHint';

/**
 * A link into a tool that carries a fragment (`toolHref(slug, region)`,
 * `scoreTrackerHref`). Use it instead of next/link wherever such an href is
 * followed in the same tab.
 *
 * Why (review G8-SK-5): for a client-side navigation to a URL with a fragment,
 * Next looks for an element with that id and, finding none (`region=usa` is
 * not an id), scrolls the page's FIRST element into view instead of taking the
 * normal scroll-to-top path. Measured on the built site: a hub card or
 * "Record your SAT score" opened the tool scrolled 246 px down, with the site
 * header — and the destination control this hand-over exists to set — above
 * the viewport.
 *
 * So a click navigates to the bare path, which scrolls like any other page,
 * and hands the fragment to the tool's gate (components/tools/useDestinationHint),
 * which puts it back in the address bar before the tool reads it. The `href`
 * keeps the fragment for everything a click does not cover — a new tab, a
 * copied link, no JavaScript — where a full page load does not scroll for it.
 * A fragment outside the allow-list (lib/auth-events) is left to next/link.
 */
type ToolLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'onNavigate'> & { href: string };

export default function ToolLink({ href, ...rest }: ToolLinkProps) {
  const router = useRouter();
  const handOff = useRef<ToolHandOff | null>(null);
  // This page is going away: keep the hand-off only if it is going to the tool.
  useEffect(
    () => () => {
      if (handOff.current) releaseHandOff(handOff.current);
    },
    [],
  );

  const at = href.indexOf('#');
  if (at < 0 || !resumableFragment(href.slice(at))) return <Link href={href} {...rest} />;
  const path = href.slice(0, at);
  const fragment = href.slice(at + 1);
  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(event) => {
        // Already on the tool: let the fragment land (the gate listens for hashchange).
        if (window.location.pathname === path) return;
        event.preventDefault();
        handOff.current = handOffToTool(path, fragment);
        router.push(path);
      }}
    />
  );
}
