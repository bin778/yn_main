import Link from 'next/link';

import BoardContentBody from '@/app/components/BoardContentBody';
import { shouldUseLegacyLayoutRendering } from '@/app/lib/boardLegacyLayout';

import type { BoTable, BoardView } from '../types/board';
import { BOARD_META, getBoardPathSlug } from '../constants/boardContent';
import { buildBoardPostHref } from '../lib/boardPostPath';

import BoardAttachmentItem from './BoardAttachmentItem';

type BoardViewSectionProps = {
  boTable: BoTable;
  post: BoardView;
};

function formatDate(datetime: string): string {
  return datetime.slice(0, 10).replace(/-/g, '.');
}

export default function BoardViewSection({ boTable, post }: BoardViewSectionProps) {
  const pathSlug = getBoardPathSlug(boTable);
  const listHref = `/${pathSlug}`;
  const { label } = BOARD_META[boTable];
  const legacyLayout = shouldUseLegacyLayoutRendering(post.wr_content);

  return (
    <article className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-[900px]">
        {/* 목록 breadcrumb */}
        <nav className="mb-6 text-[13px] text-[#999]" aria-label="위치">
          <Link href={listHref} className="hover:text-[#1a3151] hover:underline">
            {label}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span className="text-[#555]">상세</span>
        </nav>

        {/* 제목 */}
        <h1 className="text-[22px] font-bold leading-snug tracking-tight text-[#121212] md:text-[30px]">
          {post.wr_subject}
        </h1>

        {/* 메타 정보 */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[#e8e8e8] pb-6 text-[13px] text-[#999]">
          <span>{post.wr_name}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.wr_datetime}>{formatDate(post.wr_datetime)}</time>
          <span aria-hidden>·</span>
          <span>조회 {post.wr_hit.toLocaleString()}</span>
        </div>

        {/* 본문 — 그누보드 에디터 HTML (관리자 작성 신뢰 콘텐츠) */}
        <BoardContentBody html={post.wr_content} legacyLayout={legacyLayout} className="mt-8" />

        {/* 첨부파일 */}
        {post.files.length > 0 && (
          <div className="mt-10 border-t border-[#e8e8e8] pt-6">
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-[#999]">첨부파일</h2>
            <ul className="space-y-2">
              {post.files.map(file => (
                <li key={file.no}>
                  <BoardAttachmentItem boTable={boTable} wrId={post.wr_id} file={file} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 이전 / 다음 글 네비게이션 */}
        {(post.prev !== null || post.next !== null) && (
          <nav className="mt-10 border-t border-[#e8e8e8]" aria-label="이전/다음 글">
            {post.prev !== null && (
              <Link
                href={buildBoardPostHref(boTable, post.prev.wr_id, post.prev.wr_seo_slug)}
                className="flex items-start gap-3 border-b border-[#f0f0f0] px-1 py-4 text-[14px] transition-colors hover:bg-[#f8f8f8]"
              >
                <span className="mt-0.5 shrink-0 text-[#aaa]">← 이전글</span>
                <span className="line-clamp-1 text-[#333]">{post.prev.wr_subject}</span>
              </Link>
            )}
            {post.next !== null && (
              <Link
                href={buildBoardPostHref(boTable, post.next.wr_id, post.next.wr_seo_slug)}
                className="flex items-start gap-3 px-1 py-4 text-[14px] transition-colors hover:bg-[#f8f8f8]"
              >
                <span className="mt-0.5 shrink-0 text-[#aaa]">다음글 →</span>
                <span className="line-clamp-1 text-[#333]">{post.next.wr_subject}</span>
              </Link>
            )}
          </nav>
        )}

        {/* 목록 버튼 */}
        <div className="mt-8 text-center">
          <Link
            href={listHref}
            className="inline-flex h-11 items-center justify-center border border-[#1a3151] px-8 text-[14px] font-medium tracking-tight text-[#1a3151] transition-colors hover:bg-[#1a3151] hover:text-white"
          >
            목록으로
          </Link>
        </div>
      </div>
    </article>
  );
}
