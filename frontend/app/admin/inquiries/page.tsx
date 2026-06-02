'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { INQUIRY_DETAIL_PATH, INQUIRY_PER_PAGE_DEFAULT } from '@/app/constants/inquiryAdmin';

import AdminSuperGuard from '../components/AdminSuperGuard';
import { fetchInquiryList, type InquiryListItem } from '../lib/inquiryAdminApi';

function formatDate(value: string | null): string {
  if (value === null || value === '') {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('ko-KR');
}

type InquiryListPanelProps = {
  page: number;
  onPageChange: (page: number) => void;
};

function InquiryListPanel({ page, onPageChange }: InquiryListPanelProps) {
  const [items, setItems] = useState<InquiryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchInquiryList(page, INQUIRY_PER_PAGE_DEFAULT)
      .then(data => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(loadError => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : '목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / INQUIRY_PER_PAGE_DEFAULT));

  return (
    <>
      <p className="mt-1 text-sm text-[#666]">총 {total}건</p>

      {error !== null && (
        <p className="text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-[#666]">불러오는 중…</p>}

      {!loading && error === null && (
        <div className="overflow-x-auto border border-[#e8e8e8] bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[#eee] bg-[#fafafa]">
              <tr>
                <th className="px-3 py-2 font-medium text-[#333]">접수일</th>
                <th className="px-3 py-2 font-medium text-[#333]">이름</th>
                <th className="px-3 py-2 font-medium text-[#333]">연락처</th>
                <th className="px-3 py-2 font-medium text-[#333]">유입</th>
                <th className="px-3 py-2 font-medium text-[#333]">상태</th>
                <th className="px-3 py-2 font-medium text-[#333]">차단</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[#666]">
                    접수된 문의가 없습니다.
                  </td>
                </tr>
              )}
              {items.map(item => (
                <tr key={item.idx} className="border-b border-[#f0f0f0] hover:bg-[#fafafa]">
                  <td className="px-3 py-2 whitespace-nowrap text-[#666]">
                    <Link href={INQUIRY_DETAIL_PATH(item.idx)} className="block">
                      {formatDate(item.c_date)}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <Link href={INQUIRY_DETAIL_PATH(item.idx)} className="font-medium text-[#1a3151]">
                      {item.c_name ?? '-'}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{item.c_tel ?? '-'}</td>
                  <td className="px-3 py-2 text-[#666]">{item.c_inflow ?? '-'}</td>
                  <td className="px-3 py-2">{item.c_state ?? '-'}</td>
                  <td className="px-3 py-2">{item.block === '1' ? 'Y' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="border border-[#ddd] bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          >
            이전
          </button>
          <span className="text-sm text-[#666]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="border border-[#ddd] bg-white px-3 py-1.5 text-sm disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}

function InquiryListContent() {
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#1a3151]">상담 문의</h1>
        <InquiryListPanel key={page} page={page} onPageChange={setPage} />
      </div>
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
