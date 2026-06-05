'use client';

import { useEditor } from '@tiptap/react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { useClickOutside } from '../../hooks/useClickOutside';
import { boardHtmlToMarkdown, boardMarkdownToHtml } from '../../lib/boardMarkdown';
import { DEFAULT_PARAGRAPH_STYLE, type ParagraphStyleId } from '../../lib/boardParagraphStyles';
import { sanitizeBoardHtml } from '../../lib/sanitizeBoardHtml';

import { DEFAULT_HIGHLIGHT_COLOR, EMPTY_DEFAULT_HTML, TABLE_PICKER_DEFAULT } from './constants';
import { createBoardEditorExtensions } from './createBoardEditorExtensions';
import type { BoardRichEditorProps, EditorTab, ListStyle, TablePickerSize } from './types';

export function useBoardRichEditor({ value, onChange, disabled = false, onUploadImage }: BoardRichEditorProps) {
  const labelId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const textColorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);
  const listMenuRef = useRef<HTMLDivElement>(null);
  const paragraphMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<EditorTab>('default');
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [markdownDraft, setMarkdownDraft] = useState(() => boardHtmlToMarkdown(value));
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);
  const [showParagraphMenu, setShowParagraphMenu] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tablePickerSize, setTablePickerSize] = useState<TablePickerSize>(TABLE_PICKER_DEFAULT);
  const [tableWithHeaderRow, setTableWithHeaderRow] = useState(true);
  const [selectionRevision, setSelectionRevision] = useState(0);
  const [customTextColor, setCustomTextColor] = useState('#000000');
  const [customBgColor, setCustomBgColor] = useState(DEFAULT_HIGHLIGHT_COLOR);

  const emitChange = useCallback(
    (html: string) => {
      onChange(sanitizeBoardHtml(html));
    },
    [onChange],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled && tab === 'default',
    extensions: createBoardEditorExtensions(),
    content: value,
    onUpdate: ({ editor: ed }) => {
      if (tab === 'default') {
        emitChange(ed.getHTML());
      }
    },
    onSelectionUpdate: () => {
      setSelectionRevision(revision => revision + 1);
    },
  });

  const applyHtmlToEditor = useCallback(
    (html: string) => {
      if (editor === null) return '';
      const cleaned = sanitizeBoardHtml(html);
      editor.commands.setContent(cleaned || EMPTY_DEFAULT_HTML, { emitUpdate: false });
      editor.commands.fixTables();
      return cleaned;
    },
    [editor],
  );

  useEffect(() => {
    if (editor === null) return;
    editor.setEditable(!disabled && tab === 'default');
  }, [disabled, editor, tab]);

  useEffect(() => {
    if (editor === null || tab !== 'default') return;
    if (editor.isFocused) return;
    const current = sanitizeBoardHtml(editor.getHTML());
    const next = sanitizeBoardHtml(value);
    if (current !== next) {
      applyHtmlToEditor(value);
    }
  }, [applyHtmlToEditor, editor, tab, value]);

  const closeToolbarMenus = useCallback(() => {
    setShowTextColorPicker(false);
    setShowBgColorPicker(false);
    setShowListMenu(false);
    setShowParagraphMenu(false);
    setShowTablePicker(false);
    setTablePickerSize(TABLE_PICKER_DEFAULT);
  }, []);

  useClickOutside(
    [textColorPickerRef, bgColorPickerRef, listMenuRef, paragraphMenuRef, tableMenuRef],
    closeToolbarMenus,
    true,
  );

  function resolveHtmlFromTab(sourceTab: EditorTab): string {
    if (sourceTab === 'default' && editor !== null) {
      return editor.getHTML();
    }
    if (sourceTab === 'html') {
      return sanitizeBoardHtml(htmlDraft);
    }
    if (sourceTab === 'markdown') {
      return boardMarkdownToHtml(markdownDraft);
    }
    return value;
  }

  function switchToDefault() {
    const html = resolveHtmlFromTab(tab);
    const cleaned = applyHtmlToEditor(sanitizeBoardHtml(html));
    closeToolbarMenus();
    setHtmlDraft(cleaned);
    setMarkdownDraft(boardHtmlToMarkdown(cleaned));
    setTab('default');
    emitChange(cleaned);
  }

  function switchToMarkdown() {
    const html = resolveHtmlFromTab(tab);
    const cleaned = sanitizeBoardHtml(html);
    closeToolbarMenus();
    setHtmlDraft(cleaned);
    setMarkdownDraft(boardHtmlToMarkdown(cleaned));
    setTab('markdown');
    emitChange(cleaned);
  }

  function switchToHtml() {
    const html = resolveHtmlFromTab(tab);
    const cleaned = sanitizeBoardHtml(html);
    closeToolbarMenus();
    setHtmlDraft(cleaned);
    setMarkdownDraft(boardHtmlToMarkdown(cleaned));
    setTab('html');
    emitChange(cleaned);
  }

  function handleTabSelect(nextTab: EditorTab) {
    if (tab === nextTab) return;
    if (nextTab === 'default') switchToDefault();
    else if (nextTab === 'markdown') switchToMarkdown();
    else switchToHtml();
  }

  function insertEditorImage(src: string): boolean {
    if (editor === null) return false;
    const trimmed = src.trim();
    if (trimmed === '') return false;
    const ok = editor.chain().focus().setImage({ src: trimmed }).run();
    if (!ok) {
      window.alert('이미지를 본문에 넣지 못했습니다. 다시 시도해 주세요.');
    }
    return ok;
  }

  function setLink() {
    if (editor === null) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('링크 URL', previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  function setImage() {
    if (editor === null || disabled) return;
    if (onUploadImage) {
      imageInputRef.current?.click();
      return;
    }
    const url = window.prompt('이미지 URL', 'https://');
    if (url === null || url.trim() === '') return;
    insertEditorImage(url.trim());
  }

  async function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || editor === null || !onUploadImage) return;

    setUploadingImage(true);
    try {
      const url = await onUploadImage(file);
      insertEditorImage(url);
    } catch (uploadError) {
      window.alert(uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  }

  function applyTextColor(color: string) {
    if (editor === null) return;
    if (color === '') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setShowTextColorPicker(false);
  }

  function applyBgColor(color: string) {
    if (editor === null) return;
    if (color === '') {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
    setShowBgColorPicker(false);
  }

  function insertBoardTable({ rows, cols }: TablePickerSize) {
    if (editor === null) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: tableWithHeaderRow }).run();
    closeToolbarMenus();
  }

  function removeBoardTable() {
    if (editor === null) return;
    editor.chain().focus().deleteTable().run();
  }

  function applyBulletList(style: ListStyle) {
    if (editor === null) return;
    const chain = editor.chain().focus();
    if (editor.isActive('orderedList')) {
      chain.toggleOrderedList();
    }
    if (editor.isActive('bulletList')) {
      const current = (editor.getAttributes('bulletList').listStyleType as ListStyle | undefined) ?? 'disc';
      if (current === style) {
        chain.toggleBulletList().run();
      } else {
        chain.updateAttributes('bulletList', { listStyleType: style }).run();
      }
    } else {
      chain.toggleBulletList().updateAttributes('bulletList', { listStyleType: style }).run();
    }
    setShowListMenu(false);
  }

  function applyOrderedList() {
    if (editor === null) return;
    const chain = editor.chain().focus();
    if (editor.isActive('bulletList')) {
      chain.toggleBulletList();
    }
    chain.toggleOrderedList().run();
    setShowListMenu(false);
  }

  function clearListFormat() {
    if (editor === null) return;
    const chain = editor.chain().focus();
    if (editor.isActive('bulletList')) chain.toggleBulletList();
    if (editor.isActive('orderedList')) chain.toggleOrderedList();
    chain.run();
    setShowListMenu(false);
  }

  function applyParagraphStyle(styleId: ParagraphStyleId) {
    if (editor === null) return;
    const chain = editor.chain().focus();
    switch (styleId) {
      case 'title1':
        chain.setHeading({ level: 2 }).run();
        break;
      case 'title2':
        chain.setHeading({ level: 3 }).run();
        break;
      case 'title3':
        chain.setHeading({ level: 4 }).run();
        break;
      case 'body1':
      case 'body2':
      case 'body3': {
        const bodyLevel = styleId === 'body1' ? '1' : styleId === 'body3' ? '3' : '2';
        if (editor.isActive('heading')) {
          chain.setParagraph().updateAttributes('paragraph', { bodyLevel }).run();
        } else {
          chain.updateAttributes('paragraph', { bodyLevel }).run();
        }
        break;
      }
    }
    setShowParagraphMenu(false);
  }

  const activeParagraphStyle = useMemo((): ParagraphStyleId => {
    if (editor === null) return DEFAULT_PARAGRAPH_STYLE;
    if (editor.isActive('heading', { level: 2 })) return 'title1';
    if (editor.isActive('heading', { level: 3 })) return 'title2';
    if (editor.isActive('heading', { level: 4 })) return 'title3';
    if (editor.isActive('paragraph')) {
      const level = editor.getAttributes('paragraph').bodyLevel as string | undefined;
      if (level === '1') return 'body1';
      if (level === '3') return 'body3';
      return 'body2';
    }
    return DEFAULT_PARAGRAPH_STYLE;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectionRevision: 커서 이동 시 툴바 라벨 갱신
  }, [editor, selectionRevision]);

  const activeTextColor = editor?.getAttributes('textStyle').color as string | undefined;
  const activeBgColor = editor?.getAttributes('highlight').color as string | undefined;
  const activeBulletStyle = editor?.isActive('bulletList')
    ? ((editor.getAttributes('bulletList').listStyleType as ListStyle | undefined) ?? 'disc')
    : null;
  const isListActive = (editor?.isActive('bulletList') ?? false) || (editor?.isActive('orderedList') ?? false);
  const isTableActive = editor?.isActive('table') ?? false;
  const toolbarDisabled = disabled || tab !== 'default' || editor === null;

  function toggleParagraphMenu() {
    setShowParagraphMenu(prev => !prev);
    setShowTextColorPicker(false);
    setShowBgColorPicker(false);
    setShowListMenu(false);
    setShowTablePicker(false);
  }

  function toggleListMenu() {
    setShowListMenu(prev => !prev);
    setShowTextColorPicker(false);
    setShowBgColorPicker(false);
    setShowParagraphMenu(false);
    setShowTablePicker(false);
  }

  function toggleTablePicker() {
    setShowTablePicker(prev => !prev);
    setShowTextColorPicker(false);
    setShowBgColorPicker(false);
    setShowListMenu(false);
    setShowParagraphMenu(false);
  }

  function toggleTextColorPicker() {
    setShowTextColorPicker(prev => !prev);
    setShowBgColorPicker(false);
    setShowListMenu(false);
    setShowParagraphMenu(false);
    setShowTablePicker(false);
  }

  function toggleBgColorPicker() {
    setShowBgColorPicker(prev => !prev);
    setShowTextColorPicker(false);
    setShowListMenu(false);
    setShowParagraphMenu(false);
    setShowTablePicker(false);
  }

  function handleCustomTextColorChange(value: string) {
    setCustomTextColor(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value) && colorInputRef.current) {
      colorInputRef.current.value = value;
    }
  }

  function handleCustomBgColorChange(value: string) {
    setCustomBgColor(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value) && bgColorInputRef.current) {
      bgColorInputRef.current.value = value;
    }
  }

  return {
    editor,
    labelId,
    tab,
    htmlDraft,
    markdownDraft,
    setHtmlDraft,
    setMarkdownDraft,
    uploadingImage,
    toolbarDisabled,
    activeParagraphStyle,
    activeTextColor,
    activeBgColor,
    activeBulletStyle,
    isListActive,
    isTableActive,
    showTextColorPicker,
    showBgColorPicker,
    showListMenu,
    showParagraphMenu,
    showTablePicker,
    tablePickerSize,
    tableWithHeaderRow,
    customTextColor,
    customBgColor,
    imageInputRef,
    colorInputRef,
    bgColorInputRef,
    textColorPickerRef,
    bgColorPickerRef,
    listMenuRef,
    paragraphMenuRef,
    tableMenuRef,
    emitChange,
    handleTabSelect,
    handleImageFileChange,
    applyTextColor,
    applyBgColor,
    applyParagraphStyle,
    applyBulletList,
    applyOrderedList,
    clearListFormat,
    insertBoardTable,
    removeBoardTable,
    setLink,
    setImage,
    setTablePickerSize,
    setTableWithHeaderRow,
    handleCustomTextColorChange,
    handleCustomBgColorChange,
    toggleParagraphMenu,
    toggleListMenu,
    toggleTablePicker,
    toggleTextColorPicker,
    toggleBgColorPicker,
  };
}

export type BoardRichEditorState = ReturnType<typeof useBoardRichEditor>;
