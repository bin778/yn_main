'use client';

import { useEffect, useState } from 'react';

import type { BoTable } from '../types/board';

type BoardSession = {
  is_admin: '' | 'super' | 'group' | 'board';
  mb_name: string | null;
  write_href: string | null;
  update_href: string | null;
  delete_href: string | null;
};

type BoardAdminBarProps = {
  boTable: BoTable;
  wrId?: number;
};

const EMPTY_SESSION: BoardSession = {
  is_admin: '',
  mb_name: null,
  write_href: null,
  update_href: null,
  delete_href: null,
};

function buildSessionUrl(boTable: BoTable, wrId?: number): string {
  const params = new URLSearchParams({ bo_table: boTable });
  if (wrId !== undefined && wrId > 0) {
    params.set('wr_id', String(wrId));
  }
  return `/api/board/session?${params.toString()}`;
}

function handleDeleteClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!window.confirm('이 게시물을 삭제하시겠습니까?')) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  window.location.href = href;
}

export default function BoardAdminBar({ boTable, wrId }: BoardAdminBarProps) {
  const [session, setSession] = useState<BoardSession | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(buildSessionUrl(boTable, wrId), { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : EMPTY_SESSION))
      .then((data: BoardSession) => {
        if (!cancelled) setSession(data);
      })
      .catch(() => {
        if (!cancelled) setSession(EMPTY_SESSION);
      });

    return () => {
      cancelled = true;
    };
  }, [boTable, wrId]);

  if (!session || session.is_admin === '') return null;

  const buttonClass =
    'inline-flex h-10 items-center justify-center border border-[#1a3151] px-4 text-[13px] font-medium text-[#1a3151] transition-colors hover:bg-[#1a3151] hover:text-white';

  return (
    <div
      className="mx-auto mb-4 max-w-[900px] px-4 md:px-6"
      aria-label="게시판 관리"
    >
      <div className="flex flex-wrap items-center justify-end gap-2 border border-[#e8e8e8] bg-[#f8f9fb] px-4 py-3">
        {session.mb_name !== null && (
          <span className="mr-auto text-[13px] text-[#666]">{session.mb_name} (관리자)</span>
        )}
        {session.write_href !== null && (
          <a href={session.write_href} className={buttonClass}>
            글쓰기
          </a>
        )}
        {session.update_href !== null && (
          <a href={session.update_href} className={buttonClass}>
            수정
          </a>
        )}
        {session.delete_href !== null && (
          <a
            href={session.delete_href}
            className={`${buttonClass} border-[#b42318] text-[#b42318] hover:bg-[#b42318] hover:text-white`}
            onClick={event => handleDeleteClick(event, session.delete_href!)}
          >
            삭제
          </a>
        )}
      </div>
    </div>
  );
}
