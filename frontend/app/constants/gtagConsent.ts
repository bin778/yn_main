/** Google Consent Mode v2 — 광고·리마케팅 미사용, analytics만 동의 후 허용 */
export const GTAG_CONSENT_DEFAULT = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
} as const;

export const GTAG_CONSENT_ANALYTICS_GRANTED = {
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
} as const;

/** gtag('config') — Google Signals·광고 개인화 비활성 (GA4 관리자 설정과 함께 적용) */
export const GTAG_CONFIG_OPTIONS = {
  anonymize_ip: true,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
} as const;
