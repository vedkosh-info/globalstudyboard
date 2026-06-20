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
const PROMPTED_KEY = 'gsb_region_prompted';

interface RegionContextValue {
  /** The student's chosen destination for this session, or null if not yet picked. */
  region: RegionSlug | null;
  /**
   * The destination of the page currently being viewed, when that page belongs to
   * a single destination (a country guide, a college, a region hub). Lets a visitor
   * who lands deep from search see the whole site skinned to that destination
   * before they have explicitly chosen one. Null on destination-neutral pages.
   */
  pageRegion: RegionSlug | null;
  /**
   * The region the whole site is tuned to right now: the explicit choice if one
   * exists, otherwise the destination of the current page, otherwise the default
   * (India). Always a real region, so every surface personalises without a null check.
   */
  effectiveRegion: RegionSlug;
  /** Persist a destination choice for the session (resolves the prompt + closes the picker). */
  setRegion: (slug: RegionSlug) => void;
  /** Forget the chosen destination. */
  clearRegion: () => void;
  /** Record the destination of the current page (provisional skin; never persisted). */
  setPageRegion: (slug: RegionSlug | null) => void;
  /** True once the destination picker has been resolved this session (picked or skipped). */
  promptedThisSession: boolean;
  /** Record that the picker has been shown + resolved for this session (also closes it). */
  markPrompted: () => void;
  /** Whether the destination picker should be open right now. */
  pickerOpen: boolean;
  /** Force the destination picker open (e.g. from the "change destination" control). */
  openPicker: () => void;
  /** Close the picker without recording a skip (used right after a choice). */
  closePicker: () => void;
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
  const [pageRegion, setPageRegionState] = useState<RegionSlug | null>(null);
  const [promptedThisSession, setPrompted] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate from the session cookie on first client render, then decide whether
  // the once-per-session destination picker should auto-open.
  useEffect(() => {
    const stored = readCookie(REGION_KEY);
    const hasRegion = isRegionSlug(stored);
    if (hasRegion) setRegionState(stored);
    const alreadyPrompted = readCookie(PROMPTED_KEY) === '1';
    if (alreadyPrompted) setPrompted(true);
    // First page of a fresh session, no destination chosen yet → invite a choice.
    if (!hasRegion && !alreadyPrompted) setPickerOpen(true);
    setReady(true);
  }, []);

  const markPrompted = useCallback(() => {
    setPrompted(true);
    setPickerOpen(false);
    writeSessionCookie(PROMPTED_KEY, '1');
  }, []);

  const setRegion = useCallback((slug: RegionSlug) => {
    setRegionState(slug);
    writeSessionCookie(REGION_KEY, slug);
    // Choosing a destination also resolves the prompt + closes the picker.
    setPrompted(true);
    setPickerOpen(false);
    writeSessionCookie(PROMPTED_KEY, '1');
  }, []);

  const clearRegion = useCallback(() => {
    setRegionState(null);
    expireCookie(REGION_KEY);
  }, []);

  const setPageRegion = useCallback((slug: RegionSlug | null) => {
    setPageRegionState(slug);
  }, []);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const value = useMemo<RegionContextValue>(
    () => ({
      region,
      pageRegion,
      effectiveRegion: region ?? pageRegion ?? DEFAULT_REGION,
      setRegion,
      clearRegion,
      setPageRegion,
      promptedThisSession,
      markPrompted,
      pickerOpen,
      openPicker,
      closePicker,
      ready,
    }),
    [
      region,
      pageRegion,
      setRegion,
      clearRegion,
      setPageRegion,
      promptedThisSession,
      markPrompted,
      pickerOpen,
      openPicker,
      closePicker,
      ready,
    ]
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within a RegionProvider');
  return ctx;
}
