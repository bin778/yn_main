import Image from 'next/image';
import Link from 'next/link';

import type { PersonProfile } from '@/app/constants/peopleContent';

const MAIL_ICON_SRC = '/img/23a146c8a18cf.webp';

type PersonDetailHeroProps = {
  person: PersonProfile;
};

export default function PersonDetailHero({ person }: PersonDetailHeroProps) {
  return (
    <section className="relative min-h-[400px] w-full md:min-h-[730px]" aria-labelledby="person-detail-heading">
      <div className="absolute inset-0">
        <Image
          src={person.detailHeroBgSrc}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-black/25" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 pb-16 pt-10 md:px-12 md:pb-24 md:pt-16">
        <Link
          href="/people"
          className="inline-flex items-center text-[47px] font-bold leading-none tracking-tight text-white"
          aria-label="여온의 사람들 목록으로"
        >
          ←&nbsp;
        </Link>
        <div className="mt-6 md:mt-8">
          <p className="text-base text-white/70 md:text-xl">{person.role}</p>
          <h1
            id="person-detail-heading"
            className="mt-2 text-[30px] font-bold leading-none tracking-tight text-white md:text-[48px] md:tracking-[-1.5px]"
          >
            {person.name}
          </h1>
          {person.email && (
            <p className="mt-4 flex items-center gap-2.5 text-xs text-white/70 md:text-base">
              <Image src={MAIL_ICON_SRC} alt="" width={30} height={30} className="h-5 w-5 md:h-[30px] md:w-[30px]" />
              <a href={`mailto:${person.email}`} className="hover:underline">
                {person.email}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
