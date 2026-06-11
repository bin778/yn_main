/** 관리자 저장 시 wr_6 고정값 (프론트 모드 분기 없음) */
export const BOARD_SAVED_CONTENT_MODE = 'legacy_html' as const;

export type BoardContentMode = 'rich' | 'legacy_html';

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
