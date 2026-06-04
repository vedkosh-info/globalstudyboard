import type { Metadata } from 'next';
import Link from 'next/link';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { REGIONS } from '@/lib/regions';
import ExamsDestinationSpotlight from '@/components/ExamsDestinationSpotlight';

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

const REGION_LABELS: Record<string, { label: string; flag: string }> = Object.fromEntries(
  REGIONS.map((r) => [r.slug, { label: r.displayName, flag: r.flag }])
);
REGION_LABELS.global = { label: 'Worldwide', flag: '🌐' };

export default function ExamsIndexPage() {
  // Group exams by region
  const byRegion = ENTRANCE_EXAMS.reduce<Record<string, typeof ENTRANCE_EXAMS>>((acc, exam) => {
    if (!acc[exam.region]) acc[exam.region] = [];
    acc[exam.region].push(exam);
    return acc;
  }, {});

  // Order: USA, UK-Ireland, Europe, global, others, India
  const regionOrder = ['usa', 'uk-ireland', 'europe', 'global', 'australia-nz', 'canada', 'russia', 'middle-east', 'india'];
  const orderedRegions = regionOrder.filter((r) => byRegion[r]);

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

      <ExamsDestinationSpotlight />

      {orderedRegions.map((regionSlug) => {
        const meta = REGION_LABELS[regionSlug];
        const exams = byRegion[regionSlug];
        return (
          <section key={regionSlug}>
            <div className="section-rule mb-5">
              <span>
                <span aria-hidden="true" className="mr-2">{meta?.flag}</span>
                {meta?.label ?? regionSlug}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.slug}`}
                  className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xl font-bold text-ink group-hover:text-forest-700 transition-colors">
                      {exam.shortName}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      {exam.domain.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 mb-3">
                    {exam.fullName}
                  </p>
                  <div className="mt-auto pt-3 text-xs text-stone-500 flex flex-wrap gap-x-3 gap-y-1">
                    <span>{exam.frequency.split('(')[0].trim()}</span>
                    {exam.costUsd && <span>· {exam.costUsd}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
