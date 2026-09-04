import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import Header from '@/components/Header';
import type { TopicsMenuData } from '@/components/TopicsMenu';
import Footer from '@/components/Footer';
import { RegionProvider } from '@/components/RegionProvider';
import RegionContextBar from '@/components/RegionContextBar';
import RegionAnnouncer from '@/components/RegionAnnouncer';
import { AudienceProvider } from '@/components/AudienceProvider';
import AudienceAnnouncer from '@/components/AudienceAnnouncer';
import SiteSearch from '@/components/SiteSearch';
import Breadcrumbs from '@/components/Breadcrumbs';
import FabDock from '@/components/FabDock';
import RecentPages from '@/components/RecentPages';
import TesterInviteModal from '@/components/TesterInviteModal';
import { REGIONS } from '@/lib/regions';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { tracksForRegion, trackHref, isMultiHubTrack, topicsForTrack } from '@/lib/tracks';
import { ADSENSE_CLIENT_ID, ADSENSE_SCRIPT_SRC } from '@/lib/adsense';
import { CONTACT_EMAIL } from '@/lib/site-meta';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});


export const viewport: Viewport = {
  themeColor: '#14532D',
  width: 'device-width',
  initialScale: 1,
  // Extend under the notch / Dynamic Island and home indicator on iPhone so the
  // page fills the screen edge-to-edge; the `env(safe-area-inset-*)` padding in
  // globals.css then keeps the floating buttons clear of the home indicator.
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.globalstudyboard.com'),
  title: {
    default: 'GlobalStudyBoard — Universities, Exams & Scholarships Worldwide',
    template: '%s · GlobalStudyBoard',
  },
  description:
    'Free guide to universities, entrance exams, and scholarships worldwide — USA, UK, Europe, Canada, Australia, India and more. Compare SAT, GRE, IELTS, A-Levels, UCAS, Common App.',
  keywords: [
    'study abroad',
    'university admissions guide',
    'SAT ACT preparation',
    'common application help',
    'UCAS application guide',
    'study in USA',
    'study in UK',
    'study in Europe',
    'study in Canada',
    'study in Australia',
    'entrance exams comparison',
    'college guide international students',
    'student visa guide',
    'graduate school abroad',
    'international scholarships',
    'GRE GMAT preparation',
  ],
  authors: [{ name: 'GlobalStudyBoard' }],
  openGraph: {
    type: 'website',
    siteName: 'GlobalStudyBoard',
    locale: 'en_US',
    title: 'GlobalStudyBoard — Universities, Exams & Scholarships Worldwide',
    description:
      'Free guide to universities, entrance exams, and scholarships worldwide. Compare SAT, GRE, IELTS, A-Levels and more. Ask GSB AI for personalised guidance.',
    url: 'https://www.globalstudyboard.com',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalStudyBoard — Universities, Exams & Scholarships Worldwide',
    description: 'Free guide to universities, entrance exams, and scholarships worldwide. Compare SAT, GRE, IELTS, A-Levels and more.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: 'https://www.globalstudyboard.com',
    types: { 'application/rss+xml': 'https://www.globalstudyboard.com/feed.xml' },
  },
  // Google AdSense site-ownership verification (server-rendered meta tag).
  other: { 'google-adsense-account': ADSENSE_CLIENT_ID },
};

const websiteJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.globalstudyboard.com/#organization',
      name: 'GlobalStudyBoard',
      url: 'https://www.globalstudyboard.com',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://www.globalstudyboard.com/#logo',
        url: 'https://www.globalstudyboard.com/icon.svg',
        contentUrl: 'https://www.globalstudyboard.com/icon.svg',
      },
      description: 'Free guide to universities, entrance exams, and scholarships worldwide.',
      email: CONTACT_EMAIL,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: CONTACT_EMAIL,
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.globalstudyboard.com/#website',
      name: 'GlobalStudyBoard',
      url: 'https://www.globalstudyboard.com',
      inLanguage: 'en',
      description: 'Free guide to universities, entrance exams, and scholarships worldwide.',
      publisher: { '@id': 'https://www.globalstudyboard.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.globalstudyboard.com/gsb-ai?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
});

/**
 * Compact slug→short-name map for every test referenced by a region's
 * `keyExamSlugs`, computed once at build time so the region-aware footer can
 * label its links without shipping the full exam catalogue to the browser.
 */
const FOOTER_EXAM_LABELS: Record<string, string> = (() => {
  const slugs = Array.from(new Set(REGIONS.flatMap((r) => r.keyExamSlugs)));
  const map: Record<string, string> = {};
  for (const slug of slugs) {
    const exam = ENTRANCE_EXAMS.find((e) => e.slug === slug);
    if (exam) map[slug] = exam.shortName;
  }
  return map;
})();

/**
 * Compact per-region track projection for the desktop "Topics" mega-menu,
 * computed once at build time so the region-aware header can render its menu
 * without shipping the full `lib/tracks` + `lib/topics` catalogue (≈0.35 MB) to
 * the browser on every page. Mirrors FOOTER_EXAM_LABELS above.
 */
const TOPICS_MENU: TopicsMenuData = (() => {
  const out: TopicsMenuData = {};
  for (const region of REGIONS) {
    out[region.slug] = tracksForRegion(region.slug).map((t) => ({
      label: t.label,
      href: trackHref(t),
      preview: isMultiHubTrack(t)
        ? topicsForTrack(t)
            .slice(0, 3)
            .map((h) => h.label)
            .join(' · ')
        : null,
    }));
  }
  return out;
})();

/**
 * Copyright year computed once at build time so the prerendered static HTML and
 * the client agree (avoids a year-boundary hydration mismatch from a client-side
 * new Date()).
 */
const COPYRIGHT_YEAR = new Date().getFullYear();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteJsonLd }} />
        <RegionProvider>
          <AudienceProvider>
          <Header topicsMenu={TOPICS_MENU} />
          <RegionContextBar />
          <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
            <div className="mb-6 space-y-3">
              <SiteSearch />
              <Breadcrumbs />
            </div>
            {children}
          </main>
          <Footer examLabels={FOOTER_EXAM_LABELS} year={COPYRIGHT_YEAR} />
          <RegionAnnouncer />
          <AudienceAnnouncer />
          <RecentPages />
          <TesterInviteModal />
          <FabDock />
          </AudienceProvider>
        </RegionProvider>
        {/*
          Google AdSense loader for "full page" Auto ads. The single loader on
          every page is all the code Auto ads needs — ad placement is controlled
          from the AdSense dashboard (Ads → Auto ads). Loads after the page is
          interactive so it never blocks content render.
        */}
        <Script
          id="google-adsense"
          async
          src={ADSENSE_SCRIPT_SRC}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
