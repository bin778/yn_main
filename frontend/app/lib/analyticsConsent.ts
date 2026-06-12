export const ANALYTICS_CONSENT_KEY = 'yn_analytics_consent';

export type AnalyticsConsentValue = 'granted' | 'denied';

const CONSENT_CHANGE_EVENT = 'analytics-consent-change';

function readConsent(): AnalyticsConsentValue | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(ANALYTICS_CONSENT_KEY);
  if (stored === 'granted' || stored === 'denied') return stored;
  return null;
}

export function isAnalyticsGranted(): boolean {
  return readConsent() === 'granted';
}

export function setAnalyticsConsent(value: AnalyticsConsentValue): void {
  localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function subscribeAnalyticsConsent(callback: () => void): () => void {
  const onChange = () => callback();
  window.addEventListener('storage', onChange);
  window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  };
}

export function getAnalyticsConsentSnapshot(): AnalyticsConsentValue | null {
  return readConsent();
}

export function getAnalyticsConsentServerSnapshot(): AnalyticsConsentValue | null {
  return null;
}
