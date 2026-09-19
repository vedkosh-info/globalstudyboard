import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL } from '@/lib/site-meta';

/**
 * Public account-deletion page.
 *
 * Google Play's User Data policy requires an app that offers account creation
 * to provide a deletion path that is reachable from a public web URL WITHOUT
 * installing the app or signing in — /account cannot serve as that URL (it is
 * login-gated and noindex). This page is that URL: it is static, indexable, in
 * the sitemap, and states exactly what deletion removes, what (if anything) is
 * retained, and for how long. The Play Console "Data deletion" field points here.
 */
const LAST_UPDATED = '19 September 2026';

export const metadata: Metadata = pageMetadata({
  title: 'Delete your account',
  description:
    'How to delete your GlobalStudyBoard account and everything stored with it — from the site or app in a few taps, or by e-mail. Deletion is immediate and permanent.',
  path: '/delete-account',
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-bold tracking-editorial text-ink">{title}</h2>
      <div className="space-y-3 text-stone-700 leading-relaxed">{children}</div>
    </section>
  );
}

export default function DeleteAccountPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-600">Last updated {LAST_UPDATED}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-editorial text-ink">Delete your account</h1>
        <p className="text-lg text-stone-700 leading-relaxed">
          You can delete your GlobalStudyBoard account yourself at any time, from the website or the Android
          app. Deletion is immediate and permanent. An account is optional — every guide stays free to read
          without one.
        </p>
      </header>

      <Section title="Delete it yourself (recommended)">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Sign in and open{' '}
            <Link href="/account" className="text-forest-700 hover:text-forest-800 underline">
              Your account
            </Link>{' '}
            (in the app: tap the <strong>account icon</strong> — a person symbol in the bar just below
            the site name — then <strong>Your account</strong>).
          </li>
          <li>
            Open the <strong>Data &amp; account</strong> tab and choose <strong>Delete account</strong>.
          </li>
          <li>
            Type <strong>DELETE</strong> to confirm. Your account is removed straight away and you are signed out.
          </li>
        </ol>
        <p>
          Want a copy first? <strong>Download my data</strong> on the same page gives you a JSON file of everything
          we hold.
        </p>
      </Section>

      <Section title="Or ask us by e-mail">
        <p>
          If you can no longer sign in, e-mail{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-forest-700 hover:text-forest-800 underline">
            {CONTACT_EMAIL}
          </a>{' '}
          <strong>from the address the account is registered to</strong> with the subject “Delete my account”.
          We verify the request against that address and delete the account, normally within 7 days. We may
          ask you to confirm from the same mailbox once.
        </p>
      </Section>

      <Section title="What is deleted">
        <ul className="list-disc space-y-2 pl-5">
          <li>Your sign-in (e-mail address and, if you used it, the link to your Google account).</li>
          <li>Your display name and your remembered study destination and audience view.</li>
          <li>Every page you saved.</li>
          <li>The record of when you accepted our Terms and read the Privacy Policy.</li>
        </ul>
        <p>All of this is removed at once; there is no “deactivated” state and no recovery period.</p>
      </Section>

      <Section title="What is kept, and for how long">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Only the provider&rsquo;s short-lived security logs.</strong> Our sign-in provider keeps its
            own technical logs of sign-ins (the address that signed in, from which IP address and browser — not
            what you did) for a matter of days under its retention policy; we cannot delete them early. If your
            account was ever suspended, the fact and time of that action and an internal
            account identifier — never the note behind it, never your e-mail address — are kept for up
            to 12 months for safety and dispute purposes, then removed automatically.
          </li>
          <li>
            If you ever asked to test the Android app, that e-mail address lives on a separate list and is
            not part of your account — see the{' '}
            <Link href="/privacy" className="text-forest-700 hover:text-forest-800 underline">
              Privacy Policy
            </Link>{' '}
            for how to have it removed.
          </li>
          <li>
            Anonymous, aggregate analytics (page views, device type) are never linked to an account and are
            unaffected.
          </li>
        </ul>
      </Section>

      <Section title="Questions">
        <p>
          Anything unclear? Write to{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-forest-700 hover:text-forest-800 underline">
            {CONTACT_EMAIL}
          </a>{' '}
          or read our{' '}
          <Link href="/privacy" className="text-forest-700 hover:text-forest-800 underline">
            Privacy Policy
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
