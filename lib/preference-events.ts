/**
 * Window events the destination / audience engines dispatch whenever the visitor
 * changes a preference. The only listener today is the auth layer: when a
 * session exists it mirrors the choice into the account (`profiles`) so it
 * follows the student to their next device — without adding a second
 * destination picker anywhere (content-policy §16.3: exactly ONE control changes
 * the destination). Dispatching an event keeps the providers free of any
 * Supabase import (bundle guard).
 */

import type { RegionSlug } from '@/lib/regions';
import type { AudienceChoice } from '@/lib/audience';

export const REGION_CHANGED_EVENT = 'gsb:region-changed';
export const AUDIENCE_CHANGED_EVENT = 'gsb:audience-changed';

export interface RegionChangedDetail {
  region: RegionSlug | null;
}
export interface AudienceChangedDetail {
  audience: AudienceChoice;
}

export function announceRegionChanged(region: RegionSlug | null): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<RegionChangedDetail>(REGION_CHANGED_EVENT, { detail: { region } }));
}

export function announceAudienceChanged(audience: AudienceChoice): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AudienceChangedDetail>(AUDIENCE_CHANGED_EVENT, { detail: { audience } }));
}
