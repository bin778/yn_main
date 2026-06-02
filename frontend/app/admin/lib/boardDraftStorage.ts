import type { BoTable } from '@/app/(story)/types/board';

import { BOARD_DRAFT_MAX, type BoardDraft, type BoardPostPayload, draftStorageKey } from './boardPostTypes';

function readRaw(boTable: BoTable): BoardDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(draftStorageKey(boTable));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BoardDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(boTable: BoTable, drafts: BoardDraft[]): void {
  window.localStorage.setItem(draftStorageKey(boTable), JSON.stringify(drafts));
}

export function listBoardDrafts(boTable: BoTable): BoardDraft[] {
  return readRaw(boTable).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveBoardDraft(boTable: BoTable, payload: BoardPostPayload): BoardDraft {
  const preview = payload.wr_subject.trim() || '제목 없음';
  const draft: BoardDraft = {
    ...payload,
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    preview,
  };

  const next = [draft, ...readRaw(boTable).filter(item => item.id !== draft.id)].slice(0, BOARD_DRAFT_MAX);
  writeRaw(boTable, next);
  return draft;
}

export function deleteBoardDraft(boTable: BoTable, id: string): void {
  writeRaw(
    boTable,
    readRaw(boTable).filter(item => item.id !== id),
  );
}

export function clearBoardDrafts(boTable: BoTable): void {
  window.localStorage.removeItem(draftStorageKey(boTable));
}
