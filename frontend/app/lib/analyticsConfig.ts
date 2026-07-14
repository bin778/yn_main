const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? '';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? '';

export function getGaMeasurementId(): string {
  return GA_MEASUREMENT_ID;
}

export function getGtmId(): string {
  return GTM_ID;
}

export function isAnalyticsConfigured(): boolean {
  return GA_MEASUREMENT_ID !== '' || GTM_ID !== '';
}
