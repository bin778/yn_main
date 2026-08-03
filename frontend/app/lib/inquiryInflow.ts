import { INQUIRY_INFLOW_URL, type InquiryInflowUrl } from '@/app/constants/contactContent';

const STORAGE_KEY = 'yn_inquiry_attribution';
const LEGACY_SESSION_KEY = 'yn_inquiry_attribution';
const LEGACY_INFLOW_KEY = 'yn_inquiry_inflow_url';

const GCLID_MAX_LENGTH = 255;
const UTM_MAX_LENGTH = 200;
/** Google Ads 오프라인 전환 윈도우와 맞춤 */
const EXPIRY_MS = 90 * 24 * 60 * 60 * 1000;

export type InquiryAttribution = {
  inflowUrl: InquiryInflowUrl;
  gclid: string;
  utmSource: string;
  utmCampaign: string;
};

type StoredAttribution = InquiryAttribution & { expiry: number };

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

function isValidGclid(value: string): boolean {
  return /^[A-Za-z0-9._-]{1,255}$/.test(value);
}

function parseAttribution(raw: string): StoredAttribution | null {
  try {
    const parsed = JSON.parse(raw) as Partial<StoredAttribution>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.inflowUrl !== 'string' || !isValidInflowUrl(parsed.inflowUrl)) return null;

    const expiry = typeof parsed.expiry === 'number' ? parsed.expiry : 0;
    if (expiry > 0 && expiry <= Date.now()) return null;

    return {
      inflowUrl: parsed.inflowUrl,
      gclid: typeof parsed.gclid === 'string' ? parsed.gclid.slice(0, GCLID_MAX_LENGTH) : '',
      utmSource: typeof parsed.utmSource === 'string' ? parsed.utmSource.slice(0, UTM_MAX_LENGTH) : '',
      utmCampaign: typeof parsed.utmCampaign === 'string' ? parsed.utmCampaign.slice(0, UTM_MAX_LENGTH) : '',
      expiry: expiry > 0 ? expiry : Date.now() + EXPIRY_MS,
    };
  } catch {
    return null;
  }
}

function readFromStorage(storage: Storage, key: string): StoredAttribution | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return parseAttribution(raw);
  } catch {
    return null;
  }
}

function readStoredAttribution(): StoredAttribution | null {
  try {
    const fromLocal = readFromStorage(localStorage, STORAGE_KEY);
    if (fromLocal) return fromLocal;

    const fromSession = readFromStorage(sessionStorage, LEGACY_SESSION_KEY);
    if (fromSession) {
      writeStoredAttribution(fromSession);
      return fromSession;
    }

    const legacy = sessionStorage.getItem(LEGACY_INFLOW_KEY);
    if (legacy && isValidInflowUrl(legacy)) {
      const migrated: StoredAttribution = {
        inflowUrl: legacy,
        gclid: '',
        utmSource: '',
        utmCampaign: '',
        expiry: Date.now() + EXPIRY_MS,
      };
      writeStoredAttribution(migrated);
      return migrated;
    }
  } catch {
    // storage 접근 불가 — 제출 시 URL 기준으로 판별
  }
  return null;
}

function writeStoredAttribution(value: StoredAttribution): void {
  try {
    const payload: StoredAttribution = {
      ...value,
      expiry: value.expiry || Date.now() + EXPIRY_MS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

function buildAttributionFromUrl(): StoredAttribution {
  const params = new URLSearchParams(window.location.search);
  const gclsrc = params.get('gclsrc');
  const rawGclid = clipParam(params.get('gclid'), GCLID_MAX_LENGTH);
  const validGclsrc = !gclsrc || gclsrc.includes('aw');
  const gclid = rawGclid && validGclsrc && isValidGclid(rawGclid) ? rawGclid : '';

  return {
    inflowUrl: isGoogleAdsTraffic(params) ? INQUIRY_INFLOW_URL.CONTACT_GOOGLE : INQUIRY_INFLOW_URL.CONTACT,
    gclid,
    utmSource: clipParam(params.get('utm_source'), UTM_MAX_LENGTH),
    utmCampaign: clipParam(params.get('utm_campaign'), UTM_MAX_LENGTH),
    expiry: Date.now() + EXPIRY_MS,
  };
}

/**
 * 첫 방문 유입(first-touch)을 localStorage에 90일 저장.
 * URL에 새 gclid가 있으면 last-touch로 gclid만 갱신(오프라인 전환 매칭용).
 */
export function captureInquiryInflowFromUrl(): void {
  if (typeof window === 'undefined') return;

  const fromUrl = buildAttributionFromUrl();
  const existing = readStoredAttribution();

  if (existing === null) {
    writeStoredAttribution(fromUrl);
    return;
  }

  if (fromUrl.gclid !== '' && fromUrl.gclid !== existing.gclid) {
    writeStoredAttribution({
      ...existing,
      gclid: fromUrl.gclid,
      expiry: Date.now() + EXPIRY_MS,
    });
  }
}

/** 상담 접수 시 사용할 유입 URL (`contact` | `contact-ad`). */
export function getInquiryInflowUrl(): InquiryInflowUrl {
  return getInquiryAttribution().inflowUrl;
}

/** 상담·전화 리드에 사용할 유입·광고 파라미터. */
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
  const stored = readStoredAttribution() ?? buildAttributionFromUrl();
  return {
    inflowUrl: stored.inflowUrl,
    gclid: stored.gclid,
    utmSource: stored.utmSource,
    utmCampaign: stored.utmCampaign,
  };
}

/** 저장된 gclid만 반환(없으면 빈 문자열). */
export function getStoredGclid(): string {
  return getInquiryAttribution().gclid;
}
