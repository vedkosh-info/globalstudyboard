import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getToolBySlug, toolHref } from '@/lib/tools';
import { pageMetadata } from '@/lib/seo';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { ToolSkeleton } from '@/components/tools/ToolStates';
import ReportGate from './ReportGate';

/**
 * /tools/test-score-tracker/report — the printable report + one-tap PDF of
 * the student's recorded scores and the readiness view for the destination
 * chosen in the header. A static, noindex shell (an account-only page with no
 * public content, like /account): no server cookie reads; the report chunk —
 * and with it the Supabase SDK and, on the first download, jsPDF — loads only
 * for a signed-in visitor. The exam list and each university's test list
 * arrive through the tool's static ./catalogue route, never the page.
 */
const tool = getToolBySlug('test-score-tracker')!;
const PATH = '/tools/test-score-tracker/report';

export const metadata: Metadata = pageMetadata({
  title: `${tool.name} — printable score report and PDF`,
  description: 'A printable report and PDF of your recorded test scores, the validity rule each test body publishes (if any), and which listed tests have no score yet.',
  path: PATH,
  robots: { index: false, follow: false },
});

export default function ScoreReportPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <BreadcrumbsView crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: tool.name, href: toolHref(tool.slug) }, { label: 'Report' }]} />
      <header className="max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">Tool · Report</p>
        <h1 className="font-display text-4xl font-bold tracking-editorial text-ink sm:text-5xl">Your test scores, as a report</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">
          Every attempt you recorded — the score as you received it, its sections and test date — next to the validity rule
          each test body publishes (or a note where it publishes none), and then, for the destination chosen in the header,
          which of the tests our profiles of your shortlisted universities name already have a score on record. Laid out to print or to save
          as a PDF; built in your browser from your own entries. Nothing is sent to us, and it never includes your e-mail
          address.
        </p>
      </header>
      <section className="mt-8" aria-label="Your report">
        <Suspense fallback={<ToolSkeleton label="Loading your report…" />}>
          <ReportGate />
        </Suspense>
      </section>
    </div>
  );
}
