'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { GTAG_CONSENT_ANALYTICS_GRANTED, GTAG_CONFIG_OPTIONS } from '@/app/constants/gtagConsent';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function sendPageView(pathname: string): void {
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    ...GTAG_CONFIG_OPTIONS,
    page_path: pathname,
  });
}

export default function GoogleAnalyticsLoader() {
  const pathname = usePathname();

  useEffect(() => {
    sendPageView(pathname);
  }, [pathname]);

  if (!GA_MEASUREMENT_ID) return null;

  const configJson = JSON.stringify(GTAG_CONFIG_OPTIONS);
  const consentGrantedJson = JSON.stringify(GTAG_CONSENT_ANALYTICS_GRANTED);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'update', ${consentGrantedJson});
          gtag('config', '${GA_MEASUREMENT_ID}', ${configJson});
        `}
      </Script>
    </>
  );
}
