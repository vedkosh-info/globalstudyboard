import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { GUIDES, GUIDE_CATEGORY_LABELS, type GuideCategory } from '@/lib/guides';
import { REGIONS } from '@/lib/regions';

export const metadata: Metadata = {
  title: 'Study Guides — Exams, Admissions, Careers & Study Abroad',
  description:
    'Clear, official-source guides to entrance exams, admissions, counselling, careers and studying abroad — from JEE and NEET to applying overseas. Free, evergreen, and verified.',
  keywords: [
    'study guides',
    'jee main guide',
    'josaa counselling',
    'how to apply for jee main',
    'career options after 12th',
    'study abroad from india',
    'admission guides',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/guides' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/guides',
    title: 'Study Guides — Exams, Admissions, Careers & Study Abroad',
    description:
      'Clear, official-source guides to entrance exams, admissions, counselling, careers and studying abroad.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Guides — GlobalStudyBoard',
    description:
      'Evergreen, verified guides to exams, admissions, careers and studying abroad.',
    images: ['/opengraph-image'],
  },
};

const CATEGORY_ORDER: GuideCategory[] = [
  'exam-prep',
  'admissions',
  'comparison',
  'career',
  'study-abroad',
  'scholarships',
];

const regionMeta = (slug: string) => REGIONS.find((r) => r.slug === slug);

export default function GuidesIndexPage() {
  const byCategory = GUIDES.reduce<Record<string, typeof GUIDES>>((acc, g) => {
    (acc[g.category] ??= []).push(g);
    return acc;
  }, {});

  const orderedCategories = CATEGORY_ORDER.filter((c) => byCategory[c]);

  return (
    <div className="space-y-14">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Study guides
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Guides that answer what students actually ask.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          Step-by-step explainers on entrance exams, admissions, counselling, careers and
          studying abroad — written in plain language and checked against official sources. Every
          time-sensitive fact links to the official site, because rules change each year.
        </p>
      </header>

      {orderedCategories.map((category) => {
        const guides = byCategory[category];
        return (
          <section key={category}>
            <div className="section-rule mb-5">
              <span>{GUIDE_CATEGORY_LABELS[category]}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guides.map((guide) => {
                const meta = regionMeta(guide.region);
                return (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {meta && (
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                          <span aria-hidden="true" className="mr-1">{meta.flag}</span>
                          {meta.displayName}
                        </span>
                      )}
                      <span className="text-stone-300">·</span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                        {guide.readMinutes} min read
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold tracking-editorial text-ink leading-snug mb-2 group-hover:text-forest-700">
                      {guide.titleEn}
                    </h2>
                    <p className="text-stone-600 text-sm leading-relaxed m-0 flex-1">
                      {guide.descriptionEn}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                      Read guide <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
