import type { Metadata } from 'next';
import Link from 'next/link';

import NotFoundDestinations from '@/components/NotFoundDestinations';
import { SITE_NAME } from '@/lib/seo';

/**
 * Custom 404. Without it, Next's default not-found body inherited the root
 * layout metadata verbatim — the HOME page's <title>, canonical and og:url plus
 * two contradicting robots tags — on every missing URL. This page is explicitly
 * noindex, carries its own title, and hands the visitor the nine destination
 * hubs and the main sections so a dead link still ends somewhere useful.
 */
const NOT_FOUND_TITLE = 'Page not found';
const NOT_FOUND_DESCRIPTION =
  'The page you asked for does not exist. Browse universities, exams, guides and scholarships by study destination instead.';

export const metadata: Metadata = {
  title: NOT_FOUND_TITLE,
  description: NOT_FOUND_DESCRIPTION,
  // `openGraph` and `twitter` are replaced wholesale per segment, so setting them
  // here stops the 404 from carrying the HOME page's og:title/og:description and
  // an og:url of the site root (a dead link shared in chat previewed as the home
  // page). No `url` on purpose: a 404 has no canonical address. The site card
  // (app/opengraph-image.tsx) is still injected by the file convention.
  openGraph: { title: NOT_FOUND_TITLE, description: NOT_FOUND_DESCRIPTION, siteName: SITE_NAME, locale: 'en_US' },
  twitter: { card: 'summary_large_image', title: NOT_FOUND_TITLE, description: NOT_FOUND_DESCRIPTION },
  // Overrides the root layout's `index, follow` block (metadata keys are replaced
  // per segment). Next.js also injects its own <meta name="robots" content="noindex">
  // for the not-found boundary, so two consistent noindex tags are emitted — the
  // alternative was one noindex tag contradicted by the inherited index,follow.
  robots: { index: false, follow: true },
};

const SECTIONS = [
  { label: 'Universities', href: '/colleges' },
  { label: 'Entrance exams', href: '/exams' },
  { label: 'Study guides', href: '/guides' },
  { label: 'Scholarships', href: '/scholarships' },
  { label: 'Topics', href: '/topics' },
  { label: 'Ask GSB AI', href: '/gsb-ai' },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Error 404
        </p>
        <h1 className="mb-4 font-display text-4xl font-bold leading-[1.08] tracking-editorial text-ink md:text-5xl">
          That page doesn&rsquo;t exist.
        </h1>
        <p className="editorial-lede text-lg leading-relaxed text-stone-800">
          The link may be out of date, or the address may have a typo. Pick a study destination
          below, or jump straight to a section.
        </p>
      </header>

      <section aria-labelledby="nf-destinations">
        <h2 id="nf-destinations" className="mb-4 font-display text-2xl font-bold tracking-editorial text-ink">
          Browse by destination
        </h2>
        <NotFoundDestinations />
      </section>

      <section aria-labelledby="nf-sections">
        <h2 id="nf-sections" className="mb-4 font-display text-2xl font-bold tracking-editorial text-ink">
          Or go to a section
        </h2>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 no-underline transition-colors hover:border-forest-300 hover:text-forest-700"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
