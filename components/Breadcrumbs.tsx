'use client';

import { useSelectedLayoutSegments } from 'next/navigation';

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
  sources: 'Sources',
  'editorial-policy': 'Editorial policy',
  account: 'Your account',
  login: 'Sign in',
  'delete-account': 'Delete your account',
  admin: 'Admin',
};

const titleCase = (seg: string): string =>
  seg.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export default function Breadcrumbs() {
  // Router-tree segments, not the URL: the static 404 page is prerendered at
  // /_not-found and served at any missing URL, so reading the pathname produced
  // a "_not Found" crumb on the server and a different one on the client.
  const segments = useSelectedLayoutSegments();

  // Home (0 segments) shows no breadcrumb. Multi-segment detail/region pages
  // render their own server-side — skip here to avoid a double trail and to keep
  // the content catalogue out of the client bundle. The not-found boundary
  // (segment "/_not-found") gets no trail either.
  if (segments.length !== 1 || segments[0].startsWith('/_')) return null;

  const seg = segments[0];
  return (
    <BreadcrumbsView
      crumbs={[{ label: 'Home', href: '/' }, { label: GROUP_LABELS[seg] ?? titleCase(seg) }]}
    />
  );
}
