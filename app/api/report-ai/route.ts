/**
 * AI response reporting endpoint.
 *
 * Google Play's Generative AI policy requires apps that surface AI-generated
 * content to give users an in-app way to report offensive or inaccurate output
 * "without needing to exit the app" — which rules out `mailto:` links and
 * new-tab forms. `components/ReportAIResponse.tsx` posts here from an in-page
 * dialog so the whole flow stays inside the Trusted Web Activity.
 *
 * Deliberately stores nothing and asks for nothing identifying: no name, no
 * email, no account. The report is written to the server log for the operator
 * to triage, with the offending answer truncated. That keeps this route
 * consistent with the Data safety declaration (the AI feature collects
 * user-generated content for app functionality, and nothing else).
 */

// Per-IP rate limit, mirroring app/api/gsb-ai/route.ts. Each serverless
// instance keeps its own Map — good enough to stop casual abuse.
const rateMap = new Map<string, { count: number; resetAt: number }>();
let reqCount = 0;

function pruneRateMap() {
  if (++reqCount % 100 !== 0) return;
  const now = Date.now();
  for (const [ip, bucket] of rateMap) {
    if (now > bucket.resetAt) rateMap.delete(ip);
  }
}

const REASONS = ['inaccurate', 'offensive', 'other'] as const;
type Reason = (typeof REASONS)[number];

function isReason(v: unknown): v is Reason {
  return typeof v === 'string' && (REASONS as readonly string[]).includes(v);
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  const bucket = rateMap.get(ip);
  pruneRateMap();

  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= 6) {
      return new Response('Too many reports. Please try again in a minute.', { status: 429 });
    }
    bucket.count++;
  } else {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
  }

  let body: { reason?: unknown; detail?: unknown; answer?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (!isReason(body.reason)) {
    return new Response('Invalid reason', { status: 400 });
  }

  const detail = typeof body.detail === 'string' ? body.detail.slice(0, 1000) : '';
  const answer = typeof body.answer === 'string' ? body.answer.slice(0, 2000) : '';

  // Log only — no database, no PII, no identity. Visible in the Vercel logs.
  console.warn(
    '[gsb-ai-report]',
    JSON.stringify({ reason: body.reason, detail, answer, at: new Date().toISOString() }),
  );

  return Response.json({ ok: true });
}
