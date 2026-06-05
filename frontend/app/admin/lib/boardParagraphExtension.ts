import Paragraph from '@tiptap/extension-paragraph';

import type { BodyLevel } from './boardParagraphStyles';

/** 본문 단계 — `data-body` 속성 (기본값 2 = 본문2, 15px) */
export const BoardParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      bodyLevel: {
        default: '2' as BodyLevel,
        keepOnSplit: true,
        parseHTML: element => {
          const value = element.getAttribute('data-body');
          if (value === '1' || value === '2' || value === '3') {
            return value;
          }
          return '2';
        },
        renderHTML: attributes => ({
          'data-body': attributes.bodyLevel as BodyLevel,
        }),
      },
    };
  },
});
