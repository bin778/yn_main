'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { buildBoardListHref } from '../lib/buildBoardListHref';
import type { BoardListSort, BoardSearchField, BoTable } from '../types/board';

const MAX_VISIBLE_PAGES = 5;

type BoardListPaginationProps = {
  boTable: BoTable;
  page: number;
  totalPages: number;
  q: string;
  sfl: BoardSearchField;
  sort: BoardListSort;
  view: 'list' | 'grid';
};

function getVisiblePages(page: number, totalPages: number): number[] {
  let start = Math.max(1, page - Math.floor(MAX_VISIBLE_PAGES / 2));
  const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);
  if (end - start + 1 < MAX_VISIBLE_PAGES) start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export default function BoardListPagination({
  boTable,
  page,
  totalPages,
  q,
  sfl,
  sort,
  view,
}: BoardListPaginationProps) {
  const router = useRouter();
  const [input, setInput] = useState(String(page));
  const [prevPage, setPrevPage] = useState(page);

  if (page !== prevPage) {
    setPrevPage(page);
    setInput(String(page));
  }

  function hrefFor(targetPage: number): string {
    return buildBoardListHref(boTable, targetPage, view, q, sfl, sort);
  }

  function jump() {
    let target = parseInt(input, 10);
    if (Number.isNaN(target) || target < 1) target = 1;
    if (target > totalPages) target = totalPages;
    if (target === page) {
      setInput(String(page));
      return;
    }
    router.push(hrefFor(target));
  }

  if (totalPages <= 1) return null;

  const pages = getVisiblePages(page, totalPages);
  const btnBase =
    'inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-[#f0f2f5] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';
  const numBase =
    'inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors';

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-4 border-t border-[#e8e8e8] pt-6"
      aria-label="페이지 이동"
    >
      <div className="flex flex-wrap items-center justify-center gap-1">
        {page > 1 ? (
          <Link href={hrefFor(1)} className={btnBase}>
            처음
          </Link>
        ) : (
          <span className={btnBase} aria-disabled>
            처음
          </span>
        )}

        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={btnBase}>
            이전
          </Link>
        ) : (
          <span className={btnBase} aria-disabled>
            이전
          </span>
        )}

        {pages.map(num =>
          num === page ? (
            <span key={num} className={`${numBase} border-[#1a3151] bg-[#1a3151] text-white`} aria-current="page">
              {num}
            </span>
          ) : (
            <Link key={num} href={hrefFor(num)} className={`${numBase} text-[#333] hover:bg-[#f0f2f5]`}>
              {num}
            </Link>
          ),
        )}

        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={btnBase}>
            다음
          </Link>
        ) : (
          <span className={btnBase} aria-disabled>
            다음
          </span>
        )}

        {page < totalPages ? (
          <Link href={hrefFor(totalPages)} className={btnBase}>
            끝
          </Link>
        ) : (
          <span className={btnBase} aria-disabled>
            끝
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 border-l border-[#ddd] pl-4 text-sm">
        <span className="text-[#666]">이동:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={input}
          onChange={event => setInput(event.target.value)}
          onBlur={jump}
          onKeyDown={event => event.key === 'Enter' && jump()}
          className="w-14 rounded border px-2 py-1 text-center text-sm font-bold text-[#1a3151] focus:outline-none focus:ring-2 focus:ring-[#1a3151]"
          style={{ MozAppearance: 'textfield' }}
          aria-label="이동할 페이지 번호"
        />
        <span className="text-[#666]">/ {totalPages} 페이지</span>
      </div>
    </nav>
  );
}
