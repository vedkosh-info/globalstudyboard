import { NextRequest, NextResponse } from 'next/server';
import { CONTACT_EMAIL } from '@/lib/site-meta';
import {
  CLIENT_REF_RE,
  type AllowedAttachmentMime,
  FEEDBACK_EMAIL_MAX,
  FEEDBACK_EMAIL_RE,
  FEEDBACK_TECH_MAX,
  FEEDBACK_TEXT_MAX,
  FEEDBACK_TITLE_MAX,
  FEEDBACK_URL_MAX,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_BYTES,
  MAX_TOTAL_ATTACHMENT_BYTES,
  MIME_EXTENSION,
  MIN_ATTACHMENT_BYTES,
  base64Bytes,
  isFeedbackPageHost,
  safeAttachmentBaseName,
  sniffAttachmentType,
  type FeedbackKind,
} from '@/lib/feedback';

/**
 * Site-wide "Share feedback / Report an issue" endpoint.
 *
 * A suggestion or an issue report from ANY visitor (the site has no accounts),
 * with up to two screenshots/PDFs, forwarded to a private Google Sheet through
 * a Google Apps Script web app (`scripts/apps-script/feedback-webapp.gs`),
 * which also files the attachments in a private Drive folder and emails the
 * owner. Same backend shape as the Android tester-invite flow — deliberately a
 * SEPARATE sheet and script, because feedback carries free text, optional email
 * addresses and files, with a different retention promise on /privacy.
 *
 * Security posture:
 *  - Same-origin gate (CSRF defence-in-depth): a state-changing POST from
 *    another origin is rejected outright.
 *  - Body-size pre-check on Content-Length, then per-IP burst limiting, then
 *    a honeypot that answers with a fake success so a bot learns nothing.
 *  - Every field is length-capped and control characters are stripped; the
 *    page link must be a real http(s) URL; the email is optional and must be
 *    structurally valid.
 *  - Attachments are validated by MAGIC BYTES and size caps before they go
 *    anywhere; filenames are regenerated from a sanitized slug + the SNIFFED
 *    extension, so a disguised script or a hostile filename never survives.
 *    Nothing is written to disk here — a file exists only in memory on its way
 *    to the Apps Script.
 *  - The Apps Script URL lives in `FEEDBACK_SCRIPT_URL` — deliberately NOT a
 *    `NEXT_PUBLIC_*` var, so the write endpoint is never exposed to the browser.
 *  - Delivery is SYNCHRONOUS (unlike the tester-invite route's fire-and-forget):
 *    a visitor who typed a paragraph must never be told "sent" when it was not.
 *    On failure the client keeps their draft and asks them to retry.
 *
 * Privacy (constitution §9): nothing here is logged except a status code on a
 * failed upstream write — never the message, the email or the page.
 */

// Enough for a slow Apps Script round trip (row + Drive files + email) while
// still capping a hung upstream well below Vercel's default.
export const maxDuration = 25;

const SCRIPT_URL = process.env.FEEDBACK_SCRIPT_URL || '';
const UPSTREAM_TIMEOUT_MS = 20_000;

// Hard ceiling on the JSON body: 2.5 MB of files is ~3.4 MB as base64, plus
// the text fields. Anything larger is rejected before it is even parsed.
const MAX_BODY_BYTES = 3_800_000;

// SSRF guard: only ever talk to Google Apps Script. `/exec` answers with a 302
// to script.googleusercontent.com, so the redirect target must be allowed too.
// A loopback URL is accepted ONLY outside production so the full payload can be
// exercised locally against a mock (never a NEXT_PUBLIC_ var, never a prod path).
const ALLOWED_SCRIPT_HOSTS = ['script.google.com', 'script.googleusercontent.com'];
function isAllowedScriptUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' && ALLOWED_SCRIPT_HOSTS.includes(parsed.hostname)) {
      return true;
    }
    if (
      process.env.NODE_ENV !== 'production' &&
      (parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * CSRF defence-in-depth. Browsers send `Origin` on every fetch POST, so a
 * missing header means a non-browser client and a mismatched one means a
 * cross-site page — neither may post feedback on a visitor's behalf.
 */
/** The host this request arrived on (Vercel forwards it; port kept, lower-cased). */
function requestHost(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host') ||
    ''
  ).toLowerCase();
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = requestHost(request);
  try {
    return host !== '' && new URL(origin).host.toLowerCase() === host;
  } catch {
    return false;
  }
}

// Per-IP burst limit, one Map per serverless instance — enough to stop casual
// abuse of a form a real person submits once or twice.
const LIMIT = 5;
const WINDOW_MS = 60_000;
const bucket = new Map<string, { count: number; resetAt: number }>();
let reqCount = 0;

function pruneBucket() {
  if (++reqCount % 100 !== 0) return;
  const now = Date.now();
  for (const [ip, entry] of bucket) {
    if (now > entry.resetAt) bucket.delete(ip);
  }
}

function isRateLimited(ip: string): boolean {
  pruneBucket();
  const now = Date.now();
  const entry = bucket.get(ip);
  if (!entry || now > entry.resetAt) {
    bucket.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/** Trim, normalise newlines, cap length. Multi-line fields keep their newlines. */
function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\r\n?/g, '\n')
    // Strip every control character except newline and tab.
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, max);
}

/** Single-line variant for the title and short context fields. */
function cleanLine(value: unknown, max: number): string {
  return cleanText(value, max).replace(/\s+/g, ' ').trim().slice(0, max);
}

interface ValidAttachment {
  filename: string;
  mime: AllowedAttachmentMime;
  base64: string;
}

/**
 * Count, per-file + combined size caps, base64 charset and magic-byte type.
 * Returns null when anything is off — the whole request is rejected rather
 * than silently dropping one file the visitor reviewed in the summary.
 */
function validateAttachments(raw: unknown): ValidAttachment[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_ATTACHMENTS) return null;
  const out: ValidAttachment[] = [];
  let total = 0;
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i] as { name?: unknown; base64?: unknown } | null;
    if (!item || typeof item !== 'object') return null;
    const base64 = typeof item.base64 === 'string' ? item.base64 : '';
    // Whole-string charset check (padding only at the end) so nothing outside
    // the base64 alphabet ever reaches the Apps Script.
    if (!base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return null;
    const bytes = base64Bytes(base64);
    if (bytes < MIN_ATTACHMENT_BYTES || bytes > MAX_ATTACHMENT_BYTES) return null;
    total += bytes;
    if (total > MAX_TOTAL_ATTACHMENT_BYTES) return null;
    let mime: ReturnType<typeof sniffAttachmentType> = null;
    try {
      mime = sniffAttachmentType(Buffer.from(base64.slice(0, 16), 'base64'));
    } catch {
      return null;
    }
    if (!mime) return null;
    // Slug + SNIFFED extension only; the Apps Script prefixes the reference and
    // the index when it files the blob.
    const clientName = typeof item.name === 'string' ? item.name : '';
    const base = safeAttachmentBaseName(clientName, `attachment-${i + 1}`);
    out.push({ filename: `${base}.${MIME_EXTENSION[mime]}`, mime, base64 });
  }
  return out;
}

const REGION_SLUG_RE = /^[a-z][a-z-]{0,39}$/;

export async function POST(request: NextRequest) {
  if (!SCRIPT_URL || !isAllowedScriptUrl(SCRIPT_URL)) {
    return NextResponse.json(
      { error: `Feedback is not available right now. Please email ${CONTACT_EMAIL} instead.`, code: 'unavailable' },
      { status: 503 },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Request rejected.', code: 'forbidden' }, { status: 403 });
  }

  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Attachments are too large. Keep to 2 files, 1.5 MB each.', code: 'too_large' },
      { status: 413 },
    );
  }

  if (isRateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: 'Too many requests right now — please wait a minute and try again.', code: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request.', code: 'invalid' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request.', code: 'invalid' }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields. Answer with a normal success so the
  // bot learns nothing, and drop the report.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ status: 'ok' });
  }

  const kind: FeedbackKind | null =
    body.kind === 'suggestion' || body.kind === 'issue' ? body.kind : null;
  const title = cleanLine(body.title, FEEDBACK_TITLE_MAX);
  const actual = cleanText(body.actual, FEEDBACK_TEXT_MAX);
  const expected = cleanText(body.expected, FEEDBACK_TEXT_MAX);
  const idea = cleanText(body.idea, FEEDBACK_TEXT_MAX);

  // The page link must be a real http(s) URL on THIS site — anything else is
  // rejected, not repaired. An arbitrary host would turn the owner's inbox and
  // sheet into a click-through for attacker-chosen links dressed up as one of
  // our own pages (Gmail and Sheets auto-link URLs).
  let url = '';
  try {
    const parsed = new URL(cleanLine(body.url, FEEDBACK_URL_MAX));
    if (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      isFeedbackPageHost(parsed.hostname, requestHost(request))
    ) {
      url = parsed.href;
    }
  } catch {
    /* handled below */
  }

  const email = cleanLine(body.email, FEEDBACK_EMAIL_MAX).toLowerCase();
  if (email && !FEEDBACK_EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address, or leave it blank.', code: 'invalid_email' },
      { status: 400 },
    );
  }

  const describedOk = kind === 'issue' ? actual.length > 0 : idea.length > 0;
  // A suggestion may be site-wide (no page); an issue is always about a page.
  const rawUrl = cleanLine(body.url, FEEDBACK_URL_MAX);
  if ((kind === 'issue' && !url) || (rawUrl && !url)) {
    return NextResponse.json(
      { error: 'The page link must be a page on GlobalStudyBoard.', code: 'invalid_url' },
      { status: 400 },
    );
  }
  if (!kind || !title || !describedOk) {
    return NextResponse.json(
      { error: 'Please fill in the title and the description.', code: 'invalid' },
      { status: 400 },
    );
  }

  // Triage context the visitor opted into — never free text, always capped.
  const techRaw = body.tech as
    | { ua?: unknown; viewport?: unknown; lang?: unknown }
    | null
    | undefined;
  const tech =
    techRaw && typeof techRaw === 'object'
      ? {
          ua: cleanLine(techRaw.ua, FEEDBACK_TECH_MAX),
          viewport: cleanLine(techRaw.viewport, 24),
          lang: cleanLine(techRaw.lang, 24),
        }
      : null;
  const regionRaw = cleanLine(body.region, 40);
  const region = REGION_SLUG_RE.test(regionRaw) ? regionRaw : '';
  const audience =
    body.audience === 'domestic' || body.audience === 'international' ? body.audience : '';

  // Optional idempotency key (see `newClientRef`). Anything else is ignored,
  // never rejected — an old client without one still gets its report through.
  const clientRef =
    typeof body.clientRef === 'string' && CLIENT_REF_RE.test(body.clientRef) ? body.clientRef : '';

  const attachments = validateAttachments(body.attachments);
  if (attachments === null) {
    return NextResponse.json(
      {
        error: 'Only JPG, PNG or PDF files up to 1.5 MB each (2.5 MB together) can be attached.',
        code: 'invalid_attachment',
      },
      { status: 400 },
    );
  }

  const payload = {
    type: 'feedback',
    clientRef,
    kind,
    title,
    url,
    actual: kind === 'issue' ? actual : '',
    expected: kind === 'issue' ? expected : '',
    idea: kind === 'suggestion' ? idea : '',
    email,
    region,
    audience,
    tech,
    attachments,
  };

  // Synchronous forward: the visitor waits for the real outcome.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  let upstream: Response;
  let text = '';
  try {
    upstream = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });
    text = await upstream.text().catch(() => '');
  } catch {
    // Timeout / DNS / network — nothing was written. The body of the report is
    // never logged; the visitor keeps their draft and can retry.
    console.error('[feedback] upstream write failed (network or timeout)');
    return NextResponse.json(
      { error: 'Could not send your feedback right now. Your draft is safe — please try again.', code: 'upstream' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }

  // `fetch` does not throw on 4xx/5xx, and Apps Script reports its OWN errors
  // as HTTP 200 with {"error": …} (ContentService cannot set a status code) —
  // so both the status and the body are checked. The truncated body logged
  // here is safe: the script only answers {"status":"ok",…} or {"error":…},
  // never the report itself.
  if (!upstream.ok || !text.includes('"status":"ok"')) {
    console.error('[feedback] Apps Script rejected the write', upstream.status, text.slice(0, 200));
    return NextResponse.json(
      { error: 'Could not send your feedback right now. Your draft is safe — please try again.', code: 'upstream' },
      { status: 502 },
    );
  }

  // Relay the script's reference id when it is a plain token, for the "thank
  // you" panel — a visitor can quote it in a follow-up email.
  let id = '';
  try {
    const parsed = JSON.parse(text) as { id?: unknown };
    if (typeof parsed.id === 'string' && /^[A-Za-z0-9-]{4,24}$/.test(parsed.id)) id = parsed.id;
  } catch {
    /* non-JSON but contained "status":"ok" — still a success */
  }

  return NextResponse.json(
    { status: 'ok', ...(id ? { id } : {}) },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
