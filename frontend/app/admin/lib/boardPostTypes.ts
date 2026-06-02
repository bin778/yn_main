import type { BoTable } from '@/app/(story)/types/board';

export type BoardPostPayload = {
  wr_subject: string;
  wr_content: string;
  notice: boolean;
  wr_datetime: string;
  wr_1: string;
  wr_seo_title: string;
  wr_seo_slug: string;
  remove_attachment?: boolean;
};

export type BoardPostFile = {
  no: number;
  source: string;
  url: string;
  size: number;
  is_image: boolean;
  width: number | null;
  height: number | null;
};

export type BoardPostAdmin = {
  wr_id: number;
  wr_subject: string;
  wr_content: string;
  wr_datetime: string;
  notice: boolean;
  wr_1: string;
  wr_seo_slug: string;
  wr_seo_title: string;
  files: BoardPostFile[];
};

export type BoardUploadPurpose = 'editor_image' | 'thumbnail' | 'attachment';

export type BoardDraft = BoardPostPayload & {
  id: string;
  savedAt: string;
  preview: string;
};

export const BOARD_DRAFT_MAX = 10;

export function toDatetimeLocalValue(mysqlDatetime: string): string {
  const trimmed = mysqlDatetime.trim();
  if (trimmed === '') return '';
  const normalized = trimmed.replace(' ', 'T').substring(0, 16);
  return normalized;
}

export function toMysqlDatetime(localValue: string): string {
  if (localValue.trim() === '') {
    return '';
  }
  const withSeconds = localValue.length === 16 ? `${localValue}:00` : localValue;
  return withSeconds.replace('T', ' ');
}

export function defaultDatetimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function slugifySubject(subject: string): string {
  return subject
    .trim()
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

export function draftStorageKey(boTable: BoTable): string {
  return `yn_board_draft_${boTable}`;
}
