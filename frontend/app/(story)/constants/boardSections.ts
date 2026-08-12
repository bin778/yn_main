import type { BoTable } from '../types/board';

import { getBoardPathSlug } from './boardContent';

export type BoardSectionChild = {
  slug: string;
  label: string;
};

export type BoardSection = {
  slug: string;
  label: string;
  children: readonly BoardSectionChild[];
};

const SHARED_PRACTICE_SECTIONS: readonly BoardSection[] = [
  {
    slug: 'criminal',
    label: '형사',
    children: [
      { slug: 'drunk-driving', label: '음주운전' },
      { slug: 'indecent-assault', label: '성범죄' },
      { slug: 'stalking', label: '스토킹' },
      { slug: 'other', label: '기타' },
    ],
  },
  {
    slug: 'civil',
    label: '민사',
    children: [
      { slug: 'real-estate', label: '부동산' },
      { slug: 'damages', label: '손해배상' },
      { slug: 'other', label: '기타' },
    ],
  },
  {
    slug: 'family',
    label: '가사',
    children: [
      { slug: 'divorce', label: '이혼' },
      { slug: 'inheritance', label: '상속(유류분)' },
      { slug: 'other', label: '기타' },
    ],
  },
];

const OTHER_SECTION: BoardSection = {
  slug: 'other',
  label: '기타',
  children: [],
};

const ADVISOR_AN_SECTION: BoardSection = {
  slug: 'advisor-an',
  label: '안성포 고문 칼럼',
  children: [],
};

const NEWS_SECTIONS: readonly BoardSection[] = [
  { slug: 'newsletter', label: '뉴스레터', children: [] },
  { slug: 'mou', label: 'MOU&협약', children: [] },
  { slug: 'appointment', label: '위촉', children: [] },
  { slug: 'other', label: '기타', children: [] },
];

export const BOARD_SECTIONS: Partial<Record<BoTable, readonly BoardSection[]>> = {
  success: [...SHARED_PRACTICE_SECTIONS, OTHER_SECTION],
  column: [...SHARED_PRACTICE_SECTIONS, ADVISOR_AN_SECTION, OTHER_SECTION],
  news: NEWS_SECTIONS,
};

export const SECTIONED_BO_TABLES = ['success', 'column', 'news'] as const satisfies readonly BoTable[];

export type SectionedBoTable = (typeof SECTIONED_BO_TABLES)[number];

export const LEGACY_REAL_ESTATE_SLUG = 'real-estate';
export const LEGACY_REAL_ESTATE_PARENT = 'civil';

const SECTIONED_TABLE_SET = new Set<string>(SECTIONED_BO_TABLES);

export function hasBoardSections(boTable: BoTable): boTable is SectionedBoTable {
  return SECTIONED_TABLE_SET.has(boTable);
}

export function getBoardSections(boTable: BoTable): readonly BoardSection[] {
  return BOARD_SECTIONS[boTable] ?? [];
}

export function getBoardSection(boTable: BoTable, slug: string): BoardSection | undefined {
  return getBoardSections(boTable).find(section => section.slug === slug);
}

export function isBoardSectionSlug(boTable: BoTable, slug: string): boolean {
  return getBoardSection(boTable, slug) !== undefined;
}

export function isBoardSubSectionSlug(boTable: BoTable, parentSlug: string, childSlug: string): boolean {
  const section = getBoardSection(boTable, parentSlug);
  if (section === undefined) return false;
  return section.children.some(child => child.slug === childSlug);
}

export function getBoardSectionLabel(boTable: BoTable, slug: string): string {
  return getBoardSection(boTable, slug)?.label ?? slug;
}

export function getBoardSubSectionLabel(boTable: BoTable, parentSlug: string, childSlug: string): string {
  const section = getBoardSection(boTable, parentSlug);
  const child = section?.children.find(item => item.slug === childSlug);
  return child?.label ?? childSlug;
}

export function getBoardSectionDisplayLabel(boTable: BoTable, wr7: string, wr8: string): string | null {
  if (!hasBoardSections(boTable)) return null;

  const category = wr7 === LEGACY_REAL_ESTATE_SLUG ? LEGACY_REAL_ESTATE_PARENT : wr7;
  const subcategory = wr7 === LEGACY_REAL_ESTATE_SLUG ? LEGACY_REAL_ESTATE_SLUG : wr8;

  if (category === '') return '미분류';

  const parentLabel = getBoardSectionLabel(boTable, category);
  if (subcategory === '') return parentLabel;

  return `${parentLabel} · ${getBoardSubSectionLabel(boTable, category, subcategory)}`;
}

export function buildBoardSectionListPath(
  boTable: SectionedBoTable,
  category?: string | null,
  subcategory?: string | null,
): string {
  const base = `/${getBoardPathSlug(boTable)}`;
  if (!category) return base;
  if (subcategory) return `${base}/${category}/${subcategory}`;
  return `${base}/${category}`;
}

export function validateBoardSectionSelection(boTable: BoTable, category: string, subcategory: string): string | null {
  if (!hasBoardSections(boTable)) {
    if (category !== '' || subcategory !== '') {
      return '이 게시판은 분류를 사용하지 않습니다.';
    }
    return null;
  }

  if (category === '') {
    return '분류를 선택해 주세요.';
  }

  const section = getBoardSection(boTable, category);
  if (section === undefined) {
    return '유효하지 않은 분류입니다.';
  }

  if (section.children.length === 0) {
    if (subcategory !== '') {
      return '이 분류는 하위 분류가 없습니다.';
    }
    return null;
  }

  if (subcategory === '') {
    return '하위 분류를 선택해 주세요.';
  }

  if (!section.children.some(child => child.slug === subcategory)) {
    return '유효하지 않은 하위 분류입니다.';
  }

  return null;
}
