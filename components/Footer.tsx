import Link from 'next/link';

const FOOTER_LINKS = [
  {
    heading: 'Indian Colleges',
    links: [
      { label: 'IITs', href: '/colleges/india/iits' },
      { label: 'NITs', href: '/colleges/india/nits' },
      { label: 'IIMs', href: '/colleges/india/iims' },
      { label: 'AIIMS', href: '/colleges/india/aiims' },
      { label: 'NLUs', href: '/colleges/india/nlus' },
    ],
  },
  {
    heading: 'Study Abroad',
    links: [
      { label: 'USA', href: '/colleges/abroad/usa' },
      { label: 'UK', href: '/colleges/abroad/uk' },
      { label: 'Canada', href: '/colleges/abroad/canada' },
      { label: 'Australia', href: '/colleges/abroad/australia' },
      { label: 'Germany', href: '/colleges/abroad/germany' },
    ],
  },
  {
    heading: 'Entrance Exams',
    links: [
      { label: 'JEE Main', href: '/exams/jee-main' },
      { label: 'JEE Advanced', href: '/exams/jee-advanced' },
      { label: 'NEET UG', href: '/exams/neet-ug' },
      { label: 'CAT', href: '/exams/cat' },
      { label: 'GRE', href: '/exams/gre' },
    ],
  },
  {
    heading: 'Quick Links',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12">

        {/* Main link grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="no-underline">
              <span className="text-gold-400 text-xl font-bold font-display block mb-3">
                GlobalStudyBoard
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Your complete guide to college admissions — India and worldwide.
            </p>
            <p className="text-white/35 text-xs leading-relaxed">
              Trusted by students aiming for IITs, NITs, IIMs, AIIMS, and top global universities.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.heading}>
              <h3 className="text-white/70 font-semibold text-xs mb-4 uppercase tracking-widest">
                {section.heading}
              </h3>
              <ul className="space-y-2.5 list-none p-0 m-0">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/55 text-sm hover:text-gold-300 no-underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimer notice */}
        <div className="bg-brand-800/60 border border-brand-700 rounded-lg px-5 py-4 mb-6">
          <p className="text-white/60 text-xs leading-relaxed text-center">
            <strong className="text-white/80 font-semibold">Important Notice: </strong>
            Information provided on GlobalStudyBoard is for guidance purposes only. Cutoffs,
            fees, rankings, and eligibility criteria change every academic year. Always verify
            all details with the official college or exam websites before making any admission
            decision.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/35 text-xs">
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
                className="text-white/30 text-xs hover:text-white/65 no-underline transition-colors"
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
