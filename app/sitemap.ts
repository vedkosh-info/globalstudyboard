import type { MetadataRoute } from 'next';
import { REGIONS } from '@/lib/regions';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { COLLEGES } from '@/lib/colleges';
import { GUIDES } from '@/lib/guides';
import { TOPICS } from '@/lib/topics';
import { REGION_CATEGORIES, regionCategoryPath } from '@/lib/region-nav';
import { multiHubTracks } from '@/lib/tracks';

// Statically pre-generated at build time — never re-run on each request.
export const dynamic = 'force-static';

const BASE = 'https://www.globalstudyboard.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Site-wide "last significant update" date for URLs that have no per-unit date.
  // Google only trusts <lastmod> when it is verifiably accurate, so keep this
  // honest: BUMP IT TO THE DEPLOY DATE on every release (never let it predate a
  // real content/structure change). Guides carry their own truthful lastVerified;
  // exams use theirs when stamped, otherwise this date.
  const now = '2026-07-09';
  return [
    { url: BASE,                  lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/regions`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/colleges`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/exams`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/guides`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/topics`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BASE}/scholarships`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/gsb-ai`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/disclaimer`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/sources`,     lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/cookies`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    ...REGIONS.map((r) => ({
      url: `${BASE}/regions/${r.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    // Region-scoped section pages (region × category).
    ...REGIONS.flatMap((r) =>
      REGION_CATEGORIES.map((cat) => ({
        url: `${BASE}${regionCategoryPath(r.slug, cat)}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.85,
      })),
    ),
    // Multi-hub track landing pages (e.g. /regions/india/track/foreign-nri-admission).
    // Single-hub tracks have no page (dynamicParams=false 404s them; trackHref sends
    // them straight to /topics/{slug}, already sitemapped via TOPICS).
    ...multiHubTracks().map((t) => ({
      url: `${BASE}/regions/${t.region}/track/${t.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...ENTRANCE_EXAMS.map((e) => ({
      url: `${BASE}/exams/${e.slug}`,
      lastModified: e.lastVerified ?? now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...COLLEGES.map((c) => ({
      url: `${BASE}/colleges/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...GUIDES.map((g) => ({
      url: `${BASE}/guides/${g.slug}`,
      lastModified: g.lastVerified,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
    ...TOPICS.map((t) => ({
      url: `${BASE}/topics/${t.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
