type AdminPostFormActionsProps = {
  loading: boolean;
  mode: 'create' | 'edit';
  showDelete: boolean;
  onPreview: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

export default function AdminPostFormActions({
  loading,
  mode,
  showDelete,
  onPreview,
  onCancel,
  onDelete,
}: AdminPostFormActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        disabled={loading}
        className="bg-[#1a3151] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? '저장 중…' : '저장'}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={onPreview}
        className="border border-[#1a3151] px-4 py-2 text-sm font-medium text-[#1a3151] hover:bg-[#f0f4f9] disabled:opacity-60"
      >
        미리보기
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={onCancel}
        className="inline-flex items-center border border-[#ddd] px-4 py-2 text-sm disabled:opacity-60"
      >
        취소
      </button>
      {mode === 'edit' && showDelete && (
        <button
          type="button"
          disabled={loading}
          onClick={onDelete}
          className="ml-auto border border-[#b42318] px-4 py-2 text-sm text-[#b42318] disabled:opacity-60"
        >
          삭제
        </button>
      )}
    </div>
  );
}
