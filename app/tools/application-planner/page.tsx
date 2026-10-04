import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, ClipboardList, ListChecks, NotebookPen } from 'lucide-react';
import { getToolBySlug } from '@/lib/tools';
import { PUBLISHER_LD, SITE_URL, pageMetadata } from '@/lib/seo';
import { SITE_REVIEWED } from '@/lib/site-meta';
import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import LastUpdated from '@/components/LastUpdated';
import PlannerGate from '@/app/tools/application-planner/PlannerGate';

/**
 * /tools/application-planner — a static, indexable shell around the first
 * account-only tool. The page describes the tool for crawlers and signed-out
 * visitors; `PlannerGate` decides in the browser (cookie presence — no server
 * cookie reads, constitution §16.2/§17) whether to load the tool chunk or show
 * the sign-in card. The university and exam pickers are fetched by the
 * tool chunk from ./catalogue (static JSON) — the client never imports the
 * catalogue (bundle guard) and the public shell's payload carries none of it.
 * Like every tool (§18) it shows one destination at a time — the one chosen in
 * the header — so the copy below promises a shortlist per destination, not one
 * mixed list.
 */
const tool = getToolBySlug('application-planner')!;
const PATH = '/tools/application-planner';

export const metadata: Metadata = pageMetadata({
  title: 'Application Planner — Track University Applications, Deadlines & Documents',
  description: tool.tagline + ' Free, for all nine study destinations.',
  descriptionMax: 160,
  path: PATH,
  keywords: [
    'university application tracker',
    'college application deadline tracker',
    'application checklist for university',
    'study abroad application planner',
    'track university applications',
  ],
});

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'A shortlist for each destination',
    // The nine peers, named from the registry so the list can never drift from the site's destinations.
    text: `Pick from our university profiles or add any university, for any of our nine destinations — ${REGIONS_ALPHABETICAL.map((r) => r.shortName).join(', ')}. The planner shows the one chosen in the header and counts your applications for the others.`,
  },
  { icon: CalendarDays, title: 'Your deadlines on one timeline', text: 'Application, scholarship, visa and test dates you enter, sorted by what is due next, with overdue items flagged.' },
  { icon: ListChecks, title: 'A checklist per application', text: 'Start from a common document list, edit it to match the university, tick items off as you go.' },
  { icon: NotebookPen, title: 'Private notes, synced', text: 'Keep contacts, fee notes and reminders with each application. Everything follows your account to every device.' },
];

const STEPS = [
  'Add a university — search our profiles or type your own. Programme and intake offer that profile’s and that destination’s choices; type your own if it is not listed.',
  'Enter the dates that matter to you: the application deadline, test dates, scholarship and visa steps.',
  'Move each application from researching to applied to accepted, and tick off documents as you gather them.',
];

export default function ApplicationPlannerPage() {
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

      <section className="mt-8" aria-label="Your application planner">
        <PlannerGate />
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]" aria-labelledby="planner-how">
        <div>
          <h2 id="planner-how" className="font-display text-2xl font-bold tracking-editorial text-ink">How it works</h2>
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
              The planner records <strong>what you enter</strong>. It does not know a university&rsquo;s real deadline or predict
              whether you will be admitted. Confirm every date and requirement on the university&rsquo;s official site, which is linked on
              each entry added from our profiles and on any entry where you added the link.
            </li>
            <li>
              Your plan is private to your account: it is in your data download, follows you across devices, and is deleted with
              the account. Please do not record sensitive personal details in notes.
            </li>
            <li>
              Free, no limits that matter (100 applications, 1,000 items). Accounts are for people aged 18 or over — see the{' '}
              <Link href="/privacy" className="text-forest-700 underline hover:text-forest-800">
                Privacy Policy
              </Link>
              .
            </li>
          </ul>
        </div>
      </section>

      <LastUpdated date={SITE_REVIEWED} className="mt-8" />
    </div>
  );
}
