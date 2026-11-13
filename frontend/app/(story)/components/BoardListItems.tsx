/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { getBoardSectionDisplayLabel } from '../constants/boardSections';
import { formatBoardAuthorLabel, formatBoardPostMetaLine } from '../lib/formatBoardAuthor';
import { buildBoardPostHref } from '../lib/boardPostPath';
import type { BoardListItem, BoTable } from '../types/board';
import BoardListBulkToolbar, { CHECKBOX_CLASS } from './BoardListBulkToolbar';
import { useBoardListBulkActions } from './useBoardListBulkActions';

type BoardListItemsProps = {
  boTable: BoTable;
  items: BoardListItem[];
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

function SectionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-[#d8dee8] bg-[#f5f7fa] px-1.5 py-0.5 text-[11px] font-medium text-[#1a3151]">
      {label}
    </span>
  );
}

export default function BoardListItems({ boTable, items, view }: BoardListItemsProps) {
  const { isAdmin, selectedIds, toggleId, ...toolbar } = useBoardListBulkActions(boTable, items);

  return (
    <div>
      <BoardListBulkToolbar boTable={boTable} itemCount={items.length} {...toolbar} visible={isAdmin} />

      {items.length === 0 ? (
        <div className="py-20 text-center text-[15px] text-[#999]">등록된 게시물이 없습니다.</div>
      ) : view === 'grid' ? (
        <ul className="grid gap-4 border-t border-[#e8e8e8] pt-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <GridCard
              key={item.wr_id}
              item={item}
              boTable={boTable}
              isAdmin={isAdmin}
              checked={selectedIds.has(item.wr_id)}
              onToggle={() => toggleId(item.wr_id)}
            />
          ))}
        </ul>
      ) : (
        <ul className="border-t border-[#e8e8e8]">
          {items.map(item => (
            <ListRow
              key={item.wr_id}
              item={item}
              boTable={boTable}
              isAdmin={isAdmin}
              checked={selectedIds.has(item.wr_id)}
              onToggle={() => toggleId(item.wr_id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ListRow({
  item,
  boTable,
  isAdmin,
  checked,
  onToggle,
}: {
  item: BoardListItem;
  boTable: BoTable;
  isAdmin: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const href = buildBoardPostHref(boTable, item.wr_id, item.wr_seo_slug);
  const authorLabel = formatBoardAuthorLabel(boTable, item.wr_name);
  const sectionLabel = getBoardSectionDisplayLabel(boTable, item.wr_7 ?? '', item.wr_8 ?? '');

  return (
    <li className="flex items-start gap-3 border-b border-[#e8e8e8] last:border-b-0">
      {isAdmin ? (
        <label className="mt-7 shrink-0 cursor-pointer pl-1 md:pl-4">
          <input type="checkbox" checked={checked} onChange={onToggle} className={CHECKBOX_CLASS} />
          <span className="sr-only">{item.wr_subject} 선택</span>
        </label>
      ) : null}
      <Link
        href={href}
        className={`group flex min-w-0 flex-1 items-start gap-4 py-6 transition-colors md:gap-6 md:pr-4 ${
          item.notice ? 'bg-[#f5f7fa] hover:bg-[#eef1f6]' : 'hover:bg-[#f8f8f8]'
        } ${isAdmin ? '' : 'md:px-4'}`}
      >
        {item.thumbnail_url !== null && (
          <div className="relative hidden h-[80px] w-[120px] shrink-0 overflow-hidden bg-[#f0f0f0] md:block">
            <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[16px] font-bold leading-snug tracking-tight text-[#121212] group-hover:text-[#1a3151] md:text-[18px]">
            {item.notice ? <NoticeBadge /> : null}
            {isAdmin && sectionLabel !== null ? <SectionBadge label={sectionLabel} /> : null}
            <span className="truncate">{item.wr_subject}</span>
          </p>
          <div className="mt-2 flex items-center gap-3 text-[12px] text-[#999] md:text-[13px]">
            <span>{authorLabel}</span>
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

function GridCard({
  item,
  boTable,
  isAdmin,
  checked,
  onToggle,
}: {
  item: BoardListItem;
  boTable: BoTable;
  isAdmin: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const href = buildBoardPostHref(boTable, item.wr_id, item.wr_seo_slug);
  const metaLine = formatBoardPostMetaLine(boTable, item.wr_name, item.wr_datetime, item.wr_hit, formatDate);
  const sectionLabel = getBoardSectionDisplayLabel(boTable, item.wr_7 ?? '', item.wr_8 ?? '');

  return (
    <li
      className={`relative h-full border border-[#e8e8e8] ${item.notice ? 'ring-1 ring-inset ring-[#1a3151]/20' : ''}`}
    >
      {isAdmin ? (
        <label className="absolute left-2 top-2 z-10 cursor-pointer bg-white/90 p-1">
          <input type="checkbox" checked={checked} onChange={onToggle} className={CHECKBOX_CLASS} />
          <span className="sr-only">{item.wr_subject} 선택</span>
        </label>
      ) : null}
      <Link href={href} className="group flex h-full flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f0f0f0]">
          {item.thumbnail_url !== null ? (
            <img
              src={item.thumbnail_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
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
          {isAdmin && sectionLabel !== null ? (
            <p className="mt-2">
              <SectionBadge label={sectionLabel} />
            </p>
          ) : null}
          <p className="mt-auto pt-3 text-[12px] text-[#999]">{metaLine}</p>
        </div>
      </Link>
    </li>
  );
}
