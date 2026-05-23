import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Sans_Devanagari, Playfair_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocaleSetter from '@/components/LocaleSetter';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#1B3A6B',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.globalstudyboard.com'),
  title: {
    default: 'GlobalStudyBoard — College Admission Guide',
    template: '%s · GlobalStudyBoard',
  },
  description:
    'Your complete guide to college admissions worldwide — IITs, NITs, IIMs, AIIMS, and top global universities. Explore entrance exams, admission guides, and college profiles.',
  keywords: [
    'college admission guide',
    'IIT admission',
    'NIT admission',
    'JEE Main',
    'JEE Advanced',
    'NEET',
    'CAT exam',
    'study abroad',
    'university guide',
    'entrance exams India',
  ],
  authors: [{ name: 'GlobalStudyBoard' }],
  openGraph: {
    type: 'website',
    siteName: 'GlobalStudyBoard',
    title: 'GlobalStudyBoard — College Admission Guide',
    description:
      'Your complete guide to college admissions worldwide. IITs, NITs, IIMs, and top global universities.',
    url: 'https://www.globalstudyboard.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalStudyBoard',
    description: 'Your complete guide to college admissions worldwide.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.globalstudyboard.com' },
};

// Sync (non-async) layout — no dynamic functions, fully cacheable by Vercel CDN.
// LocaleSetter handles the html[lang] attribute client-side for Hindi routes.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} ${devanagari.variable}`}
      suppressHydrationWarning
    >
      <body>
        <LocaleSetter />
        <Header />
        <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
