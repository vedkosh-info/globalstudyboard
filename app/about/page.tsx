import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, BookOpenCheck, RefreshCw, Globe2, AlertTriangle } from 'lucide-react';
import { REGIONS } from '@/lib/regions';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'About GlobalStudyBoard — How We Source & Verify Information',
  description:
    'GlobalStudyBoard is an independent study-abroad and entrance-exam guide. Learn who we are, where our information comes from, and how we verify every detail against official sources.',
  keywords: [
    'about GlobalStudyBoard',
    'how GlobalStudyBoard verifies information',
    'study abroad guide sources',
    'entrance exam information sources',
    'independent college admission guide',
  ],
  alternates: { canonical: 'https://www.globalstudyboard.com/about' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/about',
    title: 'About GlobalStudyBoard — How We Source & Verify Information',
    description:
      'An independent study-abroad and entrance-exam guide. See where our information comes from and how we keep it accurate.',
    images: ['/opengraph-image'],
  },
};

const PRINCIPLES = [
  {
    icon: <BookOpenCheck className="w-5 h-5" />,
    title: 'Official sources only',
    body: 'Exam formats, fees, deadlines and eligibility are taken from the conducting body or university itself — College Board, ETS, UCAS, IIT/JEE authorities, and each university\u2019s admissions office. Every exam page links straight to its official website so you can check the primary source yourself.',
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: 'Reviewed and dated',
    body: 'Admission rules change every cycle. We review our content against official notifications and mark when information was last checked, rather than letting pages quietly go stale.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'No invented numbers',
    body: 'We never fabricate rankings, cut-offs, fees or acceptance statistics. If a figure cannot be tied to an official source, we leave it out instead of guessing.',
  },
  {
    icon: <Globe2 className="w-5 h-5" />,
    title: 'Independent and global',
    body: `We are not affiliated with any university, exam board or consultancy, and we don\u2019t sell admissions. Coverage spans ${REGIONS.length} regions so you can compare systems side by side.`,
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Independent · Verified against official sources
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial leading-[1.08] text-ink mb-5">
          About GlobalStudyBoard
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
          GlobalStudyBoard is an independent guide to universities, entrance exams and scholarships
          worldwide. We built it with one goal: to pull the scattered, hard-to-compare facts of
          global admissions into one clear place — and make every claim checkable against its
          official source.
        </p>
        <LastUpdated date={SITE_REVIEWED} className="mt-5" />
      </header>

      {/* Honest "we're new" note */}
      <section className="bg-cream-50 border border-stone-200 rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold tracking-editorial text-ink mb-2">
          We&rsquo;re new — so don&rsquo;t take our word for it
        </h2>
        <p className="text-stone-700 leading-relaxed m-0">
          We&rsquo;re a new resource, and trust is earned, not assumed. That&rsquo;s exactly why we build
          for verification first: instead of asking you to believe us, we point you to the primary
          source behind every fact — the exam board, the university, the official notification.
          Use us to orient and compare; confirm the final details on the official website before you
          act on them.
        </p>
      </section>

      {/* Where our information comes from */}
      <section>
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-6">
          How we source &amp; verify information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="text-forest-700 mb-3">{p.icon}</div>
              <h3 className="font-semibold text-ink text-base mb-2">{p.title}</h3>
              <p className="text-stone-700 text-sm leading-relaxed m-0">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What we are not */}
      <section className="border border-amber-300/70 bg-amber-50 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl font-bold tracking-editorial text-ink mb-2">
              What we are not
            </h2>
            <p className="text-stone-700 leading-relaxed m-0">
              We are not an official examination body, a university, or a paid admissions agent.
              Nothing here is legal, financial or immigration advice. Fees, deadlines, rankings and
              eligibility change every academic year — always confirm the current details on the
              official university or examination website before applying.
            </p>
          </div>
        </div>
      </section>

      {/* Contact / next steps */}
      <section className="bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Spotted something out of date?
        </h2>
        <p className="text-cream-50/85 mb-5">
          We&rsquo;d rather hear it from you than leave it wrong. Tell us and we&rsquo;ll check it
          against the official source.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Contact us →
        </Link>
      </section>
    </div>
  );
}
