import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Block infinite query-param URLs (search and Ask GSB). The base pages are
      // crawlable; only their ?q= variants are excluded to save crawl budget.
      // /gsb-ai with no query stays allowed so Google can see the 301 to /ask.
      // /auth (the sign-in callback, no HTML) and /admin (owner console) are
      // blocked outright. /account and /login are NOT listed here on purpose:
      // they carry `noindex`, and a robots-blocked URL can never have its
      // noindex read — leaving them crawlable is what keeps them out of the index.
      disallow: ['/api/', '/auth/', '/admin', '/gsb-ai?*', '/ask?*', '/search', '/search?*'],
    },
    sitemap: 'https://www.globalstudyboard.com/sitemap.xml',
  };
}
