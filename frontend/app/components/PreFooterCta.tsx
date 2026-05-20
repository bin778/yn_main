'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  BROCHURE_HREF,
  CONTACT_HREF,
  PRE_FOOTER_BG_DESKTOP,
  PRE_FOOTER_BG_MOBILE,
  PRE_FOOTER_SUBTITLE,
  PRE_FOOTER_TITLE_DESKTOP,
  PRE_FOOTER_TITLE_LINES_MOBILE,
} from '@/app/constants/footerContent';

export default function PreFooterCta() {
  const pathname = usePathname();
  if (pathname === '/contact') return null;

  return (
    <>
      <section className="relative w-full md:hidden" aria-labelledby="pre-footer-cta-mobile-heading">
        <div className="absolute inset-0">
          <Image
            src={PRE_FOOTER_BG_MOBILE}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/35" aria-hidden />
        <div className="relative z-[1] px-6 py-16 text-center text-white">
          <h2 id="pre-footer-cta-mobile-heading" className="sr-only">
            상담 및 브로슈어 안내
          </h2>
          {PRE_FOOTER_TITLE_LINES_MOBILE.map(line => (
            <p key={line} className="text-[34px] font-bold leading-[1.23] tracking-tight">
              {line}
            </p>
          ))}
          <p className="mt-3 text-[17px] leading-[1.45] tracking-tight text-white/90">
            {PRE_FOOTER_SUBTITLE}
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              href={CONTACT_HREF}
              className="flex w-[226px] max-w-full items-center justify-between border border-white bg-transparent px-4 py-3 font-bold text-white"
            >
              바로 문의하기
              <span aria-hidden>→</span>
            </Link>
            <Link
              href={BROCHURE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-[226px] max-w-full items-center justify-between border border-white bg-transparent px-4 py-3 font-bold text-white"
            >
              브로슈어 다운로드
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative hidden w-full md:block" aria-labelledby="pre-footer-cta-desktop-heading">
        <div className="absolute inset-0">
          <Image
            src={PRE_FOOTER_BG_DESKTOP}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/35" aria-hidden />
        <div className="relative z-[1] mx-auto max-w-[1200px] px-8 py-24 lg:px-16">
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-8">
              <h2
                id="pre-footer-cta-desktop-heading"
                className="whitespace-pre-line text-[45px] font-bold leading-tight tracking-tight text-white"
              >
                {PRE_FOOTER_TITLE_DESKTOP}
              </h2>
              <p className="mt-8 text-lg leading-none tracking-tight text-white/85">
                {PRE_FOOTER_SUBTITLE}
              </p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-4 md:mt-4">
              <Link
                href={CONTACT_HREF}
                className="flex w-full max-w-[237px] items-center justify-between border border-white bg-transparent px-4 py-3 font-bold text-white md:ml-auto"
              >
                바로 문의하기
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={BROCHURE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full max-w-[237px] items-center justify-between border border-white bg-transparent px-4 py-3 font-bold text-white md:ml-auto"
              >
                브로슈어 다운로드
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
