import { PARAGRAPH_STYLE_OPTIONS, paragraphStyleLabel } from '../../lib/boardParagraphStyles';

import ColorPickerDropdown from './ColorPickerDropdown';
import DropdownMenuOption from './DropdownMenuOption';
import TableInsertPicker from './TableInsertPicker';
import ToolbarButton, { toolbarIconButtonClass } from './ToolbarButton';
import { DEFAULT_HIGHLIGHT_COLOR, PRESET_HIGHLIGHT_COLORS, PRESET_TEXT_COLORS } from './constants';
import type { BoardRichEditorState } from './useBoardRichEditor';

type BoardRichEditorToolbarProps = {
  state: BoardRichEditorState;
};

export default function BoardRichEditorToolbar({ state }: BoardRichEditorToolbarProps) {
  const {
    editor,
    toolbarDisabled,
    uploadingImage,
    activeParagraphStyle,
    activeTextColor,
    activeBgColor,
    activeBulletStyle,
    isListActive,
    isTableActive,
    showTextColorPicker,
    showBgColorPicker,
    showListMenu,
    showParagraphMenu,
    showTablePicker,
    tablePickerSize,
    tableWithHeaderRow,
    customTextColor,
    customBgColor,
    imageInputRef,
    colorInputRef,
    bgColorInputRef,
    textColorPickerRef,
    bgColorPickerRef,
    listMenuRef,
    paragraphMenuRef,
    tableMenuRef,
    applyTextColor,
    applyBgColor,
    applyParagraphStyle,
    applyBulletList,
    applyOrderedList,
    clearListFormat,
    insertBoardTable,
    removeBoardTable,
    setLink,
    setImage,
    setTablePickerSize,
    setTableWithHeaderRow,
    handleImageFileChange,
    handleCustomTextColorChange,
    handleCustomBgColorChange,
    toggleParagraphMenu,
    toggleListMenu,
    toggleTablePicker,
    toggleTextColorPicker,
    toggleBgColorPicker,
  } = state;

  return (
    <div
      className="flex flex-wrap gap-1 border border-b-0 border-[#ddd] bg-[#f8f9fb] px-2 py-2"
      role="toolbar"
      aria-label="서식"
    >
      <ToolbarButton
        label="굵게"
        disabled={toolbarDisabled}
        active={editor?.isActive('bold') ?? false}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="기울임"
        disabled={toolbarDisabled}
        active={editor?.isActive('italic') ?? false}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="밑줄"
        disabled={toolbarDisabled}
        active={editor?.isActive('underline') ?? false}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        label="취소선"
        disabled={toolbarDisabled}
        active={editor?.isActive('strike') ?? false}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
      />
      <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />

      <div className="relative" ref={paragraphMenuRef}>
        <button
          type="button"
          disabled={toolbarDisabled}
          onClick={toggleParagraphMenu}
          className="flex min-w-[72px] items-center justify-between gap-1 rounded border border-[#ddd] bg-white px-2 py-1 text-xs font-medium text-[#333] transition-colors hover:bg-[#f5f7fb] disabled:opacity-40"
        >
          <span>{paragraphStyleLabel(activeParagraphStyle)}</span>
          <span className="text-[10px] text-[#999]" aria-hidden>
            ▾
          </span>
        </button>

        {showParagraphMenu && (
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded border border-[#ddd] bg-white py-1 shadow-xl">
            {PARAGRAPH_STYLE_OPTIONS.map(option => (
              <DropdownMenuOption
                key={option.id}
                label={option.label}
                hint={option.hint}
                disabled={toolbarDisabled}
                active={activeParagraphStyle === option.id}
                onClick={() => applyParagraphStyle(option.id)}
              />
            ))}
          </div>
        )}
      </div>

      <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />
      <ToolbarButton
        label="왼쪽"
        disabled={toolbarDisabled}
        active={editor?.isActive({ textAlign: 'left' }) ?? false}
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
      />
      <ToolbarButton
        label="가운데"
        disabled={toolbarDisabled}
        active={editor?.isActive({ textAlign: 'center' }) ?? false}
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
      />
      <ToolbarButton
        label="오른쪽"
        disabled={toolbarDisabled}
        active={editor?.isActive({ textAlign: 'right' }) ?? false}
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
      />
      <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />

      <div className="flex items-center gap-1">
        <div className="relative" ref={listMenuRef}>
          <button
            type="button"
            disabled={toolbarDisabled}
            onClick={toggleListMenu}
            aria-pressed={isListActive}
            className={toolbarIconButtonClass(isListActive)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <circle cx="2" cy="3" r="1.2" />
              <rect x="4" y="2.4" width="9" height="1.2" rx="0.6" />
              <circle cx="2" cy="7" r="1.2" />
              <rect x="4" y="6.4" width="9" height="1.2" rx="0.6" />
              <circle cx="2" cy="11" r="1.2" />
              <rect x="4" y="10.4" width="9" height="1.2" rx="0.6" />
            </svg>
            리스트
          </button>

          {showListMenu && (
            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded border border-[#ddd] bg-white py-1 shadow-xl">
              <DropdownMenuOption
                label="글머리 (●)"
                disabled={toolbarDisabled}
                active={activeBulletStyle === 'disc'}
                onClick={() => applyBulletList('disc')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <circle cx="2.5" cy="4" r="1.5" />
                  <rect x="5" y="3.2" width="10" height="1.6" rx="0.8" />
                  <circle cx="2.5" cy="8" r="1.5" />
                  <rect x="5" y="7.2" width="10" height="1.6" rx="0.8" />
                </svg>
              </DropdownMenuOption>
              <DropdownMenuOption
                label="글머리 (○)"
                disabled={toolbarDisabled}
                active={activeBulletStyle === 'circle'}
                onClick={() => applyBulletList('circle')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
                  <circle cx="2.5" cy="4" r="1.2" strokeWidth="1.2" />
                  <rect x="5" y="3.2" width="10" height="1.6" rx="0.8" fill="currentColor" stroke="none" />
                  <circle cx="2.5" cy="8" r="1.2" strokeWidth="1.2" />
                  <rect x="5" y="7.2" width="10" height="1.6" rx="0.8" fill="currentColor" stroke="none" />
                </svg>
              </DropdownMenuOption>
              <DropdownMenuOption
                label="번호 목록"
                disabled={toolbarDisabled}
                active={editor?.isActive('orderedList') ?? false}
                onClick={applyOrderedList}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <text x="0.5" y="5.5" fontSize="5" fontWeight="600">
                    1
                  </text>
                  <rect x="5" y="3.2" width="10" height="1.6" rx="0.8" />
                  <text x="0.5" y="9.5" fontSize="5" fontWeight="600">
                    2
                  </text>
                  <rect x="5" y="7.2" width="10" height="1.6" rx="0.8" />
                </svg>
              </DropdownMenuOption>
              <div className="my-1 border-t border-[#eee]" />
              <DropdownMenuOption
                label="목록 해제"
                disabled={toolbarDisabled || !isListActive}
                onClick={clearListFormat}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <rect x="2" y="3.2" width="12" height="1.6" rx="0.8" />
                  <rect x="2" y="7.2" width="12" height="1.6" rx="0.8" />
                  <rect x="2" y="11.2" width="12" height="1.6" rx="0.8" />
                </svg>
              </DropdownMenuOption>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={toolbarDisabled}
          title="인용"
          aria-pressed={editor?.isActive('blockquote') ?? false}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={toolbarIconButtonClass(editor?.isActive('blockquote') ?? false)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
            <rect x="1" y="2" width="1.5" height="10" rx="0.5" />
            <rect x="4" y="4" width="9" height="1.2" rx="0.6" />
            <rect x="4" y="7.5" width="7" height="1.2" rx="0.6" />
          </svg>
          인용
        </button>
      </div>

      <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />
      <ToolbarButton
        label="구분선"
        disabled={toolbarDisabled}
        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
      />

      <div className="relative" ref={tableMenuRef}>
        <button
          type="button"
          disabled={toolbarDisabled}
          onClick={toggleTablePicker}
          className={toolbarIconButtonClass(showTablePicker)}
        >
          표
          <span className="text-[10px] text-[#999]" aria-hidden>
            ▾
          </span>
        </button>

        {showTablePicker && (
          <div className="absolute left-0 top-full z-50 mt-1 rounded border border-[#ddd] bg-white shadow-xl">
            <TableInsertPicker
              size={tablePickerSize}
              withHeaderRow={tableWithHeaderRow}
              onHover={setTablePickerSize}
              onSelect={insertBoardTable}
            />
            <label className="flex cursor-pointer items-center gap-2 border-t border-[#eee] px-3 py-2 text-xs text-[#555]">
              <input
                type="checkbox"
                checked={tableWithHeaderRow}
                onChange={event => setTableWithHeaderRow(event.target.checked)}
                className="accent-[#1a3151]"
              />
              머리글 행
            </label>
          </div>
        )}
      </div>

      <ToolbarButton label="표 삭제" disabled={toolbarDisabled || !isTableActive} onClick={removeBoardTable} />
      <ToolbarButton label="링크" disabled={toolbarDisabled} onClick={setLink} />
      <ToolbarButton
        label={uploadingImage ? '업로드…' : '이미지'}
        disabled={toolbarDisabled || uploadingImage}
        onClick={setImage}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <span className="mx-1 w-px self-stretch bg-[#ddd]" aria-hidden />

      <div className="relative" ref={textColorPickerRef}>
        <button
          type="button"
          disabled={toolbarDisabled}
          onClick={toggleTextColorPicker}
          className="flex items-center gap-1 rounded border border-[#ddd] bg-white px-2 py-1 text-xs font-medium text-[#333] transition-colors hover:bg-[#f5f7fb] disabled:opacity-40"
        >
          <span
            className="inline-block h-3 w-3 rounded-sm border border-[#ccc]"
            style={{ backgroundColor: activeTextColor ?? '#333' }}
          />
          글자색
        </button>

        {showTextColorPicker && (
          <ColorPickerDropdown
            presetColors={PRESET_TEXT_COLORS}
            activeColor={activeTextColor}
            customColor={customTextColor}
            colorInputRef={colorInputRef}
            clearLabel="글자색 제거"
            placeholder="#000000"
            onClear={() => applyTextColor('')}
            onPresetSelect={applyTextColor}
            onCustomColorChange={handleCustomTextColorChange}
            onCustomColorApply={() => applyTextColor(customTextColor)}
          />
        )}
      </div>

      <div className="relative" ref={bgColorPickerRef}>
        <button
          type="button"
          disabled={toolbarDisabled}
          onClick={toggleBgColorPicker}
          className="flex items-center gap-1 rounded border border-[#ddd] bg-white px-2 py-1 text-xs font-medium text-[#333] transition-colors hover:bg-[#f5f7fb] disabled:opacity-40"
        >
          <span
            className="inline-block h-3 w-3 rounded-sm border border-[#ccc]"
            style={{ backgroundColor: activeBgColor ?? DEFAULT_HIGHLIGHT_COLOR }}
          />
          배경색
        </button>

        {showBgColorPicker && (
          <ColorPickerDropdown
            presetColors={PRESET_HIGHLIGHT_COLORS}
            activeColor={activeBgColor}
            customColor={customBgColor}
            colorInputRef={bgColorInputRef}
            clearLabel="배경색 제거"
            placeholder={DEFAULT_HIGHLIGHT_COLOR}
            onClear={() => applyBgColor('')}
            onPresetSelect={applyBgColor}
            onCustomColorChange={handleCustomBgColorChange}
            onCustomColorApply={() => applyBgColor(customBgColor)}
          />
        )}
      </div>
    </div>
  );
}
