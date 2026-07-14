'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAnalyticsConsent } from '@/app/components/AnalyticsProvider';
import { ADMIN_PATH_PREFIX } from '@/app/constants/analyticsEvents';
import { isAnalyticsConfigured } from '@/app/lib/analyticsConfig';

export default function AnalyticsConsentBanner() {
  const pathname = usePathname();
  const { consent, grantConsent, denyConsent } = useAnalyticsConsent();

  if (!isAnalyticsConfigured()) return null;
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) return null;
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="쿠키 및 분석 도구 동의"
      className="fixed inset-x-0 bottom-0 z-[200] border-t border-black/10 bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:px-8"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-[11px] md:text-[13px] leading-relaxed text-[#121212]">
          법무법인 여온은 더 편리한 서비스 제공을 위해 방문 통계를 수집하며, 데이터는 안전하게 보호됩니다. 자세한 내용은{' '}
          <Link href="/privacy/" className="font-bold text-[#023373] underline underline-offset-2">
            개인정보처리방침
          </Link>
          을 확인해 주세요.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={denyConsent}
            className="cursor-pointer rounded border border-[#023373]/30 px-3 md:px-4 py-1.5 md:py-2 text-[11px] md:text-[13px] font-bold text-[#023373] transition-colors hover:bg-[#023373]/5"
          >
            거부
          </button>
          <button
            type="button"
            onClick={grantConsent}
            className="cursor-pointer rounded bg-[#023373] px-3 md:px-4 py-1.5 md:py-2 text-[11px] md:text-[13px] font-bold text-white transition-colors hover:bg-[#023373]/90"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );
}
