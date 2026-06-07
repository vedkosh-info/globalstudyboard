import type { GuideKeyFact } from '@/lib/guides';

/**
 * "Key facts" box — a scannable summary of an exam/process guide's hard facts
 * (conducting body, eligibility, mode, official link). Rendered only when the
 * guide supplies `keyFacts`. Snippet-friendly and consistent with the cream/
 * stone card system.
 */
export default function KeyFacts({
  rows,
  title = 'Key facts',
}: {
  rows: GuideKeyFact[];
  title?: string;
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <section
      aria-label={title}
      className="bg-cream-50 border border-stone-200 rounded-2xl p-5 sm:p-6"
    >
      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-stone-500 mb-4 m-0">
        {title}
      </p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 m-0">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 m-0">
              {r.label}
            </dt>
            <dd className="text-stone-800 text-sm leading-relaxed m-0 mt-0.5">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
