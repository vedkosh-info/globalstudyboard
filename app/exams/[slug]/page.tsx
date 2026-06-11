import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Calendar, Clock, FileText, Award } from 'lucide-react';

import { ENTRANCE_EXAMS, getExamBySlug } from '@/lib/admission-guides';
import { COLLEGES } from '@/lib/colleges';
import { REGIONS } from '@/lib/regions';
import ContentActions from '@/components/ContentActions';
import PageQuickLinks from '@/components/PageQuickLinks';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ENTRANCE_EXAMS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = getExamBySlug(slug);
  if (!exam) return { title: 'Exam not found' };
  const desc = exam.descriptionEn.slice(0, 155);
  return {
    title: `${exam.shortName} — ${exam.fullName}`,
    description: desc,
    keywords: [
      `${exam.shortName} exam guide`,
      `${exam.shortName} preparation`,
      `${exam.shortName} eligibility`,
      `${exam.shortName} score`,
      `${exam.fullName}`,
      exam.conductingBody,
      exam.domain.replace('-', ' '),
    ],
    alternates: { canonical: `https://www.globalstudyboard.com/exams/${exam.slug}` },
    openGraph: {
      type: 'article',
      url: `https://www.globalstudyboard.com/exams/${exam.slug}`,
      title: `${exam.shortName} — ${exam.fullName}`,
      description: desc,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${exam.shortName} — ${exam.fullName}`,
      description: desc,
      images: ['/opengraph-image'],
    },
  };
}

export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const exam = getExamBySlug(slug);
  if (!exam) notFound();

  const region = REGIONS.find((r) => r.slug === exam.region);
  const acceptingColleges = COLLEGES.filter((c) => exam.collegesAccepting.includes(c.id));

  // Related — other exams in the same region or domain (continuity, no dead ends).
  const relatedExams = ENTRANCE_EXAMS.filter(
    (e) => e.slug !== exam.slug && (e.region === exam.region || e.domain === exam.domain),
  ).slice(0, 4);


  const examLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalTest',
    '@id': `https://www.globalstudyboard.com/exams/${exam.slug}`,
    name: exam.shortName,
    alternateName: exam.fullName,
    description: exam.descriptionEn,
    inLanguage: 'en',
    url: `https://www.globalstudyboard.com/exams/${exam.slug}`,
    about: { '@type': 'Thing', name: exam.domain.replace(/-/g, ' ') },
    ...(exam.websiteUrl ? { sameAs: exam.websiteUrl } : {}),
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.globalstudyboard.com/#organization',
      name: 'GlobalStudyBoard',
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(examLd) }}
      />

      <header>
        <Link
          href="/exams"
          className="text-sm text-stone-500 hover:text-forest-700 no-underline inline-flex items-center gap-1 mb-4"
        >
          ← All exams
        </Link>
        <div className="flex items-center gap-2 mb-3">
          {region && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {region.flag} {region.displayName}
            </span>
          )}
          <span className="text-stone-300">·</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 capitalize">
            {exam.domain.replace('-', ' ')}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-editorial leading-[1.05] text-ink mb-3">
          {exam.shortName}
        </h1>
        <p className="text-stone-700 text-xl">{exam.fullName}</p>
      </header>

      <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
        {exam.descriptionEn}
      </p>

      {/* Facts grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FactCard icon={<Calendar className="w-5 h-5" />} label="Frequency" value={exam.frequency} />
        <FactCard icon={<Clock className="w-5 h-5" />} label="Duration" value={exam.duration} />
        <FactCard icon={<FileText className="w-5 h-5" />} label="Format" value={exam.mode.charAt(0).toUpperCase() + exam.mode.slice(1)} />
        <FactCard icon={<Award className="w-5 h-5" />} label="Score range" value={exam.totalMarks} />
      </section>

      {/* Eligibility */}
      <section className="bg-cream-50 border border-stone-200 rounded-2xl p-6">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
          Eligibility
        </p>
        <p className="text-stone-800 text-base leading-relaxed m-0">{exam.eligibility}</p>
      </section>

      {/* Conducting body */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
            Conducting body
          </p>
          <p className="text-stone-800 text-base m-0">{exam.conductingBody}</p>
        </div>
        {exam.costUsd && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
              Registration fee
            </p>
            <p className="text-stone-800 text-base m-0">{exam.costUsd}</p>
          </div>
        )}
      </section>

      {/* Official link */}
      {exam.websiteUrl && (
        <div className="space-y-2">
          <a
            href={exam.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
          >
            Visit official website <ArrowUpRight className="w-4 h-4" />
          </a>
          <p className="text-stone-500 text-xs leading-relaxed max-w-xl">
            Source: {exam.conductingBody}. Details here are for guidance only — fees, dates and
            eligibility change each cycle, so confirm on the official site before applying.
          </p>
          {exam.sources && exam.sources.length > 0 && (
            <p className="text-stone-500 text-xs leading-relaxed max-w-xl m-0">
              Verified against:{' '}
              {exam.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && '; '}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest-700 underline"
                  >
                    {s.label}
                  </a>
                </span>
              ))}
              .
            </p>
          )}
          {exam.lastVerified && (
            <p className="text-stone-500 text-xs leading-relaxed max-w-xl m-0">
              Last verified: {exam.lastVerified}.
            </p>
          )}
        </div>
      )}

      {/* Universities accepting */}
      {acceptingColleges.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-5">
            Universities that accept {exam.shortName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {acceptingColleges.map((c) => {
              const collegeRegion = REGIONS.find((r) => r.slug === c.region);
              return (
                <Link
                  key={c.id}
                  href={`/colleges/${c.slug}`}
                  className="bg-white border border-stone-200 rounded-xl p-4 no-underline hover:border-forest-300 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span aria-hidden="true">{collegeRegion?.flag}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      {collegeRegion?.displayName}
                    </span>
                  </div>
                  <p className="font-medium text-stone-800 text-sm group-hover:text-forest-700 m-0">
                    {c.nameEn}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Like / Share / Print */}
      <ContentActions title={`${exam.shortName} — ${exam.fullName}`} />

      {/* Related / Next steps */}
      {(relatedExams.length > 0 || region) && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-4">
            Related / Next steps
          </h2>
          {relatedExams.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {relatedExams.map((e) => (
                <Link
                  key={e.slug}
                  href={`/exams/${e.slug}`}
                  className="text-sm font-medium bg-forest-50 text-forest-800 border border-forest-200 px-3 py-1.5 rounded-full no-underline hover:bg-forest-100 transition-colors"
                >
                  {e.shortName}
                </Link>
              ))}
            </div>
          )}
          {region && (
            <Link
              href={`/regions/${region.slug}`}
              className="inline-flex items-center gap-1 text-forest-700 font-medium no-underline hover:text-forest-800"
            >
              Explore studying in {region.displayName} →
            </Link>
          )}
        </section>
      )}

      {/* CTA */}
      <section className="bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Need prep advice for {exam.shortName}?
        </h2>
        <p className="text-cream-50/85 mb-5">Ask GSB AI for a personalised study plan.</p>
        <Link
          href={`/gsb-ai?q=how-to-prep-for-${exam.slug}`}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>

      {/* Quick links — popular topics & guides */}
      <PageQuickLinks currentPath={`/exams/${exam.slug}`} />

    </div>
  );
}

function FactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="text-forest-700 mb-2">{icon}</div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
        {label}
      </p>
      <p className="text-stone-800 text-sm font-medium leading-snug m-0">{value}</p>
    </div>
  );
}
