'use client';

import { useEditor } from '@tiptap/react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';

import { useClickOutside } from '../../hooks/useClickOutside';
import { boardHtmlToMarkdown, boardMarkdownToHtml } from '../../lib/boardMarkdown';
import { DEFAULT_PARAGRAPH_STYLE, type ParagraphStyleId } from '../../lib/boardParagraphStyles';
import { sanitizeBoardHtml } from '../../lib/sanitizeBoardHtml';

import { DEFAULT_HIGHLIGHT_COLOR, EMPTY_DEFAULT_HTML, HTML_TAB_LEAVE_CONFIRM, TABLE_PICKER_DEFAULT } from './constants';
import { createBoardEditorExtensions } from './createBoardEditorExtensions';
import type { BoardRichEditorProps, EditorTab, ListStyle, TablePickerSize } from './types';

type UseBoardRichEditorOptions = Omit<BoardRichEditorProps, 'contentMode'>;

export function useBoardRichEditor({
  value,
  onChange,
  disabled = false,
  onUploadImage,
  onForceLegacyMode,
}: UseBoardRichEditorOptions) {
  const labelId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const textColorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);
  const listMenuRef = useRef<HTMLDivElement>(null);
  const paragraphMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);

  // 렌더마다 최신 함수를 ref에 저장 (stale closure 방지)
  const onForceLegacyModeRef = useRef(onForceLegacyMode);
  useEffect(() => {
    onForceLegacyModeRef.current = onForceLegacyMode;
  });

  // TipTap 본문 최초 로드 여부 (ref — 상태 변화 없이 효과만 제어)
  const contentInitializedRef = useRef(false);

  const [tab, setTab] = useState<EditorTab>('default');
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [markdownDraft, setMarkdownDraft] = useState('');
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

  // TipTap은 항상 빈 콘텐츠로 초기화.
  // 실제 본문 로드는 아래 useEffect에서 try/catch로 수행한다.
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: createBoardEditorExtensions(),
    content: EMPTY_DEFAULT_HTML,
    onUpdate: ({ editor: ed }) => {
      // 본문이 아직 로드되지 않았으면 빈 콘텐츠를 상위로 전파하지 않는다
      if (tab === 'default' && contentInitializedRef.current) {
        emitChange(ed.getHTML());
      }
    },
    onSelectionUpdate: () => {
      setSelectionRevision(revision => revision + 1);
    },
  });

  // 에디터가 준비된 뒤 실제 본문을 안전하게 로드한다.
  // ProseMirror의 DOM insertBefore 오류는 setContent 내부에서 동기 throw되므로 try/catch로 잡는다.
  // Error Boundary는 useEffect 내 오류를 잡지 못하기 때문에 이 방식이 유일한 방어선이다.
  useEffect(() => {
    if (editor === null || contentInitializedRef.current) return;
    contentInitializedRef.current = true;

    const cleaned = sanitizeBoardHtml(value);
    try {
      editor.commands.setContent(cleaned || EMPTY_DEFAULT_HTML, { emitUpdate: false });
      editor.setEditable(!disabled && tab === 'default');
    } catch (loadError) {
      console.error('TipTap 본문 로드 실패 — 레거시 HTML 모드로 전환합니다.', loadError);
      onForceLegacyModeRef.current?.();
    }
    // editor가 준비됐을 때 1회만 실행한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    if (editor === null || !contentInitializedRef.current) return;
    editor.setEditable(!disabled && tab === 'default');
  }, [disabled, editor, tab]);

  const applyHtmlToEditor = useCallback(
    (html: string): string => {
      if (editor === null) return '';
      const cleaned = sanitizeBoardHtml(html);
      try {
        editor.commands.setContent(cleaned || EMPTY_DEFAULT_HTML, { emitUpdate: false });
        editor.commands.fixTables();
      } catch (applyError) {
        console.error('TipTap 본문 업데이트 실패 — 레거시 HTML 모드로 전환합니다.', applyError);
        onForceLegacyModeRef.current?.();
        return '';
      }
      return cleaned;
    },
    [editor],
  );

  useEffect(() => {
    if (editor === null || !contentInitializedRef.current || tab !== 'default') return;
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
      return htmlDraft;
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

    if (tab === 'html' && (nextTab === 'default' || nextTab === 'markdown')) {
      if (!window.confirm(HTML_TAB_LEAVE_CONFIRM)) return;
    }

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

  function handleCustomTextColorChange(inputValue: string) {
    setCustomTextColor(inputValue);
    if (/^#[0-9a-fA-F]{6}$/.test(inputValue) && colorInputRef.current) {
      colorInputRef.current.value = inputValue;
    }
  }

  function handleCustomBgColorChange(inputValue: string) {
    setCustomBgColor(inputValue);
    if (/^#[0-9a-fA-F]{6}$/.test(inputValue) && bgColorInputRef.current) {
      bgColorInputRef.current.value = inputValue;
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
