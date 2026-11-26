import Link from 'next/link';
import type { College } from '@/lib/colleges';
import CollegeDirectoryRow from '@/components/CollegeDirectoryRow';

export interface PlaceGroup {
  /** Stable id for the section (`place-{key}`). */
  key: string;
  heading: string;
  /** Present only when the place has its own published page. */
  href?: string;
  colleges: College[];
}

export interface PlaceLink {
  key: string;
  label: string;
  href: string;
  count: number;
}

/**
 * Place links to published directories or sections within the current directory.
 */
export function PlaceChips({ title, places }: { title: string; places: PlaceLink[] }) {
  if (places.length === 0) return null;
  return (
    <nav aria-label={title}>
      <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-[0.18em] text-stone-600">
        {title}
      </h2>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {places.map((p) => {
          const PlaceAnchor = p.href.startsWith('#') ? 'a' : Link;
          return (
            <li key={p.key} className="m-0">
              <PlaceAnchor
                href={p.href}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-sm font-medium text-stone-700 no-underline transition-colors hover:border-forest-300 hover:text-forest-700"
              >
                {p.label}
                <span className="text-xs text-stone-600">{p.count}</span>
              </PlaceAnchor>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * University rows grouped under place headings. Each `<section>` carries
 * `data-region-section`, so CollegeDirectoryFilter hides a heading whose rows
 * are all filtered out. With a single group the heading is dropped.
 */
export default function PlaceDirectory({
  groups,
  label,
  showTests = true,
}: {
  groups: PlaceGroup[];
  label: string;
  showTests?: boolean;
}) {
  const single = groups.length === 1;
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section
          key={g.key}
          id={`place-${g.key}`}
          data-region-section={g.key}
          aria-labelledby={single ? undefined : `place-heading-${g.key}`}
          aria-label={single ? label : undefined}
          className="scroll-mt-24"
        >
          {!single && (
            <div className="mb-1 flex items-baseline justify-between gap-3 border-b border-stone-300 pb-2">
              <h2
                id={`place-heading-${g.key}`}
                className="m-0 font-display text-lg font-bold tracking-editorial text-ink md:text-xl"
              >
                {g.href ? (
                  <Link href={g.href} className="text-ink no-underline hover:text-forest-700">
                    {g.heading}
                  </Link>
                ) : (
                  g.heading
                )}
              </h2>
              <span className="shrink-0 text-sm text-stone-600">
                {g.colleges.length} {g.colleges.length === 1 ? 'profile' : 'profiles'}
              </span>
            </div>
          )}
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-1 sm:px-6">
            <ul className="m-0 list-none p-0">
              {g.colleges.map((c) => (
                <CollegeDirectoryRow key={c.slug} c={c} showTests={showTests} />
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
