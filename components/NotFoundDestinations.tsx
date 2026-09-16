'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { REGIONS_ALPHABETICAL } from '@/lib/regions';
import RegionFlag from '@/components/RegionFlag';

/**
 * The nine-destination grid on the 404 page, as a CLIENT component on purpose:
 * the root not-found boundary is embedded in the React Flight payload of every
 * static page, and as a server component this grid serialised nine inline flag
 * SVGs (~20 KB raw) into all 3,400+ pages. As a client component the payload
 * carries a module reference + nine slugs; the flag SVGs already ship in the
 * shared client chunk the header's destination control loads.
 */
export default function NotFoundDestinations() {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {REGIONS_ALPHABETICAL.map((r) => (
        <li key={r.slug}>
          <Link
            href={`/regions/${r.slug}`}
            className="group flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 no-underline transition-colors hover:border-forest-300"
          >
            <RegionFlag slug={r.slug} className="h-5" />
            <span className="font-medium text-ink group-hover:text-forest-700">{r.displayName}</span>
            <ArrowUpRight className="ml-auto h-4 w-4 text-stone-300 group-hover:text-forest-600" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
