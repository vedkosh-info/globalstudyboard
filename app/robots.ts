import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Block infinite query-param URLs (search + AI). The base pages are
      // crawlable; only their ?q= variants are excluded to save crawl budget.
      // /auth (the sign-in callback, no HTML) and /admin (owner console) are
      // blocked outright. /account and /login are NOT listed here on purpose:
      // they carry `noindex`, and a robots-blocked URL can never have its
      // noindex read — leaving them crawlable is what keeps them out of the index.
      disallow: ['/api/', '/auth/', '/admin', '/gsb-ai?*', '/search', '/search?*'],
    },
    sitemap: 'https://www.globalstudyboard.com/sitemap.xml',
  };
}
