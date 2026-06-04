export const SEO_DESCRIPTION_MAX = 160;

export function stripHtmlForMetaDescription(html: string, maxLength = SEO_DESCRIPTION_MAX): string {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text === '') {
    return '';
  }
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}…`;
}

export function resolveBoardMetaDescription(custom: string | undefined, htmlContent: string): string {
  const trimmed = custom?.trim() ?? '';
  if (trimmed !== '') {
    return trimmed.length <= SEO_DESCRIPTION_MAX
      ? trimmed
      : `${trimmed.slice(0, SEO_DESCRIPTION_MAX)}…`;
  }
  return stripHtmlForMetaDescription(htmlContent);
}
