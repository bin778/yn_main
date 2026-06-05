import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';

import { BoardBulletList, BoardOrderedList } from '../../lib/boardListExtensions';
import { BoardParagraph } from '../../lib/boardParagraphExtension';

export function createBoardEditorExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      paragraph: false,
      bulletList: false,
      orderedList: false,
    }),
    BoardParagraph,
    BoardBulletList,
    BoardOrderedList,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Image.configure({ inline: true }),
    Placeholder.configure({ placeholder: '내용을 입력하세요…' }),
  ];
}
