/**
 * Saved pages ("shortlist") — the shared vocabulary between the Save button on
 * content pages and the list on /account. No Supabase import here: this file is
 * safe for any client component.
 *
 * A row stores only (kind, slug, title snapshot, region); the href is DERIVED
 * from kind + slug so a stored path can never point anywhere but our own
 * content routes. The slug shape is enforced by the database CHECK too.
 */

import type { RegionSlug } from '@/lib/regions';

export const SAVED_KINDS = ['guide', 'college', 'exam', 'topic'] as const;
export type SavedKind = (typeof SAVED_KINDS)[number];

export const SAVED_KIND_LABEL: Record<SavedKind, string> = {
  guide: 'Guide',
  college: 'University',
  exam: 'Exam',
  topic: 'Topic hub',
};

const PREFIX: Record<SavedKind, string> = {
  guide: '/guides/',
  college: '/colleges/',
  exam: '/exams/',
  topic: '/topics/',
};

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,119}$/;

export function isSavedKind(v: unknown): v is SavedKind {
  return typeof v === 'string' && (SAVED_KINDS as readonly string[]).includes(v);
}

export function savedItemHref(kind: SavedKind, slug: string): string {
  return SLUG_RE.test(slug) ? `${PREFIX[kind]}${slug}` : '/';
}

export interface SavedItemRow {
  kind: SavedKind;
  slug: string;
  title: string;
  region: RegionSlug | 'global' | null;
  created_at: string;
}

/** Props a content page passes to <SaveButton/>. */
export interface SaveTarget {
  kind: SavedKind;
  slug: string;
  title: string;
  region?: RegionSlug | 'global' | null;
}
