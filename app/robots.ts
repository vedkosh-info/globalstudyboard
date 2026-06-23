import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Block infinite query-param URLs (search + AI). The base pages are
      // crawlable; only their ?q= variants are excluded to save crawl budget.
      disallow: ['/api/', '/gsb-ai?*', '/search', '/search?*'],
    },
    sitemap: 'https://www.globalstudyboard.com/sitemap.xml',
  };
}
