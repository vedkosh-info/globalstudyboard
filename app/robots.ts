import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

// Crawlers that collect pages in bulk for datasets or AI-model training. None
// of them sends readers to the site. The crawlers that power search results
// and cited answers are NOT here and stay allowed under `*`: Googlebot,
// Bingbot, YandexBot, Applebot, DuckDuckBot, Naver's Yeti, OAI-SearchBot,
// ChatGPT-User, PerplexityBot and Claude-SearchBot.
//   GPTBot             OpenAI's training crawler (ChatGPT search uses OAI-SearchBot)
//   CCBot              Common Crawl's public web dataset
//   Bytespider         ByteDance's crawler
//   Meta-ExternalAgent Meta's AI-training crawler
//   anthropic-ai       Anthropic's older training opt-out token (Claude-SearchBot is separate)
//   Omgili             Webz.io's crawler, which collects pages for data feeds
const BULK_AND_TRAINING_CRAWLERS = [
  'GPTBot',
  'CCBot',
  'Bytespider',
  'Meta-ExternalAgent',
  'anthropic-ai',
  'Omgili',
];

// Meta-WebIndexer is NOT a training crawler. Meta says it improves Meta AI search
// results, and that allowing it helps Meta AI cite and link to the site. It is
// opted out for cost: about 30,000 requests a day in November 2026 (roughly 40%
// of all traffic), against no Meta AI referrals in Vercel Web Analytics for the
// 30 days to 22 November 2026. Remove this group to be cited by Meta AI again.
// The Vercel firewall rule `gsb-bot-shield` blocks the same user agent.
const META_AI_SEARCH_CRAWLER = ['meta-webindexer'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
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
      { userAgent: BULK_AND_TRAINING_CRAWLERS, disallow: '/' },
      { userAgent: META_AI_SEARCH_CRAWLER, disallow: '/' },
    ],
    sitemap: 'https://www.globalstudyboard.com/sitemap.xml',
  };
}
