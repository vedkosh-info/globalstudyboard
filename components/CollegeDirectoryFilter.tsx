'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CATEGORY_ROW_LABELS, COLLEGE_CATEGORIES, SPECIALIZATION_LABELS, SPECIALIZATIONS } from '@/lib/college-taxonomy';
import { collegeFiltersHash, parseCollegeFilters, type CollegeFilters } from '@/lib/college-directory-filters';

const allFilters: CollegeFilters = { category: 'all', field: 'all' };
const categoryOptions = COLLEGE_CATEGORIES.map((value) => ({ value, label: CATEGORY_ROW_LABELS[value] }));
const fieldOptions = SPECIALIZATIONS.map((value) => ({ value, label: SPECIALIZATION_LABELS[value] }));

export default function CollegeDirectoryFilter({ totalCount, children }: { totalCount: number; children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenPlaceTarget = useRef<HTMLElement | null>(null);
  const [{ category, field }, setFilters] = useState(allFilters);
  const [visibleCount, setVisibleCount] = useState(totalCount);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#place-')) {
        const target = document.getElementById(hash.slice(1));
        if (target?.classList.contains('hidden')) {
          hiddenPlaceTarget.current = target;
          setFilters(allFilters);
        }
        return;
      }
      setFilters(parseCollegeFilters(hash));
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  function updateFilters(nextCategory: CollegeFilters['category'], nextField: CollegeFilters['field']) {
    const next = { category: nextCategory, field: nextField };
    setFilters(next);
    window.history.replaceState(null, '', window.location.pathname + window.location.search + collegeFiltersHash(next));
  }

  // Filter the existing server rows, so a large directory needs no parallel data payload.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    let count = 0;
    for (const row of root.querySelectorAll<HTMLElement>('li[data-slug]')) {
      const categoryOk = category === 'all' || row.dataset.category === category;
      const fieldOk = field === 'all' || Boolean(row.dataset.fields?.split(' ').includes(field));
      const visible = categoryOk && fieldOk;
      row.classList.toggle('hidden', !visible);
      if (visible) count += 1;
    }
    for (const section of root.querySelectorAll('section[data-region-section]')) {
      section.classList.toggle('hidden', !section.querySelector('li[data-slug]:not(.hidden)'));
    }
    setVisibleCount(count);
    hiddenPlaceTarget.current?.scrollIntoView({ block: 'start' });
    hiddenPlaceTarget.current = null;
  }, [category, field, totalCount]);

  const chipBase =
    'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1';
  const chipActive = `${chipBase} border-forest-700 bg-forest-700 text-cream-50`;
  const chipIdle = `${chipBase} border-stone-300 bg-white text-stone-700 hover:border-forest-300 hover:text-forest-800`;

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        <div className="space-y-3">
          <div>
            <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
              Category
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by institution category">
              <button
                type="button"
                aria-pressed={category === 'all'}
                onClick={() => updateFilters('all', field)}
                className={category === 'all' ? chipActive : chipIdle}
              >
                All categories
              </button>
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={category === opt.value}
                  onClick={() => updateFilters(opt.value, field)}
                  className={category === opt.value ? chipActive : chipIdle}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
              Field
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by academic field">
              <button
                type="button"
                aria-pressed={field === 'all'}
                onClick={() => updateFilters(category, 'all')}
                className={field === 'all' ? chipActive : chipIdle}
              >
                All fields
              </button>
              {fieldOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={field === opt.value}
                  onClick={() => updateFilters(category, opt.value)}
                  className={field === opt.value ? chipActive : chipIdle}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3">
          <p aria-live="polite" className="m-0 text-xs font-medium text-stone-600">
            Showing {visibleCount} of {totalCount} {totalCount === 1 ? 'university' : 'universities'}.
          </p>
          {(category !== 'all' || field !== 'all') && (
            <button
              type="button"
              onClick={() => updateFilters('all', 'all')}
              className="text-xs font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 rounded"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {visibleCount === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="m-0 text-stone-700">
            {field !== 'all'
              ? 'No profile in this view has that field recorded yet.'
              : category !== 'all'
                ? 'No profile in this view has that category recorded yet.'
                : 'No university profiles are listed here yet.'}
          </p>
        </div>
      )}

      <div ref={containerRef} className="space-y-12">
        {children}
      </div>
    </div>
  );
}
