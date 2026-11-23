import { useCallback, useEffect, useRef } from 'react';

/**
 * 커서가 대상 위에 `delayMs` 이상 머물 때만 `onIntent`를 실행한다.
 * 목표 항목으로 이동하며 지나치는 행이 의도치 않게 펼쳐지는 것을 막는다.
 */
export function useHoverIntent(onIntent: () => void, delayMs: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const schedule = useCallback(() => {
    cancel();
    timerRef.current = setTimeout(onIntent, delayMs);
  }, [cancel, delayMs, onIntent]);

  useEffect(() => cancel, [cancel]);

  return { schedule, cancel };
}
