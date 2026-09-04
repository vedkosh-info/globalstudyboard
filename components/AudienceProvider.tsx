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
import type { AudienceChoice } from '@/lib/audience';

const AUDIENCE_KEY = 'gsb_audience';

/** A year — see the same constant in RegionProvider. */
const REMEMBER_SECONDS = 60 * 60 * 24 * 365;

interface AudienceContextValue {
  /**
   * The student's EXPLICIT choice, remembered on this device, or null if they haven't
   * toggled. When null, each page falls back to its own default (domestic for
   * India, international elsewhere) — computed at the block via `pageDefault`,
   * so the static HTML is correct and there is no hydration flash.
   */
  chosenAudience: AudienceChoice | null;
  /** Remember a domestic/international choice on this device (one year). */
  setAudience: (a: AudienceChoice) => void;
  /** True once the client has read any stored preference (avoids SSR mismatch). */
  ready: boolean;
}

const AudienceContext = createContext<AudienceContextValue | null>(null);

function isAudienceChoice(v: string | null): v is AudienceChoice {
  return v === 'domestic' || v === 'international';
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export function AudienceProvider({ children }: { children: ReactNode }) {
  const [chosenAudience, setChosen] = useState<AudienceChoice | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readCookie(AUDIENCE_KEY);
    if (isAudienceChoice(stored)) setChosen(stored);
    setReady(true);
  }, []);

  const setAudience = useCallback((a: AudienceChoice) => {
    setChosen(a);
    // Remembered on the device for a year, mirroring the region engine: a
    // deliberate preference should survive closing the browser, so a returning
    // student is not silently put back on the other audience's content.
    document.cookie = `${AUDIENCE_KEY}=${encodeURIComponent(a)}; path=/; max-age=${REMEMBER_SECONDS}; SameSite=Lax`;
  }, []);

  const value = useMemo<AudienceContextValue>(
    () => ({ chosenAudience, setAudience, ready }),
    [chosenAudience, setAudience, ready],
  );

  return <AudienceContext.Provider value={value}>{children}</AudienceContext.Provider>;
}

export function useAudience(): AudienceContextValue {
  const ctx = useContext(AudienceContext);
  if (!ctx) throw new Error('useAudience must be used within an AudienceProvider');
  return ctx;
}
