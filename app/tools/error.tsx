'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { CHUNK_FAILED_HELP, ReloadPageButton } from '@/components/tools/ToolStates';
import { settleHandOffs } from '@/components/tools/useDestinationHint';

/**
 * The error boundary for every /tools page (the index, each tool and each
 * report). A tool gate already turns a chunk that cannot be downloaded into its
 * own ToolChunkFailed card; this catches anything else that throws while a tool
 * page renders. Without it the nearest boundary was Next's built-in global one,
 * which replaced the WHOLE document — header, footer and the site disclaimer —
 * with a bare "Application error" (independent review, CRIT2-1). Here only the
 * page's own content is replaced: the root layout's header, footer and
 * disclaimer stay.
 *
 * The page's H1 went with its content, so this card carries one. Reload is the
 * retry offered — a fresh load fetches fresh chunks, which `reset()` (a
 * re-render with the same chunks) cannot.
 *
 * A destination on its way to the gate that failed (useDestinationHint) is
 * parked in the address bar, so the reload opens on it, and then dropped, so a
 * later visit through another page cannot pick it up.
 */
export default function ToolsError() {
  useEffect(() => settleHandOffs(), []);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8" role="alert">
        <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">Tools</p>
        <h1 className="m-0 font-display text-3xl font-bold tracking-editorial text-ink sm:text-4xl">This page could not be shown</h1>
        <p className="m-0 mt-4 text-base leading-relaxed text-stone-700">
          Something went wrong while showing it. Reload the page to try again — nothing you saved has changed.
        </p>
        <p className="m-0 mt-2 text-base leading-relaxed text-stone-700">{CHUNK_FAILED_HELP}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <ReloadPageButton />
          <Link href="/tools" className="text-sm font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800">
            See all tools
          </Link>
        </div>
      </div>
    </div>
  );
}
