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
