'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ANALYTICS_CHANGE_EVENT, ANALYTICS_OPEN_EVENT, ANALYTICS_STORAGE_KEY, ANALYTICS_UI,
  GA_MEASUREMENT_ID, analyticsPrivacySignal, isAnalyticsPublicPath, type AnalyticsChoice,
} from '@/lib/analytics';
import {
  browserAnalyticsRuntime, invalidateBrowserAnalyticsMemory, readBrowserAnalyticsConsent, saveBrowserAnalyticsConsent,
} from '@/lib/analytics-browser';

const MEASUREMENT_ID = GA_MEASUREMENT_ID;
const buttonStyle = 'min-h-11 flex-1 rounded-xl border border-forest-700 bg-white px-4 py-3 text-base font-semibold text-forest-800 hover:bg-forest-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-700 disabled:cursor-not-allowed disabled:opacity-50';

/** Non-modal, optional consent; never gates the site, signs in or changes a region. */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<AnalyticsChoice | null>(null);
  const [signal, setSignal] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(true);
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!MEASUREMENT_ID) return;
    const runtime = browserAnalyticsRuntime(MEASUREMENT_ID);
    let timer: ReturnType<typeof setTimeout>;
    function synchronize() {
      const consent = readBrowserAnalyticsConsent();
      const blocked = analyticsPrivacySignal(window.navigator);
      setChoice(consent?.choice ?? null);
      setSignal(blocked);
      setReady(true);
      runtime.refresh();
      clearTimeout(timer);
      if (consent) timer = setTimeout(synchronize, Math.min(consent.expiresAt - Date.now() + 1, 2_147_483_647));
    }
    function onStorage(event: StorageEvent) {
      if (event.key === ANALYTICS_STORAGE_KEY || event.key === null) {
        invalidateBrowserAnalyticsMemory();
        synchronize();
      }
    }
    function openPreferences() {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      synchronize();
      setPreferences(true);
      setNotice('');
    }
    synchronize();
    // Metadata can arrive after the route changes. The runtime refuses a stale
    // canonical; this retry records the public page once its head is current.
    const observer = new MutationObserver(() => runtime.refresh());
    observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', synchronize);
    window.addEventListener('pageshow', synchronize);
    window.addEventListener(ANALYTICS_CHANGE_EVENT, synchronize);
    window.addEventListener(ANALYTICS_OPEN_EVENT, openPreferences);
    document.addEventListener('visibilitychange', synchronize);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', synchronize);
      window.removeEventListener('pageshow', synchronize);
      window.removeEventListener(ANALYTICS_CHANGE_EVENT, synchronize);
      window.removeEventListener(ANALYTICS_OPEN_EVENT, openPreferences);
      document.removeEventListener('visibilitychange', synchronize);
    };
  }, []);

  useEffect(() => {
    if (MEASUREMENT_ID) browserAnalyticsRuntime(MEASUREMENT_ID).refresh();
    setPreferences(false);
  }, [pathname]);

  useEffect(() => {
    if (preferences) heading.current?.focus();
  }, [preferences]);

  function closePreferences() {
    setPreferences(false);
    if (returnFocus.current?.isConnected) returnFocus.current.focus();
  }

  function choose(nextChoice: AnalyticsChoice) {
    if (nextChoice === 'granted' && analyticsPrivacySignal(window.navigator)) return;
    setSaved(saveBrowserAnalyticsConsent(nextChoice));
    setNotice(nextChoice === 'granted' ? ANALYTICS_UI.savedOn : ANALYTICS_UI.savedOff);
    closePreferences();
  }

  if (!MEASUREMENT_ID || !ready) return null;
  const visible = preferences || (!choice && !signal && isAnalyticsPublicPath(pathname));
  return (
    <>
      <span className="sr-only" role="status">{notice}{!saved ? ` ${ANALYTICS_UI.memoryOnly}` : ''}</span>
      {visible && (
        <section
          aria-labelledby="analytics-choice-title"
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-h-[75dvh] max-w-xl overflow-y-auto rounded-2xl border border-stone-300 bg-cream-50 p-5 text-stone-800 shadow-xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[34rem]"
          onKeyDown={event => {
            if (event.key === 'Escape' && preferences) closePreferences();
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id="analytics-choice-title" ref={heading} tabIndex={-1} className="m-0 font-display text-xl font-semibold text-forest-900 focus:outline-none">
              {ANALYTICS_UI.title}
            </h2>
            {preferences && (
              <button type="button" className="min-h-11 rounded-lg px-2 text-sm text-stone-700 underline underline-offset-4" onClick={closePreferences}>
                {ANALYTICS_UI.close}
              </button>
            )}
          </div>
          <p className="mb-2 mt-3 text-base leading-relaxed">{ANALYTICS_UI.description}</p>
          <p className="mb-3 mt-0 text-base leading-relaxed">{ANALYTICS_UI.privacy}</p>
          {preferences && <p className="my-3 text-base font-medium">{signal ? ANALYTICS_UI.signal : choice === 'granted' ? ANALYTICS_UI.on : ANALYTICS_UI.off}</p>}
          {!saved && <p className="my-3 text-base text-stone-600">{ANALYTICS_UI.memoryOnly}</p>}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" className={buttonStyle} onClick={() => choose('denied')}>
              {choice === 'granted' ? ANALYTICS_UI.turnOff : ANALYTICS_UI.decline}
            </button>
            <button type="button" className={buttonStyle} disabled={signal} onClick={() => choose('granted')}>
              {ANALYTICS_UI.allow}
            </button>
          </div>
          <a href="/cookies" className="mt-3 inline-block text-base text-forest-800 underline underline-offset-4">{ANALYTICS_UI.details}</a>
        </section>
      )}
    </>
  );
}
