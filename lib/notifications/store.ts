/**
 * Which notifications this browser has read or dismissed.
 * localStorage only. No account id, and nothing here is sent to the server.
 * Described on the cookie policy (gsb-notifications-v1).
 */

import type { NoticeStore } from './types';

export const NOTIFICATION_STORE_KEY = 'gsb-notifications-v1';
const KEEP_MS = 90 * 24 * 60 * 60 * 1000;

export const EMPTY_STORE: NoticeStore = { read: {}, dismissed: {} };

function prune(map: Record<string, string> | undefined, now: number): Record<string, string> {
  const out: Record<string, string> = {};
  if (!map) return out;
  for (const [id, iso] of Object.entries(map)) {
    const at = Date.parse(iso);
    if (Number.isFinite(at) && now - at < KEEP_MS) out[id] = iso;
  }
  return out;
}

export function parseStore(raw: string | null, now = Date.now()): NoticeStore {
  if (!raw) return { read: {}, dismissed: {} };
  try {
    const parsed = JSON.parse(raw) as Partial<NoticeStore>;
    return {
      read: prune(parsed.read, now),
      dismissed: prune(parsed.dismissed, now),
    };
  } catch {
    return { read: {}, dismissed: {} };
  }
}

export function loadStore(now = Date.now()): NoticeStore {
  if (typeof window === 'undefined') return { read: {}, dismissed: {} };
  try {
    return parseStore(window.localStorage.getItem(NOTIFICATION_STORE_KEY), now);
  } catch {
    return { read: {}, dismissed: {} };
  }
}

export function saveStore(store: NoticeStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(NOTIFICATION_STORE_KEY, JSON.stringify(store));
  } catch {
    /* private mode — the open panel still works for this view */
  }
}
