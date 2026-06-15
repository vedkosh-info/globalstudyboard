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

/** Month the catalogue was last broadly reviewed (ISO 'YYYY-MM'). */
export const SITE_REVIEWED = '2026-06';

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
