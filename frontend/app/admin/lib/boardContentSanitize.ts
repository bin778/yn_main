import type { BoardContentMode } from './boardContentMode';

import { boardHtmlIsEmpty, sanitizeBoardHtml, sanitizeBoardHtmlForSave } from './sanitizeBoardHtml';
import { sanitizeLegacyBoardHtml, sanitizeLegacyBoardHtmlForSave } from './sanitizeLegacyBoardHtml';

export function sanitizeContentForEditor(html: string, mode: BoardContentMode): string {
  return mode === 'legacy_html' ? sanitizeLegacyBoardHtml(html) : sanitizeBoardHtml(html);
}

export function sanitizeContentForSave(html: string, mode: BoardContentMode): string {
  return mode === 'legacy_html' ? sanitizeLegacyBoardHtmlForSave(html) : sanitizeBoardHtmlForSave(html);
}

export function contentIsEmpty(html: string, mode: BoardContentMode): boolean {
  return boardHtmlIsEmpty(sanitizeContentForSave(html, mode));
}
