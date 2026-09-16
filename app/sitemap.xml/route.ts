import { BASE, SITEMAP_IDS, sitemapLastmod } from '@/lib/sitemap-entries';

// Static: the index is fixed at build time, like the sitemap files it lists.
export const dynamic = 'force-static';

/**
 * Sitemap INDEX at /sitemap.xml — the URL robots.txt advertises and Search
 * Console has on file, so no resubmission is needed. Each child file's
 * <lastmod> is the newest date inside it, letting Google re-fetch only the
 * sections that actually changed.
 */
export function GET() {
  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    SITEMAP_IDS.map(
      (id) =>
        `  <sitemap>\n    <loc>${BASE}/sitemap/${id}.xml</loc>\n    <lastmod>${sitemapLastmod(id)}</lastmod>\n  </sitemap>`,
    ).join('\n') +
    '\n</sitemapindex>\n';
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
