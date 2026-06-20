import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';
import RegionSwitcher from '@/components/RegionSwitcher';
import RegionNav from '@/components/RegionNav';
import TopicsMenu from '@/components/TopicsMenu';

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
          <nav className="hidden lg:flex items-center gap-1">
            <RegionNav />
            <TopicsMenu />
            <Link
              href="/gsb-ai"
              className="ml-2 inline-flex h-9 items-center whitespace-nowrap text-sm font-semibold bg-forest-700 hover:bg-forest-800 text-cream-50 px-4 rounded-full transition-colors no-underline"
            >
              Ask GSB AI
            </Link>
            <div className="ml-2">
              <RegionSwitcher />
            </div>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <RegionSwitcher />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
