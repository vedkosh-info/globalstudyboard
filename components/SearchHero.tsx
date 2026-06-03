import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const POPULAR_QUERIES = [
  { label: 'How to apply to U.S. universities', href: '/gsb-ai?q=how-to-apply-to-us-universities' },
  { label: 'SAT vs ACT', href: '/gsb-ai?q=sat-vs-act' },
  { label: 'Free tuition in Europe', href: '/gsb-ai?q=free-tuition-universities-europe' },
  { label: 'UCAS deadlines 2026', href: '/gsb-ai?q=ucas-deadlines-2026' },
  { label: 'Common App essay tips', href: '/gsb-ai?q=common-app-essay-prompts' },
  { label: 'F-1 visa interview', href: '/gsb-ai?q=f1-visa-interview-questions' },
];

export default function SearchHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-cream-100 border border-stone-200 px-6 sm:px-12 py-14 md:py-20">
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-24 w-72 h-72 rounded-full bg-forest-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-terracotta-100 blur-3xl"
      />

      <div className="relative max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-4">
          Worldwide · Independent · Up-to-date
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-editorial text-ink mb-6">
          Find the right university,
          <br />
          <span className="text-forest-700">wherever you want to study.</span>
        </h1>
        <p className="text-stone-700 text-lg max-w-2xl leading-relaxed mb-8">
          Browse universities, entrance exams, and scholarships across the United States, Europe, the U.K., Canada, Australia, and beyond — with one consistent guide. Ask anything; we&apos;ll point you to the source.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            href="/gsb-ai"
            className="inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold px-6 py-3.5 rounded-full no-underline transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Ask GSB AI a question
          </Link>
          <Link
            href="/regions"
            className="inline-flex items-center justify-center bg-white hover:bg-stone-50 text-stone-800 font-semibold px-6 py-3.5 rounded-full no-underline transition-colors border border-stone-300"
          >
            Browse by region
          </Link>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.16em] uppercase text-stone-500 mb-3">
            What students are asking
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_QUERIES.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="bg-white hover:bg-forest-50 hover:border-forest-300 hover:text-forest-700 text-stone-700 text-sm px-3.5 py-1.5 rounded-full no-underline transition-colors border border-stone-200"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
