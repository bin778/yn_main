import type { IAllProps } from '@tinymce/tinymce-react';
import type { Editor as TinyMceEditor } from 'tinymce';

type BoardTinyMceInitOptions = NonNullable<IAllProps['init']>;

import {
  cleanupTypographyInSubtree,
  isBoardTypographyFormat,
  stripTypographyFromBlocks,
} from '../../lib/boardPasteTypographyCleanup';
import { BODY_FONT_SIZES, PARAGRAPH_STYLE_OPTIONS } from '../../lib/boardParagraphStyles';

import { BOARD_EDITOR_MIN_HEIGHT } from './constants';

const VALID_STYLE_PROPERTIES = [
  'color',
  'background-color',
  'background',
  'font-size',
  'font-family',
  'line-height',
  'text-align',
  'font-weight',
  'font-style',
  'letter-spacing',
  'width',
  'min-width',
  'max-width',
  'height',
  'display',
  'flex',
  'flex-direction',
  'align-items',
  'justify-content',
  'gap',
  'box-sizing',
  'vertical-align',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-left',
  'border-right',
  'border-top',
  'border-bottom',
  'border-radius',
  'text-decoration',
].join(',');

const EXTENDED_VALID_ELEMENTS = [
  'p[*]',
  'div[*]',
  'span[*]',
  'a[*]',
  'h1[*]',
  'h2[*]',
  'h3[*]',
  'h4[*]',
  'table[*]',
  'thead[*]',
  'tbody[*]',
  'tfoot[*]',
  'tr[*]',
  'th[*]',
  'td[*]',
  'img[*]',
  'mark[*]',
  'blockquote[*]',
  'hr',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'ul',
  'ol',
  'li[*]',
].join(',');

function buildEditorBodyTypographyCss(): string {
  const { '1': body1, '2': body2, '3': body3 } = BODY_FONT_SIZES;

  return `
      p { line-height: 1.75; margin: 0 0 0.75em; }
      p[data-body='2'], p:not([data-body]) { font-size: ${body2.mobile}; }
      p[data-body='1'] { font-size: ${body1.mobile}; }
      p[data-body='3'] { font-size: ${body3.mobile}; }
      @media (min-width: 768px) {
        p[data-body='2'], p:not([data-body]) { font-size: ${body2.desktop}; }
        p[data-body='1'] { font-size: ${body1.desktop}; }
        p[data-body='3'] { font-size: ${body3.desktop}; }
      }
    `;
}

function buildParagraphStyleFormats() {
  return PARAGRAPH_STYLE_OPTIONS.map(option => {
    if (option.id === 'title1') {
      return { title: option.label, block: 'h2', name: option.id };
    }
    if (option.id === 'title2') {
      return { title: option.label, block: 'h3', name: option.id };
    }
    if (option.id === 'title3') {
      return { title: option.label, block: 'h4', name: option.id };
    }
    const bodyLevel = option.id.replace('body', '');
    return {
      title: option.label,
      block: 'p',
      name: option.id,
      attributes: { 'data-body': bodyLevel },
    };
  });
}

const FORMAT_BLOCK_TAGS = new Set(['h2', 'h3', 'h4', 'p']);

function scheduleTypographyCleanup(editor: TinyMceEditor): void {
  queueMicrotask(() => {
    stripTypographyFromBlocks(editor.selection.getSelectedBlocks());
  });
}

function registerTypographyCleanupHandlers(editor: TinyMceEditor): void {
  editor.on('PastePostProcess', event => {
    cleanupTypographyInSubtree(event.node);
  });

  editor.on('ApplyFormat', event => {
    const formatName = typeof event.format === 'string' ? event.format : '';
    if (!isBoardTypographyFormat(formatName)) return;
    scheduleTypographyCleanup(editor);
  });

  editor.on('ExecCommand', event => {
    if (event.command !== 'FormatBlock') return;
    const tag = String(event.value ?? '').toLowerCase();
    if (!FORMAT_BLOCK_TAGS.has(tag)) return;
    scheduleTypographyCleanup(editor);
  });
}

type CreateBoardTinyMceInitOptions = {
  onUploadImage?: (file: File) => Promise<string>;
};

export function createBoardTinyMceInit({ onUploadImage }: CreateBoardTinyMceInitOptions): BoardTinyMceInitOptions {
  const init: BoardTinyMceInitOptions = {
    base_url: '/tinymce',
    suffix: '.min',
    language: 'ko_KR',
    language_url: '/tinymce/langs/ko_KR.js?v=1',
    menubar: false,
    statusbar: false,
    branding: false,
    promotion: false,
    height: BOARD_EDITOR_MIN_HEIGHT,
    resize: true,
    plugins: ['lists', 'link', 'image', 'table', 'autolink', 'fullscreen'],
    toolbar:
      'undo redo | styles | bold italic underline strikethrough | ' +
      'forecolor backcolor | alignleft aligncenter alignright | ' +
      'bullist numlist | blockquote hr | link image table | fullscreen',
    style_formats: buildParagraphStyleFormats(),
    extended_valid_elements: EXTENDED_VALID_ELEMENTS,
    valid_styles: {
      '*': VALID_STYLE_PROPERTIES,
    },
    paste_webkit_styles: 'color font-weight font-style text-decoration background-color',
    verify_html: false,
    convert_urls: false,
    content_style: `
      body {
        font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: ${BODY_FONT_SIZES['2'].mobile};
        line-height: 1.75;
        color: #333;
        padding: 8px 12px;
      }
      ${buildEditorBodyTypographyCss()}
      img { max-width: 100%; height: auto; }
    `,
    setup: (editor: TinyMceEditor) => {
      editor.on('init', () => {
        editor.getBody().setAttribute('class', 'board-editor-body mce-content-body');
      });
      registerTypographyCleanupHandlers(editor);
    },
  };

  if (onUploadImage) {
    init.images_upload_handler = (blobInfo, progress) =>
      new Promise((resolve, reject) => {
        const file = blobInfo.blob() as File;
        progress(0);
        onUploadImage(file)
          .then(url => {
            progress(100);
            resolve(url);
          })
          .catch(error => {
            reject(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.');
          });
      });
  }

  return init;
}
