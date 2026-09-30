import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { resolveDisplayRegions } from '@/lib/regions';
import ExamsView, { type ExamCard } from '@/components/ExamsView';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

// The description fits pageMetadata's 155-character cut whole: the longer one it
// replaces was cut mid-list, to "…each with its format, score…" (review R4-D).
export const metadata: Metadata = pageMetadata({
  title: 'All Entrance Exams \u2014 SAT, ACT, GRE, IELTS, A-Levels & More',
  description:
    'University entrance exams worldwide \u2014 SAT, ACT, GRE, GMAT, IELTS, TOEFL, A-Levels, JEE, NEET and more, each with its format, eligibility and official link.',
  path: '/exams',
  keywords: [
    'SAT exam guide',
    'ACT vs SAT',
    'GRE preparation',
    'GMAT score',
    'IELTS TOEFL comparison',
    'A-Levels universities',
    'IB diploma',
    'TestAS Germany',
    'university entrance exams',
    'JEE NEET CAT',
    'LSAT MCAT',
    'standardised tests worldwide',
  ],
});

/**
 * A card prints a fee only when the record's WHOLE fee statement fits (a short
 * single-rate line such as "€195"). A longer one carries conditions — a surcharge
 * for testing outside the U.S., a price set by test location, add-ons, rates by
 * category — that a trimmed fragment would drop (TOEFL's card printed a
 * ~180-character sentence), so the card points to the exam page instead, where
 * the full statement sits beside its source.
 */
const CARD_FEE_MAX = 40;

/**
 * "GRE — Graduate Record Examinations"; a full name that already carries the
 * short one stands alone ("The ACT Test", "Digital SAT", "Duolingo English
 * Test"), never "ACT — The ACT Test". Same rule as the exam page's examLabel.
 */
function itemName(e: { shortName: string; fullName: string }): string {
  const words = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
  return words(e.fullName).includes(words(e.shortName)) ? e.fullName : `${e.shortName} — ${e.fullName}`;
}

export default function ExamsIndexPage() {
  const itemListJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': 'https://www.globalstudyboard.com/exams',
    name: 'University Entrance Exams — GlobalStudyBoard',
    description: 'University entrance exams worldwide — SAT, ACT, GRE, GMAT, IELTS, JEE, NEET and more.',
    numberOfItems: ENTRANCE_EXAMS.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: ENTRANCE_EXAMS.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: itemName(e),
      url: `https://www.globalstudyboard.com/exams/${e.slug}`,
    })),
  });
  const items: ExamCard[] = ENTRANCE_EXAMS.map((e) => ({
    id: e.id,
    slug: e.slug,
    shortName: e.shortName,
    fullName: e.fullName,
    domain: e.domain,
    frequency: e.frequency,
    fee: e.costUsd && e.costUsd.length <= CARD_FEE_MAX ? e.costUsd : undefined,
    feeOnPage: !!e.costUsd && e.costUsd.length > CARD_FEE_MAX,
    region: e.region,
    regions: resolveDisplayRegions(e.region, e.regions),
  }));

  return (
    <div className="space-y-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListJsonLd }} />
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Standardised tests
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Entrance exams, region by region.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          Every entrance test we cover, by destination, with how often it is held. Open any exam for its conducting body, format, score range, eligibility, the fee where we list one, and a link to the official site.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      <ExamsView items={items} unfilteredByDefault />
    </div>
  );
}
