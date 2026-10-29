import { GraduationCap } from 'lucide-react';
import ToolLink from '@/components/tools/ToolLink';
import { SCHOLARSHIP_DISCOVERY_COPY, scholarshipTrackerHref, type ScholarshipOption } from '@/lib/scholarship-options';
import type { RegionSlug } from '@/lib/regions';

/** Server-rendered entry; only the compact href crosses the ToolLink boundary. */
export default function TrackScholarshipLink({ award, region }: { award?: ScholarshipOption; region: RegionSlug }) {
  return (
    <ToolLink
      href={scholarshipTrackerHref(award, region)}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest-300 bg-forest-50 px-4 py-2 text-sm font-semibold leading-snug text-forest-800 no-underline transition-colors hover:border-forest-500 hover:bg-forest-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 focus-visible:ring-offset-2"
    >
      <GraduationCap className="h-4 w-4 shrink-0" aria-hidden="true" />
      {award ? SCHOLARSHIP_DISCOVERY_COPY.trackNamed(award.name) : SCHOLARSHIP_DISCOVERY_COPY.trackLabel}
    </ToolLink>
  );
}
