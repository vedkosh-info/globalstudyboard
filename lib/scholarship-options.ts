import type { RegionSlug } from '@/lib/regions';

/** Compact, public identity data. This is not an eligibility or award-cycle database. */
export interface ScholarshipOption {
  /** The existing canonical guide, also used as the allow-listed prefill key. */
  slug: string;
  name: string;
  provider: string;
  /** Study destination, never inferred from the applicant's nationality. */
  region: RegionSlug;
  officialUrl: string;
  guideTitle: string;
  /** Identity/provider/destination check only; not a full guide or requirements review. */
  sourceReviewed: string;
}

export interface ScholarshipCatalogue {
  awards: ScholarshipOption[];
}

export const SCHOLARSHIP_DISCOVERY_COPY = {
  trackLabel: 'Track a scholarship',
  trackNamed: (name: string): string => `Track ${name}`,
  title: 'Keep your scholarship plans together',
  description: 'Save a scholarship, add your next step when you are ready, and keep track of your application. Free with an account.',
  sourceNote: 'Names and study destinations checked against official sources. This is a small starting list, not a complete directory or an eligibility match. Check the current application route, requirements and dates with the provider.',
} as const;

export const SCHOLARSHIP_ACCOUNT_COPY = {
  stored: 'everything you enter into the Scholarship Tracker (the scholarship name, provider, official link, linked guide, destination, application cycle, status, checklist items, your dates and private notes, and links to your university application and any funding line you add to your budget). Please keep identity numbers, bank details and other sensitive personal information out of scholarship notes and tasks. The tracker stores tracking details, not uploaded documents.',
  deleted: 'Your Scholarship Tracker — every scholarship, application status, task, date, note and link to your other tools.',
  purpose: 'Solely to run your account: to sign you in, keep your saved pages, planner, budgets, comparisons, test scores, scholarship records and preferences across devices, and answer your requests. We do not use your account for marketing, and we never sell or share it.',
} as const;

/** Prefill contains only a catalogue key; no student input travels in the URL. */
export function scholarshipTrackerHref(award?: Pick<ScholarshipOption, 'slug' | 'region'>, region?: RegionSlug): string {
  if (award) return `/tools/scholarship-tracker#award=${encodeURIComponent(award.slug)}&region=${award.region}`;
  return `/tools/scholarship-tracker${region ? `#region=${region}` : ''}`;
}
