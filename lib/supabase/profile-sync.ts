'use client';

/**
 * Preference write-through — loaded LAZILY (import()) by AuthProvider only when a
 * session cookie exists and the visitor changes destination or audience. Keeps
 * the Supabase SDK out of the global bundle while letting the account remember
 * the choice across devices.
 */

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { fetchOwnProfile, updateOwnProfile, type ProfilePatch, type ProfileRow } from '@/lib/supabase/profile';

/** The account's remembered preferences (null when there is no profile row yet). */
export async function fetchRemotePreferences(): Promise<Pick<ProfileRow, 'preferred_region' | 'preferred_audience'> | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const row = await fetchOwnProfile(supabase, user.id);
    return row ? { preferred_region: row.preferred_region, preferred_audience: row.preferred_audience } : null;
  } catch {
    return null;
  }
}

let queued: ProfilePatch = {};
let timer: number | null = null;
/** Flushes run strictly one after another (see queuePreferenceWrite). */
let chain: Promise<void> = Promise.resolve();

/**
 * Coalesce rapid changes into one PATCH ~800 ms after the last one, and
 * SERIALISE the flushes: two PATCHes fired ~1 s apart could otherwise complete
 * out of order over the network and the older preference would win
 * (independent review). Each flush starts only after the previous settled.
 */
export function queuePreferenceWrite(patch: ProfilePatch): void {
  queued = { ...queued, ...patch };
  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    const toWrite = queued;
    queued = {};
    chain = chain.then(() => flush(toWrite));
  }, 800);
}

async function flush(patch: ProfilePatch): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || Object.keys(patch).length === 0) return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await updateOwnProfile(supabase, user.id, patch);
  } catch {
    // Best effort: the cookie on this device already holds the choice.
  }
}
