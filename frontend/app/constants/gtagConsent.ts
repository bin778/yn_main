/** gtag('config') — Google Signals·광고 개인화 비활성 (GA4 관리자 설정과 함께 적용) */
export const GTAG_CONFIG_OPTIONS = {
  anonymize_ip: true,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
} as const;
