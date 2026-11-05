'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getRegionBySlug, type RegionSlug } from '@/lib/regions';
import { toolsIndexHref } from '@/lib/tool-hint';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';
import ToolLink from '@/components/tools/ToolLink';
import { HOME_UI } from '@/lib/home-ui';
import { HOME_SECTIONS_UI } from '@/lib/home-sections-ui';

/** Compact summaries only: the full catalogues stay on the server. */
export interface ExamLite {
  slug: string;
  shortName: string;
  descriptionEn: string;
  domain: string;
  frequency: string;
}

export interface CollegeLite {
  slug: string;
  nameEn: string;
  city: string;
  state?: string;
  established: number;
}

/** Profiles, tests and the next step follow the one shared destination choice. */
export default function HomeSpotlight({ examsBySlug, universitiesByRegion }: {
  examsBySlug: Record<string, ExamLite>;
  universitiesByRegion: Record<RegionSlug, CollegeLite[]>;
}) {
  const { effectiveRegion } = useRegion();
  const r = getRegionBySlug(effectiveRegion);
  if (!r) return null;
  const universities = universitiesByRegion[r.slug] ?? [];
  const exams = r.keyExamSlugs.map((slug) => examsBySlug[slug]).filter((exam): exam is ExamLite => Boolean(exam)).slice(0, 6);

  return (
    <>
      {universities.length > 0 && (
        <section aria-labelledby="home-universities-heading">
          <div className="mb-7 flex flex-col gap-5 sm:mb-9 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">{HOME_SECTIONS_UI.universityEyebrow}</p>
              <h2 id="home-universities-heading" className="m-0 font-display text-3xl font-bold leading-tight tracking-editorial text-ink sm:text-4xl">
                {HOME_UI.universitiesHeading} {r.proseName}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">{HOME_UI.universitiesDescription}</p>
            </div>
            <Link href={`/regions/${r.slug}/universities`} className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-base font-semibold text-forest-800 no-underline underline-offset-4 hover:underline lg:self-auto">
              {HOME_SECTIONS_UI.viewUniversities}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {universities.map((college) => (
              <Link key={college.slug} href={`/colleges/${college.slug}`} className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 no-underline transition-colors hover:border-forest-400 hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2">
                <div className="mb-5 flex items-start gap-2 text-sm leading-relaxed text-stone-600">
                  {/* A regional lead flag is accurate beside a city only when
                      the destination contains a single country. */}
                  {r.countries.length === 1 && <RegionFlag slug={r.slug} className="mt-1 h-3.5 shrink-0" />}
                  <span>{college.city}{college.state ? `, ${college.state}` : ''}</span>
                </div>
                <h3 className="m-0 mb-6 font-display text-xl font-semibold leading-snug text-ink group-hover:text-forest-800">{college.nameEn}</h3>
                <span className="mt-auto flex items-center justify-between gap-2 border-t border-stone-200 pt-4 text-sm font-semibold text-forest-800">
                  {HOME_SECTIONS_UI.viewProfile}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {exams.length > 0 && (
        <section id="exams" aria-labelledby="home-tests-heading" className="border-t border-stone-200 pt-10 sm:pt-12">
          <div className="mb-7 flex flex-col gap-5 sm:mb-9 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">{HOME_SECTIONS_UI.testsEyebrow}</p>
              <h2 id="home-tests-heading" className="m-0 font-display text-3xl font-bold leading-tight tracking-editorial text-ink sm:text-4xl">
                {HOME_SECTIONS_UI.testsHeading} {r.proseName}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">{HOME_UI.testsDescription}</p>
            </div>
            <Link href={`/regions/${r.slug}/exams`} className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-base font-semibold text-forest-800 no-underline underline-offset-4 hover:underline lg:self-auto">
              {HOME_SECTIONS_UI.viewTests}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Link key={exam.slug} href={`/exams/${exam.slug}`} className="group flex flex-col border-t border-stone-200 py-6 no-underline focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <h3 className="m-0 font-display text-2xl font-semibold leading-snug text-ink group-hover:text-forest-800">{exam.shortName}</h3>
                  <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-forest-700" aria-hidden="true" />
                </div>
                <p className="m-0 mb-4 text-base leading-relaxed text-stone-600">{exam.descriptionEn}</p>
                <span className="mt-auto text-xs font-semibold uppercase tracking-wide text-stone-600">{exam.domain.replaceAll('-', ' ')}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="home-planning-heading" className="rounded-3xl border border-forest-200 bg-forest-50 px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-700">{HOME_SECTIONS_UI.planningEyebrow}</p>
            <h2 id="home-planning-heading" className="m-0 font-display text-3xl font-bold leading-tight tracking-editorial text-ink">
              {HOME_SECTIONS_UI.planningHeading} {r.proseName}?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">{HOME_UI.planningDescription}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <ToolLink href={toolsIndexHref(r.slug)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-6 py-3 text-base font-semibold text-cream-50 no-underline transition-colors hover:bg-forest-800">
              {HOME_SECTIONS_UI.planningTools}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </ToolLink>
            <Link href={`/regions/${r.slug}/guides`} className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-base font-semibold text-forest-800 no-underline transition-colors hover:border-forest-400 hover:bg-cream-50">
              {HOME_SECTIONS_UI.planningGuides}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
