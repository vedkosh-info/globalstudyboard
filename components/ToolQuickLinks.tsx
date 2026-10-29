'use client';

import { usePathname } from 'next/navigation';
import { Award, ClipboardList, Coins, Columns3, GraduationCap, type LucideIcon } from 'lucide-react';
import ToolLink from '@/components/tools/ToolLink';
import { useRegion } from '@/components/RegionProvider';
import { toolPageHref } from '@/lib/tool-hint';

/** Same symbols as the tools index (app/tools/page.tsx). */
const LINKS: { slug: string; label: string; icon: LucideIcon }[] = [
  { slug: 'application-planner', label: 'Application Planner', icon: ClipboardList },
  { slug: 'cost-planner', label: 'Cost & Funding Planner', icon: Coins },
  { slug: 'compare-universities', label: 'Compare Universities', icon: Columns3 },
  { slug: 'test-score-tracker', label: 'Test Score Tracker', icon: Award },
  { slug: 'scholarship-tracker', label: 'Scholarship Tracker', icon: GraduationCap },
];

/**
 * Short entrances under the search box. Names match the tool pages. A page
 * that belongs to one destination hands that destination on, the same way the
 * Tools link in the header does.
 */
export default function ToolQuickLinks() {
  const pathname = usePathname();
  const { pageRegion } = useRegion();
  if (pathname === '/search') return null;

  return (
    <nav aria-label="Application tools" className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 sm:flex-wrap sm:overflow-visible">
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <ToolLink
            key={link.slug}
            href={toolPageHref(link.slug, pageRegion)}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-stone-200 bg-white px-3 text-[13px] font-medium leading-none text-forest-800 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-forest-700" aria-hidden="true" />
            {link.label}
          </ToolLink>
        );
      })}
    </nav>
  );
}
