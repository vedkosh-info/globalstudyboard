import Link from 'next/link';
import { REGIONS_ALPHABETICAL, type RegionSlug } from '@/lib/regions';
import RegionFlag from '@/components/RegionFlag';

interface Props {
  activeSlug?: RegionSlug;
  sticky?: boolean;
}

export default function RegionRail({ activeSlug, sticky = false }: Props) {
  return (
    <nav
      aria-label="Regions"
      className={`${
        sticky ? 'sticky top-20 z-30 bg-cream-100/95 backdrop-blur border-y border-stone-200' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-3 -mx-1 px-1">
          {REGIONS_ALPHABETICAL.map((r) => {
            const active = r.slug === activeSlug;
            return (
              <Link
                key={r.slug}
                href={`/regions/${r.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm no-underline transition-colors border ${
                  active
                    ? 'bg-forest-700 text-cream-50 border-forest-700'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-forest-300 hover:text-forest-700'
                }`}
              >
                <RegionFlag slug={r.slug} className="h-4" />
                <span className="font-medium">{r.displayName}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
