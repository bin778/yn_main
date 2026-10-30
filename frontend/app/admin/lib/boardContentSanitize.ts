import sanitizeHtml from 'sanitize-html';

import { sanitizeLegacyBoardHtml } from './sanitizeLegacyBoardHtml';

export function boardHtmlIsEmpty(html: string): boolean {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return text.replace(/\u00a0/g, ' ').trim() === '';
}

export function sanitizeContentForEditor(html: string): string {
  return sanitizeLegacyBoardHtml(html);
}

export function sanitizeContentForSave(html: string): string {
  return sanitizeLegacyBoardHtml(html);
}

export function contentIsEmpty(html: string): boolean {
  return boardHtmlIsEmpty(sanitizeContentForSave(html));
}
