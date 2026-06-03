'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import { breadcrumbsFor } from '@/lib/cmi';

/** Strip a leading `/hi` locale prefix and report the active locale. */
function splitLocale(pathname: string): { lang: 'en' | 'hi'; bare: string } {
  if (pathname === '/hi' || pathname.startsWith('/hi/')) {
    const bare = pathname.slice(3) || '/';
    return { lang: 'hi', bare };
  }
  return { lang: 'en', bare: pathname || '/' };
}

/** Prefix a bare (English) href with the active locale. */
function localized(href: string, lang: 'en' | 'hi'): string {
  if (lang === 'en') return href;
  return href === '/' ? '/hi' : `/hi${href}`;
}

export default function Breadcrumbs() {
  const pathname = usePathname() ?? '/';
  const { lang, bare } = splitLocale(pathname);
  const crumbs = breadcrumbsFor(bare);

  if (crumbs.length === 0) return null;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href
        ? { item: `https://www.globalstudyboard.com${localized(c.href, lang)}` }
        : {}),
    })),
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-stone-500">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-x-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={localized(crumb.href, lang)}
                  className="rounded transition-colors hover:text-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-medium text-stone-700' : undefined}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
