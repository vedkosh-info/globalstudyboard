import type { Metadata } from 'next';
import { Sparkles, ChevronRight } from 'lucide-react';
import GSBAIChat from '@/components/GSBAIChat';

export const metadata: Metadata = {
  title: 'Ask GSB AI — Free University Admission AI Assistant',
  description:
    'Get instant answers about university admissions, entrance exams, scholarships, student visas and study abroad from GSB AI. Free AI-powered guide for every country.',
  keywords: [
    'university admission AI assistant',
    'college admission chatbot',
    'study abroad AI guide',
    'SAT ACT advice',
    'UCAS common app help',
    'GRE GMAT tips',
    'student visa help',
    'scholarship finder AI',
    'free university guide',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/gsb-ai' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/gsb-ai',
    title: 'Ask GSB AI — Free University Admission AI Assistant',
    description: 'Instant answers about university admissions, entrance exams, scholarships and study abroad — powered by AI, free to use.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ask GSB AI — Free University Admission AI Assistant',
    description: 'Instant answers about university admissions, entrance exams, scholarships and study abroad.',
    images: ['/opengraph-image'],
  },
};

const TOPICS = [
  { label: 'Entrance Exams', examples: 'SAT, ACT, GRE, GMAT, A-Levels, IELTS, TOEFL' },
  { label: 'Universities', examples: 'Ivies, Russell Group, Go8, TU9, IITs and more' },
  { label: 'Study Abroad', examples: 'USA, UK, Europe, Canada, Australia' },
  { label: 'Applications', examples: 'Common App, UCAS, Uni-Assist, OUAC' },
  { label: 'Scholarships', examples: 'Merit-based, need-based, country-specific' },
  { label: 'Visas & Work', examples: 'F-1, Tier 4, post-study work permits' },
];

export default function GSBAIPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-cream-100 border border-stone-200 text-forest-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
          AI-Powered Guide
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-3">
          Ask GSB AI
        </h1>
        <p className="text-stone-600 text-base max-w-lg mx-auto leading-relaxed">
          Your free AI university admission assistant. Ask about entrance exams, university selection, study abroad, scholarships, visas, and more.
        </p>
      </div>

      <GSBAIChat />

      <section>
        <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-[0.18em] mb-4">
          What GSB AI can help with
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
        GSB AI provides general guidance only. Information may not reflect the latest updates. Always verify deadlines, fees, and eligibility on official university and exam websites before applying.
      </p>

    </div>
  );
}
