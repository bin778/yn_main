import type { BoardSearchField } from '../types/board';
import { parseBoardListSort } from '../constants/boardSort';

export type BoardListSearchParams = {
  page?: string;
  q?: string;
  view?: string;
  sfl?: string;
  sort?: string;
};

export type ParsedBoardListQuery = {
  page: number;
  q: string;
  viewMode: 'list' | 'grid';
  sfl: BoardSearchField;
  sort: ReturnType<typeof parseBoardListSort>;
};

export function parseBoardListQuery(searchParams: BoardListSearchParams): ParsedBoardListQuery {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1);
  const q = (searchParams.q ?? '').trim();
  const viewMode = searchParams.view === 'grid' ? 'grid' : 'list';
  const sfl: BoardSearchField =
    searchParams.sfl === 'subject' ||
    searchParams.sfl === 'content' ||
    searchParams.sfl === 'name' ||
    searchParams.sfl === 'subject_content'
      ? searchParams.sfl
      : 'subject_content';
  const sort = parseBoardListSort(searchParams.sort);

  return { page, q, viewMode, sfl, sort };
}
