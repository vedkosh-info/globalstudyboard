/**
 * Types + runtime guard for the Topics mega-menu JSON. Dependency-free so the
 * client menu can import it without pulling any catalogue into the bundle.
 */

/** One track entry in the mega-menu. */
export interface MenuTrack {
  label: string;
  href: string;
  preview: string | null;
}

/** Per-destination track projection, keyed by region slug. */
export type TopicsMenuData = Record<string, MenuTrack[]>;

/** The URL the static menu JSON is served from (robots-disallowed `/search` tree). */
export const TOPICS_MENU_URL = '/search/catalogue/topics-menu';

function isMenuTrack(v: unknown): v is MenuTrack {
  if (!v || typeof v !== 'object') return false;
  const t = v as Record<string, unknown>;
  return (
    typeof t.label === 'string' &&
    typeof t.href === 'string' &&
    t.href.startsWith('/') &&
    (t.preview === null || typeof t.preview === 'string')
  );
}

export function isTopicsMenuData(v: unknown): v is TopicsMenuData {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  return Object.values(v as Record<string, unknown>).every(
    (list) => Array.isArray(list) && list.every(isMenuTrack),
  );
}
