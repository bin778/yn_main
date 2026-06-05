'use client';

import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';

import { BOARD_META } from '@/app/(story)/constants/boardContent';
import { deleteBoardPost, fetchScheduledBoardList, type ScheduledBoardListItem } from '@/app/(story)/lib/boardAdminApi';
import type { BoTable } from '@/app/(story)/types/board';
import { useEffect, useState } from 'react';

import { formatScheduledDatetime } from '../../lib/boardPostTypes';
import { getAdminListPath, getBoardPathSlug, resolveAdminBoTable } from '../../lib/adminBoard';

type ScheduledListContentProps = {
  boTable: BoTable;
};

function ScheduledListContent({ boTable }: ScheduledListContentProps) {
  const router = useRouter();
  const [items, setItems] = useState<ScheduledBoardListItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const slug = getBoardPathSlug(boTable);
  const meta = BOARD_META[boTable];

  const loadItems = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchScheduledBoardList(boTable);
      setItems(data.items);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '예약글 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchItems() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await fetchScheduledBoardList(boTable);
        if (!cancelled) setItems(data.items);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : '예약글 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchItems();

    return () => {
      cancelled = true;
    };
  }, [boTable]);

  async function handleCancelSchedule(wrId: number) {
    if (!window.confirm('정말 예약을 취소하고 글을 삭제하시겠습니까?')) return;

    setDeletingId(wrId);
    setLoadError(null);
    try {
      await deleteBoardPost(boTable, wrId);
      await loadItems();
      router.refresh();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : '예약 취소에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  const actionBtnClass =
    'inline-flex h-9 cursor-pointer items-center justify-center border px-3 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <main className="mx-auto max-w-[900px] px-4 py-10 md:px-6">
      <p className="mb-1 text-sm text-[#666]">{meta.label}</p>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[#1a3151]">예약글 목록</h1>
        <Link
          href={getAdminListPath(boTable)}
          className={`${actionBtnClass} border-[#1a3151] text-[#1a3151] hover:bg-[#1a3151] hover:text-white`}
        >
          게시판 목록
        </Link>
      </div>

      {loading && <p className="text-sm text-[#666]">불러오는 중…</p>}

      {loadError !== null && (
        <p className="text-sm text-[#b42318]" role="alert">
          {loadError}
        </p>
      )}

      {!loading && loadError === null && items.length === 0 && (
        <p className="border border-[#e8e8e8] bg-white px-4 py-8 text-center text-sm text-[#666]">
          예약된 글이 없습니다.
        </p>
      )}

      {!loading && items.length > 0 && (
        <ul className="divide-y divide-[#eee] border border-[#e8e8e8] bg-white">
          {items.map(item => (
            <li key={item.wr_id} className="flex flex-wrap items-center gap-3 px-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#333]">{item.wr_subject || '(제목 없음)'}</p>
                <p className="mt-1 text-xs text-[#666]">
                  발행 예정: {formatScheduledDatetime(item.wr_datetime)} · {item.wr_name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/${slug}/${item.wr_id}/edit/`}
                  className={`${actionBtnClass} border-[#1a3151] text-[#1a3151] hover:bg-[#f0f4f9]`}
                >
                  수정
                </Link>
                <button
                  type="button"
                  disabled={deletingId === item.wr_id}
                  onClick={() => void handleCancelSchedule(item.wr_id)}
                  className={`${actionBtnClass} border-[#b42318] text-[#b42318] hover:bg-[#fff5f5]`}
                >
                  {deletingId === item.wr_id ? '삭제 중…' : '예약 취소'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function AdminScheduledListPage() {
  const params = useParams<{ bo_table: string }>();
  const boTable = resolveAdminBoTable(params.bo_table);

  if (boTable === null) {
    notFound();
  }

  return <ScheduledListContent boTable={boTable} />;
}
