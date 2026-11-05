import type { Metadata } from 'next';
import Link from 'next/link';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import LastUpdated from '@/components/LastUpdated';
import { pageMetadata, PUBLISHER_LD, SITE_URL } from '@/lib/seo';
import { getToolBySlug } from '@/lib/tools';
import ApplicationCheckGate from './ApplicationCheckGate';

const path = '/tools/application-check';

export function generateMetadata(): Metadata {
  return pageMetadata({ title: 'Application Check', description: getToolBySlug('application-check')!.tagline, path, descriptionMax: 160 });
}

export default function ApplicationCheckPage() {
  const tool = getToolBySlug('application-check')!;
  return (
    <div className="mx-auto max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebApplication', name: tool.name, description: tool.tagline,
        url: SITE_URL + path, applicationCategory: 'EducationalApplication', operatingSystem: 'Web',
        isAccessibleForFree: true, publisher: PUBLISHER_LD,
      }) }} />
      <BreadcrumbsView crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: tool.name }]} />
      <header className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">Application tools</p>
        <h1 className="m-0 font-display text-4xl font-bold tracking-editorial text-ink sm:text-5xl">Application Check</h1>
        <p className="mb-0 mt-4 text-lg leading-relaxed text-stone-700">
          {tool.tagline}
        </p>
      </header>
      <section aria-label="Check a programme" className="mt-7"><ApplicationCheckGate /></section>
      <footer className="mt-10 border-t border-stone-200 pt-5">
        <p className="m-0 max-w-2xl text-sm leading-relaxed text-stone-700">
          Each check covers selected requirements for a particular programme. Confirm the full list for your intake with the university.
          Your answers stay in this tab. Only steps you add to the planner are saved to your account.
        </p>
        <nav aria-label="Related tools and information" className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-forest-700 underline underline-offset-2">
          <Link href="/tools/application-planner">Application Planner</Link>
          <Link href="/tools/test-score-tracker">Test Score Tracker</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
        <LastUpdated date="2026-11-05" className="mt-5" />
      </footer>
    </div>
  );
}
