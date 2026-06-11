import { getBoardPathSlug } from '../constants/boardContent';
import { appendBoardSortParam } from '../constants/boardSort';
import type { BoardListSort, BoardSearchField, BoTable } from '../types/board';

export function buildBoardListHref(
  boTable: BoTable,
  page: number,
  view: 'list' | 'grid',
  q: string,
  sfl: BoardSearchField,
  sort: BoardListSort,
): string {
  const searchParams = new URLSearchParams();
  if (page > 1) searchParams.set('page', String(page));
  if (view !== 'list') searchParams.set('view', view);
  appendBoardSortParam(searchParams, sort);
  if (q.trim() !== '') {
    searchParams.set('q', q.trim());
    if (sfl !== 'subject_content') searchParams.set('sfl', sfl);
  }
  const pathSlug = getBoardPathSlug(boTable);
  const query = searchParams.toString();
  return query === '' ? `/${pathSlug}` : `/${pathSlug}?${query}`;
}
