/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { ALLOWED_BO_TABLES, BOARD_META } from '../constants/boardContent';
import {
  getBoardSection,
  getBoardSectionDisplayLabel,
  getBoardSections,
  hasBoardSections,
  validateBoardSectionSelection,
} from '../constants/boardSections';
import { formatBoardAuthorLabel, formatBoardPostMetaLine } from '../lib/formatBoardAuthor';
import { buildBoardPostHref } from '../lib/boardPostPath';
import {
  bulkUpdateBoardPosts,
  fetchBoardAdminMe,
  isAnyAdmin,
  revalidateBoardLists,
} from '../lib/boardAdminApi';
import type { BoardListItem, BoTable } from '../types/board';

const CHECKBOX_CLASS = 'h-4 w-4 shrink-0 cursor-pointer accent-[#1a3151]';

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

function SectionSelects({
  boTable,
  category,
  subcategory,
  idPrefix,
  disabled,
  onCategoryChange,
  onSubcategoryChange,
}: {
  boTable: BoTable;
  category: string;
  subcategory: string;
  idPrefix: string;
  disabled: boolean;
  onCategoryChange: (value: string) => void;
  onSubcategoryChange: (value: string) => void;
}) {
  if (!hasBoardSections(boTable)) return null;

  const sections = getBoardSections(boTable);
  const children = getBoardSection(boTable, category)?.children ?? [];

  return (
    <>
      <select
        id={`${idPrefix}-category`}
        value={category}
        disabled={disabled}
        onChange={event => onCategoryChange(event.target.value)}
        className="h-10 border border-[#ddd] bg-white px-2 text-[13px] text-[#121212] outline-none focus:border-[#1a3151] disabled:bg-[#f5f5f5]"
        aria-label="분류"
      >
        <option value="">분류 선택</option>
        {sections.map(section => (
          <option key={section.slug} value={section.slug}>
            {section.label}
          </option>
        ))}
      </select>
      {children.length > 0 ? (
        <select
          id={`${idPrefix}-subcategory`}
          value={subcategory}
          disabled={disabled}
          onChange={event => onSubcategoryChange(event.target.value)}
          className="h-10 border border-[#ddd] bg-white px-2 text-[13px] text-[#121212] outline-none focus:border-[#1a3151] disabled:bg-[#f5f5f5]"
          aria-label="하위 분류"
        >
          <option value="">하위 분류 선택</option>
          {children.map(child => (
            <option key={child.slug} value={child.slug}>
              {child.label}
            </option>
          ))}
        </select>
      ) : null}
    </>
  );
}

export default function BoardListItems({ boTable, items, view }: BoardListItemsProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [sectionCategory, setSectionCategory] = useState('');
  const [sectionSubcategory, setSectionSubcategory] = useState('');
  const [targetBoTable, setTargetBoTable] = useState<BoTable | ''>('');
  const [moveCategory, setMoveCategory] = useState('');
  const [moveSubcategory, setMoveSubcategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchBoardAdminMe(boTable)
      .then(session => {
        if (!cancelled) setIsAdmin(isAnyAdmin(session));
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [boTable]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [items]);

  const pageIds = useMemo(() => items.map(item => item.wr_id), [items]);
  const selectedCount = selectedIds.size;
  const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
  const moveTargets = ALLOWED_BO_TABLES.filter(table => table !== boTable);

  function toggleId(wrId: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(wrId)) next.delete(wrId);
      else next.add(wrId);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(pageIds));
  }

  async function runBulk(
    action: 'section' | 'move',
    wr7: string,
    wr8: string,
    destBoTable?: BoTable,
  ) {
    if (selectedCount === 0) {
      setError('게시물을 선택해 주세요.');
      return;
    }

    const destTable = action === 'move' ? destBoTable : boTable;
    if (action === 'move' && destTable === undefined) {
      setError('이동할 게시판을 선택해 주세요.');
      return;
    }

    const sectionError = validateBoardSectionSelection(destTable ?? boTable, wr7, wr8);
    if (sectionError !== null) {
      setError(sectionError);
      return;
    }

    const confirmMessage =
      action === 'move'
        ? `선택한 ${selectedCount}건을 ${BOARD_META[destTable ?? boTable].label}(으)로 이동할까요?`
        : `선택한 ${selectedCount}건의 분류를 변경할까요?`;
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    setError(null);

    try {
      await bulkUpdateBoardPosts(boTable, [...selectedIds], action, {
        wr_7: wr7,
        wr_8: wr8,
        targetBoTable: destTable,
      });
      await revalidateBoardLists(boTable, destTable !== undefined && destTable !== boTable ? [destTable] : []);
      setSelectedIds(new Set());
      router.refresh();
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : '처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {isAdmin ? (
        <div className="mb-3 border border-[#e8e8e8] bg-[#f8f9fb] px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#333]">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                disabled={loading || items.length === 0}
                className={CHECKBOX_CLASS}
              />
              현재 페이지 전체
            </label>
            <span className="text-[13px] text-[#666]">선택 {selectedCount}건</span>
          </div>

          {hasBoardSections(boTable) ? (
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <p className="w-full text-[12px] font-medium text-[#555]">분류 변경</p>
              <SectionSelects
                boTable={boTable}
                category={sectionCategory}
                subcategory={sectionSubcategory}
                idPrefix="bulk-section"
                disabled={loading}
                onCategoryChange={value => {
                  setSectionCategory(value);
                  setSectionSubcategory('');
                }}
                onSubcategoryChange={setSectionSubcategory}
              />
              <button
                type="button"
                disabled={loading || selectedCount === 0}
                onClick={() => void runBulk('section', sectionCategory, sectionSubcategory)}
                className="h-10 cursor-pointer border border-[#1a3151] bg-[#1a3151] px-3 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                분류 적용
              </button>
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-end gap-2">
            <p className="w-full text-[12px] font-medium text-[#555]">게시판 이동</p>
            <select
              value={targetBoTable}
              disabled={loading}
              onChange={event => {
                setTargetBoTable(event.target.value as BoTable | '');
                setMoveCategory('');
                setMoveSubcategory('');
              }}
              className="h-10 border border-[#ddd] bg-white px-2 text-[13px] text-[#121212] outline-none focus:border-[#1a3151] disabled:bg-[#f5f5f5]"
              aria-label="이동할 게시판"
            >
              <option value="">게시판 선택</option>
              {moveTargets.map(table => (
                <option key={table} value={table}>
                  {BOARD_META[table].label}
                </option>
              ))}
            </select>
            {targetBoTable !== '' ? (
              <SectionSelects
                boTable={targetBoTable}
                category={moveCategory}
                subcategory={moveSubcategory}
                idPrefix="bulk-move"
                disabled={loading}
                onCategoryChange={value => {
                  setMoveCategory(value);
                  setMoveSubcategory('');
                }}
                onSubcategoryChange={setMoveSubcategory}
              />
            ) : null}
            <button
              type="button"
              disabled={loading || selectedCount === 0 || targetBoTable === ''}
              onClick={() => {
                if (targetBoTable === '') return;
                void runBulk('move', moveCategory, moveSubcategory, targetBoTable);
              }}
              className="h-10 cursor-pointer border border-[#1a3151] px-3 text-[13px] font-medium text-[#1a3151] hover:bg-[#1a3151] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              이동
            </button>
          </div>

          {error !== null ? (
            <p className="mt-2 text-[13px] text-[#b42318]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}

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
    <li className={`relative h-full border border-[#e8e8e8] ${item.notice ? 'ring-1 ring-inset ring-[#1a3151]/20' : ''}`}>
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
