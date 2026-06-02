'use client';

import { BOARD_PATH_SLUG } from '@/app/(story)/constants/boardContent';
import type { BoTable } from '@/app/(story)/types/board';

type SeoPreviewProps = {
  boTable: BoTable;
  title: string;
  slug: string;
  description?: string;
};

const SITE_ORIGIN = 'https://yeoon.co.kr';

export default function SeoPreview({ boTable, title, slug, description }: SeoPreviewProps) {
  const pathSlug = BOARD_PATH_SLUG[boTable];
  const safeSlug = slug.trim() || 'post';
  const url = `${SITE_ORIGIN}/${pathSlug}/${safeSlug}/`;
  const displayTitle = title.trim() || '제목을 입력하세요';
  const displayDesc = description?.trim().slice(0, 160) || '본문 내용이 검색 결과 설명으로 사용될 수 있습니다.';

  return (
    <div className="rounded border border-[#e0e8f4] bg-[#f8fafc] p-4">
      <p className="mb-2 text-xs font-medium text-[#666]">SEO 미리보기</p>
      <p className="truncate text-sm text-[#1a0dab]">{displayTitle}</p>
      <p className="truncate text-xs text-[#006621]">{url}</p>
      <p className="mt-1 line-clamp-2 text-xs text-[#545454]">{displayDesc}</p>
    </div>
  );
}
