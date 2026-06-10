import { normalizeLegacyColorValue } from './boardSanitizeLegacyStyle';

const MAX_TABLE_WIDTH = 900;
const MAX_CELL_HEIGHT = 200;
const MAX_TABLE_SPACING = 20;
const MAX_TABLE_BORDER = 20;
const SAFE_VALIGN = new Set(['top', 'middle', 'bottom', 'baseline']);

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

/** legacy HTML table·셀 레이아웃 속성 정제 (bgcolor, width, bordercolor 등) */
export function normalizeLegacyTableAttributes(root: ParentNode): void {
  if (typeof document === 'undefined') return;

  root.querySelectorAll('table, thead, tbody, tfoot, tr, th, td').forEach(el => {
    const bgcolor = el.getAttribute('bgcolor');
    if (bgcolor !== null) {
      const safeBg = normalizeLegacyColorValue(bgcolor);
      if (safeBg) {
        el.setAttribute('bgcolor', safeBg);
      } else {
        el.removeAttribute('bgcolor');
      }
    }

    const bordercolor = el.getAttribute('bordercolor');
    if (bordercolor !== null) {
      const safeBorderColor = normalizeLegacyColorValue(bordercolor);
      if (safeBorderColor) {
        el.setAttribute('bordercolor', safeBorderColor);
      } else {
        el.removeAttribute('bordercolor');
      }
    }

    const width = el.getAttribute('width');
    if (width !== null) {
      const safeWidth = normalizeWidthAttr(width);
      if (safeWidth) {
        el.setAttribute('width', safeWidth);
      } else {
        el.removeAttribute('width');
      }
    }

    const height = el.getAttribute('height');
    if (height !== null) {
      const safeHeight = normalizeHeightAttr(height);
      if (safeHeight) {
        el.setAttribute('height', safeHeight);
      } else {
        el.removeAttribute('height');
      }
    }

    const valign = el.getAttribute('valign');
    if (valign !== null) {
      const safeValign = valign.trim().toLowerCase();
      if (SAFE_VALIGN.has(safeValign)) {
        el.setAttribute('valign', safeValign);
      } else {
        el.removeAttribute('valign');
      }
    }

    const cellpadding = el.getAttribute('cellpadding');
    if (cellpadding !== null) {
      const safePadding = normalizeNumericAttr(cellpadding, MAX_TABLE_SPACING);
      if (safePadding) {
        el.setAttribute('cellpadding', safePadding);
      } else {
        el.removeAttribute('cellpadding');
      }
    }

    const cellspacing = el.getAttribute('cellspacing');
    if (cellspacing !== null) {
      const safeSpacing = normalizeNumericAttr(cellspacing, MAX_TABLE_SPACING);
      if (safeSpacing) {
        el.setAttribute('cellspacing', safeSpacing);
      } else {
        el.removeAttribute('cellspacing');
      }
    }

    const border = el.getAttribute('border');
    if (border !== null) {
      const safeBorder = normalizeNumericAttr(border, MAX_TABLE_BORDER);
      if (safeBorder) {
        el.setAttribute('border', safeBorder);
      } else {
        el.removeAttribute('border');
      }
    }
  });
}
