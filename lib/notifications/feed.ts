/**
 * Which notifications are in the panel right now.
 *
 * Visitors get the site note, the Android early-access note, and the account
 * note once a day. A signed-in student gets the site note and the Android note
 * once a week, and not the account note. Reading
 * keeps the row in the list. Dismissing hides it until the next occurrence.
 * A scheduled exam or deadline stays for its own date window.
 */

import {
  SCHEDULED_NOTICES,
  type FeedItem,
  type NoticeStore,
} from './types';

export const PARTNER_SITES = [
  { href: 'https://vedkosh.com', label: 'Vedkosh' },
  { href: 'https://tasteyatra.com', label: 'Tasteyatra' },
  { href: 'https://bharatboard.com', label: 'Bharatboard' },
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Monday of the local week, as YYYY-MM-DD. */
export function localWeekKey(d: Date): string {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const weekday = copy.getDay();
  const sinceMonday = weekday === 0 ? 6 : weekday - 1;
  copy.setDate(copy.getDate() - sinceMonday);
  return localDayKey(copy);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfLocalWeek(d: Date): Date {
  const key = localWeekKey(d);
  const [y, m, day] = key.split('-').map(Number);
  return new Date(y, m - 1, day);
}

type Occurrence = 'unread' | 'read' | 'dismissed';

function occurrence(store: NoticeStore, prefix: string, windowMs: number, now: number): Occurrence {
  for (const iso of Object.values(matching(store.dismissed, prefix))) {
    if (now - Date.parse(iso) < windowMs) return 'dismissed';
  }
  for (const iso of Object.values(matching(store.read, prefix))) {
    if (now - Date.parse(iso) < windowMs) return 'read';
  }
  return 'unread';
}

function matching(map: Record<string, string>, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [id, iso] of Object.entries(map)) {
    if (id.startsWith(prefix)) out[id] = iso;
  }
  return out;
}

export function relativeTime(iso: string, now: number): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return '';
  const minutes = Math.floor(Math.max(0, now - at) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

export function buildFeed(now: Date, signedIn: boolean, store: NoticeStore): FeedItem[] {
  const at = now.getTime();
  const items: FeedItem[] = [];

  const sitesWindow = signedIn ? WEEK_MS : DAY_MS;
  const sitesState = occurrence(store, 'sites:', sitesWindow, at);
  if (sitesState !== 'dismissed') {
    const periodStart = signedIn ? startOfLocalWeek(now) : startOfLocalDay(now);
    const id = signedIn ? `sites:${localWeekKey(now)}` : `sites:${localDayKey(now)}`;
    items.push({
      id,
      kind: 'sites',
      title: 'GlobalStudyBoard',
      body: 'Please explore our other sites.',
      createdAtISO: periodStart.toISOString(),
      read: sitesState === 'read',
      links: PARTNER_SITES.map((site) => ({ ...site, external: true })),
    });
  }

  const appState = occurrence(store, 'app:', sitesWindow, at);
  if (appState !== 'dismissed') {
    const periodStart = signedIn ? startOfLocalWeek(now) : startOfLocalDay(now);
    const id = signedIn ? `app:${localWeekKey(now)}` : `app:${localDayKey(now)}`;
    items.push({
      id,
      kind: 'app',
      title: 'Android app',
      body: 'Enroll for early access to the exclusive Android app.',
      createdAtISO: periodStart.toISOString(),
      read: appState === 'read',
      action: 'app',
    });
  }

  if (!signedIn) {
    const accountState = occurrence(store, 'account:', DAY_MS, at);
    if (accountState !== 'dismissed') {
      items.push({
        id: `account:${localDayKey(now)}`,
        kind: 'account',
        title: 'Your account',
        body: 'Sign in or create an account for a better experience.',
        createdAtISO: startOfLocalDay(now).toISOString(),
        read: accountState === 'read',
        action: 'sign-in',
      });
    }
  }

  const today = localDayKey(now);
  for (const notice of SCHEDULED_NOTICES) {
    if (today < notice.from || today >= notice.until) continue;
    if (store.dismissed[notice.id]) continue;
    items.push({
      id: notice.id,
      kind: notice.kind,
      title: notice.title,
      body: notice.body,
      href: notice.href,
      createdAtISO: new Date(`${notice.from}T00:00:00`).toISOString(),
      read: Boolean(store.read[notice.id]),
    });
  }

  return items;
}

export function unreadCount(items: readonly FeedItem[]): number {
  return items.reduce((n, item) => n + (item.read ? 0 : 1), 0);
}
