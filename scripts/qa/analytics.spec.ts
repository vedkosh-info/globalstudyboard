import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ANALYTICS_CONSENT_VERSION, ANALYTICS_MAX_AGE_SECONDS, ANALYTICS_ORIGIN,
  analyticsMeasurementId, analyticsPage, analyticsPrivacySignal, analyticsReferrer,
  newAnalyticsConsent, parseAnalyticsConsent, type AnalyticsChoice,
} from '../../lib/analytics';
import { createAnalyticsRuntime } from '../../lib/analytics-runtime';
import { REGIONS } from '../../lib/regions';
import {
  invalidateBrowserAnalyticsMemory, readBrowserAnalyticsConsent, saveBrowserAnalyticsConsent,
} from '../../lib/analytics-browser';

const origin = ANALYTICS_ORIGIN;
const id = 'G-TEST123456';

function fixture() {
  let choice: AnalyticsChoice | null = null;
  let canonical: string | null = origin + '/guides/example';
  let cookies = 'gsb_ga=one; gsb_ga_TEST123456=two; sb-auth=keep; gsb_region=canada; ad_cookie=keep';
  const deleted: string[] = [];
  const scripts: { src: string; id: string; async: boolean; referrerPolicy: string; onload?: () => void }[] = [];
  const browser = {
    location: { href: canonical + '?email=student@example.com#token=secret' },
    navigator: { globalPrivacyControl: false, doNotTrack: null as string | null },
    gsbAnalyticsLayer: [] as IArguments[],
  };
  const document = {
    referrer: 'https://search.example/results?q=private+student+details#token=secret',
    querySelector: () => canonical ? { href: canonical } : null,
    createElement: () => ({}),
    head: { appendChild: (script: typeof scripts[number]) => { scripts.push(script); } },
    get cookie() { return cookies; },
    set cookie(value: string) { deleted.push(value); cookies = cookies.split('; ').filter(c => c.split('=')[0] !== value.split('=')[0]).join('; '); },
  };
  const runtime = createAnalyticsRuntime(browser as unknown as Window, document as unknown as Document, id, () => choice);
  return {
    browser, document, runtime, scripts, deleted,
    consent: (value: AnalyticsChoice | null) => { choice = value; },
    navigate: (href: string, nextCanonical?: string | null) => {
      browser.location.href = href;
      if (nextCanonical !== undefined) canonical = nextCanonical;
    },
    disabled: () => Reflect.get(browser, `ga-disable-${id}`),
    commands: () => browser.gsbAnalyticsLayer.map(command => Array.from(command)),
    events: () => browser.gsbAnalyticsLayer.map(command => Array.from(command)).filter(command => command[0] === 'event'),
  };
}

test('missing, malformed and non-GA4 IDs are dormant', () => {
  for (const invalid of [undefined, '', 'G-', 'UA-12345-1', 'G-foo', 'G-TEST123456?evil=1', ' G-TEST123456']) assert.equal(analyticsMeasurementId(invalid), null);
  assert.equal(analyticsMeasurementId(id), id);
});

test('consent expires, rejects malformed/old/future records, and stores no identifier', () => {
  const now = Date.UTC(2026, 10, 19);
  for (const choice of ['granted', 'denied'] as const) {
    const value = newAnalyticsConsent(choice, now);
    assert.deepEqual(Object.keys(value).sort(), ['choice', 'expiresAt', 'version']);
    assert.equal(parseAnalyticsConsent(JSON.stringify(value), now)?.choice, choice);
    assert.equal(parseAnalyticsConsent(JSON.stringify(value), now + ANALYTICS_MAX_AGE_SECONDS * 1000), null);
  }
  for (const value of [null, '', '{}', 'invalid', 'null', '[]', JSON.stringify({version: 'old', choice: 'granted', expiresAt: now + 100}), JSON.stringify({version: ANALYTICS_CONSENT_VERSION, choice: 'yes', expiresAt: now + 100}), JSON.stringify({version: ANALYTICS_CONSENT_VERSION, choice: 'granted', expiresAt: now + ANALYTICS_MAX_AGE_SECONDS * 1000 + 1})]) assert.equal(parseAnalyticsConsent(value, now), null);
});

test('canonical public URLs remove query/fragment and preserve every destination and section', () => {
  assert.deepEqual(analyticsPage(origin + '/guides/example?email=private#token=secret', origin + '/guides/example'), { location: origin + '/guides/example', title: 'Guides | GlobalStudyBoard' });
  for (const region of REGIONS) {
    for (const category of ['', '/guides', '/universities', '/exams', '/scholarships', '/track/undergraduate']) {
      const path = `/regions/${region.slug}${category}`;
      assert.ok(analyticsPage(origin + path, origin + path), path);
    }
  }
});

test('private, untrusted, preview, stale-canonical and unknown paths never qualify', () => {
  for (const path of ['/ask', '/search', '/login', '/auth/callback', '/account', '/account/private', '/admin', '/api/account/export', '/tools/application-check', '/tools/cost-planner/report', '/testers', '/guides/person@example.com', '/guides/%70rivate', '/guides/a/b']) assert.equal(analyticsPage(origin + path, origin + path), null, path);
  for (const host of ['http://localhost:5000', 'https://preview.vercel.app', 'https://globalstudyboard.com', 'https://www.globalstudyboard.com.evil.example']) assert.equal(analyticsPage(host + '/', origin + '/'), null);
  assert.equal(analyticsPage(origin + '/guides/private-name', origin + '/'), null);
  assert.equal(analyticsPage(origin + '/guides/example', null), null);
  assert.equal(analyticsPage(origin + '/guides/example', origin + '/guides/previous'), null);
  assert.equal(analyticsPage(origin + '/', origin + '/?private=1'), null);
});

test('referrals contain only a valid origin and privacy signals remain authoritative', () => {
  assert.equal(analyticsReferrer('https://example.org/private?q=email#secret'), 'https://example.org/');
  for (const bad of ['', 'invalid', 'javascript:alert(1)', 'https://private:secret@example.com/']) assert.equal(analyticsReferrer(bad), '');
  assert.ok(analyticsPrivacySignal({ globalPrivacyControl: true }));
  assert.ok(analyticsPrivacySignal({ doNotTrack: '1' }));
  assert.ok(analyticsPrivacySignal({ doNotTrack: 'yes' }));
  assert.equal(analyticsPrivacySignal({ doNotTrack: '0' }), false);
});

test('no tag, commands or page view before consent; load once after opt-in', () => {
  const f = fixture();
  f.runtime.refresh();
  f.consent('denied'); f.runtime.refresh();
  assert.equal(f.scripts.length, 0);
  assert.equal(f.commands().length, 0);
  assert.equal(f.disabled(), true);
  f.consent('granted'); f.runtime.refresh();
  assert.equal(f.scripts.length, 1);
  assert.equal(f.scripts[0].referrerPolicy, 'no-referrer');
  assert.equal(f.events().length, 0, 'no stale page queued while tag loads');
  f.scripts[0].onload?.();
  f.runtime.refresh(); f.runtime.refresh();
  assert.equal(f.events().length, 1);
  assert.equal(f.scripts.length, 1);
  const values = JSON.stringify(f.commands());
  for (const secret of ['student@example.com', 'secret', 'private+student', '?email', '#token']) assert.ok(!values.includes(secret), secret);
  const config = f.commands().find(command => command[0] === 'config')?.[2] as Record<string, unknown>;
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.cookie_update, false);
  assert.equal(config.cookie_domain, 'none');
  assert.equal(config.cookie_expires, ANALYTICS_MAX_AGE_SECONDS);
});

test('SPA stale metadata fails closed, then one sanitized view; query/hash changes do not duplicate', () => {
  const f = fixture();
  f.consent('granted'); f.runtime.refresh(); f.scripts[0].onload?.();
  f.navigate(origin + '/regions/canada?email=private#q=secret');
  assert.equal(f.disabled(), true, 'synchronous protection before React effect');
  f.runtime.refresh();
  assert.equal(f.events().length, 1);
  f.navigate(origin + '/regions/canada?email=private#q=secret', origin + '/regions/canada');
  f.runtime.refresh(); f.runtime.refresh();
  assert.equal(f.events().length, 2);
  f.navigate(origin + '/regions/canada?other=1#different'); f.runtime.refresh();
  assert.equal(f.events().length, 2);
});

test('private navigation, cross-tab withdrawal/expiry and GPC disable even before refresh', () => {
  const f = fixture();
  f.consent('granted'); f.runtime.refresh(); f.scripts[0].onload?.();
  f.navigate(origin + '/account?email=private#token=secret', origin + '/account');
  assert.equal(f.disabled(), true);
  f.runtime.refresh(); assert.equal(f.events().length, 1);
  f.navigate(origin + '/', origin + '/'); f.runtime.refresh();
  assert.equal(f.events().length, 2);
  f.consent('denied'); assert.equal(f.disabled(), true);
  f.runtime.refresh();
  assert.equal(f.deleted.length, 2);
  assert.ok(f.document.cookie.includes('sb-auth=keep'));
  assert.ok(f.document.cookie.includes('gsb_region=canada'));
  assert.ok(f.document.cookie.includes('ad_cookie=keep'));
  f.consent('granted'); f.browser.navigator.globalPrivacyControl = true;
  assert.equal(f.disabled(), true); f.runtime.refresh();
  assert.equal(f.events().length, 2);
  f.browser.navigator.globalPrivacyControl = false; f.consent(null);
  assert.equal(f.disabled(), true);
});

test('withdrawal while the tag is loading sends no queued page; later consent uses current page', () => {
  const f = fixture();
  f.consent('granted'); f.runtime.refresh();
  f.consent('denied'); f.runtime.refresh(); f.scripts[0].onload?.();
  assert.equal(f.events().length, 0);
  f.navigate(origin + '/regions/usa', origin + '/regions/usa');
  f.consent('granted'); f.runtime.refresh();
  assert.equal(f.events().length, 1);
  assert.equal((f.events()[0][2] as { page_location: string }).page_location, origin + '/regions/usa');
  assert.equal(f.scripts.length, 1);
  f.runtime.stop(); assert.equal(f.disabled(), true);
});

test('storage failure never resurrects consent; a cross-tab change clears memory-only consent', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let value: string | null = null;
  let readFails = false;
  let writeFails = false;
  const browser = {
    dispatchEvent: () => true,
    localStorage: {
      getItem: () => { if (readFails) throw new Error('storage disabled'); return value; },
      setItem: (_key: string, next: string) => { if (writeFails) throw new Error('quota'); value = next; },
    },
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  try {
    invalidateBrowserAnalyticsMemory();
    assert.equal(saveBrowserAnalyticsConsent('granted'), true);
    assert.equal(readBrowserAnalyticsConsent()?.choice, 'granted');
    value = JSON.stringify(newAnalyticsConsent('denied'));
    assert.equal(readBrowserAnalyticsConsent()?.choice, 'denied');
    readFails = true;
    assert.equal(readBrowserAnalyticsConsent(), null, 'old grant must not return after storage read failure');

    writeFails = true;
    assert.equal(saveBrowserAnalyticsConsent('granted'), false);
    assert.equal(readBrowserAnalyticsConsent()?.choice, 'granted', 'explicit in-tab choice can work without storage');
    invalidateBrowserAnalyticsMemory();
    assert.equal(readBrowserAnalyticsConsent(), null, 'cross-tab invalidation must revoke the fallback');
    readFails = false;
    assert.equal(readBrowserAnalyticsConsent()?.choice, 'denied');

    saveBrowserAnalyticsConsent('granted');
    value = null; invalidateBrowserAnalyticsMemory();
    assert.equal(readBrowserAnalyticsConsent(), null, 'cross-tab clear also revokes the fallback');
  } finally {
    invalidateBrowserAnalyticsMemory();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('an existing opt-out or a locked disable property cannot crash or enable collection', () => {
  for (const descriptor of [
    { configurable: true, value: true },
    { configurable: false, value: false },
    { configurable: false, get: () => { throw new Error('extension restricted access'); } },
  ]) {
    const f = fixture();
    Object.defineProperty(f.browser, `ga-disable-${id}`, descriptor);
    const runtime = createAnalyticsRuntime(f.browser as unknown as Window, f.document as unknown as Document, id, () => 'granted');
    assert.doesNotThrow(() => runtime.refresh());
    assert.equal(f.scripts.length, 0);
    assert.equal(f.events().length, 0);
  }
});
