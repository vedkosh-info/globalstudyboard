import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';

import { GUIDES, getGuideBySlug, GUIDE_CATEGORY_LABELS } from '@/lib/guides';
import { getExamBySlug } from '@/lib/admission-guides';
import { getCollegeBySlug } from '@/lib/colleges';
import { REGIONS } from '@/lib/regions';
import { topicsForGuide, guidesForTopic } from '@/lib/topic-guides';
import { trackForTopic, trackHref } from '@/lib/tracks';
import { pageHasParts } from '@/lib/structured-data';
import { sectionAnchors, faqAnchor, RESERVED_GUIDE_ANCHORS } from '@/lib/section-anchors';
import KeyFacts from '@/components/KeyFacts';
import ContentImage from '@/components/ContentImage';
import { guideImage } from '@/lib/images';
import OnThisPage, { type TocItem } from '@/components/OnThisPage';
import ContentActions from '@/components/ContentActions';
import PageQuickLinks from '@/components/PageQuickLinks';
import RegionExplore from '@/components/RegionExplore';
import PageRegion from '@/components/PageRegion';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import SaveButton from '@/components/SaveButton';
import AudienceGate from '@/components/AudienceGate';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { defaultAudienceFor, isAudienceVisible } from '@/lib/audience';
import { breadcrumbsFor } from '@/lib/cmi';
import { formatReviewed } from '@/lib/site-meta';
import { pageMetadata, ogImageFor, absoluteImageUrl, EDITORIAL_TEAM_LD, PUBLISHER_LD } from '@/lib/seo';
import { gsbAiHref } from '@/lib/gsb-ai-links';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: 'Guide not found', robots: { index: false, follow: false } };
  return pageMetadata({
    title: guide.titleEn,
    description: guide.descriptionEn,
    path: `/guides/${guide.slug}`,
    type: 'article',
    image: ogImageFor(guide.region),
    keywords: guide.keywords,
    // The only date a guide carries is its verification date. It is emitted as
    // the modification date ONLY — publishing it as `published_time` too would
    // move the "published" date forward on every re-verification.
    modifiedTime: guide.lastVerified,
  });
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

  // Same-hub neighbours: previous/next in the primary hub's order plus a few
  // siblings, so every guide has inbound links from its peers (286 guides had
  // none from any other guide) and readers can move through a hub in sequence.
  const primaryHub = topics[0];
  const hubGuides = primaryHub ? guidesForTopic(primaryHub.slug) : [];
  const hubIndex = hubGuides.findIndex((g) => g.slug === guide.slug);
  const prevInHub = hubIndex > 0 ? hubGuides[hubIndex - 1] : null;
  const nextInHub = hubIndex >= 0 && hubIndex < hubGuides.length - 1 ? hubGuides[hubIndex + 1] : null;
  const hubSiblings = hubGuides
    .filter((g) => g.slug !== guide.slug && g.slug !== prevInHub?.slug && g.slug !== nextInHub?.slug)
    .slice(0, 6);
  const hubTrack = primaryHub ? trackForTopic(primaryHub.slug) : undefined;

  const pageUrl = `https://www.globalstudyboard.com/guides/${guide.slug}`;

  // Stable, unique #anchors for every section (index-aligned to guide.sections).
  // Reserved set matches the CMI so search deep-links equal the DOM ids (parity).
  const anchors = sectionAnchors(guide.sections, RESERVED_GUIDE_ANCHORS);

  // The audience baked into the static HTML (India = domestic, else international).
  // Structured data matches this default view so it never advertises content a
  // default visitor cannot see.
  const pageDefault = defaultAudienceFor(guide.region);

  // Sections visible in the default view, paired with their anchor — drives the
  // HowTo steps and `hasPart` so the schema matches what a default visitor reads.
  const visibleSections = guide.sections
    .map((s, i) => ({ section: s, anchor: anchors[i] }))
    .filter(({ section }) => isAudienceVisible(section.audience, pageDefault));

  // "On this page" entries — every section (audience-tagged so the ToC toggles in
  // sync) plus an FAQ jump when present.
  // Render order: sections hidden in the DEFAULT view (e.g. an India guide's
  // "Foreign nationals & NRI applicants" block) go LAST, so the definitional
  // answer a default reader — and a crawler — came for is not preceded by ~120
  // words of hidden boilerplate. Stable sort: everything else keeps data order,
  // and each section keeps its original anchor (ids, hasPart and deep links are
  // unchanged). The ToC is built from the same ordered list so it matches the DOM.
  const orderedSections = guide.sections
    .map((section, i) => ({ section, anchor: anchors[i], index: i }))
    .sort((a, b) => {
      const ha = isAudienceVisible(a.section.audience, pageDefault) ? 0 : 1;
      const hb = isAudienceVisible(b.section.audience, pageDefault) ? 0 : 1;
      return ha - hb || a.index - b.index;
    });

  const tocItems: TocItem[] = [
    ...orderedSections.map(({ section, anchor }) => ({
      label: section.headingEn,
      anchor,
      audience: section.audience,
    })),
    ...(guide.faqs.length > 0 ? [{ label: 'FAQs', anchor: 'faqs' }] : []),
  ];

  const ogImage = ogImageFor(guide.region);
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: guide.titleEn,
    description: guide.descriptionEn,
    inLanguage: 'en',
    url: pageUrl,
    // `lastVerified` is a re-verification date, not a first-publication date, so
    // it is emitted as dateModified only (Google accepts dateModified alone; a
    // fabricated datePublished that moves forward on every review is worse than
    // none).
    dateModified: guide.lastVerified,
    image: [absoluteImageUrl(ogImage)],
    author: EDITORIAL_TEAM_LD,
    publisher: PUBLISHER_LD,
    mainEntityOfPage: pageUrl,
    // Deep-linkable sections so search engines understand the page's parts.
    ...(visibleSections.length > 0
      ? {
          hasPart: pageHasParts(
            pageUrl,
            visibleSections.map(({ section, anchor }) => ({
              name: section.headingEn,
              url: `${pageUrl}#${anchor}`,
            })),
          ),
        }
      : {}),
  };

  const visibleFaqs = guide.faqs.filter((f) => isAudienceVisible(f.audience, pageDefault));
  const faqLd =
    visibleFaqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: visibleFaqs.map((f) => ({
            '@type': 'Question',
            '@id': `${pageUrl}#${faqAnchor(f.questionEn)}`,
            name: f.questionEn,
            acceptedAnswer: { '@type': 'Answer', text: f.answerEn },
          })),
        }
      : null;

  // HowTo markup is deliberately NOT emitted: Google removed the How-to rich
  // result in September 2023, and the block duplicated every section's prose in
  // the HTML (~3 KB per page × 343 guides) for nothing. Section deep-links stay
  // available through Article.hasPart above.

  return (
    <article className="max-w-3xl mx-auto space-y-10">
      <BreadcrumbsView crumbs={breadcrumbsFor(`/guides/${guide.slug}`)} />
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

      <header>
        <Link
          href="/guides"
          prefetch={false}
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
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                <RegionFlag slug={region.slug} className="h-3.5" />
                {region.displayName}
              </span>
            </>
          )}
          <span className="text-stone-300">·</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            <Clock className="w-3.5 h-3.5" /> {guide.readMinutes} min read
          </span>
          {guide.audience === 'international' && (
            <>
              <span className="text-stone-300">·</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-700">
                For international students
              </span>
            </>
          )}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial leading-[1.08] text-ink mb-3">
          {guide.titleEn}
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
          {guide.descriptionEn}
        </p>
        {/* Visible editorial responsibility — who stands behind the page and how
            it was checked. No named persons are invented; the team and process are
            described on /editorial-policy. */}
        <p className="mt-4 text-sm text-stone-600">
          By the{' '}
          <Link href="/editorial-policy" className="text-forest-700 underline underline-offset-2">
            GlobalStudyBoard editorial team
          </Link>
          {guide.sources.length > 0 && (
            <>
              {' '}
              · Verified against {guide.sources.length} cited source
              {guide.sources.length === 1 ? '' : 's'}
            </>
          )}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <LastUpdated date={guide.lastVerified} />
          {/* Shortlist — renders nothing until accounts are configured. */}
          <SaveButton kind="guide" slug={guide.slug} title={guide.titleEn} region={guide.region} />
        </div>
      </header>

      {/* Hero image — resolves to null (renders nothing) until the image library exists.
          This is the page's LCP candidate, so it is the ONE image that gets priority. */}
      <ContentImage
        asset={guideImage({ slug: guide.slug, category: guide.category, region: guide.region })}
        variant="hero"
        priority
      />

      {/* Key facts (exam/process guides) */}
      {guide.keyFacts && guide.keyFacts.length > 0 && <KeyFacts rows={guide.keyFacts} />}

      {/* On this page — jump links to each deep-linkable section */}
      <OnThisPage items={tocItems} pageDefault={pageDefault} />

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {orderedSections.map(({ section, anchor, index }) => (
          <AudienceGate key={index} audience={section.audience} pageDefault={pageDefault}>
            <section id={anchor} className="scroll-mt-24">
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
          </AudienceGate>
        ))}
      </div>

      {/* FAQs */}
      {guide.faqs.length > 0 && (
        <section id="faqs" className="scroll-mt-24">
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-5">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-4">
            {guide.faqs.map((f, i) => (
              <AudienceGate key={i} audience={f.audience} pageDefault={pageDefault}>
                <div
                  id={faqAnchor(f.questionEn)}
                  className="bg-cream-50 border border-stone-200 rounded-2xl p-5 scroll-mt-24"
                >
                  <h3 className="font-semibold text-ink text-base mb-2 m-0">{f.questionEn}</h3>
                  <p className="text-stone-700 text-base leading-relaxed m-0">{f.answerEn}</p>
                </div>
              </AudienceGate>
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

      {/* More in this hub — previous / next + siblings */}
      {primaryHub && hubGuides.length > 1 && (
        <section aria-labelledby="more-in-hub-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <h2
              id="more-in-hub-heading"
              className="m-0 font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink"
            >
              More in {primaryHub.label}
            </h2>
            <span className="text-sm text-stone-500">
              <Link href={`/topics/${primaryHub.slug}`} className="text-forest-700 underline underline-offset-2">
                All {hubGuides.length} guides
              </Link>
              {hubTrack && (
                <>
                  {' '}
                  ·{' '}
                  <Link href={trackHref(hubTrack)} className="text-forest-700 underline underline-offset-2">
                    {hubTrack.label} track
                  </Link>
                </>
              )}
            </span>
          </div>

          {(prevInHub || nextInHub) && (
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prevInHub && (
                <Link
                  href={`/guides/${prevInHub.slug}`}
                  rel="prev"
                  className="bg-white border border-stone-200 rounded-xl p-4 no-underline hover:border-forest-300 transition-colors group"
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
                    ← Previous
                  </span>
                  <span className="font-medium text-stone-800 text-sm group-hover:text-forest-700">
                    {prevInHub.titleEn}
                  </span>
                </Link>
              )}
              {nextInHub && (
                <Link
                  href={`/guides/${nextInHub.slug}`}
                  rel="next"
                  className="bg-white border border-stone-200 rounded-xl p-4 no-underline hover:border-forest-300 transition-colors group sm:text-right"
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
                    Next →
                  </span>
                  <span className="font-medium text-stone-800 text-sm group-hover:text-forest-700">
                    {nextInHub.titleEn}
                  </span>
                </Link>
              )}
            </div>
          )}

          {hubSiblings.length > 0 && (
            <ul className="m-0 list-none p-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {hubSiblings.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="text-sm text-stone-700 no-underline hover:text-forest-700"
                  >
                    {g.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* CTA */}
      <section className="on-dark bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Still have questions?
        </h2>
        <p className="text-cream-50/85 mb-5">Ask GSB AI for guidance tailored to your situation.</p>
        <Link
          href={gsbAiHref({ q: guide.titleEn })}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>

      <RegionExplore region={guide.region} />

      {/* Quick links — popular topics & guides */}
      <PageQuickLinks
        currentPath={`/guides/${guide.slug}`}
        region={guide.region}
        hubSlugs={topics.map((t) => t.slug)}
      />
    </article>
  );
}
