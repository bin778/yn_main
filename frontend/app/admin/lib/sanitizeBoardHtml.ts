import DOMPurify from 'isomorphic-dompurify';

import { normalizeEditorImageSourcesInHtml } from './boardEditorImages';
import { buildSafeInlineStyle, normalizeHexColorOrNull } from './boardSanitizeStyle';
import { normalizeTablesForEditor } from './boardTableHtml';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'mark',
  'a',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'img',
  'blockquote',
  'hr',
  'div',
  'span',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const ALLOWED_ATTR = [
  'href',
  'src',
  'alt',
  'title',
  'target',
  'rel',
  'style',
  'data-list-style',
  'data-body',
  'data-color',
  'start',
  'colspan',
  'rowspan',
];

function purifyHtml(html: string): string {
  const purified = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_ATTR: ['class', 'id', 'face', 'size', 'color', 'width', 'height'],
  });

  if (typeof document === 'undefined') {
    return purified;
  }

  const root = document.createElement('div');
  root.innerHTML = purified;

  root.querySelectorAll('del').forEach(el => {
    const replacement = document.createElement('s');
    replacement.innerHTML = el.innerHTML;
    el.replaceWith(replacement);
  });

  root.querySelectorAll('[style]').forEach(el => {
    const safeStyle = buildSafeInlineStyle(el.getAttribute('style') ?? '');
    if (safeStyle) {
      el.setAttribute('style', safeStyle);
    } else {
      el.removeAttribute('style');
    }
  });

  root.querySelectorAll('mark').forEach(el => {
    const dataColor = el.getAttribute('data-color');
    const safeColor = dataColor ? normalizeHexColorOrNull(dataColor) : null;
    if (safeColor) {
      el.setAttribute('data-color', safeColor);
      el.setAttribute('style', `background-color:${safeColor};color:inherit`);
    } else {
      el.removeAttribute('data-color');
      el.removeAttribute('style');
    }
  });

  return normalizeTablesForEditor(root.innerHTML);
}

/**
 * 에디터에서 실시간으로 호출 — collapseEmptyBlocks 없이 XSS 정제만 수행.
 */
export function sanitizeBoardHtml(html: string): string {
  const trimmed = html.trim();
  if (trimmed === '') {
    return '';
  }

  const normalized = normalizeEditorImageSourcesInHtml(trimmed);
  return purifyHtml(normalized);
}

/**
 * 저장(제출) 직전에만 호출 — 빈 단락 제거 포함.
 */
export function sanitizeBoardHtmlForSave(html: string): string {
  const trimmed = html.trim();
  if (trimmed === '') {
    return '';
  }

  const normalized = normalizeEditorImageSourcesInHtml(trimmed);
  const purified = purifyHtml(normalized);
  return collapseEmptyBlocks(purified);
}

export function boardHtmlIsEmpty(html: string): boolean {
  const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  return text.replace(/\u00a0/g, ' ').trim() === '';
}

function collapseEmptyBlocks(html: string): string {
  if (html === '') {
    return '';
  }

  if (typeof document === 'undefined') {
    return html;
  }

  const root = document.createElement('div');
  root.innerHTML = html;

  root.querySelectorAll('p, div, h2, h3, h4').forEach(node => {
    if (node.closest('li') !== null) return;

    const text = (node.textContent ?? '').replace(/\u00a0/g, ' ').trim();
    const hasMedia = node.querySelector('img, table, ul, ol, blockquote') !== null;
    if (text === '' && !hasMedia) {
      node.remove();
    }
  });

  const result = root.innerHTML.trim();
  return result === '' ? '' : result;
}
