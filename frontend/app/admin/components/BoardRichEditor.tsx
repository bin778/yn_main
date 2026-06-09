'use client';

import { EditorContent } from '@tiptap/react';

import { boardMarkdownToHtml } from '../lib/boardMarkdown';

import BoardRichEditorToolbar from './board-rich-editor/BoardRichEditorToolbar';
import { TAB_LABELS } from './board-rich-editor/constants';
import type { BoardRichEditorProps } from './board-rich-editor/types';
import { useBoardRichEditor } from './board-rich-editor/useBoardRichEditor';

import './board-rich-editor.css';

export default function BoardRichEditor({
  value,
  onChange,
  contentMode = 'rich',
  disabled = false,
  onUploadImage,
}: BoardRichEditorProps) {
  const state = useBoardRichEditor({ value, onChange, contentMode, disabled, onUploadImage });
  const {
    editor,
    labelId,
    tab,
    htmlDraft,
    markdownDraft,
    setHtmlDraft,
    setMarkdownDraft,
    emitChange,
    handleTabSelect,
  } = state;

  return (
    <div className="board-rich-editor">
      {contentMode === 'legacy_html' && (
        <p className="mb-2 rounded border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-2 text-xs text-[#1a3151]">
          레거시 HTML 모드입니다. 인라인 스타일 보존을 위해 HTML 탭 편집을 권장합니다.
        </p>
      )}
      <BoardRichEditorToolbar state={state} />

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
          placeholder="HTML 코드로 작성하세요…"
        />
      )}

      <div className="flex flex-col gap-1 border border-t-0 border-[#ddd] bg-[#f8f9fb]">
        <div className="px-3 pt-2 text-[10px] leading-relaxed text-[#777]">
          <p className="mb-1 font-medium text-[#555]">주의사항</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>
              기본·마크다운·HTML 작성 모드를 바꾸면 글자색, 배경색, 문단 스타일 등 일부 서식이 초기화될 수 있습니다.
            </li>
            <li>글자색·배경색·문단 모양 등 서식은 기본 모드에서 편집하는 것을 권장합니다.</li>
            {contentMode === 'legacy_html' && (
              <li>
                레거시 HTML 모드에서는 HTML 탭에서 편집하세요. 기본·마크다운 탭 전환 시 스타일이 손실될 수 있습니다.
              </li>
            )}
          </ul>
        </div>
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
