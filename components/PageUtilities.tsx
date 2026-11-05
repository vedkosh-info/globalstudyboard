'use client';

import { useSelectedLayoutSegments } from 'next/navigation';
import SiteSearch from '@/components/SiteSearch';
import ToolQuickLinks from '@/components/ToolQuickLinks';
import Breadcrumbs from '@/components/Breadcrumbs';
import { HOME_UI } from '@/lib/home-ui';

/** Keep the same search in the shared layout; home gives it an editorial masthead. */
export default function PageUtilities() {
  const segments = useSelectedLayoutSegments();
  if (segments.length === 0) {
    return (
      <header data-gsb-home className="mx-auto max-w-4xl pb-8 pt-1 text-center sm:pb-10 sm:pt-4 lg:pb-12 lg:pt-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-forest-700 sm:text-xs">{HOME_UI.eyebrow}</p>
        <h1 id="home-heading" className="m-0 font-display text-4xl font-semibold leading-[1.08] tracking-editorial text-ink sm:text-5xl lg:text-6xl">
          {HOME_UI.heading}
          <span className="block font-normal italic text-forest-700">{HOME_UI.headingAccent}</span>
        </h1>
        <p className="mx-auto mb-0 mt-4 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">{HOME_UI.mastheadDescription}</p>
        <div className="mx-auto mt-6 max-w-2xl sm:mt-7">
          <SiteSearch appearance="home" />
        </div>
      </header>
    );
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="space-y-2">
        <SiteSearch />
        <ToolQuickLinks />
      </div>
      <Breadcrumbs />
    </div>
  );
}
