import type { Metadata } from 'next';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { ADMISSIONS_CYCLE, ORG_LOGO, metaDescription } from '@/lib/site-meta';
import { SEARCH_TITLE_OVERRIDES } from '@/lib/seo-title-overrides';

// ─────────────────────────────────────────────────────────────────────────────
// Shared SEO metadata helpers — the ONE place that knows how a page's <title>,
// canonical, RSS alternate, Open Graph and Twitter blocks are assembled.
//
// Why a helper: Next.js merges metadata SHALLOWLY per key. A page that sets
// `alternates.canonical` silently drops the root layout's `alternates.types`
// (the RSS discovery link), a page that sets `openGraph` drops the root's
// `siteName`/`locale`, and a page that sets nothing inherits the ROOT canonical
// (the home page!). Assembling every page through `pageMetadata()` makes those
// mistakes impossible to reintroduce (found by the September 2026 SEO audit on
// ~3,400 pages).
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = 'https://www.globalstudyboard.com';
export const SITE_NAME = 'GlobalStudyBoard';
export const HOME_SEARCH_TITLE = 'University Admissions, Entrance Exams & Study Abroad';
export const SEARCH_TITLE_LIMIT = 70;
const TITLE_SUFFIX = ` · ${SITE_NAME}`;
export const TITLE_TEMPLATE = `%s${TITLE_SUFFIX}`;

/**
 * Raw titles longer than this drop the " · GlobalStudyBoard" template suffix
 * (rendered as `{ absolute }`) so the keyword tail is what survives Google's
 * ~60-character title width — not the brand. Never shorten a title by removing
 * its destination word.
 */
export const TITLE_SUFFIX_BUDGET = SEARCH_TITLE_LIMIT - TITLE_SUFFIX.length;

/** Short admissions-cycle tag for titles backed by a reviewed date: "2026–2027" → "2026–27". */
export const CYCLE_SHORT = ADMISSIONS_CYCLE.replace(/^(\d{4})[–-]\d{2}(\d{2})$/, '$1–$2');

export interface OgImage {
  url: string;
  width: number;
  height: number;
  type: string;
  alt: string;
}

/** The site-wide social card (app/opengraph-image.tsx), in object form so og:image:alt/width/height/type are emitted. */
export const ROOT_OG_IMAGE: OgImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: 'GlobalStudyBoard — universities, entrance exams and scholarships across 9 study destinations',
};

/** The per-destination social card (app/regions/[region]/opengraph-image.tsx). */
export function regionOgImage(region: RegionSlug): OgImage {
  const r = getRegionBySlug(region);
  return {
    url: `/regions/${region}/opengraph-image`,
    width: 1200,
    height: 630,
    type: 'image/png',
    alt: r ? `Study in ${r.proseName} — GlobalStudyBoard` : ROOT_OG_IMAGE.alt,
  };
}

/**
 * Shared JSON-LD nodes. The author is the editorial team (its own @id, a child
 * of the Organization) — giving author and publisher the SAME @id with
 * different names made the graph merge into one contradictory node.
 */
export const PUBLISHER_LD = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: ORG_LOGO.url, width: ORG_LOGO.width, height: ORG_LOGO.height },
} as const;

export const EDITORIAL_TEAM_LD = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#editorial-team`,
  name: 'GlobalStudyBoard editorial team',
  url: `${SITE_URL}/editorial-policy`,
  parentOrganization: { '@id': `${SITE_URL}/#organization` },
} as const;

/** Full ISO date (YYYY-MM-DD…) — `article:modified_time` must never be a bare month. */
const FULL_DATE = /^\d{4}-\d{2}-\d{2}/;
function fullDate(value: string | undefined): string | undefined {
  return value && FULL_DATE.test(value) ? value : undefined;
}

/** Absolute URL of an OG image (JSON-LD `image` needs absolute URLs). */
export function absoluteImageUrl(img: OgImage): string {
  return img.url.startsWith('http') ? img.url : `${SITE_URL}${img.url}`;
}

/** The destination card when the unit belongs to one destination, else the site card. */
export function ogImageFor(region: RegionSlug | 'global' | null | undefined): OgImage {
  return region && region !== 'global' ? regionOgImage(region) : ROOT_OG_IMAGE;
}

/**
 * <title> value: the brand template for short titles, `{ absolute }` (no brand)
 * once the raw title would already fill the SERP width — every character of the
 * query-bearing title stays visible instead of being cut to make room for
 * " · GlobalStudyBoard".
 */
export function seoTitle(title: string, path = ''): Metadata['title'] {
  const override = SEARCH_TITLE_OVERRIDES[path];
  if (override) return { absolute: override };

  if (title.length > SEARCH_TITLE_LIMIT) {
    // Keep the full university identity and destination. The editable page
    // title and description already spell out the profile's other sections.
    if (path.startsWith('/colleges/')) {
      // Every tail collegeTitle() in app/colleges/[slug]/page.tsx can produce.
      const name = title.replace(
        /: (?:Rankings, Courses & Admission Tests|Admissions, Courses & How to Apply|Courses, Admission Tests & How to Apply|Admissions & How to Apply|Rankings & Admission Tests|Admission Tests & How to Apply)$/,
        '',
      );
      if (name !== title) {
        const withAdmissions = `${name}: Admissions`;
        return { absolute: withAdmissions.length <= SEARCH_TITLE_LIMIT ? withAdmissions : name };
      }
    }

    if (path.startsWith('/exams/')) {
      const exam = /^(.+) Exam (.+?): Pattern, Eligibility(, Fees)? & How to Prepare in (.+)$/.exec(title);
      if (exam) {
        const [, name, cycle, fees, region] = exam;
        const detailed = `${name} ${cycle}: Pattern, Eligibility${fees ? ' & Fees' : ''} (${region})`;
        return {
          absolute: detailed.length <= SEARCH_TITLE_LIMIT
            ? detailed
            : `${name} ${cycle}: Pattern & Eligibility (${region})`,
        };
      }
    }
  }
  return title.length > TITLE_SUFFIX_BUDGET ? { absolute: title } : title;
}

/** Canonical + the RSS discovery link together — `alternates` is replaced wholesale per segment. */
export function alternatesFor(path: string): NonNullable<Metadata['alternates']> {
  return {
    canonical: `${SITE_URL}${path}`,
    types: { 'application/rss+xml': `${SITE_URL}/feed.xml` },
  };
}

export interface PageMetadataInput {
  /** Raw, query-bearing title (no brand). */
  title: string;
  /** Explicit search title when the social preview uses a different title. */
  searchTitle?: string;
  /** Description text — always passed through metaDescription() (word-boundary cut). */
  description: string;
  /** Site-relative path ("/guides/foo"). Never a query string. */
  path: string;
  /** Open Graph object type. */
  type?: 'website' | 'article';
  /** Which social card. Defaults to the site card. */
  image?: OgImage;
  keywords?: string[];
  /** Article dates (ISO). `publishedTime` only when truly known — never a re-verification date. */
  publishedTime?: string;
  modifiedTime?: string;
  robots?: Metadata['robots'];
  /** Maximum description length (search snippets are ~155–160 chars). */
  descriptionMax?: number;
}

/**
 * Build a complete, self-consistent Metadata object for a page. Every content
 * and listing page uses this rather than hand-assembling the blocks.
 */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const image = input.image ?? ROOT_OG_IMAGE;
  const url = `${SITE_URL}${input.path}`;
  const description = metaDescription(input.description, input.descriptionMax ?? 155);
  const type = input.type ?? 'website';
  return {
    title: seoTitle(input.searchTitle ?? input.title, input.path),
    description,
    ...(input.keywords ? { keywords: input.keywords } : {}),
    alternates: alternatesFor(input.path),
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: 'en_US',
      url,
      title: input.title,
      description,
      images: [image],
      ...(type === 'article' && fullDate(input.modifiedTime)
        ? {
            modifiedTime: fullDate(input.modifiedTime),
            ...(fullDate(input.publishedTime) ? { publishedTime: fullDate(input.publishedTime) } : {}),
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description,
      images: [image],
    },
    ...(input.robots ? { robots: input.robots } : {}),
  };
}
