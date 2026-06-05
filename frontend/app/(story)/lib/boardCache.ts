import type { BoTable } from '../types/board';

export function boardViewCacheTag(boTable: BoTable, wrId: number): string {
  return `board-view-${boTable}-${wrId}`;
}

export function boardListCacheTag(boTable: BoTable): string {
  return `board-list-${boTable}`;
}
