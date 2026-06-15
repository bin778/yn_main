import { ALLOWED_BO_TABLES, getBoardPathSlug, resolveBoTableFromPathSlug } from '@/app/(story)/constants/boardContent';
import { buildBoardPostHref } from '@/app/(story)/lib/boardPostPath';
import type { BoTable } from '@/app/(story)/types/board';

export function resolveAdminBoTable(slug: string): BoTable | null {
  return resolveBoTableFromPathSlug(slug);
}

export function isAllowedAdminSlug(slug: string): boolean {
  return resolveAdminBoTable(slug) !== null;
}

export function getAdminListPath(boTable: BoTable): string {
  return `/${getBoardPathSlug(boTable)}/`;
}

export type AdminSavePublishMode = 'now' | 'scheduled';

export function getAdminScheduledListPath(boTable: BoTable): string {
  return `/admin/${getBoardPathSlug(boTable)}/scheduled/`;
}

export function getRedirectPathAfterSave(
  boTable: BoTable,
  wrId: number,
  publishMode: AdminSavePublishMode,
  seoSlug?: string,
): string {
  if (publishMode === 'scheduled') {
    return getAdminListPath(boTable);
  }
  return buildBoardPostHref(boTable, wrId, seoSlug);
}

export { ALLOWED_BO_TABLES, getBoardPathSlug };
