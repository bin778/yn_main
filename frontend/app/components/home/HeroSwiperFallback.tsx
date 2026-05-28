import Image from 'next/image';
import Link from 'next/link';

import { CONTACT_HREF, HERO_SLIDES_DESKTOP, HERO_SLIDES_MOBILE } from '@/app/constants/homeContent';

/** LCP-friendly static first slide while HeroSwiper client bundle loads. */
export default function HeroSwiperFallback() {
  const mobile = HERO_SLIDES_MOBILE[0];
  const desktop = HERO_SLIDES_DESKTOP[0];

  return (
    <section aria-label="메인 비주얼" className="relative w-full">
      <div className="md:hidden">
        <div className="relative min-h-[min(100vh,720px)] w-full">
          <Image
            src={mobile.backgroundSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 767px) 100vw, 1px"
            priority
            loading="eager"
          />
          <div className="absolute inset-0 z-[1] bg-black/25" aria-hidden />
          <Link href={CONTACT_HREF} className="absolute inset-0 z-[2]" aria-label="상담 문의로 이동" />
          <div className="relative z-[3] flex min-h-[min(100vh,720px)] flex-col items-center justify-center px-6 pb-24 pt-28 text-center text-white">
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
        </div>
      </div>

      <div className="relative hidden min-h-[640px] w-full md:block lg:min-h-[720px]">
        <Image
          src={desktop.backgroundSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 768px) 100vw, 1px"
          priority
          loading="eager"
        />
        <div className="absolute inset-0 z-[1] bg-black/20" aria-hidden />
        <Link href={CONTACT_HREF} className="absolute inset-0 z-[2]" aria-label="상담 문의로 이동" />
        <div className="relative z-[3] mx-auto flex max-w-[1200px] flex-col gap-10 px-8 pb-20 pt-24 lg:flex-row lg:items-end lg:justify-between lg:px-16">
          <div className="max-w-xl text-left text-white">
            <p className="text-[44px] font-bold leading-tight tracking-tight">{desktop.title}</p>
            <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-white/85">
              {desktop.bodyLineSingle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
