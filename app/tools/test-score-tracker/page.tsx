import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { CalendarClock, ClipboardCheck, ListChecks, ShieldCheck } from 'lucide-react';
import { getToolBySlug } from '@/lib/tools';
import { PUBLISHER_LD, SITE_URL, pageMetadata } from '@/lib/seo';
import { SITE_REVIEWED } from '@/lib/site-meta';
import { REGIONS_ALPHABETICAL, type RegionSlug } from '@/lib/regions';
import { ENTRANCE_EXAMS, type EntranceExam } from '@/lib/admission-guides';
import { EXAM_VALIDITY, validityKindLabel } from '@/lib/test-validity';
import { SCORE_LIMITS, readinessIntro } from '@/lib/test-scores';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import LastUpdated from '@/components/LastUpdated';
import RegionFlag from '@/components/RegionFlag';
import TableScroller from '@/components/tools/TableScroller';
import { ToolSkeleton } from '@/components/tools/ToolStates';
import TestScoreGate from '@/app/tools/test-score-tracker/TestScoreGate';

/**
 * /tools/test-score-tracker — a static, indexable shell around the fourth
 * account-only tool. The page describes the tool for crawlers and signed-out
 * visitors and carries one piece of genuinely public content: the validity
 * rule each test body publishes for its result — or a note that we found none
 * (Tier-1 source + checked date, from lib/test-validity.ts). The tool itself
 * renders in the browser for a signed-in visitor only (constitution §18): no
 * server cookie reads, no SDK in this chunk; the exam picker and each
 * university's test list arrive through ./catalogue. The one projection
 * passed down is the slug → short-name map (names this page already prints
 * in its validity tables), so the tool can still name a recorded test if
 * that list fails.
 *
 * Rule A / §4.5: this page states validity rules with their sources and
 * nothing about what score any university requires.
 */
const tool = getToolBySlug('test-score-tracker')!;
const PATH = '/tools/test-score-tracker';

export const metadata: Metadata = pageMetadata({
  title: 'Test Score Tracker — Record Scores, Validity Rules & Readiness',
  description: tool.tagline + ' Free, for all nine study destinations.',
  descriptionMax: 160,
  path: PATH,
  keywords: [
    'test score tracker',
    'how long are test scores valid',
    'IELTS score validity',
    'GRE score validity',
    'SAT score validity',
    'track my test scores',
    'entrance exam score record',
  ],
});

const FEATURES = [
  { icon: ClipboardCheck, title: 'Every attempt, as received', text: `Record each score exactly as the test body reported it — total, up to ${SCORE_LIMITS.sectionsPerScore} section scores, the test date and a private note. Nothing is combined, converted or ranked.` },
  { icon: CalendarClock, title: 'Official validity rules', text: 'For every test you record, the rule its test body publishes — or a note that we found none — with its official source and the date we checked it; under each attempt, a date where the body sets a fixed period from the test date or recommends a maximum age.' },
  // The in-tool intro's own sentence (lib/test-scores), so this card can never
  // promise more than the view does: a profile line may name a test the tracker
  // does not record (JLPT, EJU, HSK…) or no test at all (G8-SK2-4).
  { icon: ListChecks, title: 'Readiness for your shortlist', text: `${readinessIntro('the chosen destination')} Presence only — never a verdict.` },
  { icon: ShieldCheck, title: 'Private, portable, yours', text: 'Scores are private to your account, follow you to every device, download as a CSV or a printable report and PDF, sit in your data download and are deleted with the account.' },
];

const STEPS = [
  'Pick a test used in your destination — or any other — and type the score as you received it.',
  'The validity rule from that test body is shown with the score, and linked.',
  'Readiness lists the tests your shortlisted universities name, and which you have not recorded.',
];

function groupExams(): Array<{ key: string; label: string; flag: RegionSlug | null; exams: EntranceExam[] }> {
  const byName = (a: EntranceExam, b: EntranceExam) => a.shortName.localeCompare(b.shortName);
  const global = ENTRANCE_EXAMS.filter((e) => e.region === 'global').sort(byName);
  const groups: Array<{ key: string; label: string; flag: RegionSlug | null; exams: EntranceExam[] }> = [{ key: 'global', label: 'Tests accepted worldwide', flag: null, exams: global }];
  for (const r of REGIONS_ALPHABETICAL) {
    const exams = ENTRANCE_EXAMS.filter((e) => e.region === r.slug).sort(byName);
    if (exams.length) groups.push({ key: r.slug, label: `Tests used in ${r.proseName}`, flag: r.slug, exams });
  }
  return groups;
}

const fmt = (iso: string): string => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${iso}T00:00:00`));

export default function TestScoreTrackerPage() {
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
  const groups = groupExams();
  // Compact slug → short-name projection for the tool (never the catalogue itself).
  const examNames = Object.fromEntries(ENTRANCE_EXAMS.map((e) => [e.slug, e.shortName]));
  const withRule = ENTRANCE_EXAMS.filter((e) => Boolean(EXAM_VALIDITY[e.slug])).length;

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

      <section className="mt-8" aria-label="Your test scores">
        <Suspense fallback={<ToolSkeleton label="Loading your scores…" />}>
          <TestScoreGate examNames={examNames} />
        </Suspense>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]" aria-labelledby="scores-how">
        <div>
          <h2 id="scores-how" className="font-display text-2xl font-bold tracking-editorial text-ink">How it works</h2>
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
              <strong>We never say whether a score is enough.</strong> The tool records what you enter and shows which listed tests have a score on
              record. Whether a score meets a programme&rsquo;s requirement is decided by the university, on its official requirements page.
            </li>
            <li>
              Validity rules are summarised in our own words from each test body&rsquo;s own page, linked and dated. A date is printed only where the
              body states a fixed period from the test date, or recommends a maximum age for a result (IELTS — counted here from the test date, so
              treat it as approximate); where it counts differently (from the result announcement, in testing years, per admission cycle) you see the
              rule in words instead. Universities may set their own recency rules — confirm with each one.
            </li>
            <li>
              Scores are private to your account, in your data download, and deleted with the account. Please keep registration numbers, dates of birth
              and ID numbers out of notes. Accounts are for people aged 18 or over — see the{' '}
              <Link href="/privacy" className="text-forest-700 underline hover:text-forest-800">
                Privacy Policy
              </Link>
              .
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="validity-heading">
        <h2 id="validity-heading" className="font-display text-2xl font-bold tracking-editorial text-ink">
          Validity rules, as published by each test body
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-700">
          What each test body publishes about how long its result counts, for the {withRule} tests the tool tracks — in our own words, with the
          official page or document it comes from and the date we checked it. Where a body publishes no rule, we say so and link the official
          page we checked rather than repeat what is commonly claimed. Rules change — check the source before relying on one, and remember that a university can ask
          for a more recent score than the test body requires.
        </p>
        <div className="mt-6 space-y-8">
          {groups.map((g) => (
            <div key={g.key}>
              <h3 id={`validity-${g.key}`} className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-editorial text-ink">
                {g.flag && <RegionFlag slug={g.flag} className="h-4" />}
                {g.label}
              </h3>
              <TableScroller labelledBy={`validity-${g.key}`} className="mt-3 rounded-2xl border border-stone-200 bg-white">
                <table aria-labelledby={`validity-${g.key}`} className="w-full min-w-[40rem] border-collapse text-sm">
                  <thead>
                    <tr className="bg-cream-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-600">
                      <th scope="col" className="px-4 py-2.5">
                        Test
                      </th>
                      <th scope="col" className="px-4 py-2.5">
                        Rule
                      </th>
                      <th scope="col" className="px-4 py-2.5">
                        Source
                      </th>
                      <th scope="col" className="px-4 py-2.5">
                        Checked
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.exams.map((e) => {
                      const v = EXAM_VALIDITY[e.slug];
                      return (
                        <tr key={e.slug} className="border-t border-stone-100 align-top">
                          <th scope="row" className="px-4 py-2.5 text-left font-semibold text-ink">
                            <Link href={`/exams/${e.slug}`} className="text-ink no-underline hover:text-forest-700 hover:underline">
                              {e.shortName}
                            </Link>
                          </th>
                          {v ? (
                            <>
                              <td className="px-4 py-2.5 text-stone-800">
                                <span className="block text-xs font-semibold text-forest-700">{validityKindLabel(v)}</span>
                                {v.note}
                              </td>
                              <td className="px-4 py-2.5">
                                {/* The page or document itself (a bulletin's section where the rule lives there) — the same citation the tool and the report print. */}
                                <a href={v.source.url} target="_blank" rel="noopener noreferrer" className="text-forest-700 underline underline-offset-2 hover:text-forest-800">
                                  {v.source.label}
                                  <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                                {v.also && (
                                  <a href={v.also.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-forest-700 underline underline-offset-2 hover:text-forest-800">
                                    {v.also.label}
                                    <span className="sr-only"> (opens in a new tab)</span>
                                  </a>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-4 py-2.5 text-stone-600">{fmt(v.lastVerified)}</td>
                            </>
                          ) : (
                            <td colSpan={3} className="px-4 py-2.5 text-stone-600">
                              Validity rule not on file — confirm with the official body.
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableScroller>
            </div>
          ))}
        </div>
      </section>

      <LastUpdated date={SITE_REVIEWED} className="mt-8" />
    </div>
  );
}
