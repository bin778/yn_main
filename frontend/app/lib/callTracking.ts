import { CALL_LEAD_API_URL, INQUIRY_INFLOW_URL } from '@/app/constants/contactContent';
import { getStoredGclid } from '@/app/lib/inquiryInflow';

export type CallLeadChannel = 'call' | 'kakao';

const CALL_INFLOW_MAX_LENGTH = 45;

function resolveDeviceLabel(): 'PC' | 'Mobile' {
  if (typeof window === 'undefined') return 'PC';
  return window.matchMedia('(min-width: 768px)').matches ? 'PC' : 'Mobile';
}

/** 전화·카톡 클릭 유입 매체 (`c_inflow`) */
function resolveCallInflowLabel(channel: CallLeadChannel): string {
  const action = channel === 'kakao' ? '카톡클릭' : '전화클릭';
  return `${action}(${resolveDeviceLabel()})`.slice(0, CALL_INFLOW_MAX_LENGTH);
}

/**
 * 전화·카톡 CTA 클릭 시 gclid를 백엔드에 남김.
 * tel:/카톡 이동과 동시에 나가므로 sendBeacon / keepalive fetch 사용.
 * gclid 없으면 호출하지 않음 (오프라인 전환에 쓸 수 없음).
 * gclid가 있으면 유입은 항상 contact-ad.
 */
export function trackCallLead(channel: CallLeadChannel, source: string): void {
  if (!CALL_LEAD_API_URL) return;

  const gclid = getStoredGclid();
  if (!gclid) return;

  const payload = JSON.stringify({
    gclid,
    channel,
    page: INQUIRY_INFLOW_URL.CONTACT_GOOGLE,
    source,
    c_inflow: resolveCallInflowLabel(channel),
  });

  try {
    if (typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon(CALL_LEAD_API_URL, blob)) {
        return;
      }
    }

    void fetch(CALL_LEAD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  } catch {
    // CTA 이동을 막지 않음
  }
}
