import type { Metadata } from 'next';
import { Sparkles, ChevronRight } from 'lucide-react';
import GSBAIChat from '@/components/GSBAIChat';

export const revalidate = false;

export const metadata: Metadata = {
  title: 'GSB AI — College Admission AI Assistant',
  description:
    'Ask GSB AI about college admissions, entrance exams, study abroad, scholarships, and university selection. Free AI-powered guide for Indian and global universities.',
  keywords: [
    'college admission AI',
    'JEE help AI',
    'NEET guidance AI',
    'study abroad AI',
    'college guide chatbot',
    'IIT admission assistant',
  ],
};

const TOPICS = [
  { label: 'Entrance Exams', examples: 'JEE, NEET, CAT, CLAT, GRE, GMAT, IELTS' },
  { label: 'Indian Colleges', examples: 'IITs, NITs, IIMs, AIIMS, NLUs' },
  { label: 'Study Abroad', examples: 'USA, UK, Canada, Australia, Germany' },
  { label: 'Admission Steps', examples: 'Documents, deadlines, application process' },
  { label: 'Scholarships', examples: 'Merit-based, need-based, country-specific' },
  { label: 'Career Guidance', examples: 'Course selection, career paths' },
];

export default function GSBAIPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Page heading */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
          AI-Powered Guide
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-brand-700 mb-3">
          GSB AI
        </h1>
        <p className="text-slate-500 text-base max-w-lg mx-auto leading-relaxed">
          Your free AI college admission assistant. Ask about entrance exams, college selection,
          study abroad, scholarships, and more.
        </p>
      </div>

      {/* Chat widget */}
      <GSBAIChat />

      {/* Topics grid */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
          What GSB AI can help with
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOPICS.map((topic) => (
            <div
              key={topic.label}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-brand-300 transition-colors"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <ChevronRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="font-semibold text-slate-700 text-sm">{topic.label}</span>
              </div>
              <p className="text-xs text-slate-400 pl-5">{topic.examples}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center leading-relaxed pb-2">
        GSB AI provides general guidance only. Information may not reflect the latest updates.
        Always verify cutoffs, fees, and deadlines on official college and exam websites before applying.
      </p>

    </div>
  );
}
