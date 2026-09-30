'use client';

import { useDestinationHint } from '@/components/tools/useDestinationHint';

/**
 * Mounts the destination hook on the /tools index: a `#region=` handed over by
 * the site-wide Tools links (or typed in the address bar) skins the index to
 * that destination and is carried on to the tool opened from it. Renders
 * nothing; the index itself is static and stays fully readable without it.
 */
export default function ToolsIndexHint() {
  useDestinationHint();
  return null;
}
