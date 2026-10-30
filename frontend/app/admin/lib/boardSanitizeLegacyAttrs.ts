import { normalizeLegacyColorValue } from './boardSanitizeLegacyStyle';

const MAX_TABLE_WIDTH = 900;
const MAX_CELL_HEIGHT = 200;
const MAX_TABLE_SPACING = 20;
const MAX_TABLE_BORDER = 20;
const SAFE_VALIGN = new Set(['top', 'middle', 'bottom', 'baseline']);
const TABLE_TAGS = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td']);

function normalizeNumericAttr(value: string, max: number): string | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (num < 0 || num > max) return null;
  return String(num);
}

function normalizeWidthAttr(value: string): string | null {
  const trimmed = value.trim();
  const percentMatch = trimmed.match(/^(\d{1,3})%$/);
  if (percentMatch !== null) {
    const num = Number(percentMatch[1]);
    if (num >= 0 && num <= 100) return `${num}%`;
  }
  return normalizeNumericAttr(trimmed, MAX_TABLE_WIDTH);
}

function normalizeHeightAttr(value: string): string | null {
  return normalizeNumericAttr(value, MAX_CELL_HEIGHT);
}

function replaceAttr(attribs: Record<string, string>, name: string, normalize: (value: string) => string | null): void {
  if (attribs[name] === undefined) return;
  const safe = normalize(attribs[name]);
  if (safe === null) {
    delete attribs[name];
    return;
  }
  attribs[name] = safe;
}

/** legacy HTML table·셀 레이아웃 속성 정제 (bgcolor, width, bordercolor 등) */
export function normalizeLegacyTableAttributes(tagName: string, attribs: Record<string, string>): void {
  if (!TABLE_TAGS.has(tagName.toLowerCase())) return;

  replaceAttr(attribs, 'bgcolor', value => normalizeLegacyColorValue(value));
  replaceAttr(attribs, 'bordercolor', value => normalizeLegacyColorValue(value));
  replaceAttr(attribs, 'width', normalizeWidthAttr);
  replaceAttr(attribs, 'height', normalizeHeightAttr);
  replaceAttr(attribs, 'valign', value => {
    const safeValign = value.trim().toLowerCase();
    return SAFE_VALIGN.has(safeValign) ? safeValign : null;
  });
  replaceAttr(attribs, 'cellpadding', value => normalizeNumericAttr(value, MAX_TABLE_SPACING));
  replaceAttr(attribs, 'cellspacing', value => normalizeNumericAttr(value, MAX_TABLE_SPACING));
  replaceAttr(attribs, 'border', value => normalizeNumericAttr(value, MAX_TABLE_BORDER));
}
