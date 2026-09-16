'use client';

import { useState } from 'react';
import { DEFAULT_REGION, type RegionSlug } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

/**
 * Which destination a listing (universities / exams / guides) is filtered to,
 * resolved so that the SERVER HTML is already correct for the page it is on.
 *
 * `region` (the remembered cookie choice) is null on the server and on the very
 * first client render, so it can never cause a hydration mismatch. What decides
 * the baked HTML is therefore `pageRegion` — the page's OWN destination, passed
 * down by the server page (a Japan hub passes 'east-southeast-asia'). Before
 * this, every abroad hub was prerendered as the India view: all of its guide
 * cards `hidden`, a heading reading "Guides for India · 0 of N" and a "No guides
 * are tagged to this destination yet" notice — on 305 of 368 hubs.
 *
 * Global listings (/colleges, /exams) pass `unfilteredByDefault`: they promise
 * "worldwide" in their <title>, so they show every destination until the student
 * opts into a filter.
 */
export function useListingRegion(opts: { pageRegion?: RegionSlug; unfilteredByDefault?: boolean } = {}) {
  const { region } = useRegion();
  const [override, setOverride] = useState<'all' | 'tuned' | null>(null);

  // A listing that belongs to one destination (a topic hub, a region page) is
  // filtered to THAT destination — its identity — not to the visitor's remembered
  // choice: a student with a UK cookie who opens a Japan hub should see the Japan
  // guides, not "Guides for the UK · 0 of 7". The remembered choice still drives
  // destination-neutral listings.
  const tuned: RegionSlug | null =
    opts.pageRegion ?? region ?? (opts.unfilteredByDefault ? null : DEFAULT_REGION);
  const defaultShowAll = opts.unfilteredByDefault ? true : tuned === null;
  const showAll = override === null ? defaultShowAll : override === 'all';
  const filterRegion: RegionSlug = tuned ?? region ?? DEFAULT_REGION;

  return {
    /** The region cards are filtered to when `showAll` is false. */
    filterRegion,
    showAll,
    toggle: () => setOverride(showAll ? 'tuned' : 'all'),
  };
}
