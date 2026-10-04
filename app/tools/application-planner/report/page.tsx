import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { getToolBySlug, toolHref } from '@/lib/tools';

/**
 * Old address of the planner PDF. The download now sits on the planner itself,
 * so this only sends the student there.
 */
const tool = getToolBySlug('application-planner')!;
const PATH = '/tools/application-planner/report';

export const metadata: Metadata = pageMetadata({
  title: `${tool.name} — PDF`,
  description: 'The PDF of your application plan is downloaded on the planner page.',
  path: PATH,
  robots: { index: false, follow: false },
});

export default function PlannerReportPage() {
  redirect(toolHref(tool.slug));
}
