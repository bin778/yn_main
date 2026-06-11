'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { boardAdminLogin, fetchBoardAdminMe, isAnyAdmin } from '@/app/(story)/lib/boardAdminApi';
import { ADMIN_HUB_PATH } from '@/app/constants/adminAuth';

function resolveRedirectPath(url: string | null): string {
  if (url === null || url === '' || !url.startsWith('/') || url.startsWith('//')) {
    return ADMIN_HUB_PATH;
  }
  return url;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mbId, setMbId] = useState('');
  const [mbPassword, setMbPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  const redirectTo = resolveRedirectPath(searchParams.get('url'));

  useEffect(() => {
    let cancelled = false;

    fetchBoardAdminMe()
      .then(session => {
        if (cancelled) return;
        if (isAnyAdmin(session)) {
          router.replace(redirectTo);
          return;
        }
        setSessionChecked(true);
      })
      .catch(() => {
        if (!cancelled) setSessionChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [redirectTo, router]);

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

  if (!sessionChecked) {
    return <p className="text-sm text-[#666]">확인 중…</p>;
  }

  return (
    <>
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
