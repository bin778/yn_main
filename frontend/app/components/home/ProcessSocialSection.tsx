import Image from 'next/image';
import Link from 'next/link';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { SiNaver } from 'react-icons/si';
import type { IconType } from 'react-icons';

import {
  PROCESS_IMAGE_DESKTOP,
  PROCESS_IMAGE_MOBILE,
  PROCESS_LABEL,
  PROCESS_TITLE,
  SOCIAL_LINKS,
} from '@/app/constants/homeContent';

const SOCIAL_ICON_MAP: Record<string, { icon: IconType; color: string }> = {
  Blog: { icon: SiNaver, color: '#03C75A' },
  YouTube: { icon: FaYoutube, color: '#FF0000' },
  Instagram: { icon: FaInstagram, color: '#E1306C' },
};

export default function ProcessSocialSection() {
  return (
    <section className="bg-[#f5f7fa] py-16 md:py-20" aria-labelledby="process-heading">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <p className="text-center text-base md:text-lg font-bold tracking-tight text-[#023373] md:text-left">
          {PROCESS_LABEL}
        </p>
        <h2
          id="process-heading"
          className="mt-4 text-center text-3xl md:text-4xl font-bold tracking-tight text-[#121212] md:text-left"
        >
          {PROCESS_TITLE}
        </h2>
        <div className="relative mx-auto mt-10 w-full overflow-hidden rounded-sm">
          <Image
            src={PROCESS_IMAGE_MOBILE}
            alt=""
            width={1000}
            height={500}
            className="h-auto w-full object-cover md:hidden"
            sizes="(max-width: 767px) 100vw, 1px"
          />
          <Image
            src={PROCESS_IMAGE_DESKTOP}
            alt=""
            width={1000}
            height={500}
            className="hidden h-auto w-full object-cover md:block"
            sizes="(min-width: 1200px) 1020px, (min-width: 768px) 85vw, 1px"
            loading="eager"
          />
        </div>
        <nav className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SOCIAL_LINKS.map(link => {
            const social = SOCIAL_ICON_MAP[link.label];
            const Icon = social?.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-3 text-base font-semibold text-[#121212] transition-colors hover:border-[#023373] hover:text-[#023373] md:py-4 md:text-lg"
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {Icon && <Icon style={{ color: social.color }} className="text-xl shrink-0" aria-hidden="true" />}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
