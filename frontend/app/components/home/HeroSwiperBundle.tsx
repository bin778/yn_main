'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { CONTACT_HREF, HERO_SLIDES_DESKTOP, HERO_SLIDES_MOBILE } from '@/app/constants/homeContent';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';

const SWIPER_COMMON = {
  loop: true,
  speed: 1000,
  slidesPerView: 1,
  spaceBetween: 300,
  autoplay: { delay: 2000, disableOnInteraction: false },
  effect: 'fade' as const,
};

function CtaButton({ className = '' }: { className?: string }) {
  return (
    <Link
      href={CONTACT_HREF}
      className={`inline-block cursor-pointer border border-white bg-white/10 px-12 py-3.5 text-base font-bold text-white ${className}`}
    >
      바로 문의하기
    </Link>
  );
}

/** Swiper 번들 — ssr:false로만 로드되어 CSS가 렌더링 차단을 일으키지 않음 */
export default function HeroSwiperBundle() {
  return (
    <section aria-label="메인 비주얼" className="relative w-full">
      <div className="md:hidden">
        <Swiper {...SWIPER_COMMON} modules={[Autoplay, EffectFade]} className="w-full">
          {HERO_SLIDES_MOBILE.map((slide, index) => (
            <SwiperSlide key={slide.backgroundSrc}>
              <div className="relative min-h-[min(100vh,720px)] w-full">
                <Image
                  src={slide.backgroundSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 100vw, 1px"
                  // 모바일 priority 속성 제거 완료
                  loading={index === 0 ? undefined : 'lazy'}
                />
                <div className="absolute inset-0 z-[1] bg-black/25" aria-hidden />
                <Link href={CONTACT_HREF} className="absolute inset-0 z-[2]" aria-label="상담 문의로 이동" />
                <div className="relative z-[3] flex min-h-[min(100vh,720px)] flex-col items-center justify-center px-6 pb-24 pt-28 text-center text-white">
                  <p className="text-[40px] md:text-[46px] font-bold leading-tight tracking-tight">{slide.title}</p>
                  <p className="mt-5 max-w-md text-[13px] md:text-[15px] leading-relaxed text-white/85">
                    {slide.bodyLines.map((line, lineIndex) => (
                      <span key={line}>
                        {line}
                        {lineIndex < slide.bodyLines.length - 1 ? <br /> : null}
                      </span>
                    ))}
                  </p>
                  <p className="mt-12 md:mt-16">
                    <CtaButton />
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="relative hidden md:block">
        <Swiper
          {...SWIPER_COMMON}
          modules={[Autoplay, EffectFade, Navigation]}
          navigation={{ prevEl: '.hero-desktop-prev', nextEl: '.hero-desktop-next' }}
          className="w-full"
        >
          {HERO_SLIDES_DESKTOP.map((slide, index) => (
            <SwiperSlide key={slide.backgroundSrc}>
              <div className="relative min-h-[640px] w-full lg:min-h-[720px]">
                <Image
                  src={slide.backgroundSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 100vw, 1px"
                  // 데스크톱 priority 속성 제거 완료
                  loading={index === 0 ? undefined : 'lazy'}
                />
                <div className="absolute inset-0 z-[1] bg-black/20" aria-hidden />
                <Link href={CONTACT_HREF} className="absolute inset-0 z-[2]" aria-label="상담 문의로 이동" />
                <div className="relative z-[3] mx-auto flex max-w-[1200px] flex-col gap-10 px-8 pb-20 pt-24 lg:flex-row lg:items-end lg:justify-between lg:px-16">
                  <div className="max-w-xl text-left text-white">
                    <p className="text-[44px] font-bold leading-tight tracking-tight">{slide.title}</p>
                    <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-white/85">
                      {slide.bodyLineSingle}
                    </p>
                    <p className="mt-16">
                      <CtaButton />
                    </p>
                  </div>
                  <article
                    className="relative w-full max-w-[540px] shrink-0 overflow-hidden rounded-sm border border-white/20 bg-white/10 bg-contain bg-center bg-no-repeat p-5 text-left text-white lg:-mt-12"
                    style={{ backgroundImage: `url(${slide.lawyerCardBgSrc})` }}
                  >
                    <div className="flex min-h-[420px] flex-col justify-end bg-gradient-to-t from-black/70 to-transparent pl-6 pb-8 pt-32">
                      <span className="block text-base leading-none">{slide.lawyerRole}</span>
                      <span className="mt-1 block text-[33px] font-bold">{slide.lawyerName}</span>
                      <span className="mt-2 block max-h-52 overflow-y-auto text-sm leading-relaxed text-white/90">
                        {slide.lawyerBioLines.map((line, lineIndex) => (
                          <span key={`${slide.lawyerName}-${lineIndex}`} className="block">
                            {line}
                          </span>
                        ))}
                      </span>
                    </div>
                  </article>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          className="hero-desktop-prev absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 text-white md:block lg:left-8"
          aria-label="이전 슬라이드"
        >
          <span className="text-3xl">‹</span>
        </button>
        <button
          type="button"
          className="hero-desktop-next absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 text-white md:block lg:right-8"
          aria-label="다음 슬라이드"
        >
          <span className="text-3xl">›</span>
        </button>
      </div>
    </section>
  );
}
