import Image from 'next/image';
import Link from 'next/link';

import DetailLinkIcon from '@/app/components/people/DetailLinkIcon';
import type { PersonProfile } from '@/app/constants/peopleContent';

type ExpertProfileRowProps = {
  person: PersonProfile;
};

export default function ExpertProfileRow({ person }: ExpertProfileRowProps) {
  const isDark = person.listTheme === 'dark';
  const textMuted = isDark ? 'text-white/70' : 'text-black/70';
  const textMain = isDark ? 'text-white' : 'text-black';
  const sectionBg = isDark ? 'bg-[#33435f]' : 'bg-white';
  const iconVariant = isDark ? 'dark' : 'light';

  return (
    <article className={sectionBg}>
      <div className="mx-auto max-w-[1200px] px-6 py-8 md:py-12 md:grid md:grid-cols-2 md:items-end md:gap-0 md:px-5 md:py-0">
        <div
          className={`flex justify-center pt-8 md:pt-[100px] ${
            person.imageSide === 'left' ? 'md:order-1 md:justify-end' : 'md:order-2 md:justify-start'
          }`}
        >
          <Link href={`/people/${person.id}`} className="block w-full max-w-[400px] md:max-w-none">
            <div className="relative mx-auto aspect-square w-full max-w-[400px] md:hidden">
              <Image
                src={person.listPortraitMobile}
                alt=""
                fill
                className="object-contain"
                sizes="(max-width: 767px) min(100vw, 400px)"
              />
            </div>
            <Image
              src={person.listPortraitDesktop}
              alt=""
              width={500}
              height={600}
              className="hidden h-auto max-h-[600px] w-auto object-contain md:mx-0 md:block"
            />
          </Link>
        </div>

        <div className={`pb-8 md:pb-[50px] md:pl-[60px] ${person.imageSide === 'left' ? 'md:order-2' : 'md:order-1'}`}>
          <div className="mt-6 text-center md:mt-0 md:text-left">
            <p className={`text-base md:hidden ${textMuted}`}>{person.role}</p>
            <p className={`text-[30px] font-bold md:hidden ${textMain}`}>
              <Link href={`/people/${person.id}`}>{person.name}</Link>
            </p>

            <span className={`hidden text-base font-normal md:block ${textMuted}`}>{person.role}</span>
            <span className={`mt-0 hidden items-center text-[36px] font-bold md:inline-flex ${textMain}`}>
              {person.name}
              <Link
                href={`/people/${person.id}`}
                className="ml-4 inline-flex items-center pb-1"
                aria-label={`${person.name} 상세 보기`}
              >
                <DetailLinkIcon variant={iconVariant} />
              </Link>
            </span>
            {person.email && (
              <span className={`mt-2 hidden text-base font-normal md:block ${textMuted} md:my-2.5 md:mb-[45px]`}>
                {person.email}
              </span>
            )}
          </div>

          <div className="mt-8 hidden md:block">
            <span className={`mb-1 block text-2xl font-bold ${textMain}`}>주요 경력</span>
            <ul className={`text-base leading-relaxed ${textMain}`}>
              {person.listCareerLines.map(line => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
