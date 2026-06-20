import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';

import { GUIDES, getGuideBySlug, GUIDE_CATEGORY_LABELS } from '@/lib/guides';
import { getExamBySlug } from '@/lib/admission-guides';
import { getCollegeBySlug } from '@/lib/colleges';
import { REGIONS } from '@/lib/regions';
import { topicsForGuide } from '@/lib/topic-guides';
import { howToLd, isHowToGuide } from '@/lib/structured-data';
import KeyFacts from '@/components/KeyFacts';
import ContentActions from '@/components/ContentActions';
import PageQuickLinks from '@/components/PageQuickLinks';
import RegionExplore from '@/components/RegionExplore';
import PageRegion from '@/components/PageRegion';
import LastUpdated from '@/components/LastUpdated';
import { formatReviewed } from '@/lib/site-meta';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: 'Guide not found' };
  const desc = guide.descriptionEn.slice(0, 155);
  return {
    title: guide.titleEn,
    description: desc,
    keywords: guide.keywords,
    alternates: { canonical: `https://www.globalstudyboard.com/guides/${guide.slug}` },
    openGraph: {
      type: 'article',
      url: `https://www.globalstudyboard.com/guides/${guide.slug}`,
      title: guide.titleEn,
      description: desc,
      images: ['/opengraph-image'],
      publishedTime: guide.lastVerified,
      modifiedTime: guide.lastVerified,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.titleEn,
      description: desc,
      images: ['/opengraph-image'],
    },
  };
}

/** Split prose into paragraphs on blank lines. */
function paragraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const region = REGIONS.find((r) => r.slug === guide.region);

  const relatedExams = guide.relatedExamSlugs
    .map((s) => getExamBySlug(s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const relatedColleges = guide.relatedCollegeSlugs
    .map((s) => getCollegeBySlug(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const relatedGuides = guide.relatedGuideSlugs
    .map((s) => getGuideBySlug(s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));
  const topics = topicsForGuide(guide);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://www.globalstudyboard.com/guides/${guide.slug}#article`,
    headline: guide.titleEn,
    description: guide.descriptionEn,
    inLanguage: 'en',
    url: `https://www.globalstudyboard.com/guides/${guide.slug}`,
    datePublished: guide.lastVerified,
    dateModified: guide.lastVerified,
    image: ['https://www.globalstudyboard.com/opengraph-image'],
    author: {
      '@type': 'Organization',
      '@id': 'https://www.globalstudyboard.com/#organization',
      name: 'GlobalStudyBoard',
      url: 'https://www.globalstudyboard.com',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.globalstudyboard.com/#organization',
      name: 'GlobalStudyBoard',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.globalstudyboard.com/icon.svg',
      },
    },
    mainEntityOfPage: `https://www.globalstudyboard.com/guides/${guide.slug}`,
  };

  const faqLd =
    guide.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: guide.faqs.map((f) => ({
            '@type': 'Question',
            name: f.questionEn,
            acceptedAnswer: { '@type': 'Answer', text: f.answerEn },
          })),
        }
      : null;

  const howToLdData = isHowToGuide(guide.slug, guide.sections.length)
    ? howToLd({
        name: guide.titleEn,
        description: guide.descriptionEn,
        url: `https://www.globalstudyboard.com/guides/${guide.slug}`,
        steps: guide.sections.map((s) => ({
          name: s.headingEn,
          text: paragraphs(s.bodyEn).join(' '),
        })),
      })
    : null;

  return (
    <article className="max-w-3xl mx-auto space-y-10">
      <PageRegion slug={guide.region} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {howToLdData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLdData) }}
        />
      )}

      <header>
        <Link
          href="/guides"
          className="text-sm text-stone-500 hover:text-forest-700 no-underline inline-flex items-center gap-1 mb-4"
        >
          ← All guides
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {GUIDE_CATEGORY_LABELS[guide.category]}
          </span>
          {region && (
            <>
              <span className="text-stone-300">·</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                <span aria-hidden="true" className="mr-1">{region.flag}</span>
                {region.displayName}
              </span>
            </>
          )}
          <span className="text-stone-300">·</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <Clock className="w-3.5 h-3.5" /> {guide.readMinutes} min read
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial leading-[1.08] text-ink mb-3">
          {guide.titleEn}
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
          {guide.descriptionEn}
        </p>
        <LastUpdated date={guide.lastVerified} className="mt-4" />
      </header>

      {/* Key facts (exam/process guides) */}
      {guide.keyFacts && guide.keyFacts.length > 0 && <KeyFacts rows={guide.keyFacts} />}

      {/* Sections */}
      <div className="space-y-8">
        {guide.sections.map((section, i) => (
          <section key={i}>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-3">
              {section.headingEn}
            </h2>
            {paragraphs(section.bodyEn).map((p, j) => (
              <p key={j} className="text-stone-800 text-base leading-relaxed mb-3">
                {p}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-1.5 text-stone-800 text-base leading-relaxed">
                {section.bullets.map((b, k) => (
                  <li key={k}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* FAQs */}
      {guide.faqs.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-5">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {guide.faqs.map((f, i) => (
              <div key={i} className="bg-cream-50 border border-stone-200 rounded-2xl p-5">
                <h3 className="font-semibold text-ink text-base mb-2 m-0">{f.questionEn}</h3>
                <p className="text-stone-700 text-base leading-relaxed m-0">{f.answerEn}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sources + verify nudge */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-2">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 m-0">
          Official sources
        </p>
        <p className="text-stone-700 text-sm leading-relaxed m-0">
          This guide explains the process and is for guidance only. Eligibility, dates, fees and
          rules change every year — always confirm the current details on the official site before
          you act.
        </p>
        {guide.sources.length > 0 && (
          <p className="text-stone-600 text-sm leading-relaxed m-0">
            Verified against:{' '}
            {guide.sources.map((s, i) => (
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
        <p className="text-stone-500 text-xs leading-relaxed m-0">
          Last verified: {formatReviewed(guide.lastVerified).display}.
        </p>
      </section>

      {/* Like / Share / Print */}
      <ContentActions title={guide.titleEn} />

      {/* Related / Next steps */}
      {(relatedGuides.length > 0 ||
        relatedExams.length > 0 ||
        relatedColleges.length > 0 ||
        topics.length > 0 ||
        region) && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-4">
            Related / Next steps
          </h2>

          {relatedGuides.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {relatedGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="bg-white border border-stone-200 rounded-xl p-4 no-underline hover:border-forest-300 transition-colors group"
                >
                  <p className="font-medium text-stone-800 text-sm group-hover:text-forest-700 m-0">
                    {g.titleEn}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {(relatedExams.length > 0 || relatedColleges.length > 0) && (
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
              {relatedColleges.map((c) => (
                <Link
                  key={c.slug}
                  href={`/colleges/${c.slug}`}
                  className="text-sm font-medium bg-cream-100 text-stone-800 border border-stone-200 px-3 py-1.5 rounded-full no-underline hover:border-forest-300 transition-colors"
                >
                  {c.nameEn}
                </Link>
              ))}
            </div>
          )}

          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {topics.map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="text-sm font-medium bg-forest-50 text-forest-800 border border-forest-200 px-3 py-1.5 rounded-full no-underline hover:bg-forest-100 transition-colors"
                >
                  {t.label}
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
          Still have questions?
        </h2>
        <p className="text-cream-50/85 mb-5">Ask GSB AI for guidance tailored to your situation.</p>
        <Link
          href={`/gsb-ai?q=${encodeURIComponent(guide.titleEn)}`}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>

      <RegionExplore region={guide.region} />

      {/* Quick links — popular topics & guides */}
      <PageQuickLinks currentPath={`/guides/${guide.slug}`} />
    </article>
  );
}
