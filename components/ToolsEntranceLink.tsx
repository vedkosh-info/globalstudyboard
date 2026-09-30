'use client';

import { useEffect, type MouseEvent, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import ToolLink from '@/components/tools/ToolLink';
import { notePath } from '@/components/tools/hand-off';
import { useRegion } from '@/components/RegionProvider';
import { toolsIndexHref } from '@/lib/tool-hint';

/**
 * The site-wide "Tools" entrance (header nav, the strip under the header, the
 * quick-actions dock — owner directive, 30 Sep 2026). On a page that declares a
 * destination (a guide, a college, a region hub, or a tool opened for one) it
 * carries it as `#region=<slug>`, so a visitor who has not chosen a destination
 * and is reading about the United States opens the tools — and the tool they
 * pick from the index — tuned to the United States, not to the default. It is
 * never written as a preference and never beats a remembered choice (§16.3;
 * components/tools/useDestinationHint). ToolLink, not next/link, so the
 * fragment never scrolls the header out of view.
 */
export default function ToolsEntranceLink({
  className,
  children,
  onClick,
}: {
  className: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { pageRegion } = useRegion();
  // The header and strip instances render on every page, so this runs on every
  // navigation: it drops a Tools hand-off whose navigation was abandoned
  // (components/tools/hand-off `notePath`). Idempotent across instances.
  const pathname = usePathname();
  useEffect(() => {
    notePath(pathname);
  }, [pathname]);
  return (
    <ToolLink href={toolsIndexHref(pageRegion)} className={className} onClick={onClick}>
      {children}
    </ToolLink>
  );
}
