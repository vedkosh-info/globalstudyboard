import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Award, CalendarCheck2, ClipboardList, Coins, Columns3, Lock, ShieldCheck, type LucideIcon } from 'lucide-react';
import { TOOLS, TOOLS_INDEX_DESCRIPTION_MAX, toolsIndexDescription } from '@/lib/tools';
import { pageMetadata } from '@/lib/seo';
import { SITE_REVIEWED } from '@/lib/site-meta';
import LastUpdated from '@/components/LastUpdated';
import FeedbackButton from '@/components/FeedbackButton';
import ToolsIndexHint from '@/app/tools/ToolsIndexHint';
import ToolIndexLink from '@/app/tools/ToolIndexLink';

/**
 * /tools — the public index of the site's interactive tools. Static and
 * indexable: it describes each tool and links to it; the tool itself renders
 * only for a signed-in visitor (constitution §18). The breadcrumb comes from the
 * global light `Breadcrumbs` (single-segment page).
 */
export const metadata: Metadata = pageMetadata({
  title: 'Tools for Your University Applications — Free with an Account',
  // Built from the registry so a new tool is never left out; the build fails if
  // it would no longer fit whole (scripts/check-tools.ts).
  description: toolsIndexDescription(),
  descriptionMax: TOOLS_INDEX_DESCRIPTION_MAX,
  path: '/tools',
  keywords: ['university application tracker', 'college application planner', 'admission deadline tracker', 'study abroad planner'],
});

/** One icon per tool (the registry stays pure data). */
const TOOL_ICON: Record<string, LucideIcon> = { 'application-planner': ClipboardList, 'cost-planner': Coins, 'compare-universities': Columns3, 'test-score-tracker': Award };

const HOW = [
  {
    icon: Lock,
    title: 'Free, with a passwordless account',
    text: 'Sign in with a one-time e-mail code or link, or Google. No password, nothing to pay, and every page of the site stays readable without an account.',
  },
  {
    icon: ShieldCheck,
    title: 'Your data stays yours',
    text: 'What you put into a tool is stored only for you, synced across your devices, included in your data download, and deleted with your account.',
  },
  {
    icon: CalendarCheck2,
    title: 'You keep the dates, the university keeps the truth',
    text: 'Tools record what you enter; they never check it for you. Deadlines and requirements change every year, so confirm each one on the official site — a tool links it wherever it has one.',
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* A destination handed over by the site-wide Tools links skins this index and carries on to the tool opened next. */}
      <ToolsIndexHint />
      <header className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">Tools</p>
        <h1 className="font-display text-4xl font-bold tracking-editorial text-ink sm:text-5xl">Tools for your applications</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">
          Reading tells you what to do. These tools help you actually do it. Each one tunes itself to the destination you
          choose in the header — any of the nine we cover — from one free account.
        </p>
      </header>

      <ul className="grid list-none gap-5 p-0 m-0 sm:grid-cols-2">
        {TOOLS.map((tool) => {
          const Icon = TOOL_ICON[tool.slug] ?? ClipboardList;
          return (
          <li key={tool.slug} className="flex">
            <article className="flex w-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-colors hover:border-forest-300">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest-800">
                  Free with an account
                </span>
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-editorial text-ink">
                <ToolIndexLink slug={tool.slug} className="no-underline hover:underline">
                  {tool.name}
                </ToolIndexLink>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">{tool.tagline}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-stone-700">
                {tool.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="mt-auto pt-5">
                <ToolIndexLink
                  slug={tool.slug}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-forest-700 px-4 text-sm font-semibold text-cream-50 no-underline transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
                >
                  {/* The tool's name as written — lowercasing it read "Open the compare universities" (review, CRIT2-6). */}
                  Open {tool.name} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ToolIndexLink>
              </div>
            </article>
          </li>
          );
        })}
        <li className="flex">
          <div className="flex w-full flex-col justify-center rounded-2xl border border-dashed border-stone-300 bg-cream-50 p-6">
            <h2 className="font-display text-xl font-bold tracking-editorial text-ink">More tools, in phases</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              We build one tool at a time and release it only once it works well on every destination. Tell us which one would
              help you most.
            </p>
            <div className="mt-4">
              <FeedbackButton
                kind="suggestion"
                className="inline-flex h-10 items-center rounded-full border border-forest-300 bg-white px-4 text-sm font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
              >
                Suggest a tool
              </FeedbackButton>
            </div>
          </div>
        </li>
      </ul>

      <section className="mt-12" aria-labelledby="how-tools-work">
        <h2 id="how-tools-work" className="font-display text-2xl font-bold tracking-editorial text-ink">
          How tools work here
        </h2>
        <ul className="mt-5 grid list-none gap-4 p-0 m-0 md:grid-cols-3">
          {HOW.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
              <Icon className="h-5 w-5 text-forest-700" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-stone-700">
          Accounts are for people aged 18 or over. Read what an account stores in our{' '}
          <Link href="/privacy" className="text-forest-700 underline hover:text-forest-800">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <LastUpdated date={SITE_REVIEWED} className="mt-8" />
    </div>
  );
}
