'use client';

import type { ReactNode } from 'react';
import ToolLink from '@/components/tools/ToolLink';
import { useRegion } from '@/components/RegionProvider';
import { toolPageHref } from '@/lib/tool-hint';

/**
 * A /tools index card link. Once ToolsIndexHint has applied a carried
 * destination (#region=), the href carries it too, so opening a card in a new
 * tab or copying its link keeps the destination — not only a same-tab click,
 * which the gate's carry already covers. The server HTML has the bare
 * /tools/<slug> (no destination is known at build time), so there is nothing
 * to mismatch on hydration.
 */
export default function ToolIndexLink({ slug, className, children }: { slug: string; className: string; children: ReactNode }) {
  const { pageRegion } = useRegion();
  return (
    <ToolLink href={toolPageHref(slug, pageRegion)} className={className}>
      {children}
    </ToolLink>
  );
}
