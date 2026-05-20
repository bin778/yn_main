'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'yeoon_home_popup_dismissed_v1';

export default function HomePopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const dismissed = window.localStorage.getItem(STORAGE_KEY);
        if (dismissed !== '1') setVisible(true);
      } catch {
        setVisible(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore quota / private mode */
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="home-popup-title"
    >
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl">
        <h2 id="home-popup-title" className="text-lg font-bold text-[#121212]">
          안내
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#555]">
          레거시 사이트의 팝업 레이어를 대체하는 영역입니다. 필요 시 공지 이미지나 링크를 이 컴포넌트에 연결하세요.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-[#333] hover:bg-gray-50"
            onClick={dismiss}
          >
            오늘 하루 안 보기
          </button>
          <button
            type="button"
            className="rounded bg-[#023373] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            onClick={dismiss}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
