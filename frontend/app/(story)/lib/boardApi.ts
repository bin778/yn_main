import { boardListCacheTag, boardViewCacheTag } from './boardCache';
import { isNumericPostKey } from './boardPostPath';

import { DEFAULT_BOARD_SORT, type BoardListSort } from '../constants/boardSort';
import type { PracticeAreaCategory } from '../constants/practiceAreaCategories';
import type { BoardListResponse, BoardSearchField, BoardView } from '../types/board';
import type { BoTable } from '../types/board';

const BOARD_API_BASE =
  typeof window !== 'undefined' ? '/api/board' : (process.env.BOARD_API_URL ?? 'https://www.yeoon.co.kr/api/board');
const DOWNLOAD_API = `${BOARD_API_BASE}/download_file.php`;
const BOARD_LIST_PER_PAGE = 12;

export async function fetchBoardList(
  boTable: string,
  page = 1,
  q = '',
  sfl: BoardSearchField = 'subject_content',
  sort: BoardListSort = DEFAULT_BOARD_SORT,
  category?: PracticeAreaCategory,
): Promise<BoardListResponse> {
  const searchParams = new URLSearchParams({
    bo_table: boTable,
    page: String(page),
    per_page: String(BOARD_LIST_PER_PAGE),
  });

  if (sort !== DEFAULT_BOARD_SORT) {
    searchParams.set('sort', sort);
  }

  if (category) {
    searchParams.set('category', category);
  }

  if (q.trim() !== '') {
    searchParams.set('q', q.trim());
    searchParams.set('sfl', sfl);
  }

  const url = `${BOARD_API_BASE}/get_list.php?${searchParams.toString()}`;
  const res = await fetch(url, { next: { tags: [boardListCacheTag(boTable as BoTable)] } });
  if (!res.ok) throw new Error(`게시판 목록을 불러오지 못했습니다. (${boTable})`);
  return res.json() as Promise<BoardListResponse>;
}

export async function fetchBoardView(boTable: string, postKey: string): Promise<BoardView> {
  const trimmed = postKey.trim();
  const query = isNumericPostKey(trimmed)
    ? `bo_table=${boTable}&wr_id=${trimmed}`
    : `bo_table=${boTable}&slug=${encodeURIComponent(trimmed)}`;
  const url = `${BOARD_API_BASE}/get_view.php?${query}`;
  const res = await fetch(url, {
    next: {
      tags: [boardViewCacheTag(boTable as BoTable, isNumericPostKey(trimmed) ? Number(trimmed) : trimmed)],
    },
  });
  if (!res.ok) throw new Error(`게시물을 불러오지 못했습니다. (${boTable}/${trimmed})`);
  return res.json() as Promise<BoardView>;
}

export async function downloadBoardAttachment(
  boTable: string,
  wrId: number,
  bfNo: number,
  password?: string,
): Promise<Blob> {
  const res = await fetch(DOWNLOAD_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bo_table: boTable,
      wr_id: wrId,
      bf_no: bfNo,
      password: password ?? '',
    }),
  });

  if (!res.ok) {
    let message = '파일 다운로드에 실패했습니다.';
    try {
      const data = (await res.json()) as { error?: string };
      if (typeof data.error === 'string') message = data.error;
    } catch {
      // binary or empty body
    }
    throw new Error(message);
  }

  return res.blob();
}
