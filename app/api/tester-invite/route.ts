import { NextRequest, NextResponse, after } from 'next/server';

/**
 * Android beta-tester invite requests.
 *
 * The Play app is on the **internal testing** track, so a person can only
 * install it after the owner adds their Google-account address to the Play
 * Console tester list. This endpoint captures that address and appends it to a
 * dedicated Google Sheet ("GlobalStudyBoard App Testers") through a Google Apps
 * Script web app; the owner then adds the address in Play and sends the invite.
 *
 * The Apps Script URL lives in `TESTER_INVITE_SCRIPT_URL` — deliberately NOT a
 * `NEXT_PUBLIC_*` var, so the write endpoint is never exposed to the browser and
 * cannot be posted to directly (bypassing the rate limit and honeypot below).
 *
 * Privacy (constitution §9): the email address is the ONLY personal datum, it is
 * volunteered for exactly this purpose, and it is used solely to send the Play
 * invite. Nothing else identifying is collected, and nothing is logged here.
 */

// Cap execution so a hung Apps Script can't ride Vercel's 300 s default.
export const maxDuration = 15;

const SCRIPT_URL = process.env.TESTER_INVITE_SCRIPT_URL || '';

// SSRF guard: only ever talk to Google Apps Script. `/exec` answers with a 302
// to script.googleusercontent.com, so the redirect target must be allowed too.
const ALLOWED_SCRIPT_HOSTS = ['script.google.com', 'script.googleusercontent.com'];
function isAllowedScriptUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_SCRIPT_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

// Deliberately permissive on the local part / domain: Play testers may use any
// Google account, including Workspace addresses — restricting to @gmail.com
// would silently reject valid testers. Length caps follow RFC 5321.
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

// Per-IP rate limit, one Map per serverless instance — enough to stop casual
// abuse of a form that a real person submits once.
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

export async function POST(request: NextRequest) {
  if (!SCRIPT_URL || !isAllowedScriptUrl(SCRIPT_URL)) {
    return NextResponse.json(
      { error: 'Tester sign-up is not available right now.' },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields. Answer with a normal success so the bot
  // learns nothing, and drop the row.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return NextResponse.json({ status: 'ok' });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const ip =
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  // Context fields are for the owner's triage only — never free text from the
  // user, and stripped of anything that could break the sheet.
  const clean = (v: unknown, max: number) =>
    String(v ?? '')
      .replace(/[<>"'&]/g, '')
      .trim()
      .slice(0, max);

  const payload = {
    type: 'tester-invite',
    email,
    page: clean(body.page, 200),
    region: clean(body.region, 40),
    source: clean(body.source, 40),
  };

  // Fire-and-forget: answer the browser immediately and let the Sheets write
  // finish in the background, so Apps Script latency never blocks the user.
  after(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 13_000);
    try {
      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: controller.signal,
      });

      // A failed write must not pass silently. `fetch` does not throw on a 4xx/5xx,
      // and Apps Script reports its OWN errors as HTTP 200 with {"error": ...} in
      // the body (ContentService cannot set a status code) — so neither the status
      // nor the exception path alone is enough. Without both checks, a stale /exec
      // URL or an Apps Script quota error would drop every sign-up while the
      // visitor is still told "Request received".
      const body = await res.text().catch(() => '');
      if (!res.ok || !body.includes('"status":"ok"')) {
        console.error(
          '[tester-invite] Apps Script rejected the write',
          res.status,
          body.slice(0, 200),
        );
      }
    } catch {
      // The response has already been sent, so this is the only trace a dropped
      // write leaves. Never include the email — the whole point of this route is
      // that the address reaches the sheet and nowhere else (constitution §9).
      // The truncated body logged above is safe: the Apps Script only ever
      // answers {"status":"ok"} or {"error": "..."}, never the address.
      console.error('[tester-invite] background write to Apps Script failed');
    } finally {
      clearTimeout(timeout);
    }
  });

  return NextResponse.json({ status: 'ok' });
}
