import { readFile } from 'node:fs/promises';
import { BASE, SITEMAP_IDS, sitemapEntries } from '../lib/sitemap-entries';

// Public verification token. IndexNow checks the matching root text file.
const KEY = '83e11dae08a871495a66a1fd8a65a3fe';
const KEY_PATH = `/${KEY}.txt`;
const ENDPOINT = 'https://www.bing.com/indexnow';
const USAGE = 'Usage: npx tsx scripts/indexnow.ts [--submit] <canonical GSB URL>\n'
  + 'Default: check the URL and local key without sending requests. Use --submit only after the changed page and key are live.';

async function main(args: string[]) {
  if (args.length === 0 || args[0] === '--help') {
    console.log(USAGE);
    return;
  }
  const submit = args[0] === '--submit';
  const raw = args[submit ? 1 : 0];
  if (!raw || args.length !== (submit ? 2 : 1)) throw new Error(USAGE);

  // Exact catalogue membership excludes query strings, private routes, previews,
  // alternate hosts and arbitrary URLs supplied on the command line.
  const url = raw === BASE ? `${BASE}/` : raw;
  const inSitemap = SITEMAP_IDS.some((id) =>
    sitemapEntries(id).some((entry) => new URL(entry.url).href === url),
  );
  if (!inSitemap) throw new Error('Use a public, canonical www.globalstudyboard.com URL from the sitemap.');

  const localKey = await readFile(`public${KEY_PATH}`, 'utf-8');
  if (localKey.trim() !== KEY) throw new Error('The local IndexNow key file does not match.');

  if (!submit) {
    console.log(`Local verification passed for ${url}. Use --submit after publishing the page and key.`);
    return;
  }

  const keyLocation = `${BASE}${KEY_PATH}`;
  const keyResponse = await fetch(keyLocation, { redirect: 'error', signal: AbortSignal.timeout(10_000) });
  if (
    keyResponse.status !== 200 ||
    !/^text\/plain(?:\s*;|$)/i.test(keyResponse.headers.get('content-type') ?? '') ||
    (await keyResponse.text()).trim() !== KEY
  ) {
    throw new Error(`The canonical site must serve the matching plain-text key first (HTTP ${keyResponse.status}).`);
  }

  const page = await fetch(url, { method: 'HEAD', redirect: 'error', signal: AbortSignal.timeout(10_000) });
  if (page.status !== 200 || !/^text\/html(?:\s*;|$)/i.test(page.headers.get('content-type') ?? '') ||
    /\bnoindex\b/i.test(page.headers.get('x-robots-tag') ?? '')) {
    throw new Error(`The submitted URL must be a live, indexable page (HTTP ${page.status}).`);
  }

  const destination = new URL(ENDPOINT);
  destination.searchParams.set('url', url);
  destination.searchParams.set('key', KEY);
  const result = await fetch(destination, { redirect: 'error', signal: AbortSignal.timeout(10_000) });
  if (result.status === 200) {
    console.log(`IndexNow accepted ${url} (HTTP 200).`);
  } else if (result.status === 202) {
    console.log(`IndexNow received ${url} (HTTP 202). Key validation is pending.`);
  } else {
    throw new Error(`IndexNow rejected the submission (HTTP ${result.status}). No automatic retries.`);
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'IndexNow failed.');
  process.exitCode = 1;
});
