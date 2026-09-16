import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, MapPin, CalendarDays, GraduationCap, Globe2 } from 'lucide-react';

import { COLLEGES, COLLEGE_COUNTRY_INFO, getCollegeBySlug } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { REGIONS } from '@/lib/regions';
import { rankGuidesForCollege } from '@/lib/related-guides';
import ContentActions from '@/components/ContentActions';
import PageQuickLinks from '@/components/PageQuickLinks';
import RegionExplore from '@/components/RegionExplore';
import PageRegion from '@/components/PageRegion';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import ContentImage from '@/components/ContentImage';
import { collegeImage } from '@/lib/images';
import AudienceGate from '@/components/AudienceGate';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { defaultAudienceFor } from '@/lib/audience';
import { breadcrumbsFor } from '@/lib/cmi';
import { SITE_REVIEWED, SITE_LASTMOD, metaDescription, formatReviewed } from '@/lib/site-meta';
import { pageMetadata, ogImageFor } from '@/lib/seo';
import { gsbAiHref } from '@/lib/gsb-ai-links';

interface Props {
  params: Promise<{ slug: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  'research-university': 'Research university',
  'liberal-arts': 'Liberal arts college',
  'institute-of-technology': 'Institute of technology',
  'business-school': 'Business school',
  'medical-school': 'Medical school',
  'law-school': 'Law school',
  'public-university': 'Public university',
  'private-university': 'Private university',
  iit: 'Indian Institute of Technology (IIT)',
  nit: 'National Institute of Technology (NIT)',
  iim: 'Indian Institute of Management (IIM)',
  aiims: 'All India Institute of Medical Sciences (AIIMS)',
  nlu: 'National Law University (NLU)',
  iisc: 'Indian Institute of Science (IISc)',
};

const LEVEL_LABELS: Record<string, string> = {
  bachelors: "Bachelor's",
  masters: "Master's",
  phd: 'PhD',
  professional: 'Professional',
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

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
 */
function collegeTitle(
  college: { nameEn: string; country: keyof typeof COLLEGE_COUNTRY_INFO },
  hasGuide: boolean,
  hasRanking: boolean,
): string {
  const country = COLLEGE_COUNTRY_INFO[college.country]?.label ?? '';
  // Long official names carry a parenthetical expansion ("KAIST (Korea Advanced
  // Institute of Science and Technology)"); the SERP title keeps the short form.
  const name = college.nameEn.length > 40 ? college.nameEn.replace(/\s*\([^)]*\)/g, '').trim() : college.nameEn;
  const scope = country && !name.includes(country) ? ` (${country})` : '';
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

  return pageMetadata({
    title: collegeTitle(college, hasGuide, hasAnyRanking(college)),
    description: `${college.nameEn}, ${place}: admission requirements, courses, the entrance tests it accepts and how international students apply. ${college.descriptionEn}`,
    path: `/colleges/${college.slug}`,
    type: 'article',
    image: ogImageFor(college.region),
    keywords: [
      `${college.nameEn} admissions`,
      `${college.nameEn} courses`,
      `${college.nameEn} application`,
      `how to apply to ${college.nameEn}`,
      `${college.nameEn} ${place}`,
      ...college.courses.slice(0, 4),
    ],
    modifiedTime: SITE_LASTMOD,
  });
}

export default async function CollegeDetailPage({ params }: Props) {
  const { slug } = await params;
  const college = getCollegeBySlug(slug);
  if (!college) notFound();

  const region = REGIONS.find((r) => r.slug === college.region);
  const place = `${college.city}${college.state ? `, ${college.state}` : ''}`;
  const typeLabel = TYPE_LABELS[college.type] ?? college.type;

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

  const pageUrl = `https://www.globalstudyboard.com/colleges/${college.slug}`;
  const countryInfo = COLLEGE_COUNTRY_INFO[college.country];

  // NOTE: no FAQPage JSON-LD here. Google requires the marked-up Q&A to be
  // VISIBLE on the page, and this template renders no FAQ section; FAQ rich
  // results are also restricted to authoritative gov/health sites. The
  // CollegeOrUniversity markup below is the correct, sufficient schema.
  const rankings: { body: string; rank: number; url: string }[] = [];
  if (college.ranking?.qs) {
    rankings.push({ body: 'QS World University Rankings', rank: college.ranking.qs, url: 'https://www.topuniversities.com/world-university-rankings' });
  }
  if (college.ranking?.the) {
    rankings.push({ body: 'Times Higher Education (THE)', rank: college.ranking.the, url: 'https://www.timeshighereducation.com/world-university-rankings' });
  }
  if (college.ranking?.nirf) {
    rankings.push({ body: 'NIRF (India)', rank: college.ranking.nirf, url: 'https://www.nirfindia.org/Rankings' });
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    '@id': pageUrl,
    name: college.nameEn,
    description: metaDescription(college.descriptionEn, 300),
    url: college.websiteUrl,
    foundingDate: String(college.established),
    // No `image` here: schema.org reads it as "an image of the item", and the
    // only images we have are a destination card and a representative archetype —
    // neither depicts this university. The card stays on the page's OpenGraph.
    address: {
      '@type': 'PostalAddress',
      addressLocality: college.city,
      ...(college.state ? { addressRegion: college.state } : {}),
      ...(countryInfo ? { addressCountry: countryInfo.iso } : {}),
    },
    mainEntityOfPage: pageUrl,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <BreadcrumbsView crumbs={breadcrumbsFor(`/colleges/${college.slug}`)} />
      <PageRegion slug={college.region} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-editorial leading-[1.05] text-ink mb-3">
          {college.nameEn}
        </h1>
        <p className="text-stone-700 text-xl">
          {place}
          {countryInfo && !place.includes(countryInfo.label) ? `, ${countryInfo.label}` : ''}
        </p>
      </header>

      <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
        {college.descriptionEn}
      </p>

      <LastUpdated date={SITE_REVIEWED} />

      {/* Representative campus archetype for this destination — NEVER a depiction of this
          institution (there is no code path that could select one). Renders nothing until
          the image library exists. `representative` forces the honest on-image label. */}
      <ContentImage
        asset={collegeImage({ slug: college.slug, region: college.region })}
        variant="hero"
        priority
        representative
      />
      {/* Long-form twin — the dedicated admissions guide, featured above the facts */}
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

      {/* Facts grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FactCard icon={<MapPin className="w-5 h-5" />} label="Location" value={place} />
        <FactCard icon={<CalendarDays className="w-5 h-5" />} label="Established" value={String(college.established)} />
        <FactCard
          icon={<GraduationCap className="w-5 h-5" />}
          label="Degree levels"
          value={college.programLevels.map((l) => LEVEL_LABELS[l] ?? l).join(', ')}
        />
        <FactCard
          icon={<Globe2 className="w-5 h-5" />}
          label="Instruction"
          value={college.englishTaught ? 'English-taught' : 'Local language'}
        />
      </section>

      {/* Rankings — attributed to the issuing body, with a verify nudge */}
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
            Rankings are published annually by their respective organisations and change every year.
            Confirm the current-year position on the official ranking website before relying on it.
          </p>
        </section>
      )}

      {/* Application platform */}
      {college.applicationPlatform && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
              How to apply
            </p>
            <p className="text-stone-800 text-base m-0">{college.applicationPlatform}</p>
          </div>
          {region && (
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
                Region
              </p>
              <Link
                href={`/regions/${region.slug}`}
                className="text-forest-700 text-base font-medium no-underline hover:text-forest-800"
              >
                <RegionFlag slug={region.slug} className="mr-1.5 h-4" />{region.displayName} →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* How to apply — domestic vs international (India pilot) */}
      {college.region === 'india' && (
        <section className="grid grid-cols-1 gap-4">
          <AudienceGate audience="domestic" pageDefault={defaultAudienceFor(college.region)}>
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-forest-700 mb-2">
                Domestic applicants · Indian citizens
              </p>
              <p className="text-stone-700 text-base leading-relaxed m-0">
                Apply through the entrance tests this institution accepts
                {college.admissionExams.length > 0 ? ` (${college.admissionExams.join(', ')})` : ''} and
                the relevant centralised or institute-level counselling — for many engineering institutes
                that is JoSAA or CSAB. Confirm the current route, eligibility, category provisions and
                fees on the official website.
              </p>
            </div>
          </AudienceGate>
          <AudienceGate audience="international" pageDefault={defaultAudienceFor(college.region)}>
            <div className="bg-white border border-stone-200 rounded-2xl p-5">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-forest-700 mb-2">
                International applicants · foreign nationals, NRI / OCI
              </p>
              <p className="text-stone-700 text-base leading-relaxed m-0">
                Foreign nationals, PIO/OCI and NRI applicants usually apply through a separate
                foreign-national, NRI or supernumerary channel that varies by institute — for some
                centrally funded technical institutes this is the DASA (Direct Admission of Students
                Abroad) scheme, while others run their own international-admissions office — with
                different eligibility, seats and fees, and a student visa to study in India. The exact
                route changes each year; verify it on the official institute and Government of India
                sources before applying.
              </p>
            </div>
          </AudienceGate>
        </section>
      )}

      {/* Admission tests — with the official facts we hold for each covered test */}
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
                  <p className="text-stone-600 text-sm m-0 mt-1">
                    {exam.conductingBody} · {exam.frequency}
                  </p>
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
        </section>
      )}

      {/* Applying to this destination — the region's official facts, with sources */}
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

      {/* Courses */}
      {college.courses.length > 0 && (
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

      {/* Official link + source caption */}
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
          <p className="text-stone-500 text-xs leading-relaxed max-w-xl">
            Source: {college.nameEn} official website. Details here are for guidance only — tuition,
            deadlines, rankings and eligibility change every academic year, so confirm on the official
            university site before applying.
          </p>
        </div>
      )}

      {/* Like / Share / Print */}
      <ContentActions title={college.nameEn} />

      {/* Related / Next steps */}
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

      {/* Admissions guides */}
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

      {/* CTA */}
      <section className="on-dark bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Thinking about {college.nameEn}?
        </h2>
        <p className="text-cream-50/85 mb-5">
          Ask GSB AI how to build a competitive application for this university.
        </p>
        <Link
          href={gsbAiHref({ q: `How do I apply to ${college.nameEn}?` })}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>

      <RegionExplore region={college.region} />

      {/* Quick links — popular topics & guides */}
      <PageQuickLinks currentPath={`/colleges/${college.slug}`} region={college.region} />
    </div>
  );
}

function FactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="text-forest-700 mb-2">{icon}</div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
        {label}
      </p>
      <p className="text-stone-800 text-sm font-medium leading-snug m-0">{value}</p>
    </div>
  );
}
