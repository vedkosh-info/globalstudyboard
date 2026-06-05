'use client';

import Link from 'next/link';
import { Sparkles, ArrowUpRight, GraduationCap, Calendar, Wallet, Plane, MapPin } from 'lucide-react';

import { REGION_TAGLINES, getRegionBySlug } from '@/lib/regions';
import { COLLEGES } from '@/lib/colleges';
import { useRegion } from '@/components/RegionProvider';

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

export default function HomeHero() {
  const { region, ready } = useRegion();
  const r = region ? getRegionBySlug(region) : undefined;

  // Until hydration completes, render the neutral hero so SSR/CSR match.
  if (!ready || !r) {
    return (
      <section className="relative overflow-hidden rounded-3xl bg-cream-100 border border-stone-200 px-6 sm:px-12 py-14 md:py-20">
        <Backdrop />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-4">
            Worldwide · Independent · Up-to-date
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-editorial text-ink mb-6">
            Find the right university,
            <br />
            <span className="text-forest-700">wherever you want to study.</span>
          </h1>
          <p className="text-stone-700 text-lg max-w-2xl leading-relaxed mb-8">
            Tell us where you want to study and we&apos;ll tailor the whole site to it —
            universities, entrance exams, application platforms, costs and visas for your
            destination.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#destinations"
              className="inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold px-6 py-3.5 rounded-full no-underline transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Choose your destination
            </a>
            <Link
              href="/gsb-ai"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-semibold px-6 py-3.5 rounded-full no-underline transition-colors border border-stone-300"
            >
              <Sparkles className="w-4 h-4 text-forest-700" />
              Ask GSB AI a question
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Personalised hero for the chosen destination.
  const topUniversity = [...COLLEGES.filter((c) => c.region === r.slug)].sort(
    (a, b) => (a.ranking?.qs ?? 9999) - (b.ranking?.qs ?? 9999)
  )[0];

  const queries = (r.popularQueries.length ? r.popularQueries : []).slice(0, 4);

  const tuition = r.averageTuitionRangeUsd
    ? `$${r.averageTuitionRangeUsd.undergrad[0].toLocaleString()}–$${r.averageTuitionRangeUsd.undergrad[1].toLocaleString()}/yr`
    : '—';

  return (
    <section className="relative overflow-hidden rounded-3xl bg-cream-100 border border-stone-200 px-6 sm:px-12 py-12 md:py-16">
      <Backdrop />
      <div className="relative max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-forest-700 mb-4 flex items-center gap-2">
          <span aria-hidden="true" className="text-lg leading-none">
            {r.flag}
          </span>
          Your destination · {r.displayName}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-editorial text-ink mb-5">
          Your route to studying
          <br />
          <span className="text-forest-700">in {r.displayName}.</span>
        </h1>
        <p className="text-stone-700 text-lg max-w-2xl leading-relaxed mb-8">
          {REGION_TAGLINES[r.slug]} Everything below — universities, exams, costs and visas — is
          set to {r.displayName}. Change it anytime from the top.
        </p>

        {/* Quick facts for the chosen region */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Fact icon={<GraduationCap className="w-4 h-4" />} label="Apply via" value={r.primaryApplicationPlatform.split('/')[0].split('(')[0].trim()} />
          <Fact icon={<Calendar className="w-4 h-4" />} label="Main intake" value={r.intakes[0]} />
          <Fact icon={<Wallet className="w-4 h-4" />} label="Tuition" value={tuition} />
          <Fact icon={<Plane className="w-4 h-4" />} label="Student visa" value={r.visaName ?? 'N/A'} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-9">
          <Link
            href={`/regions/${r.slug}`}
            className="inline-flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold px-6 py-3.5 rounded-full no-underline transition-colors"
          >
            Explore {r.displayName}
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
            href={`/regions/${r.slug}`}
            className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-forest-700 no-underline mb-9"
          >
            <span className="font-medium">Featured:</span> {topUniversity.nameEn}
            {topUniversity.ranking?.qs ? ` · QS #${topUniversity.ranking.qs}` : ''}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}

        {queries.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] uppercase text-stone-500 mb-3">
              Questions students in {r.displayName} ask
            </p>
            <div className="flex flex-wrap gap-2">
              {queries.map((q) => (
                <Link
                  key={q}
                  href={`/gsb-ai?q=${encodeURIComponent(q)}`}
                  className="bg-white hover:bg-forest-50 hover:border-forest-300 hover:text-forest-700 text-stone-700 text-sm px-3.5 py-1.5 rounded-full no-underline transition-colors border border-stone-200"
                >
                  {q.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        )}
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
      <p className="text-sm font-semibold text-ink leading-snug line-clamp-2">{value}</p>
    </div>
  );
}
