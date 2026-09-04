import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';
import RegionSwitcher from '@/components/RegionSwitcher';
import RegionNav from '@/components/RegionNav';
import TopicsMenu, { type TopicsMenuData } from '@/components/TopicsMenu';

export default function Header({ topicsMenu }: { topicsMenu: TopicsMenuData }) {
  return (
    <header className="sticky top-0 z-40 bg-cream-100 border-b border-stone-200 backdrop-blur supports-[backdrop-filter]:bg-cream-100/85">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative flex items-center justify-between gap-2 h-20">

          {/*
            Wordmark — large, prominent brand on every page. It steps DOWN at lg
            and back up at xl on purpose: at exactly 1024px the row is
            wordmark + nav with nothing to spare, so a 30px wordmark squeezed the
            destination control until its name truncated to "In…". Measure against
            1024px before growing any of these three.
          */}
          <Link href="/" className="flex items-baseline gap-2 no-underline shrink-0" aria-label="GlobalStudyBoard home">
            <span className="font-display text-2xl sm:text-3xl lg:text-[26px] xl:text-[34px] font-bold tracking-editorial text-forest-700 leading-none">
              GlobalStudyBoard
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <RegionNav />
              <TopicsMenu menu={topicsMenu} />
              <Link
                href="/gsb-ai"
                className="ml-2 inline-flex h-9 items-center whitespace-nowrap text-sm font-semibold bg-forest-700 hover:bg-forest-800 text-cream-50 px-4 rounded-full transition-colors no-underline"
              >
                Ask GSB AI
              </Link>
            </nav>

            {/*
              The destination control sits OUTSIDE the desktop nav so it is
              rendered exactly ONCE for every viewport — it used to appear twice
              in the DOM (once in the nav, once in the mobile cluster), which
              duplicated the control for assistive tech and meant the two copies
              could drift apart. One instance, always visible, right-most.
            */}
            <RegionSwitcher />
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
