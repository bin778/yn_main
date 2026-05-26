import Image from 'next/image';
import Link from 'next/link';

import { PROCESS_IMAGE_SRC, PROCESS_LABEL, PROCESS_TITLE, SOCIAL_LINKS } from '@/app/constants/homeContent';

export default function ProcessSocialSection() {
  return (
    <section className="bg-[#f5f7fa] py-16 md:py-20" aria-labelledby="process-heading">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <p className="text-center text-lg font-bold tracking-tight text-[#023373] md:text-left">{PROCESS_LABEL}</p>
        <h2
          id="process-heading"
          className="mt-4 text-center text-4xl font-bold tracking-tight text-[#121212] md:text-left"
        >
          {PROCESS_TITLE}
        </h2>
        <div className="relative mt-10 w-[80%] md:w-[70%] overflow-hidden rounded-sm mx-auto">
          <Image src={PROCESS_IMAGE_SRC} alt="" width={1000} height={500} className="h-auto w-full object-cover" />
        </div>
        <nav className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:justify-start">
          {SOCIAL_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center justify-center border border-gray-300 bg-white px-14 py-3 md:py-4 text-base md:text-lg font-semibold text-[#121212] transition-colors hover:border-[#023373] hover:text-[#023373] lg:px-28"
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
