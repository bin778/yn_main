import { INQUIRY_INFLOW_URL, type InquiryInflowUrl } from '@/app/constants/contactContent';

const STORAGE_KEY = 'yn_inquiry_attribution';
const LEGACY_STORAGE_KEY = 'yn_inquiry_inflow_url';

const GCLID_MAX_LENGTH = 255;
const UTM_MAX_LENGTH = 200;

export type InquiryAttribution = {
  inflowUrl: InquiryInflowUrl;
  gclid: string;
  utmSource: string;
  utmCampaign: string;
};

function isGoogleAdsTraffic(params: URLSearchParams): boolean {
  if (params.has('gclid')) return true;

  const source = (params.get('utm_source') ?? '').trim().toLowerCase();
  if (source !== 'google') return false;

  const medium = (params.get('utm_medium') ?? '').trim().toLowerCase();
  if (medium === '') return true;
  return medium === 'cpc' || medium === 'ppc' || medium === 'paid' || medium === 'paidsocial';
}

function clipParam(value: string | null, maxLength: number): string {
  return (value ?? '').trim().slice(0, maxLength);
}

function isValidInflowUrl(value: string): value is InquiryInflowUrl {
  return value === INQUIRY_INFLOW_URL.CONTACT || value === INQUIRY_INFLOW_URL.CONTACT_GOOGLE;
}

function parseAttribution(raw: string): InquiryAttribution | null {
  try {
    const parsed = JSON.parse(raw) as Partial<InquiryAttribution>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.inflowUrl !== 'string' || !isValidInflowUrl(parsed.inflowUrl)) return null;

    return {
      inflowUrl: parsed.inflowUrl,
      gclid: typeof parsed.gclid === 'string' ? parsed.gclid.slice(0, GCLID_MAX_LENGTH) : '',
      utmSource: typeof parsed.utmSource === 'string' ? parsed.utmSource.slice(0, UTM_MAX_LENGTH) : '',
      utmCampaign: typeof parsed.utmCampaign === 'string' ? parsed.utmCampaign.slice(0, UTM_MAX_LENGTH) : '',
    };
  } catch {
    return null;
  }
}

function readStoredAttribution(): InquiryAttribution | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = parseAttribution(stored);
      if (parsed) return parsed;
    }

    const legacy = sessionStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && isValidInflowUrl(legacy)) {
      const migrated: InquiryAttribution = {
        inflowUrl: legacy,
        gclid: '',
        utmSource: '',
        utmCampaign: '',
      };
      writeStoredAttribution(migrated);
      return migrated;
    }
  } catch {
    // sessionStorage 접근 불가(사생활 모드 등) — 제출 시 URL 기준으로 판별
  }
  return null;
}

function writeStoredAttribution(value: InquiryAttribution): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    sessionStorage.setItem(LEGACY_STORAGE_KEY, value.inflowUrl);
  } catch {
    // ignore
  }
}

function buildAttributionFromUrl(): InquiryAttribution {
  const params = new URLSearchParams(window.location.search);
  return {
    inflowUrl: isGoogleAdsTraffic(params) ? INQUIRY_INFLOW_URL.CONTACT_GOOGLE : INQUIRY_INFLOW_URL.CONTACT,
    gclid: clipParam(params.get('gclid'), GCLID_MAX_LENGTH),
    utmSource: clipParam(params.get('utm_source'), UTM_MAX_LENGTH),
    utmCampaign: clipParam(params.get('utm_campaign'), UTM_MAX_LENGTH),
  };
}

/** 첫 방문 URL의 광고 신호를 sessionStorage에 저장(first-touch). */
export function captureInquiryInflowFromUrl(): void {
  if (typeof window === 'undefined') return;
  if (readStoredAttribution() !== null) return;

  writeStoredAttribution(buildAttributionFromUrl());
}

/** 상담 접수 시 사용할 유입 URL (`contact` | `contact-ad`). */
export function getInquiryInflowUrl(): InquiryInflowUrl {
  return getInquiryAttribution().inflowUrl;
}

/** 상담 접수 시 사용할 유입·광고 파라미터(first-touch). */
export function getInquiryAttribution(): InquiryAttribution {
  if (typeof window === 'undefined') {
    return {
      inflowUrl: INQUIRY_INFLOW_URL.CONTACT,
      gclid: '',
      utmSource: '',
      utmCampaign: '',
    };
  }

  captureInquiryInflowFromUrl();
  return readStoredAttribution() ?? buildAttributionFromUrl();
}
