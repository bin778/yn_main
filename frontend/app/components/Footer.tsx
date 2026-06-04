import FooterMobileNav from '@/app/components/FooterMobileNav';
import { FOOTER_COPYRIGHT, FOOTER_LEGAL_LINES } from '@/app/constants/footerContent';

export default function Footer() {
  return (
    <footer className="bg-[#f9f9f9] text-[#949494]">
      <div className="mx-auto max-w-[1200px] px-6 py-8 lg:px-12 lg:py-10">
        <FooterMobileNav />

        <div className="lg:hidden">
          {FOOTER_LEGAL_LINES.map(line => (
            <p key={line} className="text-center text-xs md:text-sm leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        <div className="hidden text-xs md:text-sm leading-relaxed text-[#8B8B8B] lg:block">
          <p className="whitespace-pre-line">{FOOTER_LEGAL_LINES.join('\n')}</p>
        </div>

        <hr className="my-6 border-t border-black/5" />

        <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-center text-[11px] md:text-[13px] text-[#a9a9a9] lg:text-right">{FOOTER_COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}
