import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SEARCH_TITLE_LIMIT, SITE_URL } from '../lib/seo';
import { SEARCH_TITLE_OVERRIDES } from '../lib/seo-title-overrides';

// Run after `npm run build`: `npm run seo:check`.
// The built sitemap defines the pages expected to be indexable.
const app = '.next/server/app';
const collegeIndexBudget = 300_000;
const entities: Record<string, string> = { amp: '&', apos: "'", quot: '"', lt: '<', gt: '>' };

function decode(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|amp|apos|quot|lt|gt);/gi, (entity, value: string) => {
    if (value.startsWith('#x')) return String.fromCodePoint(Number.parseInt(value.slice(2), 16));
    if (value.startsWith('#')) return String.fromCodePoint(Number(value.slice(1)));
    return entities[value] ?? entity;
  });
}

function paths(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), ([, loc]) => {
    const href = decode(loc);
    const url = new URL(href);
    if (href !== canonical(url.pathname)) throw new Error(`Invalid sitemap URL: ${href}`);
    return url.pathname;
  });
}

function canonical(path: string): string {
  return path === '/' ? SITE_URL : `${SITE_URL}${path}`;
}

function uniqueOwner(value: string, page: string, seen: Map<string, string>, label: string, errors: string[]) {
  if (!value) {
    errors.push(`${page}: expected exactly one nonempty ${label}`);
    return;
  }
  const key = value.toLowerCase();
  const previous = seen.get(key);
  if (previous !== undefined) errors.push(`${page}: duplicate ${label} also used on ${previous} (${value})`);
  seen.set(key, page);
}

async function main() {
  const index = await readFile(join(app, 'sitemap.xml.body'), 'utf8');
  const children = paths(index);
  if (!children.length) throw new Error('No child sitemaps found. Run the production build first.');

  const pages = new Set<string>();
  for (const child of children) {
    if (!/^\/sitemap\/[a-z-]+\.xml$/.test(child)) throw new Error(`Unexpected sitemap path: ${child}`);
    for (const page of paths(await readFile(join(app, `${child}.body`), 'utf8'))) {
      if (pages.has(page)) throw new Error(`Duplicate sitemap URL: ${page}`);
      pages.add(page);
    }
  }
  if (!pages.size) throw new Error('No URLs found in the child sitemaps.');

  const errors: string[] = [];
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  const links = new Map<string, Set<string>>();
  let longest = 0;
  for (const page of pages) {
    const html = await readFile(join(app, page === '/' ? 'index.html' : `${page}.html`), 'utf8');
    const head = html.split('</head>', 1)[0];
    const matches = Array.from(head.matchAll(/<title>([^<]*)<\/title>/g));
    const title = matches.length === 1 ? decode(matches[0][1]).trim() : '';
    uniqueOwner(title, page, titles, 'title', errors);
    longest = Math.max(longest, title.length);
    if (title.length > SEARCH_TITLE_LIMIT) errors.push(`${page}: ${title.length} characters (${title})`);
    const override = SEARCH_TITLE_OVERRIDES[page];
    if (override && title !== override) errors.push(`${page}: title override did not render`);

    const meta = Array.from(head.matchAll(/<meta name="description" content="([^"]*)"/g));
    const description = meta.length === 1 ? decode(meta[0][1]).trim() : '';
    uniqueOwner(description, page, descriptions, 'description', errors);
    const canonicals = Array.from(head.matchAll(/<link rel="canonical" href="([^"]+)"/g));
    if (canonicals.length !== 1 || decode(canonicals[0][1]) !== canonical(page)) {
      errors.push(`${page}: expected exactly one self-referencing canonical`);
    }
    if (/<link\b[^>]*\bhreflang=/i.test(head)) errors.push(`${page}: unexpected hreflang`);
    if (/<meta name="(?:robots|googlebot|bingbot)" content="[^"]*\b(?:noindex|none)\b/i.test(head)) {
      errors.push(`${page}: noindex conflicts with sitemap inclusion`);
    }
    if (Array.from(html.matchAll(/<h1[\s>]/gi)).length !== 1) errors.push(`${page}: expected exactly one H1`);

    let breadcrumb = false;
    for (const [, value] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
      try {
        const data = JSON.parse(value);
        if (data?.['@type'] === 'BreadcrumbList') breadcrumb = true;
      } catch {
        errors.push(`${page}: invalid JSON-LD`);
      }
    }
    if (page !== '/' && !breadcrumb) errors.push(`${page}: missing BreadcrumbList JSON-LD`);

    const destinations = new Set<string>();
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      if (!href.startsWith('/') && !href.startsWith(SITE_URL)) continue;
      const url = new URL(decode(href), canonical(page));
      if (url.origin === SITE_URL && pages.has(url.pathname)) destinations.add(url.pathname);
    }
    links.set(page, destinations);
    if (page === '/colleges' && Buffer.byteLength(html) > collegeIndexBudget) {
      errors.push(`${page}: HTML exceeds the ${collegeIndexBudget}-byte directory budget`);
    }
  }

  const linked = new Set(['/']);
  for (const page of linked) {
    for (const destination of links.get(page) ?? []) linked.add(destination);
  }
  for (const page of pages) {
    if (!linked.has(page)) errors.push(`${page}: no path of crawlable sitemap links from the home page`);
  }
  for (const page of Object.keys(SEARCH_TITLE_OVERRIDES)) {
    if (!pages.has(page)) errors.push(`${page}: title override has no sitemap URL`);
  }

  if (errors.length) {
    console.error(errors.slice(0, 25).join('\n'));
    throw new Error(`${errors.length} SEO issue(s) across ${pages.size} sitemap pages`);
  }
  console.log(`${pages.size} sitemap pages passed metadata, JSON-LD and crawlable link checks. Longest title: ${longest} characters.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
