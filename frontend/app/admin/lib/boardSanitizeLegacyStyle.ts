const SAFE_HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const SAFE_RGB = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?|\.\d+))?\s*\)$/i;

const SPACING_PX = /^\d{1,3}px$/;
const MARGIN_SIDE = /^(0|auto|\d{1,3}px)$/;
const PADDING_SIDE = /^(0|\d{1,3}px)$/;
const MAX_LINE_HEIGHT_PX = 54;
const MAX_HEIGHT_PX = 80;

const ALLOWED_PROPERTIES: Record<string, (value: string) => string | null> = {
  'color': normalizeColor,
  'background': normalizeBackground,
  'background-color': normalizeColor,
  'font-size': normalizeFontSize,
  'line-height': normalizeLineHeight,
  'text-align': normalizeTextAlign,
  'font-weight': normalizeFontWeight,
  'font-style': normalizeFontStyle,
  'letter-spacing': normalizeLetterSpacing,
  'width': normalizeLength,
  'min-width': normalizeLength,
  'max-width': normalizeLength,
  'height': normalizeHeight,
  'display': normalizeDisplay,
  'flex': normalizeFlex,
  'flex-direction': normalizeFlexDirection,
  'align-items': normalizeAlignItems,
  'justify-content': normalizeJustifyContent,
  'gap': normalizeGap,
  'box-sizing': normalizeBoxSizing,
  'vertical-align': normalizeVerticalAlign,
  'margin': normalizeMargin,
  'margin-top': normalizeMarginSide,
  'margin-right': normalizeMarginSide,
  'margin-bottom': normalizeMarginSide,
  'margin-left': normalizeMarginSide,
  'padding': normalizePadding,
  'padding-top': normalizePaddingSide,
  'padding-right': normalizePaddingSide,
  'padding-bottom': normalizePaddingSide,
  'padding-left': normalizePaddingSide,
  'border': normalizeBorder,
  'border-left': normalizeBorder,
  'border-right': normalizeBorder,
  'border-top': normalizeBorder,
  'border-bottom': normalizeBorder,
  'border-radius': normalizeBorderRadius,
  'text-decoration': normalizeTextDecoration,
};

function normalizeBackground(value: string): string | null {
  return normalizeColor(value);
}

function normalizeColor(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'inherit') {
    return 'inherit';
  }
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

  const pxMatch = trimmed.match(/^(\d{1,2})px$/);
  if (pxMatch !== null) {
    const num = Number(pxMatch[1]);
    if (num > 0 && num <= MAX_LINE_HEIGHT_PX) {
      return `${num}px`;
    }
  }

  return normalizeFontSize(trimmed);
}

function normalizeHeight(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === '0') return '0';

  const pxMatch = trimmed.match(/^(\d{1,2})px$/);
  if (pxMatch !== null) {
    const num = Number(pxMatch[1]);
    if (num > 0 && num <= MAX_HEIGHT_PX) {
      return `${num}px`;
    }
  }

  return null;
}

function normalizeTextAlign(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'left' || trimmed === 'center' || trimmed === 'right') return trimmed;
  return null;
}

function normalizeVerticalAlign(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'top' || trimmed === 'middle' || trimmed === 'bottom') {
    return trimmed;
  }
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
  if (trimmed === 'block' || trimmed === 'inline' || trimmed === 'inline-block' || trimmed === 'flex') {
    return trimmed;
  }
  return null;
}

function normalizeFlex(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === '1' || trimmed === 'none' || trimmed === '0' || trimmed === 'auto') return trimmed;
  if (/^\d+$/.test(trimmed)) return trimmed;
  return null;
}

function normalizeFlexDirection(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (['row', 'column', 'row-reverse', 'column-reverse'].includes(trimmed)) return trimmed;
  return null;
}

function normalizeAlignItems(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (['flex-start', 'flex-end', 'center', 'stretch', 'baseline'].includes(trimmed)) return trimmed;
  return null;
}

function normalizeJustifyContent(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (['flex-start', 'flex-end', 'center', 'space-between', 'space-around'].includes(trimmed)) {
    return trimmed;
  }
  return null;
}

function normalizeGap(value: string): string | null {
  return normalizePaddingSide(value);
}

function normalizeBoxSizing(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'border-box' || trimmed === 'content-box') return trimmed;
  return null;
}

function isMarginShorthand(value: string): boolean {
  const parts = value.trim().toLowerCase().split(/\s+/);
  if (parts.length < 1 || parts.length > 4) return false;
  return parts.every(part => MARGIN_SIDE.test(part));
}

function isPaddingShorthand(value: string): boolean {
  const parts = value.trim().toLowerCase().split(/\s+/);
  if (parts.length < 1 || parts.length > 4) return false;
  return parts.every(part => PADDING_SIDE.test(part));
}

function normalizeMargin(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!isMarginShorthand(trimmed)) return null;
  return trimmed;
}

function normalizeMarginSide(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!MARGIN_SIDE.test(trimmed)) return null;
  return trimmed;
}

function normalizePadding(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!isPaddingShorthand(trimmed)) return null;
  return trimmed;
}

function normalizePaddingSide(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!PADDING_SIDE.test(trimmed)) return null;
  return trimmed;
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
      const outputProperty = property === 'background' ? 'background-color' : property;
      parts.push(`${outputProperty}:${safeValue}`);
    }
  }

  return parts.length > 0 ? parts.join(';') : null;
}

export function isSafeYnClass(className: string): boolean {
  return className.split(/\s+/).every(token => token === '' || token.startsWith('yn-'));
}
