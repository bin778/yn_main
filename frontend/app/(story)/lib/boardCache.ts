import type { BoTable } from '../types/board';

export function boardViewCacheTag(boTable: BoTable, postKey: string | number): string {
  return `board-view-${boTable}-${postKey}`;
}

export function boardListCacheTag(boTable: BoTable): string {
  return `board-list-${boTable}`;
}
