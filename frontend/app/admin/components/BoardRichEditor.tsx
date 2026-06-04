'use client';

import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { sanitizeBoardHtml } from '../lib/sanitizeBoardHtml';

import './board-rich-editor.css';

type EditorTab = 'editor' | 'html';

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

function ToolbarButton({ label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-[32px] rounded border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
        active ? 'border-[#1a3151] bg-[#1a3151] text-white' : 'border-[#ddd] bg-white text-[#333] hover:bg-[#f5f7fb]'
      }`}
    >
      {label}
    </button>
  );
}

export default function BoardRichEditor({ value, onChange, disabled = false, onUploadImage }: BoardRichEditorProps) {
  const labelId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<EditorTab>('editor');
  const [htmlDraft, setHtmlDraft] = useState(value);
  const [uploadingImage, setUploadingImage] = useState(false);

  const emitChange = useCallback(
    (html: string) => {
      const cleaned = sanitizeBoardHtml(html);
      onChange(cleaned);
    },
    [onChange],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled && tab === 'editor',
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto' } }),
      Placeholder.configure({ placeholder: '내용을 입력하세요…' }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      if (tab === 'editor') {
        emitChange(ed.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor === null) return;
    editor.setEditable(!disabled && tab === 'editor');
  }, [disabled, editor, tab]);

  useEffect(() => {
    if (editor === null || tab !== 'editor') return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
    }
  }, [editor, tab, value]);

  function switchToHtml() {
    if (editor === null) return;
    const next = editor.getHTML();
    setHtmlDraft(next);
    setTab('html');
    emitChange(next);
  }

  function switchToEditor() {
    const cleaned = sanitizeBoardHtml(htmlDraft);
    setHtmlDraft(cleaned);
    setTab('editor');
    if (editor !== null) {
      editor.commands.setContent(cleaned || '<p></p>', { emitUpdate: false });
    }
    emitChange(cleaned);
  }

  /** 블록 이미지 삽입 후 Gapcursor 때문에 스페이스가 두 번 필요해지는 문제 방지 */
  function insertImageWithParagraphAfter(src: string) {
    if (editor === null) return;
    editor.chain().focus().setImage({ src }).insertContent('<p></p>').focus('end').run();
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
    insertImageWithParagraphAfter(url.trim());
  }

  async function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || editor === null || !onUploadImage) return;

    setUploadingImage(true);
    try {
      const url = await onUploadImage(file);
      insertImageWithParagraphAfter(url);
    } catch (uploadError) {
      window.alert(uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.');
    } finally {
      setUploadingImage(false);
    }
  }

  const toolbarDisabled = disabled || tab === 'html' || editor === null;

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
        <ToolbarButton
          label="H2"
          disabled={toolbarDisabled}
          active={editor?.isActive('heading', { level: 2 }) ?? false}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="H3"
          disabled={toolbarDisabled}
          active={editor?.isActive('heading', { level: 3 }) ?? false}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="본문"
          disabled={toolbarDisabled}
          active={editor?.isActive('paragraph') ?? false}
          onClick={() => editor?.chain().focus().setParagraph().run()}
        />
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
      </div>

      {tab === 'editor' ? (
        <div className="border border-[#ddd] bg-white text-sm text-[#333]" aria-labelledby={labelId}>
          <EditorContent editor={editor} />
        </div>
      ) : (
        <textarea
          id={labelId}
          disabled={disabled}
          rows={16}
          value={htmlDraft}
          onChange={event => {
            setHtmlDraft(event.target.value);
            emitChange(event.target.value);
          }}
          className="w-full border border-[#ddd] bg-white px-3 py-2 font-mono text-xs leading-relaxed text-[#333]"
          spellCheck={false}
        />
      )}

      <div className="flex justify-end gap-0 border border-t-0 border-[#ddd] bg-[#f8f9fb]">
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (tab === 'html') switchToEditor();
          }}
          className={`px-4 py-1.5 text-xs font-medium ${
            tab === 'editor' ? 'bg-white text-[#1a3151] shadow-sm' : 'text-[#666] hover:text-[#333]'
          }`}
        >
          에디터
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (tab === 'editor') switchToHtml();
          }}
          className={`px-4 py-1.5 text-xs font-medium ${
            tab === 'html' ? 'bg-white text-[#1a3151] shadow-sm' : 'text-[#666] hover:text-[#333]'
          }`}
        >
          HTML
        </button>
      </div>
    </div>
  );
}
