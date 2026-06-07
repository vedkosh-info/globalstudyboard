import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TOPICS, getTopicBySlug, guidesForTopic } from '@/lib/topics';
import { GUIDE_CATEGORY_LABELS, type GuideCategory } from '@/lib/guides';
import { resolveDisplayRegions } from '@/lib/regions';
import { getExamBySlug } from '@/lib/admission-guides';
import { itemListLd } from '@/lib/structured-data';
import GuidesView, { type GuideCard } from '@/components/GuidesView';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: 'Topic not found' };
  const desc = topic.description.slice(0, 155);
  const url = `https://www.globalstudyboard.com/topics/${topic.slug}`;
  return {
    title: topic.title,
    description: desc,
    keywords: topic.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: topic.title,
      description: desc,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: topic.title,
      description: desc,
      images: ['/opengraph-image'],
    },
  };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListJson }} />

      <header className="max-w-3xl">
        <Link
          href="/topics"
          className="text-sm text-stone-500 hover:text-forest-700 no-underline inline-flex items-center gap-1 mb-4"
        >
          ← All topics
        </Link>
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
      </header>

      {relatedExams.length > 0 && (
        <section>
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
            Related exams
          </p>
          <div className="flex flex-wrap gap-2">
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
        </section>
      )}

      <GuidesView items={items} categories={categories} />

      {/* CTA */}
      <section className="bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Not sure where to start?
        </h2>
        <p className="text-cream-50/85 mb-5">Ask GSB AI for guidance tailored to your situation.</p>
        <Link
          href={`/gsb-ai?q=${encodeURIComponent(topic.title)}`}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>
    </div>
  );
}
