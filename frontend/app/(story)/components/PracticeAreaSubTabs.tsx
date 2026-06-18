import Link from 'next/link';

import { BOARD_META } from '../constants/boardContent';
import {
  PRACTICE_AREA_CATEGORIES,
  buildPracticeAreaListPath,
  type PracticeAreaBoTable,
  type PracticeAreaCategory,
} from '../constants/practiceAreaCategories';

type PracticeAreaSubTabsProps = {
  boTable: PracticeAreaBoTable;
  current: PracticeAreaCategory | null;
};

export default function PracticeAreaSubTabs({ boTable, current }: PracticeAreaSubTabsProps) {
  const boardLabel = BOARD_META[boTable].label;
  const tabs: { slug: PracticeAreaCategory | null; label: string }[] = [
    { slug: null, label: '전체' },
    ...PRACTICE_AREA_CATEGORIES.map(item => ({ slug: item.slug, label: item.label })),
  ];

  return (
    <nav className="mx-auto mb-6 max-w-[900px] px-4 md:px-6" aria-label={`${boardLabel} 분류 선택`}>
      <ul className="grid grid-cols-3 gap-2 md:grid-cols-5">
        {tabs.map(tab => {
          const isActive = current === tab.slug;
          const href = buildPracticeAreaListPath(boTable, tab.slug);

          return (
            <li key={tab.slug ?? 'all'}>
              <Link
                href={href}
                className={`flex h-11 items-center justify-center border text-[14px] font-medium tracking-tight transition-colors ${
                  isActive
                    ? 'border-[#1a3151] bg-[#1a3151] text-white'
                    : 'border-[#ddd] bg-white text-[#555] hover:border-[#1a3151] hover:text-[#1a3151]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
