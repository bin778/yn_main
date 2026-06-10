'use client';

import BoardLegacyHtmlEditor from './board-rich-editor/BoardLegacyHtmlEditor';
import BoardRichTipTapEditor from './board-rich-editor/BoardRichTipTapEditor';
import BoardTipTapErrorBoundary from './board-rich-editor/BoardTipTapErrorBoundary';

import type { BoardRichEditorProps } from './board-rich-editor/types';

export default function BoardRichEditor({
  contentMode = 'rich',
  onForceLegacyMode,
  onSwitchToRichMode,
  ...props
}: BoardRichEditorProps) {
  if (contentMode === 'legacy_html') {
    return <BoardLegacyHtmlEditor {...props} onSwitchToRichMode={onSwitchToRichMode} />;
  }

  return (
    <BoardTipTapErrorBoundary onForceLegacyMode={onForceLegacyMode ?? (() => undefined)}>
      <BoardRichTipTapEditor {...props} />
    </BoardTipTapErrorBoundary>
  );
}
