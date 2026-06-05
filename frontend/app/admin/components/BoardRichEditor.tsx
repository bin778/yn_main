'use client';

import Color from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';

import { BoardBulletList, BoardOrderedList } from '../lib/boardListExtensions';
import { BoardParagraph } from '../lib/boardParagraphExtension';
import {
  DEFAULT_PARAGRAPH_STYLE,
  PARAGRAPH_STYLE_OPTIONS,
  paragraphStyleLabel,
  type ParagraphStyleId,
} from '../lib/boardParagraphStyles';
import { boardHtmlToMarkdown, boardMarkdownToHtml } from '../lib/boardMarkdown';
import { sanitizeBoardHtml } from '../lib/sanitizeBoardHtml';

import './board-rich-editor.css';

type EditorTab = 'default' | 'markdown' | 'html';

const TAB_LABELS: Record<EditorTab, string> = {
  default: '기본',
  markdown: '마크다운',
  html: 'HTML',
};

const EMPTY_DEFAULT_HTML = '<p data-body="2"></p>';

type BoardRichEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

const PRESET_COLORS = [
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

type ListStyle = 'disc' | 'circle';

type DropdownMenuOptionProps = {
  label: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
};

function DropdownMenuOption({ label, hint, active, disabled, onClick, children }: DropdownMenuOptionProps) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors disabled:opacity-40 ${
        active ? 'bg-[#e8eef5] text-[#1a3151]' : 'text-[#333] hover:bg-[#f5f7fb]'
      }`}
    >
      {children !== undefined && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#333]">{children}</span>
      )}
      <span className="flex-1">{label}</span>
      {hint !== undefined && <span className="shrink-0 text-[10px] text-[#999]">{hint}</span>}
    </button>
  );
}

function toolbarIconButtonClass(active: boolean): string {
  return `flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
    active ? 'border-[#1a3151] bg-[#1a3151] text-white' : 'border-[#ddd] bg-white text-[#333] hover:bg-[#f5f7fb]'
  }`;
}

function ToolbarButton({ label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={toolbarIconButtonClass(active ?? false)}
    >
      {label}
    </button>
  );
}

export default function BoardRichEditor({ value, onChange, disabled = false, onUploadImage }: BoardRichEditorProps) {
  const labelId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<EditorTab>('default');
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [markdownDraft, setMarkdownDraft] = useState(() => boardHtmlToMarkdown(value));
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);
  const [showParagraphMenu, setShowParagraphMenu] = useState(false);
  const [selectionRevision, setSelectionRevision] = useState(0);
  const [customColor, setCustomColor] = useState('#000000');
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const listMenuRef = useRef<HTMLDivElement>(null);
  const paragraphMenuRef = useRef<HTMLDivElement>(null);

  const emitChange = useCallback(
    (html: string) => {
      const cleaned = sanitizeBoardHtml(html);
      onChange(cleaned);
    },
    [onChange],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled && tab === 'default',
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        paragraph: false,
        bulletList: false,
        orderedList: false,
      }),
      BoardParagraph,
      BoardBulletList,
      BoardOrderedList,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Image.configure({ inline: true }),
      Placeholder.configure({ placeholder: '내용을 입력하세요…' }),
    ],
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

  useEffect(() => {
    if (editor === null) return;
    editor.setEditable(!disabled && tab === 'default');
  }, [disabled, editor, tab]);

  useEffect(() => {
    if (editor === null || tab !== 'default') return;
    if (editor.isFocused) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || EMPTY_DEFAULT_HTML, { emitUpdate: false });
    }
  }, [editor, tab, value]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (colorPickerRef.current !== null && !colorPickerRef.current.contains(target)) {
        setShowColorPicker(false);
      }
      if (listMenuRef.current !== null && !listMenuRef.current.contains(target)) {
        setShowListMenu(false);
      }
      if (paragraphMenuRef.current !== null && !paragraphMenuRef.current.contains(target)) {
        setShowParagraphMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function closeToolbarMenus() {
    setShowColorPicker(false);
    setShowListMenu(false);
    setShowParagraphMenu(false);
  }

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
    const cleaned = sanitizeBoardHtml(html);
    closeToolbarMenus();
    setHtmlDraft(cleaned);
    setMarkdownDraft(boardHtmlToMarkdown(cleaned));
    setTab('default');
    if (editor !== null) {
      editor.commands.setContent(cleaned || EMPTY_DEFAULT_HTML, { emitUpdate: false });
    }
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
    if (!insertEditorImage(url.trim())) return;
  }

  async function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || editor === null || !onUploadImage) return;

    setUploadingImage(true);
    try {
      const url = await onUploadImage(file);
      if (!insertEditorImage(url)) {
        return;
      }
    } catch (uploadError) {
      window.alert(uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  }

  function applyColor(color: string) {
    if (editor === null) return;
    if (color === '') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
    setShowColorPicker(false);
  }

  function handleCustomColorApply() {
    applyColor(customColor);
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
    if (editor.isActive('bulletList')) {
      chain.toggleBulletList();
    }
    if (editor.isActive('orderedList')) {
      chain.toggleOrderedList();
    }
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
    // selectionRevision: 커서 이동 시 툴바 라벨 갱신
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectionRevision은 의도적 트리거
  }, [editor, selectionRevision]);
  const activeColor = editor?.getAttributes('textStyle').color as string | undefined;
  const activeBulletStyle = editor?.isActive('bulletList')
    ? ((editor.getAttributes('bulletList').listStyleType as ListStyle | undefined) ?? 'disc')
    : null;
  const isListActive = (editor?.isActive('bulletList') ?? false) || (editor?.isActive('orderedList') ?? false);

  const toolbarDisabled = disabled || tab !== 'default' || editor === null;

  return (
    <div className="board-rich-editor">
      <div
        className="flex flex-wrap gap-1 border border-b-0 border-[#ddd] bg-[#f8f9fb] px-2 py-2"
        role="toolbar"
        aria-label="서식"
      >
        <ToolbarButton
          label="굵게"
          disabled={toolbarDisabled}
          active={editor?.isActive('bold') ?? false}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="기울임"
          disabled={toolbarDisabled}
          active={editor?.isActive('italic') ?? false}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="밑줄"
          disabled={toolbarDisabled}
          active={editor?.isActive('underline') ?? false}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />

        {/* 문단 모양 */}
        <div className="relative" ref={paragraphMenuRef}>
          <button
            type="button"
            disabled={toolbarDisabled}
            onClick={() => {
              setShowParagraphMenu(prev => !prev);
              setShowColorPicker(false);
              setShowListMenu(false);
            }}
            className="flex min-w-[72px] items-center justify-between gap-1 rounded border border-[#ddd] bg-white px-2 py-1 text-xs font-medium text-[#333] transition-colors hover:bg-[#f5f7fb] disabled:opacity-40"
          >
            <span>{paragraphStyleLabel(activeParagraphStyle)}</span>
            <span className="text-[10px] text-[#999]" aria-hidden>
              ▾
            </span>
          </button>

          {showParagraphMenu && (
            <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded border border-[#ddd] bg-white py-1 shadow-xl">
              {PARAGRAPH_STYLE_OPTIONS.map(option => (
                <DropdownMenuOption
                  key={option.id}
                  label={option.label}
                  hint={option.hint}
                  disabled={toolbarDisabled}
                  active={activeParagraphStyle === option.id}
                  onClick={() => applyParagraphStyle(option.id)}
                />
              ))}
            </div>
          )}
        </div>

        <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />
        <ToolbarButton
          label="왼쪽"
          disabled={toolbarDisabled}
          active={editor?.isActive({ textAlign: 'left' }) ?? false}
          onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        />
        <ToolbarButton
          label="가운데"
          disabled={toolbarDisabled}
          active={editor?.isActive({ textAlign: 'center' }) ?? false}
          onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        />
        <ToolbarButton
          label="오른쪽"
          disabled={toolbarDisabled}
          active={editor?.isActive({ textAlign: 'right' }) ?? false}
          onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        />
        <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />

        <div className="flex items-center gap-1">
          {/* 리스트 메뉴 */}
          <div className="relative" ref={listMenuRef}>
            <button
              type="button"
              disabled={toolbarDisabled}
              onClick={() => {
                setShowListMenu(prev => !prev);
                setShowColorPicker(false);
                setShowParagraphMenu(false);
              }}
              aria-pressed={isListActive}
              className={toolbarIconButtonClass(isListActive)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <circle cx="2" cy="3" r="1.2" />
                <rect x="4" y="2.4" width="9" height="1.2" rx="0.6" />
                <circle cx="2" cy="7" r="1.2" />
                <rect x="4" y="6.4" width="9" height="1.2" rx="0.6" />
                <circle cx="2" cy="11" r="1.2" />
                <rect x="4" y="10.4" width="9" height="1.2" rx="0.6" />
              </svg>
              리스트
            </button>

            {showListMenu && (
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded border border-[#ddd] bg-white py-1 shadow-xl">
                <DropdownMenuOption
                  label="글머리 (●)"
                  disabled={toolbarDisabled}
                  active={activeBulletStyle === 'disc'}
                  onClick={() => applyBulletList('disc')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <circle cx="2.5" cy="4" r="1.5" />
                    <rect x="5" y="3.2" width="10" height="1.6" rx="0.8" />
                    <circle cx="2.5" cy="8" r="1.5" />
                    <rect x="5" y="7.2" width="10" height="1.6" rx="0.8" />
                  </svg>
                </DropdownMenuOption>
                <DropdownMenuOption
                  label="글머리 (○)"
                  disabled={toolbarDisabled}
                  active={activeBulletStyle === 'circle'}
                  onClick={() => applyBulletList('circle')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
                    <circle cx="2.5" cy="4" r="1.2" strokeWidth="1.2" />
                    <rect x="5" y="3.2" width="10" height="1.6" rx="0.8" fill="currentColor" stroke="none" />
                    <circle cx="2.5" cy="8" r="1.2" strokeWidth="1.2" />
                    <rect x="5" y="7.2" width="10" height="1.6" rx="0.8" fill="currentColor" stroke="none" />
                  </svg>
                </DropdownMenuOption>
                <DropdownMenuOption
                  label="번호 목록"
                  disabled={toolbarDisabled}
                  active={editor?.isActive('orderedList') ?? false}
                  onClick={applyOrderedList}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <text x="0.5" y="5.5" fontSize="5" fontWeight="600">
                      1
                    </text>
                    <rect x="5" y="3.2" width="10" height="1.6" rx="0.8" />
                    <text x="0.5" y="9.5" fontSize="5" fontWeight="600">
                      2
                    </text>
                    <rect x="5" y="7.2" width="10" height="1.6" rx="0.8" />
                  </svg>
                </DropdownMenuOption>
                <div className="my-1 border-t border-[#eee]" />
                <DropdownMenuOption
                  label="목록 해제"
                  disabled={toolbarDisabled || !isListActive}
                  onClick={clearListFormat}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <rect x="2" y="3.2" width="12" height="1.6" rx="0.8" />
                    <rect x="2" y="7.2" width="12" height="1.6" rx="0.8" />
                    <rect x="2" y="11.2" width="12" height="1.6" rx="0.8" />
                  </svg>
                </DropdownMenuOption>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={toolbarDisabled}
            title="인용"
            aria-pressed={editor?.isActive('blockquote') ?? false}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={toolbarIconButtonClass(editor?.isActive('blockquote') ?? false)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <rect x="1" y="2" width="1.5" height="10" rx="0.5" />
              <rect x="4" y="4" width="9" height="1.2" rx="0.6" />
              <rect x="4" y="7.5" width="7" height="1.2" rx="0.6" />
            </svg>
            인용
          </button>
        </div>

        <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />
        <ToolbarButton
          label="구분선"
          disabled={toolbarDisabled}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        />
        <ToolbarButton label="링크" disabled={toolbarDisabled} onClick={setLink} />
        <ToolbarButton
          label={uploadingImage ? '업로드…' : '이미지'}
          disabled={toolbarDisabled || uploadingImage}
          onClick={setImage}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleImageFileChange}
        />
        <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />

        {/* 글씨 색상 */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            disabled={toolbarDisabled}
            onClick={() => {
              setShowColorPicker(prev => !prev);
              setShowListMenu(false);
              setShowParagraphMenu(false);
            }}
            className="flex items-center gap-1 rounded border border-[#ddd] bg-white px-2 py-1 text-xs font-medium text-[#333] transition-colors hover:bg-[#f5f7fb] disabled:opacity-40"
          >
            <span
              className="inline-block h-3 w-3 rounded-sm border border-[#ccc]"
              style={{ backgroundColor: activeColor ?? 'transparent' }}
            />
            색상
          </button>

          {showColorPicker && (
            <div className="absolute left-0 top-full z-50 mt-1 w-[200px] rounded border border-[#ddd] bg-white p-3 shadow-xl">
              {/* 색상 초기화 */}
              <button
                type="button"
                title="색상 제거"
                onClick={() => applyColor('')}
                className="mb-2 flex w-full items-center gap-2 rounded border border-[#ddd] px-2 py-1 text-xs text-[#555] hover:bg-[#f5f5f5]"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-[#ccc] bg-white text-[10px] font-bold text-[#999]">
                  ✕
                </span>
                색상 제거
              </button>

              {/* 프리셋 팔레트 */}
              <div className="mb-3 grid grid-cols-6 gap-1">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => applyColor(color)}
                    className={`h-7 w-7 rounded border transition-transform hover:scale-110 hover:shadow-md ${
                      activeColor === color ? 'ring-2 ring-[#1a3151] ring-offset-1' : 'border-[#ccc]'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* 직접 입력 */}
              <div className="flex items-center gap-1">
                <input
                  ref={colorInputRef}
                  type="color"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                  className="h-7 w-7 shrink-0 cursor-pointer rounded border border-[#ddd] p-0.5"
                  title="색상 직접 선택"
                />
                <input
                  type="text"
                  value={customColor}
                  maxLength={7}
                  onChange={e => {
                    const val = e.target.value;
                    setCustomColor(val);
                    if (/^#[0-9a-fA-F]{6}$/.test(val) && colorInputRef.current) {
                      colorInputRef.current.value = val;
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCustomColorApply();
                  }}
                  placeholder="#000000"
                  className="min-w-0 flex-1 border border-[#ddd] px-2 py-1 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleCustomColorApply}
                  className="shrink-0 rounded bg-[#1a3151] px-2 py-1 text-xs font-medium text-white hover:bg-[#142640]"
                >
                  적용
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {tab === 'default' ? (
        <div className="border border-[#ddd] bg-white text-sm text-[#333]" aria-labelledby={labelId}>
          <EditorContent editor={editor} />
        </div>
      ) : tab === 'markdown' ? (
        <textarea
          id={labelId}
          disabled={disabled}
          value={markdownDraft}
          onChange={event => {
            const nextMarkdown = event.target.value;
            setMarkdownDraft(nextMarkdown);
            emitChange(boardMarkdownToHtml(nextMarkdown));
          }}
          className="board-rich-editor-textarea w-full border border-[#ddd] bg-white px-3 py-2 font-mono text-xs leading-relaxed text-[#333]"
          spellCheck={false}
          placeholder="마크다운으로 작성하세요…"
        />
      ) : (
        <textarea
          id={labelId}
          disabled={disabled}
          value={htmlDraft}
          onChange={event => {
            setHtmlDraft(event.target.value);
            emitChange(event.target.value);
          }}
          className="board-rich-editor-textarea w-full border border-[#ddd] bg-white px-3 py-2 font-mono text-xs leading-relaxed text-[#333]"
          spellCheck={false}
        />
      )}

      <div className="flex flex-col gap-1 border border-t-0 border-[#ddd] bg-[#f8f9fb]">
        {tab === 'markdown' && (
          <p className="px-3 pt-2 text-[10px] leading-snug text-[#999]">
            색상·문단 단계 등 복잡한 서식은 기본 탭에서 편집하는 것을 권장합니다.
          </p>
        )}
        <div className="flex justify-end gap-0">
          {(['default', 'markdown', 'html'] as const).map(tabId => (
            <button
              key={tabId}
              type="button"
              disabled={disabled}
              onClick={() => handleTabSelect(tabId)}
              className={`px-4 py-1.5 text-xs font-medium ${
                tab === tabId ? 'bg-white text-[#1a3151] shadow-sm' : 'text-[#666] hover:text-[#333]'
              }`}
            >
              {TAB_LABELS[tabId]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
