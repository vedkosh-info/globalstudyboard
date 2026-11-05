'use client';

import Link from 'next/link';
import { Sparkles, ArrowUpRight, GraduationCap, BookOpen, Wallet, FileText } from 'lucide-react';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { gsbAiHref } from '@/lib/gsb-ai-links';
import { HOME_UI } from '@/lib/home-ui';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';

/** Compact projections only: the full catalogues never enter the home bundle. */
export interface HomeHeroData {
  popular: { href: string; label: string; isGuide: boolean; q?: string }[];
}

const SHORTCUT_ICONS = [GraduationCap, FileText, BookOpen, Wallet] as const;
const SHORTCUT_SURFACES = [
  'bg-forest-50 hover:bg-forest-100',
  'bg-cream-100 hover:bg-cream-200',
  'bg-stone-100 hover:bg-stone-200',
  'bg-terracotta-50 hover:bg-terracotta-100',
] as const;

/** The full-width visual stays server-rendered, including its source disclosure. */
export default function HomeHero({ data, visual }: {
  data: Record<RegionSlug, HomeHeroData>;
  visual?: React.ReactNode;
}) {
  const { effectiveRegion } = useRegion();
  const r = getRegionBySlug(effectiveRegion);
  if (!r) return null;
  const queries = data[r.slug]?.popular ?? [];

  return (
    <div>
      <section aria-labelledby="home-intro-heading">
        {visual}
        <div className={`relative z-[1] rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10 ${visual ? 'mx-3 -mt-8 sm:mx-8 sm:-mt-12 lg:mx-12 lg:-mt-20' : ''}`}>
          <div className="grid items-center gap-7 lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0">
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">
                <RegionFlag slug={r.slug} className="h-4" />
                {HOME_UI.destination} · {r.displayName}
              </p>
              <h2 id="home-intro-heading" className="mb-4 max-w-sm font-display text-3xl font-semibold leading-tight tracking-editorial text-ink sm:text-4xl">{HOME_UI.panelHeading}</h2>
              <p className="m-0 max-w-md text-base leading-relaxed text-stone-600">{HOME_UI.introduction}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/regions/${r.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-5 py-3 text-base font-semibold text-cream-50 no-underline transition-colors hover:bg-forest-800">
                  {HOME_UI.explore} {r.proseName}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </Link>
                <Link href={gsbAiHref({ region: r.slug })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-base font-semibold text-forest-800 no-underline transition-colors hover:bg-forest-50">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />{HOME_UI.ask}
                </Link>
              </div>
            </div>
            <nav aria-label={HOME_UI.shortcutsLabel} className="grid min-w-0 grid-cols-2 gap-3">
              {HOME_UI.shortcuts.map((item, index) => {
                const Icon = SHORTCUT_ICONS[index];
                return (
                  <Link key={item.category} href={`/regions/${r.slug}/${item.category}`} className={`group min-w-0 rounded-2xl p-4 no-underline transition-colors sm:p-5 ${SHORTCUT_SURFACES[index]}`}>
                    <div className="mb-3 flex items-center justify-between gap-2 text-forest-700">
                      <Icon className="h-5 w-5" aria-hidden="true" /><ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="block font-display text-lg font-semibold leading-snug text-ink sm:text-xl">{item.label}</span>
                    <span className="mt-2 hidden text-base leading-relaxed text-stone-600 sm:block">{item.description}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      {queries.length > 0 && (
        <section aria-labelledby="home-guides-heading" className="mt-10 sm:mt-12">
          <h2 id="home-guides-heading" className="mb-3 font-display text-2xl font-semibold tracking-editorial text-ink">{HOME_UI.questions}</h2>
          <div className="grid gap-x-10 sm:grid-cols-2">
            {queries.map((item) => (
              <Link key={item.label} href={item.isGuide ? item.href : gsbAiHref({ q: item.q, region: r.slug })} className="flex min-h-16 items-center justify-between gap-4 border-b border-stone-200 py-4 text-base leading-relaxed text-stone-700 no-underline transition-colors hover:text-forest-700">
                <span>{item.label}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-forest-700" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
