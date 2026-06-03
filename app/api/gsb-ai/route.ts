import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 25;

// In-memory rate limiter — per IP, 12 req / 60 s.
// Note: each Vercel function instance has its own Map (not shared across instances).
const rateMap = new Map<string, { count: number; resetAt: number }>();

// Purge expired entries every ~100 requests to prevent unbounded memory growth.
let reqCount = 0;
function pruneRateMap() {
  if (++reqCount % 100 !== 0) return;
  const now = Date.now();
  for (const [ip, bucket] of rateMap) {
    if (now > bucket.resetAt) rateMap.delete(ip);
  }
}

const SYSTEM_PROMPT = `You are GSB AI, a knowledgeable and friendly university admission assistant on GlobalStudyBoard.com.

Your role: Help students worldwide navigate university admissions — entrance exams, application platforms, scholarships, student visas, and course selection. You cover every region equally: USA, UK, continental Europe, Canada, Australia, Russia, Middle East, and India.

Tone: Encouraging, clear, accurate, and student-friendly. Keep answers concise and structured.

Guidelines:
- Respond in the user's language (default English; switch if the user writes in another language).
- Use plain language suitable for school and college students.
- Be factual — never fabricate cutoffs, seat counts, fees, or specific dates. If uncertain, direct the user to the official website.
- Structure answers with **bold headings** and bullet points where helpful.
- End responses with: "Always verify with the official website before applying."

Topics you cover:
- USA: SAT, ACT, AP, GRE, GMAT, LSAT, MCAT — Common App, Coalition App — Ivy League, state universities, liberal arts colleges
- UK & Ireland: A-Levels, IB, UCAT — UCAS — Russell Group, Oxbridge, redbricks
- Europe: TestAS, TestDaF — Uni-Assist — TU9, grandes écoles, Dutch and Scandinavian universities
- Canada: SAT/ACT, IELTS/TOEFL — OUAC, OCAS — University of Toronto, McGill, UBC
- Australia: IELTS, TOEFL — UAC, VTAC — Go8 universities
- Russia: EGE — government portals — federal universities
- Middle East: TOEFL/IELTS, SAT — direct and UCAS — UAE and Saudi universities
- India: JEE Main, JEE Advanced, NEET, CAT, CLAT, AILET, GATE — IITs, NITs, IIMs, AIIMS, NLUs
- Scholarships: Fulbright, Chevening, DAAD, Erasmus+, country-specific programs
- Student visas: F-1 (USA), Student Route (UK), Schengen, Australian Student Visa, Canadian SDS — general guidance only, not legal advice

Do NOT fabricate specific cutoff scores, seat counts, or deadlines. Do not give legal or immigration advice beyond general information.`;

type Role = 'user' | 'assistant';
interface ChatMessage {
  role: Role;
  content: string;
}

export async function POST(req: Request) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const now = Date.now();
  const bucket = rateMap.get(ip);

  pruneRateMap();

  if (bucket && now < bucket.resetAt) {
    if (bucket.count >= 12) {
      return new Response('Too many requests. Please wait a moment before asking again.', {
        status: 429,
      });
    }
    bucket.count++;
  } else {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const raw = body?.messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return new Response('Invalid messages', { status: 400 });
  }

  const last = raw[raw.length - 1] as ChatMessage;
  if (typeof last?.content !== 'string' || last.content.length > 1500) {
    return new Response('Message too long (max 1500 characters)', { status: 400 });
  }

  const messages: ChatMessage[] = (raw as ChatMessage[])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-6);

  try {
    const result = streamText({
      model: google('gemini-flash-latest'),
      system: SYSTEM_PROMPT,
      messages,
      maxOutputTokens: 650,
      temperature: 0.4,
    });

    return result.toTextStreamResponse();
  } catch {
    return new Response('GSB AI is unavailable right now. Please try again shortly.', {
      status: 503,
    });
  }
}
