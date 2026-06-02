'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { fetchBoardAdminMe, isAnyAdmin, isSuperAdmin } from '@/app/(story)/lib/boardAdminApi';
import { ADMIN_HUB_PATH, buildAdminLoginUrl } from '@/app/constants/adminAuth';

type AdminSuperGuardProps = {
  children: React.ReactNode;
};

export default function AdminSuperGuard({ children }: AdminSuperGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'forbidden'>('loading');

  useEffect(() => {
    fetchBoardAdminMe()
      .then(session => {
        if (!isAnyAdmin(session)) {
          router.replace(buildAdminLoginUrl('/admin/inquiries/'));
          return;
        }
        if (!isSuperAdmin(session)) {
          setStatus('forbidden');
          return;
        }
        setStatus('allowed');
      })
      .catch(() => {
        router.replace(buildAdminLoginUrl('/admin/inquiries/'));
      });
  }, [router]);

  if (status === 'loading') {
    return <p className="text-sm text-[#666]">권한 확인 중…</p>;
  }

  if (status === 'forbidden') {
    return (
      <div className="border border-[#e8e8e8] bg-white p-6">
        <h1 className="text-lg font-semibold text-[#1a3151]">접근 권한 없음</h1>
        <p className="mt-2 text-sm text-[#666]">상담 문의 관리는 최고관리자만 이용할 수 있습니다.</p>
        <p className="mt-4">
          <Link href={ADMIN_HUB_PATH} className="text-sm text-[#1a3151] underline">
            대시보드로 이동
          </Link>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
