'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

import { DEFAULT_REGION, getRegionBySlug, type RegionSlug } from '@/lib/regions';
import type { CollegeCategory, Specialization } from '@/lib/college-taxonomy';
import { useRegion } from '@/components/RegionProvider';
import RegionFlag from '@/components/RegionFlag';

export interface CollegeFilterRow {
  slug: string;
  region: RegionSlug;
  regions: RegionSlug[];
  /** null matches only "All". Never a sixth "unclassified" category. */
  category: CollegeCategory | null;
  specializations: Specialization[];
}

interface Filters {
  showAll: boolean;
  destination: RegionSlug;
  category: CollegeCategory | 'all';
  field: Specialization | 'all';
}

export function rowVisible(
  row: CollegeFilterRow,
  f: Filters,
  scope: 'worldwide' | 'region',
): boolean {
  const destinationOk =
    scope === 'region' || f.showAll || row.regions.includes(f.destination);
  const categoryOk = f.category === 'all' || row.category === f.category;
  const fieldOk = f.field === 'all' || row.specializations.includes(f.field);
  return destinationOk && categoryOk && fieldOk;
}

interface Props {
  rows: CollegeFilterRow[];
  scope: 'worldwide' | 'region';
  pageRegion?: RegionSlug;
  categoryOptions: { value: CollegeCategory; label: string }[];
  fieldOptions: { value: Specialization; label: string }[];
  children: React.ReactNode;
}

function parseHash(
  hash: string,
  validCategories: ReadonlySet<string>,
  validFields: ReadonlySet<string>,
): { category?: CollegeCategory; field?: Specialization } {
  const raw = hash.replace(/^#/, '').trim();
  if (!raw) return {};
  const params = new URLSearchParams(raw);
  const cat = params.get('cat');
  const fld = params.get('field');
  return {
    category: cat && validCategories.has(cat) ? (cat as CollegeCategory) : undefined,
    field: fld && validFields.has(fld) ? (fld as Specialization) : undefined,
  };
}

function buildHash(category: CollegeCategory | 'all', field: Specialization | 'all'): string {
  const parts: string[] = [];
  if (category !== 'all') parts.push(`cat=${encodeURIComponent(category)}`);
  if (field !== 'all') parts.push(`field=${encodeURIComponent(field)}`);
  return parts.length > 0 ? `#${parts.join('&')}` : '';
}

/**
 * The single client island that owns `hidden` on university directory rows
 * (`/colleges` and `/regions/[region]/universities`). Names, places, and years
 * stay in the server-rendered `children` HTML and are joined by `data-slug`.
 */
export default function CollegeDirectoryFilter({
  rows,
  scope,
  pageRegion,
  categoryOptions,
  fieldOptions,
  children,
}: Props) {
  const { region } = useRegion();
  const containerRef = useRef<HTMLDivElement>(null);

  const validCategories = useMemo(
    () => new Set<string>(categoryOptions.map((o) => o.value)),
    [categoryOptions],
  );
  const validFields = useMemo(
    () => new Set<string>(fieldOptions.map((o) => o.value)),
    [fieldOptions],
  );

  // On `/colleges` (`scope === 'worldwide'`), unfiltered by default so the first
  // HTML has no `hidden`.
  const [showAll, setShowAll] = useState(true);
  const [category, setCategory] = useState<CollegeCategory | 'all'>('all');
  const [field, setField] = useState<Specialization | 'all'>('all');

  const destination: RegionSlug = pageRegion ?? region ?? DEFAULT_REGION;
  const r = getRegionBySlug(destination);

  // Read #cat= and #field= on mount and on hashchange.
  useEffect(() => {
    const syncFromHash = () => {
      const parsed = parseHash(window.location.hash, validCategories, validFields);
      if (parsed.category) setCategory(parsed.category);
      else if (window.location.hash.includes('cat=')) setCategory('all');
      if (parsed.field) setField(parsed.field);
      else if (window.location.hash.includes('field=')) setField('all');
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [validCategories, validFields]);

  const updateFilters = (
    nextCategory: CollegeCategory | 'all',
    nextField: Specialization | 'all',
  ) => {
    setCategory(nextCategory);
    setField(nextField);
    if (typeof window !== 'undefined') {
      const nextHash = buildHash(nextCategory, nextField);
      const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
      window.history.replaceState(null, '', nextUrl);
    }
  };

  const filters: Filters = useMemo(
    () => ({ showAll, destination, category, field }),
    [showAll, destination, category, field],
  );

  const visibleSlugs = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) {
      if (rowVisible(row, filters, scope)) {
        set.add(row.slug);
      }
    }
    return set;
  }, [rows, filters, scope]);

  // Apply `hidden` to server-rendered `<li data-slug>` and `<section data-region-section>`.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>('li[data-slug]');
    items.forEach((li) => {
      const slug = li.getAttribute('data-slug') ?? '';
      li.classList.toggle('hidden', !visibleSlugs.has(slug));
    });
    const sections = root.querySelectorAll<HTMLElement>('section[data-region-section]');
    sections.forEach((sec) => {
      const secItems = sec.querySelectorAll<HTMLElement>('li[data-slug]');
      let anyVisible = false;
      secItems.forEach((li) => {
        if (!li.classList.contains('hidden')) anyVisible = true;
      });
      sec.classList.toggle('hidden', !anyVisible);
    });
  }, [visibleSlugs]);

  const visibleCount = visibleSlugs.size;
  const totalCount = rows.length;

  const chipBase =
    'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-1';
  const chipActive = `${chipBase} border-forest-700 bg-forest-700 text-cream-50`;
  const chipIdle = `${chipBase} border-stone-300 bg-white text-stone-700 hover:border-forest-300 hover:text-forest-800`;

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        {scope === 'worldwide' && (
          <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {showAll ? (
                <span aria-hidden="true" className="shrink-0 text-2xl leading-none">
                  🌐
                </span>
              ) : (
                <RegionFlag slug={destination} className="h-6" />
              )}
              <div className="min-w-0">
                <p className="m-0 font-display text-lg font-bold leading-snug tracking-editorial text-ink">
                  {showAll ? 'All universities worldwide' : `Universities for ${r?.displayName}`}
                </p>
                <p className="m-0 text-xs text-stone-600">
                  {showAll
                    ? 'Every study destination is shown below.'
                    : `Tuned to your destination — change it from the bar above.`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-pressed={!showAll}
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-forest-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:border-forest-400 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 sm:self-auto"
            >
              {showAll ? (
                <>
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Filter to {r?.displayName}
                </>
              ) : (
                'Show all regions'
              )}
            </button>
          </div>
        )}

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
            Showing {visibleCount} of {totalCount} {totalCount === 1 ? 'university' : 'universities'}
            {scope === 'worldwide' && !showAll && r ? ` for ${r.proseName}` : ''}.
          </p>
          {(category !== 'all' || field !== 'all' || (scope === 'worldwide' && !showAll)) && (
            <button
              type="button"
              onClick={() => {
                setShowAll(true);
                updateFilters('all', 'all');
              }}
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
                ? 'No profile in this view matches that category yet. The five categories are on records whose category was read and on institute, liberal-arts, and specialist types already stored.'
                : 'We don’t profile universities for this destination yet. Use Show all regions above to browse every university we cover.'}
          </p>
        </div>
      )}

      <div ref={containerRef} className={visibleCount === 0 ? 'hidden' : 'space-y-12'}>
        {children}
      </div>
    </div>
  );
}
