import type { Metadata } from 'next';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { resolveDisplayRegions } from '@/lib/regions';
import ExamsView, { type ExamCard } from '@/components/ExamsView';

export const metadata: Metadata = {
  title: 'All Entrance Exams — SAT, ACT, GRE, IELTS, A-Levels & More',
  description:
    'Compare every university entrance exam worldwide: SAT, ACT, AP, GRE, GMAT, MCAT, LSAT, A-Levels, IB, TestAS, IELTS, TOEFL, Duolingo, PTE, JEE, NEET and CAT — with costs, formats and official links.',
  keywords: [
    'SAT exam guide',
    'ACT vs SAT',
    'GRE preparation',
    'GMAT score',
    'IELTS TOEFL comparison',
    'A-Levels universities',
    'IB diploma',
    'TestAS Germany',
    'university entrance exams',
    'JEE NEET CAT',
    'LSAT MCAT',
    'standardised tests worldwide',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/exams' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/exams',
    title: 'All Entrance Exams — SAT, ACT, GRE, IELTS, A-Levels & More',
    description: 'Compare every university entrance exam worldwide — formats, costs, frequency and official sources.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Entrance Exams — GlobalStudyBoard',
    description: 'SAT, ACT, GRE, GMAT, IELTS, TOEFL, A-Levels, IB, JEE, NEET, CAT — all compared in one place.',
    images: ['/opengraph-image'],
  },
};

export default function ExamsIndexPage() {
  const items: ExamCard[] = ENTRANCE_EXAMS.map((e) => ({
    id: e.id,
    slug: e.slug,
    shortName: e.shortName,
    fullName: e.fullName,
    domain: e.domain,
    frequency: e.frequency,
    costUsd: e.costUsd,
    region: e.region,
    regions: resolveDisplayRegions(e.region, e.regions),
  }));

  return (
    <div className="space-y-14">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Standardised tests
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Entrance exams, region by region.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          Every test that gates a university admission, with the conducting body, frequency, format, and what scores get you in. Open any exam for the official source.
        </p>
      </header>

      <ExamsView items={items} />
    </div>
  );
}
