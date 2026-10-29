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
  topUniversity: { slug: string; name: string } | null;
  popular: { href: string; label: string; isGuide: boolean; q?: string }[];
}

const SHORTCUT_ICONS = [GraduationCap, FileText, BookOpen, Wallet] as const;

/** The visual is server-rendered and passed as a slot, including its provenance. */
export default function HomeHero({ data, visual }: {
  data: Record<RegionSlug, HomeHeroData>;
  visual?: React.ReactNode;
}) {
  const { effectiveRegion } = useRegion();
  const r = getRegionBySlug(effectiveRegion);
  if (!r) return null;
  const hero = data[r.slug];
  const featured = hero?.topUniversity;
  const queries = hero?.popular ?? [];

  return (
    <section aria-labelledby="home-heading" className="overflow-hidden rounded-3xl border border-stone-200 bg-cream-100 px-4 py-7 sm:px-8 sm:py-10 lg:px-10">
      {/* Mobile: introduction, image, actions. Desktop: balanced columns with a
          prominent 4:3 visual aligned to the heading, never vertically centred. */}
      <div className={visual ? 'grid items-start gap-x-8 gap-y-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr]' : 'grid max-w-4xl gap-y-6'}>
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">{HOME_UI.eyebrow}</p>
          <h1 id="home-heading" className="mb-5 font-display text-3xl font-bold leading-[1.08] tracking-editorial text-ink sm:text-5xl xl:text-6xl">
            {HOME_UI.heading}
            <span className="mt-1 block text-forest-700">{HOME_UI.headingAccent}</span>
          </h1>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-forest-700">
            <RegionFlag slug={r.slug} className="h-4" />
            {HOME_UI.destination} · {r.displayName}
          </p>
          <p className="m-0 max-w-xl text-base leading-relaxed text-stone-700 sm:text-lg">{HOME_UI.introduction}</p>
        </div>

        {visual && <div className="min-w-0 w-full lg:col-start-2 lg:row-start-1 lg:row-span-2">{visual}</div>}

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`/regions/${r.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-6 py-3 font-semibold text-cream-50 no-underline transition-colors hover:bg-forest-800">
              {HOME_UI.explore} {r.proseName}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/ask" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-800 no-underline transition-colors hover:bg-stone-50">
              <Sparkles className="h-4 w-4 text-forest-700" aria-hidden="true" />{HOME_UI.ask}
            </Link>
          </div>
          {featured && (
            <Link href={`/colleges/${featured.slug}`} className="mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed text-stone-700 no-underline hover:text-forest-700">
              <span>{HOME_UI.featured}:</span><span className="font-semibold">{featured.name}</span><ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {HOME_UI.shortcuts.map((item, index) => {
          const Icon = SHORTCUT_ICONS[index];
          return (
            <Link key={item.category} href={`/regions/${r.slug}/${item.category}`} className="group rounded-2xl border border-stone-200 bg-white p-4 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50">
              <div className="mb-2 flex items-center justify-between gap-2 text-forest-700"><Icon className="h-5 w-5" aria-hidden="true" /><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></div>
              <span className="block text-base font-semibold text-ink group-hover:text-forest-800">{item.label}</span>
              <span className="mt-1 hidden text-base leading-relaxed text-stone-600 sm:block">{item.description}</span>
            </Link>
          );
        })}
      </div>

      {queries.length > 0 && (
        <section className="mt-8 border-t border-stone-200 pt-6">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">{HOME_UI.questions}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {queries.map((item) => (
              <Link key={item.label} href={item.isGuide ? item.href : gsbAiHref({ q: item.q })} className="flex items-start gap-2 text-base leading-relaxed text-forest-800 underline-offset-4 hover:underline">
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />{item.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
