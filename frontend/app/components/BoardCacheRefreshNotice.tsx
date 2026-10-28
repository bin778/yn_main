'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  BOARD_CACHE_REFRESH_EVENT,
  refreshBoardCache,
  type BoardCacheRefreshRequest,
  type BoardCacheRefreshResult,
} from '../lib/boardCacheRefresh';

export default function BoardCacheRefreshNotice() {
  const router = useRouter();
  const [pending, setPending] = useState<BoardCacheRefreshRequest[]>([]);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    function onRefresh(event: Event) {
      const { request, ok } = (event as CustomEvent<BoardCacheRefreshResult>).detail;
      const key = JSON.stringify(request);
      setPending(previous => {
        const remaining = previous.filter(item => JSON.stringify(item) !== key);
        return ok ? remaining : [...remaining, request];
      });
    }
    window.addEventListener(BOARD_CACHE_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(BOARD_CACHE_REFRESH_EVENT, onRefresh);
  }, []);

  async function retry() {
    setRetrying(true);
    try {
      const results = await Promise.all(pending.map(refreshBoardCache));
      if (results.every(Boolean)) router.refresh();
    } finally {
      setRetrying(false);
    }
  }

  if (pending.length === 0) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 z-[200] mx-auto max-w-[640px] border border-[#b42318] bg-white p-4 text-sm text-[#333]"
    >
      <p>변경은 저장됐지만 공개 화면 갱신이 지연되고 있습니다. 글을 다시 저장하거나 삭제할 필요는 없습니다.</p>
      <button
        type="button"
        disabled={retrying}
        onClick={() => void retry()}
        className="mt-3 cursor-pointer rounded border border-[#1a3151] px-3 py-2 text-[#1a3151] disabled:opacity-60"
      >
        {retrying ? '갱신 중…' : '화면 갱신 재시도'}
      </button>
    </div>
  );
}
