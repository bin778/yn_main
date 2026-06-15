import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { getBoardPathSlug } from '../constants/boardContent';
import { DEFAULT_BOARD_SORT } from '../constants/boardSort';
import { buildBoardListHref } from '../lib/buildBoardListHref';
import { buildBoardPostHref } from '../lib/boardPostPath';
import type { BoardListItem, BoardListResponse, BoardListSort, BoardSearchField, BoTable } from '../types/board';
import BoardListPagination from './BoardListPagination';
import BoardSortSelect from './BoardSortSelect';

type BoardListSectionProps = {
  boTable: BoTable;
  data: BoardListResponse;
  q: string;
  sfl: BoardSearchField;
  sort: BoardListSort;
  view: 'list' | 'grid';
};

function formatDate(datetime: string): string {
  return datetime.slice(0, 10).replace(/-/g, '.');
}

function NoticeBadge() {
  return (
    <span className="inline-flex shrink-0 items-center bg-[#1a3151] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
      공지
    </span>
  );
}

function BoardListRow({ item, boTable }: { item: BoardListItem; boTable: BoTable }) {
  const href = buildBoardPostHref(boTable, item.wr_id, item.wr_seo_slug);

  return (
    <li className="border-b border-[#e8e8e8] last:border-b-0">
      <Link
        href={href}
        className={`group flex items-start gap-4 py-6 transition-colors md:gap-6 md:px-4 ${
          item.notice ? 'bg-[#f5f7fa] hover:bg-[#eef1f6]' : 'hover:bg-[#f8f8f8]'
        }`}
      >
        {item.thumbnail_url !== null && (
          <div className="relative hidden h-[80px] w-[120px] shrink-0 overflow-hidden bg-[#f0f0f0] md:block">
            <Image src={item.thumbnail_url} alt="" fill className="object-cover" sizes="120px" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[16px] font-bold leading-snug tracking-tight text-[#121212] group-hover:text-[#1a3151] md:text-[18px]">
            {item.notice ? <NoticeBadge /> : null}
            <span className="truncate">{item.wr_subject}</span>
          </p>
          <div className="mt-2 flex items-center gap-3 text-[12px] text-[#999] md:text-[13px]">
            <span>{item.wr_name}</span>
            <span aria-hidden>·</span>
            <time dateTime={item.wr_datetime}>{formatDate(item.wr_datetime)}</time>
            <span aria-hidden>·</span>
            <span>조회 {item.wr_hit.toLocaleString()}</span>
            {item.has_file && (
              <>
                <span aria-hidden>·</span>
                <span aria-label="첨부파일 있음">📎</span>
              </>
            )}
          </div>
        </div>

        <span
          className="mt-1 hidden shrink-0 text-[20px] text-[#ccc] transition-colors group-hover:text-[#1a3151] md:block"
          aria-hidden
        >
          →
        </span>
      </Link>
    </li>
  );
}

function BoardGridCard({ item, boTable }: { item: BoardListItem; boTable: BoTable }) {
  const href = buildBoardPostHref(boTable, item.wr_id, item.wr_seo_slug);

  return (
    <li className={`h-full border border-[#e8e8e8] ${item.notice ? 'ring-1 ring-inset ring-[#1a3151]/20' : ''}`}>
      <Link href={href} className="group flex h-full flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0f0f0]">
          {item.thumbnail_url !== null ? (
            <Image
              src={item.thumbnail_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[13px] text-[#999]">이미지 없음</div>
          )}
        </div>
        <div className="flex flex-1 flex-col px-4 py-4">
          <p className="flex items-start gap-2 text-[16px] font-bold leading-snug tracking-tight text-[#121212] group-hover:text-[#1a3151]">
            {item.notice ? <NoticeBadge /> : null}
            <span className="line-clamp-2">{item.wr_subject}</span>
          </p>
          <p className="mt-auto pt-3 text-[12px] text-[#999]">
            {item.wr_name} · {formatDate(item.wr_datetime)} · 조회 {item.wr_hit.toLocaleString()}
          </p>
        </div>
      </Link>
    </li>
  );
}

function EmptyState() {
  return <div className="py-20 text-center text-[15px] text-[#999]">등록된 게시물이 없습니다.</div>;
}

function SearchToolbar({
  boTable,
  q,
  sfl,
  sort,
  view,
}: {
  boTable: BoTable;
  q: string;
  sfl: BoardSearchField;
  sort: BoardListSort;
  view: 'list' | 'grid';
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form action={`/${getBoardPathSlug(boTable)}`} method="get" className="flex w-full max-w-[520px] gap-2">
          {view === 'grid' ? <input type="hidden" name="view" value="grid" /> : null}
          {sort !== DEFAULT_BOARD_SORT ? <input type="hidden" name="sort" value={sort} /> : null}
          <select
            name="sfl"
            defaultValue={sfl}
            className="h-11 border border-[#ddd] bg-white px-2 text-[14px] text-[#121212] outline-none focus:border-[#1a3151]"
            aria-label="검색 구분"
          >
            <option value="subject">제목</option>
            <option value="content">내용</option>
            <option value="subject_content">제목+내용</option>
            <option value="name">글쓴이</option>
          </select>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="검색어를 입력하세요"
            className="h-11 flex-1 border border-[#ddd] px-3 text-[14px] text-[#121212] outline-none focus:border-[#1a3151]"
          />
          <button
            type="submit"
            className="h-11 border border-[#1a3151] bg-[#1a3151] px-4 text-[14px] font-medium text-white"
          >
            검색
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Suspense
            fallback={
              <select
                disabled
                className="h-11 border border-[#ddd] bg-[#f5f5f5] px-2 text-[14px] text-[#999]"
                aria-label="정렬"
              >
                {sort === DEFAULT_BOARD_SORT ? '최신순' : '정렬'}
              </select>
            }
          >
            <BoardSortSelect current={sort} />
          </Suspense>
          <Link
            href={buildBoardListHref(boTable, 1, 'list', q, sfl, sort)}
            className={`inline-flex h-10 items-center justify-center border px-4 text-[13px] ${
              view === 'list' ? 'border-[#1a3151] bg-[#1a3151] text-white' : 'border-[#ddd] bg-white text-[#666]'
            }`}
          >
            목록형
          </Link>
          <Link
            href={buildBoardListHref(boTable, 1, 'grid', q, sfl, sort)}
            className={`inline-flex h-10 items-center justify-center border px-4 text-[13px] ${
              view === 'grid' ? 'border-[#1a3151] bg-[#1a3151] text-white' : 'border-[#ddd] bg-white text-[#666]'
            }`}
          >
            아이콘형
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BoardListSection({ boTable, data, q, sfl, sort, view }: BoardListSectionProps) {
  return (
    <section className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-[900px]">
        <SearchToolbar boTable={boTable} q={q} sfl={sfl} sort={sort} view={view} />
        <p className="mb-1 text-right text-[13px] text-[#999]">
          총 {data.total.toLocaleString()}건 {q !== '' ? `(검색어: ${q})` : ''}
        </p>

        {data.items.length === 0 ? (
          <EmptyState />
        ) : view === 'grid' ? (
          <ul className="grid gap-4 border-t border-[#e8e8e8] pt-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map(item => (
              <BoardGridCard key={item.wr_id} item={item} boTable={boTable} />
            ))}
          </ul>
        ) : (
          <ul className="border-t border-[#e8e8e8]">
            {data.items.map(item => (
              <BoardListRow key={item.wr_id} item={item} boTable={boTable} />
            ))}
          </ul>
        )}

        <BoardListPagination
          boTable={boTable}
          page={data.page}
          totalPages={data.total_pages}
          q={q}
          sfl={sfl}
          sort={sort}
          view={view}
        />
      </div>
    </section>
  );
}
