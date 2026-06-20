import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, MapPin, CalendarDays, GraduationCap, Globe2 } from 'lucide-react';

import { COLLEGES, getCollegeBySlug } from '@/lib/colleges';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { REGIONS } from '@/lib/regions';
import { GUIDES } from '@/lib/guides';
import ContentActions from '@/components/ContentActions';
import PageQuickLinks from '@/components/PageQuickLinks';
import RegionExplore from '@/components/RegionExplore';
import PageRegion from '@/components/PageRegion';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

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

/** Map a free-text admission-exam name to a known exam slug, when we cover it. */
function findExamSlug(name: string): string | undefined {
  const target = norm(name);
  const exam = ENTRANCE_EXAMS.find((e) => {
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
  return exam?.slug;
}

export function generateStaticParams() {
  return COLLEGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const college = getCollegeBySlug(slug);
  if (!college) return { title: 'University not found' };

  const place = `${college.city}${college.state ? `, ${college.state}` : ''}`;
  const desc = college.descriptionEn.slice(0, 155);
  const canonical = `https://www.globalstudyboard.com/colleges/${college.slug}`;

  return {
    title: `${college.nameEn} — Admissions, Courses & Overview`,
    description: desc,
    keywords: [
      `${college.nameEn} admissions`,
      `${college.nameEn} courses`,
      `${college.nameEn} application`,
      `how to apply to ${college.nameEn}`,
      `${college.nameEn} ${place}`,
      ...college.courses.slice(0, 4),
    ],
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: `${college.nameEn} — Admissions, Courses & Overview`,
      description: desc,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${college.nameEn} — GlobalStudyBoard`,
      description: desc,
      images: ['/opengraph-image'],
    },
  };
}

export default async function CollegeDetailPage({ params }: Props) {
  const { slug } = await params;
  const college = getCollegeBySlug(slug);
  if (!college) notFound();

  const region = REGIONS.find((r) => r.slug === college.region);
  const place = `${college.city}${college.state ? `, ${college.state}` : ''}`;
  const typeLabel = TYPE_LABELS[college.type] ?? college.type;

  // Related — other universities in the same region (continuity, no dead ends).
  const siblingColleges = COLLEGES.filter(
    (c) => c.region === college.region && c.slug !== college.slug,
  ).slice(0, 4);

  // Guides covering this university — adds rich content + cross-links for indexing.
  const relatedGuides = GUIDES.filter((g) => g.relatedCollegeSlugs.includes(college.slug)).slice(0, 3);

  // FAQPage schema — structured Q&A gives Google rich-snippet candidates.
  const collegeFaqItems: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[] = [
    { '@type': 'Question', name: `What is ${college.nameEn}?`, acceptedAnswer: { '@type': 'Answer', text: college.descriptionEn } },
    { '@type': 'Question', name: `Where is ${college.nameEn} located?`, acceptedAnswer: { '@type': 'Answer', text: `${college.nameEn} is located in ${place}.` } },
    { '@type': 'Question', name: `When was ${college.nameEn} established?`, acceptedAnswer: { '@type': 'Answer', text: `${college.nameEn} was established in ${college.established}.` } },
    { '@type': 'Question', name: `What programs does ${college.nameEn} offer?`, acceptedAnswer: { '@type': 'Answer', text: `${college.nameEn} offers ${college.programLevels.map((l) => LEVEL_LABELS[l] ?? l).join(', ')} programs. Popular fields include ${college.courses.slice(0, 5).join(', ')}. Confirm the current program list on the official university website.` } },
  ];
  if (college.applicationPlatform) {
    collegeFaqItems.push({ '@type': 'Question', name: `How do I apply to ${college.nameEn}?`, acceptedAnswer: { '@type': 'Answer', text: `${college.applicationPlatform}. Verify the current application process on the official university website.` } });
  }
  if (college.admissionExams.length > 0) {
    collegeFaqItems.push({ '@type': 'Question', name: `What entrance exams does ${college.nameEn} require?`, acceptedAnswer: { '@type': 'Answer', text: `${college.nameEn} typically requires: ${college.admissionExams.join(', ')}. Confirm current requirements on the official website.` } });
  }
  const collegeFaqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: collegeFaqItems };

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
    '@id': `https://www.globalstudyboard.com/colleges/${college.slug}`,
    name: college.nameEn,
    description: college.descriptionEn.slice(0, 300),
    url: college.websiteUrl,
    ...(college.websiteUrl ? { sameAs: college.websiteUrl } : {}),
    foundingDate: String(college.established),
    inLanguage: 'en',
    address: {
      '@type': 'PostalAddress',
      addressLocality: college.city,
      ...(college.state ? { addressRegion: college.state } : {}),
    },
    mainEntityOfPage: `https://www.globalstudyboard.com/colleges/${college.slug}`,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <PageRegion slug={college.region} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collegeFaqLd) }}
      />

      <header>
        <Link
          href="/colleges"
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
              {region.flag} {region.displayName}
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
        <p className="text-stone-700 text-xl">{place}</p>
      </header>

      <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
        {college.descriptionEn}
      </p>

      <LastUpdated date={SITE_REVIEWED} />

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
                {region.flag} {region.displayName} →
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Admission exams */}
      {college.admissionExams.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-4">
            Admission tests
          </h2>
          <div className="flex flex-wrap gap-2">
            {college.admissionExams.map((e) => {
              const examSlug = findExamSlug(e);
              if (examSlug) {
                return (
                  <Link
                    key={e}
                    href={`/exams/${examSlug}`}
                    className="text-sm font-medium bg-forest-50 text-forest-800 border border-forest-200 px-3 py-1.5 rounded-full no-underline hover:bg-forest-100 transition-colors"
                  >
                    {e}
                  </Link>
                );
              }
              return (
                <span
                  key={e}
                  className="text-sm font-medium bg-stone-100 text-stone-700 px-3 py-1.5 rounded-full"
                >
                  {e}
                </span>
              );
            })}
          </div>
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
              href={`/regions/${region.slug}`}
              className="inline-flex items-center gap-1 text-forest-700 font-medium no-underline hover:text-forest-800"
            >
              Explore all universities in {region.displayName} →
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
      <section className="bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Thinking about {college.nameEn}?
        </h2>
        <p className="text-cream-50/85 mb-5">
          Ask GSB AI how to build a competitive application for this university.
        </p>
        <Link
          href={`/gsb-ai?q=how-to-apply-to-${college.slug}`}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>

      <RegionExplore region={college.region} />

      {/* Quick links — popular topics & guides */}
      <PageQuickLinks currentPath={`/colleges/${college.slug}`} />
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
