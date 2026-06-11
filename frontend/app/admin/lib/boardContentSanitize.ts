import DOMPurify from 'isomorphic-dompurify';

import { sanitizeLegacyBoardHtml, sanitizeLegacyBoardHtmlForSave } from './sanitizeLegacyBoardHtml';

export function boardHtmlIsEmpty(html: string): boolean {
  const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  return text.replace(/\u00a0/g, ' ').trim() === '';
}

export function sanitizeContentForEditor(html: string): string {
  return sanitizeLegacyBoardHtml(html);
}

export function sanitizeContentForSave(html: string): string {
  return sanitizeLegacyBoardHtmlForSave(html);
}

export function contentIsEmpty(html: string): boolean {
  return boardHtmlIsEmpty(sanitizeContentForSave(html));
}
