import type { Metadata } from 'next';
import { Mail, MessageCircleQuestion, FileWarning } from 'lucide-react';
import { CONTACT_EMAIL } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with GlobalStudyBoard — report an out-of-date detail, suggest a correction, or ask about our coverage. We verify reports against official sources.',
  alternates: { canonical: 'https://www.globalstudyboard.com/contact' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/contact',
    title: 'Contact GlobalStudyBoard',
    description: 'Report a correction, suggest coverage, or ask a question.',
    images: ['/opengraph-image'],
  },
};

const EMAIL = CONTACT_EMAIL;

const REASONS = [
  {
    icon: <FileWarning className="w-5 h-5" />,
    title: 'Report a correction',
    body: 'Found a fee, deadline or eligibility detail that no longer matches the official source? Tell us and we\u2019ll re-check it.',
  },
  {
    icon: <MessageCircleQuestion className="w-5 h-5" />,
    title: 'Suggest coverage',
    body: 'Want an exam, university or region we don\u2019t cover yet? Let us know what would help you.',
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: 'General questions',
    body: 'Anything else about the site, partnerships or how we work.',
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Get in touch
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial leading-[1.08] text-ink mb-5">
          Contact us
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
          We&rsquo;re a small, independent team and we read everything. Corrections are especially
          welcome — accuracy is the whole point.
        </p>
      </header>

      <section className="bg-cream-50 border border-stone-200 rounded-2xl p-6 text-center">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
          Email
        </p>
        <a
          href={`mailto:${EMAIL}`}
          className="font-display text-2xl md:text-3xl font-bold text-forest-700 hover:text-forest-800 no-underline tracking-editorial"
        >
          {EMAIL}
        </a>
        <p className="text-stone-600 text-sm mt-3 m-0">
          We aim to reply within a few business days.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REASONS.map((r) => (
          <div key={r.title} className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="text-forest-700 mb-3">{r.icon}</div>
            <h2 className="font-semibold text-ink text-base mb-2">{r.title}</h2>
            <p className="text-stone-700 text-sm leading-relaxed m-0">{r.body}</p>
          </div>
        ))}
      </section>

      <section className="border border-stone-200 rounded-2xl p-6">
        <h2 className="font-semibold text-ink text-base mb-2">Corrections &amp; copyright</h2>
        <p className="text-stone-700 text-sm leading-relaxed m-0">
          Spotted an error, or believe something on GlobalStudyBoard infringes your copyright or
          trademark? Email us at{' '}
          <a
            href={`mailto:${EMAIL}`}
            className="text-forest-700 hover:text-forest-800 underline font-medium"
          >
            {EMAIL}
          </a>
          . We review every report and correct or remove content where appropriate.
        </p>
      </section>

      <p className="text-stone-500 text-sm leading-relaxed">
        Please note: we can&rsquo;t process applications, guarantee admission, or give individual
        legal or immigration advice. For official decisions, always contact the university or
        examination body directly.
      </p>
    </div>
  );
}
