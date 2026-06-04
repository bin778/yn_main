import Image from 'next/image';
import Link from 'next/link';

import {
  CONTACT_HREF,
  WHO_WE_ARE_IMAGE_SRC,
  WHO_WE_ARE_LABEL,
  WHO_WE_ARE_PARAGRAPHS,
  WHO_WE_ARE_TITLE,
  WHO_WE_ARE_TITLE_LINE1,
  WHO_WE_ARE_TITLE_LINE2,
} from '@/app/constants/homeContent';

export default function WhoWeAreSection() {
  return (
    <section className="bg-white" aria-labelledby="who-we-are-heading">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-12 md:py-24 md:pb-28">
        <p className="text-center text-base md:text-lg font-bold tracking-tight text-[#023373] md:text-left">
          {WHO_WE_ARE_LABEL}
        </p>
        <h2 id="who-we-are-heading" className="sr-only">
          {WHO_WE_ARE_TITLE}
        </h2>
        <div className="mt-4 md:mt-6 md:mt-8 md:grid md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <p className="text-center text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#121212] md:text-left md:text-[45px]">
              <span className="block md:inline">{WHO_WE_ARE_TITLE_LINE1}</span>{' '}
              <span className="hidden md:inline">
                <br />
              </span>
              <span className="block md:inline">{WHO_WE_ARE_TITLE_LINE2}</span>
            </p>
          </div>
          <div className="mt-6 md:mt-10 space-y-1 md:space-y-2 text-sm md:text-base leading-relaxed text-[#555] md:col-span-7 md:mt-0 md:text-lg">
            {WHO_WE_ARE_PARAGRAPHS.slice(0, 4).map(p => (
              <p key={p} className="font-bold">
                {p}
              </p>
            ))}
            <p>{WHO_WE_ARE_PARAGRAPHS[4]}</p>
            <p>{WHO_WE_ARE_PARAGRAPHS[5]}</p>
          </div>
        </div>

        <div className="relative mt-12 overflow-hidden rounded-sm md:mt-16">
          <Image
            src={WHO_WE_ARE_IMAGE_SRC}
            alt="법무법인 여온 소개"
            width={1200}
            height={800}
            className="h-auto w-full object-cover"
          />
        </div>

        <p className="mt-8 md:mt-12 text-center">
          <Link
            href={CONTACT_HREF}
            className="inline-block cursor-pointer border border-[#023373] bg-white px-8 md:px-10 py-2 md:py-3 text-sm md:text-base font-bold text-[#023373] transition-colors hover:bg-[#023373] hover:text-white"
          >
            바로 문의하기
          </Link>
        </p>
      </div>
    </section>
  );
}
