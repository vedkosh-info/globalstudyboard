// ─────────────────────────────────────────────────────────────────────────────
// Structured data (JSON-LD) builders.
//
// Emitted inline via <script type="application/ld+json"> on the relevant page.
// We keep shapes minimal and valid per schema.org so Google can produce rich
// results (HowTo, FAQ, ItemList) WITHOUT risking an "invalid structured data"
// penalty. We deliberately do NOT emit `Course` markup on our informational
// course guides — those pages describe a course generically, they do not offer
// one with a real provider, so Course markup there would be misleading/invalid.
// ─────────────────────────────────────────────────────────────────────────────

export interface JsonLdStep {
  name: string;
  text: string;
  /** Optional deep-link fragment to the section this step maps to (…/guides/slug#anchor). */
  url?: string;
}

/**
 * HowTo rich result for process / "how to" guides. Steps are derived from the
 * guide's sections (heading → step name, prose → step text). Only emit on guides
 * that genuinely describe an ordered process (see `isHowToGuide`). When a step
 * carries a section `url`, it is emitted so Google can deep-link the step.
 */
export function howToLd(opts: {
  name: string;
  description: string;
  url: string;
  steps: JsonLdStep[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: opts.name,
    description: opts.description,
    inLanguage: 'en',
    mainEntityOfPage: opts.url,
    step: opts.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.url ? { url: s.url } : {}),
    })),
  };
}

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

/**
 * Whether a guide describes an ordered, step-by-step process and so should emit
 * HowTo markup. Conservative: "how to …" guides with at least two sections.
 */
export function isHowToGuide(slug: string, sectionCount: number): boolean {
  return slug.startsWith('how-to-') && sectionCount >= 2;
}
