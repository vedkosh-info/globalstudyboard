import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';

const NAV_LINKS = [
  { label: 'Indian Colleges', href: '/colleges/india', highlight: false },
  { label: 'Study Abroad', href: '/colleges/abroad', highlight: false },
  { label: 'Entrance Exams', href: '/exams', highlight: false },
  { label: 'Admission Guides', href: '/guides', highlight: false },
  { label: 'GSB AI', href: '/gsb-ai', highlight: true },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-brand-600 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
            <span className="text-gold-400 text-xl md:text-2xl font-bold font-display tracking-tight">
              GlobalStudyBoard
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.highlight
                    ? 'text-sm font-semibold bg-gold-500 hover:bg-gold-400 text-brand-900 px-3 py-1.5 rounded-md transition-colors no-underline'
                    : 'text-sm font-medium text-white/90 hover:text-gold-300 hover:bg-brand-500 px-3 py-2 rounded-md transition-colors no-underline'
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language switcher — desktop only */}
          <div className="hidden md:flex items-center">
            <Link
              href="/hi"
              className="text-xs text-white/50 hover:text-gold-300 px-3 py-2 rounded-md no-underline transition-colors"
            >
              हिन्दी
            </Link>
          </div>

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
