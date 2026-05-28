import HeroSwiperFallback from '@/app/components/home/HeroSwiperFallback';
import HeroSwiper from '@/app/components/home/HeroSwiper';

/**
 * 서버 컴포넌트에서 HeroSwiperFallback을 렌더해 prop으로 전달.
 * 이렇게 해야 Next.js가 서버 컴포넌트 트리에서 priority 이미지를 감지해
 * <head>에 fetchpriority=high preload를 자동 삽입한다.
 */
export default function HomeHeroSection() {
  return <HeroSwiper fallback={<HeroSwiperFallback />} />;
}
