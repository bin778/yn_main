import { PARAGRAPH_STYLE_OPTIONS, type ParagraphStyleId } from './boardParagraphStyles';

const TYPOGRAPHY_INLINE_PROPERTIES = new Set(['font-size', 'font-family', 'line-height']);
const MSO_CLASS_PATTERN = /\bmso[\w-]*/i;

export const BOARD_TYPOGRAPHY_FORMAT_NAMES = new Set<ParagraphStyleId>(
  PARAGRAPH_STYLE_OPTIONS.map(option => option.id),
);

export function isBoardTypographyFormat(format: string): format is ParagraphStyleId {
  return BOARD_TYPOGRAPHY_FORMAT_NAMES.has(format as ParagraphStyleId);
}

export function removeTypographyFromInlineStyle(style: string): string {
  const kept = style
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .filter(part => {
      const property = part.split(':')[0]?.trim().toLowerCase();
      return property !== undefined && !TYPOGRAPHY_INLINE_PROPERTIES.has(property);
    });

  return kept.join('; ');
}

function cleanupElementInlineTypography(element: Element): void {
  const style = element.getAttribute('style');
  if (style === null) return;

  const cleaned = removeTypographyFromInlineStyle(style);
  if (cleaned) {
    element.setAttribute('style', cleaned);
    return;
  }

  element.removeAttribute('style');
}

function removeMsoClasses(element: Element): void {
  const className = element.getAttribute('class');
  if (className === null) return;

  const filtered = className
    .split(/\s+/)
    .filter(token => token.length > 0 && !MSO_CLASS_PATTERN.test(token))
    .join(' ');

  if (filtered) {
    element.setAttribute('class', filtered);
    return;
  }

  element.removeAttribute('class');
}

function unwrapRedundantSpans(root: ParentNode): void {
  const spans = [...root.querySelectorAll('span')].reverse();

  spans.forEach(span => {
    if (span.attributes.length > 0) return;
    if (span.parentNode === null) return;

    while (span.firstChild !== null) {
      span.parentNode.insertBefore(span.firstChild, span);
    }
    span.remove();
  });
}

/** Word/한글 붙여넣기·블록 스타일 적용 후 타이포 인라인 스타일만 제거 (색·굵기 등은 유지) */
export function cleanupTypographyInSubtree(root: ParentNode): void {
  if (root instanceof Element) {
    cleanupElementInlineTypography(root);
    removeMsoClasses(root);
  }

  root.querySelectorAll('[style]').forEach(element => cleanupElementInlineTypography(element));
  root.querySelectorAll('[class]').forEach(element => removeMsoClasses(element));
  unwrapRedundantSpans(root);
}

export function stripTypographyFromBlocks(blocks: Element[]): void {
  blocks.forEach(block => cleanupTypographyInSubtree(block));
}
