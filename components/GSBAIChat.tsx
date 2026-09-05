'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, RotateCcw, Bot, Sparkles } from 'lucide-react';
import { useRegion } from '@/components/RegionProvider';
import ReportAIResponse from '@/components/ReportAIResponse';

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

export default function GSBAIChat({
  initialPrompt,
  region,
}: {
  initialPrompt?: string;
  region?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialPrompt ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { effectiveRegion } = useRegion();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setInput('');
    setError(null);

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
          region: region ?? effectiveRegion,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error((await res.text()) || 'GSB AI is unavailable. Please try again.');
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
          <span className="font-semibold text-sm">GSB AI</span>
          <span className="text-cream-50/60 text-xs hidden sm:inline">
            · University Admission Assistant
          </span>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={() => {
              abortRef.current?.abort();
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
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-[340px] max-h-[420px]">
        {isEmpty ? (
          <div className="text-center py-10">
            <Bot className="w-10 h-10 text-forest-300 mx-auto mb-3" />
            <p className="text-stone-700 text-sm font-medium mb-1">Ask GSB AI anything</p>
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
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-forest-700 text-cream-50 rounded-br-sm'
                    : 'bg-cream-50 border border-stone-200 text-stone-800 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="text-xs font-bold text-terracotta-600 block mb-1.5 uppercase tracking-wide">
                    GSB AI
                  </span>
                )}
                <div className="whitespace-pre-wrap">
                  {msg.content || (isLoading ? (
                    <span className="text-stone-500 flex gap-0.5 items-center">
                      <span className="animate-pulse">Typing</span>
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
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
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}

        <div ref={bottomRef} />
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
          className="flex-1 bg-cream-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-forest-400 focus:bg-white transition-colors"
          maxLength={1500}
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className="bg-forest-700 hover:bg-forest-800 disabled:bg-stone-200 disabled:cursor-not-allowed text-cream-50 disabled:text-stone-400 rounded-xl px-4 py-2.5 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
