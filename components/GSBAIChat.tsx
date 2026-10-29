'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, RotateCcw, Bot, Sparkles } from 'lucide-react';
import { useRegion } from '@/components/RegionProvider';
import ReportAIResponse from '@/components/ReportAIResponse';
import { getRegionBySlug, REGION_SLUGS, type RegionSlug } from '@/lib/regions';
import { CHAT_UI } from '@/lib/chat-ui';

/** Parse a prefill from the fragment (`#q=…` / `#region=…`) or a legacy `?q=` / `?region=` query. */
function readPrefill(): { q?: string; region?: RegionSlug } {
  if (typeof window === 'undefined') return {};
  const fromHash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const fromQuery = new URLSearchParams(window.location.search);
  const q = (fromHash.get('q') ?? fromQuery.get('q') ?? '').trim();
  const regionRaw = fromHash.get('region') ?? fromQuery.get('region') ?? '';
  const region = (REGION_SLUGS as readonly string[]).includes(regionRaw) ? (regionRaw as RegionSlug) : undefined;
  return { ...(q ? { q } : {}), ...(region ? { region } : {}) };
}

type Role = 'user' | 'assistant';
interface Message {
  id: string;
  role: Role;
  content: string;
}

const EXAMPLE_QUESTIONS = [
  'How do I apply to U.S. universities from abroad?',
  'What is the difference between the SAT and ACT?',
  'Which European universities offer free tuition?',
  'How does the UCAS application work?',
  'What are the best CS programs in Canada?',
  'How do I prepare for the GRE in three months?',
];

export default function GSBAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hintReady, setHintReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const followLatestRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const { effectiveRegion, region: chosenRegion, setPageRegion, ready } = useRegion();
  const chosenRegionRef = useRef(chosenRegion);

  useEffect(() => {
    chosenRegionRef.current = chosenRegion;
  }, [chosenRegion]);

  useEffect(() => {
    // Keep streaming inside the conversation. scrollIntoView also moved the
    // document on the empty first render and pulled readers away from earlier
    // answers. Only follow while the student is already near the bottom; an
    // instant scroll avoids starting a new animation for every incoming chunk.
    const panel = messagesRef.current;
    if (panel && messages.length > 0 && followLatestRef.current) {
      panel.scrollTo({ top: panel.scrollHeight, behavior: 'auto' });
    }
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Prefill from the URL fragment (or a legacy query) on mount and whenever the
  // fragment changes while the page stays mounted (a hash link clicked on /ask
  // itself does not remount the route).
  useEffect(() => {
    if (!ready) return;
    const apply = () => {
      const { q, region: r } = readPrefill();
      // A link's destination is provisional context, exactly like PageRegion:
      // never a cookie and never stronger than the student's remembered choice.
      // Read it independently of q so a paired question/destination keeps both.
      setPageRegion(r ?? null);
      const destination = chosenRegionRef.current ?? r;
      const regionName = destination ? getRegionBySlug(destination)?.proseName : undefined;
      if (q) setInput(q);
      else if (regionName) setInput(`I'm planning to study in ${regionName}. Where should I start?`);
      setHintReady(true);
    };
    apply();
    window.addEventListener('hashchange', apply);
    window.addEventListener('popstate', apply);
    return () => {
      window.removeEventListener('hashchange', apply);
      window.removeEventListener('popstate', apply);
      setPageRegion(null);
    };
  }, [ready, setPageRegion]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !hintReady) return;

    setInput('');
    setError(null);
    followLatestRef.current = true;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text.trim() };
    const asstId = `a-${Date.now() + 1}`;

    // Capture current messages BEFORE state update — this is the correct context to send
    const context = [...messages, userMsg];

    setMessages([...context, { id: asstId, role: 'assistant', content: '' }]);
    setIsLoading(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/gsb-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: context.map(({ role, content }) => ({ role, content })),
          region: effectiveRegion,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error((await res.text()) || 'Ask GSB is unavailable. Please try again.');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No response stream received.');

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === asstId ? { ...m, content: m.content + chunk } : m)),
          );
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong. Please try again.');
        setMessages((prev) => prev.filter((m) => m.id !== asstId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-forest-700 text-cream-50 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-terracotta-300" />
          <span className="font-semibold text-sm">Ask GSB</span>
          <span className="text-cream-50/80 text-xs hidden sm:inline">
            · Study questions
          </span>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort();
              followLatestRef.current = true;
              setMessages([]);
              setError(null);
            }}
            className="text-cream-50/70 hover:text-cream-50 text-xs flex items-center gap-1.5 py-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        role="log"
        aria-label={CHAT_UI.conversationLabel}
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={isLoading}
        onScroll={(event) => {
          const panel = event.currentTarget;
          followLatestRef.current = panel.scrollHeight - panel.scrollTop - panel.clientHeight < 48;
        }}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-[340px] max-h-[420px]"
      >
        {isEmpty ? (
          <div className="text-center py-10">
            <Bot className="w-10 h-10 text-forest-300 mx-auto mb-3" />
            <p className="text-stone-700 text-sm font-medium mb-1">Ask GSB anything</p>
            <p className="text-stone-500 text-xs">
              Entrance exams · University selection · Study abroad · Scholarships
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-base leading-relaxed sm:max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-forest-700 text-cream-50 rounded-br-sm'
                    : 'bg-cream-50 border border-stone-200 text-stone-800 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="text-xs font-bold text-terracotta-600 block mb-1.5 uppercase tracking-wide">
                    Ask GSB
                  </span>
                )}
                <div className="whitespace-pre-wrap">
                  {msg.content || (isLoading ? (
                    <span className="text-stone-500 motion-safe:animate-pulse">
                      {CHAT_UI.typing}
                    </span>
                  ) : null)}
                </div>
                {/* Play's Generative AI policy requires an in-app way to report
                    AI output. Only offered once an answer has finished streaming. */}
                {msg.role === 'assistant' && msg.content && !isLoading && (
                  <ReportAIResponse answer={msg.content} />
                )}
              </div>
            </div>
          ))
        )}

        {error && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}

      </div>

      {/* Example pills — only when empty */}
      {isEmpty && (
        <div className="px-4 pb-3">
          <p className="text-xs text-stone-500 mb-2 uppercase tracking-[0.16em]">Try asking</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void sendMessage(q)}
                disabled={!hintReady}
                className="text-xs bg-cream-50 border border-stone-200 text-stone-700 hover:border-forest-300 hover:text-forest-700 px-3 py-1.5 rounded-full transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-stone-200 flex gap-2 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about universities, exams, study abroad..."
          aria-label={CHAT_UI.questionLabel}
          enterKeyHint="send"
          className="min-w-0 flex-1 bg-cream-50 border border-stone-450 rounded-xl px-4 py-2.5 text-base text-stone-800 placeholder-stone-500 focus:outline-none focus:border-forest-600 focus:bg-white transition-colors"
          maxLength={1500}
          disabled={isLoading || !hintReady}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !hintReady || !input.trim()}
          aria-label="Send message"
          className="bg-forest-700 hover:bg-forest-800 disabled:bg-stone-200 disabled:cursor-not-allowed text-cream-50 disabled:text-stone-400 rounded-xl px-4 py-2.5 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
