import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

import {
  COLLEGES,
  COLLEGE_COUNTRY_INFO,
  collegeModified,
  getCollegeBySlug,
  type College,
} from '@/lib/colleges';
import {
  CONTROL_LABELS,
  SPECIALIZATION_LABELS,
  SYSTEM_LABELS,
  collegeIdentityLine,
} from '@/lib/college-taxonomy';
import {
  LEVEL_LABELS,
  RANKING_NUDGE,
  categoryLabel,
  collegeRankings,
} from '@/lib/college-labels';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { PROGRAMME_FEES } from '@/lib/programme-fees';
import { REGIONS } from '@/lib/regions';
import { regionCategoryPath } from '@/lib/region-nav';
import { rankGuidesForCollege } from '@/lib/related-guides';
import ContentActions from '@/components/ContentActions';
import PageQuickLinks from '@/components/PageQuickLinks';
import RegionExplore from '@/components/RegionExplore';
import PageRegion from '@/components/PageRegion';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import SaveButton from '@/components/SaveButton';
import AddToPlannerButton from '@/components/AddToPlannerButton';
import AddToCompareButton from '@/components/AddToCompareButton';
import ToolLink from '@/components/tools/ToolLink';
import { applicationCheckHref } from '@/lib/tools';
import { PROGRAMMES } from '@/lib/application-check-catalogue';
import ContentImage from '@/components/ContentImage';
import { collegeImage } from '@/lib/images';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { defaultAudienceFor } from '@/lib/audience';
import { breadcrumbsFor } from '@/lib/cmi';
import { SITE_REVIEWED, SITE_LASTMOD, metaDescription, formatReviewed } from '@/lib/site-meta';
import { pageMetadata, ogImageFor } from '@/lib/seo';
import { gsbAiHref } from '@/lib/gsb-ai-links';

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const APPLY_STATUS_LABELS = {
  domestic: 'Domestic · home students of this destination',
  international: 'International · students from another country',
} as const;

const APPLY_LEVEL_LABELS = {
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  all: 'All levels',
} as const;

/**
 * True when a recorded admission-test name says more than the covered exam it
 * links to — "Duolingo (undergraduate)", "UCAT (Medicine)", "IELTS / TOEFL",
 * "A-Levels / IB". `findExam` matches by prefix, and the card otherwise shows only
 * the exam's own names, so the level, subject or second test in the record was
 * silently dropped. "TOEFL" (→ "TOEFL iBT") and an exact full name add nothing.
 */
function recordAddsDetail(name: string, exam: { shortName: string; fullName: string; slug: string }) {
  const target = norm(name);
  return !norm(exam.shortName).startsWith(target) && target !== norm(exam.fullName) && target !== norm(exam.slug);
}

/** Map a free-text admission-exam name to a known exam record, when we cover it. */
function findExam(name: string) {
  const target = norm(name);
  return ENTRANCE_EXAMS.find((e) => {
    const sn = norm(e.shortName);
    const fn = norm(e.fullName);
    return (
      sn === target ||
      fn === target ||
      norm(e.slug) === target ||
      sn.startsWith(target) ||
      target.startsWith(sn)
    );
  });
}

export function generateStaticParams() {
  return COLLEGES.map((c) => ({ slug: c.slug }));
}

/**
 * Title formula: name + country + what the page actually holds. The country is
 * named because a global audience searches "{university} admissions" from
 * everywhere and 118 identical "— Admissions, Courses & Overview" titles told
 * them nothing. When a dedicated "How to get into X" guide exists it owns the
 * "how to apply" intent, so the profile cedes it and leads with the profile facts.
 * When `category` is set, `courses` is `[]`, so `"Courses"` is omitted.
 */
function collegeTitle(
  college: Pick<College, 'nameEn' | 'country' | 'category'>,
  hasGuide: boolean,
  hasRanking: boolean,
): string {
  const country = COLLEGE_COUNTRY_INFO[college.country]?.label ?? '';
  // Long official names carry a parenthetical expansion ("KAIST (Korea Advanced
  // Institute of Science and Technology)"); the SERP title keeps the short form.
  const name = college.nameEn.length > 40 ? college.nameEn.replace(/\s*\([^)]*\)/g, '').trim() : college.nameEn;
  const scope = country && !name.includes(country) ? ` (${country})` : '';
  if (college.category) {
    if (!hasGuide) return `${name}${scope}: Admissions & How to Apply`;
    return hasRanking
      ? `${name}${scope}: Rankings & Admission Tests`
      : `${name}${scope}: Admission Tests & How to Apply`;
  }
  if (!hasGuide) return `${name}${scope}: Admissions, Courses & How to Apply`;
  // "Rankings" only when the page actually renders a ranking block.
  return hasRanking
    ? `${name}${scope}: Rankings, Courses & Admission Tests`
    : `${name}${scope}: Courses, Admission Tests & How to Apply`;
}

/** True when the profile renders its Rankings block (QS / THE / NIRF present). */
function hasAnyRanking(college: { ranking?: { qs?: number; the?: number; nirf?: number } }): boolean {
  return Boolean(college.ranking?.qs || college.ranking?.the || college.ranking?.nirf);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const college = getCollegeBySlug(slug);
  if (!college) return { title: 'University not found', robots: { index: false, follow: false } };

  const place = `${college.city}${college.state ? `, ${college.state}` : ''}`;
  const hasGuide = rankGuidesForCollege(college).some((r) => r.dedicated);
  const summary = college.category ? collegeIdentityLine(college) : college.descriptionEn;
  const fieldKeywords = (college.specializations ?? [])
    .slice(0, 4)
    .map((s) => SPECIALIZATION_LABELS[s]);

  return pageMetadata({
    title: collegeTitle(college, hasGuide, hasAnyRanking(college)),
    description: college.category
      ? metaDescription(summary, 300)
      : `${college.nameEn}, ${place}: admission requirements, courses, the entrance tests it accepts and how international students apply. ${summary}`,
    path: `/colleges/${college.slug}`,
    type: 'article',
    image: ogImageFor(college.region),
    keywords: [
      `${college.nameEn} admissions`,
      ...(college.category ? [] : [`${college.nameEn} courses`]),
      `${college.nameEn} application`,
      `how to apply to ${college.nameEn}`,
      `${college.nameEn} ${place}`,
      ...fieldKeywords,
      ...college.courses.slice(0, 4),
    ],
    modifiedTime: collegeModified(college) ?? SITE_LASTMOD,
  });
}

export default async function CollegeDetailPage({ params }: Props) {
  const { slug } = await params;
  const college = getCollegeBySlug(slug);
  if (!college) notFound();

  const region = REGIONS.find((r) => r.slug === college.region);
  const place = `${college.city}${college.state ? `, ${college.state}` : ''}`;
  const typeLabel = categoryLabel(college);
  const systemLabel = college.system ? SYSTEM_LABELS[college.system] : null;
  const controlLabel = college.control ? CONTROL_LABELS[college.control] : null;
  const summary = college.category ? collegeIdentityLine(college) : college.descriptionEn;
  const specializations = college.specializations ?? [];
  const reviewedProgrammes = PROGRAMMES.filter(
    (programme) => programme.collegeSlug === college.slug && programme.region === college.region,
  );
  const programmeFees = PROGRAMME_FEES.filter((fee) => fee.collegeSlug === college.slug);

  // Related — other universities in the same COUNTRY first (then the region), so
  // a Singapore page does not point at Japan just because both are one region.
  const siblingColleges = [
    ...COLLEGES.filter((c) => c.country === college.country && c.slug !== college.slug),
    ...COLLEGES.filter((c) => c.country !== college.country && c.region === college.region && c.slug !== college.slug),
  ].slice(0, 4);

  // Guides ranked by how specifically they are about THIS university; the top
  // dedicated one ("How to get into X") is featured as the long-form twin.
  const ranked = rankGuidesForCollege(college);
  const primaryGuide = ranked.find((r) => r.dedicated)?.guide ?? null;
  const relatedGuides = ranked
    .map((r) => r.guide)
    .filter((g) => g.slug !== primaryGuide?.slug)
    .slice(0, 6);

  // Entrance tests the record names, resolved to the exam records we cover, so
  // the page can state conducting body / frequency / official site instead of a
  // bare chip — unique, Tier-1 data already in the catalogue.
  const admissionTests = college.admissionExams.map((name) => ({ name, exam: findExam(name) }));
  const testingSources = college.sources?.filter((source) => source.section === 'admission-tests') ?? [];
  const planningSources = college.sources?.filter((source) => source.section === 'admission-planning') ?? [];

  const pageUrl = `https://www.globalstudyboard.com/colleges/${college.slug}`;
  const countryInfo = COLLEGE_COUNTRY_INFO[college.country];
  const modified = collegeModified(college) ?? SITE_REVIEWED;

  // NOTE: no FAQPage JSON-LD here. Google requires the marked-up Q&A to be
  // VISIBLE on the page, and this template renders no FAQ section; FAQ rich
  // results are also restricted to authoritative gov/health sites. The
  // CollegeOrUniversity markup below is the correct, sufficient schema.
  // Attributed to the issuing body — the same rows the Compare tool renders.
  const rankings = collegeRankings(college);

  let websiteHost = college.websiteUrl ?? '';
  if (college.websiteUrl) {
    try {
      websiteHost = new URL(college.websiteUrl).hostname.replace(/^www\./, '');
    } catch {
      websiteHost = college.websiteUrl;
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    '@id': pageUrl,
    name: college.nameEn,
    description: metaDescription(summary, 300),
    url: college.websiteUrl,
    foundingDate: college.establishmentLabel ? undefined : college.established?.toString(),
    // No `image` here: schema.org reads it as "an image of the item", and the
    // only images we have are a destination card and a representative archetype —
    // neither depicts this university. The card stays on the page's OpenGraph.
    address: {
      '@type': 'PostalAddress',
      addressLocality: college.postalCity ?? college.city,
      ...(college.state ? { addressRegion: college.state } : {}),
      ...(countryInfo ? { addressCountry: countryInfo.iso } : {}),
    },
    mainEntityOfPage: pageUrl,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* 1. Breadcrumbs */}
      <BreadcrumbsView crumbs={breadcrumbsFor(`/colleges/${college.slug}`)} />
      <PageRegion slug={college.region} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. Header */}
      <header>
        <Link
          href="/colleges"
          prefetch={false}
          className="text-sm text-stone-500 hover:text-forest-700 no-underline inline-flex items-center gap-1 mb-4"
        >
          ← All universities
        </Link>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {region && (
            <Link
              href={`/regions/${region.slug}`}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 hover:text-forest-700 no-underline"
            >
              <RegionFlag slug={region.slug} className="mr-1.5 h-3.5" />{region.displayName}
            </Link>
          )}
          <span className="text-stone-300">·</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {typeLabel}
          </span>
          {systemLabel && (
            <>
              <span className="text-stone-300">·</span>
              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-stone-700">
                {systemLabel}
              </span>
            </>
          )}
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-editorial leading-[1.05] text-ink mb-3">
          {college.nameEn}
        </h1>
        <p className="text-stone-700 text-xl">
          {place}
          {countryInfo && !place.includes(countryInfo.label) ? `, ${countryInfo.label}` : ''}
        </p>
      </header>

      {/* 3. Representative hero image */}
      <ContentImage
        asset={collegeImage({ slug: college.slug, region: college.region })}
        variant="hero"
        layout="profile"
        priority
        representative
      />

      {/* 4. Identity sentence */}
      <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
        {summary}
      </p>

      {/* 5. Actions bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LastUpdated date={modified} />
        {/* Shortlist — renders nothing until accounts are configured. */}
        <SaveButton kind="college" slug={college.slug} title={college.nameEn} region={college.region} />
        <AddToPlannerButton slug={college.slug} name={college.nameEn} region={college.region} url={college.websiteUrl} />
        <AddToCompareButton slug={college.slug} name={college.nameEn} region={college.region} url={college.websiteUrl} />
        {reviewedProgrammes.map((programme) => (
          <ToolLink key={programme.id} href={applicationCheckHref(programme.id, programme.region)} className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-xl border border-forest-300 bg-white px-3 py-1 text-sm font-semibold text-forest-700 no-underline hover:bg-forest-50">
            Check requirements for {programme.name} <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </ToolLink>
        ))}
      </div>

      {/* 6. Primary admissions guide banner */}
      {primaryGuide && (
        <Link
          href={`/guides/${primaryGuide.slug}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-forest-200 bg-forest-50/70 px-5 py-4 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50"
        >
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700 mb-1">
              Full admissions guide
            </span>
            <span className="font-display text-lg font-bold text-ink group-hover:text-forest-700 leading-snug">
              {primaryGuide.titleEn}
            </span>
            <span className="block text-sm text-stone-600 mt-1">
              {primaryGuide.readMinutes} min read · verified {formatReviewed(primaryGuide.lastVerified).display}
            </span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-forest-700" />
        </Link>
      )}

      {/* 7. At-a-glance <dl> */}
      <section aria-label="At a glance" className="rounded-2xl border border-stone-200 bg-white p-6">
        <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
              Location
            </dt>
            <dd className="m-0 text-sm font-medium text-stone-800">{place}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
              Category
            </dt>
            <dd className="m-0 text-sm font-medium text-stone-800">{typeLabel}</dd>
          </div>
          {controlLabel && (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
                Control
              </dt>
              <dd className="m-0 text-sm font-medium text-stone-800">{controlLabel}</dd>
            </div>
          )}
          {systemLabel && (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
                System
              </dt>
              <dd className="m-0 text-sm font-medium text-stone-800">{systemLabel}</dd>
            </div>
          )}
          {(college.established !== undefined) && (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
                {college.establishmentLabel ?? 'Established'}
              </dt>
              <dd className="m-0 text-sm font-medium text-stone-800">{college.established}</dd>
            </div>
          )}
          {college.programLevels.length > 0 && (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
                Degree levels
              </dt>
              <dd className="m-0 text-sm font-medium text-stone-800">
                {college.programLevels.map((l) => LEVEL_LABELS[l] ?? l).join(', ')}
              </dd>
            </div>
          )}
          {(college.instructionNote || college.englishTaught !== undefined) && (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
                Instruction
              </dt>
              <dd className="m-0 text-sm font-medium text-stone-800">
                {college.instructionNote ? (
                  <>
                    {college.instructionNote.text}{' '}
                    <a
                      href={college.instructionNote.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-normal text-forest-700 underline underline-offset-2 hover:text-forest-800"
                    >
                      Source
                    </a>
                  </>
                ) : college.englishTaught ? (
                  'English-taught'
                ) : (
                  'Local language'
                )}
              </dd>
            </div>
          )}
          {college.websiteUrl && (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
                Website
              </dt>
              <dd className="m-0 text-sm font-medium text-stone-800">
                <a
                  href={college.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest-700 underline underline-offset-2 hover:text-forest-800"
                >
                  {websiteHost}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* 8. How it is organised */}
      {college.organisation && college.organisation.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-4">
            How it is organised
          </h2>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-8 p-0 sm:grid-cols-2">
            {college.organisation.map((unit) => (
              <li
                key={unit.name}
                className="m-0 flex items-baseline justify-between gap-3 border-b border-stone-200 py-2.5 text-sm"
              >
                <a
                  href={unit.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline decoration-stone-300 underline-offset-2 hover:text-forest-700"
                >
                  {unit.name}
                </a>
                <span className="shrink-0 text-xs text-stone-500">
                  {SPECIALIZATION_LABELS[unit.specialization]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 9. Fields */}
      {specializations.length > 0 && (
        <section aria-label="Academic fields" className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 mr-1">
            Fields
          </span>
          {specializations.map((spec) => (
            <Link
              key={spec}
              href={`${regionCategoryPath(college.region, 'universities')}#field=${spec}`}
              prefetch={false}
              className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 no-underline hover:border-forest-300 hover:text-forest-700"
            >
              {SPECIALIZATION_LABELS[spec]}
            </Link>
          ))}
        </section>
      )}

      {/* 10. How to apply — both applicant statuses, on every college, never hidden. */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="font-display text-2xl font-bold tracking-editorial text-ink mb-2">
          How to apply
        </h2>
        <p className="m-0 mb-5 text-sm leading-relaxed text-stone-600">
          Check the university’s applicant definitions before choosing a route.
        </p>
        <div className="space-y-5">
          {(defaultAudienceFor(college.region) === 'domestic'
            ? (['domestic', 'international'] as const)
            : (['international', 'domestic'] as const)
          ).map((status) => {
              const lines = (college.applyLines ?? []).filter((line) => line.audience === status);
              return (
                <div key={status}>
                  <h3 className="m-0 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest-700">
                    {APPLY_STATUS_LABELS[status]}
                  </h3>
                  {lines.length > 0 ? (
                    <ul className="m-0 list-none space-y-2 p-0">
                      {lines.map((line, index) => (
                        <li key={`${status}-${line.level ?? 'all'}-${index}`} className="text-sm leading-relaxed text-stone-800">
                          {line.level ? (
                            <span className="mr-2 font-medium text-stone-500">{APPLY_LEVEL_LABELS[line.level]}</span>
                          ) : null}
                          {line.text}{' '}
                          <a
                            href={line.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-forest-700 underline underline-offset-2 hover:text-forest-800"
                          >
                            Official page
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="m-0 text-sm leading-relaxed text-stone-700">Not stated on this profile.</p>
                  )}
                </div>
              );
            })}
        </div>
        {(college.applyLines ?? []).filter((line) => line.audience === 'domestic').length === 0
          || (college.applyLines ?? []).filter((line) => line.audience === 'international').length === 0
          ? college.websiteUrl && (
          <p className="m-0 mt-5 text-sm leading-relaxed text-stone-700">
            <a
              href={college.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-forest-700 underline underline-offset-2 hover:text-forest-800"
            >
              Check the official site
            </a>
            {' '}for a route this profile does not state yet.
          </p>
        ) : null}
        {college.applicationPlatform && !(college.applyLines && college.applyLines.length > 0) ? (
          <p className="m-0 mt-5 border-t border-stone-200 pt-4 text-sm leading-relaxed text-stone-600">
            This profile has not split that note by applicant. It records: {college.applicationPlatform}. Confirm which applicants it covers on the official site.
          </p>
        ) : null}
        {planningSources.length > 0 && (
          <div className="mt-5 border-t border-stone-200 pt-4">
            <h3 className="m-0 text-sm font-semibold text-ink">Plan your application</h3>
            <ul className="mb-0 mt-2 space-y-1 pl-5 text-sm leading-relaxed">
              {planningSources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-forest-700 underline underline-offset-2 hover:text-forest-800">
                    {source.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 11. Admission tests — with the official facts we hold for each covered test */}
      {admissionTests.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-4">
            Admission tests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {admissionTests.map(({ name, exam }) =>
              exam ? (
                <Link
                  key={name}
                  href={`/exams/${exam.slug}`}
                  className="group bg-white border border-stone-200 rounded-2xl p-4 no-underline hover:border-forest-300 transition-colors"
                >
                  <p className="font-display text-base font-bold text-ink m-0 group-hover:text-forest-700">
                    {exam.shortName}
                    <span className="ml-2 text-xs font-sans font-medium text-stone-500">{exam.fullName}</span>
                  </p>
                  {recordAddsDetail(name, exam) && (
                    <p className="text-stone-800 text-sm font-medium m-0 mt-1">
                      <span className="text-stone-600 font-normal">Listed for this university: </span>
                      {name}
                    </p>
                  )}
                  <p className="text-stone-600 text-sm m-0 mt-1">{exam.conductingBody}</p>
                  {/* The schedule can run to several sentences; the card links to the
                      exam page, which has it in full. */}
                  <p className="text-stone-600 text-sm m-0 mt-1 line-clamp-2">{exam.frequency}</p>
                </Link>
              ) : (
                <span
                  key={name}
                  className="text-sm font-medium bg-stone-100 text-stone-700 px-4 py-3 rounded-2xl"
                >
                  {name}
                </span>
              ),
            )}
          </div>
          {testingSources.length > 0 ? (
            <div className="mt-3 text-sm leading-relaxed text-stone-600">
              <p className="m-0">Check the university’s official testing instructions for your intake.</p>
              <ul className="mt-1 space-y-1 pl-5">
                {testingSources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-forest-700 underline underline-offset-2 hover:text-forest-800">
                      {source.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Requirements change from one intake to the next — confirm the current ones on{' '}
              {college.websiteUrl ? (
                <a href={college.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-forest-700 underline underline-offset-2 hover:text-forest-800">
                  {college.nameEn}&rsquo;s official site
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <>{college.nameEn}&rsquo;s official site</>
              )}{' '}
              before you apply.
            </p>
          )}
        </section>
      )}

      {/* 12. Rankings — attributed to the issuing body, with a verify nudge */}
      {rankings.length > 0 && (
        <section className="bg-cream-50 border border-stone-200 rounded-2xl p-6">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-4">
            Rankings
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rankings.map((r) => (
              <div key={r.body}>
                <p className="font-display text-3xl font-bold text-forest-700 m-0">#{r.rank}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 text-sm hover:text-forest-700"
                >
                  {r.body}
                </a>
              </div>
            ))}
          </div>
          <p className="text-stone-500 text-xs leading-relaxed mt-4 mb-0">
            {RANKING_NUDGE}
          </p>
        </section>
      )}

      {/* 13. Reviewed programme fee */}
      {programmeFees.length > 0 && (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
            Reviewed programme fee
          </p>
          <div className="space-y-4">
            {programmeFees.map((fee) => (
              <div key={`${fee.university}-${fee.programme}-${fee.year}`} className="text-sm text-stone-800">
                <p className="m-0 font-semibold text-ink">
                  {fee.programme} ({fee.year}): {fee.currency} {fee.amount.toLocaleString('en-US')}{' '}
                  <span className="font-normal text-stone-600">
                    ({fee.period === 'year' ? 'per year' : fee.period} · {fee.appliesTo})
                  </span>
                </p>
                <p className="m-0 mt-1 text-xs leading-relaxed text-stone-600">{fee.note}</p>
                <p className="m-0 mt-1 text-xs text-stone-500">
                  <a
                    href={fee.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest-700 underline underline-offset-2 hover:text-forest-800"
                  >
                    {fee.sourceLabel}
                  </a>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 14. Applying to this destination — the region's official facts, with sources */}
      {region && (
        <section className="bg-cream-50 border border-stone-200 rounded-2xl p-6">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
            Applying to universities in {region.proseName}
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 m-0">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Application platform</dt>
              <dd className="m-0 text-stone-800 text-sm">{region.primaryApplicationPlatform}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Intakes</dt>
              <dd className="m-0 text-stone-800 text-sm">{region.intakes.join(' · ')}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Student visa</dt>
              <dd className="m-0 text-stone-800 text-sm">{region.visaName ?? 'Not applicable for domestic students'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Working while studying</dt>
              <dd className="m-0 text-stone-800 text-sm">{region.worksWhileStudying}</dd>
            </div>
          </dl>
          {region.sources.length > 0 && (
            <p className="text-stone-500 text-xs leading-relaxed mt-4 mb-0">
              Official sources:{' '}
              {region.sources.map((src, i) => (
                <span key={src.url}>
                  {i > 0 ? ' · ' : ''}
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-forest-700 underline underline-offset-2">
                    {src.label}
                  </a>
                </span>
              ))}
              . Visa and work rules change — verify on the official source before relying on them.
            </p>
          )}
        </section>
      )}

      {/* 15. Legacy courses — only when category is not set */}
      {!college.category && college.courses.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-4">
            Popular fields of study
          </h2>
          <div className="flex flex-wrap gap-2">
            {college.courses.map((course) => (
              <span
                key={course}
                className="text-sm font-medium bg-white border border-stone-200 text-stone-700 px-3 py-1.5 rounded-full"
              >
                {course}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 16. Verified against & Official link + freshness disclosure */}
      {college.sources && college.sources.length > 0 && (
        <section aria-label="Verified against" className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
            Verified against
          </p>
          <ul className="m-0 list-none space-y-1.5 p-0 text-xs text-stone-600">
            {college.sources.map((src) => (
              <li key={src.url} className="m-0">
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-forest-700 underline underline-offset-2 hover:text-forest-800"
                >
                  {src.label}
                </a>{' '}
                · read {formatReviewed(src.readOn).display}
              </li>
            ))}
          </ul>
        </section>
      )}

      {college.websiteUrl && (
        <div className="space-y-2">
          <a
            href={college.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
          >
            Visit official website <ArrowUpRight className="w-4 h-4" />
          </a>
          {college.contentUpdated &&
            college.lastVerified &&
            college.contentUpdated !== college.lastVerified && (
              <p className="text-stone-600 text-xs leading-relaxed m-0">
                Last verified against official sources on {formatReviewed(college.lastVerified).display} · Copy or layout updated on {formatReviewed(college.contentUpdated).display}.
              </p>
            )}
          <p className="text-stone-500 text-xs leading-relaxed max-w-xl">
            Source: {college.nameEn} official website. Fees, deadlines, rankings and eligibility change
            every year, so confirm them on the university&apos;s site before applying.
          </p>
        </div>
      )}

      {/* 17. Like / Share / Print, Sibling colleges, Related guides, Ask GSB CTA, RegionExplore, PageQuickLinks */}
      <ContentActions title={college.nameEn} />

      {(siblingColleges.length > 0 || region) && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-4">
            Related / Next steps
          </h2>
          {siblingColleges.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {siblingColleges.map((c) => (
                <Link
                  key={c.slug}
                  href={`/colleges/${c.slug}`}
                  className="group bg-white border border-stone-200 rounded-2xl p-4 no-underline hover:border-forest-300 hover:bg-cream-50 transition-colors"
                >
                  <p className="font-display text-lg font-bold text-ink m-0 group-hover:text-forest-700">
                    {c.nameEn}
                  </p>
                  <p className="text-stone-500 text-sm m-0 mt-1">
                    {c.city}{c.state ? `, ${c.state}` : ''}
                  </p>
                </Link>
              ))}
            </div>
          )}
          {region && (
            <Link
              href={`/regions/${region.slug}/universities`}
              className="inline-flex items-center gap-1 text-forest-700 font-medium no-underline hover:text-forest-800"
            >
              Explore all universities in {region.proseName} →
            </Link>
          )}
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-5">
            Admissions guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 hover:bg-cream-50 transition-colors"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest-700 mb-2">
                  {g.readMinutes} min read
                </p>
                <p className="font-display text-base font-bold text-ink m-0 group-hover:text-forest-700 leading-snug">
                  {g.titleEn}
                </p>
                <p className="text-stone-500 text-sm mt-2 mb-0 line-clamp-2">
                  {g.descriptionEn}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="on-dark bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Thinking about {college.nameEn}?
        </h2>
        <p className="text-cream-50/85 mb-5">
          Ask GSB how to build a competitive application for this university.
        </p>
        <Link
          href={gsbAiHref({ q: `How do I apply to ${college.nameEn}?` })}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB →
        </Link>
      </section>

      <RegionExplore region={college.region} />

      <PageQuickLinks currentPath={`/colleges/${college.slug}`} region={college.region} />
    </div>
  );
}
