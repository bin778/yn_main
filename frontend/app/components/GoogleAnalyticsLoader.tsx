'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { GTAG_CONFIG_OPTIONS } from '@/app/constants/gtagConsent';
import { getGaMeasurementId } from '@/app/lib/analyticsConfig';

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function sendPageView(pathname: string): void {
  const measurementId = getGaMeasurementId();
  if (!measurementId || typeof window.gtag !== 'function') return;
  window.gtag('config', measurementId, {
    ...GTAG_CONFIG_OPTIONS,
    page_path: pathname,
  });
}

export default function GoogleAnalyticsLoader() {
  const pathname = usePathname();
  const measurementId = getGaMeasurementId();

  useEffect(() => {
    sendPageView(pathname);
  }, [pathname]);

  if (!measurementId) return null;

  const configJson = JSON.stringify(GTAG_CONFIG_OPTIONS);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', ${configJson});
        `}
      </Script>
    </>
  );
}
