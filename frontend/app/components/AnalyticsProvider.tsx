'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';

import { ADMIN_PATH_PREFIX } from '@/app/constants/analyticsEvents';
import AnalyticsClickTracker from '@/app/components/AnalyticsClickTracker';
import GoogleAnalyticsLoader from '@/app/components/GoogleAnalyticsLoader';
import GoogleTagManagerLoader from '@/app/components/GoogleTagManagerLoader';
import { getGaMeasurementId, getGtmId, isAnalyticsConfigured } from '@/app/lib/analyticsConfig';
import {
  getAnalyticsConsentServerSnapshot,
  getAnalyticsConsentSnapshot,
  setAnalyticsConsent,
  subscribeAnalyticsConsent,
  type AnalyticsConsentValue,
} from '@/app/lib/analyticsConsent';

type AnalyticsConsentContextValue = {
  consent: AnalyticsConsentValue | null;
  grantConsent: () => void;
  denyConsent: () => void;
};

const AnalyticsConsentContext = createContext<AnalyticsConsentContextValue | null>(null);

export function useAnalyticsConsent(): AnalyticsConsentContextValue {
  const context = useContext(AnalyticsConsentContext);
  if (!context) {
    throw new Error('useAnalyticsConsent must be used within AnalyticsProvider');
  }
  return context;
}

export function useIsAnalyticsConsentBannerVisible(): boolean {
  const pathname = usePathname();
  const { consent } = useAnalyticsConsent();
  return isAnalyticsConfigured() && !pathname.startsWith(ADMIN_PATH_PREFIX) && consent === null;
}

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith(ADMIN_PATH_PREFIX);
  const consent = useSyncExternalStore(
    subscribeAnalyticsConsent,
    getAnalyticsConsentSnapshot,
    getAnalyticsConsentServerSnapshot,
  );

  const contextValue: AnalyticsConsentContextValue = {
    consent,
    grantConsent: () => setAnalyticsConsent('granted'),
    denyConsent: () => setAnalyticsConsent('denied'),
  };

  const shouldLoadAnalytics = isAnalyticsConfigured() && !isAdmin && consent === 'granted';
  const shouldLoadGtm = shouldLoadAnalytics && getGtmId() !== '';
  const shouldLoadGa = shouldLoadAnalytics && getGaMeasurementId() !== '';

  return (
    <AnalyticsConsentContext.Provider value={contextValue}>
      {shouldLoadGtm && <GoogleTagManagerLoader />}
      {shouldLoadGa && <GoogleAnalyticsLoader />}
      {shouldLoadAnalytics && <AnalyticsClickTracker />}
      {children}
    </AnalyticsConsentContext.Provider>
  );
}
