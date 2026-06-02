import type { BoTable } from '../types/board';

const AUTH_BASE = '/api/board/auth';
const WRITE_API = '/api/board/write_post.php';
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

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
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

export async function createBoardPost(
  boTable: BoTable,
  wrSubject: string,
  wrContent: string,
): Promise<{ wr_id: number }> {
  const res = await fetch(WRITE_API, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bo_table: boTable,
      wr_subject: wrSubject,
      wr_content: wrContent,
    }),
  });
  const data = await parseJson<{ wr_id: number }>(res);
  return { wr_id: data.wr_id };
}

export async function updateBoardPost(
  boTable: BoTable,
  wrId: number,
  wrSubject: string,
  wrContent: string,
): Promise<void> {
  const res = await fetch(WRITE_API, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bo_table: boTable,
      wr_id: wrId,
      wr_subject: wrSubject,
      wr_content: wrContent,
    }),
  });
  await parseJson(res);
}

export async function deleteBoardPost(boTable: BoTable, wrId: number): Promise<void> {
  const res = await fetch(`${WRITE_API}?bo_table=${encodeURIComponent(boTable)}&wr_id=${wrId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await parseJson(res);
}
