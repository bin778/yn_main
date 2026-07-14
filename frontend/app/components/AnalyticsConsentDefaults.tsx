import Script from 'next/script';

import { GTAG_CONSENT_DEFAULT } from '@/app/constants/gtagConsent';
import { isAnalyticsConfigured } from '@/app/lib/analyticsConfig';

/** gtag/GTM 로드 전 Consent Mode v2 기본값(전부 거부) — root layout 전용 */
export default function AnalyticsConsentDefaults() {
  if (!isAnalyticsConfigured()) return null;

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
