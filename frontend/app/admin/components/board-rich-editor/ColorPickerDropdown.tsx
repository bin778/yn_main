type ColorPickerDropdownProps = {
  presetColors: readonly string[];
  activeColor: string | undefined;
  customColor: string;
  colorInputRef: React.RefObject<HTMLInputElement | null>;
  clearLabel: string;
  placeholder: string;
  onClear: () => void;
  onPresetSelect: (color: string) => void;
  onCustomColorChange: (value: string) => void;
  onCustomColorApply: () => void;
};

export default function ColorPickerDropdown({
  presetColors,
  activeColor,
  customColor,
  colorInputRef,
  clearLabel,
  placeholder,
  onClear,
  onPresetSelect,
  onCustomColorChange,
  onCustomColorApply,
}: ColorPickerDropdownProps) {
  return (
    <div className="absolute right-0 top-full z-50 mt-1 w-[200px] rounded border border-[#ddd] bg-white p-3 shadow-xl">
      <button
        type="button"
        title={clearLabel}
        onClick={onClear}
        className="mb-2 flex w-full items-center gap-2 rounded border border-[#ddd] px-2 py-1 text-xs text-[#555] hover:bg-[#f5f5f5]"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-sm border border-[#ccc] bg-white text-[10px] font-bold text-[#999]">
          ✕
        </span>
        {clearLabel}
      </button>
      <div className="mb-3 grid grid-cols-6 gap-1">
        {presetColors.map(color => (
          <button
            key={color}
            type="button"
            title={color}
            onClick={() => onPresetSelect(color)}
            className={`h-7 w-7 rounded border transition-transform hover:scale-110 hover:shadow-md ${
              activeColor === color ? 'ring-2 ring-[#1a3151] ring-offset-1' : 'border-[#ccc]'
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1">
        <input
          ref={colorInputRef}
          type="color"
          value={customColor}
          onChange={event => onCustomColorChange(event.target.value)}
          className="h-7 w-7 shrink-0 cursor-pointer rounded border border-[#ddd] p-0.5"
        />
        <input
          type="text"
          value={customColor}
          maxLength={7}
          onChange={event => onCustomColorChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') onCustomColorApply();
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 border border-[#ddd] px-2 py-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={onCustomColorApply}
          className="shrink-0 rounded bg-[#1a3151] px-2 py-1 text-xs font-medium text-white hover:bg-[#142640]"
        >
          적용
        </button>
      </div>
    </div>
  );
}
