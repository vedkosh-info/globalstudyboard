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
 * refused, timeouts, 403/429/412 anti-bot and other 4xx/5xx, and a 200 that is
 * a bot-challenge page rather than the page itself. It proves nothing on its own (the UAE
 * ministry is unreachable from here and fine on public DNS), so it is REPORTED
 * for a human to check in a real browser but does not fail the run. Pass
 * --strict to make it fail too. A second Play rejection came from a host that
 * refused connections from three vantage points, so do read that list.
 */
import { GUIDES } from '../lib/guides';
import { ENTRANCE_EXAMS } from '../lib/admission-guides';
import { COLLEGES } from '../lib/colleges';
import { REGIONS } from '../lib/regions';
import { EXAM_VALIDITY } from '../lib/test-validity';
import { DESTINATION_BUDGETS } from '../lib/cost-planner';
import { collegeRankings } from '../lib/college-labels';
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
  // The Test Score Tracker's validity rules cite official pages too — rot there
  // would put a dead "Source:" link under every recorded score (review CA-02).
  for (const [slug, v] of Object.entries(EXAM_VALIDITY)) {
    add(v.source.url, `validity:${slug}`);
    if (v.also) add(v.also.url, `validity:${slug}`);
  }
  // The Cost & Funding Planner shows each line's "Official source" and the visa
  // funds-rule sources; profiles and Compare link each ranking body's own page.
  // Neither lives in a `sources` array, so neither was checked before (review LEG-7:
  // indianvisaonline.gov.in was cited by the planner and checked nowhere).
  for (const [slug, b] of Object.entries(DESTINATION_BUDGETS)) {
    for (const c of [...b.costs, ...b.funding]) add(c.source?.url, `cost-planner:${slug}`);
    for (const s of b.fundsRule.sources) add(s.url, `cost-planner:${slug}`);
  }
  for (const c of COLLEGES) for (const r of collegeRankings(c)) add(r.url, `ranking:${c.slug}`);
  return out;
}

/*
 * 'yes'      — an A/AAAA record on at least one public resolver;
 * 'nxdomain' — BOTH resolvers answer NXDOMAIN/NODATA (the name really is gone);
 * 'servfail' — a resolver could not validate the answer (typically a DNSSEC
 *              failure on the publisher's side, or an authoritative outage).
 * A SERVFAIL proves nothing about the page: on 16 Sep 2026 Google and
 * Cloudflare both answered SERVFAIL for www.parcoursup.gouv.fr while Quad9
 * (and Google with checking disabled) resolved it and the site served pages.
 * Only 'nxdomain' is treated as rot; 'servfail' goes to the unreachable list.
 */
async function resolves(host: string): Promise<'yes' | 'nxdomain' | 'servfail'> {
  let sawServfail = false;
  for (const server of [['8.8.8.8'], ['1.1.1.1']]) {
    try {
      const r = new dns.Resolver();
      r.setServers(server);
      const a = await r.resolve4(host).catch((e4: { code?: string }) => {
        if (e4?.code === 'ESERVFAIL') sawServfail = true;
        return r.resolve6(host);
      });
      if (a && a.length) return 'yes';
    } catch (e) {
      if ((e as { code?: string })?.code === 'ESERVFAIL') sawServfail = true;
      /* try next resolver */
    }
  }
  return sawServfail ? 'servfail' : 'nxdomain';
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

/*
 * Bot walls that answer HTTP 200. AAMC's Fastly "Client Challenge", Cloudflare's
 * "Just a moment…" / "Attention Required!" / "Performing security verification",
 * Akamai's "Access Denied" and Imperva's ~200-byte Incapsula stub (no title at
 * all — mba.com) are all served with a 200, so a status-only check called the
 * page behind them healthy. That is how the MCAT websiteUrl shipped as a 404 on
 * 26 Sep 2026: curl saw 200 + "Client Challenge", a browser saw "Page not found"
 * (review C4). Behind a wall the page may be fine or dead — only a browser can
 * tell — so these go to the unreachable list, never to healthy.
 */
const CHALLENGE_TITLE = /^\s*(client challenge|just a moment|attention required|access denied|performing security verification)\b/i;
const CHALLENGE_BODY = /_Incapsula_Resource/;

/** The first `max` bytes of an HTML body — enough for <title> or a challenge stub. Other types are not read. */
async function htmlHead(res: Response, max = 65_536): Promise<string> {
  if (!res.body) return '';
  if (!/text\/html/i.test(res.headers.get('content-type') ?? '')) {
    await res.body.cancel().catch(() => {});
    return '';
  }
  const reader = res.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  while (size < max) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    parts.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(parts));
}

/** The challenge a 200 response actually is, or null for a real page. */
function challengeOf(html: string): string | null {
  const title = /<title[^>]*>([^<]*)/i.exec(html)?.[1]?.trim() ?? '';
  if (CHALLENGE_TITLE.test(title)) return title;
  if (CHALLENGE_BODY.test(html)) return 'Incapsula';
  return null;
}

async function check(url: string): Promise<Verdict> {
  const host = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
  if (url.startsWith('http://')) {
    return { url, status: 'plain-http', dead: true, unreachable: false };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25_000);
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: ctrl.signal });
    // 404/410: the server exists and says this page does not. That is real rot.
    if (res.status === 404 || res.status === 410) {
      clearTimeout(t);
      await res.body?.cancel().catch(() => {});
      return { url, status: String(res.status), dead: true, unreachable: false };
    }
    // Any other 4xx/5xx is what the header promises to report rather than pass:
    // anti-bot 403/429/412, or a server fault as seen from this machine.
    if (res.status >= 400) {
      clearTimeout(t);
      await res.body?.cancel().catch(() => {});
      return { url, status: `unreachable:HTTP_${res.status}`, dead: false, unreachable: true };
    }
    const wall = challengeOf(await htmlHead(res));
    clearTimeout(t);
    if (wall) return { url, status: `unreachable:challenge(${wall.slice(0, 40)})`, dead: false, unreachable: true };
    return { url, status: String(res.status), dead: false, unreachable: false };
  } catch (err) {
    const cause = (err as { cause?: { code?: string } }).cause;
    const code = cause?.code ?? (err as { name?: string }).name ?? 'ERR';
    if (TLS_CODES.has(code)) return { url, status: `tls:${code}`, dead: true, unreachable: false };
    // Other network failure proves nothing on its own — only a name that resolves nowhere does.
    const dnsState = host ? await resolves(host) : 'nxdomain';
    if (dnsState === 'nxdomain') return { url, status: 'NXDOMAIN', dead: true, unreachable: false };
    if (dnsState === 'servfail') return { url, status: `unreachable:DNS_SERVFAIL(${code})`, dead: false, unreachable: true };
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
