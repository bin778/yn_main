export const BOARD_CONTENT_MODES = ['rich', 'legacy_html'] as const;

export type BoardContentMode = (typeof BOARD_CONTENT_MODES)[number];

export function normalizeContentMode(value: string | undefined | null): BoardContentMode {
  return value === 'legacy_html' ? 'legacy_html' : 'rich';
}

const LEGACY_HTML_PATTERNS = [
  /border-radius\s*:/i,
  /\salign\s*=\s*["']?center/i,
  /style\s*=\s*["'][^"']*(?:margin|padding|font-size|line-height|border-left)/i,
];

export function detectLegacyHtmlContent(html: string): boolean {
  const trimmed = html.trim();
  if (trimmed === '') return false;
  return LEGACY_HTML_PATTERNS.some(pattern => pattern.test(trimmed));
}

/** TipTap(ProseMirror)이 파싱 중 DOM 오류를 일으킬 수 있는 마크업 */
const TIPTAP_UNSAFE_PATTERNS = [
  /<table\b/i,
  /<script\b/i,
  /<iframe\b/i,
  /<form\b/i,
  /<h1\b/i,
  /<div\b/i,
  /<center\b/i,
  /<font\b/i,
  /<!--[\s\S]*?-->/,
  /\salign\s*=/i,
  /<p[^>]*\sstyle\s*=/i,
  /<span[^>]*\sstyle\s*=/i,
  /<img[^>]*\sstyle\s*=/i,
];

function looksLikeNonEditorHtml(html: string): boolean {
  if (/\bdata-body\s*=/.test(html)) return false;
  return /<div\b/i.test(html) || /\sstyle\s*=/i.test(html) || /<table\b/i.test(html);
}

export function isTipTapUnsafeHtml(html: string): boolean {
  const trimmed = html.trim();
  if (trimmed === '') return false;
  if (detectLegacyHtmlContent(trimmed)) return true;
  if (TIPTAP_UNSAFE_PATTERNS.some(pattern => pattern.test(trimmed))) return true;
  if (looksLikeNonEditorHtml(trimmed)) return true;

  const styleCount = trimmed.match(/\sstyle\s*=/gi);
  return styleCount !== null && styleCount.length > 1;
}

/** 수정 폼 로드 시 저장된 모드와 본문을 보고 편집 모드를 결정한다. */
export function resolveContentModeForEdit(storedMode: string | undefined | null, html: string): BoardContentMode {
  if (normalizeContentMode(storedMode) === 'legacy_html') {
    return 'legacy_html';
  }
  if (isTipTapUnsafeHtml(html)) {
    return 'legacy_html';
  }
  return 'rich';
}

export function extractSchemaFromContent(html: string): { content: string; schema: string } {
  const match = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) {
    return { content: html, schema: '' };
  }

  const schema = normalizeLegacySchemaJson(match[1].trim());
  const content = html
    .replace(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .trim();

  return { content, schema };
}

export function normalizeLegacySchemaJson(raw: string): string {
  return raw.replace(/<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>.*?<\/a>/gi, '$1');
}
