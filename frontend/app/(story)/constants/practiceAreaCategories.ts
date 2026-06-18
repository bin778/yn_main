import { getBoardPathSlug } from './boardContent';
import type { BoTable } from '../types/board';

export const PRACTICE_AREA_CATEGORIES = [
  { slug: 'criminal', label: '형사' },
  { slug: 'civil', label: '민사' },
  { slug: 'family', label: '가사' },
  { slug: 'real-estate', label: '부동산' },
] as const;

export type PracticeAreaCategory = (typeof PRACTICE_AREA_CATEGORIES)[number]['slug'];

export const PRACTICE_AREA_BO_TABLES = ['success', 'column'] as const satisfies readonly BoTable[];

export type PracticeAreaBoTable = (typeof PRACTICE_AREA_BO_TABLES)[number];

const CATEGORY_SLUG_SET = new Set<string>(PRACTICE_AREA_CATEGORIES.map(item => item.slug));

const PRACTICE_AREA_TABLE_SET = new Set<string>(PRACTICE_AREA_BO_TABLES);

export function hasPracticeAreaCategories(boTable: BoTable): boTable is PracticeAreaBoTable {
  return PRACTICE_AREA_TABLE_SET.has(boTable);
}

export function isPracticeAreaCategorySlug(slug: string): slug is PracticeAreaCategory {
  return CATEGORY_SLUG_SET.has(slug);
}

export function getPracticeAreaCategoryLabel(slug: PracticeAreaCategory): string {
  const found = PRACTICE_AREA_CATEGORIES.find(item => item.slug === slug);
  return found?.label ?? slug;
}

export function buildPracticeAreaListPath(
  boTable: PracticeAreaBoTable,
  category?: PracticeAreaCategory | null,
): string {
  const base = `/${getBoardPathSlug(boTable)}`;
  if (category) {
    return `${base}/${category}`;
  }
  return base;
}
