import sanitizeHtml from 'sanitize-html';

import { normalizeLegacyTableAttributes } from './boardSanitizeLegacyAttrs';
import { buildLegacySafeInlineStyle, isSafeYnClass } from './boardSanitizeLegacyStyle';

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
  'tfoot',
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
  'bgcolor',
  'bordercolor',
  'valign',
  'cellpadding',
  'cellspacing',
  'border',
  'width',
  'height',
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: { '*': ALLOWED_ATTR },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  allowProtocolRelative: false,
  parseStyleAttributes: false,
  transformTags: {
    '*'(tagName, attribs) {
      const nextAttribs = { ...attribs };
      normalizeLegacyTableAttributes(tagName, nextAttribs);

      if (nextAttribs.style !== undefined) {
        const safeStyle = buildLegacySafeInlineStyle(nextAttribs.style);
        if (safeStyle) {
          nextAttribs.style = safeStyle;
        } else {
          delete nextAttribs.style;
        }
      }

      if (nextAttribs.class !== undefined && !isSafeYnClass(nextAttribs.class)) {
        delete nextAttribs.class;
      }

      return { tagName, attribs: nextAttribs };
    },
  },
};

function purifyLegacyHtml(html: string): string {
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}

export function sanitizeLegacyBoardHtml(html: string): string {
  const trimmed = html.trim();
  if (trimmed === '') return '';
  return purifyLegacyHtml(trimmed);
}
