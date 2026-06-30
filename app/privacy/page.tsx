import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — GlobalStudyBoard',
  description:
    'How GlobalStudyBoard handles your data: what we collect, how analytics and advertising cookies are used, and your choices.',
  alternates: { canonical: 'https://www.globalstudyboard.com/privacy' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/privacy',
    title: 'Privacy Policy — GlobalStudyBoard',
    description: 'What we collect, how analytics and advertising work, and your choices.',
    images: ['/opengraph-image'],
  },
};

const LAST_UPDATED = '27 June 2026';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-bold tracking-editorial text-ink">{title}</h2>
      <div className="space-y-3 text-stone-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Last updated {LAST_UPDATED}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial leading-[1.08] text-ink mb-5">
          Privacy Policy
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
          This policy explains what information GlobalStudyBoard collects when you use the site, why,
          and the choices you have. We keep data collection to the minimum needed to run and improve
          the site.
        </p>
      </header>

      <Section title="Information we collect">
        <p>
          GlobalStudyBoard does not require you to create an account, and we do not ask for personal
          details to browse. We collect information in two ways:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Information you choose to send</strong> — for example, if you email us or use the
            GSB AI assistant, your message is processed to answer you.
          </li>
          <li>
            <strong>Automatically collected usage data</strong> — standard analytics such as pages
            viewed, approximate region, device and browser type, used in aggregate to understand
            what&rsquo;s useful.
          </li>
        </ul>
      </Section>

      <Section title="Cookies, analytics &amp; advertising">
        <p>
          We use privacy-respecting analytics (Vercel Analytics and Speed Insights) to measure
          traffic and performance in aggregate.
        </p>
        <p>
          We also display advertising through <strong>Google AdSense</strong>. Third-party vendors,
          including Google, use cookies to serve ads based on a user&rsquo;s prior visits to this and
          other websites. Google&rsquo;s use of advertising cookies enables it and its partners to
          show ads based on your visits to this site and/or other sites on the internet.
        </p>
        <p>
          You can opt out of personalised advertising in{' '}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-700 hover:text-forest-800 underline"
          >
            Google Ad Settings
          </a>
          , read how Google uses information from sites that use its services at{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-700 hover:text-forest-800 underline"
          >
            policies.google.com/technologies/partner-sites
          </a>
          , and opt out of personalised ads from many vendors at{' '}
          <a
            href="https://www.aboutads.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-700 hover:text-forest-800 underline"
          >
            aboutads.info
          </a>
          . You can also control or disable cookies in your browser settings.
        </p>
      </Section>

      <Section title="The GSB AI assistant">
        <p>
          Questions you send to GSB AI are processed by a third-party AI provider solely to generate
          a response. Please don&rsquo;t share sensitive personal information in your queries.
        </p>
      </Section>

      <Section title="How we use information">
        <ul className="list-disc pl-5 space-y-2">
          <li>To operate, maintain and improve the site.</li>
          <li>To respond to your messages and corrections.</li>
          <li>To measure traffic and performance in aggregate.</li>
          <li>To show advertising that helps keep the site free.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </Section>

      <Section title="Third-party links">
        <p>
          Our pages link to official university and examination websites and other third parties.
          Their privacy practices are governed by their own policies, not ours.
        </p>
      </Section>

      <Section title="Children&rsquo;s privacy">
        <p>
          The site is intended for prospective students and their families. We do not knowingly
          collect personal information from children under 13.
        </p>
      </Section>

      <Section title="Your choices">
        <p>
          You can browse without providing personal details, control cookies through your browser,
          and contact us to ask about any information you&rsquo;ve sent us.
        </p>
      </Section>

      <Section title="Changes &amp; contact">
        <p>
          We may update this policy as the site evolves; the date above reflects the latest revision.
          Questions? Reach us via the{' '}
          <Link href="/contact" className="text-forest-700 hover:text-forest-800 underline">
            contact page
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
