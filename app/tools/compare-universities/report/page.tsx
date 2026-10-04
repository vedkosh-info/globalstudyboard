import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { getToolBySlug, toolHref } from '@/lib/tools';

/**
 * Old address of the comparison PDF. The download now sits on the comparison
 * tool. `?set=` still selects that comparison when it belongs to the destination on screen.
 */
const tool = getToolBySlug('compare-universities')!;
const PATH = '/tools/compare-universities/report';

export const metadata: Metadata = pageMetadata({
  title: `${tool.name} — PDF`,
  description: 'The PDF of your comparison is downloaded on the comparison page.',
  path: PATH,
  robots: { index: false, follow: false },
});

export default async function CompareReportPage({ searchParams }: { searchParams: Promise<{ set?: string }> }) {
  const sp = await searchParams;
  const q = sp.set ? `?set=${encodeURIComponent(sp.set)}` : '';
  redirect(`${toolHref(tool.slug)}${q}`);
}
