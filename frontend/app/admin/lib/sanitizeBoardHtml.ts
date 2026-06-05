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

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'target', 'rel', 'style', 'data-list-style', 'data-body', 'start'];

function purifyHtml(html: string): string {
  const purified = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_ATTR: ['class', 'id', 'face', 'size', 'color', 'width', 'height'],
  });

  // style 속성에서 color 값만 허용하고 나머지 제거
  if (typeof document === 'undefined') {
    return purified;
  }

  const root = document.createElement('div');
  root.innerHTML = purified;

  root.querySelectorAll('[style]').forEach(el => {
    const colorMatch = (el.getAttribute('style') ?? '').match(/color\s*:\s*([^;]+)/);
    if (colorMatch) {
      el.setAttribute('style', `color:${colorMatch[1].trim()}`);
    } else {
      el.removeAttribute('style');
    }
  });

  return root.innerHTML;
}

/**
 * 에디터에서 실시간으로 호출 — collapseEmptyBlocks 없이 XSS 정제만 수행.
 * 빈 단락을 제거하지 않아야 엔터 줄바꿈과 글머리 기호가 유지됨.
 */
export function sanitizeBoardHtml(html: string): string {
  const trimmed = html.trim();
  if (trimmed === '') {
    return '';
  }

  const normalized = normalizeLegacyThumbUrls(trimmed);
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

  const normalized = normalizeLegacyThumbUrls(trimmed);
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
    // <li> 안의 단락은 Tiptap 구조이므로 제거하지 않음
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
