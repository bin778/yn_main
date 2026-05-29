import Image from 'next/image';
import Link from 'next/link';

import { getBoardPathSlug } from '../constants/boardContent';
import type { BoardListItem, BoardListResponse, BoardSearchField, BoTable } from '../types/board';

type BoardListSectionProps = {
  boTable: BoTable;
  data: BoardListResponse;
  q: string;
  sfl: BoardSearchField;
  view: 'list' | 'grid';
};

function formatDate(datetime: string): string {
  return datetime.slice(0, 10).replace(/-/g, '.');
}

function buildListHref(
  boTable: BoTable,
  page: number,
  view: 'list' | 'grid',
  q: string,
  sfl: BoardSearchField,
): string {
  const searchParams = new URLSearchParams();
  if (page > 1) searchParams.set('page', String(page));
  if (view !== 'list') searchParams.set('view', view);
  if (q.trim() !== '') {
    searchParams.set('q', q.trim());
    if (sfl !== 'subject_content') searchParams.set('sfl', sfl);
  }
  const pathSlug = getBoardPathSlug(boTable);
  const query = searchParams.toString();
  return query === '' ? `/${pathSlug}` : `/${pathSlug}?${query}`;
}

function BoardListRow({ item, boTable }: { item: BoardListItem; boTable: BoTable }) {
  const href = `/${getBoardPathSlug(boTable)}/${item.wr_id}`;

  return (
    <li className="border-b border-[#e8e8e8] last:border-b-0">
      <Link
        href={href}
        className="group flex items-start gap-4 py-6 transition-colors hover:bg-[#f8f8f8] md:gap-6 md:px-4"
      >
        {item.thumbnail_url !== null && (
          <div className="relative hidden h-[80px] w-[120px] shrink-0 overflow-hidden bg-[#f0f0f0] md:block">
            <Image src={item.thumbnail_url} alt="" fill className="object-cover" sizes="120px" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold leading-snug tracking-tight text-[#121212] group-hover:text-[#1a3151] md:text-[18px]">
            {item.wr_subject}
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
  const href = `/${getBoardPathSlug(boTable)}/${item.wr_id}`;

  return (
    <li className="h-full border border-[#e8e8e8]">
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
          <p className="line-clamp-2 text-[16px] font-bold leading-snug tracking-tight text-[#121212] group-hover:text-[#1a3151]">
            {item.wr_subject}
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
  page,
  q,
  sfl,
  view,
}: {
  boTable: BoTable;
  page: number;
  q: string;
  sfl: BoardSearchField;
  view: 'list' | 'grid';
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <form action={`/${getBoardPathSlug(boTable)}`} method="get" className="flex w-full max-w-[520px] gap-2">
        {view === 'grid' ? <input type="hidden" name="view" value="grid" /> : null}
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

      <div className="flex items-center gap-2">
        <Link
          href={buildListHref(boTable, page, 'list', q, sfl)}
          className={`inline-flex h-10 items-center justify-center border px-4 text-[13px] ${
            view === 'list' ? 'border-[#1a3151] bg-[#1a3151] text-white' : 'border-[#ddd] bg-white text-[#666]'
          }`}
        >
          목록형
        </Link>
        <Link
          href={buildListHref(boTable, page, 'grid', q, sfl)}
          className={`inline-flex h-10 items-center justify-center border px-4 text-[13px] ${
            view === 'grid' ? 'border-[#1a3151] bg-[#1a3151] text-white' : 'border-[#ddd] bg-white text-[#666]'
          }`}
        >
          아이콘형
        </Link>
      </div>
    </div>
  );
}

function Pagination({
  boTable,
  page,
  totalPages,
  q,
  sfl,
  view,
}: {
  boTable: BoTable;
  page: number;
  totalPages: number;
  q: string;
  sfl: BoardSearchField;
  view: 'list' | 'grid';
}) {
  if (totalPages <= 1) return null;

  const prevHref = page > 1 ? buildListHref(boTable, page - 1, view, q, sfl) : null;
  const nextHref = page < totalPages ? buildListHref(boTable, page + 1, view, q, sfl) : null;

  const btnBase =
    'inline-flex h-10 items-center justify-center gap-2 border border-[#e0e0e0] px-5 text-[14px] font-medium tracking-tight transition-colors';
  const activeBtn = `${btnBase} bg-white text-[#121212] hover:border-[#1a3151] hover:text-[#1a3151]`;
  const disabledBtn = `${btnBase} cursor-not-allowed bg-[#f5f5f5] text-[#ccc]`;

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="페이지 이동">
      {prevHref !== null ? (
        <Link href={prevHref} className={activeBtn}>
          ← 이전
        </Link>
      ) : (
        <span className={disabledBtn} aria-disabled>
          ← 이전
        </span>
      )}

      <span className="text-[14px] text-[#777]">
        {page} / {totalPages}
      </span>

      {nextHref !== null ? (
        <Link href={nextHref} className={activeBtn}>
          다음 →
        </Link>
      ) : (
        <span className={disabledBtn} aria-disabled>
          다음 →
        </span>
      )}
    </nav>
  );
}

export default function BoardListSection({ boTable, data, q, sfl, view }: BoardListSectionProps) {
  return (
    <section className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-[900px]">
        <SearchToolbar boTable={boTable} page={data.page} q={q} sfl={sfl} view={view} />
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

        <Pagination boTable={boTable} page={data.page} totalPages={data.total_pages} q={q} sfl={sfl} view={view} />
      </div>
    </section>
  );
}
