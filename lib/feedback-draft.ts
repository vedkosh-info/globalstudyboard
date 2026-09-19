/**
 * localStorage draft for the site-wide feedback dialog.
 *
 * The triggers are on every page, so a visitor can start a report, wander off
 * to three other pages — or close the tab by accident — and find every typed
 * field exactly where they left it. Text persists here across reloads;
 * attachments are deliberately NOT stored (multi-MB base64 would blow the
 * ~5 MB localStorage budget and evict other keys) — they live in
 * <FeedbackHost/>'s React state, which survives client-side navigation because
 * the root layout never remounts. Only their NAMES are kept so the form can ask
 * the user to re-attach after a full reload. The optional EMAIL is never
 * persisted either: on a shared or library computer the next visitor must not
 * be handed the previous one's address (constitution §9).
 *
 * Disclosed on /cookies ("Strictly necessary" — a functional, first-party
 * draft the visitor typed themselves; no identifier, no tracking).
 */

import { CLIENT_REF_RE, MAX_ATTACHMENTS, type FeedbackKind } from '@/lib/feedback';

const DRAFT_KEY = 'gsb_feedback_draft';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // stale after 7 days

export interface FeedbackDraft {
  v: 1;
  /** Idempotency key for this report — see `newClientRef` in lib/feedback.ts. */
  clientRef: string;
  kind: FeedbackKind;
  url: string;
  title: string;
  /** Issue: what happens now. */
  actual: string;
  /** Issue: what should happen instead. */
  expected: string;
  /** Suggestion: the idea and how it helps. */
  idea: string;
  includeTech: boolean;
  /** Names only — see module doc; used for the "please re-attach" hint. */
  attachmentNames: string[];
  savedAt: number;
}

export type FeedbackDraftInput = Omit<FeedbackDraft, 'v' | 'savedAt'>;

export function loadFeedbackDraft(): FeedbackDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<FeedbackDraft> | null;
    if (
      !d || typeof d !== 'object' || d.v !== 1 ||
      (d.kind !== 'suggestion' && d.kind !== 'issue') ||
      typeof d.savedAt !== 'number'
    ) {
      return null;
    }
    if (Date.now() - d.savedAt > DRAFT_TTL_MS) {
      clearFeedbackDraft();
      return null;
    }
    return {
      v: 1,
      clientRef: typeof d.clientRef === 'string' && CLIENT_REF_RE.test(d.clientRef) ? d.clientRef : '',
      kind: d.kind,
      url: typeof d.url === 'string' ? d.url : '',
      title: typeof d.title === 'string' ? d.title : '',
      actual: typeof d.actual === 'string' ? d.actual : '',
      expected: typeof d.expected === 'string' ? d.expected : '',
      idea: typeof d.idea === 'string' ? d.idea : '',
      includeTech: d.includeTech !== false,
      attachmentNames: Array.isArray(d.attachmentNames)
        ? d.attachmentNames.filter((n): n is string => typeof n === 'string').slice(0, MAX_ATTACHMENTS)
        : [],
      savedAt: d.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveFeedbackDraft(draft: FeedbackDraftInput): void {
  try {
    const full: FeedbackDraft = { v: 1, ...draft, savedAt: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(full));
  } catch {
    /* storage full or denied — the in-memory form state still works */
  }
}

export function clearFeedbackDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/** A draft is worth keeping/restoring only if the user actually typed content. */
export function draftHasContent(
  d: Pick<FeedbackDraft, 'title' | 'actual' | 'expected' | 'idea'>,
): boolean {
  return Boolean(d.title.trim() || d.actual.trim() || d.expected.trim() || d.idea.trim());
}
