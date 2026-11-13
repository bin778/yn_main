'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { BOARD_META } from '../constants/boardContent';
import { validateBoardSectionSelection } from '../constants/boardSections';
import { bulkUpdateBoardPosts, fetchBoardAdminMe, isAnyAdmin, revalidateBoardLists } from '../lib/boardAdminApi';
import type { BoardListItem, BoTable } from '../types/board';

export function useBoardListBulkActions(boTable: BoTable, items: BoardListItem[]) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [prevItems, setPrevItems] = useState(items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBoardAdminMe(boTable)
      .then(session => {
        if (!cancelled) setIsAdmin(isAnyAdmin(session));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [boTable]);

  if (items !== prevItems) {
    setPrevItems(items);
    setSelectedIds(new Set());
  }

  const pageIds = useMemo(() => items.map(item => item.wr_id), [items]);
  const selectedCount = selectedIds.size;
  const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));

  function toggleId(wrId: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(wrId)) next.delete(wrId);
      else next.add(wrId);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(pageIds));
  }

  async function runBulk(action: 'section' | 'move', wr7: string, wr8: string, destBoTable?: BoTable) {
    if (selectedCount === 0) {
      setError('게시물을 선택해 주세요.');
      return;
    }

    const destTable = action === 'move' ? destBoTable : boTable;
    if (action === 'move' && destTable === undefined) {
      setError('이동할 게시판을 선택해 주세요.');
      return;
    }

    const sectionError = validateBoardSectionSelection(destTable ?? boTable, wr7, wr8);
    if (sectionError !== null) {
      setError(sectionError);
      return;
    }

    const confirmMessage =
      action === 'move'
        ? `선택한 ${selectedCount}건을 ${BOARD_META[destTable ?? boTable].label}(으)로 이동할까요?`
        : `선택한 ${selectedCount}건의 분류를 변경할까요?`;
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setError(null);

    try {
      await bulkUpdateBoardPosts(boTable, [...selectedIds], action, {
        wr_7: wr7,
        wr_8: wr8,
        targetBoTable: destTable,
      });
      await revalidateBoardLists(boTable, destTable !== undefined && destTable !== boTable ? [destTable] : []);
      setSelectedIds(new Set());
      router.refresh();
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : '처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return { isAdmin, selectedIds, selectedCount, allSelected, loading, error, toggleId, toggleAll, runBulk };
}
