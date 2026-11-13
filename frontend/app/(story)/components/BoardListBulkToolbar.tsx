'use client';

import { useState } from 'react';

import { ALLOWED_BO_TABLES, BOARD_META } from '../constants/boardContent';
import { getBoardSection, getBoardSections, hasBoardSections } from '../constants/boardSections';
import type { BoTable } from '../types/board';
import type { useBoardListBulkActions } from './useBoardListBulkActions';

export const CHECKBOX_CLASS = 'h-4 w-4 shrink-0 cursor-pointer accent-[#1a3151]';

function SectionSelects({
  boTable,
  category,
  subcategory,
  idPrefix,
  disabled,
  onCategoryChange,
  onSubcategoryChange,
}: {
  boTable: BoTable;
  category: string;
  subcategory: string;
  idPrefix: string;
  disabled: boolean;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
}) {
  if (!hasBoardSections(boTable)) return null;

  const sections = getBoardSections(boTable);
  const children = getBoardSection(boTable, category)?.children ?? [];

  return (
    <>
      <select
        id={`${idPrefix}-category`}
        value={category}
        disabled={disabled}
        onChange={event => onCategoryChange(event.target.value)}
        className="h-10 border border-[#ddd] bg-white px-2 text-[13px] text-[#121212] outline-none focus:border-[#1a3151] disabled:bg-[#f5f5f5]"
        aria-label="분류"
      >
        <option value="">분류 선택</option>
        {sections.map(section => (
          <option key={section.slug} value={section.slug}>
            {section.label}
          </option>
        ))}
      </select>
      {children.length > 0 ? (
        <select
          id={`${idPrefix}-subcategory`}
          value={subcategory}
          disabled={disabled}
          onChange={event => onSubcategoryChange(event.target.value)}
          className="h-10 border border-[#ddd] bg-white px-2 text-[13px] text-[#121212] outline-none focus:border-[#1a3151] disabled:bg-[#f5f5f5]"
          aria-label="하위 분류"
        >
          <option value="">하위 분류 선택</option>
          {children.map(child => (
            <option key={child.slug} value={child.slug}>
              {child.label}
            </option>
          ))}
        </select>
      ) : null}
    </>
  );
}

type Props = Pick<
  ReturnType<typeof useBoardListBulkActions>,
  'selectedCount' | 'allSelected' | 'loading' | 'error' | 'toggleAll' | 'runBulk'
> & {
  boTable: BoTable;
  itemCount: number;
  visible: boolean;
};

export default function BoardListBulkToolbar({
  boTable,
  itemCount,
  selectedCount,
  allSelected,
  loading,
  error,
  toggleAll,
  runBulk,
  visible,
}: Props) {
  const [sectionCategory, setSectionCategory] = useState('');
  const [sectionSubcategory, setSectionSubcategory] = useState('');
  const [targetBoTable, setTargetBoTable] = useState<BoTable | ''>('');
  const [moveCategory, setMoveCategory] = useState('');
  const [moveSubcategory, setMoveSubcategory] = useState('');

  if (!visible) return null;

  const moveTargets = ALLOWED_BO_TABLES.filter(table => table !== boTable);

  return (
    <div className="mb-3 border border-[#e8e8e8] bg-[#f8f9fb] px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#333]">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            disabled={loading || itemCount === 0}
            className={CHECKBOX_CLASS}
          />
          현재 페이지 전체
        </label>
        <span className="text-[13px] text-[#666]">선택 {selectedCount}건</span>
      </div>

      {hasBoardSections(boTable) ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <p className="w-full text-[12px] font-medium text-[#555]">분류 변경</p>
          <SectionSelects
            boTable={boTable}
            category={sectionCategory}
            subcategory={sectionSubcategory}
            idPrefix="bulk-section"
            disabled={loading}
            onCategoryChange={value => {
              setSectionCategory(value);
              setSectionSubcategory('');
            }}
            onSubcategoryChange={setSectionSubcategory}
          />
          <button
            type="button"
            disabled={loading || selectedCount === 0}
            onClick={() => void runBulk('section', sectionCategory, sectionSubcategory)}
            className="h-10 cursor-pointer border border-[#1a3151] bg-[#1a3151] px-3 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            분류 적용
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <p className="w-full text-[12px] font-medium text-[#555]">게시판 이동</p>
        <select
          value={targetBoTable}
          disabled={loading}
          onChange={event => {
            setTargetBoTable(event.target.value as BoTable | '');
            setMoveCategory('');
            setMoveSubcategory('');
          }}
          className="h-10 border border-[#ddd] bg-white px-2 text-[13px] text-[#121212] outline-none focus:border-[#1a3151] disabled:bg-[#f5f5f5]"
          aria-label="이동할 게시판"
        >
          <option value="">게시판 선택</option>
          {moveTargets.map(table => (
            <option key={table} value={table}>
              {BOARD_META[table].label}
            </option>
          ))}
        </select>
        {targetBoTable !== '' ? (
          <SectionSelects
            boTable={targetBoTable}
            category={moveCategory}
            subcategory={moveSubcategory}
            idPrefix="bulk-move"
            disabled={loading}
            onCategoryChange={value => {
              setMoveCategory(value);
              setMoveSubcategory('');
            }}
            onSubcategoryChange={setMoveSubcategory}
          />
        ) : null}
        <button
          type="button"
          disabled={loading || selectedCount === 0 || targetBoTable === ''}
          onClick={() => {
            if (targetBoTable === '') return;
            void runBulk('move', moveCategory, moveSubcategory, targetBoTable);
          }}
          className="h-10 cursor-pointer border border-[#1a3151] px-3 text-[13px] font-medium text-[#1a3151] hover:bg-[#1a3151] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          이동
        </button>
      </div>

      {error !== null ? (
        <p className="mt-2 text-[13px] text-[#b42318]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
