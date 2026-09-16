import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TOPICS, getTopicBySlug } from '@/lib/topics';
import { guidesForTopic } from '@/lib/topic-guides';
import { GUIDE_CATEGORY_LABELS, type GuideCategory } from '@/lib/guides';
import { DEFAULT_REGION, resolveDisplayRegions } from '@/lib/regions';
import { getExamBySlug } from '@/lib/admission-guides';
import { itemListLd } from '@/lib/structured-data';
import GuidesView, { type GuideCard } from '@/components/GuidesView';
import PageRegion from '@/components/PageRegion';
import RegionExplore from '@/components/RegionExplore';
import LastUpdated from '@/components/LastUpdated';
import ContentImage from '@/components/ContentImage';
import { topicImage } from '@/lib/images';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { breadcrumbsFor } from '@/lib/cmi';
import { SITE_REVIEWED } from '@/lib/site-meta';
import { pageMetadata, ogImageFor } from '@/lib/seo';
import { trackForTopic, trackHref } from '@/lib/tracks';
import { sectionAnchors, RESERVED_GUIDE_ANCHORS } from '@/lib/section-anchors';
import { defaultAudienceFor, isAudienceVisible } from '@/lib/audience';
import { gsbAiHref } from '@/lib/gsb-ai-links';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: 'Topic not found', robots: { index: false, follow: false } };
  return pageMetadata({
    title: topic.seoTitle ?? topic.title,
    description: topic.description,
    path: `/topics/${topic.slug}`,
    image: ogImageFor(topic.region),
    keywords: topic.keywords,
  });
}

const CATEGORY_ORDER: GuideCategory[] = [
  'exam-prep',
  'admissions',
  'comparison',
  'career',
  'study-abroad',
  'scholarships',
];

function paragraphs(body: string): string[] {
  return body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

export default async function TopicHubPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const guides = guidesForTopic(topic.slug);

  const items: GuideCard[] = guides.map((g) => ({
    slug: g.slug,
    titleEn: g.titleEn,
    descriptionEn: g.descriptionEn,
    readMinutes: g.readMinutes,
    category: g.category,
    region: g.region,
    regions: resolveDisplayRegions(g.region, g.regions),
  }));

  const present = Array.from(new Set(guides.map((g) => g.category)));
  const orderedKeys = [
    ...CATEGORY_ORDER.filter((c) => present.includes(c)),
    ...present.filter((c) => !CATEGORY_ORDER.includes(c)),
  ];
  const categories = orderedKeys.map((key) => ({ key, label: GUIDE_CATEGORY_LABELS[key] }));

  const relatedExams = (topic.examSlugs ?? [])
    .map((s) => getExamBySlug(s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const track = trackForTopic(topic.slug);

  // Hub outline: each guide with its first three section headings, deep-linked.
  // 243 of 368 hubs have no authored intro, so without this the only unique text
  // on the hub was its one-sentence description — everything else was card text
  // also printed on the region listing and 1–2 other hubs. The outline is unique
  // to the hub's membership and gives a crawler (and a reader) the hub's actual
  // coverage in one screen.
  const outline = guides.map((g) => {
    // Anchors over the FULL section list (indices must match the guide page),
    // then only the sections a default visitor of that guide can actually see.
    const anchors = sectionAnchors(g.sections, RESERVED_GUIDE_ANCHORS);
    const pageDefault = defaultAudienceFor(g.region);
    return {
      slug: g.slug,
      title: g.titleEn,
      sections: g.sections
        .map((sec, i) => ({ heading: sec.headingEn, anchor: anchors[i], audience: sec.audience }))
        .filter((sec) => isAudienceVisible(sec.audience, pageDefault))
        .slice(0, 3),
    };
  });

  const itemListJson = JSON.stringify(
    itemListLd({
      name: topic.title,
      items: guides.map((g) => ({
        name: g.titleEn,
        url: `https://www.globalstudyboard.com/guides/${g.slug}`,
      })),
    }),
  );

  return (
    <div className="space-y-12">
      <BreadcrumbsView crumbs={breadcrumbsFor(`/topics/${topic.slug}`)} />
      {topic.region && <PageRegion slug={topic.region} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListJson }} />

      <header className="max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
          <Link
            href="/topics"
            prefetch={false}
            className="hover:text-forest-700 no-underline inline-flex items-center gap-1"
          >
            ← All topics
          </Link>
          {track && (
            <>
              <span className="text-stone-300">·</span>
              <Link href={trackHref(track)} prefetch={false} className="hover:text-forest-700 no-underline">
                {track.label} track
              </Link>
            </>
          )}
        </div>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          {topic.label}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          {topic.title}
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">{topic.description}</p>
        {topic.intro && (
          <div className="mt-4 space-y-3">
            {paragraphs(topic.intro).map((p, i) => (
              <p key={i} className="text-stone-700 text-base leading-relaxed m-0">
                {p}
              </p>
            ))}
          </div>
        )}
        <LastUpdated date={SITE_REVIEWED} className="mt-4" />

        {/* Hub atmosphere by region or concept — LCP for this page. */}
        <ContentImage
          asset={topicImage({ slug: topic.slug, group: topic.group, region: topic.region })}
          variant="hero"
          priority
          className="mt-8"
        />
      </header>

      {relatedExams.length > 0 && (
        <section>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
            Tests this hub covers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedExams.map((e) => (
              <Link
                key={e.slug}
                href={`/exams/${e.slug}`}
                className="group bg-white border border-stone-200 rounded-2xl p-4 no-underline hover:border-forest-300 transition-colors"
              >
                <p className="font-display text-base font-bold text-ink m-0 group-hover:text-forest-700">
                  {e.shortName}
                </p>
                <p className="text-stone-600 text-xs m-0 mt-1">
                  {e.conductingBody} · {e.frequency}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!topic.intro && outline.length > 0 && (
        <section aria-labelledby="hub-outline-heading" className="rounded-2xl border border-stone-200 bg-cream-50/60 p-6">
          <h2 id="hub-outline-heading" className="m-0 mb-4 font-display text-xl font-bold tracking-editorial text-ink">
            What this hub covers
          </h2>
          <ol className="m-0 list-none p-0 space-y-3">
            {outline.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="font-medium text-ink no-underline hover:text-forest-700">
                  {g.title}
                </Link>
                {g.sections.length > 0 && (
                  <span className="block text-sm text-stone-600">
                    {g.sections.map((sec, i) => (
                      <span key={sec.anchor}>
                        {i > 0 ? ' · ' : ''}
                        <Link href={`/guides/${g.slug}#${sec.anchor}`} className="text-stone-600 no-underline hover:text-forest-700">
                          {sec.heading}
                        </Link>
                      </span>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <GuidesView items={items} categories={categories} pageRegion={topic.region ?? DEFAULT_REGION} />

      {topic.region && <RegionExplore region={topic.region} />}

      {/* CTA */}
      <section className="on-dark bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Not sure where to start?
        </h2>
        <p className="text-cream-50/85 mb-5">Ask GSB AI for guidance tailored to your situation.</p>
        <Link
          href={gsbAiHref({ q: topic.title })}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>
    </div>
  );
}
