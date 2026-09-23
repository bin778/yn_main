'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

import { ADMIN_PATH_PREFIX } from '@/app/constants/analyticsEvents';

const NOTICE_STORAGE_KEY = 'yeoon-chuseok-2026-hidden-on';
const NOTICE_YEAR = 2026;
const NOTICE_MONTH_INDEX = 8;
const NOTICE_LAST_DAY = 27;

const HOLIDAY_DAYS = [
  { weekday: '목', date: 24, label: '정', highlighted: false },
  { weekday: '금', date: 25, label: '상', highlighted: true },
  { weekday: '토', date: 26, label: '운', highlighted: false },
  { weekday: '일', date: 27, label: '영', highlighted: false },
] as const;

type NoticeSnapshot = 'pending' | 'open' | 'hidden' | 'closed';

const hideListeners = new Set<() => void>();

function subscribeHideState(listener: () => void) {
  hideListeners.add(listener);
  return () => {
    hideListeners.delete(listener);
  };
}

function notifyHideState() {
  hideListeners.forEach(listener => listener());
}

function getTodayStamp(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function isNoticePeriod(now: Date) {
  return now.getFullYear() === NOTICE_YEAR && now.getMonth() === NOTICE_MONTH_INDEX && now.getDate() <= NOTICE_LAST_DAY;
}

function getNoticeSnapshot(): NoticeSnapshot {
  if (!isNoticePeriod(new Date())) return 'closed';

  try {
    if (window.localStorage.getItem(NOTICE_STORAGE_KEY) === getTodayStamp()) return 'hidden';
  } catch (error) {
    console.error('Failed to read Chuseok notice preference.', error);
  }

  return 'open';
}

function getServerNoticeSnapshot(): NoticeSnapshot {
  return 'pending';
}

function hideNoticeForToday() {
  try {
    window.localStorage.setItem(NOTICE_STORAGE_KEY, getTodayStamp());
  } catch (error) {
    console.error('Failed to save Chuseok notice preference.', error);
  }
  notifyHideState();
}

export default function ChuseokNoticePopup() {
  const pathname = usePathname();
  const noticeState = useSyncExternalStore(subscribeHideState, getNoticeSnapshot, getServerNoticeSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isAdmin = pathname.startsWith(ADMIN_PATH_PREFIX);
  const visible = !isAdmin && !dismissed && noticeState === 'open';

  useEffect(() => {
    if (!visible) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setDismissed(true);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-5">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chuseok-notice-title"
        aria-describedby="chuseok-notice-description"
        tabIndex={-1}
        className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
      >
        <div className="relative min-h-[200px] overflow-hidden py-12 text-center text-white">
          <Image src="/img/chuseok.webp" alt="" fill className="object-cover object-right" sizes="340px" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/45" aria-hidden />
          <div className="relative z-[1]">
            <p className="text-[14px] tracking-[0.18em]">법무법인 여온</p>
            <h2 id="chuseok-notice-title" className="mt-3 text-[32px] leading-tight font-bold tracking-tight">
              추석 연휴
              <br />
              운영 안내
            </h2>
          </div>
        </div>

        <div className="px-6 pt-5 text-center">
          <p id="chuseok-notice-description" className="text-[14px] leading-relaxed text-[#333]">
            풍성한 한가위 보내세요.
            <br />
            주말·공휴일에도 법률상담이 가능합니다.
          </p>

          <ul className="mt-5 grid grid-cols-4 gap-2">
            {HOLIDAY_DAYS.map(day => (
              <li
                key={day.date}
                className={
                  day.highlighted
                    ? 'rounded-lg bg-[#1a3151] px-1 py-2.5 text-white'
                    : 'rounded-lg border border-[#e4e8ef] bg-[#f7f8fa] px-1 py-2.5 text-[#1a3151]'
                }
              >
                <p className={`text-[14px] ${day.highlighted ? 'text-white/80' : 'text-[#667085]'}`}>{day.weekday}</p>
                <p className="mt-0.5 text-[20px] leading-none font-bold">{day.date}</p>
                <p className={`mt-1 text-[18px] font-semibold ${day.highlighted ? 'text-white/90' : 'text-[#667085]'}`}>
                  {day.label}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex border-t border-[#e6e6e6]">
          <button
            type="button"
            className="flex-1 cursor-pointer py-3.5 text-[14px] text-[#666] transition-colors hover:bg-[#f4f6f8]"
            onClick={() => {
              hideNoticeForToday();
              setDismissed(true);
            }}
          >
            오늘 하루 보지 않기
          </button>
          <button
            type="button"
            className={
              'flex-1 cursor-pointer border-l border-[#e6e6e6] py-3.5 text-[14px] font-semibold ' +
              'text-[#1a3151] transition-colors hover:bg-[#f4f6f8]'
            }
            onClick={() => setDismissed(true)}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
