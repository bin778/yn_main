import { getBoardPathSlug } from '@/app/(story)/constants/boardContent';
import type { BoTable } from '@/app/(story)/types/board';

/** On-demand static generation can pass an encoded segment on its first render. */
export function normalizeBoardPostKey(postKey: string): string {
  const trimmed = postKey.trim();
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function getBoardPostPathSegment(wrId: number, seoSlug?: string): string {
  const slug = seoSlug?.trim() ?? '';
  return slug !== '' ? slug : String(wrId);
}

export function buildBoardPostHref(boTable: BoTable, wrId: number, seoSlug?: string): string {
  const pathSlug = getBoardPathSlug(boTable);
  const segment = getBoardPostPathSegment(wrId, seoSlug);
  return `/${pathSlug}/${encodeURIComponent(segment)}/`;
}

export function isNumericPostKey(postKey: string): boolean {
  return /^\d+$/.test(postKey.trim());
}
