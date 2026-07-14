'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { getGtmId } from '@/app/lib/analyticsConfig';

declare global {
  interface Window {
    dataLayer?: unknown[];
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

/** 진입 즉시 GTM 컨테이너 로드 + SPA page_view를 dataLayer에 전달 */
export default function GoogleTagManagerLoader() {
  const pathname = usePathname();
  const gtmId = getGtmId();

  useEffect(() => {
    if (!gtmId) return;
    pushPageView(pathname);
  }, [gtmId, pathname]);

  if (!gtmId) return null;

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
          });
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
