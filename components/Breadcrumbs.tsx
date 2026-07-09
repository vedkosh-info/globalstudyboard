'use client';

import { usePathname } from 'next/navigation';

import BreadcrumbsView from './BreadcrumbsView';

/**
 * Global breadcrumb fallback for the SIMPLE top-level pages only (listings +
 * static pages, e.g. /guides, /about, /privacy). Their trail is just
 * `Home › {Group}` and needs no content data at all.
 *
 * Multi-segment detail/region pages (/guides/[slug], /colleges/[slug],
 * /exams/[slug], /topics/[slug], /regions/…) render their OWN breadcrumb
 * server-side with `breadcrumbsFor()`, so the heavy content catalogue never
 * ships to the browser. This component therefore renders NOTHING for those paths
 * — it is intentionally light (no `@/lib/cmi` import) to keep the global layout
 * client bundle tiny.
 */
const GROUP_LABELS: Record<string, string> = {
  colleges: 'Universities',
  exams: 'Exams',
  regions: 'Destinations',
  guides: 'Guides',
  topics: 'Topics',
  scholarships: 'Scholarships',
  'gsb-ai': 'Ask GSB AI',
  search: 'Search',
  about: 'About',
  contact: 'Contact',
  privacy: 'Privacy',
  terms: 'Terms',
  disclaimer: 'Disclaimer',
  cookies: 'Cookies',
};

const titleCase = (seg: string): string =>
  seg.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export default function Breadcrumbs() {
  const pathname = usePathname() ?? '/';
  const segments = pathname.split('/').filter(Boolean);

  // Home (0 segments) shows no breadcrumb. Multi-segment detail/region pages
  // render their own server-side — skip here to avoid a double trail and to keep
  // the content catalogue out of the client bundle.
  if (segments.length !== 1) return null;

  const seg = segments[0];
  return (
    <BreadcrumbsView
      crumbs={[{ label: 'Home', href: '/' }, { label: GROUP_LABELS[seg] ?? titleCase(seg) }]}
    />
  );
}
