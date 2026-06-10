import type { Editor } from '@tiptap/react';

import type { BoardContentMode } from '../../lib/boardContentMode';
import type { ParagraphStyleId } from '../../lib/boardParagraphStyles';

export type EditorTab = 'default' | 'markdown' | 'html';

export type BoardRichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  contentMode?: BoardContentMode;
  disabled?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
  onForceLegacyMode?: (rawHtml?: string) => void;
  onSwitchToRichMode?: () => void;
};

export type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export type ListStyle = 'disc' | 'circle';

export type TablePickerSize = { rows: number; cols: number };

export type BoardRichEditorToolbarProps = {
  editor: Editor | null;
  toolbarDisabled: boolean;
  uploadingImage: boolean;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  showTextColorPicker: boolean;
  showBgColorPicker: boolean;
  showListMenu: boolean;
  showParagraphMenu: boolean;
  showTablePicker: boolean;
  tablePickerSize: TablePickerSize;
  tableWithHeaderRow: boolean;
  activeParagraphStyle: ParagraphStyleId;
  activeTextColor: string | undefined;
  activeBgColor: string | undefined;
  activeBulletStyle: ListStyle | null;
  isListActive: boolean;
  isTableActive: boolean;
  customTextColor: string;
  customBgColor: string;
  colorInputRef: React.RefObject<HTMLInputElement | null>;
  bgColorInputRef: React.RefObject<HTMLInputElement | null>;
  textColorPickerRef: React.RefObject<HTMLDivElement | null>;
  bgColorPickerRef: React.RefObject<HTMLDivElement | null>;
  listMenuRef: React.RefObject<HTMLDivElement | null>;
  paragraphMenuRef: React.RefObject<HTMLDivElement | null>;
  tableMenuRef: React.RefObject<HTMLDivElement | null>;
  onToggleTextColorPicker: () => void;
  onToggleBgColorPicker: () => void;
  onToggleListMenu: () => void;
  onToggleParagraphMenu: () => void;
  onToggleTablePicker: () => void;
  onTablePickerHover: (size: TablePickerSize) => void;
  onTableWithHeaderRowChange: (checked: boolean) => void;
  onApplyParagraphStyle: (styleId: ParagraphStyleId) => void;
  onApplyBulletList: (style: ListStyle) => void;
  onApplyOrderedList: () => void;
  onClearListFormat: () => void;
  onInsertTable: (size: TablePickerSize) => void;
  onRemoveTable: () => void;
  onSetLink: () => void;
  onSetImage: () => void;
  onImageFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onApplyTextColor: (color: string) => void;
  onApplyBgColor: (color: string) => void;
  onCustomTextColorChange: (value: string) => void;
  onCustomBgColorChange: (value: string) => void;
  onCustomTextColorApply: () => void;
  onCustomBgColorApply: () => void;
};
