'use client';

import { useEffect, useState } from 'react';

import { offsetDatetimeLocal, validateFutureDatetime } from '../../lib/boardPostTypes';

type ScheduleOption = '10' | '30' | 'custom';

type SchedulePublishModalProps = {
  loading: boolean;
  onClose: () => void;
  onConfirm: (scheduledLocal: string) => void;
};

const MODAL_BTN = 'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60';

export default function SchedulePublishModal({ loading, onClose, onConfirm }: SchedulePublishModalProps) {
  const [option, setOption] = useState<ScheduleOption>('10');
  const [customDatetime, setCustomDatetime] = useState(() => offsetDatetimeLocal(10));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !loading) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [loading, onClose]);

  function resolveScheduledLocal(): string {
    if (option === '10') return offsetDatetimeLocal(10);
    if (option === '30') return offsetDatetimeLocal(30);
    return customDatetime;
  }

  function handleConfirm() {
    const scheduledLocal = resolveScheduledLocal();
    const validationError = validateFutureDatetime(scheduledLocal);
    if (validationError !== null) {
      setError(validationError);
      return;
    }
    setError(null);
    onConfirm(scheduledLocal);
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 px-4"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded bg-white p-6 shadow-xl"
        role="dialog"
        aria-labelledby="schedule-modal-title"
        aria-modal="true"
        onClick={event => event.stopPropagation()}
      >
        <h2 id="schedule-modal-title" className="mb-4 text-lg font-semibold text-[#1a3151]">
          발행 예정 시각
        </h2>

        <fieldset className="space-y-3" disabled={loading}>
          <legend className="sr-only">발행 예정 시각 선택</legend>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#333]">
            <input
              type="radio"
              name="schedule_option"
              value="10"
              checked={option === '10'}
              onChange={() => {
                setOption('10');
                setError(null);
              }}
              className="h-4 w-4 cursor-pointer"
            />
            10분 후 (기본)
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#333]">
            <input
              type="radio"
              name="schedule_option"
              value="30"
              checked={option === '30'}
              onChange={() => {
                setOption('30');
                setError(null);
              }}
              className="h-4 w-4 cursor-pointer"
            />
            30분 후
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[#333]">
              <input
                type="radio"
                name="schedule_option"
                value="custom"
                checked={option === 'custom'}
                onChange={() => {
                  setOption('custom');
                  setError(null);
                }}
                className="h-4 w-4 cursor-pointer"
              />
              직접 지정
            </label>
            <input
              type="datetime-local"
              value={customDatetime}
              disabled={option !== 'custom'}
              onChange={event => {
                setCustomDatetime(event.target.value);
                setError(null);
              }}
              className="border border-[#ddd] px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#999]"
            />
          </div>
        </fieldset>

        {error !== null && (
          <p className="mt-3 text-sm text-[#b42318]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className={`bg-[#1a3151] px-4 py-2 text-sm font-medium text-white ${MODAL_BTN}`}
          >
            {loading ? '저장 중…' : '예약하기'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className={`border border-[#ddd] px-4 py-2 text-sm text-[#333] ${MODAL_BTN}`}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
