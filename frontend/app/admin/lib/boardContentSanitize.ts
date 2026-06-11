import type { BoardContentMode } from './boardContentMode';

import { boardHtmlIsEmpty } from './sanitizeBoardHtml';
import { sanitizeLegacyBoardHtml, sanitizeLegacyBoardHtmlForSave } from './sanitizeLegacyBoardHtml';

/** Phase 1: 저장·미리보기·폼 state는 항상 legacy sanitizer. mode는 호출부 호환용. */
export function sanitizeContentForEditor(html: string, _mode?: BoardContentMode): string {
  return sanitizeLegacyBoardHtml(html);
}

export function sanitizeContentForSave(html: string, _mode?: BoardContentMode): string {
  return sanitizeLegacyBoardHtmlForSave(html);
}

export function contentIsEmpty(html: string, mode?: BoardContentMode): boolean {
  return boardHtmlIsEmpty(sanitizeContentForSave(html, mode));
}
