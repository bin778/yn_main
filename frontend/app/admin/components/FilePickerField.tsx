'use client';

import { ChangeEvent, useId, useRef } from 'react';

type FilePickerFieldProps = {
  accept: string;
  uploadLabel: string;
  changeLabel: string;
  removeLabel?: string;
  busyLabel?: string;
  disabled?: boolean;
  busy?: boolean;
  hasSelection: boolean;
  hint?: string | null;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
};

const PICK_BUTTON_CLASS =
  'rounded border border-[#1a3151] bg-[#1a3151] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#243d66] disabled:cursor-not-allowed disabled:opacity-50';

const CHANGE_BUTTON_CLASS =
  'rounded border border-[#ddd] bg-white px-3 py-2 text-sm font-medium text-[#333] transition-colors hover:bg-[#f5f7fb] disabled:cursor-not-allowed disabled:opacity-50';

export default function FilePickerField({
  accept,
  uploadLabel,
  changeLabel,
  removeLabel = '제거',
  busyLabel = '업로드 중…',
  disabled = false,
  busy = false,
  hasSelection,
  hint = null,
  onFileSelect,
  onRemove,
}: FilePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const controlDisabled = disabled || busy;
  const actionLabel = busy ? busyLabel : hasSelection ? changeLabel : uploadLabel;

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onFileSelect(file);
  }

  function openPicker() {
    if (controlDisabled) return;
    inputRef.current?.click();
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={controlDisabled}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={controlDisabled}
          onClick={openPicker}
          aria-controls={inputId}
          className={hasSelection ? CHANGE_BUTTON_CLASS : PICK_BUTTON_CLASS}
        >
          {actionLabel}
        </button>
        {hasSelection && onRemove !== undefined && (
          <button
            type="button"
            disabled={controlDisabled}
            className="text-xs text-[#b42318] underline disabled:opacity-50"
            onClick={onRemove}
          >
            {removeLabel}
          </button>
        )}
      </div>
      {hint !== null && hint !== '' && <p className="text-xs text-[#666]">{hint}</p>}
    </div>
  );
}
