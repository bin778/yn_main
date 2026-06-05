/** @see backend/lib/board_files.php BOARD_UPLOAD_MAX_BYTES */
export const BOARD_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;

/** @see backend/lib/board_files.php BOARD_UPLOAD_IMAGE_EXT */
export const BOARD_UPLOAD_IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const;

/** @see backend/lib/board_files.php BOARD_UPLOAD_FILE_EXT */
export const BOARD_UPLOAD_FILE_EXT = [
  ...BOARD_UPLOAD_IMAGE_EXT,
  'pdf',
  'doc',
  'docx',
  'hwp',
  'hwpx',
  'txt',
  'rtf',
  'odt',
  'xls',
  'xlsx',
  'csv',
  'ods',
  'ppt',
  'pptx',
  'zip',
  '7z',
  'rar',
] as const;

/** 썸네일·에디터 이미지 전용 */
export const BOARD_IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

export const BOARD_IMAGE_HINT = 'jpg, png, gif, webp (최대 10MB)';

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? '';
}

function validateFileSize(file: File): string | null {
  if (file.size > BOARD_UPLOAD_MAX_BYTES) {
    return '파일 크기는 10MB 이하여야 합니다.';
  }
  return null;
}

function validateFileExtension(file: File, allowed: readonly string[]): string | null {
  const ext = getFileExtension(file.name);
  if (!allowed.includes(ext)) {
    return '허용되지 않는 파일 형식입니다.';
  }
  return null;
}

export function validateBoardImageFile(file: File): string | null {
  return validateFileSize(file) ?? validateFileExtension(file, BOARD_UPLOAD_IMAGE_EXT);
}

export function validateBoardAttachmentFile(file: File): string | null {
  return validateFileSize(file) ?? validateFileExtension(file, BOARD_UPLOAD_FILE_EXT);
}

/**
 * 게시물 파일 첨부 — backend BOARD_UPLOAD_FILE_EXT 와 확장자를 맞출 것
 * @see backend/lib/board_files.php
 */
export const BOARD_ATTACHMENT_ACCEPT = [
  BOARD_IMAGE_ACCEPT,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  '.doc,.docx,.hwp,.hwpx,.txt,.rtf,.odt',
  '.xls,.xlsx,.csv,.ods',
  '.ppt,.pptx',
  '.zip,.7z,.rar',
].join(',');

export const BOARD_ATTACHMENT_HINT = '이미지, PDF, 문서(doc/docx/hwp 등), CSV·엑셀, PPT, zip·7z·rar (최대 10MB)';
