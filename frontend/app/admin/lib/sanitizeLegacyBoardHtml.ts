import DOMPurify from 'isomorphic-dompurify';

import { buildLegacySafeInlineStyle, isSafeYnClass } from './boardSanitizeLegacyStyle';
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
  'h1',
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
  'align',
  'class',
  'data-list-style',
  'data-body',
  'data-color',
  'start',
  'colspan',
  'rowspan',
];

function purifyLegacyHtml(html: string): string {
  const withoutScripts = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  const purified = DOMPurify.sanitize(withoutScripts, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_ATTR: ['id', 'face', 'size', 'color', 'width', 'height'],
  });

  if (typeof document === 'undefined') {
    return purified;
  }

  const root = document.createElement('div');
  root.innerHTML = purified;

  root.querySelectorAll('[style]').forEach(el => {
    const safeStyle = buildLegacySafeInlineStyle(el.getAttribute('style') ?? '');
    if (safeStyle) {
      el.setAttribute('style', safeStyle);
    } else {
      el.removeAttribute('style');
    }
  });

  root.querySelectorAll('[class]').forEach(el => {
    const className = el.getAttribute('class') ?? '';
    if (!isSafeYnClass(className)) {
      el.removeAttribute('class');
    }
  });

  root.querySelectorAll('a[href]').forEach(el => {
    const href = (el.getAttribute('href') ?? '').trim();
    if (/^javascript:/i.test(href)) {
      el.removeAttribute('href');
    }
  });

  return normalizeTablesForEditor(root.innerHTML);
}

export function sanitizeLegacyBoardHtml(html: string): string {
  const trimmed = html.trim();
  if (trimmed === '') return '';
  return purifyLegacyHtml(trimmed);
}

export function sanitizeLegacyBoardHtmlForSave(html: string): string {
  return sanitizeLegacyBoardHtml(html);
}
