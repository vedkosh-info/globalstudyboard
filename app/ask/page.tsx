import type { Metadata } from 'next';
import { Sparkles, ChevronRight } from 'lucide-react';
import GSBAIChat from '@/components/GSBAIChat';
import { pageMetadata } from '@/lib/seo';

/**
 * Static page at /ask. Prefills travel in the URL fragment (`/ask#q=…`,
 * `/ask#region=…`): a fragment is not a separate URL to a crawler, so every
 * page links to this one canonical URL. The old /gsb-ai path 301s here.
 * GSBAIChat reads the fragment (and any legacy `?q=` query) on the client.
 * Query-string copies stay out of the index via robots.txt (`/ask?*`).
 */
export const metadata: Metadata = pageMetadata({
  title: 'Ask GSB — Admissions, Exams and Scholarships',
  description:
    'Ask about entrance exams, universities, scholarships and student visas. Answers are general guidance. Confirm every detail on the official site.',
  path: '/ask',
  keywords: [
    'university admissions questions',
    'entrance exam questions',
    'study abroad questions',
    'scholarship questions',
    'student visa questions',
  ],
});

const TOPICS = [
  { label: 'Entrance Exams', examples: 'SAT, ACT, GRE, GMAT, A-Levels, IELTS, TOEFL' },
  { label: 'Universities', examples: 'Ivies, Russell Group, Go8, TU9, IITs and more' },
  { label: 'Study Abroad', examples: 'USA, UK, Europe, Canada, Australia' },
  { label: 'Applications', examples: 'Common App, UCAS, Uni-Assist, OUAC' },
  { label: 'Scholarships', examples: 'Merit-based, need-based, country-specific' },
  { label: 'Visas & Work', examples: 'F-1, Student Route, post-study work permits' },
];

export default function AskPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-cream-100 border border-stone-200 text-forest-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
          Questions
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-3">
          Ask GSB
        </h1>
        <p className="text-stone-600 text-base max-w-lg mx-auto leading-relaxed">
          Ask about entrance exams, universities, scholarships and student visas. Answers are general guidance. Confirm every detail on the official site before you apply.
        </p>
      </div>

      <GSBAIChat />

      <section>
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.18em] mb-4">
          What you can ask about
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOPICS.map((topic) => (
            <div
              key={topic.label}
              className="bg-white border border-stone-200 rounded-xl px-4 py-3 hover:border-forest-300 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <ChevronRight className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                <span className="font-semibold text-stone-800 text-sm">{topic.label}</span>
              </div>
              <p className="text-xs text-stone-500 pl-5">{topic.examples}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-stone-500 text-center leading-relaxed pb-2">
        Ask GSB gives general guidance only. It may not reflect the latest update. Always verify deadlines, fees and eligibility on the official university or exam website before applying.
      </p>

    </div>
  );
}
