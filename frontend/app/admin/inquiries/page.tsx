'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { INQUIRY_DETAIL_PATH } from '@/app/constants/inquiryAdmin';

import AdminSuperGuard from '../components/AdminSuperGuard';
import {
  buildExportUrl,
  fetchInquiryList,
  fetchIpInfo,
  PER_PAGE_DEFAULT,
  type InquiryListFilter,
  type InquiryListItem,
  type IpInfoResult,
} from '../lib/inquiryAdminApi';

/* ────────────────── 포맷 헬퍼 ────────────────── */

function formatDate(value: string | null): string {
  if (!value) return '-';
  return value.replace('T', ' ').substring(0, 16);
}

function formatPhone(tel: string | null): string {
  if (!tel) return '-';
  const d = tel.replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return tel;
}

function resolveRoute(item: InquiryListItem): string {
  const url = item.c_inflowurl ?? item.c_inflow ?? '';
  return url || '-';
}

/* ────────────────── IP 모달 ────────────────── */

type IpModalProps = {
  ip: string;
  info: IpInfoResult | null;
  loading: boolean;
  onClose: () => void;
};

function IpModal({ ip, info, loading, onClose }: IpModalProps) {
  const mapsHref = info?.loc
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.loc)}`
    : info
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [info.city, info.region, info.country].filter(Boolean).join(' '),
        )}`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#999] hover:text-[#333]"
          aria-label="닫기"
        >
          ✕
        </button>
        <h2 className="mb-4 text-base font-semibold text-[#1a3151]">IP 정보: {ip}</h2>

        {loading && <p className="text-sm text-[#666]">조회 중…</p>}

        {!loading && info && !info.error && (
          <dl className="space-y-2 text-sm">
            {[
              ['위치', [info.city, info.region, info.country].filter(Boolean).join(', ')],
              ['통신사', info.org],
              ['시간대', info.timezone],
              ['좌표', info.loc],
              ['비고', info.note],
            ]
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <div key={String(label)} className="flex gap-2">
                  <dt className="w-16 shrink-0 font-medium text-[#999]">{label}</dt>
                  <dd className="text-[#333]">{String(value)}</dd>
                </div>
              ))}
          </dl>
        )}

        {!loading && info?.error && <p className="text-sm text-[#b42318]">{info.error}</p>}

        {mapsHref && !loading && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 rounded bg-[#1a3151] px-3 py-2 text-sm font-medium text-white hover:bg-[#264673]"
          >
            Google 지도에서 보기 ↗
          </a>
        )}
      </div>
    </div>
  );
}

/* ────────────────── 페이지네이션 ────────────────── */

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

function PaginationInput({ page, totalPages, onChange }: PaginationProps) {
  const [input, setInput] = useState(String(page));

  function jump() {
    let target = parseInt(input, 10);
    if (Number.isNaN(target) || target < 1) target = 1;
    if (target > totalPages) target = totalPages;
    onChange(target);
    setInput(String(target));
  }

  const maxShow = 5;
  let start = Math.max(1, page - Math.floor(maxShow / 2));
  const end = Math.min(totalPages, start + maxShow - 1);
  if (end - start + 1 < maxShow) start = Math.max(1, end - maxShow + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btnBase =
    'px-3 py-1.5 text-sm border rounded-md transition-colors disabled:opacity-40 hover:bg-[#f0f2f5] disabled:hover:bg-transparent';
  const numBase = 'w-9 h-9 text-sm border rounded-md transition-colors font-medium';

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-[#eee] pt-5">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(1)} disabled={page === 1} className={btnBase}>
          처음
        </button>
        <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className={btnBase}>
          이전
        </button>
        {pages.map(num => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`${numBase} ${num === page ? 'bg-[#1a3151] text-white border-[#1a3151]' : 'text-[#333] hover:bg-[#f0f2f5]'}`}
          >
            {num}
          </button>
        ))}
        <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages} className={btnBase}>
          다음
        </button>
        <button type="button" onClick={() => onChange(totalPages)} disabled={page === totalPages} className={btnBase}>
          끝
        </button>
      </div>
      <div className="flex items-center gap-2 border-l border-[#ddd] pl-4 text-sm">
        <span className="text-[#666]">이동:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={input}
          onChange={e => setInput(e.target.value)}
          onBlur={jump}
          onKeyDown={e => e.key === 'Enter' && jump()}
          className="w-14 rounded border px-2 py-1 text-center text-sm text-[#1a3151] font-bold focus:outline-none focus:ring-2 focus:ring-[#1a3151]"
          style={{ MozAppearance: 'textfield' }}
        />
        <span className="text-[#666]">/ {totalPages} 페이지</span>
      </div>
    </div>
  );
}

/* ────────────────── 테이블 패널 ────────────────── */

type TablePanelProps = {
  filter: InquiryListFilter;
  page: number;
  onPageChange: (p: number) => void;
  onIpClick: (ip: string) => void;
};

function TablePanel({ filter, page, onPageChange, onIpClick }: TablePanelProps) {
  const [items, setItems] = useState<InquiryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchInquiryList(page, PER_PAGE_DEFAULT, filter)
      .then(data => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter, page]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE_DEFAULT));

  const thClass = 'px-3 py-2.5 text-left text-xs font-semibold text-[#666] whitespace-nowrap';
  const tdClass = 'px-3 py-2.5 text-sm whitespace-nowrap';

  return (
    <>
      <p className="mb-3 text-sm text-[#666]">총 {total.toLocaleString()}건</p>

      {error && (
        <p className="mb-4 text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}

      {loading && <p className="py-8 text-center text-sm text-[#666]">불러오는 중…</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded border border-[#e8e8e8] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-[#1a3151] bg-[#f8f9fb]">
              <tr>
                <th className={thClass}>NO</th>
                <th className={thClass}>접수일</th>
                <th className={thClass}>이름</th>
                <th className={thClass}>연락처</th>
                <th className={thClass}>상태</th>
                <th className={thClass}>경로</th>
                <th className={thClass}>진행상태</th>
                <th className={thClass}>유입채널</th>
                <th className={thClass}>유입광고</th>
                <th className={thClass}>IP</th>
                <th className={thClass}>차단</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-sm text-[#999]">
                    검색 조건에 맞는 문의가 없습니다.
                  </td>
                </tr>
              )}
              {items.map(item => {
                const isBlocked = item.block === '1';
                return (
                  <tr
                    key={item.idx}
                    className={`border-b border-[#f0f0f0] hover:bg-[#f5f7fb] ${isBlocked ? 'opacity-60' : ''}`}
                  >
                    <td className={`${tdClass} text-[#999]`}>{item.idx}</td>
                    <td className={`${tdClass} text-[#666]`}>{formatDate(item.c_date)}</td>
                    <td className={tdClass}>
                      <Link href={INQUIRY_DETAIL_PATH(item.idx)} className="font-medium text-[#1a3151] hover:underline">
                        {item.c_name ?? '-'}
                      </Link>
                    </td>
                    <td className={tdClass}>{formatPhone(item.c_tel)}</td>
                    <td className={tdClass}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          item.c_state === '상담접수'
                            ? 'bg-blue-100 text-blue-800'
                            : item.c_state === '연락완료'
                              ? 'bg-green-100 text-green-800'
                              : item.c_state === '상담종료'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.c_state ?? '-'}
                      </span>
                    </td>
                    <td className={`${tdClass} max-w-[120px] truncate text-[#666]`}>{resolveRoute(item)}</td>
                    <td className={`${tdClass} max-w-[100px] truncate text-[#666]`}>{item.c_state2 ?? '-'}</td>
                    <td className={`${tdClass} text-[#666]`}>{item.utm_source ?? '-'}</td>
                    <td className={`${tdClass} max-w-[120px] truncate text-[#666]`}>{item.utm_campaign ?? '-'}</td>
                    <td className={tdClass}>
                      {item.userip ? (
                        <button
                          type="button"
                          onClick={() => onIpClick(item.userip!)}
                          className="text-blue-600 hover:underline"
                          title="IP 정보 및 지도 보기"
                        >
                          {item.userip}
                        </button>
                      ) : (
                        <span className="text-[#999]">-</span>
                      )}
                    </td>
                    <td className={`${tdClass} font-medium ${isBlocked ? 'text-[#b42318]' : 'text-[#999]'}`}>
                      {isBlocked ? 'Y' : 'N'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PaginationInput key={page} page={page} totalPages={totalPages} onChange={onPageChange} />
    </>
  );
}

/* ────────────────── 메인 콘텐츠 ────────────────── */

function InquiryListContent() {
  const [filter, setFilter] = useState<InquiryListFilter>({});
  const [draftFilter, setDraftFilter] = useState<InquiryListFilter>({});
  const [page, setPage] = useState(1);

  const [ipTarget, setIpTarget] = useState<string | null>(null);
  const [ipInfo, setIpInfo] = useState<IpInfoResult | null>(null);
  const [ipLoading, setIpLoading] = useState(false);

  function applyFilter() {
    setFilter({ ...draftFilter });
    setPage(1);
  }

  function resetFilter() {
    setDraftFilter({});
    setFilter({});
    setPage(1);
  }

  function handleIpClick(ip: string) {
    setIpTarget(ip);
    setIpInfo(null);
    setIpLoading(true);
    fetchIpInfo(ip)
      .then(info => setIpInfo(info))
      .catch(() => setIpInfo({ ok: false, ip, error: 'IP 정보를 불러오지 못했습니다.' }))
      .finally(() => setIpLoading(false));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#1a3151]">상담 문의</h1>

      {/* ── 필터 바 ── */}
      <div className="rounded border border-[#e0e0e0] bg-[#f8f9fb] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#666]">기간</label>
            <div className="flex items-center gap-1 rounded border bg-white px-2 py-1.5">
              <input
                type="date"
                value={draftFilter.date_from ?? ''}
                onChange={e => setDraftFilter(prev => ({ ...prev, date_from: e.target.value || undefined }))}
                className="text-sm focus:outline-none"
              />
              <span className="text-[#999]">~</span>
              <input
                type="date"
                value={draftFilter.date_to ?? ''}
                onChange={e => setDraftFilter(prev => ({ ...prev, date_to: e.target.value || undefined }))}
                className="text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="mb-1 block text-xs font-medium text-[#666]">이름 / 전화번호</label>
            <input
              type="text"
              placeholder="검색어 입력"
              value={draftFilter.q ?? ''}
              onChange={e => setDraftFilter(prev => ({ ...prev, q: e.target.value || undefined }))}
              onKeyDown={e => e.key === 'Enter' && applyFilter()}
              className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3151]"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyFilter}
              className="rounded bg-[#1a3151] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#264673]"
            >
              검색
            </button>
            <button
              type="button"
              onClick={resetFilter}
              className="rounded border border-[#ddd] bg-white px-4 py-1.5 text-sm text-[#666] hover:bg-[#f5f5f5]"
            >
              초기화
            </button>
            <a
              href={buildExportUrl(filter)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
              title="현재 필터 결과를 CSV로 다운로드"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              엑셀 다운로드
            </a>
          </div>
        </div>
      </div>

      {/* ── 테이블 ── */}
      <TablePanel
        key={JSON.stringify(filter) + '_' + String(page)}
        filter={filter}
        page={page}
        onPageChange={setPage}
        onIpClick={handleIpClick}
      />

      {/* ── IP 모달 ── */}
      {ipTarget !== null && (
        <IpModal
          ip={ipTarget}
          info={ipInfo}
          loading={ipLoading}
          onClose={() => {
            setIpTarget(null);
            setIpInfo(null);
          }}
        />
      )}
    </div>
  );
}

export default function AdminInquiriesPage() {
  return (
    <AdminSuperGuard>
      <InquiryListContent />
    </AdminSuperGuard>
  );
}
