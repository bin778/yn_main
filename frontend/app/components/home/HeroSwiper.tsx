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

  return (
    <div className="relative w-full">
      {/* fallback: DOM에서 절대 제거하지 않음, Swiper 로드 후 뒤로 깔림 */}
      <div
        aria-hidden={isClient}
        style={{
          visibility: isClient ? 'hidden' : 'visible',
          position: isClient ? 'absolute' : 'relative',
          inset: 0,
        }}
      >
        {fallback}
      </div>
      {isClient && <HeroSwiperBundle />}
    </div>
  );
}
