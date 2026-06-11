'use client';

import type { Editor as TinyMceEditor } from 'tinymce';
import { useCallback, useId, useRef, useState } from 'react';

import { sanitizeContentForEditor } from '../../lib/boardContentSanitize';

import { HTML_TAB_LEAVE_CONFIRM, TAB_LABELS } from './constants';
import type { BoardEditorProps, EditorTab } from './types';

export function useBoardEditor({ value, onChange, disabled = false }: BoardEditorProps) {
  const labelId = useId();
  const editorRef = useRef<TinyMceEditor | null>(null);
  const [tab, setTab] = useState<EditorTab>('visual');
  const [htmlDraft, setHtmlDraft] = useState(value);

  const emitChange = useCallback(
    (html: string) => {
      onChange(sanitizeContentForEditor(html));
    },
    [onChange],
  );

  const handleEditorReady = useCallback((editor: TinyMceEditor) => {
    editorRef.current = editor;
  }, []);

  const handleEditorChange = useCallback(
    (html: string) => {
      setHtmlDraft(html);
      emitChange(html);
    },
    [emitChange],
  );

  function resolveHtmlFromTab(sourceTab: EditorTab): string {
    if (sourceTab === 'visual' && editorRef.current !== null) {
      return editorRef.current.getContent();
    }
    if (sourceTab === 'html') {
      return htmlDraft;
    }
    return value;
  }

  function switchToVisual() {
    const html = resolveHtmlFromTab(tab);
    setHtmlDraft(html);
    if (editorRef.current !== null) {
      editorRef.current.setContent(html);
    }
    setTab('visual');
    emitChange(html);
  }

  function switchToHtml() {
    const html = resolveHtmlFromTab(tab);
    setHtmlDraft(html);
    setTab('html');
    emitChange(html);
  }

  function handleTabSelect(nextTab: EditorTab) {
    if (tab === nextTab) return;

    if (tab === 'html' && nextTab === 'visual') {
      if (!window.confirm(HTML_TAB_LEAVE_CONFIRM)) return;
    }

    if (nextTab === 'visual') {
      switchToVisual();
      return;
    }
    switchToHtml();
  }

  return {
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
  };
}

export type BoardEditorState = ReturnType<typeof useBoardEditor>;
