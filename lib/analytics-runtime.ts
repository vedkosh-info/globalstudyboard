import {
  ANALYTICS_COOKIE_PREFIX, ANALYTICS_MAX_AGE_SECONDS, analyticsMeasurementId,
  analyticsPage, analyticsPrivacySignal, analyticsReferrer, type AnalyticsChoice,
} from './analytics';

/**
 * Basic opt-in collection. The tag is never requested until consent is granted.
 * GA stream Enhanced measurement MUST be disabled before this is enabled.
 * send_page_view:false alone does not disable history/form/search collection.
 * https://developers.google.com/analytics/devguides/collection/ga4/views
 */
export function createAnalyticsRuntime(
  browser: Window,
  document: Document,
  id: string,
  readChoice: () => AnalyticsChoice | null,
) {
  const measurementId = analyticsMeasurementId(id);
  let loaded = false;
  let started = false;
  let closed = false;
  let lastPage: string | null = null;
  let analyticsGranted = false;
  let safetyBlocked = false;
  const target = browser as Window & { gsbAnalyticsLayer?: IArguments[] };
  const page = () => analyticsPage(browser.location.href, document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null);
  const allowed = () => !closed && !safetyBlocked && Boolean(measurementId) && readChoice() === 'granted' &&
    !analyticsPrivacySignal(browser.navigator) && Boolean(page());

  // Google documents checking this property at EVERY cookie write and send.
  // A getter returns a current boolean even between Next's history update and
  // React's effect, on a private route, after expiry, and after cross-tab revoke.
  // https://developers.google.com/tag-platform/security/guides/privacy
  if (measurementId) {
    const key = `ga-disable-${measurementId}`;
    try {
      const existing = Object.getOwnPropertyDescriptor(browser, key);
      // Browser add-ons or another owner-set opt-out must never be overridden.
      if (Reflect.get(browser, key) === true || (existing && !existing.configurable)) safetyBlocked = true;
      if (!existing || existing.configurable) Object.defineProperty(browser, key, {
        configurable: true,
        get: () => !allowed(),
      });
    } catch {
      // An extension can make a property inaccessible. Fail closed rather than
      // throwing from a root-layout effect and taking the student page down.
      safetyBlocked = true;
    }
  }

  const command: (...args: unknown[]) => void = function () {
    target.gsbAnalyticsLayer ??= [];
    // Google's gtag queue protocol uses IArguments, not a dataLayer event array.
    // eslint-disable-next-line prefer-rest-params
    target.gsbAnalyticsLayer.push(arguments);
  };
  const clearCookies = () => {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^gsb_ga(?:_|$)/.test(name)) continue;
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
    }
  };
  const config = () => {
    const current = page();
    return {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      url_passthrough: false,
      cookie_domain: 'none',
      cookie_prefix: ANALYTICS_COOKIE_PREFIX,
      cookie_expires: ANALYTICS_MAX_AGE_SECONDS,
      cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure',
      page_location: current?.location ?? 'https://www.globalstudyboard.com/',
      page_title: current?.title ?? 'GlobalStudyBoard',
      page_referrer: analyticsReferrer(document.referrer),
    };
  };

  function refresh() {
    if (!measurementId || closed) return;
    if (!allowed()) {
      lastPage = null;
      if (readChoice() !== 'granted' || analyticsPrivacySignal(browser.navigator)) {
        if (started && analyticsGranted) command('consent', 'update', { analytics_storage: 'denied' });
        analyticsGranted = false;
        clearCookies();
      }
      return;
    }
    if (!started) {
      started = true;
      analyticsGranted = true;
      // The separate layer avoids collecting other tags' events. This is not
      // the AdSense consent control: no advertising consent is granted here.
      command('consent', 'default', {
        analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      });
      command('consent', 'update', { analytics_storage: 'granted' });
      command('set', config());
      command('js', new Date());
      command('config', measurementId, config());
      const script = document.createElement('script');
      script.id = 'gsb-google-analytics';
      script.async = true;
      script.referrerPolicy = 'no-referrer';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}&l=gsbAnalyticsLayer`;
      script.onload = () => { loaded = true; refresh(); };
      // A blocked/offline tag must not affect the page. A reload retries.
      document.head.appendChild(script);
      return;
    }
    if (!loaded) return;
    if (!analyticsGranted) {
      analyticsGranted = true;
      command('consent', 'update', { analytics_storage: 'granted' });
    }
    const current = page();
    if (!current || current.location === lastPage) return;
    const fields = config();
    // Configure defaults too: GA's automatic session/engagement events must
    // inherit the same sanitized fields as our explicit page_view.
    command('set', fields);
    command('config', measurementId, { ...fields, update: true });
    command('event', 'page_view', { ...fields, send_to: measurementId });
    lastPage = current.location;
  }

  return {
    refresh,
    stop() { closed = true; clearCookies(); },
  };
}
