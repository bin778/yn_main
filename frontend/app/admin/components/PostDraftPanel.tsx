'use client';

import { useState } from 'react';

import type { BoTable } from '@/app/(story)/types/board';

import { deleteBoardDraft, listBoardDrafts } from '../lib/boardDraftStorage';
import type { BoardDraft } from '../lib/boardPostTypes';

type PostDraftPanelProps = {
  boTable: BoTable;
  onLoad: (draft: BoardDraft) => void;
  /** 부모에서 임시 저장 후 목록 개수를 갱신할 때 증가 */
  refreshKey?: number;
};

export default function PostDraftPanel({ boTable, onLoad, refreshKey = 0 }: PostDraftPanelProps) {
  const [open, setOpen] = useState(false);
  const [listVersion, setListVersion] = useState(0);
  const draftListKey = `${boTable}-${listVersion}-${refreshKey}`;

  const drafts = listBoardDrafts(boTable);

  function reloadDrafts() {
    setListVersion(value => value + 1);
  }

  function handleToggle() {
    reloadDrafts();
    setOpen(prev => !prev);
  }

  function handleDelete(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    deleteBoardDraft(boTable, id);
    reloadDrafts();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="rounded border border-[#ddd] bg-white px-3 py-1.5 text-sm text-[#333] hover:bg-[#f5f7fb]"
      >
        임시 저장 ({drafts.length})
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="닫기"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-72 rounded border border-[#ddd] bg-white shadow-lg">
            {drafts.length === 0 ? (
              <p className="p-4 text-sm text-[#666]">저장된 임시 글이 없습니다.</p>
            ) : (
              <ul key={draftListKey} className="max-h-64 overflow-y-auto">
                {drafts.map(draft => (
                  <li key={draft.id} className="flex items-start gap-1 px-2 py-1 hover:bg-[#f5f7fb]">
                    <button
                      type="button"
                      className="min-w-0 flex-1 px-1 py-1 text-left"
                      onClick={() => {
                        onLoad(draft);
                        setOpen(false);
                      }}
                    >
                      <span className="block truncate text-sm text-[#333]">{draft.preview}</span>
                      <span className="text-xs text-[#999]">{new Date(draft.savedAt).toLocaleString('ko-KR')}</span>
                    </button>
                    <button
                      type="button"
                      aria-label="임시 글 삭제"
                      className="shrink-0 px-2 py-2 text-[#999] hover:text-[#b42318]"
                      onClick={event => handleDelete(draft.id, event)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-[#eee] p-2 text-right">
              <button type="button" className="text-xs text-[#666] underline" onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
