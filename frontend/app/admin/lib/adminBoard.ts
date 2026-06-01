import { ALLOWED_BO_TABLES, getBoardPathSlug, resolveBoTableFromPathSlug } from '@/app/(story)/constants/boardContent';
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

export { ALLOWED_BO_TABLES, getBoardPathSlug };
