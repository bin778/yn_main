import DOMPurify from 'isomorphic-dompurify';

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
  'a',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'img',
  'blockquote',
  'div',
  'span',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel'];

/** 레거시 Nano·붙여넣기 HTML에서 편집 가능한 형태로 정리 */
export function sanitizeBoardHtml(html: string): string {
  const trimmed = html.trim();
  if (trimmed === '') {
    return '';
  }

  const normalized = normalizeLegacyThumbUrls(trimmed);

  const purified = DOMPurify.sanitize(normalized, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_ATTR: ['style', 'class', 'id', 'face', 'size', 'color', 'width', 'height'],
  });

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

  root.querySelectorAll('p, div, h2, h3').forEach(node => {
    const text = (node.textContent ?? '').replace(/\u00a0/g, ' ').trim();
    const hasMedia = node.querySelector('img, table, ul, ol, blockquote') !== null;
    if (text === '' && !hasMedia) {
      node.remove();
    }
  });

  const result = root.innerHTML.trim();
  return result === '' ? '' : result;
}

function normalizeLegacyThumbUrls(html: string): string {
  return html.replace(/(<img[^>]*\ssrc=["'])([^"']+)(["'][^>]*>)/gi, (_full, prefix, src, suffix) => {
    const normalizedSrc = normalizeLegacyThumbUrl(src);
    return `${prefix}${normalizedSrc}${suffix}`;
  });
}

function normalizeLegacyThumbUrl(src: string): string {
  const decoded = decodeHtmlEntities(src.trim());

  // /.../thumb-<name>_<w>x<h>.<ext> 또는 https://.../thumb-... 패턴을 원본 파일 경로로 치환
  const match = decoded.match(/^(https?:\/\/[^/]+)?(\/.+\/)thumb-([^/]+)_\d+x\d+\.(jpe?g|png|gif|webp)(\?.*)?$/i);
  if (match === null) {
    return src;
  }

  const host = match[1] ?? '';
  const dir = match[2];
  const filename = match[3];
  const ext = match[4];
  return `${host}${dir}${filename}.${ext}`;
}

function decodeHtmlEntities(value: string): string {
  if (typeof document === 'undefined') {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}
