import { GUIDES } from '@/lib/guides';

const BASE = 'https://www.globalstudyboard.com';

// Prerendered at build time (static). Served at /feed.xml.
export const dynamic = 'force-static';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RSS is for recent items; the sitemap index carries the full catalogue. */
const FEED_ITEMS = 200;

export function GET(): Response {
  // Newest-verified first; guides are the article-like content worth syndicating.
  // Capped: the feed used to list all 2,701 guides (1.7 MB) — bloated for a
  // reader and redundant with /sitemap.xml, which already lists every guide.
  const guides = [...GUIDES]
    .sort((a, b) => b.lastVerified.localeCompare(a.lastVerified))
    .slice(0, FEED_ITEMS);
  const lastBuildDate = guides[0] ? new Date(guides[0].lastVerified).toUTCString() : new Date().toUTCString();

  const items = guides
    .map(
      (g) => `    <item>
      <title>${esc(g.titleEn)}</title>
      <link>${BASE}/guides/${g.slug}</link>
      <guid isPermaLink="true">${BASE}/guides/${g.slug}</guid>
      <description>${esc(g.descriptionEn)}</description>
      <category>${esc(g.category)}</category>
      <pubDate>${new Date(g.lastVerified).toUTCString()}</pubDate>
    </item>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GlobalStudyBoard — Guides</title>
    <link>${BASE}/guides</link>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Guides on universities, entrance exams, scholarships, and studying abroad — worldwide.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Cache aggressively — feed content only changes on redeploy.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
