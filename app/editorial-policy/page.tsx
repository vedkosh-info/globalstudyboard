import type { Metadata } from 'next';
import { IMAGE_COPY } from '@/lib/image-policy';
import Link from 'next/link';
import { ShieldCheck, Search, RefreshCw, Link2, Sparkles, MailWarning } from 'lucide-react';

import { pageMetadata } from '@/lib/seo';
import { ADMISSIONS_CYCLE, CONTACT_EMAIL, SITE_REVIEWED } from '@/lib/site-meta';
import LastUpdated from '@/components/LastUpdated';

export const metadata: Metadata = pageMetadata({
  title: 'Editorial Policy — How We Research, Verify and Correct',
  description:
    'How GlobalStudyBoard content is researched from official sources, checked in a separate verification pass, dated, kept free of invented figures, and corrected when readers report a problem.',
  path: '/editorial-policy',
});

/**
 * The editorial policy describes ONLY what the site actually does — the same
 * process recorded, unit by unit, in the project's content audit log. It names
 * no individual editors (none would be truthful to invent) and makes no claim
 * the process cannot back. Linked as `publishingPrinciples` from the site's
 * Organization structured data and from the byline on every guide.
 */
/** Groups sentences into short paragraphs (about 240 characters at most). */
function toParagraphs(text: string | string[]): string[] {
  if (Array.isArray(text)) return text;
  const out: string[] = [];
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const last = out[out.length - 1];
    if (last && last.length + sentence.length < 200) out[out.length - 1] = `${last} ${sentence}`;
    else out.push(sentence);
  }
  return out;
}

const STEPS: { icon: React.ReactNode; title: string; body: string | string[] }[] = [
  {
    icon: <Search className="h-5 w-5" />,
    title: '1. Official sources only',
    body: [
      'Every hard fact is taken from the body that owns it: the university, the examination board, or the government department. This covers fees, deadlines, exam patterns, eligibility rules and visa requirements.',
      'Rankings are quoted only with the name of the organisation that published them. Forums, agents’ sites and social media are never used as sources.',
    ],
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: '2. A separate verification pass',
    body: [
      'No page is published on the strength of the pass that wrote it. Each unit goes through an independent second review.',
      'That review re-checks its hard facts against the official source: fees, deadlines, eligibility, exam patterns, visa rules, rankings and official links.',
      'It also applies our content rules to the guides and answers: no invented numbers, no guarantees, no legal, financial, medical or immigration advice, no political or religious content.',
      'Anything that fails is fixed and re-checked before it ships.',
    ],
  },
  {
    icon: <Link2 className="h-5 w-5" />,
    title: '3. Sources you can click, and that still work',
    body: [
      'The official sources behind a page are listed on it.',
      'We run an automated link check across the whole site, so a source that has moved or been retired is replaced with the current official page. The complete index is on our Sources page.',
    ],
  },
  {
    icon: <RefreshCw className="h-5 w-5" />,
    title: '4. Dated, never back-dated',
    body: [
      'Every guide shows the date it was last verified. Listing and reference pages show when the catalogue was last broadly reviewed.',
      `Those dates are only moved when a review actually happened. Content currently targets the ${ADMISSIONS_CYCLE} admissions cycle.`,
    ],
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: IMAGE_COPY.editorialTitle,
    body: IMAGE_COPY.editorialSummary,
  },
  {
    icon: <MailWarning className="h-5 w-5" />,
    title: '6. Corrections',
    body: [
      `If you find a detail that no longer matches the official source, tell us at ${CONTACT_EMAIL}.`,
      'Reported errors are re-checked against the primary source and corrected or removed. Material corrections are recorded in our audit log.',
    ],
  },
];

export default function EditorialPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <header>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Editorial policy
        </p>
        <h1 className="mb-5 font-display text-4xl font-bold leading-[1.08] tracking-editorial text-ink md:text-5xl">
          How we research, verify and correct
        </h1>
        <p className="editorial-lede text-lg leading-relaxed text-stone-800">
          GlobalStudyBoard is written and maintained by an independent editorial team. We are not
          affiliated with any government, university, examination board or admissions agent, and we
          do not sell admissions.
        </p>
        <p className="editorial-lede mt-3 text-lg leading-relaxed text-stone-800">
          This page sets out the process every page on the site goes through before, and after, it
          is published.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      <section aria-label="Editorial process">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="mb-3 text-forest-700">{s.icon}</div>
              <h2 className="mb-2 text-base font-semibold text-ink">{s.title}</h2>
              <div className="space-y-2 text-sm leading-relaxed text-stone-700">
                {toParagraphs(s.body).map((para) => (
                  <p key={para} className="m-0">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-cream-50 p-6">
        <h2 className="mb-2 font-display text-xl font-bold tracking-editorial text-ink">
          What this does not make us
        </h2>
        <p className="m-0 leading-relaxed text-stone-700">
          We are an educational guide. Nothing on the site is legal, financial, medical or
          immigration advice.
        </p>
        <p className="mb-0 mt-3 leading-relaxed text-stone-700">
          Fees, deadlines, rankings and eligibility change every academic year. Always confirm the
          current details on the official university or examination website before you act on them.
          See our{' '}
          <Link href="/disclaimer" className="text-forest-700 underline underline-offset-2">
            disclaimer
          </Link>
          , the{' '}
          <Link href="/sources" className="text-forest-700 underline underline-offset-2">
            official sources we cite
          </Link>{' '}
          and{' '}
          <Link href="/about" className="text-forest-700 underline underline-offset-2">
            about us
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
