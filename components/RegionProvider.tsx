'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { REGION_SLUGS, type RegionSlug } from '@/lib/regions';

const REGION_KEY = 'gsb_region';
const PROMPTED_KEY = 'gsb_region_prompted';

interface RegionContextValue {
  /** The student's chosen destination for this session, or null if not yet picked. */
  region: RegionSlug | null;
  /** Persist a destination choice for the session (also records the prompt as resolved). */
  setRegion: (slug: RegionSlug) => void;
  /** Forget the chosen destination. */
  clearRegion: () => void;
  /** True once the first-visit picker has been resolved this session (picked or skipped). */
  promptedThisSession: boolean;
  /** Record that the first-visit picker has been shown + resolved for this session. */
  markPrompted: () => void;
  /** True once the client has read any stored preference (avoids SSR flash). */
  ready: boolean;
}

const RegionContext = createContext<RegionContextValue | null>(null);

function isRegionSlug(value: string | null | undefined): value is RegionSlug {
  return !!value && (REGION_SLUGS as readonly string[]).includes(value);
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Session cookie (no max-age) — cleared when the browser session ends, so a
 * fresh session re-prompts for a destination, while staying shared across tabs
 * and page navigations within the same session.
 */
function writeSessionCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function expireCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<RegionSlug | null>(null);
  const [promptedThisSession, setPrompted] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate from the session cookie on first client render.
  useEffect(() => {
    const stored = readCookie(REGION_KEY);
    if (isRegionSlug(stored)) setRegionState(stored);
    if (readCookie(PROMPTED_KEY) === '1') setPrompted(true);
    setReady(true);
  }, []);

  const markPrompted = useCallback(() => {
    setPrompted(true);
    writeSessionCookie(PROMPTED_KEY, '1');
  }, []);

  const setRegion = useCallback((slug: RegionSlug) => {
    setRegionState(slug);
    writeSessionCookie(REGION_KEY, slug);
    // Choosing a destination also resolves the first-visit prompt.
    setPrompted(true);
    writeSessionCookie(PROMPTED_KEY, '1');
  }, []);

  const clearRegion = useCallback(() => {
    setRegionState(null);
    expireCookie(REGION_KEY);
  }, []);

  const value = useMemo<RegionContextValue>(
    () => ({ region, setRegion, clearRegion, promptedThisSession, markPrompted, ready }),
    [region, setRegion, clearRegion, promptedThisSession, markPrompted, ready]
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within a RegionProvider');
  return ctx;
}
