import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site-meta';
import TableScroller from '@/components/tools/TableScroller';

export const metadata: Metadata = pageMetadata({
  title: 'Cookie Policy',
  description:
    'How GlobalStudyBoard uses cookies: the strictly necessary, analytics and advertising cookies we rely on, and how you can control or refuse them.',
  path: '/cookies',
});

const LAST_UPDATED = '29 September 2026';

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 id={id} className="font-display text-2xl font-bold tracking-editorial text-ink">
        {title}
      </h2>
      <div className="space-y-3 text-stone-700 leading-relaxed">{children}</div>
    </section>
  );
}

/**
 * `purpose` is one paragraph, or a short list when a type covers several
 * stores: the sign-in row describes five, and one run-on sentence for them
 * (as it used to be) is the "wall of text" §15 rules out. The local-storage
 * items are described from what the code writes — lib/auth-events.ts (the
 * sign-in marker and resume note, written by components/auth/LoginForm and
 * read by AuthProvider and the Save / Add buttons), components/ContentActions
 * (the "Helpful" mark), hooks/useHistory (recent pages) and lib/feedback-draft;
 * change this page in the same commit as any of them (§9.4).
 *
 * The -code-verifier cookies are the SDK's own (PKCE). auth-js 2.116 writes
 * three per sign-in start — a per-sign-in slot, an index of pending sign-ins
 * and a legacy copy — and app/auth/callback's exchange (no flow id) removes
 * only the legacy copy; a code sign-in removes none. The SDK's own sign-out
 * removes the ones its index lists, which misses a slot whose index entry was
 * lost to two sign-ins started at once; signOutThisDevice (every sign-out on
 * this site) then sweeps the whole sb-<ref>-auth-token-* prefix
 * (lib/supabase/config clearLocalAuthCookies — which the tools' forced
 * sign-out also runs when the SDK could not clear storage), so "removes them
 * all" holds. @supabase/ssr writes each with a 400-day max-age. Checked
 * against the real SDK on 29 Sep 2026; re-check on an SDK upgrade.
 *
 * The resume bullet matches lib/auth-events takeResumeIntent (review
 * G10-SK-1, applied 30 Sep 2026): only the Save or Add button whose action
 * and page match removes a fresh note and carries it out; a fresh note for
 * another action or page waits for its own button (or the next sign-in
 * replaces it);
 * whichever button reads a stale or unreadable note removes it. The pending
 * bullet matches takeSignInPending, which removes the marker on any read.
 */
const COOKIE_TYPES: { name: string; purpose: string | string[]; consent: string }[] = [
  {
    name: 'Strictly necessary',
    purpose: [
      'Let the site load and keep it secure.',
      'Remember the study destination and audience view you choose, on this device (kept for up to a year, or until you clear your browser data). We do not write these preference cookies until you actually make a choice — or until you sign in to an account that has a saved choice, in which case we restore it — until then the site simply shows its default view. They store only that choice, never an identifier, and are never used for tracking or advertising.',
      'If you start writing feedback, the unsent text is kept in your browser\u2019s local storage so you can finish later; it is cleared when you send or discard it, or after seven days.',
      'The \u201cRecent pages\u201d drawer keeps a short list of the pages you opened (address, title and when you opened them) in local storage on this device only \u2014 never the sign-in, account or admin pages \u2014 which you can clear from the drawer itself.',
      'If you mark a guide, university or exam page as \u201cHelpful\u201d, that mark \u2014 the page\u2019s address, no identifier \u2014 is kept in local storage on this device until you press the button again or clear your browser data. It is never sent to us.',
    ],
    consent: 'Always on',
  },
  {
    name: 'Sign-in session (only if you sign in)',
    purpose: [
      'Once you sign in to the optional account, a first-party cookie (named sb-\u2026-auth-token) holds your session token so you stay signed in on this device; it is what identifies you to your own account and nothing else. It is removed when you sign out or delete your account, or after long inactivity.',
      'When a sign-in by e-mail or Google starts, a few small cookies whose names end in -code-verifier (sb-\u2026-code-verifier), holding random values and no identifier, are written so that only the browser that asked can complete it. None of them is used again once that sign-in has finished or been abandoned, but some can stay, unused, until you next sign out on this device (which removes them all), clear your cookies, or 400 days pass from when they were written.',
      'While you start a sign-in, a first-party gsb_consent cookie also records for up to 15 minutes that you ticked the consent box \u2014 it holds only the revision date of the Terms and Privacy Policy you accepted, no identifier \u2014 and is cleared when the sign-in completes.',
      'Starting a sign-in by e-mail or with Google also notes the time you started in your browser\u2019s local storage (gsb-auth-pending; no identifier), so that the page you come back to signed in can finish the sign-in: it applies your account\u2019s remembered destination and audience to a device that has none, and announces that you are signed in. It is removed the first time a page loads with you signed in, or when you finish by entering the code, and it is ignored if it is more than 20 minutes old.',
      'A sign-in by e-mail or Google started from the sign-in window (the panel that opens over the page) also leaves a note in local storage (gsb-auth-resume-v1) with the page you were on, what opened the window (a Sign in, Save or Add button) and the time \u2014 no identifier. Only a Save or Add button acts on it, and only on the same page within 20 minutes: when you come back signed in, the button that opened the window removes the note and carries out that save or add. Any note not acted on is replaced by your next sign-in from that window, and removed when you finish by entering the code or clear your browser data; after 20 minutes it is ignored, and the next Save or Add button that reads it then removes it.',
      'None of these is used for tracking or advertising.',
    ],
    consent: 'Always on once you sign in',
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

      <Section id="cookies-we-use" title="Cookies we use">
        {/* Type and Category wrap below tablet width so the long "What it does" column keeps a readable width; if the
            table still overflows (the narrowest phones), the scroller is focusable and named so a keyboard can scroll it. */}
        <TableScroller labelledBy="cookies-we-use" className="rounded-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left border-b border-stone-200">
                <th className="py-2 pr-4 font-semibold text-ink align-top">Type</th>
                <th className="py-2 pr-4 font-semibold text-ink align-top">What it does</th>
                <th className="py-2 font-semibold text-ink align-top md:whitespace-nowrap">Category</th>
              </tr>
            </thead>
            <tbody>
              {COOKIE_TYPES.map((c) => (
                <tr key={c.name} className="border-b border-stone-100 align-top">
                  <td className="py-3 pr-4 font-semibold text-ink md:whitespace-nowrap">{c.name}</td>
                  <td className="py-3 pr-4 text-stone-700">
                    {Array.isArray(c.purpose) ? (
                      <ul className="m-0 list-disc space-y-2 pl-5">
                        {c.purpose.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      c.purpose
                    )}
                  </td>
                  <td className="py-3 text-stone-600 md:whitespace-nowrap">{c.consent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroller>
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
