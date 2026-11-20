'use client';

import { ANALYTICS_OPEN_EVENT, ANALYTICS_UI, GA_MEASUREMENT_ID } from '@/lib/analytics';

/** Also usable on /cookies; no tracker or storage read in this small trigger. */
export default function AnalyticsPreferencesButton({ className }: { className?: string }) {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(ANALYTICS_OPEN_EVENT))}
    >
      {ANALYTICS_UI.preferences}
    </button>
  );
}
