import type { MetadataRoute } from 'next';
import { REGIONS, REGION_SLUGS, matchesRegion, type RegionSlug } from '@/lib/regions';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { COLLEGES } from '@/lib/colleges';
import { GUIDES } from '@/lib/guides';
import { TOPICS } from '@/lib/topics';
import { guidesForTopic } from '@/lib/topic-guides';
import { REGION_CATEGORIES, regionCategoryPath } from '@/lib/region-nav';
import { multiHubTracks } from '@/lib/tracks';
import { SITE_LASTMOD } from '@/lib/site-meta';

// ─────────────────────────────────────────────────────────────────────────────
// Sitemap entries, split into one file per section so Search Console reports
// coverage per section (and per destination for guides) instead of one opaque
// 3,378-URL number. `app/sitemap.ts` emits each file at /sitemap/{id}.xml and
// `app/sitemap.xml/route.ts` emits the index that points at them.
//
// <lastmod> honesty (Google only uses lastmod while it keeps matching reality):
//   • guides / exams — the unit's own lastVerified (its content-verification
//     date, the same value the page shows as dateModified); an unstamped exam
//     falls back to SITE_LASTMOD;
//   • hubs / region pages — the newest member guide's lastVerified or
//     SITE_LASTMOD, whichever is later (the page changes when either does);
//   • listings, colleges, static pages — SITE_LASTMOD, bumped on every deploy
//     that changes them (see lib/site-meta.ts).
// Google ignores <priority> and <changefreq>; they are not emitted.
// ─────────────────────────────────────────────────────────────────────────────

export const BASE = 'https://www.globalstudyboard.com';

export type SitemapId =
  | 'static'
  | 'destinations'
  | 'colleges'
  | 'exams'
  | 'topics'
  | `guides-${RegionSlug}`;

export const SITEMAP_IDS: SitemapId[] = [
  'static',
  'destinations',
  'colleges',
  'exams',
  'topics',
  ...REGION_SLUGS.map((r) => `guides-${r}` as const),
];

const later = (a: string, b: string): string => (a > b ? a : b);

function newestGuideDate(slugs: readonly string[] | undefined, fallback: string): string {
  if (!slugs || slugs.length === 0) return fallback;
  return slugs.reduce((acc, s) => {
    const g = GUIDES.find((x) => x.slug === s);
    return g ? later(acc, g.lastVerified) : acc;
  }, fallback);
}

const STATIC_PATHS = [
  '',
  '/regions',
  '/colleges',
  '/exams',
  '/guides',
  '/topics',
  '/scholarships',
  '/gsb-ai',
  '/about',
  '/editorial-policy',
  '/sources',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/cookies',
];

export function sitemapEntries(id: SitemapId): MetadataRoute.Sitemap {
  switch (id) {
    case 'static':
      return STATIC_PATHS.map((p) => ({ url: `${BASE}${p}`, lastModified: SITE_LASTMOD }));

    case 'destinations':
      return REGIONS.flatMap((r) => {
        const regionGuides = GUIDES.filter((g) => matchesRegion(r.slug, g.region, g.regions));
        const newest = regionGuides.reduce((acc, g) => later(acc, g.lastVerified), SITE_LASTMOD);
        return [
          { url: `${BASE}/regions/${r.slug}`, lastModified: newest },
          ...REGION_CATEGORIES.map((cat) => ({
            url: `${BASE}${regionCategoryPath(r.slug, cat)}`,
            lastModified: newest,
          })),
          ...multiHubTracks()
            .filter((t) => t.region === r.slug)
            .map((t) => ({
              url: `${BASE}/regions/${t.region}/track/${t.slug}`,
              lastModified: newest,
            })),
        ];
      });

    case 'colleges':
      return COLLEGES.map((c) => ({ url: `${BASE}/colleges/${c.slug}`, lastModified: SITE_LASTMOD }));

    case 'exams':
      return ENTRANCE_EXAMS.map((e) => ({
        url: `${BASE}/exams/${e.slug}`,
        lastModified: e.lastVerified ?? SITE_LASTMOD,
      }));

    case 'topics':
      return TOPICS.map((t) => ({
        url: `${BASE}/topics/${t.slug}`,
        lastModified: newestGuideDate(
          guidesForTopic(t.slug).map((g) => g.slug),
          SITE_LASTMOD,
        ),
      }));

    default: {
      const region = id.replace(/^guides-/, '') as RegionSlug;
      return GUIDES.filter((g) => g.region === region).map((g) => ({
        url: `${BASE}/guides/${g.slug}`,
        lastModified: g.lastVerified,
      }));
    }
  }
}

/** The newest lastmod inside one sitemap file — used for the index's <lastmod>. */
export function sitemapLastmod(id: SitemapId): string {
  return sitemapEntries(id).reduce(
    (acc, e) => later(acc, String(e.lastModified ?? SITE_LASTMOD).slice(0, 10)),
    '0000-00-00',
  );
}
