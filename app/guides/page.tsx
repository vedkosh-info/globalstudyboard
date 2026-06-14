import type { Metadata } from 'next';

import { GUIDES, GUIDE_CATEGORY_LABELS, type GuideCategory } from '@/lib/guides';
import { resolveDisplayRegions } from '@/lib/regions';
import GuidesView, { type GuideCard } from '@/components/GuidesView';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'Study Guides — Exams, Admissions, Careers & Study Abroad',
  description:
    'Clear, official-source guides to entrance exams, admissions, counselling, careers and studying abroad — from JEE and NEET to applying overseas. Free, evergreen, and verified.',
  keywords: [
    'study guides',
    'jee main guide',
    'josaa counselling',
    'how to apply for jee main',
    'career options after 12th',
    'study abroad from india',
    'admission guides',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/guides' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/guides',
    title: 'Study Guides — Exams, Admissions, Careers & Study Abroad',
    description:
      'Clear, official-source guides to entrance exams, admissions, counselling, careers and studying abroad.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Guides — GlobalStudyBoard',
    description:
      'Evergreen, verified guides to exams, admissions, careers and studying abroad.',
    images: ['/opengraph-image'],
  },
};

const CATEGORY_ORDER: GuideCategory[] = [
  'exam-prep',
  'admissions',
  'comparison',
  'career',
  'study-abroad',
  'scholarships',
];

export default function GuidesIndexPage() {
  const itemListJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://www.globalstudyboard.com/guides',
    name: 'Study Guides — GlobalStudyBoard',
    description: 'Guides to entrance exams, admissions, careers and studying abroad.',
    numberOfItems: GUIDES.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: GUIDES.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.titleEn,
      url: `https://www.globalstudyboard.com/guides/${g.slug}`,
    })),
  });
  const items: GuideCard[] = GUIDES.map((g) => ({
    slug: g.slug,
    titleEn: g.titleEn,
    descriptionEn: g.descriptionEn,
    readMinutes: g.readMinutes,
    category: g.category,
    region: g.region,
    regions: resolveDisplayRegions(g.region, g.regions),
  }));

  // Order known categories first, then append any category present in the data
  // but missing from CATEGORY_ORDER — so a new category can never silently drop
  // its guides from the page.
  const present = Array.from(new Set(GUIDES.map((g) => g.category)));
  const orderedKeys = [
    ...CATEGORY_ORDER.filter((c) => present.includes(c)),
    ...present.filter((c) => !CATEGORY_ORDER.includes(c)),
  ];
  const categories = orderedKeys.map((key) => ({ key, label: GUIDE_CATEGORY_LABELS[key] }));

  return (
    <div className="space-y-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListJsonLd }} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Study guides
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Guides that answer what students actually ask.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          Step-by-step explainers on entrance exams, admissions, counselling, careers and
          studying abroad — written in plain language and checked against official sources. Every
          time-sensitive fact links to the official site, because rules change each year.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      <GuidesView items={items} categories={categories} />
    </div>
  );
}
