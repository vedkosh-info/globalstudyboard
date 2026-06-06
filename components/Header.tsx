import Link from 'next/link';
import { Home } from 'lucide-react';
import MobileMenu from '@/components/MobileMenu';
import RegionSwitcher from '@/components/RegionSwitcher';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Universities', href: '/regions' },
  { label: 'Exams', href: '/exams' },
  { label: 'Scholarships', href: '/scholarships' },
  { label: 'Guides', href: '/guides' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-cream-100 border-b border-stone-200 backdrop-blur supports-[backdrop-filter]:bg-cream-100/85">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative flex items-center justify-between h-16">

          {/* Wordmark */}
          <Link href="/" className="flex items-baseline gap-2 no-underline shrink-0">
            <span className="font-display text-xl sm:text-2xl md:text-[26px] font-bold tracking-editorial text-forest-700">
              GlobalStudyBoard
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-forest-700 px-3 py-2 rounded-md hover:bg-forest-50 transition-colors no-underline"
              >
                {link.href === '/' && <Home className="w-4 h-4" aria-hidden="true" />}
                {link.label}
              </Link>
            ))}
            <Link
              href="/gsb-ai"
              className="ml-2 text-sm font-semibold bg-forest-700 hover:bg-forest-800 text-cream-50 px-4 py-1.5 rounded-full transition-colors no-underline"
            >
              Ask GSB AI
            </Link>
            <div className="ml-2">
              <RegionSwitcher />
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <RegionSwitcher />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
