import { DEFAULT_BOARD_SORT, type BoardListSort } from '../constants/boardSort';
import type { BoardListResponse, BoardSearchField, BoardView } from '../types/board';

const BOARD_API_BASE =
  typeof window !== 'undefined' ? '/api/board' : (process.env.BOARD_API_URL ?? 'https://yeoon.co.kr/api/board');
const BOARD_LIST_PER_PAGE = 12;

export async function fetchBoardList(
  boTable: string,
  page = 1,
  q = '',
  sfl: BoardSearchField = 'subject_content',
  sort: BoardListSort = DEFAULT_BOARD_SORT,
): Promise<BoardListResponse> {
  const searchParams = new URLSearchParams({
    bo_table: boTable,
    page: String(page),
    per_page: String(BOARD_LIST_PER_PAGE),
  });

  if (sort !== DEFAULT_BOARD_SORT) {
    searchParams.set('sort', sort);
  }

  if (q.trim() !== '') {
    searchParams.set('q', q.trim());
    searchParams.set('sfl', sfl);
  }

  const url = `${BOARD_API_BASE}/get_list.php?${searchParams.toString()}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`게시판 목록을 불러오지 못했습니다. (${boTable})`);
  return res.json() as Promise<BoardListResponse>;
}

export async function fetchBoardView(boTable: string, wrId: number): Promise<BoardView> {
  const url = `${BOARD_API_BASE}/get_view.php?bo_table=${boTable}&wr_id=${wrId}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`게시물을 불러오지 못했습니다. (${boTable}/${wrId})`);
  return res.json() as Promise<BoardView>;
}
