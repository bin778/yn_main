'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import AnalyticsClickTracker from '@/app/components/AnalyticsClickTracker';
import GoogleAnalyticsLoader from '@/app/components/GoogleAnalyticsLoader';
import GoogleTagManagerLoader from '@/app/components/GoogleTagManagerLoader';
import { ADMIN_PATH_PREFIX } from '@/app/constants/analyticsEvents';
import { getGaMeasurementId, getGtmId, isAnalyticsConfigured } from '@/app/lib/analyticsConfig';

/** 공개 페이지에서 진입 즉시 GA4/GTM 로드 (동의 게이트 없음) */
export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith(ADMIN_PATH_PREFIX);
  const shouldLoadAnalytics = isAnalyticsConfigured() && !isAdmin;
  const shouldLoadGtm = shouldLoadAnalytics && getGtmId() !== '';
  const shouldLoadGa = shouldLoadAnalytics && getGaMeasurementId() !== '';

  return (
    <>
      {shouldLoadGtm && <GoogleTagManagerLoader />}
      {shouldLoadGa && <GoogleAnalyticsLoader />}
      {/* GA/GTM 없이도 전화·카톡 gclid 리드는 남겨야 함 */}
      {!isAdmin && <AnalyticsClickTracker />}
      {children}
    </>
  );
}
