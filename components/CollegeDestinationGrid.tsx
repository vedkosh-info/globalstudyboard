'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { RegionSlug } from '@/lib/regions';
import { collegeFiltersHash, parseCollegeFilters } from '@/lib/college-directory-filters';
import RegionFlag from '@/components/RegionFlag';

interface Destination {
  slug: RegionSlug;
  name: string;
  href: string;
  count: number;
}

export default function CollegeDestinationGrid({ destinations }: { destinations: Destination[] }) {
  const [filterHash, setFilterHash] = useState('');

  // Legacy worldwide filters carry through when a visitor chooses a destination.
  useEffect(() => {
    const sync = () => setFilterHash(collegeFiltersHash(parseCollegeFilters(window.location.hash)));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return (
    <nav aria-label="University directories by destination">
      {filterHash && (
        <p className="mb-4 text-sm text-stone-700">Choose a destination to apply the filters in this link.</p>
      )}
      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map(({ slug, name, href, count }) => (
          <li key={slug} id={`universities-${slug}`} className="scroll-mt-24">
            <Link
              href={href + filterHash}
              prefetch={false}
              className="flex h-full min-h-24 items-start gap-3 rounded-2xl border border-stone-200 bg-white p-5 text-ink no-underline transition-colors hover:border-forest-500 hover:bg-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-600"
            >
              <RegionFlag slug={slug} className="mt-1 h-5 shrink-0" />
              <span className="min-w-0">
                <span className="block font-display text-xl font-bold leading-snug">{name}</span>
                <span className="mt-1 block text-sm text-stone-600">
                  {count} {count === 1 ? 'profile' : 'profiles'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
