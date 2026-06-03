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

const COOKIE_NAME = 'gsb_region';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface RegionContextValue {
  /** The student's chosen destination, or null if not yet picked. */
  region: RegionSlug | null;
  /** Persist a destination choice (cookie + localStorage). */
  setRegion: (slug: RegionSlug) => void;
  /** Forget the chosen destination. */
  clearRegion: () => void;
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

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<RegionSlug | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate from cookie (preferred) or localStorage on first client render.
  useEffect(() => {
    const stored = readCookie(COOKIE_NAME) ?? window.localStorage.getItem(COOKIE_NAME);
    if (isRegionSlug(stored)) setRegionState(stored);
    setReady(true);
  }, []);

  const setRegion = useCallback((slug: RegionSlug) => {
    setRegionState(slug);
    try {
      window.localStorage.setItem(COOKIE_NAME, slug);
    } catch {
      /* localStorage may be unavailable (private mode) */
    }
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(slug)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }, []);

  const clearRegion = useCallback(() => {
    setRegionState(null);
    try {
      window.localStorage.removeItem(COOKIE_NAME);
    } catch {
      /* ignore */
    }
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }, []);

  const value = useMemo<RegionContextValue>(
    () => ({ region, setRegion, clearRegion, ready }),
    [region, setRegion, clearRegion, ready]
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within a RegionProvider');
  return ctx;
}
