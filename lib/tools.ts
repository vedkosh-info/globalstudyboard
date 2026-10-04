/**
 * Tools registry — the ONE list of interactive tools the site offers.
 *
 * URL scheme (owner decision, September 2026): every tool lives at
 * `/tools/<slug>` and `/tools` is the public index. A tool page is a static,
 * indexable shell (name, what it does, privacy note) whose interactive part
 * renders only for a signed-in visitor — the same static-shell + client-gate
 * pattern as /account (constitution §17): no server cookie reads, the Supabase
 * SDK loads lazily inside the tool's own chunk, and Row-Level Security is the
 * real enforcement. Adding a tool = one entry here + one folder under app/tools.
 *
 * Pure data: safe to import from server pages AND client components.
 */

import type { RegionSlug } from '@/lib/regions';

// The destination hand-off key (`#region=<slug>`) and the /tools index link live
// in lib/tool-hint.ts, which carries no registry data, so the site chrome (header,
// strip, dock) can link to /tools without pulling this list into the layout chunk.
import { REGION_HINT_KEY, toolPageHref } from '@/lib/tool-hint';
export { REGION_HINT_KEY, toolsIndexHref } from '@/lib/tool-hint';

export interface ToolDef {
  slug: string;
  name: string;
  /** One line under the name (cards, meta description). */
  tagline: string;
  /** Longer description for the tool page lede. */
  description: string;
  /** What the tool does, as short bullets (cards + the tool page). */
  features: string[];
  /** Every tool needs a free account today (constitution §18). */
  access: 'account';
}

export const TOOLS: ToolDef[] = [
  {
    slug: 'application-planner',
    name: 'Application Planner',
    tagline: 'Shortlist universities, then track every deadline, document and test date in one place.',
    description:
      'Build your own shortlist from our university profiles across nine destinations — or add any university — and keep each application moving: status, your deadlines, a document checklist, test dates and private notes, synced to your account on every device.',
    features: [
      'Shortlist universities from our profiles, or add your own',
      'Track status from researching to accepted',
      'Your deadlines, documents and test dates on one timeline',
      'Private notes per application, and a CSV download',
      'A printable report and one-tap PDF, built in your browser',
    ],
    access: 'account',
  },
  {
    slug: 'cost-planner',
    name: 'Cost & Funding Planner',
    tagline: 'Total your own tuition, living and visa-related costs against your funding, in your destination’s currency.',
    description:
      'Build a budget for the destination you are looking at — tuition, living costs, health cover, visa fees, travel — next to the savings, family support, scholarships and loans you expect to fund it with. Every amount is one you enter; we supply the destination’s categories, with an official page or our guide linked on a line where we have one.',
    features: [
      'Cost lines tuned to your destination, with an official page or our guide linked where we have one',
      'Your funding next to your costs — see the difference, not a guess',
      'One currency per budget, never converted; one-off and per-year lines',
      'Saved to your account, with a CSV download',
      'A printable report and one-tap PDF, built in your browser',
    ],
    access: 'account',
  },
  {
    slug: 'compare-universities',
    name: 'Compare Universities',
    tagline: 'Put up to four universities side by side — our verified facts on top, your own criteria, weights and scores underneath.',
    description:
      'Choose up to four universities from our verified profiles for your destination (or add your own), read the facts side by side — rankings attributed to the bodies that published them, location, admission tests, application platform, levels, language, courses — then rate each one on criteria you name and weight. The tool shows your own weighted result with the arithmetic in full; it never ranks, scores or recommends a university itself.',
    features: [
      'Verified facts side by side, each ranking attributed and linked',
      'Criteria you name and weight, scores you give (1–5)',
      'Your own weighted result, arithmetic shown, your own top pick',
      'Saved to your account, with a CSV download',
      'A printable report and one-tap PDF, built in your browser',
    ],
    access: 'account',
  },
  {
    slug: 'test-score-tracker',
    name: 'Test Score Tracker',
    // ≤ 121 characters: the tool page's meta description is this line plus
    // " Free, for all nine study destinations." within 160 (scripts/check-tools.ts).
    // "Any validity rule", not "how long each stays valid": for most tests the
    // body publishes no period we can count, and the tool says so.
    tagline: 'Record each score as received, see any validity rule its test body publishes, and which listed tests have no score yet.',
    description:
      'Keep every attempt as the test body reported it — score, section scores, test date and a private note. Each test shows the validity rule its body publishes, or a plain note where we found none, and, where the body sets a fixed period or recommends a maximum age, an “on or about” date for each attempt. Readiness lists what our profile of each university on your shortlist for the chosen destination names and, for each test the tracker records, whether you have a score on record; anything else is shown as the profile words it, to confirm on the university’s own page. The tool never combines, converts or judges a score, and never says whether a score meets a requirement.',
    features: [
      'Every attempt kept as received — score, sections, test date, private note',
      'The validity rule each test body publishes, sourced and dated — or a note that we found none',
      'Readiness for your shortlist: which tracked tests its profiles name still have no score',
      'Saved to your account, with a CSV download',
      'A printable report and one-tap PDF, built in your browser',
    ],
    access: 'account',
  },
];

/**
 * A tool's URL. From a DESTINATION page (a region hub, a university profile, an
 * exam page), pass that page's destination: it rides a fragment,
 * `/tools/<slug>#region=<slug>`, so a visitor who has not chosen a destination
 * yet opens the tool on the one they were reading about instead of the India
 * default (review, CRIT2-2) — components/tools/useDestinationHint applies it
 * as a provisional page destination (never remembered, and never over a
 * remembered choice) and leaves it in the address bar, so a reload or
 * Back/Forward keeps it. A fragment, never a query string, so every tool keeps
 * one canonical, indexable URL (see `scoreTrackerHref`).
 *
 * Follow a fragment-bearing href with components/tools/ToolLink, not
 * next/link: Next scrolls a same-tab fragment navigation to the page's first
 * element, above which the site header disappears (review G8-SK-5).
 */
export const toolHref = (slug: string, region?: RegionSlug | null): string => toolPageHref(slug, region);

/**
 * The /tools index meta description, built from the registry so a new tool is
 * never left out. It leads with the tool names (the nine-destination list used
 * to fill the whole snippet) and must stay whole within 160 characters — the
 * fourth tool pushed an earlier wording over and cut it to "…tuned to your
 * study…". `scripts/check-tools.ts` fails the build if it no longer fits.
 */
export const TOOLS_INDEX_DESCRIPTION_MAX = 160;
export const toolsIndexDescription = (): string =>
  `Free tools for university applicants: ${TOOLS.slice(0, -1)
    .map((t) => t.name)
    .join(', ')} and ${TOOLS[TOOLS.length - 1].name} — tuned to your destination.`;

/**
 * A link that opens the Test Score Tracker on one test. The prefill rides a
 * FRAGMENT, never a query string: the tool page is indexable, so `?exam=<slug>`
 * from all 53 exam pages would mint 53 crawlable URLs that all serve the same
 * document under one canonical — the "Alternate page with proper canonical tag"
 * bucket the September 2026 SEO audit spent 126 rows clearing. Same rule as
 * `gsbAiHref()` (lib/gsb-ai-links.ts).
 *
 * Pass the exam's own `region`: a destination's test (SAT → the United States)
 * also carries `&region=<slug>`, as `toolHref` does, so the tracker opens on
 * that destination for a visitor who has not chosen one. A worldwide test
 * (`'global'`) carries none — it belongs to no single destination. Render it
 * with components/tools/ToolLink (see `toolHref`).
 */
export const scoreTrackerHref = (examSlug: string, region?: RegionSlug | 'global' | null): string =>
  `/tools/test-score-tracker#exam=${encodeURIComponent(examSlug)}${region && region !== 'global' ? `&${REGION_HINT_KEY}=${region}` : ''}`;

/**
 * Old report addresses. They redirect to the tool: the PDF is downloaded on
 * the tool screen, so a student never opens a second page to get it.
 */
export const reportHref = (slug: string): string => `/tools/${slug}/report`;

export const getToolBySlug = (slug: string): ToolDef | undefined => TOOLS.find((t) => t.slug === slug);
