import type { RegionSlug } from './regions';

/** Search is a noindex query page; carry the current destination without remembering it. */
export function searchHref(query: string, region?: RegionSlug | null): string {
  const q = query.trim();
  const parts = [q ? `q=${encodeURIComponent(q)}` : '', region ? `region=${region}` : ''].filter(Boolean);
  return parts.length ? `/search?${parts.join('&')}` : '/search';
}
