const BOARD_EDITOR_SITE_BASE = 'https://yeoon.co.kr';

const EDITOR_THUMB_PATTERN =
  /^(https?:\/\/[^/]+)?(\/board\/data\/editor\/\d+\/)thumb-([^/]+)_\d+x\d+\.(jpe?g|png|gif|webp)(\?.*)?$/i;

/** 상대·프로토콜 상대 URL을 절대 URL로 변환한다. */
export function normalizeEditorImageUrl(src: string): string {
  const trimmed = src.trim();
  if (trimmed === '') return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/')) return `${BOARD_EDITOR_SITE_BASE}${trimmed}`;
  return `${BOARD_EDITOR_SITE_BASE}/${trimmed.replace(/^\//, '')}`;
}

/**
 * 클라이언트에서는 파일 존재 여부를 알 수 없으므로 thumb→원본 변환을 하지 않는다.
 * (서버에 원본만 없고 thumb만 있는 레거시 이미지가 많음)
 */
export function resolveEditorImageSrc(src: string): string {
  return normalizeEditorImageUrl(src);
}

export function normalizeEditorImageSourcesInHtml(html: string): string {
  if (html === '') return html;

  return html.replace(
    /(<img[^>]*\ssrc=["'])([^"']+)(["'][^>]*>)/gi,
    (_full, prefix: string, src: string, suffix: string) => `${prefix}${resolveEditorImageSrc(src)}${suffix}`,
  );
}

export function isEditorThumbUrl(src: string): boolean {
  return EDITOR_THUMB_PATTERN.test(src.trim());
}
