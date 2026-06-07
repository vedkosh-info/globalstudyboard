import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import {
  TOPICS,
  TOPIC_GROUP_LABELS,
  getTopicsByGroup,
  guidesForTopic,
  type TopicGroup,
} from '@/lib/topics';
import { itemListLd } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Topics — Explore Exams, Courses & Careers by Theme',
  description:
    'Browse GlobalStudyBoard by topic — JEE, NEET, MBA, government exams, study abroad, scholarships and more. Curated hubs linking every related guide and exam.',
  keywords: [
    'study topics',
    'jee neet guides',
    'government exams india',
    'courses after 12th',
    'mba cat guides',
    'study abroad from india',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/topics' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/topics',
    title: 'Topics — Explore Exams, Courses & Careers by Theme',
    description:
      'Curated hubs that gather every guide and exam on a theme — JEE, NEET, MBA, government exams, study abroad and more.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Topics — GlobalStudyBoard',
    description: 'Curated hubs linking every guide and exam on a theme.',
    images: ['/opengraph-image'],
  },
};

const GROUP_ORDER: TopicGroup[] = ['exams', 'fields', 'after-12th', 'study-abroad', 'prep-funding'];

export default function TopicsIndexPage() {
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
          government exams, careers and studying abroad — so you can go deep on exactly what you
          need.
        </p>
      </header>

      {GROUP_ORDER.map((group) => {
        const topics = getTopicsByGroup(group);
        if (topics.length === 0) return null;
        return (
          <section key={group}>
            <div className="section-rule mb-5">
              <span>{TOPIC_GROUP_LABELS[group]}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((t) => {
                const count = guidesForTopic(t.slug).length;
                return (
                  <Link
                    key={t.slug}
                    href={`/topics/${t.slug}`}
                    className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
                  >
                    <h2 className="font-display text-lg font-bold tracking-editorial text-ink leading-snug mb-2 group-hover:text-forest-700">
                      {t.title}
                    </h2>
                    <p className="text-stone-600 text-sm leading-relaxed m-0 flex-1">
                      {t.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                      {count} guide{count === 1 ? '' : 's'} <ArrowUpRight className="w-4 h-4" />
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
