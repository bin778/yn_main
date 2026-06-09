const SAFE_HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SAFE_RGB = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?|\.\d+))?\s*\)$/i;

const ALLOWED_PROPERTIES: Record<string, (value: string) => string | null> = {
  'color': normalizeColor,
  'background-color': normalizeColor,
  'font-size': normalizeFontSize,
  'line-height': normalizeLineHeight,
  'text-align': normalizeTextAlign,
  'font-weight': normalizeFontWeight,
  'font-style': normalizeFontStyle,
  'letter-spacing': normalizeLetterSpacing,
  'max-width': normalizeLength,
  'display': normalizeDisplay,
  'margin': normalizeSpacing,
  'margin-top': normalizeSpacing,
  'margin-right': normalizeSpacing,
  'margin-bottom': normalizeSpacing,
  'margin-left': normalizeSpacing,
  'padding': normalizeSpacing,
  'padding-top': normalizeSpacing,
  'padding-right': normalizeSpacing,
  'padding-bottom': normalizeSpacing,
  'padding-left': normalizeSpacing,
  'border': normalizeBorder,
  'border-left': normalizeBorder,
  'border-right': normalizeBorder,
  'border-top': normalizeBorder,
  'border-bottom': normalizeBorder,
  'border-radius': normalizeBorderRadius,
  'text-decoration': normalizeTextDecoration,
};

function normalizeColor(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (SAFE_HEX_COLOR.test(trimmed)) {
    return trimmed.length === 4
      ? `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
      : trimmed;
  }
  if (SAFE_RGB.test(trimmed)) {
    return trimmed.replace(/\s+/g, '');
  }
  return null;
}

function normalizeFontSize(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})(px|pt|em)$/);
  if (!match) return null;
  const num = Number(match[1]);
  if (num <= 0 || num > 48) return null;
  return `${num}${match[2]}`;
}

function normalizeLineHeight(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (/^\d(\.\d+)?$/.test(trimmed)) return trimmed;
  if (/^\d{1,3}%$/.test(trimmed)) return trimmed;
  return normalizeFontSize(trimmed);
}

function normalizeTextAlign(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'left' || trimmed === 'center' || trimmed === 'right') return trimmed;
  return null;
}

function normalizeFontWeight(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (['normal', 'bold', '600', '700'].includes(trimmed)) return trimmed;
  return null;
}

function normalizeFontStyle(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'normal' || trimmed === 'italic') return trimmed;
  return null;
}

function normalizeLetterSpacing(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (/^-?\d(\.\d+)?px$/.test(trimmed)) return trimmed;
  return null;
}

function normalizeLength(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (/^\d{1,4}px$/.test(trimmed)) return trimmed;
  if (/^\d{1,3}%$/.test(trimmed)) return trimmed;
  return null;
}

function normalizeDisplay(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'block' || trimmed === 'inline' || trimmed === 'inline-block') return trimmed;
  return null;
}

function normalizeSpacing(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === '0') return '0';
  if (/^\d{1,3}px$/.test(trimmed)) return trimmed;
  if (/^(\d{1,3}px\s+){1,3}\d{1,3}px$/.test(trimmed)) return trimmed;
  return null;
}

function normalizeBorder(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.includes('url(') || trimmed.includes('expression')) return null;
  const match = trimmed.match(/^(\d{1,2})px\s+(solid|none)\s+(.+)$/);
  if (!match) return null;
  const color = normalizeColor(match[3]);
  if (!color) return null;
  return `${match[1]}px ${match[2]} ${color}`;
}

function normalizeBorderRadius(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (/^\d{1,3}px$/.test(trimmed)) return trimmed;
  if (/^(\d{1,3}px\s+){1,3}\d{1,3}px$/.test(trimmed)) return trimmed;
  return null;
}

function normalizeTextDecoration(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'none' || trimmed === 'underline') return trimmed;
  return null;
}

export function buildLegacySafeInlineStyle(style: string): string | null {
  if (/url\s*\(|expression|javascript:|@import/i.test(style)) {
    return null;
  }

  const parts: string[] = [];
  const declarations = style.split(';');

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) continue;

    const property = declaration.slice(0, colonIndex).trim().toLowerCase();
    const rawValue = declaration.slice(colonIndex + 1).trim();
    const normalizer = ALLOWED_PROPERTIES[property];
    if (!normalizer) continue;

    const safeValue = normalizer(rawValue);
    if (safeValue) {
      parts.push(`${property}:${safeValue}`);
    }
  }

  return parts.length > 0 ? parts.join(';') : null;
}

export function isSafeYnClass(className: string): boolean {
  return className.split(/\s+/).every(token => token === '' || token.startsWith('yn-'));
}
