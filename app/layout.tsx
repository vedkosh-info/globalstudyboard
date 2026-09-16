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
import { CONTACT_EMAIL, ORG_LOGO, SITE_DESCRIPTION } from '@/lib/site-meta';
import { ROOT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  // `opsz` only. The `SOFT` axis was loaded but never set anywhere in CSS, and
  // it made the preloaded display font 120 KB instead of 67 KB on every page —
  // the largest first-party bytes in the LCP window.
  axes: ['opsz'],
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

/**
 * Root metadata. Deliberately NO `alternates.canonical` here: `alternates` is
 * replaced (not merged) per segment, so a root canonical was inherited verbatim
 * by every page that did not set its own — the 404 page and any new route
 * declared the HOME page as its canonical. Every page sets canonical + the RSS
 * alternate through `pageMetadata()` / `alternatesFor()` in lib/seo.ts.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'University Admissions, Entrance Exams & Study Abroad Guide | GlobalStudyBoard',
    template: '%s · GlobalStudyBoard',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'study abroad',
    'university admissions guide',
    'international students',
    'entrance exams',
    'scholarships for international students',
    'student visa guide',
    'study in USA',
    'study in UK',
    'study in Canada',
    'study in Europe',
    'study in Australia',
    'study in Japan',
    'study in Singapore',
    'study in the Middle East',
    'study in India',
    'SAT ACT GRE GMAT IELTS TOEFL',
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_US',
    title: 'University Admissions, Entrance Exams & Study Abroad Guide',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [ROOT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'University Admissions, Entrance Exams & Study Abroad Guide',
    description: SITE_DESCRIPTION,
    images: [ROOT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  // Google AdSense site-ownership verification (server-rendered meta tag).
  other: { 'google-adsense-account': ADSENSE_CLIENT_ID },
};

/**
 * Site-wide Organization + WebSite graph. WebSite is what Google's site-name
 * system reads (name + url); the SearchAction it used to carry was dropped —
 * the sitelinks search box was retired by Google in November 2024 and the
 * template pointed at the robots-blocked /gsb-ai?q= pattern. The logo is the
 * 512×512 PNG (Google's Organization guidance wants ≥112×112; the old 64×64
 * SVG glyph was below that floor). `publishingPrinciples` links the editorial
 * policy every Article on the site inherits via `publisher: {@id}`.
 */
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
        url: ORG_LOGO.url,
        contentUrl: ORG_LOGO.url,
        width: ORG_LOGO.width,
        height: ORG_LOGO.height,
      },
      description:
        'Independent, official-source guides to universities, entrance exams, scholarships and student visas across nine study destinations.',
      email: CONTACT_EMAIL,
      publishingPrinciples: 'https://www.globalstudyboard.com/editorial-policy',
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
      description:
        'Independent, official-source guides to universities, entrance exams, scholarships and student visas across nine study destinations.',
      publisher: { '@id': 'https://www.globalstudyboard.com/#organization' },
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
          from the AdSense dashboard (Ads → Auto ads).
          `lazyOnload`, not `afterInteractive`: in the App Router the latter
          emits <link rel="preload" as="script"> in <head>, so the 58 KB loader
          (and the ~225 KB ad chain behind it) downloaded at High priority next
          to the CSS and fonts on every page and pushed Time-to-Interactive to
          ~5 s. lazyOnload defers it until the window load event — content and
          Core Web Vitals first, ads after.
        */}
        <Script
          id="google-adsense"
          async
          src={ADSENSE_SCRIPT_SRC}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
