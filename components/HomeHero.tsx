'use client';

import Link from 'next/link';
import { Sparkles, ArrowUpRight, GraduationCap, Calendar, Wallet, Plane } from 'lucide-react';

import { REGION_TAGLINES, getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { gsbAiHref } from '@/lib/gsb-ai-links';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';

/**
 * Per-destination hero data, computed on the server in app/page.tsx so the
 * college and guide catalogues never ship in the home page's client chunk.
 */
export interface HomeHeroData {
  topUniversity: { name: string; qsRank?: number } | null;
  /** Flagship questions — a real guide link when one answers it, else a GSB AI prefill. */
  popular: { href: string; label: string; isGuide: boolean; q?: string }[];
}

function Backdrop() {
  return (
    <>
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-24 w-72 h-72 rounded-full bg-forest-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-16 w-72 h-72 rounded-full bg-terracotta-100 blur-3xl"
      />
    </>
  );
}

/**
 * `visual` is a server-rendered slot (e.g. <ContentImage />) passed in from app/page.tsx.
 * It stays a server component even though this file is 'use client' — React serialises
 * only the rendered output, so the image registry never reaches the browser.
 */
export default function HomeHero({
  data,
  visual,
}: {
  data: Record<RegionSlug, HomeHeroData>;
  visual?: React.ReactNode;
}) {
  const { effectiveRegion } = useRegion();
  const r = getRegionBySlug(effectiveRegion);
  if (!r) return null;

  // Personalised facts for the current destination (India by default until the
  // student picks another from the header destination control).
  const hero = data[r.slug];
  const topUniversity = hero?.topUniversity ?? null;
  const queries = hero?.popular ?? [];

  const tuition = r.averageTuitionRangeUsd
    ? `$${r.averageTuitionRangeUsd.undergrad[0].toLocaleString('en-US')}–$${r.averageTuitionRangeUsd.undergrad[1].toLocaleString('en-US')}/yr`
    : '—';

  return (
    <section className="relative overflow-hidden rounded-3xl bg-cream-100 border border-stone-200 px-6 sm:px-12 py-12 md:py-16">
      <Backdrop />
      {/*
        Three slots. DOM order = mobile order: headline → visual → the rest, so on a
        phone the image sits right under the lede instead of two screens down past
        the CTAs and chips. On lg the visual is placed explicitly into column 2
        spanning both rows, and both text slots stack in column 1.
      */}
      <div
        className={
          visual
            ? 'relative grid gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:grid-rows-[auto_1fr]'
            : 'relative grid gap-y-8 max-w-4xl'
        }
      >
        <div className="max-w-4xl lg:col-start-1 lg:row-start-1">
        {/*
          The H1 is destination-NEUTRAL on purpose: a crawler has no cookie, so a
          region-tuned H1 made the crawlable home page "Your route to studying in
          India" on a site whose voice is global. The tuned destination is the
          eyebrow + the facts below, which re-tune on the client.
        */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-editorial text-ink mb-5">
          Universities, entrance exams{' '}
          <br />
          <span className="text-forest-700">&amp; scholarships — for every study destination.</span>
        </h1>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-forest-700 mb-3 flex items-center gap-2">
          <RegionFlag slug={r.slug} className="h-4" />
          Tuned to · {r.displayName}
        </p>
        <p className="text-stone-700 text-lg max-w-2xl leading-relaxed">
          {REGION_TAGLINES[r.slug]} Everything below — universities, exams, costs and visas — is
          set to {r.proseName}. Change it anytime from the top.
        </p>
        </div>

        {visual && (
          <div className="w-full lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center lg:justify-self-end">
            {visual}
          </div>
        )}

        <div className="max-w-4xl lg:col-start-1 lg:row-start-2">
        {/* Quick facts for the chosen region */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Fact icon={<GraduationCap className="w-4 h-4" />} label="Apply via" value={r.primaryApplicationPlatform} />
          <Fact icon={<Calendar className="w-4 h-4" />} label="Main intake" value={r.intakes[0]} />
          <Fact icon={<Wallet className="w-4 h-4" />} label="Tuition" value={tuition} />
          <Fact icon={<Plane className="w-4 h-4" />} label="Student visa" value={r.visaName ?? 'N/A'} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-9">
          <Link
            href={`/regions/${r.slug}`}
            className="inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold px-6 py-3.5 rounded-full no-underline transition-colors"
          >
            Explore {r.proseName}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            href="/gsb-ai"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-semibold px-6 py-3.5 rounded-full no-underline transition-colors border border-stone-300"
          >
            <Sparkles className="w-4 h-4 text-forest-700" />
            Ask GSB AI
          </Link>
        </div>

        {topUniversity && (
          <Link
            href={`/regions/${r.slug}/universities`}
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-forest-700 no-underline mb-9"
          >
            <span className="font-medium">Featured:</span> {topUniversity.name}
            {topUniversity.qsRank ? ` · QS #${topUniversity.qsRank}` : ''}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}

        {queries.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-stone-500 mb-3">
              Questions students heading to {r.proseName} ask
            </p>
            <div className="flex flex-wrap gap-2">
              {queries.map((item) => (
                <Link
                  key={item.label}
                  href={item.isGuide ? item.href : gsbAiHref({ q: item.q })}
                  className="bg-white hover:bg-forest-50 hover:border-forest-300 hover:text-forest-700 text-stone-700 text-sm px-3.5 py-1.5 rounded-full no-underline transition-colors border border-stone-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/70 border border-stone-200 rounded-xl px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-forest-700 mb-1">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {label}
        </span>
      </div>
      {/* No line-clamp: a key fact that ends in "…" is worse than a card an extra
          line taller — India's student-visa value ("N/A (domestic) / Student Visa
          for international applicants") was cut mid-phrase on the default view.
          Grid items stretch to the tallest in the row, so the row stays even. */}
      <p className="text-sm font-semibold text-ink leading-snug">{value}</p>
    </div>
  );
}
