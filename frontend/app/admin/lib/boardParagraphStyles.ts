export type ParagraphStyleId = 'title1' | 'title2' | 'title3' | 'body1' | 'body2' | 'body3';

export type BodyLevel = '1' | '2' | '3';

export const PARAGRAPH_STYLE_OPTIONS: ReadonlyArray<{
  id: ParagraphStyleId;
  label: string;
  hint: string;
}> = [
  { id: 'title1', label: '제목1', hint: 'H2' },
  { id: 'title2', label: '제목2', hint: 'H3' },
  { id: 'title3', label: '제목3', hint: 'H4' },
  { id: 'body1', label: '본문1', hint: '18px' },
  { id: 'body2', label: '본문2', hint: '15px' },
  { id: 'body3', label: '본문3', hint: '12px' },
];

export const DEFAULT_PARAGRAPH_STYLE: ParagraphStyleId = 'body2';

export function paragraphStyleLabel(id: ParagraphStyleId): string {
  return PARAGRAPH_STYLE_OPTIONS.find(option => option.id === id)?.label ?? '본문2';
}
