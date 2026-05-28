import type { BoardListResponse, BoardView } from '../types/board';

const BOARD_API_BASE = process.env.BOARD_API_URL ?? 'https://yeoon.co.kr/api/board';

export async function fetchBoardList(boTable: string, page = 1): Promise<BoardListResponse> {
  const url = `${BOARD_API_BASE}/get_list.php?bo_table=${boTable}&page=${page}`;
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
