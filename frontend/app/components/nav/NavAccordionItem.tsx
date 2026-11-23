'use client';

import { useCallback, useId, useState } from 'react';

import NavLeaf from '@/app/components/nav/NavLeaf';
import { useHoverIntent } from '@/app/components/nav/useHoverIntent';
import { isNavGroup, type NavItem } from '@/app/constants/navContent';

export type NavAccordionVariant = 'drawer' | 'footer' | 'dropdown';

type NavAccordionLevelStyle = {
  row: string;
  panel: string;
};

const HOVER_OPEN_DELAY_MS = 150;

/** 호버가 가능한 데스크톱 드롭다운만 호버로 펼친다. 드로어·푸터는 클릭 토글을 유지한다. */
const OPEN_ON_HOVER_VARIANTS: readonly NavAccordionVariant[] = ['dropdown'];

const GROUP_BUTTON_CLASS = 'flex w-full cursor-pointer items-center justify-between text-left';
const LEAF_CLASS = 'block';
const CHEVRON_CLASS = 'text-[11px] leading-none opacity-50 transition-transform duration-200';

/**
 * 인덱스 = 중첩 깊이. 정의된 깊이를 넘어서면 마지막 스타일을 재사용한다.
 * dropdown은 최상위 라벨이 패널 바깥(헤더 링크)에 있으므로 깊이 0부터 하위 항목 행이 시작된다.
 */
const NAV_ACCORDION_LEVEL_STYLES: Record<NavAccordionVariant, readonly NavAccordionLevelStyle[]> = {
  drawer: [
    { row: 'px-5 py-4 text-[14px] md:text-[16px] font-bold text-black', panel: 'bg-gray-50 pb-2' },
    {
      row: 'px-8 py-3 text-[12px] md:text-[14px] font-bold text-black hover:bg-[#1a3151] hover:text-white',
      panel: 'bg-gray-100',
    },
    { row: 'px-11 py-3 text-[12px] md:text-[14px] text-black hover:bg-[#1a3151] hover:text-white', panel: '' },
  ],
  footer: [
    {
      row: 'px-1 py-3.5 text-[14px] md:text-[16px] font-bold text-[#121212]',
      panel: 'border-t border-gray-100 bg-[#f5f5f5]',
    },
    {
      row: 'px-4 py-2 md:py-3 text-[14px] font-bold text-[#121212] hover:bg-[#1a3151] hover:text-white',
      panel: 'bg-[#ececec]',
    },
    { row: 'px-8 py-2 md:py-3 text-[14px] text-[#121212] hover:bg-[#1a3151] hover:text-white', panel: '' },
  ],
  dropdown: [
    {
      row: 'px-5 py-[15px] text-[13px] font-bold text-black transition-colors hover:bg-[#1a3151] hover:text-white',
      panel: 'bg-gray-50',
    },
    { row: 'px-8 py-[13px] text-[13px] text-black transition-colors hover:bg-[#1a3151] hover:text-white', panel: '' },
  ],
};

function getLevelStyle(variant: NavAccordionVariant, depth: number): NavAccordionLevelStyle {
  const levels = NAV_ACCORDION_LEVEL_STYLES[variant];
  return levels[Math.min(depth, levels.length - 1)];
}

type NavAccordionItemProps = {
  item: NavItem;
  depth: number;
  variant: NavAccordionVariant;
  onNavigate?: () => void;
};

/**
 * 감싸는 요소(`li`/`div`)는 호출부가 정한다. 하위 그룹은 항목마다 자체 상태로 펼침을 관리한다.
 * 호버로 펼치는 variant는 한 번 펼치면 접지 않는다(접히면 아래 행이 밀려 커서 위치가 어긋난다).
 */
export default function NavAccordionItem({ item, depth, variant, onNavigate }: NavAccordionItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const levelStyle = getLevelStyle(variant, depth);
  const opensOnHover = OPEN_ON_HOVER_VARIANTS.includes(variant);

  const openPanel = useCallback(() => setOpen(true), []);
  const { schedule: scheduleHoverOpen, cancel: cancelHoverOpen } = useHoverIntent(openPanel, HOVER_OPEN_DELAY_MS);

  const handleClick = () => {
    if (!opensOnHover) {
      setOpen(previous => !previous);
      return;
    }
    cancelHoverOpen();
    openPanel();
  };

  if (!isNavGroup(item)) {
    return <NavLeaf item={item} className={`${LEAF_CLASS} ${levelStyle.row}`} onNavigate={onNavigate} />;
  }

  return (
    <>
      <button
        type="button"
        className={`${GROUP_BUTTON_CLASS} ${levelStyle.row}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={handleClick}
        onMouseEnter={opensOnHover ? scheduleHoverOpen : undefined}
        onMouseLeave={opensOnHover ? cancelHoverOpen : undefined}
      >
        {item.label}
        <span aria-hidden className={`${CHEVRON_CLASS} ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {open ? (
        <ul id={panelId} className={levelStyle.panel}>
          {item.children.map(child => (
            <li key={child.label}>
              <NavAccordionItem item={child} depth={depth + 1} variant={variant} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
