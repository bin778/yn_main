import Link from 'next/link';

import NavAccordionItem from '@/app/components/nav/NavAccordionItem';
import {
  CONTACT_NAV_HREF,
  CONTACT_NAV_LABEL,
  FIELD_NAV_MOBILE_ITEM,
  MAIN_NAV_LINKS,
  STORY_NAV_ITEM,
} from '@/app/constants/navContent';

const FOOTER_LINK_CLASS = 'block px-1 py-3 md:py-4 text-[14px] md:text-[16px] font-bold text-[#121212]';

export default function FooterMobileNav() {
  return (
    <nav className="border-b border-black/5 pb-2 md:pb-6 lg:hidden" aria-label="사이트 메뉴">
      <ul className="flex flex-col">
        {MAIN_NAV_LINKS.map(item => (
          <li key={item.href} className="border-t border-gray-100">
            <Link href={item.href} className={FOOTER_LINK_CLASS}>
              {item.label}
            </Link>
          </li>
        ))}
        <li className="border-t border-gray-100">
          <NavAccordionItem item={FIELD_NAV_MOBILE_ITEM} depth={0} variant="footer" />
        </li>
        <li className="border-t border-gray-100">
          <NavAccordionItem item={STORY_NAV_ITEM} depth={0} variant="footer" />
        </li>
        <li className="border-t border-gray-100">
          <Link href={CONTACT_NAV_HREF} className={FOOTER_LINK_CLASS}>
            {CONTACT_NAV_LABEL}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
