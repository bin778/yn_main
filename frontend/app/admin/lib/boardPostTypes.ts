import type { BoTable } from '@/app/(story)/types/board';

export type BoardPostPayload = {
  wr_subject: string;
  wr_content: string;
  notice: boolean;
  wr_datetime: string;
  wr_1: string;
  wr_seo_title: string;
  wr_seo_slug: string;
  wr_seo_description: string;
  wr_schema: string;
  wr_7: string;
  wr_8: string;
  remove_attachment?: boolean;
  attachment_password?: string;
  clear_attachment_password?: boolean;
  scheduled?: boolean;
};

export type BoardPostFile = {
  no: number;
  source: string;
  url: string | null;
  size: number;
  is_image: boolean;
  width: number | null;
  height: number | null;
  has_password: boolean;
};

export const BOARD_ATTACHMENT_PASSWORD_MIN = 4;
export const BOARD_ATTACHMENT_PASSWORD_MAX = 64;

export type BoardPostAdmin = {
  wr_id: number;
  wr_subject: string;
  wr_content: string;
  wr_datetime: string;
  notice: boolean;
  wr_1: string;
  wr_seo_slug: string;
  wr_seo_title: string;
  wr_seo_description: string;
  wr_schema: string;
  wr_7?: string;
  wr_8?: string;
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

function formatDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultDatetimeLocal(): string {
  return formatDatetimeLocal(new Date());
}

export function offsetDatetimeLocal(minutes: number): string {
  return formatDatetimeLocal(new Date(Date.now() + minutes * 60 * 1000));
}

export function validateFutureDatetime(localValue: string): string | null {
  const trimmed = localValue.trim();
  if (trimmed === '') {
    return '예약 발행 시각을 선택해 주세요.';
  }

  const selected = new Date(trimmed);
  if (Number.isNaN(selected.getTime())) {
    return '예약 발행 시각이 올바르지 않습니다.';
  }

  if (selected.getTime() <= Date.now()) {
    return '예약 발행 시각은 현재보다 이후여야 합니다.';
  }

  return null;
}

export function isScheduledPost(wrDatetime: string): boolean {
  const trimmed = wrDatetime.trim();
  if (trimmed === '') return false;

  const normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  const scheduled = new Date(normalized);
  if (Number.isNaN(scheduled.getTime())) return false;

  return scheduled.getTime() > Date.now();
}

export function formatScheduledDatetime(wrDatetime: string): string {
  const normalized = wrDatetime.trim().replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return wrDatetime;
  return date.toLocaleString('ko-KR');
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
