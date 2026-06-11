'use client';

import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMceEditor } from 'tinymce';
import { useEffect, useMemo, useRef } from 'react';

import { createBoardTinyMceInit } from './boardTinyMceInit';
import type { BoardTinyMceEditorProps } from './types';

export default function BoardTinyMceEditor({
  value,
  disabled = false,
  onUploadImage,
  onEditorReady,
  onEditorChange,
}: BoardTinyMceEditorProps) {
  const editorRef = useRef<TinyMceEditor | null>(null);
  const lastEmittedRef = useRef(value);

  const init = useMemo(() => createBoardTinyMceInit({ onUploadImage }), [onUploadImage]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor === null) return;
    editor.mode.set(disabled ? 'readonly' : 'design');
  }, [disabled]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor === null) return;
    if (value === lastEmittedRef.current) return;
    if (editor.getContent() === value) return;
    editor.setContent(value || '');
    lastEmittedRef.current = value;
  }, [value]);

  return (
    <Editor
      licenseKey="gpl"
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      disabled={disabled}
      value={value}
      init={init}
      onInit={(_event, editor) => {
        editorRef.current = editor;
        onEditorReady(editor);
        lastEmittedRef.current = editor.getContent();
      }}
      onEditorChange={(html, editor) => {
        lastEmittedRef.current = html;
        onEditorChange(html);
        if (editorRef.current === null) {
          editorRef.current = editor;
        }
      }}
    />
  );
}
