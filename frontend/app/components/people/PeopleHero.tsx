import Image from 'next/image';

import { PEOPLE_HERO } from '@/app/constants/peopleContent';

export default function PeopleHero() {
  return (
    <section className="relative w-full" aria-labelledby="people-hero-heading">
      <div className="absolute inset-0">
        <Image src={PEOPLE_HERO.bgSrc} alt="" fill className="object-cover" sizes="100vw" priority />
      </div>
      <div className="absolute inset-0 bg-black/20" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 py-20 md:px-12 md:py-28">
        <h1
          id="people-hero-heading"
          className="font-bold leading-none tracking-tight text-white text-[30px] md:text-[45px] md:tracking-[-1.5px]"
        >
          {PEOPLE_HERO.title}
        </h1>
        <p className="mt-3 max-w-xl text-[13px] md:text-[15px] leading-[1.5] tracking-tight text-white/95 md:mt-4 md:text-lg md:leading-normal">
          {PEOPLE_HERO.subtitle}
        </p>
      </div>
    </section>
  );
}
