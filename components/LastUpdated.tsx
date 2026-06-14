import { RefreshCw } from 'lucide-react';
import { formatReviewed } from '@/lib/site-meta';

/**
 * Subtle "Last updated <date>" freshness signal for content and listing pages.
 * Renders a semantic <time> for SEO. Pass a content unit's own `lastVerified`
 * where one exists; otherwise pass SITE_REVIEWED from `lib/site-meta`.
 */
export default function LastUpdated({
  date,
  prefix = 'Last updated',
  className = '',
}: {
  date: string;
  prefix?: string;
  className?: string;
}) {
  const { display, iso } = formatReviewed(date);
  return (
    <p
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 m-0 ${className}`}
    >
      <RefreshCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>
        {prefix} <time dateTime={iso}>{display}</time>
      </span>
    </p>
  );
}
