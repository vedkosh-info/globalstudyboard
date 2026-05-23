import type { ReactNode } from 'react';

// Pre-generate all locale variants at build time — served from Vercel CDN.
export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'hi' }];
}

export default function LangLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
