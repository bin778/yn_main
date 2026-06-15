import { getBoardPathSlug } from '@/app/(story)/constants/boardContent';
import type { BoTable } from '@/app/(story)/types/board';

export function getBoardPostPathSegment(wrId: number, seoSlug?: string): string {
  const slug = seoSlug?.trim() ?? '';
  return slug !== '' ? slug : String(wrId);
}

export function buildBoardPostHref(boTable: BoTable, wrId: number, seoSlug?: string): string {
  const pathSlug = getBoardPathSlug(boTable);
  const segment = getBoardPostPathSegment(wrId, seoSlug);
  return `/${pathSlug}/${segment}/`;
}

export function isNumericPostKey(postKey: string): boolean {
  return /^\d+$/.test(postKey.trim());
}
