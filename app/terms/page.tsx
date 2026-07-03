import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'Terms of Use — GlobalStudyBoard',
  description:
    'The terms governing your use of GlobalStudyBoard, including the accuracy disclaimer, acceptable use, and limitation of liability.',
  alternates: { canonical: 'https://www.globalstudyboard.com/terms' },
  openGraph: {
    type: 'website',
    url: 'https://www.globalstudyboard.com/terms',
    title: 'Terms of Use — GlobalStudyBoard',
    description: 'The terms that govern your use of GlobalStudyBoard.',
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

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-3">
          Last updated {LAST_UPDATED}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial leading-[1.08] text-ink mb-5">
          Terms of Use
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
          By using GlobalStudyBoard you agree to these terms. Please read them — especially the parts
          about accuracy and how you should use the information here.
        </p>
      </header>

      <Section title="About the service">
        <p>
          GlobalStudyBoard is an independent, informational guide to universities, entrance exams and
          scholarships worldwide. We are not a university, examination body, or paid admissions agent,
          and we are not affiliated with the institutions we describe.
        </p>
      </Section>

      <Section title="Information is for guidance only">
        <p>
          We work hard to keep information accurate and to cite official sources, but admission rules,
          fees, deadlines, rankings and eligibility change frequently and may contain errors or
          omissions. Information on this site is provided <strong>&ldquo;as is&rdquo; for general
          guidance only</strong> and is not professional, legal, financial or immigration advice.
        </p>
        <p>
          Always verify the current details on the official university or examination website before
          making any decision or application. See our full{' '}
          <Link href="/disclaimer" className="text-forest-700 hover:text-forest-800 underline">
            disclaimer
          </Link>
          .
        </p>
      </Section>

      <Section title="Acceptable use">
        <ul className="list-disc pl-5 space-y-2">
          <li>Use the site for lawful, personal, non-commercial research.</li>
          <li>Do not scrape, republish or resell our content at scale without permission.</li>
          <li>Do not attempt to disrupt, attack, or gain unauthorised access to the site.</li>
          <li>Do not use the site or GSB AI to facilitate academic dishonesty.</li>
        </ul>
      </Section>

      <Section title="GSB AI assistant">
        <p>
          GSB AI generates responses automatically and can be incomplete or wrong. Treat its answers
          as a starting point, not a final authority, and confirm important details with official
          sources.
        </p>
      </Section>

      <Section title="Third-party links &amp; advertising">
        <p>
          The site links to official and third-party websites and may display advertising. We are not
          responsible for the content, accuracy or practices of third-party sites.
        </p>
      </Section>

      <Section title="Intellectual property">
        <p>
          The GlobalStudyBoard name, design and original written content are ours. Names, trademarks
          and logos of exams, universities and organisations belong to their respective owners and
          are used here for identification and reference only — their use does not imply any
          affiliation with or endorsement by those owners.
        </p>
        <p>
          If you believe any content on GlobalStudyBoard infringes your copyright or trademark,
          email us at{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-forest-700 hover:text-forest-800 underline"
          >
            {CONTACT_EMAIL}
          </a>{' '}
          with details of the material and your rights, and we will review it and, where
          appropriate, correct or remove it promptly.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the fullest extent permitted by law, GlobalStudyBoard is not liable for any loss arising
          from reliance on information provided here. Your use of the site is at your own risk.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of India, without regard to conflict-of-law
          principles. Any dispute relating to these terms or your use of the site is subject to the
          jurisdiction of the courts of India. If any provision of these terms is found to be
          unenforceable, the remaining provisions continue in full effect.
        </p>
      </Section>

      <Section title="Changes &amp; contact">
        <p>
          We may update these terms; the date above reflects the latest version. Continued use after
          changes means you accept the updated terms. Questions? Use the{' '}
          <Link href="/contact" className="text-forest-700 hover:text-forest-800 underline">
            contact page
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
