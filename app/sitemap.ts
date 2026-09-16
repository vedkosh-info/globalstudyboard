import type { MetadataRoute } from 'next';
import { SITEMAP_IDS, sitemapEntries, type SitemapId } from '@/lib/sitemap-entries';

// Statically pre-generated at build time — never re-run on each request.
export const dynamic = 'force-static';

/**
 * One sitemap file per section — /sitemap/static.xml, /sitemap/destinations.xml,
 * /sitemap/colleges.xml, /sitemap/exams.xml, /sitemap/topics.xml and
 * /sitemap/guides-{region}.xml ×9 — so Search Console reports coverage per
 * section and per destination. The index that lists them is emitted by
 * app/sitemap.xml/route.ts (Next.js does not generate a sitemap index itself),
 * at the same /sitemap.xml URL that robots.txt and Search Console already use.
 */
export function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export default function sitemap({ id }: { id: SitemapId }): MetadataRoute.Sitemap {
  return sitemapEntries(id);
}
