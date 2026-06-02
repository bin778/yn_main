'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ALLOWED_BO_TABLES, BOARD_META, BOARD_PATH_SLUG } from '@/app/(story)/constants/boardContent';
import {
  boardAdminLogout,
  fetchBoardAdminMe,
  isAnyAdmin,
  isSuperAdmin,
  type BoardAdminMe,
} from '@/app/(story)/lib/boardAdminApi';
import { ADMIN_HUB_PATH, buildAdminLoginUrl } from '@/app/constants/adminAuth';
import { INQUIRY_LIST_PATH } from '@/app/constants/inquiryAdmin';

type AdminShellProps = {
  children: React.ReactNode;
};

const NAV_LINK_CLASS = 'text-sm text-[#333] hover:underline';
const NAV_ACTIVE_CLASS = 'text-sm font-medium text-[#1a3151]';

function navClass(isActive: boolean): string {
  return isActive ? NAV_ACTIVE_CLASS : NAV_LINK_CLASS;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<BoardAdminMe | null>(null);

  useEffect(() => {
    fetchBoardAdminMe()
      .then(session => {
        if (!isAnyAdmin(session)) {
          router.replace(buildAdminLoginUrl(pathname));
          return;
        }
        setMe(session);
      })
      .catch(() => {
        router.replace(buildAdminLoginUrl(pathname));
      });
  }, [pathname, router]);

  async function handleLogout() {
    if (!window.confirm('정말로 로그아웃 하시겠습니까?')) {
      return;
    }
    try {
      await boardAdminLogout();
      router.push(buildAdminLoginUrl());
      router.refresh();
    } catch {
      alert('로그아웃에 실패했습니다.');
    }
  }

  if (me === null) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#666]">확인 중…</div>;
  }

  const showInquiries = isSuperAdmin(me);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <header className="border-b border-[#e0e0e0] bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link href={ADMIN_HUB_PATH} className="text-lg font-semibold text-[#1a3151]">
              여온 관리자
            </Link>
            {me.mb_name !== null && <p className="mt-0.5 text-xs text-[#666]">{me.mb_name}님</p>}
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href={ADMIN_HUB_PATH} className={navClass(pathname === ADMIN_HUB_PATH)}>
              대시보드
            </Link>
            {showInquiries && (
              <Link href={INQUIRY_LIST_PATH} className={navClass(pathname.startsWith('/admin/inquiries'))}>
                상담 문의
              </Link>
            )}
            {ALLOWED_BO_TABLES.map(boTable => {
              const slug = BOARD_PATH_SLUG[boTable];
              const href = `/${slug}/`;
              return (
                <Link key={boTable} href={href} className={navClass(pathname.startsWith(`/${slug}`))}>
                  {BOARD_META[boTable].label}
                </Link>
              );
            })}
            <button type="button" onClick={handleLogout} className="text-sm text-[#666] underline hover:text-[#333]">
              로그아웃
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
