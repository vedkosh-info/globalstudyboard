import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, Calendar, Clock, FileText, Award } from 'lucide-react';

import { ENTRANCE_EXAMS, getExamBySlug, examModified, type EntranceExam } from '@/lib/admission-guides';
import { scoreTrackerHref } from '@/lib/tools';
import ToolLink from '@/components/tools/ToolLink';
import { COLLEGES } from '@/lib/colleges';
import { REGIONS } from '@/lib/regions';
import { rankGuidesForExam, primaryGuideForExam } from '@/lib/related-guides';
import ContentActions from '@/components/ContentActions';
import PageQuickLinks from '@/components/PageQuickLinks';
import RegionExplore from '@/components/RegionExplore';
import PageRegion from '@/components/PageRegion';
import RegionFlag from '@/components/RegionFlag';
import LastUpdated from '@/components/LastUpdated';
import SaveButton from '@/components/SaveButton';
import ContentImage from '@/components/ContentImage';
import { examImage } from '@/lib/images';
import BreadcrumbsView from '@/components/BreadcrumbsView';
import { breadcrumbsFor } from '@/lib/cmi';
import { SITE_REVIEWED, SITE_LASTMOD, formatReviewed } from '@/lib/site-meta';
import { pageMetadata, ogImageFor, absoluteImageUrl, CYCLE_SHORT, EDITORIAL_TEAM_LD, PUBLISHER_LD } from '@/lib/seo';
import { gsbAiHref } from '@/lib/gsb-ai-links';

/**
 * `mode` is the delivery MEDIUM (see EntranceExam.mode): a bare "Online" read as
 * "taken at home" for test-centre-only exams such as the SAT, MCAT, UCAT and
 * PTE. Where the test is taken is stated in each exam's description.
 */
const EXAM_FORMAT_LABEL: Record<EntranceExam['mode'], string> = {
  online: 'Computer-based',
  offline: 'Paper-based',
  both: 'Computer or paper',
};

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return ENTRANCE_EXAMS.map((e) => ({ slug: e.slug }));
}

/**
 * Intent-led title that promises ONLY what the page renders for this exam: the
 * pattern, eligibility and preparation guides are on every exam page; "Fees"
 * appears only when the record carries a stamped fee (32 of 53 deliberately do
 * not — country-varying or unverifiable — and a title promising fees they do not
 * show is the same misleading-claim pattern that got the Play listing rejected).
 * The cycle tag is truthful because every exam page shows a verified/reviewed date.
 */
function examTitle(exam: { shortName: string; region: string; costUsd?: string }, proseName?: string): string {
  const scope = exam.region !== 'global' && proseName ? ` in ${proseName}` : '';
  const parts = ['Pattern', 'Eligibility', ...(exam.costUsd ? ['Fees'] : []), 'How to Prepare'];
  const list = `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}`;
  return `${singularName(exam)} Exam ${CYCLE_SHORT}: ${list}${scope}`;
}

/**
 * The short name with a trailing "Exams" dropped, for a phrase that supplies its
 * own head noun: "AP Exam 2026–27", "Record your AP score" — never "AP Exams
 * Exam". Every other short name is returned unchanged.
 */
function singularName(exam: { shortName: string }): string {
  return exam.shortName.replace(/\s+exams?$/i, '');
}

/**
 * The test's name in running prose ("Guides that cover the …", the GSB AI
 * prefill). Where the full name begins with the short one, the short one is a
 * brand clipped from it, and a sentence needs the whole name: "the Duolingo
 * English Test", never "the Duolingo" (a company and an app). Today that is
 * Duolingo only; every other exam keeps its short name ("the SAT", "the GMAT
 * Focus").
 */
function proseExamName(exam: EntranceExam): string {
  return exam.fullName.startsWith(`${exam.shortName} `) ? exam.fullName : exam.shortName;
}

/** True when `text` already ends a sentence — "Duolingo, Inc.", "…how long are my GMAT scores valid?". */
function endsSentence(text: string): boolean {
  return /[.!?]$/.test(text.trim());
}

/** Search-snippet budget (pageMetadata's default cut). */
const META_MAX = 155;

/** Whole words, any case or punctuation: "SAT" is in "The digital SAT is", "ACT" is not in "practice". */
function mentionsName(text: string, name: string): boolean {
  const words = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
  const n = words(name);
  return n.trim().length > 0 && words(text).includes(n);
}

/**
 * The exam's name where the page states it in one string (the save control and
 * its accessible name, the share title). A full name that already carries the
 * short one stands alone — "The ACT Test", "Digital SAT", "Duolingo English
 * Test", never "ACT — The ACT Test"; every other exam reads "GRE — Graduate
 * Record Examinations".
 */
function examLabel(exam: EntranceExam): string {
  return mentionsName(exam.fullName, exam.shortName) ? exam.fullName : `${exam.shortName} — ${exam.fullName}`;
}

/**
 * The score-tracker entrance's object. Singular: "Record your AP score", not
 * "your AP Exams score". A-Level results are grades, not one score.
 */
function trackerLabel(exam: EntranceExam): string {
  return exam.slug === 'a-levels' ? 'A-Level results' : `${singularName(exam)} score`;
}

/**
 * The description split into sentences. A full stop ends a sentence only when a
 * capital or digit follows, and never after an abbreviation or initial — "most
 * U.S. colleges", "Duolingo, Inc.", "the Pilani, K. K. Birla Goa and Hyderabad
 * campuses" stay whole.
 */
function sentencesOf(text: string): string[] {
  const out: string[] = [];
  const end = /[.!?](?=\s+["“(]?[A-Z0-9])/g;
  let start = 0;
  for (let m = end.exec(text); m; m = end.exec(text)) {
    const stop = m.index + 1;
    const lastWord = text.slice(start, stop).split(/\s+/).pop() ?? '';
    if (/^\(?(?:[A-Za-z]\.)+$|^\(?(?:Inc|Ltd|Co|Dr|St|No|vs|approx|Approx|etc|Hons|Sept?|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Oct|Nov|Dec)\.$/.test(lastWord)) continue;
    out.push(text.slice(start, stop).trim());
    start = stop;
  }
  const rest = text.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

/**
 * The longest opening of `sentence` that ends before one of `boundaries`, fits in
 * `room` characters with its ellipsis, and reads as a finished thought: at least
 * 60 characters, outside any brackets, and not ending on a word like "the",
 * "and" or "for". `accept` vets each boundary from its mark, the text after it
 * and the text before it.
 */
function cutBefore(
  sentence: string,
  room: number,
  boundaries: RegExp,
  accept: (mark: string, following: string, head: string) => boolean,
): string | null {
  let best: string | null = null;
  for (let m = boundaries.exec(sentence); m; m = boundaries.exec(sentence)) {
    const head = sentence.slice(0, m.index).replace(/[\s,;:—–-]+$/, '');
    const bracketsOpen = (head.match(/\(/g) ?? []).length > (head.match(/\)/g) ?? []).length;
    if (
      head.length >= 60 &&
      head.length + 1 <= room &&
      !bracketsOpen &&
      !/\b(?:a|an|the|and|or|of|to|for|in|at|by|on|with|its|their|is|are)$/i.test(head) &&
      accept(m[0].trim(), sentence.slice(m.index + m[0].length), head)
    ) {
      best = `${head}…`;
    }
  }
  return best;
}

/**
 * The first sentence cut at a clause boundary: a semicolon, a dash, a bracketed
 * aside that closes the clause, or a comma that opens a new clause — never a
 * comma inside a list ("a webcam, a microphone
 * and speakers, and a smartphone"; "the Flying Branch, Ground Duty (Technical),
 * and Ground Duty (Non-Technical)").
 */
function clauseCut(sentence: string, room: number): string | null {
  return cutBefore(sentence, room, /;\s+|\s[—–]\s+|,\s+|\s(?=\()/g, (mark, following, head) => {
    // "… within two days (within 12 hours with the paid option)." — not "the Indian Army (IMA, OTA), Indian Navy".
    if (mark === '') return /^\([^()]*\)(?:[.;!?]|\s[—–]\s|$)/.test(following);
    if (mark !== ',') return true;
    const [next = '', after = ''] = following.toLowerCase().split(/\s+/);
    if (next === 'and' || next === 'or') {
      // ", and many are test-optional" joins a clause; "A, B, and C" ends a list.
      const clause = head.split(/;|\s[—–]\s/).pop() ?? '';
      return !clause.includes(',') && !/^(?:a|an|the|\d.*)$/.test(after);
    }
    return /^(?:including|using|with|which|who|where|while|whereas|although|though|but|so|because|since|as|if|unless|when|after|before|from|plus|except)$/.test(next);
  });
}

/** The first sentence cut before a qualifying phrase ("… for admission to …", "… across India"). */
function phraseCut(sentence: string, room: number): string | null {
  return cutBefore(sentence, room, /\s(?=(?:for|at|in|across|to|from|under|within|through|via|on|into|among)\s)/g, () => true);
}

/**
 * Meta description: complete sentences where they fit; otherwise the first
 * sentence cut at a clause boundary, then before a qualifying phrase — never a
 * word-boundary cut mid-list ("…using the DET desktop app, a…") and never the
 * name twice in a row. The expanded name leads only where the first sentence
 * does not already give it ("Digital SAT (SAT) — The digital SAT is…" and "The
 * ACT Test — The ACT is…" read as a stutter); "(short name)" is added only when
 * the full name does not already contain it ("Duolingo English Test (Duolingo)").
 */
function examMetaDescription(exam: EntranceExam): string {
  const all = sentencesOf(exam.descriptionEn.trim().replace(/\s+/g, ' '));
  const first = all[0] ?? '';
  // "SSC CGL (Combined Graduate Level) is…" and "AP EAPCET (formerly AP EAMCET) is…" expand the name themselves.
  const expandsItself = mentionsName(first, exam.fullName) || first.includes(`${exam.shortName} (`);
  const namesExam = expandsItself || mentionsName(first, exam.shortName) || mentionsName(first, exam.slug);
  // A full name that merely wraps the short one ("Digital SAT", "The ACT Test") adds nothing once the sentence names the test.
  const fullHasShort = mentionsName(exam.fullName, exam.shortName);
  const expanded = fullHasShort ? exam.fullName : `${exam.fullName} (${exam.shortName})`;
  const prefix = expandsItself || (namesExam && fullHasShort) ? '' : namesExam ? `${exam.fullName} — ` : `${expanded} — `;
  // Drop the prefix only where the snippet still names the exam.
  const prefixes = namesExam && prefix ? [prefix, ''] : [prefix];

  for (const p of prefixes) {
    let text = '';
    for (const s of all) {
      const next = text ? `${text} ${s}` : s;
      if (p.length + next.length > META_MAX) break;
      text = next;
    }
    if (text) return `${p}${text}`;
  }
  // A cut keeps whichever variant says more of the description — the qualifiers
  // ("some programs make it optional") matter more than the expanded name.
  for (const cut of [clauseCut, phraseCut]) {
    const options = prefixes
      .map((p) => {
        const head = cut(first, META_MAX - p.length);
        return head ? { text: `${p}${head}`, said: head.length } : null;
      })
      .filter((o): o is { text: string; said: number } => o !== null);
    if (options.length) return options.reduce((a, b) => (b.said > a.said ? b : a)).text;
  }
  return `${prefix}${exam.descriptionEn}`; // pageMetadata cuts this at a word boundary
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = getExamBySlug(slug);
  if (!exam) return { title: 'Exam not found', robots: { index: false, follow: false } };
  const region = REGIONS.find((r) => r.slug === exam.region);
  return pageMetadata({
    title: examTitle(exam, region?.proseName),
    description: examMetaDescription(exam),
    descriptionMax: META_MAX,
    path: `/exams/${exam.slug}`,
    type: 'article',
    image: ogImageFor(exam.region),
    keywords: [
      `${singularName(exam)} exam guide`,
      `${exam.shortName} preparation`,
      `${exam.shortName} eligibility`,
      `${exam.shortName} score`,
      `${exam.fullName}`,
      exam.conductingBody,
      exam.domain.replace('-', ' '),
    ],
    modifiedTime: examModified(exam) ?? SITE_LASTMOD,
  });
}

export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const exam = getExamBySlug(slug);
  if (!exam) notFound();

  const region = REGIONS.find((r) => r.slug === exam.region);
  const acceptingColleges = COLLEGES.filter((c) => exam.collegesAccepting.includes(c.id));
  // The later of lastVerified and contentUpdated — drives "Last updated",
  // dateModified and the sitemap; "Last verified" keeps lastVerified.
  const modified = examModified(exam);

  // Related — other exams in the same region or domain (continuity, no dead ends).
  const relatedExams = ENTRANCE_EXAMS.filter(
    (e) => e.slug !== exam.slug && (e.region === exam.region || e.domain === exam.domain),
  ).slice(0, 4);

  // Guides that cover this exam, ranked by how specifically they are ABOUT it
  // (explainers and dedicated prep/eligibility guides first). The featured
  // long-form twin is chosen by primaryGuideForExam: never another destination's
  // guide, and on a worldwide test only a destination-neutral explainer (or none).
  const ranked = rankGuidesForExam(exam);
  const primaryGuide = primaryGuideForExam(exam, ranked);
  const relatedGuides = ranked
    .map((r) => r.guide)
    .filter((g) => g.slug !== primaryGuide?.slug)
    .slice(0, 8);

  const pageUrl = `https://www.globalstudyboard.com/exams/${exam.slug}`;
  const ogImage = ogImageFor(exam.region);

  // NOTE: no FAQPage JSON-LD here — the template renders no visible FAQ. The
  // page-level node is an Article ABOUT the exam: `EducationalTest` is not a
  // schema.org type (it validated as a severe INVALID_ITEMTYPE on all 53 exam
  // pages), and Course / Quiz / EducationalOccupationalCredential would all
  // misdescribe an informational page.
  const examLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: exam.fullName,
    alternativeHeadline: exam.shortName,
    description: exam.descriptionEn,
    inLanguage: 'en',
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    dateModified: modified ?? SITE_LASTMOD,
    image: [absoluteImageUrl(ogImage)],
    author: EDITORIAL_TEAM_LD,
    publisher: PUBLISHER_LD,
    about: {
      '@type': 'Thing',
      name: exam.fullName,
      alternateName: exam.shortName,
      ...(exam.websiteUrl ? { sameAs: exam.websiteUrl } : {}),
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <BreadcrumbsView crumbs={breadcrumbsFor(`/exams/${exam.slug}`)} />
      {exam.region !== 'global' && <PageRegion slug={exam.region} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(examLd) }}
      />

      <header>
        <Link
          href="/exams"
          prefetch={false}
          className="text-sm text-stone-500 hover:text-forest-700 no-underline inline-flex items-center gap-1 mb-4"
        >
          ← All exams
        </Link>
        <div className="flex items-center gap-2 mb-3">
          {region && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              <RegionFlag slug={region.slug} className="h-3.5" />{region.displayName}
            </span>
          )}
          <span className="text-stone-300">·</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 capitalize">
            {exam.domain.replace('-', ' ')}
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-editorial leading-[1.05] text-ink mb-3">
          {exam.shortName}
        </h1>
        <p className="text-stone-700 text-xl">{exam.fullName}</p>
      </header>

      <p className="editorial-lede text-stone-800 text-lg leading-relaxed">
        {exam.descriptionEn}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LastUpdated date={modified ?? SITE_REVIEWED} />
        {/* Shortlist — renders nothing until accounts are configured. */}
        <SaveButton kind="exam" slug={exam.slug} title={examLabel(exam)} region={exam.region} />
        {/* Tool entrance — no SDK on this page; the tool opens its form on this test.
            The href also carries this exam's destination, so a visitor who has not
            chosen one opens the tracker there rather than on the India default; a
            worldwide test carries none (scoreTrackerHref). A ToolLink, not next/link:
            Next scrolls a same-tab fragment navigation to the page's first element,
            which hid the header (G8-SK-5). */}
        <ToolLink
          href={scoreTrackerHref(exam.slug, exam.region)}
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 no-underline hover:underline"
        >
          <Award className="h-4 w-4" aria-hidden="true" /> Record your {trackerLabel(exam)}
        </ToolLink>
      </div>

      {/* Exam-concept archetype (empty hall, test desk, prep books…) — LCP for this page. */}
      <ContentImage
        asset={examImage({ slug: exam.slug, region: exam.region === 'global' ? undefined : exam.region })}
        variant="hero"
        priority
      />
      {/* Long-form twin — the dedicated guide for this exam, featured above the facts */}
      {primaryGuide && (
        <Link
          href={`/guides/${primaryGuide.slug}`}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-forest-200 bg-forest-50/70 px-5 py-4 no-underline transition-colors hover:border-forest-400 hover:bg-forest-50"
        >
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-700 mb-1">
              Full {exam.shortName} guide
            </span>
            <span className="font-display text-lg font-bold text-ink group-hover:text-forest-700 leading-snug">
              {primaryGuide.titleEn}
            </span>
            <span className="block text-sm text-stone-600 mt-1">
              {primaryGuide.readMinutes} min read · verified {formatReviewed(primaryGuide.lastVerified).display}
            </span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-forest-700" />
        </Link>
      )}

      {/* Facts grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FactCard icon={<Calendar className="w-5 h-5" />} label="Frequency" value={exam.frequency} />
        <FactCard icon={<Clock className="w-5 h-5" />} label="Duration" value={exam.duration} />
        <FactCard icon={<FileText className="w-5 h-5" />} label="Format" value={EXAM_FORMAT_LABEL[exam.mode]} />
        <FactCard icon={<Award className="w-5 h-5" />} label="Score range" value={exam.totalMarks} />
      </section>

      {/* Eligibility */}
      <section className="bg-cream-50 border border-stone-200 rounded-2xl p-6">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
          Eligibility
        </p>
        <p className="text-stone-800 text-base leading-relaxed m-0">{exam.eligibility}</p>
      </section>

      {/* Conducting body */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
            Conducting body
          </p>
          <p className="text-stone-800 text-base m-0">{exam.conductingBody}</p>
        </div>
        {exam.costUsd && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-2">
              Registration fee
            </p>
            <p className="text-stone-800 text-base m-0">{exam.costUsd}</p>
          </div>
        )}
      </section>

      {/* Official link */}
      {exam.websiteUrl && (
        <div className="space-y-2">
          <a
            href={exam.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-cream-50 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
          >
            Visit official website <ArrowUpRight className="w-4 h-4" />
          </a>
          <p className="text-stone-500 text-xs leading-relaxed max-w-xl">
            Source: {exam.conductingBody}
            {endsSentence(exam.conductingBody) ? '' : '.'} Details here are for guidance only — fees, dates and
            eligibility change each cycle, so confirm on the official site before applying.
          </p>
          {exam.sources && exam.sources.length > 0 && (
            <p className="text-stone-500 text-xs leading-relaxed max-w-xl m-0">
              Verified against:{' '}
              {exam.sources.map((s, i) => (
                <span key={s.url}>
                  {i > 0 && '; '}
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest-700 underline"
                  >
                    {s.label}
                  </a>
                </span>
              ))}
              {endsSentence(exam.sources[exam.sources.length - 1].label) ? '' : '.'}
            </p>
          )}
          {exam.lastVerified && (
            <p className="text-stone-500 text-xs leading-relaxed max-w-xl m-0">
              Last verified: {formatReviewed(exam.lastVerified).display}.
              {/* A later content change (a correction or a repaired or added
                  source) is dated separately, so the verification date is never
                  read as covering it. */}
              {modified && modified !== exam.lastVerified && (
                <> Content updated {formatReviewed(modified).display}, without a full re-check.</>
              )}
            </p>
          )}
        </div>
      )}

      {/* Universities accepting */}
      {acceptingColleges.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-2">
            Universities that accept {exam.shortName}
          </h2>
          {/* A university may take a test for some levels or courses and not others
              (an English test for undergraduate entry only, say), and this list does
              not say which (review DET-1). */}
          <p className="text-stone-600 text-sm leading-relaxed mb-5 max-w-2xl">
            Acceptance can differ by level and programme — confirm on the programme&rsquo;s own page.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {acceptingColleges.map((c) => {
              const collegeRegion = REGIONS.find((r) => r.slug === c.region);
              return (
                <Link
                  key={c.id}
                  href={`/colleges/${c.slug}`}
                  className="bg-white border border-stone-200 rounded-xl p-4 no-underline hover:border-forest-300 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {collegeRegion && <RegionFlag slug={collegeRegion.slug} className="h-3.5" />}
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      {collegeRegion?.displayName}
                    </span>
                  </div>
                  <p className="font-medium text-stone-800 text-sm group-hover:text-forest-700 m-0">
                    {c.nameEn}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Like / Share / Print */}
      <ContentActions title={examLabel(exam)} />

      {/* Related / Next steps */}
      {(relatedExams.length > 0 || region) && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-4">
            Related / Next steps
          </h2>
          {relatedExams.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {relatedExams.map((e) => (
                <Link
                  key={e.slug}
                  href={`/exams/${e.slug}`}
                  className="text-sm font-medium bg-forest-50 text-forest-800 border border-forest-200 px-3 py-1.5 rounded-full no-underline hover:bg-forest-100 transition-colors"
                >
                  {e.shortName}
                </Link>
              ))}
            </div>
          )}
          {region && (
            <Link
              href={`/regions/${region.slug}`}
              className="inline-flex items-center gap-1 text-forest-700 font-medium no-underline hover:text-forest-800"
            >
              Explore studying in {region.displayName} →
            </Link>
          )}
        </section>
      )}

      {/* Preparation guides */}
      {relatedGuides.length > 0 && (
        <section>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-editorial text-ink mb-5">
            Guides that cover the {proseExamName(exam)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className="group bg-white border border-stone-200 rounded-2xl p-5 no-underline hover:border-forest-300 hover:bg-cream-50 transition-colors"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest-700 mb-2">
                  {g.readMinutes} min read
                </p>
                <p className="font-display text-base font-bold text-ink m-0 group-hover:text-forest-700 leading-snug">
                  {g.titleEn}
                </p>
                <p className="text-stone-500 text-sm mt-2 mb-0 line-clamp-2">
                  {g.descriptionEn}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="on-dark bg-forest-700 text-cream-50 rounded-3xl px-6 sm:px-10 py-8">
        <h2 className="font-display text-2xl font-bold tracking-editorial mb-2">
          Need prep advice for the {proseExamName(exam)}?
        </h2>
        <p className="text-cream-50/85 mb-5">Ask GSB AI for a personalised study plan.</p>
        <Link
          href={gsbAiHref({ q: `How do I prepare for the ${proseExamName(exam)}?` })}
          className="inline-flex items-center justify-center bg-cream-50 hover:bg-cream-100 text-forest-900 font-semibold px-6 py-3 rounded-full no-underline transition-colors"
        >
          Ask GSB AI →
        </Link>
      </section>

      {exam.region !== 'global' && <RegionExplore region={exam.region} />}

      {/* Quick links — popular topics & guides */}
      <PageQuickLinks currentPath={`/exams/${exam.slug}`} region={exam.region} />

    </div>
  );
}

function FactCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4">
      <div className="text-forest-700 mb-2">{icon}</div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500 mb-1">
        {label}
      </p>
      <p className="text-stone-800 text-sm font-medium leading-snug m-0">{value}</p>
    </div>
  );
}
