import type { Metadata } from 'next';

import { TOPICS } from '@/lib/topics';
import { guidesForTopic } from '@/lib/topic-guides';
import { itemListLd } from '@/lib/structured-data';
import TopicsIndex, { type TopicCard } from '@/components/TopicsIndex';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'Topics — Explore Exams, Courses & Careers by Theme',
  description:
    'Browse GlobalStudyBoard by topic — JEE, NEET, MBA, government exams, US admissions, study abroad, scholarships and more. Curated hubs linking every related guide and exam.',
  keywords: [
    'study topics',
    'jee neet guides',
    'government exams india',
    'courses after 12th',
    'mba cat guides',
    'us college admissions',
    'study abroad from india',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/topics' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/topics',
    title: 'Topics — Explore Exams, Courses & Careers by Theme',
    description:
      'Curated hubs that gather every guide and exam on a theme — JEE, NEET, MBA, government exams, US admissions, study abroad and more.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Topics — GlobalStudyBoard',
    description: 'Curated hubs linking every guide and exam on a theme.',
    images: ['/opengraph-image'],
  },
};

export default function TopicsIndexPage() {
  // Serializable cards for the client renderer (guide counts computed once here).
  const cards: TopicCard[] = TOPICS.map((t) => ({
    slug: t.slug,
    label: t.label,
    title: t.title,
    description: t.description,
    group: t.group,
    region: t.region ?? null,
    count: guidesForTopic(t.slug).length,
  }));

  const itemListJson = JSON.stringify(
    itemListLd({
      name: 'Study topics',
      items: TOPICS.map((t) => ({
        name: t.title,
        url: `https://www.globalstudyboard.com/topics/${t.slug}`,
      })),
    }),
  );

  return (
    <div className="space-y-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListJson }} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Topics
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Explore by topic.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          Curated hubs that gather every guide and exam on a theme — from JEE, NEET and MBA to
          government exams, careers, US admissions and studying abroad — so you can go deep on
          exactly what you need.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      <TopicsIndex topics={cards} />
    </div>
  );
}
