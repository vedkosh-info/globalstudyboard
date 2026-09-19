'use client';

import { Bug, MessageSquarePlus } from 'lucide-react';
import FeedbackButton from '@/components/FeedbackButton';

/**
 * The two in-page feedback entry points on /contact — the page itself is a
 * server component, so the buttons live in this small client island. Each
 * opens the global feedback dialog on its own tab; a visitor never has to
 * leave the site or open an email client to report a problem.
 */
export default function ContactFeedbackActions() {
  const base =
    'inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors';
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* `url: null` — a report started from the contact page is about some
          OTHER page, so the link field starts empty rather than pointing here. */}
      <FeedbackButton
        kind="issue"
        prefill={{ url: null }}
        className={`${base} bg-forest-700 text-cream-50 hover:bg-forest-800`}
      >
        <Bug className="h-4 w-4" aria-hidden="true" />
        Report an issue
      </FeedbackButton>
      <FeedbackButton
        kind="suggestion"
        prefill={{ url: null }}
        className={`${base} border border-forest-700 bg-transparent text-forest-700 hover:bg-forest-50`}
      >
        <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
        Share feedback
      </FeedbackButton>
    </div>
  );
}
