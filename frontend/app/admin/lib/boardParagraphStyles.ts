export type ParagraphStyleId = 'title1' | 'title2' | 'title3' | 'body1' | 'body2' | 'body3';

export type BodyLevel = '1' | '2' | '3';

export const BODY_FONT_SIZES: Readonly<Record<BodyLevel, { mobile: string; desktop: string }>> = {
  '1': { mobile: '16px', desktop: '18px' },
  '2': { mobile: '14px', desktop: '15px' },
  '3': { mobile: '12px', desktop: '12px' },
};

export const PARAGRAPH_STYLE_OPTIONS: ReadonlyArray<{
  id: ParagraphStyleId;
  label: string;
  hint: string;
}> = [
  { id: 'title1', label: '제목1', hint: 'H2' },
  { id: 'title2', label: '제목2', hint: 'H3' },
  { id: 'title3', label: '제목3', hint: 'H4' },
  { id: 'body1', label: '본문1', hint: BODY_FONT_SIZES['1'].desktop },
  { id: 'body2', label: '본문2', hint: BODY_FONT_SIZES['2'].desktop },
  { id: 'body3', label: '본문3', hint: BODY_FONT_SIZES['3'].desktop },
];

export const DEFAULT_PARAGRAPH_STYLE: ParagraphStyleId = 'body2';

export function paragraphStyleLabel(id: ParagraphStyleId): string {
  return PARAGRAPH_STYLE_OPTIONS.find(option => option.id === id)?.label ?? '본문2';
}
