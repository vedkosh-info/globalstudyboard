/**
 * Source-link rot checker.
 *
 * Google Play rejected the Android app under the Misleading Claims policy with
 * "Broken or Inaccessible Source Link — the provided URL/link for the source of
 * government information is not working or is inaccessible", and warned the issue
 * "may also be found in other locations". Every hard fact on this site cites an
 * official source (constitution Rule A / §3), so a rotted URL is a policy
 * violation, not just a broken link. This makes that checkable on demand.
 *
 *   npm run links:check          # every source URL
 *   npm run links:check -- --gov # government + statutory regulators only
 *
 * Exit code is 1 if any link is CONFIRMED dead, so it can gate a release.
 *
 * What counts as dead is deliberately narrow, because official government sites
 * are aggressive with bots and geo-blocks: 403, 429 and 412 are anti-bot, and a
 * timeout from one machine proves nothing. Only two things count:
 *   - the server answered 404/410 (it exists and says the page does not), or
 *   - the hostname does not resolve on BOTH public resolvers (8.8.8.8, 1.1.1.1).
 * That rule is what separated 9 genuinely-rotted links from 32 false alarms.
 */
import { GUIDES } from '../lib/guides';
import { ENTRANCE_EXAMS } from '../lib/admission-guides';
import { COLLEGES } from '../lib/colleges';
import { REGIONS } from '../lib/regions';
import { promises as dns } from 'node:dns';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const GOVERNMENT_TLD =
  /(^|\.)(gov(\.[a-z]{2})?|gouv\.[a-z]{2}|govt\.nz|go\.[a-z]{2}|gc\.ca|canada\.ca|europa\.eu|admin\.ch|gv\.at|gob\.[a-z]{2}|nic\.in)$/;
const STATUTORY = new Set([
  'nmc.org.in', 'natboard.edu.in', 'nta.ac.in', 'ncismindia.org',
  'barcouncilofindia.org', 'indiannursingcouncil.org', 'aicte-india.org', 'ncte.gov.in', 'aiu.ac.in',
]);
const isGov = (host: string) => GOVERNMENT_TLD.test(host) || STATUTORY.has(host);

/** The only shape this script needs from a catalogue record. */
type Sourced = { slug: string; sources?: readonly { url?: string }[]; websiteUrl?: string | null };

function collect(): Map<string, string> {
  const out = new Map<string, string>();
  const add = (url: string | null | undefined, where: string) => {
    if (!url || !/^https?:\/\//.test(url)) return;
    if (!out.has(url)) out.set(url, where);
  };
  const walk = (records: readonly Sourced[], kind: string) => {
    for (const r of records) {
      for (const s of r.sources ?? []) add(s.url, `${kind}:${r.slug}`);
      add(r.websiteUrl, `${kind}:${r.slug}`);
    }
  };
  walk(GUIDES as readonly Sourced[], 'guide');
  walk(ENTRANCE_EXAMS as readonly Sourced[], 'exam');
  walk(COLLEGES as readonly Sourced[], 'college');
  walk(REGIONS as readonly Sourced[], 'region');
  return out;
}

async function resolves(host: string): Promise<boolean> {
  for (const server of [['8.8.8.8'], ['1.1.1.1']]) {
    try {
      const r = new dns.Resolver();
      r.setServers(server);
      const a = await r.resolve4(host).catch(() => r.resolve6(host));
      if (a && a.length) return true;
    } catch { /* try next resolver */ }
  }
  return false;
}

async function check(url: string): Promise<{ url: string; status: string; dead: boolean }> {
  const host = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25_000);
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(t);
    // 404/410: the server exists and says this page does not. That is real rot.
    return { url, status: String(res.status), dead: res.status === 404 || res.status === 410 };
  } catch {
    // Network failure proves nothing on its own — only a name that resolves nowhere does.
    const ok = host ? await resolves(host) : false;
    return { url, status: ok ? 'unreachable-from-here' : 'NXDOMAIN', dead: !ok };
  }
}

async function main() {
  const govOnly = process.argv.includes('--gov');
  const all = collect();
  const urls = [...all.keys()].filter((u) => {
    if (!govOnly) return true;
    try { return isGov(new URL(u).hostname.replace(/^www\./, '')); } catch { return false; }
  });
  console.log(`Checking ${urls.length} source URLs${govOnly ? ' (government/statutory only)' : ''}…\n`);

  const dead: { url: string; status: string }[] = [];
  const CONCURRENCY = 24;
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < urls.length) {
        const url = urls[i++];
        const r = await check(url);
        if (r.dead) {
          dead.push(r);
          console.log(`  DEAD  ${r.status.padEnd(22)} ${r.url}\n        cited by ${all.get(r.url)}`);
        }
      }
    }),
  );

  console.log(`\n${dead.length === 0 ? '✔' : '✖'} ${dead.length} confirmed dead of ${urls.length} checked.`);
  if (dead.length) {
    console.log('\nOnly 404/410 responses and names that resolve on NEITHER public resolver are');
    console.log('reported. 403/429/412 and timeouts are anti-bot or geo-blocking, not rot.');
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
