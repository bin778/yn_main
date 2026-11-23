'use client';

import { useId, useState } from 'react';

import NavLeaf from '@/app/components/nav/NavLeaf';
import { isNavGroup, type NavItem } from '@/app/constants/navContent';

export type NavAccordionVariant = 'drawer' | 'footer' | 'dropdown';

type NavAccordionLevelStyle = {
  row: string;
  panel: string;
};

const GROUP_BUTTON_CLASS = 'flex w-full cursor-pointer items-center justify-between text-left';
const LEAF_CLASS = 'block';
const CHEVRON_CLASS = 'text-[11px] leading-none opacity-50 transition-transform duration-200';

/**
 * 인덱스 = 중첩 깊이. 정의된 깊이를 넘어서면 마지막 스타일을 재사용한다.
 * dropdown은 최상위 라벨이 패널 바깥(헤더 링크)에 있으므로 깊이 0부터 하위 항목 행이 시작된다.
 * 펼친 그룹 행은 `aria-expanded`로 강조한다.
 */
const NAV_ACCORDION_LEVEL_STYLES: Record<NavAccordionVariant, readonly NavAccordionLevelStyle[]> = {
  drawer: [
    { row: 'px-5 py-4 text-[14px] md:text-[16px] font-bold text-black', panel: 'bg-gray-50 pb-2' },
    {
      row: [
        'px-8 py-3 text-[12px] md:text-[14px] font-bold text-black',
        'hover:bg-[#1a3151] hover:text-white aria-expanded:bg-[#1a3151] aria-expanded:text-white',
      ].join(' '),
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
      row: [
        'px-4 py-2 md:py-3 text-[14px] font-bold text-[#121212]',
        'hover:bg-[#1a3151] hover:text-white aria-expanded:bg-[#1a3151] aria-expanded:text-white',
      ].join(' '),
      panel: 'bg-[#ececec]',
    },
    { row: 'px-8 py-2 md:py-3 text-[14px] text-[#121212] hover:bg-[#1a3151] hover:text-white', panel: '' },
  ],
  dropdown: [
    {
      row: [
        'px-5 py-[15px] text-[13px] font-bold text-black transition-colors',
        'hover:bg-[#1a3151] hover:text-white aria-expanded:bg-[#1a3151] aria-expanded:text-white',
      ].join(' '),
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
  /** 형제 목록(`NavAccordionList`)이 열림 상태를 관리할 때 전달한다. 생략하면 항목이 자체 상태를 가진다. */
  open?: boolean;
  onToggle?: () => void;
};

/**
 * 감싸는 요소(`li`/`div`)는 호출부가 정한다.
 */
export default function NavAccordionItem({
  item,
  depth,
  variant,
  onNavigate,
  open: controlledOpen,
  onToggle,
}: NavAccordionItemProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const panelId = useId();
  const levelStyle = getLevelStyle(variant, depth);
  const open = controlledOpen ?? internalOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    setInternalOpen(previous => !previous);
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
        onClick={handleToggle}
      >
        {item.label}
        <span aria-hidden className={`${CHEVRON_CLASS} ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {open ? (
        <ul id={panelId} className={levelStyle.panel}>
          <NavAccordionList items={item.children} depth={depth + 1} variant={variant} onNavigate={onNavigate} />
        </ul>
      ) : null}
    </>
  );
}

type NavAccordionListProps = {
  items: readonly NavItem[];
  depth: number;
  variant: NavAccordionVariant;
  onNavigate?: () => void;
};

/**
 * 형제 그룹 중 하나만 펼쳐지도록 열림 상태를 목록 단위로 관리한다. 호출부가 감싸는 `ul`을 제공한다.
 */
export function NavAccordionList({ items, depth, variant, onNavigate }: NavAccordionListProps) {
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  return (
    <>
      {items.map(item => (
        <li key={item.label}>
          <NavAccordionItem
            item={item}
            depth={depth}
            variant={variant}
            onNavigate={onNavigate}
            open={openLabel === item.label}
            onToggle={() => setOpenLabel(previous => (previous === item.label ? null : item.label))}
          />
        </li>
      ))}
    </>
  );
}
