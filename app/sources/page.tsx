import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { Landmark, ShieldAlert } from 'lucide-react';
import { GUIDES } from '@/lib/guides';
import { ENTRANCE_EXAMS } from '@/lib/admission-guides';
import { COLLEGES } from '@/lib/colleges';
import { EXAM_VALIDITY } from '@/lib/test-validity';
import { DESTINATION_BUDGETS } from '@/lib/cost-planner';
import { collegeRankings } from '@/lib/college-labels';
import { REGIONS, type RegionSlug } from '@/lib/regions';
import LastUpdated from '@/components/LastUpdated';
import { SITE_REVIEWED } from '@/lib/site-meta';

/**
 * The complete, generated index of every official source this site cites.
 *
 * This page exists for a specific, concrete reason. Google Play rejected the
 * Android app under the Misleading Claims policy ("Insufficient Sources
 * Provided") because the store listing said guides cite official government
 * sources "— for example travel.state.gov, gov.uk, …", which names a handful and
 * implies the rest. The remedy Play asks for is to "identify and provide a
 * clear, official, valid and functional source for all of the government
 * information shared in your app", plus a plain statement that the app does not
 * represent a government entity.
 *
 * A hand-written list could not satisfy that: the corpus cites ~1,600 distinct
 * official hosts, ~360 of them government. So this page is DERIVED from the
 * content itself at build time — it cannot drift out of date, and it is complete
 * by construction. If a guide starts citing a new ministry tomorrow, it appears
 * here automatically.
 *
 * Server component on purpose: it reads the whole guide corpus, which must never
 * reach the browser bundle (see the layout-chunk regression this repo has had).
 */

export const metadata: Metadata = pageMetadata({
  title: 'Official sources we cite',
  description:
    'The complete list of official government, university and examination-board sources cited across GlobalStudyBoard, grouped by study destination. GlobalStudyBoard is an independent publisher and is not a government service.',
  path: '/sources',
});

/**
 * Hosts operated by a government, an inter-governmental body, or a statutory
 * regulator acting under one.
 *
 * The TLD test alone is not enough and got this wrong once: India's statutory
 * regulators do not use government TLDs. `nmc.org.in` (the National Medical
 * Commission) is the single most-cited official source in the whole corpus at
 * 414 citations, and a `.gov`-only rule filed it as "other" — which would have
 * understated exactly the regulators a Play reviewer checks first, India being
 * the default region. `.nic.in` is India's National Informatics Centre, the
 * government's own hosting; the allowlist below covers regulators created by an
 * Act that publish on their own domain.
 */
const GOVERNMENT_TLD =
  /(^|\.)(gov(\.[a-z]{2})?|gouv\.[a-z]{2}|govt\.nz|go\.[a-z]{2}|gc\.ca|canada\.ca|europa\.eu|admin\.ch|gv\.at|gob\.[a-z]{2}|nic\.in)$/;

/** Statutory regulators that publish on a non-government TLD. */
const STATUTORY_BODIES = new Set([
  'nmc.org.in',
  'natboard.edu.in',
  'nta.ac.in',
  'ncismindia.org',
  'barcouncilofindia.org',
  'indiannursingcouncil.org',
  'aicte-india.org',
  'ncte.gov.in',
  'aiu.ac.in',
]);

const GOVERNMENT_HOST = (host: string) =>
  GOVERNMENT_TLD.test(host) || STATUTORY_BODIES.has(host);

type Entry = { host: string; url: string; label: string; government: boolean };

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * One entry per distinct host, keeping the first label and URL seen for it, so
 * the page lists sources rather than repeating a host once per citation.
 */
function collect(): { byRegion: Map<RegionSlug, Entry[]>; exams: Entry[]; totals: { hosts: number; gov: number } } {
  const seen = new Map<string, Entry>();
  const byRegion = new Map<RegionSlug, Map<string, Entry>>();

  const add = (bucket: Map<string, Entry>, label: string, url: string) => {
    const host = hostOf(url);
    if (!host) return;
    const entry: Entry = { host, url, label, government: GOVERNMENT_HOST(host) };
    if (!bucket.has(host)) bucket.set(host, entry);
    if (!seen.has(host)) seen.set(host, entry);
  };

  for (const guide of GUIDES) {
    if (!guide.sources?.length) continue;
    const slug = guide.region as RegionSlug;
    if (!byRegion.has(slug)) byRegion.set(slug, new Map());
    const bucket = byRegion.get(slug)!;
    for (const s of guide.sources) add(bucket, s.label, s.url);
  }

  /*
    Universities' own official sites. These were missing from the first version
    of this page, which collected only guide and exam sources — so the page
    claimed to list "every official source we cite" while 41 of the 118 university
    profiles linked an official site that appeared nowhere on it. An adversarial
    review of the Play listing caught the false completeness claim.
  */
  const bucketFor = (slug: RegionSlug) => {
    if (!byRegion.has(slug)) byRegion.set(slug, new Map());
    return byRegion.get(slug)!;
  };

  for (const college of COLLEGES) {
    const bucket = bucketFor(college.region as RegionSlug);
    if (college.websiteUrl) add(bucket, `${college.nameEn} — official website`, college.websiteUrl);
    // The ranking bodies a profile attributes its rankings to (QS, THE, NIRF…).
    for (const r of collegeRankings(college)) add(bucket, `${r.body} — rankings`, r.url);
  }

  // Each destination page's own official sources (visa, application platform —
  // rendered under its FAQ), and the Cost & Funding Planner's per-line official
  // pages and visa financial-rule sources. A host cited only here would
  // otherwise be missing from an index that promises to be complete.
  for (const r of REGIONS) {
    for (const s of r.sources) add(bucketFor(r.slug), s.label, s.url);
  }
  for (const [slug, b] of Object.entries(DESTINATION_BUDGETS) as Array<[RegionSlug, (typeof DESTINATION_BUDGETS)[RegionSlug]]>) {
    for (const c of [...b.costs, ...b.funding]) if (c.source) add(bucketFor(slug), c.source.label, c.source.url);
    for (const s of b.fundsRule.sources) add(bucketFor(slug), s.label, s.url);
  }

  const examBucket = new Map<string, Entry>();
  for (const exam of ENTRANCE_EXAMS) {
    for (const s of exam.sources ?? []) add(examBucket, s.label, s.url);
    if (exam.websiteUrl) add(examBucket, `${exam.shortName} — official website`, exam.websiteUrl);
  }
  // The Test Score Tracker's validity rules cite their own official pages and
  // bulletins (several on hosts no guide or exam record cites) — the page
  // promises every source, so they are collected here too.
  for (const v of Object.values(EXAM_VALIDITY)) {
    add(examBucket, v.source.label, v.source.url);
    if (v.also) add(examBucket, v.also.label, v.also.url);
  }

  const sortEntries = (m: Map<string, Entry>) =>
    [...m.values()].sort((a, b) => {
      if (a.government !== b.government) return a.government ? -1 : 1;
      return a.host.localeCompare(b.host);
    });

  const out = new Map<RegionSlug, Entry[]>();
  for (const [slug, bucket] of byRegion) out.set(slug, sortEntries(bucket));

  return {
    byRegion: out,
    exams: sortEntries(examBucket),
    totals: {
      hosts: seen.size,
      gov: [...seen.values()].filter((e) => e.government).length,
    },
  };
}

const { byRegion, exams, totals } = collect();

/**
 * Government sources are listed as their own labelled block rather than tagged
 * item-by-item. That answers Play's requirement directly ("here are the
 * government sources") and keeps the markup far smaller — a per-item badge on
 * ~400 entries bloated the page for no extra clarity.
 */
function SourceList({ entries }: { entries: Entry[] }) {
  const gov = entries.filter((e) => e.government);
  const other = entries.filter((e) => !e.government);
  return (
    <>
      {gov.length > 0 && (
        <div className="mt-3">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest-700 m-0">
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            Government, regulators and statutory bodies ({gov.length})
          </h3>
          <Hosts entries={gov} />
        </div>
      )}
      {other.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-600 m-0">
            Universities, exam boards, ranking bodies and other cited sources ({other.length})
          </h3>
          <Hosts entries={other} />
        </div>
      )}
    </>
  );
}

function Hosts({ entries }: { entries: Entry[] }) {
  return (
    <ul className="mt-2 grid gap-x-6 gap-y-1 list-none p-0 m-0 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((e) => (
        <li key={e.host} className="text-sm leading-relaxed break-words">
          <a href={e.url} target="_blank" rel="noopener noreferrer" className="gsb-src">
            {e.host}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function SourcesPage() {
  const regionsWithSources = REGIONS.filter((r) => (byRegion.get(r.slug)?.length ?? 0) > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header>
        <LastUpdated date={SITE_REVIEWED} />
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-editorial leading-[1.08] text-ink mb-5 mt-3">
          Official sources we cite
        </h1>
        <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
          Our guides, exam pages and university profiles name the official source behind their facts and link to it on
          the page itself, and each destination page links the official sources for the visa and work rules it states.
          This page indexes all of those sources, and the official pages our tools link to —{' '}
          <strong>{totals.hosts.toLocaleString()}</strong> official websites, of which{' '}
          <strong>{totals.gov.toLocaleString()}</strong> are government bodies, regulators or statutory authorities. It is
          generated from those pages and tools each time the site is built, so it lists every source they cite.
        </p>
      </header>

      {/*
        The non-affiliation statement is the first thing on the page, not a
        footnote — Play's Misleading Claims policy asks for an "easy-to-see
        disclaimer stating that the app doesn't represent a government entity".
      */}
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink m-0">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          GlobalStudyBoard is not a government service
        </h2>
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-stone-800">
          <p className="m-0">
            GlobalStudyBoard is an independent publisher. It is{' '}
            <strong>
              not affiliated with, endorsed by, or acting on behalf of any government, government
              agency, university, examination board or scholarship provider
            </strong>
            , and it does not represent a government entity.
          </p>
          <p className="m-0">
            We link to official sources so you can read them yourself. We do not reproduce them as
            an official record, and we cannot process, submit, track or influence any visa,
            admission or scholarship application. Rules and fees change — always confirm on the
            official website before you act.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-bold tracking-editorial text-ink">
          Worldwide tests and examination boards
        </h2>
        <p className="text-stone-700 leading-relaxed m-0">
          Sources for the entrance and English-language tests covered across every destination.
        </p>
        <SourceList entries={exams} />
      </section>

      {regionsWithSources.map((region) => {
        const entries = byRegion.get(region.slug) ?? [];
        const govCount = entries.filter((e) => e.government).length;
        return (
          <section key={region.slug} className="space-y-3">
            <h2 className="font-display text-2xl font-bold tracking-editorial text-ink">
              {region.displayName}
            </h2>
            <p className="text-stone-700 leading-relaxed m-0">
              {entries.length.toLocaleString()} official sources cited on{' '}
              {region.displayName} pages
              {govCount > 0 && <> — {govCount.toLocaleString()} government or regulator</>}.{' '}
              <Link
                href={`/regions/${region.slug}`}
                className="text-forest-700 underline underline-offset-2 hover:text-forest-800"
              >
                Browse {region.displayName}
              </Link>
            </p>
            <SourceList entries={entries} />
          </section>
        );
      })}

      <section className="space-y-3 border-t border-stone-200 pt-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial text-ink">
          Something out of date?
        </h2>
        <p className="text-stone-700 leading-relaxed m-0">
          Official pages move and rules change. If a link here is broken or a fact no longer matches
          its source, tell us at{' '}
          <a
            href="mailto:contact@globalstudyboard.com"
            className="text-forest-700 underline underline-offset-2 hover:text-forest-800"
          >
            contact@globalstudyboard.com
          </a>{' '}
          and we will correct it. See also our{' '}
          <Link href="/disclaimer" className="text-forest-700 underline underline-offset-2">
            disclaimer
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
