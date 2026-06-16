import type { IAllProps } from '@tinymce/tinymce-react';
import type { Editor as TinyMceEditor } from 'tinymce';

type BoardTinyMceInitOptions = NonNullable<IAllProps['init']>;

import { PARAGRAPH_STYLE_OPTIONS } from '../../lib/boardParagraphStyles';

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

function buildParagraphStyleFormats() {
  return PARAGRAPH_STYLE_OPTIONS.map(option => {
    if (option.id === 'title1') {
      return { title: option.label, block: 'h2' };
    }
    if (option.id === 'title2') {
      return { title: option.label, block: 'h3' };
    }
    if (option.id === 'title3') {
      return { title: option.label, block: 'h4' };
    }
    const bodyLevel = option.id.replace('body', '');
    return {
      title: option.label,
      block: 'p',
      attributes: { 'data-body': bodyLevel },
    };
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
      'undo redo | blocks styles | bold italic underline strikethrough | ' +
      'forecolor backcolor | alignleft aligncenter alignright | ' +
      'bullist numlist | blockquote hr | link image table | fullscreen',
    block_formats: '제목1=h2;제목2=h3;제목3=h4;본문=p',
    style_formats: buildParagraphStyleFormats(),
    extended_valid_elements: EXTENDED_VALID_ELEMENTS,
    valid_styles: {
      '*': VALID_STYLE_PROPERTIES,
    },
    paste_webkit_styles: 'all',
    verify_html: false,
    convert_urls: false,
    content_style: `
      body {
        font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        line-height: 1.75;
        color: #333;
        padding: 8px 12px;
      }
      img { max-width: 100%; height: auto; }
    `,
    setup: (editor: TinyMceEditor) => {
      editor.on('init', () => {
        editor.getBody().setAttribute('class', 'board-editor-body mce-content-body');
      });
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
