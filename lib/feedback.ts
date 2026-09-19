/**
 * Shared contract for the site-wide "Share feedback / Report an issue" form —
 * the ONE place the client dialog, the /api/feedback route and the Apps Script
 * mirror read their limits from, so the sides can never drift apart.
 *
 * Isomorphic on purpose: no browser globals at module scope, so the API route
 * and the client component import the same file (the browser helpers below
 * only touch `window` inside a function body).
 *
 * Attachment policy (the server MUST re-validate everything below):
 *  - Only JPG / PNG / PDF, verified by MAGIC BYTES server-side — a file
 *    extension or a client-supplied MIME type is never trusted.
 *  - Sizes are capped well under Vercel's ~4.5 MB serverless request-body
 *    ceiling: attachments travel as base64 inside the JSON body, which inflates
 *    bytes by 4/3, so 2.5 MB of files is ~3.4 MB on the wire.
 */

export type FeedbackKind = 'suggestion' | 'issue';

export type AllowedAttachmentMime = 'image/jpeg' | 'image/png' | 'application/pdf';

/** What the client keeps per attached file: metadata + raw base64 (no data: prefix). */
export interface FeedbackAttachment {
  /** Stable per-pick id — chips are keyed by it, never by index or name. */
  id: string;
  name: string;
  mime: AllowedAttachmentMime;
  size: number;
  base64: string;
  /** Object URL of the picked File for the thumbnail (images only); revoked on removal. */
  previewUrl?: string;
}

export const MAX_ATTACHMENTS = 2;
export const MAX_ATTACHMENT_BYTES = 1_572_864; // 1.5 MB per file
export const MAX_TOTAL_ATTACHMENT_BYTES = 2_621_440; // 2.5 MB combined
export const MIN_ATTACHMENT_BYTES = 128; // reject empty / garbage stubs

/** File extension used when re-naming an attachment for storage and email. */
export const MIME_EXTENSION: Record<AllowedAttachmentMime, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'application/pdf': 'pdf',
};

// Field caps — enforced with maxLength client-side AND re-checked server-side.
export const FEEDBACK_URL_MAX = 1000;
export const FEEDBACK_TITLE_MAX = 140;
export const FEEDBACK_TEXT_MAX = 3000;
export const FEEDBACK_EMAIL_MAX = 254;
export const FEEDBACK_TECH_MAX = 600;

/**
 * Structural email check, deliberately permissive on the local part and domain
 * (any provider is fine — this is only for a follow-up reply). Length caps
 * follow RFC 5321. Mirrors the tester-invite route.
 */
export const FEEDBACK_EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

/** Exact decoded byte count of a (padded) base64 string without decoding it. */
export function base64Bytes(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Idempotency key for one report. Generated once per draft (and persisted with
 * it), sent with the submission, and remembered by the Apps Script for a few
 * hours: if the site's request times out AFTER the script had actually finished
 * (a 2.5 MB report on a cold start can take longer than the route waits), the
 * visitor's retry is recognised and answered with the original reference
 * instead of filing a duplicate.
 */
export const CLIENT_REF_RE = /^[A-Za-z0-9-]{8,64}$/;

export function newClientRef(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/**
 * Magic-byte sniffing — the ONLY authority on an attachment's real type.
 * JPEG (FF D8 FF), PNG (89 50 4E 47 0D 0A 1A 0A), PDF (%PDF). Returns null for
 * anything else, so a disguised script, SVG, HTML page or executable never gets
 * through regardless of what the file was called.
 */
export function sniffAttachmentType(head: Uint8Array): AllowedAttachmentMime | null {
  if (
    head.length >= 8 &&
    head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47 &&
    head[4] === 0x0d && head[5] === 0x0a && head[6] === 0x1a && head[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return 'image/jpeg';
  }
  if (head.length >= 4 && head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) {
    return 'application/pdf';
  }
  return null;
}

/**
 * Sanitize a client filename into a safe slug. The extension is NEVER taken
 * from the client name — the caller appends one from MIME_EXTENSION after
 * magic-byte sniffing, so an "invoice.pdf.exe" style name can never survive.
 */
export function safeAttachmentBaseName(clientName: string, fallback: string): string {
  const base = clientName
    .replace(/\.[A-Za-z0-9]{1,8}$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base || fallback;
}

/** Human-readable size for the attachment chips and the review step. */
export function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(n / 1024))} KB`;
}

/** The hostnames that carry GlobalStudyBoard pages (apex + www). */
export const SITE_HOSTNAMES: readonly string[] = ['globalstudyboard.com', 'www.globalstudyboard.com'];

/**
 * The ONE page-link host rule, used by the dialog (with `window.location.host`)
 * and by the route (with the request's own host): a hostname can carry one of
 * our pages if it is the canonical site or the host the visitor is on right now
 * (Vercel preview URLs, local dev). Any other host is refused — an arbitrary
 * link would turn the owner's inbox and sheet into a click-through for
 * attacker-chosen URLs dressed up as one of our own pages.
 */
export function isFeedbackPageHost(hostname: string, ownHost: string): boolean {
  const h = hostname.toLowerCase();
  if (SITE_HOSTNAMES.includes(h)) return true;
  const own = ownHost.toLowerCase().replace(/:\d+$/, '');
  return own !== '' && h === own;
}

/**
 * Link check for the "Page link" field: accepts https://…, http://…, or a bare
 * domain path, and returns the normalised href — or null when it is not a web
 * URL on GlobalStudyBoard. The server re-validates with the same rule.
 */
export function normalizeFeedbackUrl(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const parse = (raw: string): URL | null => {
    try {
      return new URL(raw);
    } catch {
      return null;
    }
  };
  const u = parse(v) ?? parse(`https://${v}`);
  if (!u) return null;
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  const ownHost = typeof window !== 'undefined' ? window.location.host : '';
  return isFeedbackPageHost(u.hostname, ownHost) ? u.href : null;
}

/**
 * A one-line, human summary of a user-agent string ("Chrome on Android") for
 * the preview under the browser-details checkbox. Best effort — the raw string
 * is still shown (and sent) in full; this only makes the default view readable.
 */
export function summarizeUserAgent(ua: string): string {
  const browser =
    /Edg\//.test(ua) ? 'Edge'
    : /OPR\//.test(ua) ? 'Opera'
    : /SamsungBrowser\//.test(ua) ? 'Samsung Internet'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Browser';
  const os =
    /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /CrOS/.test(ua) ? 'ChromeOS'
    : /Linux/.test(ua) ? 'Linux'
    : '';
  return os ? `${browser} on ${os}` : browser;
}

// ── Opening the dialog from anywhere ────────────────────────────────────────

/**
 * Event dispatched by every "Share feedback" / "Report an issue" trigger
 * (quick-actions dock, footer, mobile menu, contact page, and the per-page
 * "Report an issue" reason chips in ContentActions) to open the global
 * <FeedbackHost/>. Kept here so triggers and the dialog share one source of
 * truth without importing each other — same pattern as `lib/tester-invite.ts`.
 */
export const OPEN_FEEDBACK_EVENT = 'gsb:open-feedback';

/**
 * Marks every persistent trigger (`<FeedbackButton/>`), so the dialog can hand
 * focus back to one when the element that opened it has since unmounted.
 */
export const FEEDBACK_TRIGGER = 'data-feedback-trigger';

export interface FeedbackPrefill {
  /** Suggested title, e.g. "Broken link — UK Student Visa: A Factual Guide". */
  title?: string;
  /**
   * `null` starts the Page link EMPTY instead of the current page — for triggers
   * on pages that are never the subject of a report (the contact page).
   */
  url?: null;
}

export interface OpenFeedbackDetail {
  /** Which tab the dialog opens on. Omit to keep whatever the draft last used. */
  kind?: FeedbackKind;
  /**
   * Starting values for an otherwise EMPTY form. A draft the visitor already
   * typed always wins — a prefill never overwrites their words.
   */
  prefill?: FeedbackPrefill;
}

/**
 * Focus return for triggers that UNMOUNT when used (a dock item, a menu row, a
 * reason chip). Put `FEEDBACK_RETURN_SCOPE` on the host's root and
 * `FEEDBACK_RETURN` on its persistent toggle: when the dialog closes and the
 * opener is gone, focus lands on that toggle — where the visitor was — instead
 * of on the footer trigger, which would scroll the page to the bottom.
 */
export const FEEDBACK_RETURN_SCOPE = 'data-feedback-return-scope';
export const FEEDBACK_RETURN = 'data-feedback-return';

/** Open the feedback dialog from any client component. */
export function openFeedback(kind?: FeedbackKind, prefill?: FeedbackPrefill): void {
  window.dispatchEvent(
    new CustomEvent<OpenFeedbackDetail>(OPEN_FEEDBACK_EVENT, { detail: { kind, prefill } }),
  );
}
