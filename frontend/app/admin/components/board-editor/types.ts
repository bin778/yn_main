import type { Editor as TinyMceEditor } from 'tinymce';

export type EditorTab = 'visual' | 'html';

export type BoardEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
};

export type BoardTinyMceEditorProps = {
  value: string;
  disabled?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
  onEditorReady: (editor: TinyMceEditor) => void;
  onEditorChange: (html: string) => void;
};
