import { BulletList, OrderedList } from '@tiptap/extension-list';

/** `* `, `- `, `1. ` 입력 시 자동 리스트 변환 비활성화 */
export const BoardBulletList = BulletList.extend({
  addInputRules() {
    return [];
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: 'disc',
        parseHTML: element => element.getAttribute('data-list-style') ?? 'disc',
        renderHTML: attributes => {
          const style = attributes.listStyleType as string;
          if (style === 'circle') {
            return { 'data-list-style': 'circle' };
          }
          return {};
        },
      },
    };
  },
});

export const BoardOrderedList = OrderedList.extend({
  addInputRules() {
    return [];
  },
});
