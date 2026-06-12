import Script from 'next/script';

import { GTAG_CONSENT_DEFAULT } from '@/app/constants/gtagConsent';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/** gtag.js 로드 전 Consent Mode v2 기본값(전부 거부) — root layout 전용 */
export default function AnalyticsConsentDefaults() {
  if (!GA_MEASUREMENT_ID) return null;

  const defaultsJson = JSON.stringify(GTAG_CONSENT_DEFAULT);

  return (
    <Script id="gtag-consent-defaults" strategy="beforeInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent', 'default', ${defaultsJson});
      `}
    </Script>
  );
}
