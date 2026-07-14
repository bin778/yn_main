'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useIsAnalyticsConsentBannerVisible } from '@/app/components/AnalyticsProvider';
import { GA_SOURCE_ATTR, GA_SOURCES } from '@/app/constants/analyticsEvents';

const QUICK_ACTIONS = [
  {
    href: 'tel:02-318-2981',
    label: '24시 상담',
    kind: 'anchor' as const,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5.5 4.5h3l1.5 4-2 1.75a14.6 14.6 0 0 0 5.75 5.75l1.75-2 4 1.5v3a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 4 6A1.5 1.5 0 0 1 5.5 4.5Z"
        />
      </svg>
    ),
  },
  {
    href: '/contact',
    label: '오시는길',
    kind: 'link' as const,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[1.8]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    href: 'http://pf.kakao.com/_Fxetvxj/chat',
    label: '바로문의',
    kind: 'anchor' as const,
    target: '_blank',
    rel: 'noopener noreferrer',
    icon: (
      <Image
        src="/img/kakao.webp"
        alt=""
        width={32}
        height={32}
        className="h-6 w-6 rounded-[4px] object-contain md:h-8 md:w-8 md:rounded-[5px]"
      />
    ),
  },
];

export default function FloatingQuickActions() {
  const isConsentBannerVisible = useIsAnalyticsConsentBannerVisible();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const positionClass = isConsentBannerVisible ? 'bottom-[9rem] md:bottom-[6.5rem]' : 'bottom-4 md:bottom-8';

  return (
    <div
      className={`fixed right-3 z-[100] flex flex-col items-center transition-[bottom] duration-300 ease-out md:right-10 ${positionClass}`}
    >
      <div className="flex w-[60px] md:w-[80px] flex-col items-center rounded-[999px] bg-[#023373] px-1 py-1 text-white shadow-[0_12px_30px_rgba(2,51,115,0.28)] md:px-3 md:py-3">
        {QUICK_ACTIONS.map((action, index) => {
          const content = (
            <>
              <span className="flex h-7 items-center justify-center md:h-8 [&_svg]:h-6 [&_svg]:w-6 md:[&_svg]:h-8 md:[&_svg]:w-8 [&_img]:h-6 [&_img]:w-6 md:[&_img]:h-8 md:[&_img]:w-8">
                {action.icon}
              </span>
              <span className="mt-1.5 text-[11px] font-semibold leading-tight md:mt-2 md:text-[13px]">
                {action.label}
              </span>
            </>
          );

          const className = `flex w-full flex-col items-center justify-center py-3 text-center transition-opacity hover:opacity-80 md:py-4 ${
            index > 0 ? 'border-t border-white/15' : ''
          }`;

          if (action.kind === 'link') {
            return (
              <Link key={action.label} href={action.href} className={className} aria-label={action.label}>
                {content}
              </Link>
            );
          }

          const isTrackedAction = action.href.startsWith('tel:') || action.href.includes('pf.kakao.com');

          return (
            <a
              key={action.label}
              href={action.href}
              className={className}
              aria-label={action.label}
              target={action.target}
              rel={action.rel}
              {...(isTrackedAction ? { [GA_SOURCE_ATTR]: GA_SOURCES.FLOATING_QUICK_ACTIONS } : {})}
            >
              {content}
            </a>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-2 md:mt-4 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-[#023373] shadow-[0_10px_24px_rgba(15,23,42,0.14)] transition-transform hover:scale-105 md:mt-6 md:h-16 md:w-16"
        onClick={handleScrollTop}
        aria-label="맨 위로 이동"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-7 w-7 fill-none stroke-current stroke-[2.2] md:h-9 md:w-9"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
