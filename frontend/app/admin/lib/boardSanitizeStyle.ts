const SAFE_HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim();
  if (!SAFE_HEX_COLOR.test(trimmed)) {
    return null;
  }
  if (trimmed.length === 4) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

/** span 등에 허용할 인라인 style (글자색·배경색만) */
export function buildSafeInlineStyle(style: string): string | null {
  const parts: string[] = [];
  const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
  const bgMatch = style.match(/(?:^|;)\s*background-color\s*:\s*([^;]+)/i);

  if (colorMatch) {
    const safe = normalizeHexColor(colorMatch[1]);
    if (safe) {
      parts.push(`color:${safe}`);
    }
  }

  if (bgMatch) {
    const safe = normalizeHexColor(bgMatch[1]);
    if (safe) {
      parts.push(`background-color:${safe}`);
    }
  }

  return parts.length > 0 ? parts.join(';') : null;
}

export function isSafeHexColor(value: string): boolean {
  return normalizeHexColor(value) !== null;
}

export function normalizeHexColorOrNull(value: string): string | null {
  return normalizeHexColor(value);
}
