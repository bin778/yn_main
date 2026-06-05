type AdminPostPreviewModalProps = {
  subject: string;
  content: string;
  onClose: () => void;
};

export default function AdminPostPreviewModal({ subject, content, onClose }: AdminPostPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-black/50 px-4 pb-6 pt-[120px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded bg-white shadow-xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-xs text-[#999]">미리보기</p>
            <h2 className="text-lg font-semibold text-[#1a3151]">{subject || '(제목 없음)'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded border border-[#ddd] px-3 py-1.5 text-sm text-[#666] hover:bg-[#f5f5f5]"
          >
            닫기 (ESC)
          </button>
        </div>
        <div className="board-preview px-6 py-6 text-sm text-[#333]" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
