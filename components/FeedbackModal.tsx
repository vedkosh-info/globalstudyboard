'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import {
  Bug,
  CheckCircle2,
  FileText,
  Lightbulb,
  Link2,
  MessageSquarePlus,
  Paperclip,
  Trash2,
  X,
} from 'lucide-react';
import { useRegion } from '@/components/RegionProvider';
import { useAudience } from '@/components/AudienceProvider';
import { defaultAudienceFor } from '@/lib/audience';
import { CONTACT_EMAIL } from '@/lib/site-meta';
import {
  FEEDBACK_EMAIL_MAX,
  FEEDBACK_EMAIL_RE,
  FEEDBACK_TEXT_MAX,
  FEEDBACK_TITLE_MAX,
  FEEDBACK_URL_MAX,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  MAX_TOTAL_ATTACHMENT_BYTES,
  MIN_ATTACHMENT_BYTES,
  formatBytes,
  newClientRef,
  normalizeFeedbackUrl,
  sniffAttachmentType,
  summarizeUserAgent,
  type FeedbackAttachment,
  type FeedbackKind,
  type FeedbackPrefill,
} from '@/lib/feedback';
import {
  clearFeedbackDraft,
  draftHasContent,
  loadFeedbackDraft,
  saveFeedbackDraft,
} from '@/lib/feedback-draft';
import { lockBackground, trapTab } from '@/lib/dialog-a11y';

/**
 * "Share feedback / Report an issue" dialog — a suggestion or an issue report
 * from any visitor, with up to two screenshots/PDFs, posted to /api/feedback.
 *
 * UX contract:
 *  - Draft caching: typed fields autosave to localStorage (debounced, flushed
 *    on close) so a visitor can navigate anywhere, reopen from any page, and
 *    continue. ONLY drafts with real content are saved — merely opening the
 *    dialog must never pin a stale page URL over the next page's capture.
 *    Attachments live in <FeedbackHost/>'s state (they survive client-side
 *    navigation; after a full reload only their names survive → re-attach hint).
 *    The optional email is memory-only (shared devices).
 *  - An unsent draft always wins over the trigger: it opens on ITS tab with ITS
 *    page link, under a banner that names the page and offers one explicit
 *    action — "Discard & start new" (or "Discard & report this page" when a
 *    page's own "Report issue" chip opened the dialog). The visitor's words are
 *    never hidden behind another tab and never silently swapped to a new page.
 *  - Page link is required for an issue (an issue is about a page) and optional
 *    for a suggestion (which may be site-wide).
 *  - A review step guards against accidental submission and lets the visitor
 *    check the attachments they picked.
 *  - Honest outcomes: "sent" is shown only after the server confirmed the write;
 *    on any failure the draft is kept and the visitor is told to retry. Each
 *    draft carries an idempotency key so a retry after a timeout cannot file
 *    the same report twice. The dialog cannot be closed mid-send.
 *
 * Accessibility: a real focus-trapped dialog (`lib/dialog-a11y.ts`, the same
 * treatment as <TesterInviteModal/>) — body scroll is locked, the background is
 * made `inert`, Tab/Shift+Tab cycle inside the panel, Escape closes (never mid-send), validation errors are tied
 * to their fields and the first invalid field receives focus and is scrolled
 * clear of the fixed action row, live regions are always mounted so their
 * first change is announced, and focus lands on the step's landmark (form
 * field / review summary / outcome) on every transition.
 *
 * Layout: header and action row are fixed; only the form body scrolls — so the
 * primary button is always reachable on a phone without scrolling past a long
 * form. Bottom sheet below `sm`, centred card above.
 */

const API_URL = '/api/feedback';

type Step = 'form' | 'review' | 'done';
type AttachErrorKey = 'tooMany' | 'tooBig' | 'totalBig' | 'badType';

const ATTACH_ERRORS: Record<AttachErrorKey, string> = {
  tooMany: `A maximum of ${MAX_ATTACHMENTS} files can be attached.`,
  tooBig: 'That file is over the 1.5 MB limit.',
  totalBig: 'Attachments together must stay under 2.5 MB.',
  badType: 'Only JPG, PNG or PDF files are accepted.',
};

const GENERIC_ERROR = 'Something went wrong. Your draft is safe — please try again.';

/** FileReader → raw base64 (no data: prefix). */
function readFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** "/guides/uk-student-visa-guide" for the draft banner; falls back to the href. */
function pathOf(href: string): string {
  try {
    const u = new URL(href);
    return u.pathname + u.search;
  } catch {
    return href;
  }
}

let attachmentSeq = 0;

interface Props {
  onClose: () => void;
  /** Tab the trigger asked for; undefined keeps whatever the draft last used. */
  requestedKind?: FeedbackKind;
  /** Starting values for an EMPTY form; a draft with content always wins. */
  prefill?: FeedbackPrefill;
  attachments: FeedbackAttachment[];
  setAttachments: (a: FeedbackAttachment[]) => void;
}

export default function FeedbackModal({
  onClose,
  requestedKind,
  prefill,
  attachments,
  setAttachments,
}: Props) {
  const { effectiveRegion } = useRegion();
  const { chosenAudience } = useAudience();

  // ── Draft-backed form state (lazy init so localStorage is read once) ──
  // A draft counts only when the user actually typed/attached something —
  // otherwise its stale URL must not override the current page.
  const initialDraft = useMemo(() => loadFeedbackDraft(), []);
  const draftHasText = Boolean(initialDraft && draftHasContent(initialDraft));
  const draftUsable = Boolean(
    initialDraft && (draftHasText || initialDraft.attachmentNames.length > 0),
  );
  const prefillTitle = (prefill?.title ?? '').slice(0, FEEDBACK_TITLE_MAX);
  const here = typeof window !== 'undefined' ? window.location.href : '';
  // What a fresh form starts with: the current page, unless the trigger sits on
  // a page that is never the subject of a report (`url: null`).
  const freshUrl = prefill?.url === null ? '' : here;

  // An unsent draft with words opens on ITS tab; otherwise the trigger decides.
  const initialKind: FeedbackKind =
    draftHasText && initialDraft
      ? initialDraft.kind
      : (requestedKind ?? (prefill?.title ? 'issue' : 'suggestion'));
  const [kind, setKind] = useState<FeedbackKind>(initialKind);
  const [url, setUrl] = useState(() => (draftUsable && initialDraft?.url) || freshUrl);
  const [title, setTitle] = useState(() =>
    draftUsable ? initialDraft?.title || '' : prefillTitle,
  );
  const [actual, setActual] = useState((draftUsable && initialDraft?.actual) || '');
  const [expected, setExpected] = useState((draftUsable && initialDraft?.expected) || '');
  const [idea, setIdea] = useState((draftUsable && initialDraft?.idea) || '');
  // Memory only — deliberately not part of the persisted draft (shared devices).
  const [email, setEmail] = useState('');
  // Browser details are ticked by default for ISSUE reports (they are what
  // makes a bug reproducible) and off for suggestions (nothing to reproduce —
  // data minimisation, constitution §9.1). The box follows the tab only until
  // the visitor touches it; their choice then sticks.
  const [includeTech, setIncludeTech] = useState(
    initialDraft?.includeTech ?? initialKind === 'issue',
  );
  const [techTouched, setTechTouched] = useState(Boolean(initialDraft));
  const [clientRef, setClientRef] = useState(
    () => (draftUsable && initialDraft?.clientRef) || newClientRef(),
  );
  const [honeypot, setHoneypot] = useState('');
  // Notices about the restored draft — state, so "Discard" clears them.
  const [restoredFromDraft, setRestoredFromDraft] = useState(draftHasText);
  const [restoredPath] = useState(() =>
    draftHasText && initialDraft?.url ? pathOf(initialDraft.url) : '',
  );
  const [lostAttachmentNames, setLostAttachmentNames] = useState<string[]>(
    initialDraft && initialDraft.attachmentNames.length > 0 && attachments.length === 0
      ? initialDraft.attachmentNames
      : [],
  );
  // The trigger asked for something the restored draft is not about: a
  // different page (a chip on another guide) or a different tab.
  const triggerWantsNewReport = Boolean(prefill && restoredFromDraft);

  const [step, setStep] = useState<Step>('form');
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const [urlError, setUrlError] = useState(false);
  const [titleError, setTitleError] = useState(false);
  const [textError, setTextError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [attachError, setAttachError] = useState<AttachErrorKey | null>(null);
  // Attachments whose image data could not be decoded (a valid PNG/JPEG header
  // on a corrupt file): shown with the generic icon instead of a broken image.
  const [brokenPreviewIds, setBrokenPreviewIds] = useState<string[]>([]);
  const [showRawUa, setShowRawUa] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const addFileRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  // Set once the report is accepted — from then on the autosave paths must
  // never write, or the submitted content resurrects as a draft.
  const submittedRef = useRef(false);
  // Mirrors `sending` for the document-level Escape handler and the close
  // paths: the dialog must not close while the request is in flight, or its
  // outcome is lost and a retry could file the report twice.
  const sendingRef = useRef(false);
  // Where the pointer went DOWN. A backdrop click only dismisses if the press
  // started on the backdrop — otherwise selecting text in a field and releasing
  // outside the panel would discard a half-typed report.
  const pressStartedOnBackdrop = useRef(false);
  // After removing a chip at the 2-file maximum the "Add file" button does not
  // exist yet (it mounts on the next render) — focus it once it does.
  const focusAddFileAfterCommit = useRef(false);
  const isFirstRender = useRef(true);

  // ── Draft autosave: debounced on change, flushed on unmount ──
  const latestRef = useRef({
    clientRef, kind, url, title, actual, expected, idea, includeTech,
    attachmentNames: [] as string[],
  });
  latestRef.current = {
    clientRef, kind, url, title, actual, expected, idea, includeTech,
    attachmentNames: attachments.map((a) => a.name),
  };

  const persistDraft = useCallback(() => {
    if (submittedRef.current) return;
    const d = latestRef.current;
    // Content gate: a draft with nothing typed and nothing attached is noise —
    // saving it would pin this page's URL over the NEXT page's capture. A title
    // that is still exactly the trigger's prefill is not the visitor's words
    // either: nothing to protect, and keeping it would resurface a stale
    // "Broken link — <page>" on the next chip they tap.
    const onlyPrefill =
      prefillTitle !== '' && d.title === prefillTitle &&
      !d.actual.trim() && !d.expected.trim() && !d.idea.trim();
    if ((!draftHasContent(d) || onlyPrefill) && d.attachmentNames.length === 0) return;
    saveFeedbackDraft(d);
  }, [prefillTitle]);

  useEffect(() => {
    const id = window.setTimeout(persistDraft, 400);
    return () => window.clearTimeout(id);
  }, [clientRef, kind, url, title, actual, expected, idea, includeTech, attachments, persistDraft]);

  // Flush the pending debounce on close/navigation so the last keystrokes
  // (≤400 ms old) are never lost.
  useEffect(() => () => persistDraft(), [persistDraft]);

  // ── Body scroll lock + inert background while open ──
  useEffect(() => lockBackground(), []);

  // ── Escape to close (never mid-send) ──
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape' && !sendingRef.current) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Focus the step's landmark on every transition (and the first field on
  // open) so a keyboard or screen-reader user always knows where they are ──
  useEffect(() => {
    if (step === 'form') {
      const id = window.setTimeout(() => titleRef.current?.focus(), isFirstRender.current ? 50 : 0);
      isFirstRender.current = false;
      return () => window.clearTimeout(id);
    }
    if (step === 'review') reviewRef.current?.focus();
    if (step === 'done') doneRef.current?.focus();
  }, [step]);

  // "Add file" mounts only while under the limit — focus it after a removal.
  useEffect(() => {
    if (!focusAddFileAfterCommit.current) return;
    focusAddFileAfterCommit.current = false;
    addFileRef.current?.focus();
  }, [attachments]);

  // Keep Tab cycling inside the panel while it is open.
  const onPanelKeyDown = (e: KeyboardEvent<HTMLDivElement>) => trapTab(e, panelRef.current);

  // Exactly what the preview under the checkbox shows and /privacy lists —
  // nothing travels that the visitor cannot see first.
  const techInfo = useMemo(() => {
    if (typeof window === 'undefined') return { ua: '', viewport: '', lang: '' };
    return {
      ua: navigator.userAgent,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      lang: document.documentElement.lang || 'en',
    };
  }, []);
  const techSummary = `${techInfo.viewport} · ${techInfo.lang} · ${summarizeUserAgent(techInfo.ua)}`;
  const audience = chosenAudience ?? defaultAudienceFor(effectiveRegion);

  const isIssue = kind === 'issue';
  const switchKind = (next: FeedbackKind) => {
    setKind(next);
    setTextError(false);
    setUrlError(false);
    if (!techTouched) setIncludeTech(next === 'issue');
  };

  const requestClose = () => {
    if (sendingRef.current) return;
    onClose();
  };

  // Focus a field AND keep its error text visible: `focus()` alone scrolls with
  // block 'nearest', which can park the field flush against the fixed action
  // row with the error paragraph hidden underneath it.
  const focusField = (el: HTMLElement | null) => {
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'center' });
  };

  // ── Attachments ──
  const releasePreview = (a: FeedbackAttachment) => {
    if (a.previewUrl) {
      try {
        URL.revokeObjectURL(a.previewUrl);
      } catch {
        /* ignore */
      }
    }
  };

  const onPickFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-picking the same file after removal
    setAttachError(null);
    const next = [...attachments];
    let error: AttachErrorKey | null = null;
    for (const file of files) {
      if (next.length >= MAX_ATTACHMENTS) { error = 'tooMany'; break; }
      if (file.size > MAX_ATTACHMENT_BYTES) { error = 'tooBig'; continue; }
      if (file.size < MIN_ATTACHMENT_BYTES) { error = 'badType'; continue; }
      const total = next.reduce((s, a) => s + a.size, 0);
      if (total + file.size > MAX_TOTAL_ATTACHMENT_BYTES) { error = 'totalBig'; continue; }
      let base64 = '';
      try {
        base64 = await readFileBase64(file);
      } catch {
        error = 'badType';
        continue;
      }
      // Client-side magic-byte check for instant feedback; the server re-sniffs
      // authoritatively.
      let mime: ReturnType<typeof sniffAttachmentType> = null;
      try {
        const head = atob(base64.slice(0, 16));
        const bytes = new Uint8Array(head.length);
        for (let i = 0; i < head.length; i++) bytes[i] = head.charCodeAt(i);
        mime = sniffAttachmentType(bytes);
      } catch {
        /* fall through to rejection */
      }
      if (!mime) { error = 'badType'; continue; }
      // Thumbnails come from an object URL of the File — decoded lazily by the
      // browser and revoked on removal — never from a second multi-MB data: URL.
      const previewUrl = mime === 'application/pdf' ? undefined : URL.createObjectURL(file);
      next.push({
        id: `att-${++attachmentSeq}`,
        name: file.name.slice(0, 120),
        mime,
        size: file.size,
        base64,
        previewUrl,
      });
    }
    setAttachments(next.slice(0, MAX_ATTACHMENTS));
    if (error) setAttachError(error);
  };

  const removeAttachment = (id: string) => {
    attachments.filter((a) => a.id === id).forEach(releasePreview);
    setAttachments(attachments.filter((a) => a.id !== id));
    setBrokenPreviewIds((ids) => ids.filter((x) => x !== id));
    setAttachError(null);
    focusAddFileAfterCommit.current = true;
  };

  // "Discard & start new" / "Discard & report this page": drop the unsent draft
  // and start the report the trigger asked for.
  const discardDraft = () => {
    clearFeedbackDraft();
    const nextKind = requestedKind ?? (prefill?.title ? 'issue' : kind);
    setKind(nextKind);
    setUrl(freshUrl);
    setTitle(prefillTitle);
    setActual(''); setExpected(''); setIdea(''); setEmail('');
    setIncludeTech(nextKind === 'issue');
    setTechTouched(false);
    attachments.forEach(releasePreview);
    setAttachments([]);
    setBrokenPreviewIds([]);
    setClientRef(newClientRef());
    setRestoredFromDraft(false);
    setLostAttachmentNames([]);
    setUrlError(false); setTitleError(false); setTextError(false); setEmailError(false);
    setAttachError(null);
    titleRef.current?.focus();
  };

  // ── Validation → review ──
  const goReview = () => {
    const urlValue = url.trim();
    const normalized = urlValue ? normalizeFeedbackUrl(urlValue) : null;
    // An issue is about a page; a suggestion may be site-wide.
    const urlOk = kind === 'issue' ? Boolean(normalized) : urlValue === '' || Boolean(normalized);
    const titleOk = title.trim().length > 0;
    const textOk = kind === 'issue' ? actual.trim().length > 0 : idea.trim().length > 0;
    const emailValue = email.trim().toLowerCase();
    const emailOk =
      emailValue === '' ||
      (emailValue.length <= FEEDBACK_EMAIL_MAX && FEEDBACK_EMAIL_RE.test(emailValue));
    setUrlError(!urlOk);
    setTitleError(!titleOk);
    setTextError(!textOk);
    setEmailError(!emailOk);
    if (!urlOk || !titleOk || !textOk || !emailOk) {
      // Land on the first problem rather than leaving the visitor to hunt for it.
      focusField(
        (!urlOk ? urlRef.current : !titleOk ? titleRef.current : !textOk ? textRef.current : emailRef.current),
      );
      return;
    }
    setUrl(normalized ?? '');
    setEmail(emailValue);
    setSubmitError(null);
    setStep('review');
  };

  const submit = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setSubmitError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientRef,
          kind,
          url: url.slice(0, FEEDBACK_URL_MAX),
          title: title.trim().slice(0, FEEDBACK_TITLE_MAX),
          actual: kind === 'issue' ? actual.trim().slice(0, FEEDBACK_TEXT_MAX) : '',
          expected: kind === 'issue' ? expected.trim().slice(0, FEEDBACK_TEXT_MAX) : '',
          idea: kind === 'suggestion' ? idea.trim().slice(0, FEEDBACK_TEXT_MAX) : '',
          email: email.trim().slice(0, FEEDBACK_EMAIL_MAX),
          region: effectiveRegion,
          audience,
          tech: includeTech ? techInfo : null,
          attachments: attachments.map((a) => ({ name: a.name, mime: a.mime, base64: a.base64 })),
          ...(honeypot ? { website: honeypot } : {}),
        }),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { id?: string } | null;
        // Block every later autosave BEFORE clearing, or the debounced effect
        // re-saves the submitted content as a fresh draft.
        submittedRef.current = true;
        clearFeedbackDraft();
        attachments.forEach(releasePreview);
        setAttachments([]);
        setTitle(''); setActual(''); setExpected(''); setIdea('');
        setReferenceId(typeof data?.id === 'string' ? data.id : '');
        setStep('done');
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setSubmitError((data && typeof data.error === 'string' && data.error) || GENERIC_ERROR);
    } catch {
      setSubmitError(GENERIC_ERROR);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  // ── Shared styles (site tokens: forest / cream / stone; Inter for controls,
  // explicit because Tailwind preflight is off and inputs would otherwise fall
  // back to the UA font) ──
  const inputCls =
    'mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 font-sans text-base sm:text-sm text-stone-800 placeholder:text-stone-500 focus:outline-none focus:border-forest-600';
  const okBorder = 'border-stone-450';
  const errBorder = 'border-red-500 focus:border-red-600';
  const labelCls = 'block text-xs font-semibold text-stone-700 uppercase tracking-wide';
  const optionalCls = 'normal-case tracking-normal font-normal text-stone-500';
  const errCls = 'mt-1.5 text-xs font-medium text-red-600';
  const primaryBtn =
    'flex-1 rounded-xl bg-forest-700 text-cream-50 text-sm font-medium py-2.5 hover:bg-forest-800 aria-disabled:bg-stone-200 aria-disabled:text-stone-500 aria-disabled:cursor-not-allowed';
  const ghostBtn =
    'flex-1 rounded-xl border border-stone-300 bg-transparent text-sm font-medium py-2.5 text-stone-700 hover:bg-stone-100 aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

  const detailText = isIssue ? actual : idea;
  const detailLen = detailText.length;
  const nearLimit = detailLen > FEEDBACK_TEXT_MAX * 0.8;
  // Announced in 100-character steps, never per keystroke.
  const announcedLen = Math.floor(detailLen / 100) * 100;
  const headingText =
    step === 'done' ? 'Thank you!' : isIssue ? 'Report an issue' : 'Share feedback';
  const noticeIds = [
    restoredFromDraft && 'gsb-fb-draft-notice',
    lostAttachmentNames.length > 0 && 'gsb-fb-reattach',
  ].filter(Boolean).join(' ');

  return (
    <div
      // Layer stack (verified against the source): quick-actions dock z-1200,
      // recent-pages backdrop z-1300 / panel z-1400, this dialog and the
      // tester-invite dialog z-1550 (they never open together — each one's
      // triggers sit inside the background this dialog makes inert), report-AI
      // dialog z-1600 (inside <main>, so inert while this is open).
      className="fixed inset-0 z-[1550] flex items-end sm:items-center justify-center bg-stone-900/50 p-0 sm:p-4"
      onMouseDown={(e) => {
        pressStartedOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressStartedOnBackdrop.current) requestClose();
        pressStartedOnBackdrop.current = false;
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gsb-feedback-title"
        aria-describedby={noticeIds || undefined}
        aria-busy={sending || undefined}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className="flex w-full max-h-[92dvh] sm:max-h-[90vh] flex-col sm:max-w-lg bg-cream-50 rounded-t-2xl sm:rounded-2xl border border-stone-200 shadow-xl focus:outline-none"
      >
        {/* Header (fixed) */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-stone-200">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-cream-50">
              {step === 'done' ? (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              ) : isIssue ? (
                <Bug className="h-4 w-4" aria-hidden="true" />
              ) : (
                <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0">
              <h2 id="gsb-feedback-title" className="font-display text-lg leading-tight text-forest-800">
                {headingText}
              </h2>
              {step !== 'done' && (
                <p className="mt-0.5 text-xs text-stone-600 leading-relaxed">
                  A suggestion or an issue report — every note helps GlobalStudyBoard improve.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            title={step === 'form' ? 'Close — an unsent draft is kept on this device' : 'Close'}
            aria-disabled={sending || undefined}
            className="shrink-0 rounded-lg p-2 -m-2 text-stone-600 hover:text-forest-800 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body (scrolls) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* ── Success ── */}
          {step === 'done' && (
            <div ref={doneRef} tabIndex={-1} className="focus:outline-none">
              <p className="text-sm text-stone-800 leading-relaxed">
                Your {isIssue ? 'report' : 'feedback'} has reached the GlobalStudyBoard team. We read
                every note and fix the underlying pages where needed.
              </p>
              {referenceId && (
                <p className="mt-3 rounded-xl bg-white border border-stone-200 px-3 py-2 text-sm text-stone-800">
                  <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
                    Reference
                  </span>
                  <span className="ml-2 font-mono text-sm">{referenceId}</span>
                </p>
              )}
              <p className="mt-3 text-xs text-stone-600 leading-relaxed">
                {email
                  ? 'You left an email address, so we can reply there once we have looked into it.'
                  : 'We can only reply if you leave an email address.'}
                {' '}
                To add anything later, write to{' '}
                <a
                  href={`mailto:${CONTACT_EMAIL}${referenceId ? `?subject=${encodeURIComponent(`Feedback ${referenceId}`)}` : ''}`}
                  className="underline underline-offset-2 hover:text-forest-700"
                >
                  {CONTACT_EMAIL}
                </a>
                {referenceId ? ' quoting the reference.' : '.'}
              </p>
            </div>
          )}

          {/* ── Form ── */}
          {step === 'form' && (
            <form id="gsb-feedback-form" onSubmit={(e: FormEvent) => { e.preventDefault(); goReview(); }} noValidate>
              {restoredFromDraft && (
                <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 border border-stone-200">
                  <p id="gsb-fb-draft-notice" className="min-w-0 text-xs text-stone-700 leading-relaxed m-0">
                    Unsent {initialKind === 'issue' ? 'issue report' : 'suggestion'} restored
                    {restoredPath ? (
                      <>
                        {' '}— about <span className="font-semibold break-all">{restoredPath}</span>
                      </>
                    ) : null}
                    . Kept on this device until you send or discard it.
                  </p>
                  <button
                    type="button"
                    onClick={discardDraft}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-transparent px-2 py-1.5 text-[11px] font-semibold text-stone-600 hover:bg-stone-100 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    {triggerWantsNewReport && prefill?.url !== null
                      ? 'Discard & report this page'
                      : 'Discard & start new'}
                  </button>
                </div>
              )}

              {/* Honeypot — bots fill hidden fields; the server silently drops
                  them. The name is deliberately meaningless so a browser's
                  contact autofill never touches it (autofill here would make the
                  server discard a genuine report). */}
              <input
                type="text"
                name="gsb-note-check"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {/* Kind — roving-tabindex radiogroup with arrow-key support */}
              <div
                className="grid grid-cols-2 gap-2"
                role="radiogroup"
                aria-label="What would you like to send?"
                onKeyDown={(e) => {
                  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
                  e.preventDefault();
                  const next: FeedbackKind = kind === 'suggestion' ? 'issue' : 'suggestion';
                  switchKind(next);
                  document.getElementById(`gsb-fb-kind-${next}`)?.focus();
                }}
              >
                {(
                  [
                    ['suggestion', 'Suggestion', Lightbulb],
                    ['issue', 'Report an issue', Bug],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    id={`gsb-fb-kind-${value}`}
                    type="button"
                    role="radio"
                    aria-checked={kind === value}
                    tabIndex={kind === value ? 0 : -1}
                    onClick={() => switchKind(value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                      kind === value
                        ? 'border-forest-700 bg-forest-700 text-cream-50'
                        : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Page link + capture */}
              <label htmlFor="gsb-fb-url" className={`${labelCls} mt-4`}>
                Page link {!isIssue && <span className={optionalCls}>(optional)</span>}
              </label>
              <div className="flex gap-2">
                <input
                  id="gsb-fb-url"
                  ref={urlRef}
                  type="url"
                  inputMode="url"
                  autoComplete="off"
                  value={url}
                  maxLength={FEEDBACK_URL_MAX}
                  onChange={(e) => { setUrl(e.target.value); setUrlError(false); }}
                  placeholder="https://www.globalstudyboard.com/…"
                  aria-invalid={urlError || undefined}
                  aria-describedby={urlError ? 'gsb-fb-url-err' : 'gsb-fb-url-help'}
                  className={`${inputCls} min-w-0 flex-1 ${urlError ? errBorder : okBorder}`}
                />
                {/* Icon-only: the link glyph keeps the URL field wide on a 320px
                    phone; the name lives on aria-label + title. */}
                <button
                  type="button"
                  onClick={() => { setUrl(window.location.href); setUrlError(false); }}
                  aria-label="Use current page"
                  title="Use current page"
                  className="mt-1.5 flex h-[42px] w-11 shrink-0 items-center justify-center rounded-xl border border-stone-450 bg-white text-forest-700 hover:bg-stone-100"
                >
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              {urlError ? (
                <p id="gsb-fb-url-err" className={errCls}>
                  Please enter the address of a GlobalStudyBoard page (https://www.globalstudyboard.com/…).
                  A broken link <em>on</em> a page belongs in the description below.
                </p>
              ) : (
                <p id="gsb-fb-url-help" className="mt-1.5 text-[11px] text-stone-600 leading-relaxed">
                  The GlobalStudyBoard page you are writing about
                  {isIssue ? '.' : ' — leave it empty for a site-wide suggestion.'}
                </p>
              )}

              {/* Title */}
              <label htmlFor="gsb-fb-title" className={`${labelCls} mt-4`}>Title</label>
              <input
                id="gsb-fb-title"
                ref={titleRef}
                type="text"
                autoComplete="off"
                value={title}
                maxLength={FEEDBACK_TITLE_MAX}
                onChange={(e) => { setTitle(e.target.value); setTitleError(false); }}
                placeholder="A short one-line summary"
                aria-invalid={titleError || undefined}
                aria-describedby={titleError ? 'gsb-fb-title-err' : undefined}
                className={`${inputCls} ${titleError ? errBorder : okBorder}`}
              />
              {titleError && <p id="gsb-fb-title-err" className={errCls}>Please add a short title.</p>}

              {/* Kind-specific description */}
              {isIssue ? (
                <>
                  <label htmlFor="gsb-fb-actual" className={`${labelCls} mt-4`}>What happens now?</label>
                  <textarea
                    id="gsb-fb-actual"
                    ref={textRef}
                    value={actual}
                    maxLength={FEEDBACK_TEXT_MAX}
                    onChange={(e) => { setActual(e.target.value); setTextError(false); }}
                    placeholder="Describe what you currently see on the page…"
                    rows={3}
                    aria-invalid={textError || undefined}
                    aria-describedby={textError ? 'gsb-fb-text-err' : undefined}
                    className={`${inputCls} resize-y ${textError ? errBorder : okBorder}`}
                  />
                  {textError && <p id="gsb-fb-text-err" className={errCls}>Please describe what happens.</p>}
                  <label htmlFor="gsb-fb-expected" className={`${labelCls} mt-4`}>
                    What should happen instead? <span className={optionalCls}>(optional)</span>
                  </label>
                  <textarea
                    id="gsb-fb-expected"
                    value={expected}
                    maxLength={FEEDBACK_TEXT_MAX}
                    onChange={(e) => setExpected(e.target.value)}
                    placeholder="Describe the behaviour you expected…"
                    rows={2}
                    className={`${inputCls} resize-y ${okBorder}`}
                  />
                </>
              ) : (
                <>
                  <label htmlFor="gsb-fb-idea" className={`${labelCls} mt-4`}>Your suggestion</label>
                  <textarea
                    id="gsb-fb-idea"
                    ref={textRef}
                    value={idea}
                    maxLength={FEEDBACK_TEXT_MAX}
                    onChange={(e) => { setIdea(e.target.value); setTextError(false); }}
                    placeholder="Describe your idea and how it helps…"
                    rows={4}
                    aria-invalid={textError || undefined}
                    aria-describedby={textError ? 'gsb-fb-text-err' : undefined}
                    className={`${inputCls} resize-y ${textError ? errBorder : okBorder}`}
                  />
                  {textError && <p id="gsb-fb-text-err" className={errCls}>Please describe your suggestion.</p>}
                </>
              )}
              {/* Visible counter near the limit; the always-mounted live region
                  announces in 100-character steps rather than per keystroke. */}
              <p className="mt-1 mb-0 min-h-[1rem] text-right text-[11px] text-stone-500" aria-hidden="true">
                {nearLimit ? `${detailLen}/${FEEDBACK_TEXT_MAX}` : ''}
              </p>
              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {nearLimit ? `${announcedLen} of ${FEEDBACK_TEXT_MAX} characters used` : ''}
              </p>

              {/* Email (optional) */}
              <label htmlFor="gsb-fb-email" className={`${labelCls} mt-3`}>
                Email <span className={optionalCls}>(optional)</span>
              </label>
              <input
                id="gsb-fb-email"
                ref={emailRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                maxLength={FEEDBACK_EMAIL_MAX}
                onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
                // RFC 2606 reserved domain — never a real person's address.
                placeholder="you@example.com"
                aria-invalid={emailError || undefined}
                aria-describedby={emailError ? 'gsb-fb-email-err' : 'gsb-fb-email-help'}
                className={`${inputCls} ${emailError ? errBorder : okBorder}`}
              />
              {emailError ? (
                <p id="gsb-fb-email-err" className={errCls}>Please enter a valid email address, or leave it blank.</p>
              ) : (
                <p id="gsb-fb-email-help" className="mt-1.5 text-[11px] text-stone-600 leading-relaxed">
                  Only if you&rsquo;d like a reply. Never shared, never used for marketing — see our{' '}
                  <a href="/privacy" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-forest-700">
                    privacy policy<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  .
                </p>
              )}

              {/* Attachments */}
              <p className={`${labelCls} mt-4`}>
                Screenshots or PDF <span className={optionalCls}>(optional)</span>
              </p>
              <p id="gsb-fb-attach-help" className="mt-0.5 text-[11px] text-stone-600 leading-relaxed">
                Up to {MAX_ATTACHMENTS} files · JPG, PNG or PDF · max 1.5 MB each
              </p>
              {lostAttachmentNames.length > 0 && (
                <p id="gsb-fb-reattach" className="mt-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] leading-relaxed text-stone-700 border border-stone-200">
                  Attachments are not kept in the saved draft — please re-attach:{' '}
                  <span className="font-semibold">{lostAttachmentNames.join(', ')}</span>
                </p>
              )}
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                multiple
                onChange={onPickFiles}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
                id="gsb-fb-file"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {attachments.map((a) => (
                  <span
                    key={a.id}
                    className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white py-1.5 pl-1.5 pr-1"
                  >
                    {a.mime === 'application/pdf' || !a.previewUrl || brokenPreviewIds.includes(a.id) ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 text-forest-700 border border-stone-200">
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element -- local object URL thumbnail; next/image cannot optimise it */
                      <img
                        src={a.previewUrl}
                        alt=""
                        decoding="async"
                        onError={() => setBrokenPreviewIds((ids) => (ids.includes(a.id) ? ids : [...ids, a.id]))}
                        className="h-8 w-8 rounded-lg object-cover border border-stone-200 bg-cream-100"
                      />
                    )}
                    <span className="max-w-[140px]">
                      <span className="block truncate text-[11px] font-semibold text-stone-800">{a.name}</span>
                      <span className="block text-[10px] text-stone-600">{formatBytes(a.size)}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.id)}
                      aria-label={`Remove ${a.name}`}
                      className="rounded-full bg-transparent p-1.5 text-stone-600 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </span>
                ))}
                {attachments.length < MAX_ATTACHMENTS && (
                  <button
                    ref={addFileRef}
                    type="button"
                    onClick={() => document.getElementById('gsb-fb-file')?.click()}
                    aria-label="Add a screenshot or PDF"
                    aria-describedby="gsb-fb-attach-help"
                    className="flex items-center gap-1.5 rounded-xl border border-dashed border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-forest-700 hover:bg-stone-100"
                  >
                    <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
                    Add file
                  </button>
                )}
              </div>
              <p role="status" aria-live="polite" className="m-0 min-h-0">
                {attachError && <span className={`${errCls} block`}>{ATTACH_ERRORS[attachError]}</span>}
              </p>

              {/* Browser details opt-in. The preview is a SIBLING of the label
                  (linked by aria-describedby), so the checkbox's accessible
                  name stays short instead of swallowing the user-agent string. */}
              <div className="mt-4 rounded-xl bg-white px-3 py-2.5 border border-stone-200">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeTech}
                    onChange={(e) => { setIncludeTech(e.target.checked); setTechTouched(true); }}
                    aria-describedby="gsb-fb-tech-preview"
                    className="mt-0.5 h-4 w-4 shrink-0 accent-forest-700"
                  />
                  <span className="text-xs leading-relaxed text-stone-700">
                    Include browser details (screen size, language, browser) — helps us reproduce an issue
                  </span>
                </label>
                <div id="gsb-fb-tech-preview" className="mt-1 pl-[26px] text-[10px] text-stone-500 leading-relaxed">
                  {includeTech ? (
                    <>
                      <span>Will send: {techSummary}</span>
                      <button
                        type="button"
                        onClick={() => setShowRawUa((v) => !v)}
                        aria-expanded={showRawUa}
                        className="ml-1.5 bg-transparent p-0 underline underline-offset-2 text-stone-600 hover:text-forest-700"
                      >
                        {showRawUa ? 'hide exact text' : 'show exact text'}
                      </button>
                      {showRawUa && (
                        <span className="mt-1 block break-all font-mono text-[10px] text-stone-500">
                          {techInfo.viewport} · {techInfo.lang} · {techInfo.ua}
                        </span>
                      )}
                    </>
                  ) : (
                    'Nothing about your browser will be sent.'
                  )}
                </div>
              </div>
            </form>
          )}

          {/* ── Review ── */}
          {step === 'review' && (
            <div ref={reviewRef} tabIndex={-1} className="focus:outline-none">
              <p className="text-sm font-semibold text-stone-800 m-0">Review before sending</p>
              <p className="mt-1.5 text-xs text-stone-600 leading-relaxed m-0">
                Please check everything looks right — we read every note.
              </p>
              <dl className="mt-3 space-y-2.5 text-sm m-0">
                {(
                  [
                    ['Type', isIssue ? 'Report an issue' : 'Suggestion'],
                    ['Page', url || '— (site-wide)'],
                    ['Title', title],
                    ...(isIssue
                      ? ([['What happens now', actual], ...(expected.trim() ? [['What should happen instead', expected]] : [])] as [string, string][])
                      : ([['Suggestion', idea]] as [string, string][])),
                    ['Email', email || '—'],
                    ['Attachments', attachments.length === 0 ? '—' : attachments.map((a) => `${a.name} (${formatBytes(a.size)})`).join(' · ')],
                    ['Browser details', includeTech ? `Included (${techSummary})` : 'Not included'],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-600">{k}</dt>
                    <dd className="mt-0.5 m-0 whitespace-pre-wrap break-words text-stone-800 leading-relaxed">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Action row (fixed) */}
        <div className="shrink-0 border-t border-stone-200 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3">
          {step === 'form' && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={requestClose}
                title="Close — an unsent draft is kept on this device"
                className={ghostBtn}
              >
                Close
              </button>
              <button type="submit" form="gsb-feedback-form" className={primaryBtn}>Review &amp; send</button>
            </div>
          )}
          {step === 'review' && (
            <div className="flex flex-wrap gap-2">
              {/* Sits in the fixed row (not the scrolling body) so a failure is
                  never hidden below the fold of a long summary. Always mounted,
                  so its first message is announced. */}
              <p role="alert" className="m-0 basis-full">
                {submitError && (
                  <span className="mb-3 block rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-700 leading-relaxed">
                    {submitError}
                  </span>
                )}
              </p>
              {/* `aria-disabled` rather than `disabled`: a disabled control loses
                  focus, which would strand a keyboard user on <body> after a
                  failed send. The handlers ignore clicks while sending. */}
              <button
                type="button"
                onClick={() => { if (!sendingRef.current) setStep('form'); }}
                aria-disabled={sending || undefined}
                className={ghostBtn}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={submit}
                aria-disabled={sending || undefined}
                className={primaryBtn}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          )}
          {step === 'done' && (
            <button type="button" onClick={onClose} className={`${primaryBtn} w-full`}>Done</button>
          )}
        </div>
      </div>
    </div>
  );
}
