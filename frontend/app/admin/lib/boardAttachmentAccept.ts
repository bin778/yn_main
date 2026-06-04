/** 썸네일·에디터 이미지 전용 */
export const BOARD_IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

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
