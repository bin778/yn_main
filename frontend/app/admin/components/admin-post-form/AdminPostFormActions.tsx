type AdminPostFormActionsProps = {
  loading: boolean;
  mode: 'create' | 'edit';
  showDelete: boolean;
  onPreview: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onScheduleClick: () => void;
};

const ACTION_BTN = 'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

export default function AdminPostFormActions({
  loading,
  mode,
  showDelete,
  onPreview,
  onCancel,
  onDelete,
  onScheduleClick,
}: AdminPostFormActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        disabled={loading}
        className={`bg-[#1a3151] px-4 py-2 text-sm font-medium text-white ${ACTION_BTN}`}
      >
        {loading ? '저장 중…' : '저장'}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={onScheduleClick}
        className={`border border-[#1a3151] px-4 py-2 text-sm font-medium text-[#1a3151] hover:bg-[#f0f4f9] ${ACTION_BTN}`}
      >
        예약 저장 ▾
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={onPreview}
        className={`border border-[#1a3151] px-4 py-2 text-sm font-medium text-[#1a3151] hover:bg-[#f0f4f9] ${ACTION_BTN}`}
      >
        미리보기
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={onCancel}
        className={`inline-flex items-center border border-[#ddd] px-4 py-2 text-sm ${ACTION_BTN}`}
      >
        취소
      </button>
      {mode === 'edit' && showDelete && (
        <button
          type="button"
          disabled={loading}
          onClick={onDelete}
          className={`ml-auto border border-[#b42318] px-4 py-2 text-sm text-[#b42318] ${ACTION_BTN}`}
        >
          삭제
        </button>
      )}
    </div>
  );
}
