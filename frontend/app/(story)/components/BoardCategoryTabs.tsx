import Link from 'next/link';

import type { BoTable } from '../types/board';
import { ALLOWED_BO_TABLES, BOARD_META } from '../constants/boardContent';

type BoardCategoryTabsProps = {
  current: BoTable;
};

export default function BoardCategoryTabs({ current }: BoardCategoryTabsProps) {
  return (
    <nav className="mx-auto mb-6 mt-6 max-w-[900px] px-4 md:px-6" aria-label="게시판 카테고리 선택">
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {ALLOWED_BO_TABLES.map(boTable => {
          const isActive = current === boTable;
          return (
            <li key={boTable}>
              <Link
                href={`/${boTable}`}
                className={`flex h-11 items-center justify-center border text-[14px] font-medium tracking-tight transition-colors ${
                  isActive
                    ? 'border-[#1a3151] bg-[#1a3151] text-white'
                    : 'border-[#ddd] bg-white text-[#555] hover:border-[#1a3151] hover:text-[#1a3151]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {BOARD_META[boTable].label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
