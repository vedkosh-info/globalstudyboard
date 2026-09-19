'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { hasAuthCookie, isAuthConfigured } from '@/lib/supabase/config';
import { AUTH_CHANGED_EVENT, takeSignInPending } from '@/lib/auth-events';
import { useRegion } from '@/components/RegionProvider';
import { useAudience } from '@/components/AudienceProvider';
import {
  AUDIENCE_CHANGED_EVENT,
  REGION_CHANGED_EVENT,
  type AudienceChangedDetail,
  type RegionChangedDetail,
} from '@/lib/preference-events';

/**
 * Session awareness for the chrome — WITHOUT the Supabase SDK.
 *
 * The context bar, mobile menu and Save buttons only need to know "is someone
 * signed in on this device?", and the PRESENCE of the `sb-<ref>-auth-token`
 * cookie answers that. Reading it costs nothing and ships no SDK bytes on the
 * ~3,400 static pages (the layout chunk must stay ≈45 KB). It is a UI hint only:
 * every API route re-verifies the session with getUser(); a stale cookie simply
 * shows "Account" for one click longer than it should.
 *
 * SSG-safe: `hasSession` is false in the server HTML and on the first client
 * render, then read in an effect (`ready` flips), exactly like the region
 * engine. It re-reads on the `gsb:auth-changed` event (fired after sign-in /
 * sign-out) and whenever the tab regains focus, so a sign-out in another tab is
 * reflected without a page load.
 *
 * Preference write-through: when a session exists and the visitor changes the
 * destination or audience, the choice is mirrored into their profile through a
 * lazily imported module — the only place the SDK is loaded from the chrome.
 */

interface AuthContextValue {
  /** True when a session cookie is present on this device (UI hint). */
  hasSession: boolean;
  /** True once the client has read the cookie (avoids a wrong-state flash). */
  ready: boolean;
  /** Re-read the cookie now. */
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue>({ hasSession: false, ready: false, refresh: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasSession, setHasSession] = useState(false);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const { region, setRegion, ready: regionReady } = useRegion();
  const { chosenAudience, setAudience, ready: audienceReady } = useAudience();

  const refresh = useCallback(() => {
    setHasSession(isAuthConfigured() && hasAuthCookie());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  // Mirror destination / audience changes into the signed-in profile.
  useEffect(() => {
    if (!hasSession) return;
    const onRegion = (e: Event) => {
      const { region } = (e as CustomEvent<RegionChangedDetail>).detail;
      void import('@/lib/supabase/profile-sync').then((m) => m.queuePreferenceWrite({ preferred_region: region }));
    };
    const onAudience = (e: Event) => {
      const { audience } = (e as CustomEvent<AudienceChangedDetail>).detail;
      void import('@/lib/supabase/profile-sync').then((m) => m.queuePreferenceWrite({ preferred_audience: audience }));
    };
    window.addEventListener(REGION_CHANGED_EVENT, onRegion);
    window.addEventListener(AUDIENCE_CHANGED_EVENT, onAudience);
    return () => {
      window.removeEventListener(REGION_CHANGED_EVENT, onRegion);
      window.removeEventListener(AUDIENCE_CHANGED_EVENT, onAudience);
    };
  }, [hasSession]);

  // Landing after a redirect sign-in (Google, or the e-mailed link): the page
  // has a session cookie but nothing in-page said "you just signed in". The
  // form left a one-shot marker; consume it here to pull the account's
  // remembered destination/audience onto a device that has none, and to
  // announce the sign-in to assistive tech.
  useEffect(() => {
    if (!ready || !hasSession || !regionReady || !audienceReady) return;
    if (!takeSignInPending()) return;
    let active = true;
    void import('@/lib/supabase/profile-sync').then(async (m) => {
      const prefs = await m.fetchRemotePreferences();
      if (!active) return;
      if (prefs) {
        if (!region && prefs.preferred_region) setRegion(prefs.preferred_region);
        if (!chosenAudience && prefs.preferred_audience) setAudience(prefs.preferred_audience);
      }
      setAnnouncement('Signed in.');
    });
    return () => {
      active = false;
    };
    // Runs once per sign-in landing; the preference reads are intentionally
    // captured at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, hasSession, regionReady, audienceReady]);

  const value = useMemo(() => ({ hasSession, ready, refresh }), [hasSession, ready, refresh]);
  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* Mounted empty; only ever carries "Signed in." after a redirect sign-in (no e-mail — no PII in the live region). */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
