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
import { REGION_SLUGS, DEFAULT_REGION, type RegionSlug } from '@/lib/regions';

const REGION_KEY = 'gsb_region';

/**
 * A year. The destination is a preference the visitor set deliberately, so it is
 * remembered on the device until they change it or clear their browser data —
 * a returning student should not have to re-pick every time. (It replaces the
 * old session cookie, which forgot the choice the moment the browser closed and
 * so had to re-prompt on every visit.) The value is a region slug: no personal
 * data, no identifier, first-party only. Described in /cookies.
 */
const REMEMBER_SECONDS = 60 * 60 * 24 * 365;

interface RegionContextValue {
  /** The student's chosen destination, remembered on this device, or null if never set. */
  region: RegionSlug | null;
  /**
   * The destination of the page currently being viewed, when that page belongs to
   * a single destination (a country guide, a college, a region hub). Lets a visitor
   * who lands deep from search see the whole site skinned to that destination
   * before they have ever chosen one. Null on destination-neutral pages.
   */
  pageRegion: RegionSlug | null;
  /**
   * The region the whole site is tuned to right now: the remembered choice if there
   * is one, otherwise the destination of the current page, otherwise the default
   * (India). Always a real region, so every surface personalises without a null check.
   */
  effectiveRegion: RegionSlug;
  /** Remember a destination choice on this device. */
  setRegion: (slug: RegionSlug) => void;
  /** Forget the remembered destination (back to the India default). */
  clearRegion: () => void;
  /** Record the destination of the current page (provisional skin; never persisted). */
  setPageRegion: (slug: RegionSlug | null) => void;
  /** True once the client has read any stored preference (avoids an SSR flash). */
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

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${REMEMBER_SECONDS}; SameSite=Lax`;
}

function expireCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/**
 * The destination engine.
 *
 * The site always SHOWS a destination — India by default — and never asks the
 * visitor to choose before they can read anything. Choosing is a one-tap action
 * in the header control whenever they want it, and the choice is then remembered
 * on the device, so the next visit opens where they left off.
 */
export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<RegionSlug | null>(null);
  const [pageRegion, setPageRegionState] = useState<RegionSlug | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate the remembered choice on first client render. Reading it here (not on
  // the server) is what keeps every page statically renderable.
  useEffect(() => {
    const stored = readCookie(REGION_KEY);
    if (isRegionSlug(stored)) setRegionState(stored);
    setReady(true);
  }, []);

  const setRegion = useCallback((slug: RegionSlug) => {
    setRegionState(slug);
    writeCookie(REGION_KEY, slug);
  }, []);

  const clearRegion = useCallback(() => {
    setRegionState(null);
    expireCookie(REGION_KEY);
  }, []);

  const setPageRegion = useCallback((slug: RegionSlug | null) => {
    setPageRegionState(slug);
  }, []);

  const value = useMemo<RegionContextValue>(
    () => ({
      region,
      pageRegion,
      effectiveRegion: region ?? pageRegion ?? DEFAULT_REGION,
      setRegion,
      clearRegion,
      setPageRegion,
      ready,
    }),
    [region, pageRegion, setRegion, clearRegion, setPageRegion, ready],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within a RegionProvider');
  return ctx;
}
