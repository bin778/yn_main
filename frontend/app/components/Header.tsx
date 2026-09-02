'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  CONSULTATION_NAV_LABEL,
  CONSULTATION_SUBLINKS,
  CONTACT_NAV_HREF,
  CONTACT_NAV_LABEL,
  FAMILY_LAWCASE_NAV_LABEL,
  FAMILY_LAWCASE_SUBLINKS,
  MAIN_NAV_LINKS,
  STORY_NAV_HREF,
  STORY_NAV_LABEL,
  STORY_SUBLINKS,
  SHOW_CONSULTATION_NAV,
  SHOW_FAMILY_LAWCASE_NAV,
  type NavSublink,
} from '@/app/constants/navContent';

const SCROLL_THRESHOLD = 100;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileConsultationOpen, setMobileConsultationOpen] = useState(false);
  const [mobileFamilyLawcaseOpen, setMobileFamilyLawcaseOpen] = useState(false);
  const [mobileStoryOpen, setMobileStoryOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinkClass = 'font-bold text-[18px] tracking-tight text-black transition-colors hover:text-black/50';

  const subLinkClass =
    'block px-5 py-[15px] text-[13px] text-black hover:bg-[#1a3151] hover:text-white transition-colors';

  const subLinkDisabledClass = 'block px-5 py-[15px] text-[13px] text-black/40 cursor-default';

  const renderConsultationSublink = (item: NavSublink, className: string, onNavigate?: () => void) => {
    if (item.href) {
      const href = item.href;

      if (href.startsWith('http')) {
        return (
          <a
            key={item.label}
            href={href}
            className={className}
            onClick={event => {
              event.preventDefault();
              onNavigate?.();
              window.location.assign(href);
            }}
          >
            {item.label}
          </a>
        );
      }

      return (
        <Link key={item.label} href={href} className={className} onClick={onNavigate}>
          {item.label}
        </Link>
      );
    }

    return (
      <span key={item.label} className={subLinkDisabledClass}>
        {item.label}
      </span>
    );
  };

  const logoSrc = '/img/menu_logo_b.webp';

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 z-[100] w-full transition-[background-color,box-shadow,border-color] duration-300',
          scrolled ? 'border-b border-black/10 bg-white shadow-sm' : 'border-b border-black/10 bg-white shadow-none',
        ].join(' ')}
      >
        <div className="mx-auto flex h-[80px] max-w-[1200px] items-center justify-between px-4 md:px-2">
          <Link href="/" className="shrink-0 p-2.5" onClick={() => setMobileOpen(false)}>
            <span className="relative block h-[42px] w-[176px] lg:h-12 lg:w-[200px]">
              <Image
                src={logoSrc}
                alt="법무법인 여온"
                fill
                className="object-contain object-left"
                sizes="(max-width: 1024px) 176px, 200px"
                fetchPriority="low"
              />
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex min-[1200px]:gap-10">
            {SHOW_CONSULTATION_NAV ? (
              <div className="group relative flex h-[80px] items-center">
                <span className={`${navLinkClass} inline-flex items-center gap-1.5`}>
                  {CONSULTATION_NAV_LABEL}
                  <span
                    aria-hidden
                    className="text-[11px] leading-none text-black/45 transition-transform duration-200 group-hover:rotate-180"
                  >
                    ▼
                  </span>
                </span>
                <div className="pointer-events-none invisible absolute left-0 top-full z-[110] w-[170px] pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                  <div className="border border-gray-100 bg-white shadow-xl">
                    {CONSULTATION_SUBLINKS.map(item => renderConsultationSublink(item, subLinkClass))}
                  </div>
                </div>
              </div>
            ) : null}

            {SHOW_FAMILY_LAWCASE_NAV ? (
              <div className="group relative flex h-[80px] items-center">
                <span className={`${navLinkClass} inline-flex items-center gap-1.5`}>
                  {FAMILY_LAWCASE_NAV_LABEL}
                  <span
                    aria-hidden
                    className="text-[11px] leading-none text-black/45 transition-transform duration-200 group-hover:rotate-180"
                  >
                    ▼
                  </span>
                </span>
                <div className="pointer-events-none invisible absolute left-0 top-full z-[110] w-[170px] pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                  <div className="border border-gray-100 bg-white shadow-xl">
                    {FAMILY_LAWCASE_SUBLINKS.map(item => renderConsultationSublink(item, subLinkClass))}
                  </div>
                </div>
              </div>
            ) : null}

            {MAIN_NAV_LINKS.map(item => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            ))}

            <div className="group relative flex h-[80px] items-center">
              <Link href={STORY_NAV_HREF} className={navLinkClass}>
                {STORY_NAV_LABEL}
              </Link>
              <div className="pointer-events-none invisible absolute left-0 top-full z-[110] w-[170px] pt-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                <div className="border border-gray-100 bg-white shadow-xl">
                  {STORY_SUBLINKS.map(item => (
                    <Link key={item.href} href={item.href} className={subLinkClass}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href={CONTACT_NAV_HREF} className={navLinkClass}>
              {CONTACT_NAV_LABEL}
            </Link>
          </nav>

          <button
            type="button"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen(v => !v)}
          >
            <span className="sr-only">메뉴</span>
            <span className="block h-0.5 w-6 rounded-sm bg-black transition-colors" />
            <span className="block h-0.5 w-6 rounded-sm bg-black transition-colors" />
            <span className="block h-0.5 w-6 rounded-sm bg-black transition-colors" />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[110] lg:hidden" id="mobile-nav">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="메뉴 닫기"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[100%] sm:w-[min(300px)] flex-col bg-white shadow-xl">
            <div className="flex h-[80px] items-center justify-between border-b border-gray-100 px-4">
              <span className="text-sm font-bold text-black">MENU</span>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center text-2xl leading-none text-black"
                onClick={() => setMobileOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-1 flex-col overflow-y-auto py-2">
              {SHOW_CONSULTATION_NAV ? (
                <div className="border-b border-gray-100">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-[14px] md:text-[16px] font-bold text-black"
                    onClick={() => setMobileConsultationOpen(v => !v)}
                    aria-expanded={mobileConsultationOpen}
                  >
                    {CONSULTATION_NAV_LABEL}
                    <span
                      aria-hidden
                      className={`text-xs text-gray-500 transition-transform duration-200 ${mobileConsultationOpen ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  </button>
                  {mobileConsultationOpen ? (
                    <div className="bg-gray-50 pb-2">
                      {CONSULTATION_SUBLINKS.map(item =>
                        item.href ? (
                          <a
                            key={item.label}
                            href={item.href}
                            className="block px-8 py-3 text-[12px] md:text-[14px] text-black hover:bg-[#1a3151] hover:text-white"
                            onClick={event => {
                              event.preventDefault();
                              setMobileOpen(false);
                              window.location.assign(item.href!);
                            }}
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span key={item.label} className="block px-8 py-3 text-[12px] md:text-[14px] text-black/40">
                            {item.label}
                          </span>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {SHOW_FAMILY_LAWCASE_NAV ? (
                <div className="border-b border-gray-100">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-[14px] md:text-[16px] font-bold text-black"
                    onClick={() => setMobileFamilyLawcaseOpen(v => !v)}
                    aria-expanded={mobileFamilyLawcaseOpen}
                  >
                    {FAMILY_LAWCASE_NAV_LABEL}
                    <span
                      aria-hidden
                      className={`text-xs text-gray-500 transition-transform duration-200 ${mobileFamilyLawcaseOpen ? 'rotate-180' : ''}`}
                    >
                      ▼
                    </span>
                  </button>
                  {mobileFamilyLawcaseOpen ? (
                    <div className="bg-gray-50 pb-2">
                      {FAMILY_LAWCASE_SUBLINKS.map(item =>
                        item.href ? (
                          <a
                            key={item.label}
                            href={item.href}
                            className="block px-8 py-3 text-[12px] md:text-[14px] text-black hover:bg-[#1a3151] hover:text-white"
                            onClick={event => {
                              event.preventDefault();
                              setMobileOpen(false);
                              window.location.assign(item.href!);
                            }}
                          >
                            {item.label}
                          </a>
                        ) : (
                          <span key={item.label} className="block px-8 py-3 text-[12px] md:text-[14px] text-black/40">
                            {item.label}
                          </span>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {MAIN_NAV_LINKS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border-b border-gray-100 px-5 py-4 text-[14px] md:text-[16px] font-bold text-black"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-b border-gray-100">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-[14px] md:text-[16px] font-bold text-black"
                  onClick={() => setMobileStoryOpen(v => !v)}
                  aria-expanded={mobileStoryOpen}
                >
                  {STORY_NAV_LABEL}
                  <span className="text-sm text-gray-500">{mobileStoryOpen ? '−' : '+'}</span>
                </button>
                {mobileStoryOpen ? (
                  <div className="bg-gray-50 pb-2">
                    {STORY_SUBLINKS.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-8 py-3 text-[12px] md:text-[14px] text-black hover:bg-[#1a3151] hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
              <Link
                href={CONTACT_NAV_HREF}
                className="border-b border-gray-100 px-5 py-4 text-[14px] md:text-[16px] font-bold text-black"
                onClick={() => setMobileOpen(false)}
              >
                {CONTACT_NAV_LABEL}
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
