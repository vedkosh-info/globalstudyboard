import type { Metadata } from 'next';
import Link from 'next/link';
import { Coins, ExternalLink, Landmark, Scale, ShieldCheck } from 'lucide-react';
import { getToolBySlug } from '@/lib/tools';
import { PUBLISHER_LD, SITE_URL, pageMetadata } from '@/lib/seo';
import { SITE_REVIEWED, formatReviewed } from '@/lib/site-meta';
import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import { DESTINATION_BUDGETS, FUNDS_RULE_CHECKED, fundsCoverage, joinCountries, type FundsSource } from '@/lib/cost-planner';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import LastUpdated from '@/components/LastUpdated';
import RegionFlag from '@/components/RegionFlag';
import CostPlannerGate from '@/app/tools/cost-planner/CostPlannerGate';

/**
 * /tools/cost-planner — a static, indexable shell around the second account-only
 * tool. The page describes the tool for crawlers and signed-out visitors and
 * lists, per destination, the cost lines the tool suggests, with an official
 * page on a line where we have one, and — country by country — the official
 * page that states the student-visa financial rule (or names the proof it asks
 * for), saying so where the page we read states none, and naming every country
 * we do not cover (never a homepage standing in for a rule). The
 * tool itself renders in the browser for a signed-in visitor only
 * (constitution §18): no server cookie reads, no SDK in this chunk.
 *
 * Rule A: this page names categories and sources, never an amount.
 */
const tool = getToolBySlug('cost-planner')!;
const PATH = '/tools/cost-planner';

export const metadata: Metadata = pageMetadata({
  title: 'Cost & Funding Planner — Budget Your Tuition, Living Costs and Funding',
  description: tool.tagline + ' Free, for all nine study destinations.',
  descriptionMax: 160,
  path: PATH,
  keywords: [
    'cost of studying abroad calculator',
    'study abroad budget planner',
    'international student budget calculator',
    'tuition and living cost planner',
    'how much does it cost to study abroad',
    'student funding gap calculator',
  ],
});

const FEATURES = [
  { icon: Landmark, title: 'Cost lines tuned to your destination', text: 'Tuition, living costs, health cover, visa fees, travel — the lines your destination actually has, with an official page or our guide linked where we have one.' },
  { icon: Scale, title: 'Costs against funding', text: 'Savings, family support, scholarships, loans and your own work estimate, totalled against your costs for the whole programme. You read the difference; we draw no conclusion.' },
  { icon: Coins, title: 'One currency, never converted', text: 'Each budget is kept in one currency you choose. We never apply an exchange rate — you enter every figure as the official page or your offer states it.' },
  { icon: ShieldCheck, title: 'Your numbers stay yours', text: 'Amounts are private to your account, follow you to every device, are in your data download and are deleted with the account.' },
];

const STEPS = [
  'Choose the destination in the header, then Start. Currency, intake and 1 year are already set.',
  'Type each amount you know. Leave the rest blank.',
  'Download the PDF on this page. “Still to arrange” is the first line.',
];

export default function CostPlannerPage() {
  const checked = formatReviewed(FUNDS_RULE_CHECKED);
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

      <section className="mt-8" aria-label="Your cost and funding planner">
        <CostPlannerGate />
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]" aria-labelledby="cost-how">
        <div>
          <h2 id="cost-how" className="font-display text-2xl font-bold tracking-editorial text-ink">How it works</h2>
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
              This is <strong>your own budget, built from the numbers you enter</strong>. We do not set, verify or estimate any
              of them. Where we have an official page or a guide on a line, the line links to it — and figures change every year,
              so confirm each one on the official page or in your offer letter.
            </li>
            <li>
              A budget that adds up is not the same as meeting a country&rsquo;s official financial rule for a student visa. Below,
              country by country, we link the official page that states that rule or names the proof of funds the visa asks for;
              where the official page we read states no rule, we say so, and we name the countries we do not cover. Check the
              rule separately.
            </li>
            <li>
              This is a personal planning worksheet, not financial advice. For guidance on your own circumstances, speak to a
              qualified professional.
            </li>
            <li>
              Your budgets are private to your account, in your data download, and deleted with the account. Please do not
              record bank or card details in notes. Accounts are for people aged 18 or over — see the{' '}
              <Link href="/privacy" className="text-forest-700 underline hover:text-forest-800">
                Privacy Policy
              </Link>
              .
            </li>
          </ul>
        </div>
      </section>

      {/* The per-destination lines the tool suggests. Static and indexable: every
          source below is an official page, each funds-rule page presented as
          exactly what it was found to say — states the rule or names the proof,
          only asks about your finances, or names no financial document
          (FundsSource in lib/cost-planner) — and no amount is stated anywhere
          (Rule A). */}
      <section className="mt-12" aria-labelledby="cost-by-destination">
        <h2 id="cost-by-destination" className="font-display text-2xl font-bold tracking-editorial text-ink">
          What it covers, by destination
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-700">
          The planner suggests these lines for each destination, linking an official page or our guide on a line where we have
          one. You can add any line of your own. Each official page linked under &ldquo;Student-visa financial requirement&rdquo; was
          read on <time dateTime={checked.iso}>{checked.display}</time>.
        </p>
        <div className="mt-5 space-y-3">
          {REGIONS_ALPHABETICAL.map((r) => {
            const d = DESTINATION_BUDGETS[r.slug];
            const cov = fundsCoverage(d.fundsRule, r.countries);
            return (
              <details key={r.slug} className="group rounded-2xl border border-stone-200 bg-white">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  <RegionFlag slug={r.slug} className="h-4" />
                  <span>{r.displayName}</span>
                  <span className="ml-auto text-xs font-medium text-stone-600 group-open:hidden">Show lines</span>
                  <span className="ml-auto hidden text-xs font-medium text-stone-600 group-open:inline">Hide</span>
                </summary>
                <div className="border-t border-stone-200 px-5 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600">Cost lines</h3>
                  <ul className="mt-2 grid list-none gap-x-6 gap-y-2.5 p-0 m-0 sm:grid-cols-2">
                    {d.costs.map((c) => (
                      <li key={c.key} className="text-sm leading-relaxed">
                        <span className="font-semibold text-ink">{c.label}</span>
                        <span className="text-stone-700"> — {c.hint}</span>
                        {(c.source || c.guides?.length) && (
                          <span className="block text-xs text-stone-600">
                            {c.source && (
                              <a
                                href={c.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-forest-700 underline underline-offset-2 hover:text-forest-800"
                              >
                                {c.source.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                              </a>
                            )}
                            {c.source && c.guides?.length ? ' · ' : ''}
                            {c.guides?.map((gl, i) => (
                              <span key={gl.slug}>
                                {i > 0 ? ' · ' : ''}
                                <Link href={`/guides/${gl.slug}`} className="text-forest-700 underline underline-offset-2 hover:text-forest-800">
                                  {gl.title}
                                </Link>
                              </span>
                            ))}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-600">Funding lines</h3>
                  <p className="mt-1 text-sm text-stone-700">{d.funding.map((f) => f.label).join(' · ')}</p>
                  <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-stone-600">
                    Student-visa financial requirement{r.countries.length > 1 ? ', by country' : ''}
                  </h3>
                  {cov.published.length > 0 && (
                    <ul className="mt-1.5 list-none space-y-1 p-0 m-0 text-sm">
                      {cov.published.map(({ country, sources }) => (
                        <li key={country}>
                          {r.countries.length > 1 && <span className="font-semibold text-ink">{country}: </span>}
                          <FundsLinks sources={sources} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {cov.asked.map(({ country, sources }) => (
                    <p key={country} className="mt-1.5 text-sm text-stone-700">
                      {r.countries.length > 1 ? `${country}: the` : 'The'} official application asks about your financial support, but
                      the page states no requirement — <FundsLinks sources={sources} />. Confirm with your university or the immigration
                      authority.
                    </p>
                  ))}
                  {cov.noneListed.map(({ country, sources }) => (
                    <p key={country} className="mt-1.5 text-sm text-stone-700">
                      {r.countries.length > 1 ? `${country}: the` : 'The'} official study-visa document list names no financial document —{' '}
                      <FundsLinks sources={sources} />. Confirm with the embassy or your university.
                    </p>
                  ))}
                  {cov.notCovered.length > 0 && (
                    <p className="mt-1.5 text-sm text-stone-700">
                      Not covered here: {joinCountries(cov.notCovered)}. Confirm the financial rule with the embassy or immigration
                      authority concerned.
                    </p>
                  )}
                  {d.fundsRule.guides.length > 0 && (
                    <p className="mt-1.5 text-sm text-stone-700">
                      Our guides:{' '}
                      {d.fundsRule.guides.map((gl, i) => (
                        <span key={gl.slug}>
                          {i > 0 ? ' · ' : ''}
                          <Link href={`/guides/${gl.slug}`} className="text-forest-700 underline underline-offset-2 hover:text-forest-800">
                            {gl.title}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <LastUpdated date={SITE_REVIEWED} className="mt-8" />
    </div>
  );
}

/** A country's funds-rule pages, " · "-separated, each opening in a new tab. */
function FundsLinks({ sources }: { sources: FundsSource[] }) {
  return (
    <>
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 ? ' · ' : ''}
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-forest-700 underline underline-offset-2 hover:text-forest-800"
          >
            {s.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </span>
      ))}
    </>
  );
}
