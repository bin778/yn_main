import { INQUIRY_INFLOW_URL, type InquiryInflowUrl } from '@/app/constants/contactContent';

const STORAGE_KEY = 'yn_inquiry_inflow_url';

function isGoogleAdsTraffic(params: URLSearchParams): boolean {
  if (params.has('gclid')) return true;

  const source = (params.get('utm_source') ?? '').trim().toLowerCase();
  if (source !== 'google') return false;

  const medium = (params.get('utm_medium') ?? '').trim().toLowerCase();
  if (medium === '') return true;
  return medium === 'cpc' || medium === 'ppc' || medium === 'paid' || medium === 'paidsocial';
}

function readStoredInflow(): InquiryInflowUrl | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === INQUIRY_INFLOW_URL.CONTACT || stored === INQUIRY_INFLOW_URL.CONTACT_GOOGLE) {
      return stored;
    }
  } catch {
    // sessionStorage 접근 불가(사생활 모드 등) — 제출 시 URL 기준으로 판별
  }
  return null;
}

function writeStoredInflow(value: InquiryInflowUrl): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

/** 첫 방문 URL의 광고 신호를 sessionStorage에 저장(first-touch). */
export function captureInquiryInflowFromUrl(): void {
  if (typeof window === 'undefined') return;
  if (readStoredInflow() !== null) return;

  const params = new URLSearchParams(window.location.search);
  writeStoredInflow(isGoogleAdsTraffic(params) ? INQUIRY_INFLOW_URL.CONTACT_GOOGLE : INQUIRY_INFLOW_URL.CONTACT);
}

/** 상담 접수 시 사용할 유입 URL (`contact` | `contact-ad`). */
export function getInquiryInflowUrl(): InquiryInflowUrl {
  if (typeof window === 'undefined') return INQUIRY_INFLOW_URL.CONTACT;

  captureInquiryInflowFromUrl();
  return readStoredInflow() ?? INQUIRY_INFLOW_URL.CONTACT;
}
