import type { BoTable } from '../types/board';

import type { BoardPostAdmin, BoardPostPayload, BoardUploadPurpose } from '@/app/admin/lib/boardPostTypes';

const AUTH_BASE = '/api/board/auth';
const WRITE_API = '/api/board/write_post.php';
const BULK_API = '/api/board/bulk_posts.php';
const GET_POST_API = '/api/board/get_post.php';
const GET_SCHEDULED_LIST_API = '/api/board/get_scheduled_list.php';
const UPLOAD_API = '/api/board/upload_file.php';
const GNUBOARD_LOGOUT = '/board/bbs/logout.php';

export type BoardAdminRole = '' | 'super' | 'group' | 'board';

export type BoardAdminMe = {
  is_admin: BoardAdminRole;
  mb_name: string | null;
  write_href: string | null;
  update_href: string | null;
  delete_href: string | null;
};

const EMPTY_ME: BoardAdminMe = {
  is_admin: '',
  mb_name: null,
  write_href: null,
  update_href: null,
  delete_href: null,
};

const HTML_BLOCK_ERROR =
  '죄송합니다. 부적절한 단어 및 스팸성 문구가 포함되어 저장이 제한되었습니다. 내용을 다시 확인해 주세요.';

async function parseJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  const raw = await res.text();
  const looksLikeHtml = contentType.includes('text/html') || /^\s*</.test(raw);

  if (looksLikeHtml) {
    throw new Error(HTML_BLOCK_ERROR);
  }

  let data: T & { error?: string };
  try {
    data = JSON.parse(raw) as T & { error?: string };
  } catch {
    throw new Error('서버 응답을 해석하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }

  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : '요청에 실패했습니다.');
  }
  return data;
}

export async function boardAdminLogin(mbId: string, mbPassword: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE}/login.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mb_id: mbId, mb_password: mbPassword }),
  });
  await parseJson(res);
}

export async function boardAdminLogout(): Promise<void> {
  await fetch(GNUBOARD_LOGOUT, { method: 'GET', credentials: 'include' }).catch(() => {});

  const res = await fetch(`${AUTH_BASE}/logout.php`, {
    method: 'POST',
    credentials: 'include',
  });
  await parseJson(res);
}

export async function fetchBoardAdminMe(boTable?: BoTable, wrId?: number): Promise<BoardAdminMe> {
  const params = new URLSearchParams();
  if (boTable !== undefined) {
    params.set('bo_table', boTable);
  }
  if (wrId !== undefined && wrId > 0) {
    params.set('wr_id', String(wrId));
  }

  const query = params.toString();
  const url = query ? `${AUTH_BASE}/me.php?${query}` : `${AUTH_BASE}/me.php`;

  const res = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    return EMPTY_ME;
  }

  return res.json() as Promise<BoardAdminMe>;
}

export function isSuperAdmin(me: BoardAdminMe): boolean {
  return me.is_admin === 'super';
}

export function isAnyAdmin(me: BoardAdminMe): boolean {
  return me.is_admin === 'super' || me.is_admin === 'board';
}

export type ScheduledBoardListItem = {
  wr_id: number;
  wr_subject: string;
  wr_name: string;
  wr_datetime: string;
};

export type ScheduledBoardListResponse = {
  ok: boolean;
  total: number;
  items: ScheduledBoardListItem[];
};

export async function fetchScheduledBoardList(boTable: BoTable): Promise<ScheduledBoardListResponse> {
  const res = await fetch(`${GET_SCHEDULED_LIST_API}?bo_table=${encodeURIComponent(boTable)}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  return parseJson<ScheduledBoardListResponse>(res);
}

export async function fetchBoardPostAdmin(boTable: BoTable, wrId: number): Promise<BoardPostAdmin> {
  const res = await fetch(`${GET_POST_API}?bo_table=${boTable}&wr_id=${wrId}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await parseJson<{ ok: boolean; item: BoardPostAdmin }>(res);
  return data.item;
}

export async function createBoardPost(boTable: BoTable, payload: BoardPostPayload): Promise<{ wr_id: number }> {
  const res = await fetch(WRITE_API, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bo_table: boTable, ...payload }),
  });
  const data = await parseJson<{ wr_id: number }>(res);
  return { wr_id: data.wr_id };
}

export async function updateBoardPost(boTable: BoTable, wrId: number, payload: BoardPostPayload): Promise<void> {
  const res = await fetch(WRITE_API, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bo_table: boTable, wr_id: wrId, ...payload }),
  });
  await parseJson(res);
}

export async function revalidateBoardPost(boTable: BoTable, wrId: number, seoSlug = ''): Promise<void> {
  await fetch('/api/board/revalidate', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bo_table: boTable, wr_id: wrId, wr_seo_slug: seoSlug }),
  }).catch(error => {
    console.error('게시물 캐시 갱신에 실패했습니다.', error);
  });
}

export async function revalidateBoardLists(boTable: BoTable, extraBoTables: BoTable[] = []): Promise<void> {
  await fetch('/api/board/revalidate', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bo_table: boTable, wr_id: 0, extra_bo_tables: extraBoTables }),
  }).catch(error => {
    console.error('게시판 목록 캐시 갱신에 실패했습니다.', error);
  });
}

export type BulkBoardAction = 'section' | 'move';

export type BulkBoardResult = {
  ok: boolean;
  action: BulkBoardAction;
  updated?: number;
  moved?: number;
};

export async function bulkUpdateBoardPosts(
  boTable: BoTable,
  wrIds: number[],
  action: BulkBoardAction,
  options: { wr_7: string; wr_8: string; targetBoTable?: BoTable },
): Promise<BulkBoardResult> {
  const res = await fetch(BULK_API, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bo_table: boTable,
      wr_ids: wrIds,
      action,
      wr_7: options.wr_7,
      wr_8: options.wr_8,
      ...(action === 'move' && options.targetBoTable !== undefined
        ? { target_bo_table: options.targetBoTable }
        : {}),
    }),
  });
  return parseJson<BulkBoardResult>(res);
}

export async function deleteBoardPost(boTable: BoTable, wrId: number): Promise<void> {
  const res = await fetch(`${WRITE_API}?bo_table=${encodeURIComponent(boTable)}&wr_id=${wrId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await parseJson(res);
}

export type BoardUploadResult = {
  url: string | null;
  has_password: boolean;
};

export async function uploadBoardFile(
  boTable: BoTable,
  file: File,
  purpose: BoardUploadPurpose,
  wrId?: number,
  attachmentPassword?: string,
): Promise<BoardUploadResult> {
  const form = new FormData();
  form.set('bo_table', boTable);
  form.set('purpose', purpose);
  form.set('file', file);
  if (wrId !== undefined && wrId > 0) {
    form.set('wr_id', String(wrId));
  }
  if (purpose === 'attachment' && attachmentPassword !== undefined && attachmentPassword.trim() !== '') {
    form.set('attachment_password', attachmentPassword.trim());
  }

  const res = await fetch(UPLOAD_API, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  const data = await parseJson<{ ok: boolean; url: string | null; file?: { has_password?: boolean } }>(res);

  return {
    url: data.url,
    has_password: data.file?.has_password ?? false,
  };
}
