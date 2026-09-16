import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, ExternalLink } from 'lucide-react';

import { GUIDES } from '@/lib/guides';
import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import LastUpdated from '@/components/LastUpdated';
import RegionFlag from '@/components/RegionFlag';
import { SITE_REVIEWED } from '@/lib/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Scholarships by Study Destination: Official Programmes & How to Apply',
  description:
    'Official scholarship and funding programmes for students heading to the USA, UK & Ireland, Canada, Europe, Australia & NZ, Asia, the Gulf, Russia and India \u2014 eligibility, official links and how to apply.',
  path: '/scholarships',
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
});

// Scholarship guides grouped BY DESTINATION, destinations in the site's
// alphabetical order, so the page reads the same for every visitor and no
// destination's awards are buried (Rhodes sat at card 70 and Chevening at 204
// of a 208-card wall pinned behind five India-audience guides). Within a
// destination: overviews/portals first (slug contains "scholarship" + "guide"
// or "portal"), then named awards, newest-verified first.
const SCHOLARSHIP_GUIDES = GUIDES.filter((g) => g.category === 'scholarships');
const SCHOLARSHIP_SECTIONS = REGIONS_ALPHABETICAL.map((r) => ({
  region: r,
  guides: SCHOLARSHIP_GUIDES.filter((g) => g.region === r.slug).sort((a, b) => {
    const overview = (g: typeof a) => (/overview|portal|scholarships-(for|in)-/.test(g.slug) ? 0 : 1);
    return overview(a) - overview(b) || b.lastVerified.localeCompare(a.lastVerified);
  }),
})).filter((s) => s.guides.length > 0);

const RELATED = [
  { label: 'All study guides', href: '/guides', note: 'Exams, admissions, careers & study abroad' },
  { label: 'Destinations', href: '/regions', note: 'Costs, intakes and visas by destination' },
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
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
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

      {/* Destination jump list */}
      <nav aria-label="Scholarships by destination" className="flex flex-wrap gap-2">
        {SCHOLARSHIP_SECTIONS.map((sec) => (
          <a
            key={sec.region.slug}
            href={`#scholarships-${sec.region.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm text-stone-700 no-underline hover:border-forest-300 hover:text-forest-700"
          >
            <RegionFlag slug={sec.region.slug} className="h-3.5" />
            {sec.region.displayName}
            <span className="text-xs text-stone-600">{sec.guides.length}</span>
          </a>
        ))}
      </nav>

      {SCHOLARSHIP_SECTIONS.map((sec) => (
        <section key={sec.region.slug} id={`scholarships-${sec.region.slug}`} className="scroll-mt-28">
          <div className="section-rule mb-5">
            <span role="heading" aria-level={2}>
              Scholarships for studying in {sec.region.proseName}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sec.guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 transition-colors group flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                    {guide.readMinutes} min read
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold tracking-editorial text-ink leading-snug mb-2 group-hover:text-forest-700">
                  {guide.titleEn}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed m-0 flex-1">
                  {guide.descriptionEn}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-forest-700">
                  Read guide <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

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
