import type { RegionSlug } from '@/lib/regions';

/**
 * Build the link every "Ask GSB" control uses. The prefill lives in the URL
 * FRAGMENT so that every page links to the single canonical /ask — a
 * fragment is not a distinct URL to a crawler. The old `?q=` form on /gsb-ai
 * minted ~3,300 distinct robots-blocked URLs. /gsb-ai now 301s to /ask.
 * GSBAIChat reads the fragment (and any legacy `?q=` query) on the client.
 * Never emit `?q=`.
 */
export function gsbAiHref(opts: { q?: string; region?: RegionSlug | string } = {}): string {
  if (opts.q && opts.q.trim()) return `/ask#q=${encodeURIComponent(opts.q.trim())}`;
  if (opts.region) return `/ask#region=${encodeURIComponent(String(opts.region))}`;
  return '/ask';
}
