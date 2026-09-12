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
 * What counts as DEAD is deliberately narrow, because official government sites
 * are aggressive with bots and geo-blocks. Dead means a failure that is
 * deterministic — every visitor, from anywhere, in any browser, hits it:
 *   - the server answered 404/410 (it exists and says the page does not);
 *   - the hostname resolves on NEITHER public resolver (8.8.8.8, 1.1.1.1);
 *   - the TLS certificate is expired, untrusted, or the handshake fails
 *     (a browser shows a full-page security error — worse than a 404);
 *   - the link is plain http:// (browsers now warn, and Play reviewers did).
 *
 * UNREACHABLE is everything else that failed from this machine — connection
 * refused, timeouts, 403/429/412 anti-bot. It proves nothing on its own (the UAE
 * ministry is unreachable from here and fine on public DNS), so it is REPORTED
 * for a human to check in a real browser but does not fail the run. Pass
 * --strict to make it fail too. A second Play rejection came from a host that
 * refused connections from three vantage points, so do read that list.
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

type Verdict = { url: string; status: string; dead: boolean; unreachable: boolean };

/*
 * TLS failures a BROWSER shows as a full-page error. Deliberately excludes
 * UNABLE_TO_VERIFY_LEAF_SIGNATURE / UNABLE_TO_GET_ISSUER_CERT_LOCALLY: those
 * usually mean the server omits an intermediate certificate, which Chrome and
 * Safari fetch on the fly and Node does not — nmc.org.in (414 citations) trips
 * them in Node yet verifies cleanly against the OS trust store. Those land in
 * the unreachable list instead.
 */
const TLS_CODES = new Set([
  'CERT_HAS_EXPIRED', 'SELF_SIGNED_CERT_IN_CHAIN', 'DEPTH_ZERO_SELF_SIGNED_CERT',
  'ERR_TLS_CERT_ALTNAME_INVALID', 'EPROTO', 'ERR_SSL_WRONG_VERSION_NUMBER', 'ERR_SSL_PROTOCOL_ERROR',
]);

async function check(url: string): Promise<Verdict> {
  const host = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
  if (url.startsWith('http://')) {
    return { url, status: 'plain-http', dead: true, unreachable: false };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25_000);
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: ctrl.signal });
    clearTimeout(t);
    // 404/410: the server exists and says this page does not. That is real rot.
    return { url, status: String(res.status), dead: res.status === 404 || res.status === 410, unreachable: false };
  } catch (err) {
    const cause = (err as { cause?: { code?: string } }).cause;
    const code = cause?.code ?? (err as { name?: string }).name ?? 'ERR';
    if (TLS_CODES.has(code)) return { url, status: `tls:${code}`, dead: true, unreachable: false };
    // Other network failure proves nothing on its own — only a name that resolves nowhere does.
    const ok = host ? await resolves(host) : false;
    if (!ok) return { url, status: 'NXDOMAIN', dead: true, unreachable: false };
    return { url, status: `unreachable:${code}`, dead: false, unreachable: true };
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

  const strict = process.argv.includes('--strict');
  const dead: Verdict[] = [];
  const unreachable: Verdict[] = [];
  const CONCURRENCY = 24;
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < urls.length) {
        const url = urls[i++];
        const r = await check(url);
        if (r.dead) {
          dead.push(r);
          console.log(`  DEAD  ${r.status.padEnd(28)} ${r.url}\n        cited by ${all.get(r.url)}`);
        } else if (r.unreachable) {
          unreachable.push(r);
        }
      }
    }),
  );

  if (unreachable.length) {
    console.log(`\nUNREACHABLE from this machine (${unreachable.length}) — check these in a real browser;`);
    console.log('connection-refused from several places is how the second Play rejection happened:');
    for (const r of unreachable.sort((a, b) => a.url.localeCompare(b.url))) {
      console.log(`  ${r.status.padEnd(34)} ${r.url}`);
    }
  }

  const failing = strict ? dead.length + unreachable.length : dead.length;
  console.log(`\n${failing === 0 ? '✔' : '✖'} ${dead.length} confirmed dead, ${unreachable.length} unreachable-from-here, of ${urls.length} checked${strict ? ' (--strict: both fail)' : ''}.`);
  if (failing) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
