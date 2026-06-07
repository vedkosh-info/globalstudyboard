import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Devanagari, Fraunces } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RegionProvider } from '@/components/RegionProvider';
import DestinationPicker from '@/components/DestinationPicker';
import SiteSearch from '@/components/SiteSearch';
import Breadcrumbs from '@/components/Breadcrumbs';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import RecentPages from '@/components/RecentPages';
import GoogleSourceFab from '@/components/GoogleSourceFab';

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

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#14532D',
  width: 'device-width',
  initialScale: 1,
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
};

const websiteJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.globalstudyboard.com/#organization',
      name: 'GlobalStudyBoard',
      url: 'https://www.globalstudyboard.com',
      logo: 'https://www.globalstudyboard.com/icon.svg',
      description: 'Free guide to universities, entrance exams, and scholarships worldwide.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.globalstudyboard.com/#website',
      name: 'GlobalStudyBoard',
      url: 'https://www.globalstudyboard.com',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${devanagari.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteJsonLd }} />
        <RegionProvider>
          <Header />
          <main className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
            <div className="mb-6 space-y-3">
              <SiteSearch />
              <Breadcrumbs />
            </div>
            {children}
          </main>
          <Footer />
          <DestinationPicker />
          <RecentPages />
          <ScrollToTopButton />
          <GoogleSourceFab />
        </RegionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
