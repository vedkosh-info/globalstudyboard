import { SITE_STATS } from '@/lib/site-stats';

/**
 * A premium, content-first KPI strip driven by live catalogue counts
 * (lib/site-stats.ts). Fully static — no client JS, no request-time work.
 * Reusable on any page (About, Home, region hubs).
 */
export default function SiteStats({ className = '' }: { className?: string }) {
  return (
    <section
      aria-label="GlobalStudyBoard at a glance"
      className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}
    >
      {SITE_STATS.map((stat) => (
        <div
          key={stat.label}
          title={stat.detail}
          className="bg-white border border-stone-200 rounded-2xl p-5 text-center"
        >
          <div className="font-display text-3xl sm:text-4xl font-bold tracking-editorial text-forest-700 leading-none">
            {stat.value}
          </div>
          <div className="mt-2 text-sm font-medium text-stone-700 leading-snug">
            {stat.label}
          </div>
          <span className="sr-only">. {stat.detail}</span>
        </div>
      ))}
    </section>
  );
}
