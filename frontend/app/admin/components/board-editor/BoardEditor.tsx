'use client';

import dynamic from 'next/dynamic';

import '../board-editor.css';

import { useBoardEditor } from './useBoardEditor';
import type { BoardEditorProps } from './types';

const BoardTinyMceEditor = dynamic(() => import('./BoardTinyMceEditor'), { ssr: false });

export default function BoardEditor(props: BoardEditorProps) {
  const { value, contentVersion, onUploadImage } = props;
  const {
    labelId,
    tab,
    htmlDraft,
    setHtmlDraft,
    handleTabSelect,
    handleEditorReady,
    handleEditorChange,
    emitChange,
    disabled,
    TAB_LABELS,
  } = useBoardEditor(props);

  return (
    <div className="board-editor">
      {tab === 'visual' ? (
        <div className="border border-[#ddd] bg-white" aria-labelledby={labelId}>
          <BoardTinyMceEditor
            externalContent={value}
            contentVersion={contentVersion}
            disabled={disabled}
            onUploadImage={onUploadImage}
            onEditorReady={handleEditorReady}
            onEditorChange={handleEditorChange}
          />
        </div>
      ) : (
        <textarea
          id={labelId}
          disabled={disabled}
          value={htmlDraft}
          onChange={event => {
            const nextHtml = event.target.value;
            setHtmlDraft(nextHtml);
            emitChange(nextHtml);
          }}
          className="board-editor-textarea w-full border border-[#ddd] bg-white px-3 py-2 font-mono text-xs leading-relaxed text-[#333]"
          spellCheck={false}
          placeholder="HTML 코드로 작성하세요…"
        />
      )}

      <div className="flex flex-col gap-1 border border-t-0 border-[#ddd] bg-[#f8f9fb]">
        <div className="px-3 pt-2 text-[10px] leading-relaxed text-[#777]">
          <p className="mb-1 font-medium text-[#555]">주의사항</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>기본·HTML 탭을 바꿔도 일부 인라인 스타일·CTA 레이아웃이 변경될 수 있습니다.</li>
            <li>복잡한 HTML은 HTML 탭에서 직접 수정하는 것을 권장합니다.</li>
          </ul>
        </div>
        <div className="flex justify-end gap-0">
          {(['visual', 'html'] as const).map(tabId => (
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
