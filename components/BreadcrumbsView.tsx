import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

/**
 * A single breadcrumb. Structurally identical to `Crumb` in `lib/cmi.ts`, but
 * declared locally so this presentational component can be imported by BOTH
 * server pages and the lightweight client `Breadcrumbs` WITHOUT ever pulling the
 * heavy `lib/cmi` module (and the full GUIDES catalogue) into a client bundle.
 */
export interface Crumb {
  label: string;
  /** Bare (English) path. Omitted on the current page (last crumb). */
  href?: string;
}

/**
 * Presentational breadcrumb trail + `BreadcrumbList` JSON-LD. No hooks, no data
 * imports — safe to render from a server component (zero client JS) or from the
 * global light client fallback. Detail/region pages compute their trail with the
 * server-only `breadcrumbsFor()` and render this directly, so the heavy content
 * catalogue never ships to the browser.
 */
export default function BreadcrumbsView({
  crumbs,
  className = 'mb-4',
}: {
  crumbs: Crumb[];
  className?: string;
}) {
  if (!crumbs || crumbs.length === 0) return null;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `https://www.globalstudyboard.com${c.href}` } : {}),
    })),
  });

  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${className}`}>
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
                  href={crumb.href}
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
