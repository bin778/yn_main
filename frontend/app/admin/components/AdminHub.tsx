'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ALLOWED_BO_TABLES, BOARD_META, BOARD_PATH_SLUG } from '@/app/(story)/constants/boardContent';
import { fetchBoardAdminMe, isSuperAdmin } from '@/app/(story)/lib/boardAdminApi';
import { INQUIRY_DETAIL_PATH, INQUIRY_LIST_PATH } from '@/app/constants/inquiryAdmin';

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

export default function AdminHub() {
  const [recentInquiries, setRecentInquiries] = useState<InquiryListItem[]>([]);
  const [showInquiries, setShowInquiries] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchBoardAdminMe().then(session => {
      if (!isSuperAdmin(session)) {
        return;
      }
      setShowInquiries(true);
      fetchInquiryList(1, 5)
        .then(data => setRecentInquiries(data.items))
        .catch(() => setLoadError('최근 문의를 불러오지 못했습니다.'));
    });
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold text-[#1a3151]">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-[#666]">게시판 글 관리와 상담 문의를 처리합니다.</p>
      </section>

      {showInquiries && (
        <section className="border border-[#e8e8e8] bg-white p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-[#333]">최근 상담 문의</h2>
            <Link href={INQUIRY_LIST_PATH} className="text-sm text-[#1a3151] underline">
              전체 보기
            </Link>
          </div>
          {loadError !== null && (
            <p className="text-sm text-[#b42318]" role="alert">
              {loadError}
            </p>
          )}
          {loadError === null && recentInquiries.length === 0 && (
            <p className="text-sm text-[#666]">접수된 문의가 없습니다.</p>
          )}
          {recentInquiries.length > 0 && (
            <ul className="divide-y divide-[#eee]">
              {recentInquiries.map(item => (
                <li key={item.idx} className="py-3">
                  <Link href={INQUIRY_DETAIL_PATH(item.idx)} className="block hover:bg-[#fafafa] -mx-2 px-2 py-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-[#333]">{item.c_name ?? '-'}</span>
                      <span className="text-[#666]">{item.c_tel ?? '-'}</span>
                      <span className="rounded bg-[#eef2f7] px-2 py-0.5 text-xs text-[#1a3151]">
                        {item.c_state ?? '-'}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-[#666]">{item.c_content ?? ''}</p>
                    <p className="mt-0.5 text-xs text-[#999]">{formatDate(item.c_date)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="border border-[#e8e8e8] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-[#333]">게시판</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ALLOWED_BO_TABLES.map(boTable => {
            const slug = BOARD_PATH_SLUG[boTable];
            const meta = BOARD_META[boTable];
            return (
              <li key={boTable}>
                <Link href={`/${slug}/`} className="block border border-[#e8e8e8] px-4 py-3 hover:border-[#1a3151]">
                  <span className="font-medium text-[#1a3151]">{meta.label}</span>
                  <span className="mt-1 block text-xs text-[#666]">목록 · 글쓰기</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
