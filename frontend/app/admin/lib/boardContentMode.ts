export const BOARD_CONTENT_MODES = ['rich', 'legacy_html'] as const;

export type BoardContentMode = (typeof BOARD_CONTENT_MODES)[number];

export function normalizeContentMode(value: string | undefined | null): BoardContentMode {
  return value === 'legacy_html' ? 'legacy_html' : 'rich';
}

const LEGACY_HTML_PATTERNS = [
  /border-radius\s*:/i,
  /\salign\s*=\s*["']?center/i,
  /\bbgcolor\s*=\s*["']?#/i,
  /<table\b[^>]*\swidth\s*=\s*["']?\d/i,
  /style\s*=\s*["'][^"']*(?:margin|padding|font-size|line-height|border-left)/i,
  /style\s*=\s*["'][^"']*(?:background-color|background)/i,
  /style\s*=\s*["'][^"']*display\s*:\s*flex/i,
  /style\s*=\s*["'][^"']*font-family\s*:/i,
  /<a\b[^>]*\sstyle\s*=\s*["'][^"']*(?:background|border-radius)/i,
  /\bclass\s*=\s*["'][^"']*\byn-(?:cta|btn)\b/i,
];

export function detectLegacyHtmlContent(html: string): boolean {
  const trimmed = html.trim();
  if (trimmed === '') return false;
  return LEGACY_HTML_PATTERNS.some(pattern => pattern.test(trimmed));
}

/** 이메일형 nested table 레이아웃 (bgcolor·고정 width table) */
export function detectLegacyEmailLayout(html: string): boolean {
  const trimmed = html.trim();
  if (trimmed === '') return false;
  if (/\bbgcolor\s*=/i.test(trimmed)) return true;
  if (/<table\b[^>]*\swidth\s*=\s*["']?\d/i.test(trimmed)) return true;
  return (trimmed.match(/<table\b/gi)?.length ?? 0) >= 3;
}

export function shouldUseLegacyLayoutRendering(contentMode: BoardContentMode | undefined, html: string): boolean {
  if (contentMode === 'legacy_html') return true;
  return detectLegacyEmailLayout(html);
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

/** rich 모드에서 HTML 모드 전환을 권장할 조건 (자동 전환 없음) */
export function shouldSuggestLegacyHtml(html: string): boolean {
  return isTipTapUnsafeHtml(html);
}

/** 기본 모드 편집 전 h1 등 TipTap 비호환 태그를 정규화한다. */
export function normalizeHtmlForRichEditor(html: string): string {
  return html.replace(/<h1(\b[^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');
}

export function getLegacySuggestMessage(html: string): string {
  if (detectLegacyHtmlContent(html)) {
    return '인라인 스타일·레이아웃이 포함된 HTML입니다. 고급 HTML 모드로 전환하는 것을 권장합니다.';
  }
  return '일부 HTML·서식은 기본 모드에서 제한되거나 변경될 수 있습니다. 고급 HTML 모드로 전환하는 것을 권장합니다.';
}

export const SWITCH_TO_RICH_CONFIRM =
  '기본 모드로 전환하면 인라인 스타일·레이아웃 등 일부 서식이 제거되거나 변경될 수 있습니다. 계속하시겠습니까?';

export const SWITCH_TO_LEGACY_CONFIRM =
  '고급 HTML 모드로 전환하면 HTML·마크다운 탭에서 직접 편집합니다. 인라인 스타일·레이아웃 보존에 유리합니다. 계속하시겠습니까?';

/** 수정 폼 로드 시 wr_6를 우선하고, rich인데 레거시 마크업이면 legacy_html로 연다. */
export function resolveContentModeForEdit(storedMode: string | undefined | null, html: string): BoardContentMode {
  if (normalizeContentMode(storedMode) === 'legacy_html') {
    return 'legacy_html';
  }
  if (detectLegacyHtmlContent(html)) {
    return 'legacy_html';
  }
  if (detectLegacyEmailLayout(html)) {
    return 'legacy_html';
  }
  return 'rich';
}
