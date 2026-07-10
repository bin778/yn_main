import { SITE_NAME } from '../constants/boardContent';
import type { BoTable } from '../types/board';

const AUTHOR_FORMAT_BO_TABLES = new Set<BoTable>(['column', 'success']);

const FIRM_NAME_COMPACT = '법무법인여온';

const ADVISOR_NAMES = new Set(['안성포']);

const LAWYER_NAMES = new Set(['유영규', '김환섭', '홍기웅', '김선호']);

function isFirmOnlyLabel(wrName: string): boolean {
  const trimmed = wrName.trim();
  if (trimmed === '') return true;
  if (trimmed === SITE_NAME) return true;
  return trimmed.replace(/\s/g, '') === FIRM_NAME_COMPACT;
}

function stripRoleSuffix(wrName: string): string {
  return wrName.replace(/\s*(변호사|고문)(\s*\|\s*법무법인\s*여온)?\s*$/u, '').trim();
}

export function usesExpertAuthorFormat(boTable: BoTable): boolean {
  return AUTHOR_FORMAT_BO_TABLES.has(boTable);
}

/**
 * 칼럼·성공사례 메타 작성자 라벨.
 * wr_name이 변호사/고문 이름이면 `OOO 변호사 | 법무법인 여온`, 기관명만이면 `법무법인 여온`.
 */
export function formatBoardAuthorLabel(boTable: BoTable, wrName: string): string {
  if (!usesExpertAuthorFormat(boTable)) {
    const trimmed = wrName.trim();
    return trimmed === '' ? SITE_NAME : trimmed;
  }

  if (isFirmOnlyLabel(wrName)) {
    return SITE_NAME;
  }

  const bareName = stripRoleSuffix(wrName);
  if (bareName === '' || isFirmOnlyLabel(bareName)) {
    return SITE_NAME;
  }

  if (ADVISOR_NAMES.has(bareName)) {
    return `${bareName} 고문 | ${SITE_NAME}`;
  }

  if (LAWYER_NAMES.has(bareName)) {
    return `${bareName} 변호사 | ${SITE_NAME}`;
  }

  return SITE_NAME;
}

export function formatBoardPostMetaLine(
  boTable: BoTable,
  wrName: string,
  wrDatetime: string,
  wrHit: number,
  formatDate: (datetime: string) => string,
): string {
  const author = formatBoardAuthorLabel(boTable, wrName);
  return `${author} · ${formatDate(wrDatetime)} · 조회 ${wrHit.toLocaleString()}`;
}
