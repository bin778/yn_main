import Link from 'next/link';

import { BOARD_META } from '../constants/boardContent';
import { buildBoardSectionListPath, getBoardSections, type SectionedBoTable } from '../constants/boardSections';

type BoardSectionTabsProps = {
  boTable: SectionedBoTable;
  category: string | null;
  subcategory?: string | null;
};

const TAB_CLASS =
  'flex min-h-11 items-center justify-center border px-2 py-2 text-center text-[12px] font-medium leading-tight tracking-tight transition-colors md:text-[14px]';

const PARENT_GRID_BY_COUNT: Record<number, string> = {
  4: 'grid-cols-3 md:grid-cols-4',
  5: 'grid-cols-3 md:grid-cols-5',
  6: 'grid-cols-3 md:grid-cols-6',
  7: 'grid-cols-3 md:grid-cols-7',
  8: 'grid-cols-3 md:grid-cols-4',
};

const CHILD_GRID_BY_COUNT: Record<number, string> = {
  3: 'grid-cols-3 md:grid-cols-3',
  4: 'grid-cols-3 md:grid-cols-4',
  5: 'grid-cols-3 md:grid-cols-5',
  6: 'grid-cols-3 md:grid-cols-6',
  7: 'grid-cols-3 md:grid-cols-4',
};

function tabClassName(isActive: boolean): string {
  return `${TAB_CLASS} ${
    isActive
      ? 'border-[#1a3151] bg-[#1a3151] text-white'
      : 'border-[#ddd] bg-white text-[#555] hover:border-[#1a3151] hover:text-[#1a3151]'
  }`;
}

export default function BoardSectionTabs({ boTable, category, subcategory = null }: BoardSectionTabsProps) {
  const boardLabel = BOARD_META[boTable].label;
  const sections = getBoardSections(boTable);
  const selected = sections.find(section => section.slug === category) ?? null;
  const children = selected?.children ?? [];

  const parentTabs: { slug: string | null; label: string }[] = [
    { slug: null, label: '전체' },
    ...sections.map(section => ({ slug: section.slug, label: section.label })),
  ];

  const childTabs: { slug: string | null; label: string }[] =
    children.length === 0
      ? []
      : [{ slug: null, label: '전체' }, ...children.map(child => ({ slug: child.slug, label: child.label }))];

  const parentGridClass = PARENT_GRID_BY_COUNT[parentTabs.length] ?? 'grid-cols-2 md:grid-cols-5';
  const childGridClass = CHILD_GRID_BY_COUNT[childTabs.length] ?? 'grid-cols-3 md:grid-cols-5';

  return (
    <div className="mx-auto mb-6 max-w-[900px] px-4 md:px-6">
      <nav aria-label={`${boardLabel} 분류 선택`}>
        <ul className={`grid gap-2 ${parentGridClass}`}>
          {parentTabs.map(tab => {
            const isActive = category === tab.slug;
            const href = buildBoardSectionListPath(boTable, tab.slug);

            return (
              <li key={tab.slug ?? 'all'}>
                <Link href={href} className={tabClassName(isActive)} aria-current={isActive ? 'page' : undefined}>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {childTabs.length > 0 && selected !== null ? (
        <nav className="mt-3 pt-3 border-t border-[#ddd]" aria-label={`${selected.label} 하위 분류 선택`}>
          <ul className={`grid gap-2 ${childGridClass}`}>
            {childTabs.map(tab => {
              const isActive = subcategory === tab.slug;
              const href = buildBoardSectionListPath(boTable, selected.slug, tab.slug);

              return (
                <li key={tab.slug ?? 'all'}>
                  <Link href={href} className={tabClassName(isActive)} aria-current={isActive ? 'page' : undefined}>
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
