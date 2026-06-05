import Image from 'next/image';

import { ABOUT_INTRO } from '@/app/constants/aboutContent';

export default function AboutIntro() {
  return (
    <section className="bg-white py-8 md:py-16" aria-labelledby="about-intro-heading">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h2 id="about-intro-heading" className="sr-only">
          {ABOUT_INTRO.titleLines.join(' ')}
        </h2>
        <div className="md:grid md:grid-cols-12 md:items-start md:gap-12">
          <div className="hidden md:col-span-5 md:block">
            <div className="relative overflow-hidden rounded-sm">
              <Image
                src={ABOUT_INTRO.imageSrc}
                alt="법무법인 여온 소개"
                width={600}
                height={800}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="text-center text-[36px] md:text-[45px] font-bold leading-[1.15] tracking-tight text-[#121212] md:text-left">
              {ABOUT_INTRO.titleLines.map((line, index) => (
                <span key={line} className="block md:inline">
                  {line}
                  {index < ABOUT_INTRO.titleLines.length - 1 && (
                    <span className="hidden md:inline">
                      <br />
                    </span>
                  )}
                </span>
              ))}
            </p>
            <div className="mt-6 md:mt-8 space-y-4 md:space-y-6 text-[14px] md:text-[17px] leading-relaxed tracking-tight text-[#555]">
              {ABOUT_INTRO.paragraphs.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
