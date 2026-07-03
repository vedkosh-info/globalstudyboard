import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'Cookie Policy — GlobalStudyBoard',
  description:
    'How GlobalStudyBoard uses cookies: the strictly necessary, analytics and advertising cookies we rely on, and how you can control or refuse them.',
  alternates: { canonical: 'https://www.globalstudyboard.com/cookies' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/cookies',
    title: 'Cookie Policy — GlobalStudyBoard',
    description: 'The cookies we use and how to manage them.',
    images: ['/opengraph-image'],
  },
};

const LAST_UPDATED = '3 July 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-bold tracking-editorial text-ink">{title}</h2>
      <div className="space-y-3 text-stone-700 leading-relaxed">{children}</div>
    </section>
  );
}

const COOKIE_TYPES = [
  {
    name: 'Strictly necessary',
    purpose:
      'Let the site load, remember your chosen study destination and audience view for the session, and keep the site secure. The site does not work properly without these, so they are not optional.',
    consent: 'Always on',
  },
  {
    name: 'Analytics',
    purpose:
      'Privacy-respecting, aggregate measurement (Vercel Analytics and Speed Insights) that tells us which pages are useful and how the site performs. We do not use it to identify you.',
    consent: 'Non-essential',
  },
  {
    name: 'Advertising',
    purpose:
      'Google AdSense may set cookies to show ads and, where permitted, personalise them based on your visits to this and other sites. These help keep the site free.',
    consent: 'Non-essential',
  },
];

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Last updated {LAST_UPDATED}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial leading-[1.08] text-ink mb-5">
          Cookie Policy
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
          This page explains what cookies are, which ones GlobalStudyBoard uses, and how you can
          control them. It sits alongside our{' '}
          <Link href="/privacy" className="text-forest-700 hover:text-forest-800 underline">
            Privacy Policy
          </Link>
          .
        </p>
      </header>

      <Section title="What cookies are">
        <p>
          Cookies are small text files a website stores on your device to make it work, remember your
          preferences, and understand how it is used. Similar technologies (such as local storage)
          are covered by this policy too. We keep our use of them to the minimum needed to run and
          improve the site.
        </p>
      </Section>

      <Section title="Cookies we use">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-stone-200">
                <th className="py-2 pr-4 font-semibold text-ink align-top">Type</th>
                <th className="py-2 pr-4 font-semibold text-ink align-top">What it does</th>
                <th className="py-2 font-semibold text-ink align-top whitespace-nowrap">Category</th>
              </tr>
            </thead>
            <tbody>
              {COOKIE_TYPES.map((c) => (
                <tr key={c.name} className="border-b border-stone-100 align-top">
                  <td className="py-3 pr-4 font-semibold text-ink whitespace-nowrap">{c.name}</td>
                  <td className="py-3 pr-4 text-stone-700">{c.purpose}</td>
                  <td className="py-3 text-stone-600 whitespace-nowrap">{c.consent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Advertising &amp; personalisation">
        <p>
          We display advertising through <strong>Google AdSense</strong>. Google and its partners may
          use cookies to serve and, where permitted, personalise ads based on your visits to this and
          other sites. We do not sell your personal information for money; some privacy laws (such as
          California&rsquo;s CCPA/CPRA) treat the use of advertising cookies for personalised ads as a
          &ldquo;sale&rdquo; or &ldquo;share&rdquo;, which you can limit using the choices below.
        </p>
        <p>
          Cookie-consent requirements vary by region — for example, visitors in the EEA and the UK
          must be able to consent to non-essential cookies before they are used. Where such a choice
          applies, you can accept or decline non-essential cookies and change your decision at any
          time.
        </p>
      </Section>

      <Section title="How to control cookies">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Your browser</strong> — you can block or delete cookies in your browser settings.
            Blocking strictly-necessary cookies may stop parts of the site working.
          </li>
          <li>
            Opt out of personalised advertising in{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:text-forest-800 underline"
            >
              Google Ad Settings
            </a>
            .
          </li>
          <li>
            Opt out of personalised ads from many vendors at{' '}
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:text-forest-800 underline"
            >
              aboutads.info
            </a>{' '}
            and{' '}
            <a
              href="https://www.youronlinechoices.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:text-forest-800 underline"
            >
              youronlinechoices.eu
            </a>
            .
          </li>
          <li>
            Read how Google uses cookies in advertising at{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:text-forest-800 underline"
            >
              policies.google.com/technologies/partner-sites
            </a>
            .
          </li>
        </ul>
      </Section>

      <Section title="Changes &amp; contact">
        <p>
          We may update this policy as the site evolves; the date above reflects the latest revision.
          Questions about cookies? Email us at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-forest-700 hover:text-forest-800 underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          or use the{' '}
          <Link href="/contact" className="text-forest-700 hover:text-forest-800 underline">
            contact page
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
