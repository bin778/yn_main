export const DEFAULT_BOARD_SORT = 'datetime_desc' as const;

export const BOARD_SORT_OPTIONS = [
  { value: 'datetime_desc', label: '최신순' },
  { value: 'datetime_asc', label: '오래된순' },
  { value: 'hit_desc', label: '조회수 많은순' },
  { value: 'hit_asc', label: '조회수 적은순' },
  { value: 'subject_asc', label: '제목 가나다순' },
  { value: 'subject_desc', label: '제목 역순' },
] as const;

export type BoardListSort = (typeof BOARD_SORT_OPTIONS)[number]['value'];

const SORT_VALUES = new Set<string>(BOARD_SORT_OPTIONS.map(option => option.value));

export function parseBoardListSort(raw: string | undefined): BoardListSort {
  if (raw !== undefined && SORT_VALUES.has(raw)) {
    return raw as BoardListSort;
  }
  return DEFAULT_BOARD_SORT;
}

export function appendBoardSortParam(searchParams: URLSearchParams, sort: BoardListSort): void {
  if (sort !== DEFAULT_BOARD_SORT) {
    searchParams.set('sort', sort);
  }
}
