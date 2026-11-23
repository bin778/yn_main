'use client';

import Link from 'next/link';
import { useState } from 'react';

import NavAccordionItem from '@/app/components/nav/NavAccordionItem';
import { FIELD_NAV_CHILDREN, FIELD_NAV_HREF, FIELD_NAV_LABEL } from '@/app/constants/navContent';

type DesktopFieldMenuProps = {
  labelClassName: string;
};

const PANEL_VISIBILITY_CLASS = [
  'pointer-events-none invisible opacity-0',
  'group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100',
  'group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100',
].join(' ');

export default function DesktopFieldMenu({ labelClassName }: DesktopFieldMenuProps) {
  // 메뉴에 다시 진입할 때마다 key를 바꿔 하위 아코디언을 접힌 상태로 초기화한다.
  const [panelResetKey, setPanelResetKey] = useState(0);

  return (
    <div
      className="group relative flex h-[80px] items-center"
      onMouseEnter={() => setPanelResetKey(previous => previous + 1)}
    >
      <Link href={FIELD_NAV_HREF} className={`${labelClassName} inline-flex items-center gap-1.5`}>
        {FIELD_NAV_LABEL}
        <span
          aria-hidden
          className="text-[11px] leading-none text-black/45 transition-transform duration-200 group-hover:rotate-180"
        >
          ▼
        </span>
      </Link>
      <div
        className={`absolute left-0 top-full z-[110] w-[220px] pt-2 transition-all duration-200 ${PANEL_VISIBILITY_CLASS}`}
      >
        <ul key={panelResetKey} className="border border-gray-100 bg-white shadow-xl">
          {FIELD_NAV_CHILDREN.map(item => (
            <li key={item.label}>
              <NavAccordionItem item={item} depth={0} variant="dropdown" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
