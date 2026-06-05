import Image from 'next/image';
import Link from 'next/link';

import {
  EXPERTISE_BG_DESKTOP,
  EXPERTISE_BG_MOBILE,
  EXPERTISE_BODY_LINES,
  EXPERTISE_CTA_LABEL,
  EXPERTISE_TITLE,
} from '@/app/constants/aboutContent';
import { CONTACT_HREF } from '@/app/constants/sharedContent';

export default function ExpertiseSection() {
  return (
    <section className="relative w-full py-8 md:py-0" aria-labelledby="expertise-heading">
      <div className="absolute inset-0 md:hidden">
        <Image src={EXPERTISE_BG_MOBILE} alt="" fill className="object-cover" sizes="(max-width: 767px) 100vw, 1px" />
      </div>
      <div className="absolute inset-0 hidden min-h-[400px] md:block">
        <Image src={EXPERTISE_BG_DESKTOP} alt="" fill className="object-cover" sizes="(min-width: 768px) 100vw, 1px" />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/65 md:bg-gradient-to-r md:from-black/75 md:via-black/55 md:to-black/70"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto max-w-[1200px] px-6 py-12 md:grid md:min-h-[400px] md:grid-cols-12 md:items-center md:gap-12 md:px-12 md:py-20">
        <div className="md:col-span-6">
          <h2
            id="expertise-heading"
            className="text-center text-3xl md:text-4xl font-bold leading-[1.35] tracking-tight text-white drop-shadow-sm md:text-left md:text-[42px]"
          >
            {EXPERTISE_TITLE}
          </h2>
        </div>
        <div className="mt-8 md:col-span-6 md:mt-0">
          <div className="space-y-2 md:space-y-4 text-center text-[13px] md:text-[15px] leading-relaxed text-white/90 drop-shadow-sm md:text-left md:text-lg">
            {EXPERTISE_BODY_LINES.map((line, index) => (
              <p key={line} className={index === 1 ? 'font-bold text-white' : undefined}>
                {line}
              </p>
            ))}
          </div>
          <p className="mt-4 md:mt-8 text-center md:text-left">
            <Link
              href={CONTACT_HREF}
              className="inline-block text-[15px] md:text-[17px] font-bold tracking-tight text-white underline decoration-2 underline-offset-4 transition-opacity hover:text-white/85"
            >
              {EXPERTISE_CTA_LABEL} →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
