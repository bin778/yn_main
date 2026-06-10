'use client';

import { useId, useState } from 'react';

import { boardHtmlToMarkdown, boardMarkdownToHtml } from '../../lib/boardMarkdown';

import { LEGACY_EDITOR_TAB_ORDER, TAB_LABELS } from './constants';
import type { BoardRichEditorProps } from './types';

type LegacyTab = 'markdown' | 'html';

const LEGACY_MARKDOWN_CONFIRM =
  '마크다운 탭으로 전환하면 인라인 스타일과 레이아웃이 손실될 수 있습니다. 계속하시겠습니까?';

export default function BoardLegacyHtmlEditor({
  value,
  onChange,
  disabled = false,
  onSwitchToRichMode,
}: BoardRichEditorProps) {
  const labelId = useId();
  const [tab, setTab] = useState<LegacyTab>('html');
  const [markdownDraft, setMarkdownDraft] = useState<string | null>(null);

  function emitChange(html: string) {
    onChange(html);
  }

  function handleTabSelect(nextTab: (typeof LEGACY_EDITOR_TAB_ORDER)[number]) {
    if (nextTab === 'default') {
      onSwitchToRichMode?.();
      return;
    }

    if (tab === nextTab) return;

    if (nextTab === 'markdown') {
      if (!window.confirm(LEGACY_MARKDOWN_CONFIRM)) return;
      setMarkdownDraft(boardHtmlToMarkdown(value));
      setTab('markdown');
      return;
    }

    setTab('html');
    setMarkdownDraft(null);
  }

  return (
    <div className="board-rich-editor">
      <p className="mb-2 rounded border border-[#d6e4ff] bg-[#f0f5ff] px-3 py-2 text-xs text-[#1a3151]">
        HTML 모드입니다. 인라인 스타일 보존을 위해 HTML 탭 편집을 권장합니다. 기본 모드로 돌아가려면 아래 「기본」 탭을
        사용하세요.
      </p>

      {tab === 'markdown' && markdownDraft !== null ? (
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
          value={value}
          onChange={event => emitChange(event.target.value)}
          className="board-rich-editor-textarea w-full border border-[#ddd] bg-white px-3 py-2 font-mono text-xs leading-relaxed text-[#333]"
          spellCheck={false}
          placeholder="HTML 코드로 작성하세요…"
        />
      )}

      <div className="flex flex-col gap-1 border border-t-0 border-[#ddd] bg-[#f8f9fb]">
        <div className="px-3 pt-2 text-[10px] leading-relaxed text-[#777]">
          <p className="mb-1 font-medium text-[#555]">주의사항</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>HTML 모드에서는 HTML 탭에서 편집하세요.</li>
            <li>마크다운 탭 전환 시 스타일이 손실될 수 있습니다.</li>
            <li>기본 모드 전환 시 인라인 스타일·레이아웃이 제거되거나 변경될 수 있습니다.</li>
          </ul>
        </div>
        <div className="flex justify-end gap-0">
          {LEGACY_EDITOR_TAB_ORDER.map(tabId => (
            <button
              key={tabId}
              type="button"
              disabled={disabled || (tabId === 'default' && onSwitchToRichMode === undefined)}
              onClick={() => handleTabSelect(tabId)}
              className={`px-4 py-1.5 text-xs font-medium ${
                tabId !== 'default' && tab === tabId
                  ? 'bg-white text-[#1a3151] shadow-sm'
                  : 'text-[#666] hover:text-[#333]'
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
