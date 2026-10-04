'use client';

import type { Region } from '@/lib/regions';
import { useRegion } from '@/components/RegionProvider';

/**
 * Optional country inside the destination already chosen in the header.
 * One country: the control is omitted (the destination is that country).
 * Several: the list is only that destination's countries. Another country
 * means changing the destination first.
 */
export default function CountrySelect({ region }: { region: Region }) {
  const { country, setCountry } = useRegion();
  if (region.countries.length < 2) return null;
  const value = country && region.countries.includes(country) ? country : '';
  return (
    <select
      value={value}
      onChange={(e) => setCountry(e.target.value || null)}
      aria-label={`Country in ${region.displayName}, optional. Only countries in this destination.`}
      className="mt-2 h-9 max-w-full rounded-full border border-stone-300 bg-white px-3 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
    >
      <option value="">All countries</option>
      {region.countries.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
