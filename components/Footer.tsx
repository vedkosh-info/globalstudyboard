'use client';

import Link from 'next/link';
import { Smartphone } from 'lucide-react';
import { REGIONS, REGIONS_ALPHABETICAL, getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { ADMISSIONS_CYCLE } from '@/lib/site-meta';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';
import GetAppButton from '@/components/GetAppButton';

const REGION_LINKS = REGIONS_ALPHABETICAL.map((r) => ({
  label: r.displayName,
  href: `/regions/${r.slug}`,
  slug: r.slug,
}));

const SITE_LINKS = [
  { label: 'Ask GSB AI', href: '/gsb-ai' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string; slug?: RegionSlug }[];
}) {
  return (
    <div>
      <h3 className="text-cream-50/80 font-semibold text-xs mb-4 uppercase tracking-[0.16em]">
        {heading}
      </h3>
      <ul className="space-y-2.5 list-none p-0 m-0">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className="inline-flex items-center gap-2 text-cream-50/60 text-sm hover:text-terracotta-300 no-underline transition-colors"
            >
              {link.slug && <RegionFlag slug={link.slug} className="h-3" />}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Site footer. The disclaimer + region directory are constant; the "Tests" and
 * "Study in …" columns re-tune to the destination the visitor is exploring
 * (their chosen region, the region of the page they landed on, or India by
 * default). `examLabels` is a compact slug→short-name map passed from the server
 * layout so the full exam catalogue never ships to the browser.
 */
export default function Footer({
  examLabels,
  year,
}: {
  examLabels: Record<string, string>;
  year: number;
}) {
  const { effectiveRegion } = useRegion();
  const r = getRegionBySlug(effectiveRegion);

  const regionExamLinks = (r?.keyExamSlugs ?? []).slice(0, 5).map((slug) => ({
    label: examLabels[slug] ?? slug.toUpperCase(),
    href: `/exams/${slug}`,
  }));

  const studyLinks = r
    ? [
        { label: `${r.displayName} universities`, href: `/regions/${r.slug}/universities` },
        { label: 'Entrance exams', href: '/exams' },
        { label: 'Admission guides', href: '/guides' },
        { label: 'Scholarships', href: '/scholarships' },
        { label: 'Visa & costs', href: `/regions/${r.slug}` },
      ]
    : [];

  return (
    <footer className="bg-forest-900 text-cream-50 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="no-underline">
              <span className="font-display text-xl font-bold block mb-3 text-cream-100 tracking-editorial">
                GlobalStudyBoard
              </span>
            </Link>
            <p className="text-cream-50/70 text-sm leading-relaxed mb-4">
              A complete guide to universities, entrance exams, and scholarships worldwide.
            </p>
            <p className="text-cream-50/60 text-xs leading-relaxed">
              Independent, student-first guidance for {REGIONS.length} study destinations — pick yours
              and the whole site tunes to it.
            </p>
            <p className="text-cream-50/50 text-[11px] leading-relaxed mt-4 font-medium tracking-wide">
              Updated for the {ADMISSIONS_CYCLE} admissions cycle · Independent · Every fact linked to
              its official source.
            </p>

            {/* Android app. In closed beta this opens the tester-invite dialog;
                once the Play listing is public it becomes a plain store link. */}
            <GetAppButton className="mt-5 inline-flex items-center gap-2 rounded-full border border-cream-50/25 bg-forest-800/60 px-4 py-2 text-xs font-semibold text-cream-50/90 transition-colors hover:border-cream-50/40 hover:bg-forest-800">
              <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
              Get the Android app
            </GetAppButton>
          </div>

          <FooterCol heading="Destinations" links={REGION_LINKS.slice(0, 4)} />
          <FooterCol heading="More Destinations" links={REGION_LINKS.slice(4)} />

          {regionExamLinks.length > 0 && (
            <FooterCol
              heading={r ? `${r.displayName} Tests` : 'Tests'}
              links={[...regionExamLinks, { label: 'All exams', href: '/exams' }]}
            />
          )}

          {studyLinks.length > 0 && (
            <FooterCol heading={r ? `Study in ${r.displayName}` : 'Study'} links={studyLinks} />
          )}

          <FooterCol heading="Site" links={SITE_LINKS} />
        </div>

        {/* Disclaimer */}
        <div className="bg-forest-800/60 border border-forest-700 rounded-lg px-5 py-4 mb-6">
          <p className="text-cream-50/70 text-xs leading-relaxed text-center max-w-3xl mx-auto">
            <strong className="text-cream-50/90 font-semibold">Disclaimer: </strong>
            Information provided on GlobalStudyBoard is for guidance only. Tuition fees, application
            deadlines, rankings, and eligibility requirements change every academic year. Always
            verify all details with the official university or examination website before applying.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream-50/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cream-50/60 text-xs">
            &copy; {year} 🔱 ParvatiPatiMahadev 🚩
          </p>
          <nav className="flex items-center gap-4 flex-wrap justify-center" aria-label="Legal">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Disclaimer', href: '/disclaimer' },
              { label: 'Cookies', href: '/cookies' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-cream-50/60 text-xs hover:text-cream-50/90 no-underline transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
