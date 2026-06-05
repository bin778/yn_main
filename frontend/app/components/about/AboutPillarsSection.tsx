import Image from 'next/image';

import { ABOUT_PILLARS } from '@/app/constants/aboutContent';

export default function AboutPillarsSection() {
  return (
    <section className="bg-[#fafbfc] py-16 md:py-24" aria-labelledby="about-pillars-heading">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <h2 id="about-pillars-heading" className="sr-only">
          여온의 약속
        </h2>
        <div className="space-y-16 md:space-y-20">
          {ABOUT_PILLARS.map((pillar, index) => (
            <article
              key={pillar.titleLine2}
              className="border-t border-[#cfcfcf] pt-12 first:border-t-0 first:pt-0 md:grid md:grid-cols-12 md:gap-12 md:border-t md:pt-16"
            >
              <div className="md:col-span-5">
                <Image
                  src={pillar.iconSrc}
                  alt=""
                  width={90}
                  height={90}
                  className="h-16 md:h-20 w-auto object-contain md:h-[80px]"
                />
                <h3 className="mt-4 text-[24px] md:text-[28px] font-bold leading-[1.35] tracking-tight text-[#222]">
                  {pillar.titleLine1}
                  <br />
                  <span className="text-[#023373]">{pillar.titleLine2}</span>
                </h3>
              </div>
              <div className="mt-4 md:mt-6 space-y-2 md:space-y-4 text-[14px] md:text-[16px] leading-[1.7] tracking-tight text-[#555] md:col-span-7 md:mt-0">
                {pillar.paragraphs.map((paragraph, paragraphIndex) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className={paragraphIndex === 0 && index === 0 ? 'md:font-bold' : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
