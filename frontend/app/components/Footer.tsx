import Link from 'next/link';

import { FOOTER_COPYRIGHT, FOOTER_LEGAL_LINES, FOOTER_SITE_BY_LABEL, KNAR_HREF } from '@/app/constants/footerContent';

export default function Footer() {
  return (
    <footer className="bg-[#f9f9f9] text-[#949494]">
      <div className="mx-auto max-w-[1200px] px-6 py-8 md:px-12 md:py-10">
        <div className="md:hidden">
          {FOOTER_LEGAL_LINES.map(line => (
            <p key={line} className="text-center text-sm leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        <div className="hidden text-sm leading-relaxed text-[#8B8B8B] md:block">
          <p className="whitespace-pre-line">{FOOTER_LEGAL_LINES.join('\n')}</p>
        </div>

        <hr className="my-6 border-t border-black/5" />

        <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:justify-between">
          <Link
            href={KNAR_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-[13px] text-[#c0c0c0] hover:underline md:text-left"
          >
            {FOOTER_SITE_BY_LABEL}
          </Link>
          <p className="text-center text-[13px] text-[#a9a9a9] md:text-right">{FOOTER_COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}
