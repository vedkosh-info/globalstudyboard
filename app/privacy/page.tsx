import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site-meta';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How GlobalStudyBoard handles your data: what we collect, how analytics and advertising cookies are used, and your choices.',
  path: '/privacy',
});

const LAST_UPDATED = '19 September 2026';

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
          details to browse. We collect information in the following ways:
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
            <strong>Your account, only if you choose to create one</strong> — an optional, free
            account that remembers your study destination and saved pages. What it stores is set
            out in the &ldquo;Your account&rdquo; section below.
          </li>
          <li>
            <strong>Your email address, only if you ask to test the Android app</strong> — see the
            section below.
          </li>
          <li>
            <strong>Feedback and issue reports you choose to send</strong> — what you write, the
            page link, any screenshot or PDF you attach, and an email address only if you add one.
            See the section below. Nothing else on the site asks you for personal details.
          </li>
        </ul>
      </Section>

      <Section title="Your account">
        <p>
          You never need an account to read GlobalStudyBoard. If you create one, it is
          passwordless: you sign in with a one-time code or link that we e-mail you or, where we
          offer it, with your Google account. Here is exactly what an account involves.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>What we store</strong> — your e-mail address; a display name (one you enter, or,
            if you sign in with Google, the name on your Google account until you change it); the
            study destination and the domestic/international view you last chose; the pages you
            save (each page&rsquo;s title, address, study destination and the time you saved it);
            the date and time you accepted our Terms and read this policy; and, only if we ever had
            to suspend your account, a short note explaining why (see &ldquo;How long we keep
            it&rdquo;). We never ask for a password, your date of birth, your nationality, a phone
            number or a photo.
          </li>
          <li>
            <strong>Google Sign-In</strong> — if you use it, Google shares your Google account
            e-mail address, the name on that account, a link to its profile picture and a Google
            account identifier with us. They sit only inside your sign-in record; we display the
            name (as your editable display name) and never show or use the picture. We never see
            your Google password. Google&rsquo;s own privacy policy governs what Google does on its
            side.
          </li>
          <li>
            <strong>Why</strong> — solely to run your account: to sign you in, keep your saved pages
            and preferences across devices, and answer your requests. We do not use your account
            for marketing, and we never sell or share it.
          </li>
          <li>
            <strong>Where and who processes it</strong> — your account data is held for us by{' '}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:text-forest-800 underline"
            >
              Supabase
            </a>{' '}
            (our authentication and database provider) in its Mumbai, India data-centre region.
            The website itself is hosted by{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:text-forest-800 underline"
            >
              Vercel
            </a>
            , whose servers handle your sign-in, data-download and deletion requests on the way
            to Supabase. Sign-in e-mails are sent through our transactional e-mail provider,{' '}
            <a
              href="https://resend.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest-700 hover:text-forest-800 underline"
            >
              Resend
            </a>
            , which sees only the address it delivers to and the code or link in the message. Each
            of your records is only ever readable by you (row-level security) and, for support, by
            us.
          </li>
          <li>
            <strong>Cookies</strong> — signing in sets a first-party session cookie on your device
            so you stay signed in; it is strictly necessary, is never used for tracking or
            advertising, and is removed when you sign out or delete your account. While you start
            a sign-in, a short-lived first-party cookie records only that you ticked the consent
            box. See our{' '}
            <Link href="/cookies" className="text-forest-700 hover:text-forest-800 underline">
              Cookie Policy
            </Link>
            .
          </li>
          <li>
            <strong>Security logs</strong> — to protect accounts, our authentication provider
            records each sign-in (the e-mail address, IP address and browser) in its own security
            logs, and each active session (removed when you sign out or it expires). Those logs are held by the
            provider under its retention policy — a matter of days, not months — and we cannot
            lengthen or shorten it. Sign-in requests are rate limited by address and by IP; those
            counters live in memory for minutes and are never stored.
          </li>
          <li>
            <strong>International transfers</strong> — your account data is stored in India
            (Supabase, Mumbai) and passes through Vercel&rsquo;s and Resend&rsquo;s systems, which
            may process it in the United States. If you use the site from the EEA, the UK or
            another jurisdiction with transfer rules, those transfers take place under each
            provider&rsquo;s data-processing agreement and standard contractual clauses.
          </li>
          <li>
            <strong>How long we keep it</strong> — for as long as your account exists. Delete the
            account and everything above is erased immediately; there is no deactivated state and
            no recovery period. If we ever had to suspend an account, we keep the action, its time
            and an internal account identifier — the note explaining it (which you can see in your
            data download while the account exists) is deleted with the account, and never your
            e-mail address — for up to 12 months for safety and dispute purposes; a scheduled job
            removes older records automatically. Provider security logs are kept by the provider
            for days, as described above.
          </li>
          <li>
            <strong>Your controls</strong> — from{' '}
            <Link href="/account" className="text-forest-700 hover:text-forest-800 underline">
              Your account
            </Link>{' '}
            you can download everything we hold about you as a file, change your display name,
            remove saved pages, sign out, or delete the account permanently. The{' '}
            <Link href="/delete-account" className="text-forest-700 hover:text-forest-800 underline">
              Delete your account
            </Link>{' '}
            page explains the same steps for the Android app and for requests by e-mail.
          </li>
          <li>
            <strong>Age</strong> — you must be 18 or older to create an account (see
            &ldquo;Children&rsquo;s privacy&rdquo; below). Younger students can read every page
            without one.
          </li>
          <li>
            <strong>Security</strong> — there is no password to leak; sign-in requests are rate
            limited; and we may suspend an account that is used to attack or abuse the site.
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

      <Section title="Feedback and issue reports">
        <p>
          Every page has a &ldquo;Share feedback&rdquo; / &ldquo;Report an issue&rdquo; option. It
          is open to everyone — no account, and no email address unless you want a reply.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>What we store</strong> — the title and description you write, the page link,
            the study destination and domestic/international view you had selected, the date, and
            any screenshot or PDF you attach (up to two files). The &ldquo;include browser
            details&rdquo; box (ticked by default for issue reports, off for suggestions — you can
            change it) adds your screen size, browser language and browser user-agent string, which
            help us reproduce a problem; the form shows you exactly what it will send. If you enter
            an email address we keep that too.
          </li>
          <li>
            <strong>Why</strong> — solely to understand and fix the problem or consider the
            suggestion, and, if you gave an email address, to reply to you about it.
          </li>
          <li>
            <strong>Where</strong> — a private Google Sheet and a private Google Drive folder that
            only we can open, plus a notification emailed to our own inbox (text only; attachments
            stay in the Drive folder). We do not sell, rent, share or publish reports, and we never
            use an email address given here for marketing.
          </li>
          <li>
            <strong>How long we keep it</strong> — while a report is still useful for improving
            the site. On request we delete the report, its attachments and any email address —
            including the copy in our notification inbox.
          </li>
          <li>
            <strong>Removal</strong> — email{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-forest-700 hover:text-forest-800 underline">
              {CONTACT_EMAIL}
            </a>{' '}
            with the reference shown after you send a report (or the page and date) and we will
            delete it.
          </li>
          <li>
            <strong>Unsent drafts</strong> — while you are writing, the text is saved only in your
            own browser so you can finish later; it never leaves your device until you send it, and
            it is cleared when you send or discard it (or after seven days). An email address you
            type is not saved in the draft.
          </li>
        </ul>
        <p>
          Please do not include anyone else&rsquo;s personal details, or sensitive information such
          as identity documents or health information, in a report or a screenshot.
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
          The site is intended for prospective students and their families, and every page can be
          read without giving us any personal details. Because the laws that protect younger
          people differ by country (for example, India&rsquo;s DPDP Act treats anyone under 18 as a
          child), <strong>accounts are for people aged 18 or over</strong>: you confirm this when
          you sign in for the first time. We do not knowingly create accounts for, or collect
          personal information from, anyone under 18; if you believe we hold such information,
          contact us and we will delete it.
        </p>
      </Section>

      <Section title="Your rights &amp; choices">
        <p>
          You can browse without providing personal details and control or disable cookies through
          your browser. If you have an account, you can download, correct or delete your own data
          yourself at any time from{' '}
          <Link href="/account" className="text-forest-700 hover:text-forest-800 underline">
            Your account
          </Link>
          . For any other information you have sent us (for example, an email), you can ask us to
          confirm what we hold, correct it, or delete it — just contact us using the details below
          and we&rsquo;ll respond within a reasonable time. We may need to verify your identity,
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
