import Link from 'next/link';

import type { BoTable, BoardView } from '../types/board';
import { BOARD_META, getBoardPathSlug } from '../constants/boardContent';

type BoardViewSectionProps = {
  boTable: BoTable;
  post: BoardView;
};

function formatDate(datetime: string): string {
  return datetime.slice(0, 10).replace(/-/g, '.');
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BoardViewSection({ boTable, post }: BoardViewSectionProps) {
  const pathSlug = getBoardPathSlug(boTable);
  const listHref = `/${pathSlug}`;
  const { label } = BOARD_META[boTable];

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
        <div
          className="board-content mt-8 min-h-[200px] text-[15px] leading-[1.75] text-[#333] md:text-[16px]"
          dangerouslySetInnerHTML={{ __html: post.wr_content }}
        />

        {/* 첨부파일 */}
        {post.files.length > 0 && (
          <div className="mt-10 border-t border-[#e8e8e8] pt-6">
            <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-[#999]">첨부파일</h2>
            <ul className="space-y-2">
              {post.files.map(file => (
                <li key={file.no}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[14px] text-[#1a3151] underline underline-offset-2 hover:text-[#1a3151]/70"
                  >
                    <span aria-hidden>{file.is_image ? '🖼' : '📎'}</span>
                    <span>{file.source}</span>
                    <span className="text-[12px] text-[#aaa]">({formatFileSize(file.size)})</span>
                  </a>
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
                href={`/${pathSlug}/${post.prev.wr_id}`}
                className="flex items-start gap-3 border-b border-[#f0f0f0] px-1 py-4 text-[14px] transition-colors hover:bg-[#f8f8f8]"
              >
                <span className="mt-0.5 shrink-0 text-[#aaa]">← 이전글</span>
                <span className="line-clamp-1 text-[#333]">{post.prev.wr_subject}</span>
              </Link>
            )}
            {post.next !== null && (
              <Link
                href={`/${pathSlug}/${post.next.wr_id}`}
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
