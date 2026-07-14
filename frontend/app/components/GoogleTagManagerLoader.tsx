'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { GTAG_CONSENT_ANALYTICS_GRANTED } from '@/app/constants/gtagConsent';
import { getGtmId } from '@/app/lib/analyticsConfig';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

function pushPageView(pathname: string): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: pathname,
  });
}

/** Consent 허용 후 GTM 컨테이너 로드 + SPA page_view를 dataLayer에 전달 */
export default function GoogleTagManagerLoader() {
  const pathname = usePathname();
  const gtmId = getGtmId();

  useEffect(() => {
    if (!gtmId) return;
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', GTAG_CONSENT_ANALYTICS_GRANTED);
    }
    pushPageView(pathname);
  }, [gtmId, pathname]);

  if (!gtmId) return null;

  const consentGrantedJson = JSON.stringify(GTAG_CONSENT_ANALYTICS_GRANTED);

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
          });
          if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', ${consentGrantedJson});
          }
        `}
      </Script>
      <Script id="gtm-script" src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} strategy="afterInteractive" />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          title="Google Tag Manager"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
