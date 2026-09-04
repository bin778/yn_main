import type { BoTable } from '../types/board';

/** 글 저장 시 on-demand revalidate가 있으므로 ISR TTL은 길게 둔다 */
export const BOARD_PAGE_REVALIDATE_SECONDS = 3600;

export function boardViewCacheTag(boTable: BoTable, postKey: string | number): string {
  return `board-view-${boTable}-${postKey}`;
}

export function boardListCacheTag(boTable: BoTable): string {
  return `board-list-${boTable}`;
}
