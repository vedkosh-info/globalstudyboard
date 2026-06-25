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

interface AudienceContextValue {
  /**
   * The student's EXPLICIT choice for this session, or null if they haven't
   * toggled. When null, each page falls back to its own default (domestic for
   * India, international elsewhere) — computed at the block via `pageDefault`,
   * so the static HTML is correct and there is no hydration flash.
   */
  chosenAudience: AudienceChoice | null;
  /** Persist a domestic/international choice for the session. */
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
    // Session cookie (no max-age) — shared across tabs/navigations, cleared when
    // the browser session ends, mirroring the region engine.
    document.cookie = `${AUDIENCE_KEY}=${encodeURIComponent(a)}; path=/; SameSite=Lax`;
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
