import {
  ANALYTICS_CHANGE_EVENT, ANALYTICS_STORAGE_KEY, newAnalyticsConsent,
  parseAnalyticsConsent, type AnalyticsChoice, type AnalyticsConsent,
} from './analytics';
import { createAnalyticsRuntime } from './analytics-runtime';

let memoryConsent: AnalyticsConsent | null = null;
let memoryOnly = false;
let runtime: ReturnType<typeof createAnalyticsRuntime> | null = null;

export function readBrowserAnalyticsConsent(): AnalyticsConsent | null {
  try {
    if (!memoryOnly) return parseAnalyticsConsent(window.localStorage.getItem(ANALYTICS_STORAGE_KEY));
  } catch {
    // Never resurrect an old in-memory grant after another tab revoked it.
    // Memory fallback is valid only after THIS tab's explicit write failed.
    if (!memoryOnly) return null;
  }
  return parseAnalyticsConsent(memoryConsent ? JSON.stringify(memoryConsent) : null);
}

export function invalidateBrowserAnalyticsMemory() {
  memoryOnly = false;
  memoryConsent = null;
}

export function saveBrowserAnalyticsConsent(choice: AnalyticsChoice): boolean {
  memoryConsent = newAnalyticsConsent(choice);
  try {
    window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(memoryConsent));
    memoryOnly = false;
  } catch {
    memoryOnly = true;
  }
  runtime?.refresh();
  window.dispatchEvent(new Event(ANALYTICS_CHANGE_EVENT));
  return !memoryOnly;
}

/** One runtime per document, including React StrictMode's effect re-mount. */
export function browserAnalyticsRuntime(measurementId: string) {
  runtime ??= createAnalyticsRuntime(window, document, measurementId, () => readBrowserAnalyticsConsent()?.choice ?? null);
  return runtime;
}
