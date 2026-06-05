import type { ReactNode } from 'react';

type DropdownMenuOptionProps = {
  label: string;
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: ReactNode;
};

export default function DropdownMenuOption({
  label,
  hint,
  active,
  disabled,
  onClick,
  children,
}: DropdownMenuOptionProps) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors disabled:opacity-40 ${
        active ? 'bg-[#e8eef5] text-[#1a3151]' : 'text-[#333] hover:bg-[#f5f7fb]'
      }`}
    >
      {children !== undefined && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#333]">{children}</span>
      )}
      <span className="flex-1">{label}</span>
      {hint !== undefined && <span className="shrink-0 text-[10px] text-[#999]">{hint}</span>}
    </button>
  );
}
