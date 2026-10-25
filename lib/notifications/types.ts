/**
 * In-app notifications for GlobalStudyBoard.
 *
 * The bell, the unread count, and the panel follow the same interaction as a
 * notification centre: a count on the bell, a list, mark-all-read, and a
 * dismiss control on each row. The feed itself is this site's. There is no
 * push, no server schedule, and no device id.
 *
 * A future exam or deadline is one entry in SCHEDULED_NOTICES. Add it only
 * after the date has been read from an official notice. The list is empty
 * until then, so the site never invents a last date.
 */

export type NoticeKind = 'sites' | 'account' | 'app' | 'exam' | 'deadline';

export interface NoticeLink {
  href: string;
  label: string;
  external: boolean;
}

export interface FeedItem {
  id: string;
  kind: NoticeKind;
  title: string;
  body: string;
  createdAtISO: string;
  read: boolean;
  links?: NoticeLink[];
  /** `sign-in` opens the sign-in sheet. `app` opens Android early access. */
  action?: 'sign-in' | 'app';
  /** In-site page for a future exam or deadline row. */
  href?: string;
}

/**
 * A sourced exam or deadline. `from` is the first local day it may appear,
 * inclusive. `until` is the first local day it leaves, exclusive. Both are
 * `YYYY-MM-DD`. `href` is a path on this site.
 */
export interface ScheduledNotice {
  id: string;
  kind: 'exam' | 'deadline';
  title: string;
  body: string;
  href: string;
  from: string;
  until: string;
}

/** Official dates only. Do not put a guessed exam date here. */
export const SCHEDULED_NOTICES: readonly ScheduledNotice[] = [];

export interface NoticeStore {
  /** id → ISO time it was marked read. */
  read: Record<string, string>;
  /** id → ISO time it was dismissed. */
  dismissed: Record<string, string>;
}
