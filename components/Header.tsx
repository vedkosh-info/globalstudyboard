import Link from 'next/link';
import MobileMenu from '@/components/MobileMenu';
import RegionSwitcher from '@/components/RegionSwitcher';
import RegionNav from '@/components/RegionNav';
import TopicsMenu, { type TopicsMenuData } from '@/components/TopicsMenu';
import ToolsEntranceLink from '@/components/ToolsEntranceLink';

export default function Header({ topicsMenu }: { topicsMenu: TopicsMenuData }) {
  // Pinned (sticky) only on viewports at least 30rem tall — every phone held
  // upright, every laptop. On a landscape phone or at 400% zoom (320x256) a
  // pinned 81px header would take a third of the screen, so there it scrolls
  // away and the fixed quick-actions dock keeps Tools one tap away. `relative`
  // keeps z-40 working when it is not sticky. It only started pinning at all on
  // 30 Sep 2026: `overflow-x: hidden` on html/body had silently disabled
  // sticky — see styles/globals.css, which also sets the matching
  // scroll-padding-top so focus and #anchors never land under it.
  return (
    <header className="relative z-40 [@media(min-height:30rem)]:sticky top-0 bg-cream-100 border-b border-stone-200 backdrop-blur supports-[backdrop-filter]:bg-cream-100/85">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative flex items-center justify-between gap-2 h-20">

          {/*
            Wordmark — prominent brand, sized so the header row still fits a phone.
            Below sm it is text-lg (~160px), and that size is load-bearing twice
            over. (a) The row is wordmark (shrink-0) + pill + menu (shrink-0), so it
            cannot compress: at 320px a 24px wordmark needed 337px and pushed the
            menu button 1px past the viewport, where the page's horizontal-overflow
            clip hid the evidence. (b) It is what buys the destination name room to appear on a
            phone at all — measured on the live site, the widest name renders 80px at
            390px and 112px at 412px with a 160px wordmark, versus 32px and 56px with
            a 213px one, i.e. unreadable. It steps up at sm and down again at lg
            (back up at xl): at exactly 1024px the row is wordmark + nav with nothing
            to spare, so a 30px wordmark squeezed the destination control until its
            name truncated to "In…". Measure against 320px, 390px and 1024px — at the
            menu button's on-screen RIGHT EDGE, not its width — before growing any of
            these four.
          */}
          <Link href="/" className="flex items-baseline gap-2 no-underline shrink-0" aria-label="GlobalStudyBoard home">
            <span className="font-display text-lg sm:text-3xl lg:text-[26px] xl:text-[34px] font-bold tracking-editorial text-forest-700 leading-none">
              GlobalStudyBoard
            </span>
          </Link>

          <div className="flex min-w-0 items-center gap-2">
            {/* Desktop nav */}
            <nav className="hidden lg:flex shrink-0 items-center gap-0.5 xl:gap-1">
              <RegionNav />
              <TopicsMenu menu={topicsMenu} />
              {/* The tools index — a permanent entrance beside the content sections
                  (owner directive, 30 Sep 2026). Measured at 1024px with the longest
                  destination name: the nav links went from px-2.5 to px-2 below xl to
                  make room. The nav is shrink-0, so it never gives way (without it,
                  flexbox shared the overflow and squeezed the Topics chevron to 0px);
                  the destination pill (min-w-0, built to truncate) absorbs the rest. */}
              <ToolsEntranceLink className="whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium xl:px-3 text-stone-700 no-underline transition-colors hover:bg-forest-50 hover:text-forest-700">
                Tools
              </ToolsEntranceLink>
              <Link
                href="/gsb-ai"
                className="ml-1 inline-flex h-9 items-center whitespace-nowrap text-sm font-semibold bg-forest-700 hover:bg-forest-800 text-cream-50 px-3 rounded-full transition-colors no-underline xl:ml-2 xl:px-4"
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
