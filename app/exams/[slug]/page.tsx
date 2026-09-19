import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Calendar, Clock, FileText, Award } from 'lucide-react';

import { ENTRANCE_EXAMS, getExamBySlug } from '@/lib/admission-guides';
import { COLLEGES } from '@/lib/colleges';
import { REGIONS } from '@/lib/regions';
import { rankGuidesForExam } from '@/lib/related-guides';
import ContentActions from '@/components/ContentActions';
import PageQuickLinks from '@/components/PageQuickLinks';
import RegionExplore from '@/components/RegionExplore';
import PageRegion from '@/components/PageRegion';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import SaveButton from '@/components/SaveButton';
import ContentImage from '@/components/ContentImage';
import { examImage } from '@/lib/images';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { breadcrumbsFor } from '@/lib/cmi';
import { SITE_REVIEWED, SITE_LASTMOD, formatReviewed } from '@/lib/site-meta';
import { pageMetadata, ogImageFor, absoluteImageUrl, CYCLE_SHORT, EDITORIAL_TEAM_LD, PUBLISHER_LD } from '@/lib/seo';
import { gsbAiHref } from '@/lib/gsb-ai-links';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ENTRANCE_EXAMS.map((e) => ({ slug: e.slug }));
}

/**
 * Intent-led title that promises ONLY what the page renders for this exam: the
 * pattern, eligibility and preparation guides are on every exam page; "Fees"
 * appears only when the record carries a stamped fee (32 of 53 deliberately do
 * not — country-varying or unverifiable — and a title promising fees they do not
 * show is the same misleading-claim pattern that got the Play listing rejected).
 * The cycle tag is truthful because every exam page shows a verified/reviewed date.
 */
function examTitle(exam: { shortName: string; region: string; costUsd?: string }, proseName?: string): string {
  const scope = exam.region !== 'global' && proseName ? ` in ${proseName}` : '';
  const parts = ['Pattern', 'Eligibility', ...(exam.costUsd ? ['Fees'] : []), 'How to Prepare'];
  const list = `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}`;
  return `${exam.shortName} Exam ${CYCLE_SHORT}: ${list}${scope}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = getExamBySlug(slug);
  if (!exam) return { title: 'Exam not found', robots: { index: false, follow: false } };
  const region = REGIONS.find((r) => r.slug === exam.region);
  return pageMetadata({
    title: examTitle(exam, region?.proseName),
    description: `${exam.fullName} (${exam.shortName}) — ${exam.descriptionEn}`,
    path: `/exams/${exam.slug}`,
    type: 'article',
    image: ogImageFor(exam.region),
    keywords: [
      `${exam.shortName} exam guide`,
      `${exam.shortName} preparation`,
      `${exam.shortName} eligibility`,
      `${exam.shortName} score`,
      `${exam.fullName}`,
      exam.conductingBody,
      exam.domain.replace('-', ' '),
    ],
    modifiedTime: exam.lastVerified ?? SITE_LASTMOD,
  });
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

  // Guides that cover this exam, ranked by how specifically they are ABOUT it
  // (dedicated prep/eligibility guides first). The first dedicated guide is the
  // page's long-form twin and is featured above the fact grid.
  const ranked = rankGuidesForExam(exam);
  const primaryGuide = ranked.find((r) => r.dedicated)?.guide ?? null;
  const relatedGuides = ranked
    .map((r) => r.guide)
    .filter((g) => g.slug !== primaryGuide?.slug)
    .slice(0, 8);

  const pageUrl = `https://www.globalstudyboard.com/exams/${exam.slug}`;
  const ogImage = ogImageFor(exam.region);

  // NOTE: no FAQPage JSON-LD here — the template renders no visible FAQ. The
  // page-level node is an Article ABOUT the exam: `EducationalTest` is not a
  // schema.org type (it validated as a severe INVALID_ITEMTYPE on all 53 exam
  // pages), and Course / Quiz / EducationalOccupationalCredential would all
  // misdescribe an informational page.
  const examLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: exam.fullName,
    alternativeHeadline: exam.shortName,
    description: exam.descriptionEn,
    inLanguage: 'en',
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    dateModified: exam.lastVerified ?? SITE_LASTMOD,
    image: [absoluteImageUrl(ogImage)],
    author: EDITORIAL_TEAM_LD,
    publisher: PUBLISHER_LD,
    about: {
      '@type': 'Thing',
      name: exam.fullName,
      alternateName: exam.shortName,
      ...(exam.websiteUrl ? { sameAs: exam.websiteUrl } : {}),
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <BreadcrumbsView crumbs={breadcrumbsFor(`/exams/${exam.slug}`)} />
      {exam.region !== 'global' && <PageRegion slug={exam.region} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(examLd) }}
      />

      <header>
        <Link
          href="/exams"
          prefetch={false}
          className="text-sm text-stone-500 hover:text-forest-700 no-underline inline-flex items-center gap-1 mb-4"
        >
          ← All exams
        </Link>
        <div className="flex items-center gap-2 mb-3">
          {region && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              <RegionFlag slug={region.slug} className="h-3.5" />{region.displayName}
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LastUpdated date={exam.lastVerified ?? SITE_REVIEWED} />
        {/* Shortlist — renders nothing until accounts are configured. */}
        <SaveButton kind="exam" slug={exam.slug} title={`${exam.shortName} — ${exam.fullName}`} region={exam.region} />
      </div>

      {/* Exam-concept archetype (empty hall, test desk, prep books…) — LCP for this page. */}
      <ContentImage
        asset={examImage({ slug: exam.slug, region: exam.region === 'global' ? undefined : exam.region })}
        variant="hero"
        priority
      />
      {/* Long-form twin — the dedicated guide for this exam, featured above the facts */}
      {primaryGuide && (
        <Link
          href={`/guides/${primaryGuide.slug}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-forest-200 bg-forest-50/70 px-5 py-4 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50"
        >
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700 mb-1">
              Full {exam.shortName} guide
            </span>
            <span className="font-display text-lg font-bold text-ink group-hover:text-forest-700 leading-snug">
              {primaryGuide.titleEn}
            </span>
            <span className="block text-sm text-stone-600 mt-1">
              {primaryGuide.readMinutes} min read · verified {formatReviewed(primaryGuide.lastVerified).display}
            </span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-forest-700" />
        </Link>
      )}

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
              Last verified: {formatReviewed(exam.lastVerified).display}.
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
                    {collegeRegion && <RegionFlag slug={collegeRegion.slug} className="h-3.5" />}
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

      {/* Preparation guides */}
      {relatedGuides.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-5">
            Guides that cover the {exam.shortName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 hover:bg-cream-50 transition-colors"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest-700 mb-2">
                  {g.readMinutes} min read
                </p>
                <p className="font-display text-base font-bold text-ink m-0 group-hover:text-forest-700 leading-snug">
                  {g.titleEn}
                </p>
                <p className="text-stone-500 text-sm mt-2 mb-0 line-clamp-2">
                  {g.descriptionEn}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="on-dark bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Need prep advice for {exam.shortName}?
        </h2>
        <p className="text-cream-50/85 mb-5">Ask GSB AI for a personalised study plan.</p>
        <Link
          href={gsbAiHref({ q: `How do I prepare for the ${exam.shortName}?` })}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>

      {exam.region !== 'global' && <RegionExplore region={exam.region} />}

      {/* Quick links — popular topics & guides */}
      <PageQuickLinks currentPath={`/exams/${exam.slug}`} region={exam.region} />

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
