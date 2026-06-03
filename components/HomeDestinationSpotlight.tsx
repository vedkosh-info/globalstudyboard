'use client';

import Link from 'next/link';
import { ArrowUpRight, GraduationCap, Wallet, Plane, Calendar, BookMarked } from 'lucide-react';

import { getRegionBySlug } from '@/lib/regions';
import { COLLEGES } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { useRegion } from '@/components/RegionProvider';

/**
 * Home-page spotlight that turns the chosen destination into a clean, focused
 * country guide: the top universities, the exams that gate them, and the
 * headline facts — all for the one place the student picked. Renders nothing
 * until a destination is chosen, so first-time visitors still see the full
 * discovery layout.
 */
export default function HomeDestinationSpotlight() {
  const { region, ready } = useRegion();
  if (!ready || !region) return null;

  const r = getRegionBySlug(region);
  if (!r) return null;

  const universities = [...COLLEGES.filter((c) => c.region === r.slug)]
    .sort((a, b) => (a.ranking?.qs ?? 9999) - (b.ranking?.qs ?? 9999))
    .slice(0, 4);

  const exams = r.keyExamSlugs
    .map((slug) => ENTRANCE_EXAMS.find((e) => e.slug === slug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .slice(0, 4);

  const tuition = r.averageTuitionRangeUsd
    ? `$${r.averageTuitionRangeUsd.undergrad[0].toLocaleString()}–$${r.averageTuitionRangeUsd.undergrad[1].toLocaleString()}/yr`
    : '—';

  const facts = [
    { icon: <GraduationCap className="h-4 w-4" />, label: 'Apply via', value: r.primaryApplicationPlatform.split('/')[0].split('(')[0].trim() },
    { icon: <Calendar className="h-4 w-4" />, label: 'Main intake', value: r.intakes[0] },
    { icon: <Wallet className="h-4 w-4" />, label: 'Tuition', value: tuition },
    { icon: <Plane className="h-4 w-4" />, label: 'Student visa', value: r.visaName ?? 'N/A' },
  ];

  return (
    <section
      aria-label={`Your guide to studying in ${r.displayName}`}
      className="relative overflow-hidden rounded-3xl border border-forest-200/70 bg-gradient-to-br from-cream-50 via-white to-forest-50/60 p-6 sm:p-8"
    >
      {/* Futuristic glow accents */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-forest-200/30 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-terracotta-100/40 blur-3xl" />

      <div className="relative">
        {/* Heading */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-forest-700">
              <span aria-hidden="true" className="text-base leading-none">{r.flag}</span>
              Your destination
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-editorial text-ink md:text-4xl">
              Studying in {r.displayName}, made clear.
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-stone-600">
              {r.educationSystemSummary.split('. ')[0]}.
            </p>
          </div>
          <Link
            href={`/regions/${r.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-semibold text-cream-50 no-underline transition-colors hover:bg-forest-800"
          >
            Full {r.displayName} guide
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Facts */}
        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="rounded-2xl border border-stone-200/80 bg-white/70 px-4 py-3 backdrop-blur">
              <div className="mb-1 flex items-center gap-1.5 text-forest-700">
                {f.icon}
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  {f.label}
                </span>
              </div>
              <p className="m-0 line-clamp-2 text-sm font-semibold leading-snug text-ink">{f.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top universities */}
          {universities.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Top universities
                </h3>
                <Link
                  href={`/regions/${r.slug}`}
                  className="text-xs font-medium text-forest-700 no-underline hover:text-forest-800"
                >
                  See all
                </Link>
              </div>
              <ul className="m-0 list-none space-y-2 p-0">
                {universities.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/regions/${r.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white/80 px-4 py-3 no-underline transition-colors hover:border-forest-300"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink group-hover:text-forest-700">
                          {c.nameEn}
                        </span>
                        <span className="block truncate text-xs text-stone-500">
                          {c.city}{c.state ? `, ${c.state}` : ''}
                        </span>
                      </span>
                      {c.ranking?.qs && (
                        <span className="shrink-0 rounded-full bg-forest-50 px-2.5 py-1 text-[11px] font-semibold text-forest-700">
                          QS #{c.ranking.qs}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key exams */}
          {exams.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Exams you&rsquo;ll need
                </h3>
                <Link
                  href="/exams"
                  className="text-xs font-medium text-forest-700 no-underline hover:text-forest-800"
                >
                  All exams
                </Link>
              </div>
              <ul className="m-0 list-none space-y-2 p-0">
                {exams.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/exams/${e.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-stone-200 bg-white/80 px-4 py-3 no-underline transition-colors hover:border-forest-300"
                    >
                      <BookMarked className="h-4 w-4 shrink-0 text-forest-700" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink group-hover:text-forest-700">
                          {e.shortName}
                        </span>
                        <span className="block truncate text-xs text-stone-500">{e.fullName}</span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-stone-400 group-hover:text-forest-700" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
