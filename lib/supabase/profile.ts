/**
 * Profile helpers shared by the sign-in form, the OAuth callback and the
 * account page. Isomorphic: they take a client and work with either the browser
 * client or the cookie-bound server client (both run under the user's own RLS).
 *
 * ensureProfile(): creates the caller's `profiles` row on first sign-in (RLS
 * insert-own policy). Consent timestamps are never sent: the database stamps
 * them with its own clock when — and only when — a consent-gated door passes
 * `consentVersion` (migration 0001, guard_profile_consent).
 * The display name is seeded from the identity provider's verified name when
 * there is one (Google's `full_name` / `name`); insert-only, so a name the user
 * edits later is never overwritten by a re-login.
 */

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { RegionSlug } from '@/lib/regions';
import type { AudienceChoice } from '@/lib/audience';

export interface ProfileRow {
  id: string;
  display_name: string;
  preferred_region: RegionSlug | null;
  preferred_audience: AudienceChoice | null;
  /** Revision date of the Terms/Privacy accepted; NULL = no consent recorded (see lib/consent.ts). */
  consent_version: string | null;
  consent_tos_at: string | null;
  consent_privacy_at: string | null;
  created_at: string;
}

export const DISPLAY_NAME_MAX = 80;

const PROFILE_COLUMNS =
  'id, display_name, preferred_region, preferred_audience, consent_version, consent_tos_at, consent_privacy_at, created_at';

/**
 * Normalise a display name for storage: trim, collapse whitespace, strip control
 * and bidi/zero-width characters, cap at the DB CHECK. The database CHECK is the
 * hard gate (rows are written browser → PostgREST under RLS); this is UX.
 */
export function cleanDisplayName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DISPLAY_NAME_MAX);
}

/** The provider-verified name Google (or another OIDC provider) put in user_metadata, if any. */
export function nameFromIdentity(user: User): string {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidate = [meta.full_name, meta.name].find((v) => typeof v === 'string' && v.trim());
  return typeof candidate === 'string' ? cleanDisplayName(candidate) : '';
}

export async function fetchOwnProfile(supabase: SupabaseClient, userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    // Any failure must THROW, never masquerade as "no profile yet": the account
    // page renders an editable form from this, and an empty form saved over a
    // real profile is silent data loss.
    throw new Error('profile_fetch_failed');
  }
  return (data as ProfileRow | null) ?? null;
}

export interface ProfileSeed {
  preferredRegion?: RegionSlug | null;
  preferredAudience?: AudienceChoice | null;
  /**
   * Send ONLY from a consent-gated door (the sign-in form after the checkbox,
   * or the OAuth callback that found the form's consent cookie). The database
   * stamps the consent timestamps from this; any other path leaves them NULL
   * and the account page asks the visitor to accept.
   */
  consentVersion?: string | null;
}

/** Create the profiles row if it does not exist yet. Returns the row either way. */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
  seed: ProfileSeed = {},
): Promise<ProfileRow | null> {
  const existing = await fetchOwnProfile(supabase, user.id);
  if (existing) {
    // A RETURNING user who just came through a consent-gated door (they ticked
    // the box again) gets the newer version recorded now, instead of being
    // asked a second time on /account after a Terms revision. The trigger only
    // ever moves the version forward, so an older seed is a no-op server-side.
    if (seed.consentVersion && seed.consentVersion > (existing.consent_version ?? '')) {
      try {
        await acceptConsent(supabase, user.id, seed.consentVersion);
        return (await fetchOwnProfile(supabase, user.id)) ?? existing;
      } catch {
        return existing; // not fatal — /account offers the re-accept step
      }
    }
    return existing;
  }
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      display_name: nameFromIdentity(user),
      preferred_region: seed.preferredRegion ?? null,
      preferred_audience: seed.preferredAudience ?? null,
      consent_version: seed.consentVersion ?? null,
    })
    .select(PROFILE_COLUMNS)
    .maybeSingle();
  if (error) {
    // A concurrent insert (two tabs finishing sign-in together) trips the primary
    // key; the row exists, so read it back rather than failing the sign-in.
    if ((error as { code?: string }).code === '23505') return fetchOwnProfile(supabase, user.id);
    throw new Error('profile_create_failed');
  }
  return (data as ProfileRow | null) ?? null;
}

export type ProfilePatch = Partial<Pick<ProfileRow, 'display_name' | 'preferred_region' | 'preferred_audience'>>;

/**
 * Record (or refresh) consent for an existing row. The trigger only moves the
 * version FORWARD and re-stamps the server time; it ignores anything else.
 */
export async function acceptConsent(supabase: SupabaseClient, userId: string, version: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ consent_version: version }).eq('id', userId);
  if (error) throw new Error('consent_update_failed');
}

/** Partial update of the caller's own row (RLS update-own). */
export async function updateOwnProfile(supabase: SupabaseClient, userId: string, patch: ProfilePatch): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
  if (error) throw new Error('profile_update_failed');
}
