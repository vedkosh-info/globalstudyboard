import type { Metadata } from 'next';
import Link from 'next/link';
import { BookmarkPlus, CheckCheck, Wallet } from 'lucide-react';
import { getToolBySlug, toolHref } from '@/lib/tools';
import { pageMetadata, PUBLISHER_LD, SITE_URL } from '@/lib/seo';
import { SCHOLARSHIP_UI as UI } from '@/lib/scholarship-ui';
import { SITE_REVIEWED } from '@/lib/site-meta';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import LastUpdated from '@/components/LastUpdated';
import ScholarshipGate from './ScholarshipGate';

const PATH = '/tools/scholarship-tracker';
export function generateMetadata(): Metadata {
  return pageMetadata({ title: UI.title, description: getToolBySlug('scholarship-tracker')!.tagline, path: PATH, descriptionMax: 160 });
}

export default function ScholarshipTrackerPage() {
  const tool = getToolBySlug('scholarship-tracker')!;
  const icons = [BookmarkPlus, CheckCheck, Wallet];
  return (
    <div className="mx-auto max-w-6xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: UI.title, url: `${SITE_URL}${PATH}`, description: tool.tagline, applicationCategory: 'EducationalApplication', operatingSystem: 'Web', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: PUBLISHER_LD }) }} />
      <BreadcrumbsView crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: tool.name }]} />
      <header className="max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">{UI.eyebrow}</p>
        <h1 className="font-display text-4xl font-bold tracking-editorial text-ink sm:text-5xl">{UI.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">{UI.intro}</p>
      </header>
      <section className="mt-8" aria-label={UI.title}><ScholarshipGate /></section>
      <section className="mt-12" aria-labelledby="scholarship-about">
        <h2 id="scholarship-about" className="font-display text-2xl font-bold tracking-editorial text-ink">{UI.aboutTitle}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {UI.features.map((feature, i) => { const Icon = icons[i]; return <div key={feature.title} className="rounded-2xl border border-stone-200 bg-white p-5"><Icon className="h-5 w-5 text-forest-700" aria-hidden="true" /><h3 className="mt-3 text-lg font-semibold text-ink">{feature.title}</h3><p className="mt-2 text-base leading-relaxed text-stone-700">{feature.text}</p></div>; })}
        </div>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-stone-700">{UI.trustText}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-stone-600">{UI.privacyText} <Link href="/privacy" className="text-forest-700 underline">{UI.privacy}</Link></p>
      </section>
      <section className="mt-10" aria-labelledby="scholarship-related">
        <h2 id="scholarship-related" className="font-display text-xl font-bold text-ink">{UI.related}</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-base"><Link href={toolHref('application-planner')} className="text-forest-700 underline">{UI.planner}</Link><Link href={toolHref('cost-planner')} className="text-forest-700 underline">{UI.budgetLink}</Link><Link href="/scholarships" className="text-forest-700 underline">{UI.scholarships}</Link></div>
      </section>
      <LastUpdated date={SITE_REVIEWED} className="mt-8" />
    </div>
  );
}
