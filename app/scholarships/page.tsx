import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, ExternalLink } from 'lucide-react';

import { GUIDES } from '@/lib/guides';
import { REGIONS } from '@/lib/regions';

export const metadata: Metadata = {
  title: 'Scholarships & Funding — Official Programmes for Students',
  description:
    'Find official scholarships and funding for your studies — government portals (NSP, INSPIRE), and international programmes (Fulbright, DAAD). Eligibility, how to apply, and official links. Always verify on the official source.',
  keywords: [
    'scholarships for students',
    'scholarships for Indian students abroad',
    'national scholarship portal',
    'INSPIRE scholarship',
    'Fulbright scholarship India',
    'DAAD scholarship',
    'study abroad funding',
    'government scholarships',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/scholarships' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/scholarships',
    title: 'Scholarships & Funding — Official Programmes for Students',
    description:
      'Official scholarship and funding programmes — government portals and international awards. Eligibility, how to apply, and official links.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scholarships & Funding — GlobalStudyBoard',
    description: 'Official scholarship and funding programmes for students — eligibility, how to apply, and official links.',
    images: ['/opengraph-image'],
  },
};

// Surface the scholarship-category guides we already cover. A sensible reading
// order: the overview first, then portals, then named international awards.
const SCHOLARSHIP_ORDER = [
  'scholarships-for-indian-students-abroad',
  'national-scholarship-portal-guide',
  'inspire-scholarship-guide',
  'fulbright-scholarship-for-indians',
  'daad-scholarship-for-indians',
];

const SCHOLARSHIP_GUIDES = (() => {
  const inCategory = GUIDES.filter((g) => g.category === 'scholarships');
  const rank = (slug: string) => {
    const i = SCHOLARSHIP_ORDER.indexOf(slug);
    return i === -1 ? SCHOLARSHIP_ORDER.length : i;
  };
  return [...inCategory].sort((a, b) => rank(a.slug) - rank(b.slug));
})();

const regionMeta = (slug: string) => REGIONS.find((r) => r.slug === slug);

const RELATED = [
  { label: 'All study guides', href: '/guides', note: 'Exams, admissions, careers & study abroad' },
  { label: 'Study by region', href: '/regions', note: 'Costs, intakes and visas by destination' },
  { label: 'Entrance exams', href: '/exams', note: 'The tests that gate admission' },
  { label: 'Ask GSB AI', href: '/gsb-ai', note: 'Get pointed to the right programme' },
];

export default function ScholarshipsIndexPage() {
  return (
    <div className="space-y-14">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Scholarships &amp; funding
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial text-ink mb-4">
          Fund your studies, the official way.
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed">
          Scholarships and fellowships can cut the cost of a degree — from government portals to
          university and foundation awards. Each programme sets its own eligibility, documents and
          deadlines, and these change every cycle. We point you to the official programme and link
          its official source; always confirm the current details there before you apply.
        </p>
      </header>

      {/* Safety note — no guarantees, beware scams, official sources only */}
      <div className="flex items-start gap-3 rounded-2xl border border-forest-200 bg-forest-50/60 p-4 sm:p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-forest-700" aria-hidden="true" />
        <p className="m-0 text-sm leading-relaxed text-stone-700">
          <span className="font-semibold text-ink">Apply through official channels only.</span>{' '}
          Legitimate scholarships never charge a fee to &ldquo;guarantee&rdquo; selection or ask you
          to pay an agent for a result. No one can promise you an award — selection rests with the
          awarding body. Verify every requirement and deadline on the programme&rsquo;s official site.
        </p>
      </div>

      <section>
        <div className="section-rule mb-5">
          <span>Programmes &amp; guides</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCHOLARSHIP_GUIDES.map((guide) => {
            const meta = regionMeta(guide.region);
            return (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  {meta && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      <span aria-hidden="true" className="mr-1">{meta.flag}</span>
                      {meta.displayName}
                    </span>
                  )}
                  <span className="text-stone-300">·</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    {guide.readMinutes} min read
                  </span>
                </div>
                <h2 className="font-display text-lg font-bold tracking-editorial text-ink leading-snug mb-2 group-hover:text-forest-700">
                  {guide.titleEn}
                </h2>
                <p className="text-stone-600 text-sm leading-relaxed m-0 flex-1">
                  {guide.descriptionEn}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                  Read guide <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Related / Next steps */}
      <section>
        <div className="section-rule mb-5">
          <span>Related &amp; next steps</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RELATED.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
            >
              <span className="font-display text-base font-bold text-ink group-hover:text-forest-700 transition-colors">
                {item.label}
              </span>
              <span className="mt-1 text-sm text-stone-600 flex-1">{item.note}</span>
              <ArrowUpRight className="mt-3 h-4 w-4 text-stone-400 group-hover:text-forest-700" />
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-stone-500 flex items-center gap-1.5">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Official programme links and last-verified dates are inside each guide.
        </p>
      </section>
    </div>
  );
}
