import Link from 'next/link';
import { REGIONS } from '@/lib/regions';

const FOOTER_SECTIONS = [
  {
    heading: 'Browse by Region',
    links: REGIONS.slice(0, 5).map((r) => ({
      label: `${r.flag} ${r.displayName}`,
      href: `/regions/${r.slug}`,
    })),
  },
  {
    heading: 'Also Covered',
    links: REGIONS.slice(5).map((r) => ({
      label: `${r.flag} ${r.displayName}`,
      href: `/regions/${r.slug}`,
    })),
  },
  {
    heading: 'Exams',
    links: [
      { label: 'SAT', href: '/exams/sat' },
      { label: 'ACT', href: '/exams/act' },
      { label: 'GRE', href: '/exams/gre' },
      { label: 'IELTS', href: '/exams/ielts' },
      { label: 'TOEFL', href: '/exams/toefl' },
      { label: 'All exams', href: '/exams' },
    ],
  },
  {
    heading: 'Popular Topics',
    links: [
      { label: 'JEE & IITs', href: '/topics/jee' },
      { label: 'NEET & Medical', href: '/topics/neet' },
      { label: 'Government Exams', href: '/topics/government-exams' },
      { label: 'MBA & CAT', href: '/topics/mba' },
      { label: 'Study Abroad', href: '/topics/study-abroad' },
      { label: 'All topics', href: '/topics' },
    ],
  },
  {
    heading: 'Site',
    links: [
      { label: 'Ask GSB AI', href: '/gsb-ai' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

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
            <p className="text-cream-50/40 text-xs leading-relaxed">
              Built for students in the United States, Europe, and beyond — with comprehensive coverage of universities and admission systems across {REGIONS.length} regions.
            </p>
            <p className="text-cream-50/50 text-[11px] leading-relaxed mt-4 font-medium tracking-wide">
              Est. 2026 · Independent · Every fact linked to its official source.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <h3 className="text-cream-50/80 font-semibold text-xs mb-4 uppercase tracking-[0.16em]">
                {section.heading}
              </h3>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-cream-50/60 text-sm hover:text-terracotta-300 no-underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="bg-forest-800/60 border border-forest-700 rounded-lg px-5 py-4 mb-6">
          <p className="text-cream-50/70 text-xs leading-relaxed text-center max-w-3xl mx-auto">
            <strong className="text-cream-50/90 font-semibold">Disclaimer: </strong>
            Information provided on GlobalStudyBoard is for guidance only. Tuition fees, application deadlines, rankings, and eligibility requirements change every academic year. Always verify all details with the official university or examination website before applying.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cream-50/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cream-50/40 text-xs">
            &copy; {year} GlobalStudyBoard. All rights reserved.
          </p>
          <nav className="flex items-center gap-4 flex-wrap justify-center" aria-label="Legal">
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Disclaimer', href: '/disclaimer' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-cream-50/35 text-xs hover:text-cream-50/75 no-underline transition-colors"
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
