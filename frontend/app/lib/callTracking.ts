import { CALL_LEAD_API_URL } from '@/app/constants/contactContent';
import { getInquiryAttribution, getStoredGclid } from '@/app/lib/inquiryInflow';

export type CallLeadChannel = 'call' | 'kakao';

/**
 * 전화·카톡 CTA 클릭 시 gclid를 백엔드에 남김.
 * tel:/카톡 이동과 동시에 나가므로 sendBeacon / keepalive fetch 사용.
 * gclid 없으면 호출하지 않음 (오프라인 전환에 쓸 수 없음).
 */
export function trackCallLead(channel: CallLeadChannel, source: string): void {
  if (!CALL_LEAD_API_URL) return;

  const gclid = getStoredGclid();
  if (!gclid) return;

  const attribution = getInquiryAttribution();
  const payload = JSON.stringify({
    gclid,
    channel,
    page: attribution.inflowUrl,
    source,
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
