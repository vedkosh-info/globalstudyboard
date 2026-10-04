import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { pageMetadata } from '@/lib/seo';
import { getToolBySlug, toolHref } from '@/lib/tools';

/**
 * Old address of the scores PDF. The download now sits on the tracker itself,
 * so this only sends the student there.
 */
const tool = getToolBySlug('test-score-tracker')!;
const PATH = '/tools/test-score-tracker/report';

export const metadata: Metadata = pageMetadata({
  title: `${tool.name} — PDF`,
  description: 'The PDF of your test scores is downloaded on the tracker page.',
  path: PATH,
  robots: { index: false, follow: false },
});

export default function ScoreReportPage() {
  redirect(toolHref(tool.slug));
}
