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
}

/**
 * HowTo rich result for process / "how to" guides. Steps are derived from the
 * guide's sections (heading → step name, prose → step text). Only emit on guides
 * that genuinely describe an ordered process (see `isHowToGuide`).
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
    })),
  };
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
