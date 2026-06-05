'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, GraduationCap, FileText, Globe2, BookOpen, CornerDownLeft } from 'lucide-react';

import { CONTENT_INDEX, type ContentType } from '@/lib/cmi';

const MAX_RESULTS = 8;

const TYPE_LABEL: Record<ContentType, string> = {
  college: 'University',
  exam: 'Exam',
  region: 'Region',
  guide: 'Guide',
};

function TypeIcon({ type }: { type: ContentType }) {
  const cls = 'h-4 w-4 shrink-0 text-forest-600';
  if (type === 'college') return <GraduationCap className={cls} aria-hidden="true" />;
  if (type === 'exam') return <FileText className={cls} aria-hidden="true" />;
  if (type === 'guide') return <BookOpen className={cls} aria-hidden="true" />;
  return <Globe2 className={cls} aria-hidden="true" />;
}

export default function SiteSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const terms = q.split(/\s+/);
    return CONTENT_INDEX.filter((u) => terms.every((t) => u.keywords.includes(t))).slice(
      0,
      MAX_RESULTS,
    );
  }, [query]);

  const askAi = useCallback(() => {
    const q = query.trim();
    const href = q ? `/gsb-ai?q=${encodeURIComponent(q)}` : '/gsb-ai';
    setOpen(false);
    setQuery('');
    router.push(href);
  }, [query, router]);

  // The leading button performs the search: jump to the top match if there is
  // one, otherwise hand the query to GSB AI. With no query, it just focuses.
  const submitSearch = useCallback(() => {
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      setOpen(true);
      return;
    }
    if (results.length > 0) {
      const u = results[0];
      setOpen(false);
      setQuery('');
      router.push(u.url);
      return;
    }
    askAi();
  }, [query, results, router, askAi]);

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Enter') {
      if (active >= 0 && results[active]) {
        const u = results[active];
        setOpen(false);
        setQuery('');
        router.push(u.url);
      } else {
        submitSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showPanel = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full" role="search">
      <div className="relative flex items-center">
        {/* Clickable search button (left) */}
        <button
          type="button"
          onClick={submitSearch}
          aria-label="Search"
          title="Search"
          className="absolute left-1.5 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-forest-50 hover:text-forest-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search universities, exams, regions…"
          aria-label="Search GlobalStudyBoard"
          autoComplete="off"
          className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-12 pr-4 text-sm text-stone-800 shadow-sm placeholder:text-stone-400 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/30"
        />
      </div>

      {showPanel && (
        <div
          id="site-search-results"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg"
        >
          {results.length > 0 ? (
            <ul className="m-0 max-h-80 list-none overflow-y-auto p-0 py-1">
              {results.map((u, i) => (
                <li key={`${u.type}-${u.slug}`} className="m-0">
                  <Link
                    href={u.url}
                    onClick={() => {
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm no-underline transition-colors ${
                      i === active ? 'bg-forest-50' : 'hover:bg-stone-50'
                    }`}
                  >
                    <TypeIcon type={u.type} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-stone-800">
                        {u.title}
                      </span>
                      <span className="block truncate text-xs text-stone-500">
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
          ) : (
            <p className="m-0 px-3 py-3 text-sm text-stone-500">
              No direct matches. Ask GSB AI for guidance.
            </p>
          )}

          <button
            type="button"
            onClick={askAi}
            className="flex w-full items-center gap-2 border-t border-stone-100 bg-cream-50 px-3 py-2.5 text-left text-sm font-medium text-forest-700 transition-colors hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest-500"
          >
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">Ask GSB AI{query.trim() ? `: “${query.trim()}”` : ''}</span>
            <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-forest-400" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
