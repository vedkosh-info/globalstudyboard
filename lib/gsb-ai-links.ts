import type { RegionSlug } from '@/lib/regions';

/**
 * Build the link every "Ask GSB AI" control uses. The prefill lives in the URL
 * FRAGMENT so that every page links to the single canonical /gsb-ai — a
 * fragment is not a distinct URL to a crawler. The old `?q=` form minted ~3,300
 * distinct robots-blocked URLs (311 of them sitting in Search Console's
 * "Blocked by robots.txt" / "Alternate page" buckets) and forced /gsb-ai to be
 * the only per-request-rendered HTML route on the site. GSBAIChat reads the
 * fragment (and any legacy `?q=` query) on the client.
 */
export function gsbAiHref(opts: { q?: string; region?: RegionSlug | string } = {}): string {
  if (opts.q && opts.q.trim()) return `/gsb-ai#q=${encodeURIComponent(opts.q.trim())}`;
  if (opts.region) return `/gsb-ai#region=${encodeURIComponent(String(opts.region))}`;
  return '/gsb-ai';
}
