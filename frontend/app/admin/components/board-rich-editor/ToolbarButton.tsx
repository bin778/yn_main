import type { ToolbarButtonProps } from './types';

function toolbarIconButtonClass(active: boolean): string {
  return `flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
    active ? 'border-[#1a3151] bg-[#1a3151] text-white' : 'border-[#ddd] bg-white text-[#333] hover:bg-[#f5f7fb]'
  }`;
}

export default function ToolbarButton({ label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={toolbarIconButtonClass(active ?? false)}
    >
      {label}
    </button>
  );
}

export { toolbarIconButtonClass };
