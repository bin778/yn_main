import { SEO_DESCRIPTION_MAX } from '@/app/(story)/lib/boardSeo';
import type { BoTable } from '@/app/(story)/types/board';

import SeoPreview from '../SeoPreview';

type AdminPostSeoSectionProps = {
  boTable: BoTable;
  wrId?: number;
  subject: string;
  seoTitle: string;
  seoSlug: string;
  seoDescription: string;
  showSlugInput: boolean;
  bodyDescriptionFallback: string;
  seoPreviewDescription: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
  onSeoSlugChange: (value: string) => void;
  onShowSlugInput: () => void;
  onResetSlug: () => void;
};

export default function AdminPostSeoSection({
  boTable,
  wrId,
  subject,
  seoTitle,
  seoSlug,
  seoDescription,
  showSlugInput,
  bodyDescriptionFallback,
  seoPreviewDescription,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoSlugChange,
  onShowSlugInput,
  onResetSlug,
}: AdminPostSeoSectionProps) {
  return (
    <details className="rounded border border-[#e0e8f4] bg-[#f8fafc]">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[#1a3151]">
        SEO 설정 <span className="text-xs font-normal text-[#999]">(선택, 비우면 제목·글번호로 자동 설정)</span>
      </summary>
      <div className="space-y-4 border-t border-[#e0e8f4] px-4 py-4">
        <SeoPreview
          boTable={boTable}
          title={seoTitle.trim() || subject}
          slug={seoSlug}
          wrId={wrId}
          description={seoPreviewDescription}
        />
        <div>
          <label htmlFor="wr_seo_title" className="mb-1 block text-sm font-medium">
            SEO 제목 <span className="text-xs font-normal text-[#999]">(비우면 제목 사용)</span>
          </label>
          <input
            id="wr_seo_title"
            value={seoTitle}
            placeholder={subject || '제목을 입력하면 자동으로 사용됩니다'}
            onChange={event => onSeoTitleChange(event.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="wr_seo_description" className="mb-1 block text-sm font-medium">
            SEO 설명{' '}
            <span className="text-xs font-normal text-[#999]">
              (비우면 본문 요약 사용, 최대 {SEO_DESCRIPTION_MAX}자)
            </span>
          </label>
          <textarea
            id="wr_seo_description"
            rows={3}
            maxLength={SEO_DESCRIPTION_MAX}
            value={seoDescription}
            placeholder={bodyDescriptionFallback || '본문을 입력하면 검색 결과 설명 미리보기에 반영됩니다'}
            onChange={event => onSeoDescriptionChange(event.target.value)}
            className="w-full resize-y border border-[#ddd] px-3 py-2 text-sm leading-relaxed"
          />
          <p className="mt-1 text-xs text-[#999]">
            {seoDescription.length}/{SEO_DESCRIPTION_MAX}자 · 본문과 다른 검색용 요약을 쓸 수 있습니다.
          </p>
        </div>
        <div>
          {!showSlugInput ? (
            <button type="button" className="text-xs text-[#1a3151] underline" onClick={onShowSlugInput}>
              Slug 직접 입력 (기본: 글 번호)
            </button>
          ) : (
            <>
              <label htmlFor="wr_seo_slug" className="mb-1 block text-sm font-medium">
                Slug <span className="text-xs font-normal text-[#999]">(비우면 글 번호로 저장)</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="wr_seo_slug"
                  value={seoSlug}
                  onChange={event => onSeoSlugChange(event.target.value)}
                  className="flex-1 border border-[#ddd] px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  className="border border-[#ddd] px-3 py-2 text-xs text-[#999] hover:text-[#b42318]"
                  onClick={onResetSlug}
                >
                  초기화
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </details>
  );
}
