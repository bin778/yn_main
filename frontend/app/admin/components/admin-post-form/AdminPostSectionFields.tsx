'use client';

import {
  getBoardSection,
  getBoardSections,
  hasBoardSections,
} from '@/app/(story)/constants/boardSections';
import type { BoTable } from '@/app/(story)/types/board';

type AdminPostSectionFieldsProps = {
  boTable: BoTable;
  category: string;
  subcategory: string;
  loading: boolean;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
};

export default function AdminPostSectionFields({
  boTable,
  category,
  subcategory,
  loading,
  onCategoryChange,
  onSubcategoryChange,
}: AdminPostSectionFieldsProps) {
  if (!hasBoardSections(boTable)) return null;

  const sections = getBoardSections(boTable);
  const selected = getBoardSection(boTable, category);
  const children = selected?.children ?? [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="wr_7" className="mb-1 flex items-center gap-1 text-sm font-medium">
          분류{' '}
          <span className="text-[#b42318]" aria-hidden>
            *
          </span>
        </label>
        <select
          id="wr_7"
          required
          value={category}
          disabled={loading}
          onChange={event => onCategoryChange(event.target.value)}
          className="w-full border border-[#ddd] bg-white px-3 py-2 text-sm focus:border-[#1a3151] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f5f5f5]"
        >
          <option value="">분류를 선택하세요</option>
          {sections.map(section => (
            <option key={section.slug} value={section.slug}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {children.length > 0 ? (
        <div>
          <label htmlFor="wr_8" className="mb-1 flex items-center gap-1 text-sm font-medium">
            하위 분류{' '}
            <span className="text-[#b42318]" aria-hidden>
              *
            </span>
          </label>
          <select
            id="wr_8"
            required
            value={subcategory}
            disabled={loading}
            onChange={event => onSubcategoryChange(event.target.value)}
            className="w-full border border-[#ddd] bg-white px-3 py-2 text-sm focus:border-[#1a3151] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f5f5f5]"
          >
            <option value="">하위 분류를 선택하세요</option>
            {children.map(child => (
              <option key={child.slug} value={child.slug}>
                {child.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
}
