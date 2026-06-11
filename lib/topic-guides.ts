import type { Guide } from './guides';
import { GUIDES } from './guides';
import { TOPICS, getTopicBySlug, type Topic } from './topics';

// ─────────────────────────────────────────────────────────────────────────────
// Topic ↔ guide resolution helpers.
//
// These live in their OWN module (not lib/topics.ts) on purpose: they depend on
// the heavy GUIDES data array (~1.5 MB). Keeping them out of topics.ts means a
// Client Component can import the lightweight TOPICS array / TOPIC_GROUP_LABELS
// from '@/lib/topics' WITHOUT webpack dragging the entire guide catalogue into
// the browser bundle. Only server components + build scripts import this file.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every guide shown on a topic hub: the curated `guideSlugs` (in their listed
 * order) merged with any guide that tags the topic, de-duplicated. Returns the
 * full Guide objects, skipping any slug that no longer resolves.
 */
export function guidesForTopic(slug: string): Guide[] {
  const topic = getTopicBySlug(slug);
  if (!topic) return [];
  const order = new Map<string, number>();
  topic.guideSlugs.forEach((s, i) => order.set(s, i));
  let next = topic.guideSlugs.length;
  for (const g of GUIDES) {
    if (g.tags?.includes(slug) && !order.has(g.slug)) order.set(g.slug, next++);
  }
  return GUIDES.filter((g) => order.has(g.slug)).sort(
    (a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0),
  );
}

/** Topics a given guide belongs to (explicit tags first, then any curated hub). */
export function topicsForGuide(guide: Guide): Topic[] {
  const slugs = new Set<string>(guide.tags ?? []);
  for (const t of TOPICS) if (t.guideSlugs.includes(guide.slug)) slugs.add(t.slug);
  return TOPICS.filter((t) => slugs.has(t.slug));
}
