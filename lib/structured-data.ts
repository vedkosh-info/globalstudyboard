// ─────────────────────────────────────────────────────────────────────────────
// Structured data (JSON-LD) builders.
//
// Emitted inline via <script type="application/ld+json"> on the relevant page.
// Shapes are kept minimal and valid per schema.org and — more importantly — per
// what Google STILL consumes (checked September 2026):
//   • Article (guides, exams), BreadcrumbList, Organization, WebSite (site name),
//     ItemList/CollectionPage on hubs and listings — all emitted.
//   • HowTo — NOT emitted: Google removed the How-to rich result in September
//     2023; the block only duplicated every section's prose in the HTML.
//   • FAQPage — emitted only where the Q&A is visible on the page (guides);
//     Google retired the FAQ rich result in May 2026, so it earns no SERP
//     feature, but valid, visible FAQ markup is harmless and machine-readable.
//   • WebSite.potentialAction (sitelinks search box) — NOT emitted: retired by
//     Google in November 2024.
// We deliberately do NOT emit `Course` markup on informational course guides —
// they describe a course generically, they do not offer one with a provider.
// ─────────────────────────────────────────────────────────────────────────────

export interface JsonLdPart {
  name: string;
  /** Deep-link fragment URL for this section (…/guides/slug#anchor). */
  url: string;
}

/**
 * `hasPart` fragments for an Article/WebPage so search engines can understand a
 * page's sections as distinct, deep-linkable parts (WebPageElement + @id). This
 * is what lets a section like "Eligibility" surface and be jumped-to directly.
 * Emitted for informational guides regardless of whether they are HowTo.
 */
export function pageHasParts(pageUrl: string, parts: JsonLdPart[]) {
  return parts.map((p, i) => ({
    '@type': 'WebPageElement',
    '@id': p.url,
    name: p.name,
    url: p.url,
    isPartOf: { '@id': `${pageUrl}#article` },
    position: i + 1,
  }));
}

/** ItemList for hub / list pages so the curated set can surface as a list. */
export function itemListLd(opts: {
  name: string;
  items: { name: string; url: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

