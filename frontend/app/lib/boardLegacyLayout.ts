/** 이메일형 nested table 레이아웃 (bgcolor·고정 width table) */
export function detectLegacyEmailLayout(html: string): boolean {
  const trimmed = html.trim();
  if (trimmed === '') return false;
  if (/\bbgcolor\s*=/i.test(trimmed)) return true;
  if (/<table\b[^>]*\swidth\s*=\s*["']?\d/i.test(trimmed)) return true;
  return (trimmed.match(/<table\b/gi)?.length ?? 0) >= 3;
}

export function shouldUseLegacyLayoutRendering(html: string): boolean {
  return detectLegacyEmailLayout(html);
}
