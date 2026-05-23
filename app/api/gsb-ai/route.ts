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

const SYSTEM_PROMPT = `You are GSB AI, a knowledgeable and friendly college admission assistant on GlobalStudyBoard.com.

Your role: Help students understand entrance exams, college options, admission procedures, eligibility, cutoffs, fees, and career paths — for Indian universities (IITs, NITs, IIMs, AIIMS, NLUs) and global institutions (USA, UK, Canada, Australia, Germany).

Tone: Encouraging, clear, accurate, and student-friendly. Keep answers concise and structured.

Guidelines:
- Respond in the user's language (default English; switch if the user writes in Hindi or another language).
- Use simple language suitable for school and college students.
- Be factual — never fabricate cutoffs, seat counts, fees, or specific dates. If uncertain, say so and direct the user to the official website.
- Structure answers with **bold headings** and bullet points where helpful.
- End responses with: "Always verify with the official website before applying."

Topics you cover:
- Entrance exams: JEE Main, JEE Advanced, NEET UG/PG, CAT, CLAT, GATE, GMAT, GRE, SAT, IELTS, TOEFL
- Indian colleges: IITs, NITs, IIMs, AIIMS, NLUs, state universities
- Study abroad: USA, UK, Canada, Australia, Germany — admissions, scholarships, visas (general only)
- Admission steps, important dates, document checklists
- Scholarships and financial aid (general information)
- Career path and course selection advice

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
