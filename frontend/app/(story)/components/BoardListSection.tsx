import Image from 'next/image';
import Link from 'next/link';

import type { BoTable, BoardListItem, BoardListResponse } from '../types/board';

type BoardListSectionProps = {
  boTable: BoTable;
  data: BoardListResponse;
};

function formatDate(datetime: string): string {
  return datetime.slice(0, 10).replace(/-/g, '.');
}

function BoardListCard({ item, boTable }: { item: BoardListItem; boTable: BoTable }) {
  const href = `/${boTable}/${item.wr_id}`;

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

function EmptyState() {
  return <div className="py-20 text-center text-[15px] text-[#999]">등록된 게시물이 없습니다.</div>;
}

function Pagination({ boTable, page, totalPages }: { boTable: BoTable; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;

  const prevHref = page > 1 ? `/${boTable}?page=${page - 1}` : null;
  const nextHref = page < totalPages ? `/${boTable}?page=${page + 1}` : null;

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

export default function BoardListSection({ boTable, data }: BoardListSectionProps) {
  return (
    <section className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-[900px]">
        <p className="mb-1 text-right text-[13px] text-[#999]">총 {data.total.toLocaleString()}건</p>

        {data.items.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="border-t border-[#e8e8e8]">
            {data.items.map(item => (
              <BoardListCard key={item.wr_id} item={item} boTable={boTable} />
            ))}
          </ul>
        )}

        <Pagination boTable={boTable} page={data.page} totalPages={data.total_pages} />
      </div>
    </section>
  );
}
