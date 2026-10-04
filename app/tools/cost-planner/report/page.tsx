import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { getToolBySlug, toolHref } from '@/lib/tools';

/**
 * Old address of the budget PDF. The download now sits on the cost planner.
 * `?budget=` still selects that budget when it belongs to the destination on screen.
 */
const tool = getToolBySlug('cost-planner')!;
const PATH = '/tools/cost-planner/report';

export const metadata: Metadata = pageMetadata({
  title: `${tool.name} — PDF`,
  description: 'The PDF of your budget is downloaded on the cost planner page.',
  path: PATH,
  robots: { index: false, follow: false },
});

export default async function BudgetReportPage({ searchParams }: { searchParams: Promise<{ budget?: string }> }) {
  const sp = await searchParams;
  const q = sp.budget ? `?budget=${encodeURIComponent(sp.budget)}` : '';
  redirect(`${toolHref(tool.slug)}${q}`);
}
