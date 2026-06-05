'use client';

import { useEffect, type RefObject } from 'react';

export function useClickOutside(refs: RefObject<HTMLElement | null>[], onOutside: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    function handleMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedInside = refs.some(ref => ref.current !== null && ref.current.contains(target));
      if (!clickedInside) onOutside();
    }

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
    // refs 배열은 RefObject 인스턴스가 고정이므로 deps에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs
  }, [onOutside, enabled]);
}
