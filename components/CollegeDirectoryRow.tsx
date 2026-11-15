import Link from 'next/link';
import type { College } from '@/lib/colleges';
import { SPECIALIZATION_LABELS } from '@/lib/college-taxonomy';
import { categoryRowLabel, qsChip } from '@/lib/college-labels';

export default function CollegeDirectoryRow({
  c,
  showTests = false,
}: {
  c: College;
  showTests?: boolean;
}) {
  const specs = c.specializations ?? [];
  const visibleSpecs = specs.slice(0, 3);
  const extraSpecCount = specs.length - visibleSpecs.length;
  const datedQs = c.ranking?.qsYear ? qsChip(c.ranking) : null;

  return (
    <li
      id={`college-${c.slug}`}
      data-slug={c.slug}
      className="m-0 border-b border-stone-200 py-4 last:border-b-0"
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Link
            href={`/colleges/${c.slug}`}
            className="text-base font-semibold leading-snug text-ink no-underline transition-colors hover:text-forest-700"
          >
            {c.nameEn}
          </Link>
          <span className="mt-0.5 block text-sm text-stone-600 sm:mt-0 sm:ml-2.5 sm:inline">
            {c.city}
            {c.state ? `, ${c.state}` : ''} · Est. {c.established}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-700">
            {categoryRowLabel(c)}
          </span>
          {datedQs && (
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-stone-600">
              {datedQs}
            </span>
          )}
        </div>
      </div>
      {(visibleSpecs.length > 0 || (showTests && c.admissionExams.length > 0)) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {visibleSpecs.map((s) => (
            <span
              key={s}
              className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-medium text-forest-800"
            >
              {SPECIALIZATION_LABELS[s]}
            </span>
          ))}
          {extraSpecCount > 0 && (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
              +{extraSpecCount}
            </span>
          )}
          {showTests &&
            c.admissionExams.slice(0, 3).map((e) => (
              <span
                key={e}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700"
              >
                {e}
              </span>
            ))}
        </div>
      )}
    </li>
  );
}
