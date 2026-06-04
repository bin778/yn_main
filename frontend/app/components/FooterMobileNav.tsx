'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  CONTACT_NAV_HREF,
  CONTACT_NAV_LABEL,
  MAIN_NAV_LINKS,
  STORY_NAV_LABEL,
  STORY_SUBLINKS,
} from '@/app/constants/navContent';

export default function FooterMobileNav() {
  const [storyOpen, setStoryOpen] = useState(false);

  return (
    <nav className="border-b border-black/5 pb-6 lg:hidden" aria-label="사이트 메뉴">
      <ul className="flex flex-col">
        {MAIN_NAV_LINKS.map(item => (
          <li key={item.href} className="border-t border-gray-100">
            <Link
              href={item.href}
              className="block px-1 py-3 md:py-4 text-[14px] md:text-[16px] font-bold text-[#121212]"
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li className="border-t border-gray-100">
          <button
            type="button"
            className="flex w-full items-center justify-between px-1 py-3.5 text-left text-[14px] md:text-[16px] font-bold text-[#121212]"
            onClick={() => setStoryOpen(open => !open)}
            aria-expanded={storyOpen}
          >
            {STORY_NAV_LABEL}
            <span className="text-sm text-gray-500">{storyOpen ? '−' : '+'}</span>
          </button>
          {storyOpen ? (
            <ul className="border-t border-gray-100 bg-[#f5f5f5]">
              {STORY_SUBLINKS.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-2 md:py-3 text-[14px] text-[#121212] hover:bg-[#1a3151] hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
        <li className="border-t border-gray-100">
          <Link
            href={CONTACT_NAV_HREF}
            className="block px-1 py-3 md:py-4 text-[14px] md:text-[16px] font-bold text-[#121212]"
          >
            {CONTACT_NAV_LABEL}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
