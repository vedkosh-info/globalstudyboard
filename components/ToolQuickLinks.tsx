'use client';

import { usePathname } from 'next/navigation';
import { Award, ClipboardList, Coins, Columns3, GraduationCap, ListChecks, type LucideIcon } from 'lucide-react';
import ToolLink from '@/components/tools/ToolLink';
import { useRegion } from '@/components/RegionProvider';
import { toolPageHref } from '@/lib/tool-hint';

/** Same symbols as the tools index (app/tools/page.tsx). */
const LINKS: { slug: string; label: string; icon: LucideIcon }[] = [
  { slug: 'application-check', label: 'Application Check', icon: ListChecks },
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
export default function ToolQuickLinks({ appearance = 'default' }: { appearance?: 'default' | 'home' }) {
  const pathname = usePathname();
  const { pageRegion } = useRegion();
  if (pathname === '/search') return null;

  return (
    <nav aria-label="Application tools" className={`flex overflow-x-auto overscroll-x-contain pb-1 sm:flex-wrap sm:overflow-visible ${appearance === 'home' ? 'gap-2' : 'gap-1.5'}`}>
      {LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <ToolLink
            key={link.slug}
            href={toolPageHref(link.slug, pageRegion)}
            className={`inline-flex shrink-0 items-center whitespace-nowrap border border-stone-200 bg-white font-medium leading-none text-forest-800 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1 ${appearance === 'home' ? 'min-h-12 gap-2 rounded-xl px-4 text-sm' : 'min-h-9 gap-1.5 rounded-full px-3 text-[13px]'}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-forest-700" aria-hidden="true" />
            {link.label}
          </ToolLink>
        );
      })}
    </nav>
  );
}
