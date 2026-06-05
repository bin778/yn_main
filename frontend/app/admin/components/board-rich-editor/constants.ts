export const TAB_LABELS = {
  default: '기본',
  markdown: '마크다운',
  html: 'HTML',
} as const;

export const EMPTY_DEFAULT_HTML = '<p data-body="2"></p>';

export const PRESET_TEXT_COLORS = [
  '#000000',
  '#1a1a2e',
  '#2d3436',
  '#636e72',
  '#b2bec3',
  '#ffffff',
  '#c0392b',
  '#e53e3e',
  '#e17055',
  '#fd7e14',
  '#fdcb6e',
  '#f6e58d',
  '#00b894',
  '#27ae60',
  '#55efc4',
  '#0984e3',
  '#2b6cb0',
  '#6c5ce7',
  '#a29bfe',
  '#fd79a8',
  '#e84393',
  '#d63031',
  '#74b9ff',
  '#dfe6e9',
];

export const PRESET_HIGHLIGHT_COLORS = PRESET_TEXT_COLORS;

export const DEFAULT_HIGHLIGHT_COLOR = '#ffffff';

export const TABLE_PICKER_MAX_ROWS = 8;
export const TABLE_PICKER_MAX_COLS = 8;
export const TABLE_PICKER_DEFAULT = { rows: 3, cols: 3 };
