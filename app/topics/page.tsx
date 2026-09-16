import type { Metadata } from 'next';

import { TOPICS } from '@/lib/topics';
import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import { tracksForRegion, trackForTopic, trackHref } from '@/lib/tracks';
import { guidesForTopic } from '@/lib/topic-guides';
import { itemListLd } from '@/lib/structured-data';
import { pageMetadata } from '@/lib/seo';
import TopicsIndex, { type RegionSection, type TopicCard } from '@/components/TopicsIndex';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Topics — Exams, Admissions, Courses & Careers by Destination',
  description:
    'Browse every GlobalStudyBoard hub by study destination — entrance exams, university admissions, scholarships, visas, courses and careers for the USA, UK, Canada, Europe, Australia, Asia, the Gulf, Russia and India.',
  path: '/topics',
  keywords: [
    'study topics',
    'university admissions hubs',
    'entrance exam guides',
    'study abroad topics',
    'scholarships by country',
    'student visa guides',
    'courses and careers',
  ],
});

export default function TopicsIndexPage() {
  // Serialisable cards (guide counts computed once, on the server).
  const cardBySlug = new Map<string, TopicCard>(
    TOPICS.map((t) => [
      t.slug,
      {
        slug: t.slug,
        label: t.label,
        title: t.title,
        description: t.description,
        count: guidesForTopic(t.slug).length,
      },
    ]),
  );

  // Every destination's Track spine, fully resolved here so lib/tracks + lib/topics
  // never reach the client. Each hub renders once, under its primary track.
  const sections: RegionSection[] = REGIONS_ALPHABETICAL.map((r) => ({
    region: r.slug,
    tracks: tracksForRegion(r.slug)
      .map((track) => ({
        slug: track.slug,
        label: track.label,
        href: trackHref(track),
        cards: track.topicSlugs
          .filter((slug) => trackForTopic(slug)?.slug === track.slug)
          .map((slug) => cardBySlug.get(slug))
          .filter((c): c is TopicCard => Boolean(c)),
      }))
      .filter((t) => t.cards.length > 0),
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
          Explore by topic, destination by destination.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          Curated hubs that gather every guide and exam on a theme — entrance exams, admissions,
          scholarships, visas, courses and careers — for each of the nine destinations we cover.
          Your destination opens first; every other one is a tap away.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      <TopicsIndex sections={sections} />
    </div>
  );
}
