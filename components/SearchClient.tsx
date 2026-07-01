'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Sparkles,
  GraduationCap,
  FileText,
  Globe2,
  BookOpen,
  ArrowRight,
  X,
} from 'lucide-react';

import type { ContentType, ContentUnit } from '@/lib/cmi';
import { useRegion } from '@/components/RegionProvider';
import { getRegionBySlug } from '@/lib/regions';
import RegionFlag from '@/components/RegionFlag';

/** A search hit — the unit plus the best URL to open (deep-linked to a section
 *  when the query matched a specific section heading). */
interface Hit {
  unit: ContentUnit;
  href: string;
}

const TYPE_LABEL: Record<ContentType, string> = {
  college: 'University',
  exam: 'Exam',
  region: 'Destination',
  guide: 'Guide',
};

const GROUP_HEADING: Record<ContentType, string> = {
  college: 'Universities',
  exam: 'Exams',
  guide: 'Guides',
  region: 'Destinations',
};

/** Order the result groups appear in on the page. */
const TYPE_ORDER: ContentType[] = ['college', 'exam', 'guide', 'region'];

/** Cap each group so a broad query can't render thousands of cards. */
const MAX_PER_GROUP = 30;

/**
 * Live search fires once the query is MORE THAN 5 letters (product requirement);
 * an explicit submit (Enter / Search button) or arriving with a query forces
 * results at any length so short acronyms like SAT, MIT or IIT still resolve.
 */
const AUTO_MIN = 5;

function TypeIcon({ type, className }: { type: ContentType; className?: string }) {
  const cls = `h-4 w-4 shrink-0 text-forest-600 ${className ?? ''}`;
  if (type === 'college') return <GraduationCap className={cls} aria-hidden="true" />;
  if (type === 'exam') return <FileText className={cls} aria-hidden="true" />;
  if (type === 'guide') return <BookOpen className={cls} aria-hidden="true" />;
  return <Globe2 className={cls} aria-hidden="true" />;
}

export default function SearchClient({ index }: { index: ContentUnit[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { effectiveRegion } = useRegion();

  const initial = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  // True once a real query exists (on arrival or explicit submit) — lets short
  // acronyms resolve even though live typing waits for > 5 letters.
  const [forced, setForced] = useState(initial.trim().length >= 2);
  const inputRef = useRef<HTMLInputElement>(null);

  const region = getRegionBySlug(effectiveRegion);

  // Focus the field on mount and place the caret at the end so a visitor who was
  // mid-typing in the header box can keep going without a break.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  // Keep the URL shareable + back-button-friendly as the query changes, without
  // spamming history (replace, debounced).
  useEffect(() => {
    const q = query.trim();
    const handle = setTimeout(() => {
      const target = q ? `/search?q=${encodeURIComponent(q)}` : '/search';
      const current = `/search${searchParams.get('q') ? `?q=${encodeURIComponent(searchParams.get('q')!)}` : ''}`;
      if (target !== current) router.replace(target, { scroll: false });
    }, 300);
    return () => clearTimeout(handle);
  }, [query, router, searchParams]);

  const q = query.trim().toLowerCase();
  const showResults = forced || q.length > AUTO_MIN;

  // Region-scoped results: ONLY the chosen destination's content (plus worldwide
  // tests, which belong to every destination). Other regions are never shown.
  // A hit matches page-level (title/lede/tags/FAQs/key-facts) OR at section level
  // (a section heading contains every term) — the latter deep-links to that
  // section's #anchor so the reader lands exactly where the answer is.
  const grouped = useMemo(() => {
    if (q.length < 2) return [] as { type: ContentType; items: Hit[] }[];
    const terms = q.split(/\s+/);
    const inRegion = (u: ContentUnit) =>
      u.region === effectiveRegion || u.region === 'global' || u.region === null;

    const hits: Hit[] = [];
    for (const u of index) {
      if (!inRegion(u)) continue;
      const pageMatch = terms.every((t) => u.keywords.includes(t));

      // Section-level: the first section whose heading contains every term. The
      // anchor is the RESOLVED one shipped by the CMI (identical to the DOM id),
      // so the deep-link always lands.
      let anchor: string | undefined;
      if (u.sections && u.sections.length > 0) {
        const sec = u.sections.find((s) => {
          const hl = s.h.toLowerCase();
          return terms.every((t) => hl.includes(t));
        });
        if (sec) anchor = sec.a;
      }

      if (!pageMatch && anchor === undefined) continue;
      hits.push({ unit: u, href: anchor ? `${u.url}#${anchor}` : u.url });
    }

    return TYPE_ORDER.map((type) => ({
      type,
      items: hits.filter((h) => h.unit.type === type).slice(0, MAX_PER_GROUP),
    })).filter((g) => g.items.length > 0);
  }, [q, effectiveRegion, index]);

  const totalCount = grouped.reduce((n, g) => n + g.items.length, 0);

  const aiHref = q ? `/gsb-ai?q=${encodeURIComponent(query.trim())}` : '/gsb-ai';

  function submit() {
    if (query.trim()) setForced(true);
    else inputRef.current?.focus();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-editorial text-ink mb-2">
          Search
        </h1>
        <p className="m-0 text-stone-600">
          Universities, exams, guides and scholarships
          {region && (
            <>
              {' '}for{' '}
              <span className="inline-flex items-center gap-1.5 font-semibold text-forest-700">
                <RegionFlag slug={region.slug} className="h-3.5" /> {region.displayName}
              </span>
            </>
          )}
          .
        </p>
      </header>

      {/* Search field — same single-line treatment as the header box, larger */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        role="search"
        className="flex items-stretch overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm transition-shadow focus-within:border-forest-400 focus-within:shadow-md focus-within:ring-2 focus-within:ring-forest-500/25"
      >
        <span className="flex items-center pl-4 text-stone-400">
          <Search className="h-5 w-5" aria-hidden="true" />
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search universities, exams, scholarships, guides…"
          aria-label="Search GlobalStudyBoard"
          autoComplete="off"
          className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-3.5 pl-3 pr-2 text-base text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-0"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setForced(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="flex items-center px-2 text-stone-400 transition-colors hover:text-stone-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 bg-forest-700 px-5 text-sm font-semibold text-cream-50 transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream-50/70"
        >
          <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Region scope note — results never cross destinations */}
      {region && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
          <Globe2 className="h-3.5 w-3.5 shrink-0 text-forest-500" aria-hidden="true" />
          Showing {region.displayName} results only. Change your destination from the bar above to
          search another region.
        </p>
      )}

      <div className="mt-8" aria-live="polite">
        {!showResults ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-cream-50 px-5 py-8 text-center text-sm text-stone-500">
            Type more than five letters to search — or press Enter for a shorter query like “SAT”.
          </p>
        ) : totalCount > 0 ? (
          <>
            <p className="mb-5 text-sm text-stone-500">
              {totalCount} result{totalCount === 1 ? '' : 's'} for{' '}
              <span className="font-semibold text-stone-700">“{query.trim()}”</span>
            </p>
            <div className="space-y-8">
              {grouped.map((g) => (
                <section key={g.type}>
                  <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    <TypeIcon type={g.type} className="text-stone-400" />
                    {GROUP_HEADING[g.type]}
                    <span className="font-normal normal-case tracking-normal text-stone-400">
                      ({g.items.length})
                    </span>
                  </h2>
                  <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
                    {g.items.map(({ unit: u, href }) => (
                      <li key={`${u.type}-${u.slug}`} className="m-0">
                        <Link
                          href={href}
                          className="flex h-full items-start gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 no-underline transition-colors hover:border-forest-300 hover:bg-forest-50"
                        >
                          <TypeIcon type={u.type} className="mt-0.5" />
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold text-stone-800">{u.title}</span>
                            <span className="mt-0.5 block line-clamp-2 text-xs text-stone-500">
                              {u.subtitle}
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-500">
                            {TYPE_LABEL[u.type]}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-8 text-center">
            <p className="m-0 text-stone-600">
              No matches in {region?.displayName ?? 'this destination'} for{' '}
              <span className="font-semibold">“{query.trim()}”</span>.
            </p>
            <p className="mx-auto mt-1 mb-0 max-w-md text-sm text-stone-500">
              Try a different term, change your destination, or ask GSB AI for guidance.
            </p>
          </div>
        )}
      </div>

      {/* Ask GSB AI — always available as a fallback / deeper-help path */}
      <Link
        href={aiHref}
        className="mt-8 flex items-center gap-3 rounded-2xl border border-forest-200 bg-forest-50 px-5 py-4 no-underline transition-colors hover:border-forest-300 hover:bg-forest-100"
      >
        <Sparkles className="h-5 w-5 shrink-0 text-forest-600" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-forest-800">
            Ask GSB AI{query.trim() ? `: “${query.trim()}”` : ''}
          </span>
          <span className="block text-sm text-forest-700/80">
            Get a personalised answer for {region?.displayName ?? 'your destination'}.
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-forest-500" aria-hidden="true" />
      </Link>
    </div>
  );
}
