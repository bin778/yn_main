import Link from 'next/link';
import { Suspense } from 'react';

import { getBoardPathSlug } from '../constants/boardContent';
import { DEFAULT_BOARD_SORT } from '../constants/boardSort';
import { buildBoardSectionListPath, hasBoardSections } from '../constants/boardSections';
import { buildBoardListHref } from '../lib/buildBoardListHref';
import type { BoardListResponse, BoardListSort, BoardSearchField, BoTable } from '../types/board';
import BoardListItems from './BoardListItems';
import BoardListPagination from './BoardListPagination';
import BoardSortSelect from './BoardSortSelect';

type BoardListSectionProps = {
  boTable: BoTable;
  data: BoardListResponse;
  q: string;
  sfl: BoardSearchField;
  sort: BoardListSort;
  view: 'list' | 'grid';
  sectionCategory?: string | null;
  sectionSubcategory?: string | null;
};

function SearchToolbar({
  boTable,
  q,
  sfl,
  sort,
  view,
  sectionCategory,
  sectionSubcategory,
}: {
  boTable: BoTable;
  q: string;
  sfl: BoardSearchField;
  sort: BoardListSort;
  view: 'list' | 'grid';
  sectionCategory?: string | null;
  sectionSubcategory?: string | null;
}) {
  const formAction = hasBoardSections(boTable)
    ? buildBoardSectionListPath(boTable, sectionCategory ?? null, sectionSubcategory ?? null)
    : `/${getBoardPathSlug(boTable)}`;

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form action={formAction} method="get" className="flex w-full max-w-[520px] gap-2">
          {view === 'grid' ? <input type="hidden" name="view" value="grid" /> : null}
          {sort !== DEFAULT_BOARD_SORT ? <input type="hidden" name="sort" value={sort} /> : null}
          <select
            name="sfl"
            defaultValue={sfl}
            className="h-11 shrink-0 border border-[#ddd] bg-white px-2 text-[14px] text-[#121212] outline-none focus:border-[#1a3151]"
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
            className="h-11 min-w-0 flex-1 border border-[#ddd] px-2 text-[14px] text-[#121212] outline-none focus:border-[#1a3151]"
          />
          <button
            type="submit"
            className="h-11 shrink-0 whitespace-nowrap border border-[#1a3151] bg-[#1a3151] px-4 text-[14px] font-medium text-white"
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
            href={buildBoardListHref(boTable, 1, 'list', q, sfl, sort, sectionCategory, sectionSubcategory)}
            className={`inline-flex h-10 items-center justify-center border px-4 text-[13px] ${
              view === 'list' ? 'border-[#1a3151] bg-[#1a3151] text-white' : 'border-[#ddd] bg-white text-[#666]'
            }`}
          >
            목록형
          </Link>
          <Link
            href={buildBoardListHref(boTable, 1, 'grid', q, sfl, sort, sectionCategory, sectionSubcategory)}
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

export default function BoardListSection({
  boTable,
  data,
  q,
  sfl,
  sort,
  view,
  sectionCategory,
  sectionSubcategory,
}: BoardListSectionProps) {
  return (
    <section className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-[900px]">
        <SearchToolbar
          boTable={boTable}
          q={q}
          sfl={sfl}
          sort={sort}
          view={view}
          sectionCategory={sectionCategory}
          sectionSubcategory={sectionSubcategory}
        />
        <p className="mb-1 text-right text-[13px] text-[#999]">
          총 {data.total.toLocaleString()}건 {q !== '' ? `(검색어: ${q})` : ''}
        </p>

        <BoardListItems boTable={boTable} items={data.items} view={view} />

        <BoardListPagination
          boTable={boTable}
          page={data.page}
          totalPages={data.total_pages}
          q={q}
          sfl={sfl}
          sort={sort}
          view={view}
          sectionCategory={sectionCategory}
          sectionSubcategory={sectionSubcategory}
        />
      </div>
    </section>
  );
}
