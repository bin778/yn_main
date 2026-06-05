import Image from 'next/image';

import { FIELD_HERO } from '@/app/constants/fieldContent';

export default function FieldHero() {
  return (
    <section className="relative w-full" aria-labelledby="field-hero-heading">
      <div className="absolute inset-0 md:hidden">
        <Image
          src={FIELD_HERO.bgMobile}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 767px) 100vw, 1px"
          priority
        />
      </div>
      <div className="absolute inset-0 hidden md:block">
        <Image
          src={FIELD_HERO.bgDesktop}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width: 768px) 100vw, 1px"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-black/20" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 py-20 md:px-12 md:py-28">
        <h1
          id="field-hero-heading"
          className="text-[30px] md:text-[45px] font-bold leading-none tracking-tight text-white md:tracking-[-1.5px]"
        >
          {FIELD_HERO.title}
        </h1>
        <p className="mt-3 max-w-xl text-[13px] md:text-[15px] leading-[1.5] tracking-tight text-white/95 md:mt-4 md:text-lg md:leading-normal md:opacity-90">
          {FIELD_HERO.subtitle}
        </p>
      </div>
    </section>
  );
}
