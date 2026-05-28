import Link from 'next/link';
import { CONTACT_HREF, HERO_SLIDES_DESKTOP, HERO_SLIDES_MOBILE } from '@/app/constants/homeContent';

/** LCP-friendly static first slide while HeroSwiper client bundle loads. */
export default function HeroSwiperFallback() {
  const mobile = HERO_SLIDES_MOBILE[0];
  const desktop = HERO_SLIDES_DESKTOP[0];

  return (
    <section aria-label="메인 비주얼" className="relative w-full overflow-hidden">
      {/* 1. 아트 디렉션 적용: 브라우저가 기기에 맞는 이미지만 '택 1' 하여 다운로드 */}
      <picture>
        {/* 데스크톱(768px 이상)일 때 다운로드할 이미지 */}
        <source media="(min-width: 768px)" srcSet={desktop.backgroundSrc} />
        {/* 모바일(기본값)일 때 다운로드할 이미지 & LCP 최적화 속성 적용 */}
        <img
          src={mobile.backgroundSrc}
          alt="법무법인 여온 메인 비주얼"
          className="absolute inset-0 h-full w-full object-cover min-h-[min(100vh,720px)]"
          fetchPriority="high" /* 반드시 카멜케이스(P)로 작성 */
          decoding="sync" /* 브라우저가 이미지를 받는 즉시 디코딩하도록 강제 */
        />
      </picture>

      {/* 2. 공통 배경 오버레이 및 클릭 링크 */}
      <div className="absolute inset-0 z-[1] bg-black/25 md:bg-black/20" aria-hidden />
      <Link href={CONTACT_HREF} className="absolute inset-0 z-[2]" aria-label="상담 문의로 이동" />

      {/* 3. 콘텐츠 영역 (모바일) */}
      <div className="relative z-[3] flex min-h-[min(100vh,720px)] w-full flex-col items-center justify-center px-6 pb-24 pt-28 text-center text-white md:hidden">
        <p className="text-[46px] font-bold leading-tight tracking-tight">{mobile.title}</p>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/85">
          {mobile.bodyLines.map((line, lineIndex) => (
            <span key={line}>
              {line}
              {lineIndex < mobile.bodyLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>

      {/* 4. 콘텐츠 영역 (데스크톱) */}
      <div className="relative z-[3] mx-auto hidden min-h-[640px] w-full max-w-[1200px] flex-col gap-10 px-8 pb-20 pt-24 md:flex lg:min-h-[720px] lg:flex-row lg:items-end lg:justify-between lg:px-16">
        <div className="max-w-xl text-left text-white">
          <p className="text-[44px] font-bold leading-tight tracking-tight">{desktop.title}</p>
          <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-white/85">{desktop.bodyLineSingle}</p>
        </div>
      </div>
    </section>
  );
}
