import BoardContentBody from '@/app/components/BoardContentBody';

import { shouldUseLegacyLayoutRendering } from '@/app/lib/boardLegacyLayout';
import { sanitizeContentForSave } from '../../lib/boardContentSanitize';

type AdminPostPreviewModalProps = {
  subject: string;
  content: string;
  onClose: () => void;
};

export default function AdminPostPreviewModal({ subject, content, onClose }: AdminPostPreviewModalProps) {
  const previewHtml = sanitizeContentForSave(content);
  const legacyLayout = shouldUseLegacyLayoutRendering(previewHtml);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-black/50 px-4 pb-6 pt-[120px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[900px] max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded bg-white shadow-xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8e8e8] bg-white px-4 py-3 md:px-6">
          <p className="text-xs text-[#999]">미리보기 — 저장 시 상세 페이지와 동일한 본문 스타일</p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer shrink-0 rounded border border-[#ddd] px-3 py-1.5 text-sm text-[#666] hover:bg-[#f5f5f5]"
          >
            닫기 (ESC)
          </button>
        </div>

        <article className="bg-white px-4 py-10 md:px-6 md:py-12">
          <h1 className="text-[22px] font-bold leading-snug tracking-tight text-[#121212] md:text-[30px]">
            {subject || '(제목 없음)'}
          </h1>
          <div className="mt-4 border-b border-[#e8e8e8] pb-6" aria-hidden />
          <BoardContentBody html={previewHtml} legacyLayout={legacyLayout} className="mt-8" />
        </article>
      </div>
    </div>
  );
}
