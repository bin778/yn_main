'use client';

import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMceEditor } from 'tinymce';
import { useEffect, useMemo, useRef, useState } from 'react';

import { createBoardTinyMceInit } from './boardTinyMceInit';
import type { BoardTinyMceEditorProps } from './types';

export default function BoardTinyMceEditor({
  externalContent,
  contentVersion,
  disabled = false,
  onUploadImage,
  onEditorReady,
  onEditorChange,
}: BoardTinyMceEditorProps) {
  const editorRef = useRef<TinyMceEditor | null>(null);
  const [initialContent] = useState(() => externalContent);

  const init = useMemo(() => createBoardTinyMceInit({ onUploadImage }), [onUploadImage]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor === null) return;
    editor.mode.set(disabled ? 'readonly' : 'design');
  }, [disabled]);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor === null) return;
    if (contentVersion === 0) return;

    editor.setContent(externalContent || '');
  }, [contentVersion, externalContent]);

  return (
    <Editor
      licenseKey="gpl"
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      disabled={disabled}
      initialValue={initialContent}
      init={init}
      onInit={(_event, editor) => {
        editorRef.current = editor;
        onEditorReady(editor);
      }}
      onEditorChange={(_html, editor) => {
        onEditorChange(editor.getContent());
        editorRef.current = editor;
      }}
    />
  );
}
