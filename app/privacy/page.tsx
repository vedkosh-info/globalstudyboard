import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'Privacy Policy',
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

const LAST_UPDATED = '3 September 2026';

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
          <li>
            <strong>Your email address, only if you ask to test the Android app</strong> — see the
            section below. Nothing else on the site asks you for personal details.
          </li>
        </ul>
      </Section>

      <Section title="Android beta-tester sign-up">
        <p>
          The GlobalStudyBoard Android app is in a closed beta on Google Play. Google Play can only
          send an invitation to a specific Google account, so if you use the &ldquo;Get the Android
          app&rdquo; button we ask for one thing: the email address of that account.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>What we store</strong> — your email address, plus the page you were on, the study
            destination you had selected, and the date. Nothing else, and no name or account.
          </li>
          <li>
            <strong>Why</strong> — solely to add you to the tester list in the Google Play Console so
            that Google Play can email you the invitation.
          </li>
          <li>
            <strong>Where</strong> — a private Google Sheet that only we can open. We do not sell,
            rent, share or publish it, and we do not use it for marketing or newsletters.
          </li>
          <li>
            <strong>How long we keep it</strong> — only while the beta needs it. We delete the list
            once the app is publicly available on Google Play, and we remove any individual address
            sooner on request.
          </li>
          <li>
            <strong>Removal</strong> — email us at any time and we will delete your address from the
            sheet and from the Play tester list.
          </li>
        </ul>
        <p>
          Adding you as a tester also means Google receives that email address as part of running
          Google Play; Google&rsquo;s own privacy policy governs what it does with it.
        </p>
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
        <p>
          Cookie-consent requirements vary by region — for example, the EEA and the UK require
          consent for non-essential cookies. You can accept or refuse non-essential cookies using
          your browser settings and the opt-outs above. For a fuller breakdown of the cookies we use
          and how to manage them, see our{' '}
          <Link href="/cookies" className="text-forest-700 hover:text-forest-800 underline">
            Cookie Policy
          </Link>
          .
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
        <p>
          We do not sell your personal information for money. Some privacy laws (such as
          California&rsquo;s CCPA/CPRA) treat the use of advertising cookies for personalised ads as a
          &ldquo;sale&rdquo; or &ldquo;share&rdquo; — you can limit this through the choices in our{' '}
          <Link href="/cookies" className="text-forest-700 hover:text-forest-800 underline">
            Cookie Policy
          </Link>
          .
        </p>
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

      <Section title="Your rights &amp; choices">
        <p>
          You can browse without providing personal details and control or disable cookies through
          your browser. For any information you have sent us (for example, an email), you can ask us
          to confirm what we hold, correct it, or delete it — just contact us using the details
          below and we&rsquo;ll respond within a reasonable time. We may need to verify your identity,
          and we may keep information where the law requires. Depending on where you live,
          data-protection laws such as the GDPR (UK/EU), CCPA (California) and India&rsquo;s DPDP Act
          may give you additional rights; wherever practical, we extend the same choices to all our
          users.
        </p>
      </Section>

      <Section title="Who we are &amp; how to contact us">
        <p>
          GlobalStudyBoard is an independent educational guide, operated from India, and is the
          party responsible for (the data controller of) the information described in this policy.
          For any privacy question, or to exercise a data right, email us at{' '}
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
          . We may update this policy as the site evolves; the date above reflects the latest
          revision.
        </p>
      </Section>
    </div>
  );
}
