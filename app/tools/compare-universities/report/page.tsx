import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getToolBySlug, toolHref } from '@/lib/tools';
import { pageMetadata } from '@/lib/seo';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { ToolSkeleton } from '@/components/tools/ToolStates';
import ReportGate from './ReportGate';

/**
 * /tools/compare-universities/report — the printable report + one-tap PDF of
 * one comparison (?set=<id>, or the destination's most recent). A static,
 * noindex shell (an account-only page with no public content, like /account):
 * no server cookie reads; the report chunk — and with it the Supabase SDK and,
 * on the first download, jsPDF — loads only for a signed-in visitor. The fact
 * sheets arrive through the tool's static ./catalogue route, never the page.
 */
const tool = getToolBySlug('compare-universities')!;
const PATH = '/tools/compare-universities/report';

export const metadata: Metadata = pageMetadata({
  title: `${tool.name} — printable comparison report and PDF`,
  description: 'A printable report and a one-tap PDF of your university comparison — verified facts on top, your own scores underneath, built in your browser.',
  path: PATH,
  robots: { index: false, follow: false },
});

export default function CompareReportPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <BreadcrumbsView crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: tool.name, href: toolHref(tool.slug) }, { label: 'Report' }]} />
      <header className="max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">Tool · Report</p>
        <h1 className="font-display text-4xl font-bold tracking-editorial text-ink sm:text-5xl">Your comparison, as a report</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">
          The universities you compared, side by side: the facts each profile publishes (rankings attributed to their bodies,
          location, tests, platform, levels, language) and then the criteria, weights and scores you gave them, with the
          arithmetic in full — laid out to print or to save as a PDF. It is built in your browser from your own entries;
          nothing is sent to us, and it never includes your e-mail address.
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
