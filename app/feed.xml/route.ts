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

export function GET(): Response {
  // Newest-verified first; guides are the article-like content worth syndicating.
  const guides = [...GUIDES].sort((a, b) => b.lastVerified.localeCompare(a.lastVerified));

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
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
