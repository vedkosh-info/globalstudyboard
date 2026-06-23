'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

/**
 * The persistent search box shown at the top of every page. It does NOT open a
 * popup: as the visitor types more than five letters it navigates to the
 * dedicated, region-scoped results page (/search) which renders matches inline
 * and keeps updating as they type. Enter or the Search button go there
 * immediately at any length (so short acronyms like "SAT" still work).
 */

/** Live navigation fires once the query is MORE THAN 5 letters. */
const AUTO_MIN = 5;

export default function SiteSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPushed = useRef('');
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The /search page has its own larger field — don't double up the box there.
  const onSearchPage = pathname === '/search';

  const go = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      if (lastPushed.current === trimmed) return;
      lastPushed.current = trimmed;
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [router],
  );

  // As the visitor types: once past five letters, debounce-navigate to the
  // dynamic results page so relevant content appears without a popup.
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const trimmed = query.trim();
    if (trimmed.length > AUTO_MIN) {
      debounce.current = setTimeout(() => go(trimmed), 250);
    }
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query, go]);

  const submit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [query, router]);

  if (onSearchPage) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      role="search"
      className="flex w-full items-stretch overflow-hidden rounded-2xl border border-stone-300 bg-white shadow-sm transition-shadow focus-within:border-forest-400 focus-within:shadow-md focus-within:ring-2 focus-within:ring-forest-500/25"
    >
      <span className="flex items-center pl-4 text-stone-400">
        <Search className="h-4 w-4" aria-hidden="true" />
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
        className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-3 pl-3 pr-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-0 sm:text-base"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            lastPushed.current = '';
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="flex items-center px-2 text-stone-400 transition-colors hover:text-stone-700 focus-visible:text-forest-700 focus-visible:outline-none"
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
  );
}
