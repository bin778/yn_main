'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { boardAdminLogin } from '@/app/(story)/lib/boardAdminApi';

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mbId, setMbId] = useState('');
  const [mbPassword, setMbPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectTo = searchParams.get('url') || '/news/';
  const fromLegacy = searchParams.get('from') === 'legacy';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await boardAdminLogin(mbId.trim(), mbPassword);
      router.push(redirectTo);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {fromLegacy ? (
        <p className="mb-4 rounded border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1e3a5f]" role="status">
          게시판 관리(글쓰기·수정·삭제)는 이 페이지에서 로그인해 주세요. 구 주소(
          <code className="text-[12px]">/board/bbs/login.php</code>)는 사용하지 않습니다.
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4 border border-[#e8e8e8] bg-white p-6">
        <div>
          <label htmlFor="mb_id" className="mb-1 block text-sm font-medium text-[#333]">
            아이디
          </label>
          <input
            id="mb_id"
            name="mb_id"
            type="text"
            autoComplete="username"
            required
            value={mbId}
            onChange={event => setMbId(event.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="mb_password" className="mb-1 block text-sm font-medium text-[#333]">
            비밀번호
          </label>
          <input
            id="mb_password"
            name="mb_password"
            type="password"
            autoComplete="current-password"
            required
            value={mbPassword}
            onChange={event => setMbPassword(event.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm"
          />
        </div>
        {error !== null && (
          <p className="text-sm text-[#b42318]" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a3151] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#666]">
        <Link href="/" className="underline">
          홈으로
        </Link>
      </p>
    </>
  );
}
