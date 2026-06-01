'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getBoardPathSlug } from '../constants/boardContent';
import { boardAdminLogout, deleteBoardPost, fetchBoardAdminMe, type BoardAdminMe } from '../lib/boardAdminApi';
import type { BoTable } from '../types/board';

type BoardAdminBarProps = {
  boTable: BoTable;
  wrId?: number;
};

const EMPTY_SESSION: BoardAdminMe = {
  is_admin: '',
  mb_name: null,
  write_href: null,
  update_href: null,
  delete_href: null,
};

export default function BoardAdminBar({ boTable, wrId }: BoardAdminBarProps) {
  const router = useRouter();
  const [session, setSession] = useState<BoardAdminMe | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchBoardAdminMe(boTable, wrId)
      .then(data => {
        if (!cancelled) setSession(data);
      })
      .catch(() => {
        if (!cancelled) setSession(EMPTY_SESSION);
      });

    return () => {
      cancelled = true;
    };
  }, [boTable, wrId]);

  async function handleLogout() {
    try {
      await boardAdminLogout();
      setSession(EMPTY_SESSION);
      router.refresh();
    } catch (logoutError) {
      window.alert(logoutError instanceof Error ? logoutError.message : '로그아웃에 실패했습니다.');
    }
  }

  async function handleDelete() {
    if (wrId === undefined || wrId <= 0) return;
    if (!window.confirm('이 게시물을 삭제하시겠습니까?')) return;

    try {
      await deleteBoardPost(boTable, wrId);
      router.push(`/${getBoardPathSlug(boTable)}/`);
      router.refresh();
    } catch (deleteError) {
      window.alert(deleteError instanceof Error ? deleteError.message : '삭제에 실패했습니다.');
    }
  }

  if (!session || session.is_admin === '') return null;

  const buttonClass =
    'inline-flex h-10 items-center justify-center border border-[#1a3151] px-4 text-[13px] font-medium text-[#1a3151] transition-colors hover:bg-[#1a3151] hover:text-white';

  return (
    <div className="mx-auto mb-4 max-w-[900px] px-4 md:px-6" aria-label="게시판 관리">
      <div className="flex flex-wrap items-center justify-end gap-2 border border-[#e8e8e8] bg-[#f8f9fb] px-4 py-3">
        {session.mb_name !== null && (
          <span className="mr-auto text-[13px] text-[#666]">{session.mb_name} (관리자)</span>
        )}
        <button type="button" className={buttonClass} onClick={handleLogout}>
          로그아웃
        </button>
        {session.write_href !== null && (
          <Link href={session.write_href} className={buttonClass}>
            글쓰기
          </Link>
        )}
        {session.update_href !== null && (
          <Link href={session.update_href} className={buttonClass}>
            수정
          </Link>
        )}
        {session.delete_href !== null && wrId !== undefined && wrId > 0 && (
          <button
            type="button"
            className={`${buttonClass} border-[#b42318] text-[#b42318] hover:bg-[#b42318] hover:text-white`}
            onClick={handleDelete}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
