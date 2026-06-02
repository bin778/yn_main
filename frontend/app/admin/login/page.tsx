import { Suspense } from 'react';

import AdminLoginForm from './AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold text-[#1a3151]">게시판 관리자 로그인</h1>
      <p className="mb-8 text-sm text-[#666]">게시물 관리나 관리자 페이지 접근을 위한 관리자 계정으로 로그인합니다.</p>

      <Suspense fallback={<p className="text-sm text-[#666]">로딩 중…</p>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
