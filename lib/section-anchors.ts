// ─────────────────────────────────────────────────────────────────────────────
// Section anchors — the single source of truth for deep-linkable #fragments.
//
// Every guide section (and FAQ) gets a stable, unique, URL-safe id derived from
// its heading. The guide page render, the "On this page" table of contents, the
// JSON-LD (hasPart / HowTo step url / FAQ @id) and the site search ALL derive
// their anchors from these helpers, so a link like
//   /guides/how-to-get-into-iit#eligibility
// resolves to exactly the section it names. Pure (no React) so it is usable on
// the server (page render, CMI build) and the client (search) alike.
// ─────────────────────────────────────────────────────────────────────────────

/** Deterministic, URL-safe fragment id from arbitrary heading text. */
export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return s || 'section';
}

/** A section shape that can yield an anchor: an authored `id` wins, else heading. */
export interface Anchorable {
  headingEn: string;
  /** Optional authored stable id (kebab-case). Falls back to slugified heading. */
  id?: string;
}

/**
 * Page-level ids a guide section anchor must NEVER collide with (the Article
 * JSON-LD `@id` uses `#article`; the FAQ block's `<section>` uses `#faqs`). A
 * section that would slugify to one of these is bumped to `<base>-2`. Both the
 * CMI (search) and the page render MUST pass this SAME set so their anchors stay
 * identical (parity).
 */
export const RESERVED_GUIDE_ANCHORS = ['article', 'faqs'] as const;

/**
 * Stable, UNIQUE anchor per section within one guide, in section order.
 * Prefers an authored `id`; otherwise slugifies the heading. Collisions (with a
 * sibling OR a `reserved` page id) are de-duplicated with `-2`, `-3`… so every
 * section has a distinct #fragment and the render / ToC / schema / search all
 * agree. Index-stable: the Nth anchor always maps to the Nth section
 * (audience-hidden sections still hold their slot, since they remain in the DOM).
 */
export function sectionAnchors(sections: Anchorable[], reserved: readonly string[] = []): string[] {
  const seen = new Map<string, number>();
  for (const r of reserved) seen.set(r, 1); // a section matching a reserved id becomes `<id>-2`
  return sections.map((s) => {
    const base = s.id && s.id.trim() ? slugify(s.id) : slugify(s.headingEn);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  });
}

/** Anchor for a single FAQ question, prefixed to avoid clashing with sections. */
export function faqAnchor(questionEn: string): string {
  return `faq-${slugify(questionEn)}`;
}
