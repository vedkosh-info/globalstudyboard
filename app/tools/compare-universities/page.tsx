import type { Metadata } from 'next';
import Link from 'next/link';
import { Columns3, ListChecks, Scale, ShieldCheck } from 'lucide-react';
import { getToolBySlug } from '@/lib/tools';
import { PUBLISHER_LD, SITE_URL, pageMetadata } from '@/lib/seo';
import { SITE_REVIEWED } from '@/lib/site-meta';
import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import { COLLEGES } from '@/lib/colleges';
import { COMPARE_LIMITS, DEFAULT_CRITERIA } from '@/lib/compare';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import LastUpdated from '@/components/LastUpdated';
import RegionFlag from '@/components/RegionFlag';
import CompareGate from '@/app/tools/compare-universities/CompareGate';

/**
 * /tools/compare-universities — a static, indexable shell around the third
 * account-only tool. The page describes the tool for crawlers and signed-out
 * visitors and lists, per destination, how many verified profiles can be
 * compared and which facts the table carries. The tool itself renders in the
 * browser for a signed-in visitor only (constitution §18): no server cookie
 * reads, no SDK in this chunk; the fact sheets arrive through ./catalogue.
 *
 * Rule A / Rule E: this page names the fact columns and the student's own
 * criteria; it never ranks, scores or recommends a university.
 */
const tool = getToolBySlug('compare-universities')!;
const PATH = '/tools/compare-universities';

export const metadata: Metadata = pageMetadata({
  title: 'Compare Universities Side by Side — Verified Facts and Your Own Scores',
  description: tool.tagline + ' Free, for all nine study destinations.',
  descriptionMax: 160,
  path: PATH,
  keywords: [
    'compare universities',
    'university comparison tool',
    'compare colleges side by side',
    'how to choose between universities',
    'university decision matrix',
    'shortlist universities',
  ],
});

const FEATURES = [
  { icon: Columns3, title: `Up to ${COMPARE_LIMITS.entriesPerSet} side by side`, text: 'Pick from our verified profiles for your destination, or add a university of your own. Rankings named to the body that published them, location, tests accepted, application platform, levels, language, courses, official site.' },
  { icon: ListChecks, title: 'Your criteria, your weights', text: `Six starting criteria — programme fit, cost and funding, location, reputation as you see it, scholarships, career outcomes — rename them, reweight them, or add your own (up to ${COMPARE_LIMITS.criteriaPerSet}).` },
  { icon: Scale, title: 'Your score, with the arithmetic shown', text: 'Rate each university 1–5 on each criterion. The tool multiplies by your weights, prints the sum under every result, and names your own top pick. It never adds a view of its own.' },
  { icon: ShieldCheck, title: 'Private, portable, yours', text: 'Comparisons are private to your account, follow you to every device, download as a CSV, sit in your data download and are deleted with the account.' },
];

const STEPS = [
  'Choose your destination in the header, start a comparison and add up to four universities — from our profiles or your own.',
  'Read our verified facts side by side, each ranking attributed to its body and linked, with each profile’s official site.',
  'Give each university a score of 1 to 5 on every criterion that matters to you, set the weights, and read your own result.',
];

export default function CompareUniversitiesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: `${SITE_URL}${PATH}`,
    description: tool.tagline,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: PUBLISHER_LD,
  };
  const counts = new Map(REGIONS_ALPHABETICAL.map((r) => [r.slug, COLLEGES.filter((c) => c.region === r.slug).length]));

  return (
    <div className="mx-auto max-w-6xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbsView crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: tool.name }]} />

      <header className="max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">Tool · Free with an account</p>
        <h1 className="font-display text-4xl font-bold tracking-editorial text-ink sm:text-5xl">{tool.name}</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">{tool.description}</p>
      </header>

      <section aria-labelledby="tool-features-heading" className="mt-8">
        <h2 id="tool-features-heading" className="sr-only">
          What it does
        </h2>
        <ul className="grid list-none gap-3 p-0 m-0 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-stone-200 bg-white p-4">
              <Icon className="h-5 w-5 text-forest-700" aria-hidden="true" />
              <h3 className="mt-2.5 text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-stone-700">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-label="Your university comparisons">
        <CompareGate />
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]" aria-labelledby="compare-how">
        <div>
          <h2 id="compare-how" className="font-display text-2xl font-bold tracking-editorial text-ink">How it works</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-stone-700">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-cream-50 p-5">
          <h2 className="font-display text-xl font-bold tracking-editorial text-ink">Good to know</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
            <li>
              The facts come from each university&rsquo;s official website and are worded exactly as on our profiles; each
              ranking is attributed to the body that published it. Rankings, fees and eligibility change every year, so confirm
              on the official site before applying.
            </li>
            <li>
              <strong>Your score is arithmetic on your own ratings and weights</strong> — it is not our assessment of any
              university and not a prediction of admission. We never rank, score or recommend a university ourselves.
            </li>
            <li>
              Comparisons are private to your account, in your data download, and deleted with the account. Please do not
              record personal details in notes. Accounts are for people aged 18 or over — see the{' '}
              <Link href="/privacy" className="text-forest-700 underline hover:text-forest-800">
                Privacy Policy
              </Link>
              .
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="compare-by-destination">
        <h2 id="compare-by-destination" className="font-display text-2xl font-bold tracking-editorial text-ink">
          What you can compare, by destination
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-700">
          Every profile carries the same fact sheet: rankings as published by their bodies, location, type, admission tests
          accepted, application platform, programme levels, language of instruction, year established, course areas and the
          official site. Universities we do not profile can still be added by name for your own scoring.
        </p>
        <ul className="mt-5 grid list-none gap-3 p-0 m-0 sm:grid-cols-3">
          {REGIONS_ALPHABETICAL.map((r) => (
            <li key={r.slug} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <RegionFlag slug={r.slug} className="h-4" />
              <span className="min-w-0">
                <Link href={`/regions/${r.slug}/universities`} className="block font-semibold text-ink no-underline hover:underline">
                  {r.displayName}
                </Link>
                <span className="block text-xs text-stone-600">
                  {counts.get(r.slug)} verified profile{counts.get(r.slug) === 1 ? '' : 's'}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-stone-700">
          {/* Exactly as each criterion is named in the tool (lib/compare.ts) — lower-casing them printed "reputation, as i see it". */}
          Starting criteria, all yours to change: {DEFAULT_CRITERIA.map((c) => c.label).join(' · ')}.
        </p>
      </section>

      <LastUpdated date={SITE_REVIEWED} className="mt-8" />
    </div>
  );
}
