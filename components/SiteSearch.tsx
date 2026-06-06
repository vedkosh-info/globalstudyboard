'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  GraduationCap,
  FileText,
  Globe2,
  BookOpen,
  CornerDownLeft,
  X,
} from 'lucide-react';

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

  // Submitting (button or Enter): jump to the top match if there is one, else
  // hand the query to GSB AI. With no query, just focus the field.
  const submitSearch = useCallback(() => {
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      setOpen(true);
      return;
    }
    if (results.length > 0) {
      setOpen(false);
      setQuery('');
      router.push(results[0].url);
      return;
    }
    askAi();
  }, [query, results, router, askAi]);

  const clear = useCallback(() => {
    setQuery('');
    setActive(-1);
    inputRef.current?.focus();
    setOpen(true);
  }, []);

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
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Enter') {
      // Handle Enter here so the form's implicit submit doesn't double-fire.
      e.preventDefault();
      if (active >= 0 && results[active]) {
        setOpen(false);
        setQuery('');
        router.push(results[active].url);
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
        className="flex items-stretch overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm transition-shadow focus-within:border-forest-400 focus-within:shadow-md focus-within:ring-2 focus-within:ring-forest-500/25"
      >
        <span className="pointer-events-none flex items-center pl-4 pr-2 text-stone-400">
          <Search className="h-5 w-5" aria-hidden="true" />
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search universities, exams, scholarships, guides…"
          aria-label="Search GlobalStudyBoard"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls="site-search-results"
          autoComplete="off"
          className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-0 sm:text-base"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="flex items-center px-2 text-stone-400 transition-colors hover:text-stone-700 focus-visible:outline-none focus-visible:text-forest-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className="flex items-center gap-2 bg-forest-700 px-4 text-sm font-semibold text-cream-50 transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cream-50/70 sm:px-5"
        >
          <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {showPanel && (
        <div
          id="site-search-results"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl"
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
                      <span className="block truncate font-medium text-stone-800">{u.title}</span>
                      <span className="block truncate text-xs text-stone-500">{u.subtitle}</span>
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
