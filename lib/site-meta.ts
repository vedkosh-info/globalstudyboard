// Single source of truth for the site's freshness signals.
//
// GlobalStudyBoard intentionally does NOT advertise a company "established" /
// "founded" / "launched" year ANYWHERE on the site — not on utility, listing or
// content pages, not in the header/footer, and not on /about (it adds no SEO
// value and can bias a new site's perceived authority). Instead we surface
// *freshness*: the admissions cycle the content targets, plus a "last updated"
// date on each page. The /about page may carry the mission/origin story, but
// must NOT state a founding/establishment/launch year.
//
// Per-content units (guides, and some exams) keep their own truthful
// `lastVerified` date and should display that. Pages without a per-unit date
// (listings, region and college pages, static pages) display SITE_REVIEWED.
// Update SITE_REVIEWED whenever the catalogue is broadly re-reviewed — never
// back-date it or fake a date you did not actually review.

/** Admissions cycle the site currently targets (shown in the global footer). */
export const ADMISSIONS_CYCLE = '2026–2027';

/**
 * The site's one-sentence description, naming ALL nine destinations so that no
 * site-level snippet, social card or manifest can quietly omit a destination
 * again (three were missing from the previous copy). ≤160 chars.
 */
export const SITE_DESCRIPTION =
  'Official-source guides to universities, exams, scholarships and student visas: USA, UK & Ireland, Canada, Europe, Australia & NZ, Asia, the Gulf, Russia, India.';

/**
 * The nine destinations on one line, for surfaces with no room for a sentence
 * (the site social card, the web-app manifest). Same rule as SITE_DESCRIPTION:
 * every destination named, none left to "and more".
 */
export const DESTINATION_LINE =
  'USA · UK & Ireland · Canada · Europe · Australia & NZ · East & SE Asia · Middle East · Russia & CIS · India';

/**
 * The site's official contact address — single source of truth. Used by the
 * contact page, the About CTA, the correction/copyright channel and the
 * Organization structured data, so the address can never drift out of sync
 * across surfaces. A branded, domain-based address (not a personal inbox) is
 * the professional, trust-building choice for the public site.
 */
export const CONTACT_EMAIL = 'contact@globalstudyboard.com';

/** Month the catalogue was last broadly reviewed (ISO 'YYYY-MM'). */
// 2026-09: every one of the ~3,770 source URLs across guides, exams, colleges
// and regions was liveness-checked and 59 dead ones replaced with verified
// official pages (see scripts/linkcheck.ts and the audit log) — a genuine
// catalogue-wide re-review, which is the bar this date is meant to reflect.
export const SITE_REVIEWED = '2026-09';

/**
 * Sitemap <lastmod> for every URL that has no per-unit date (home, listings,
 * region hubs / category / track pages, colleges, topic hubs, static pages).
 * BUMP THIS TO THE DEPLOY DATE in the same commit as ANY change that alters
 * those pages (template, chrome, metadata or data). Google only trusts lastmod
 * when it verifiably tracks real changes; a frozen date (it sat at 2026-07-09
 * through eight later deploys) makes Google stop believing it. Guides and
 * stamped exams keep their own truthful `lastVerified`.
 */
export const SITE_LASTMOD = '2026-09-16';

/**
 * The publisher logo for Organization / Article structured data. Google's
 * Organization guidelines want a logo of at least 112×112 px; the 64×64 SVG
 * glyph used before was below that floor. This is the 512×512 PNG that also
 * backs the PWA manifest.
 */
export const ORG_LOGO = {
  url: 'https://www.globalstudyboard.com/icons/icon-512.png',
  width: 512,
  height: 512,
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Format an ISO date ('YYYY-MM-DD' or 'YYYY-MM') into a human label plus a
 * machine-readable value for `<time dateTime>`. Falls back to the raw input if
 * it is not a recognised ISO date (never throws). Avoids `new Date()` so the
 * label is timezone-stable.
 */

/**
 * Truncate a description for the meta/OpenGraph/Twitter `description` on a WORD
 * boundary (never mid-word) and append a single ellipsis ONLY when the text was
 * actually shortened. Search snippets are ~150–160 chars, so `max` defaults to
 * 160; a raw `.slice(0, 160)` produces broken partial words like "…admit car"
 * which read as low quality in the SERP. Never throws.
 */
export function metaDescription(text: string, max = 160): string {
  const t = (text ?? '').trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—-]+$/, '')}…`;
}

export function formatReviewed(input: string): { display: string; iso: string } {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(input.trim());
  if (!m) return { display: input, iso: input };
  const year = Number(m[1]);
  const monthName = MONTHS[Number(m[2]) - 1] ?? '';
  const day = m[3] ? Number(m[3]) : null;
  if (!monthName) return { display: input, iso: input };
  return {
    display: day ? `${day} ${monthName} ${year}` : `${monthName} ${year}`,
    iso: input,
  };
}
