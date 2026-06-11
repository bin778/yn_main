import type { Editor as TinyMceEditor } from 'tinymce';

export type EditorTab = 'visual' | 'html';

export type BoardEditorProps = {
  value: string;
  contentVersion: number;
  onChange: (html: string) => void;
  onSyncContent: (html: string) => void;
  disabled?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
};

export type BoardTinyMceEditorProps = {
  externalContent: string;
  contentVersion: number;
  disabled?: boolean;
  onUploadImage?: (file: File) => Promise<string>;
  onEditorReady: (editor: TinyMceEditor) => void;
  onEditorChange: (html: string) => void;
};
