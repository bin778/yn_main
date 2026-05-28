'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

import HeroSwiperFallback from '@/app/components/home/HeroSwiperFallback';

/**
 * ssr:false → Swiper CSS가 SSR HTML에 포함되지 않아 렌더링 차단 없음.
 * loading prop은 번들 다운로드 중 클라이언트 측 로딩 UI에만 사용됨.
 */
const HeroSwiperBundle = dynamic(() => import('@/app/components/home/HeroSwiperBundle'), {
  ssr: false,
  loading: () => <HeroSwiperFallback />,
});

function subscribe() {
  return () => {};
}

function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

type Props = {
  /** 서버 컴포넌트에서 렌더된 첫 슬라이드 정적 HTML — fetchpriority=high preload 확보용 */
  fallback: ReactNode;
};

export default function HeroSwiper({ fallback }: Props) {
  const isClient = useIsClient();

  // 서버 / 첫 hydration: 서버에서 내려온 fallback을 그대로 반환
  if (!isClient) return <>{fallback}</>;

  // 클라이언트: Swiper 번들 로드 (로딩 중엔 HeroSwiperFallback 표시)
  return <HeroSwiperBundle />;
}
