'use client';

import { useEffect } from 'react';

import { confirmLeave } from '../lib/adminPostFormDirty';

const LEAVE_GUARD_HISTORY_STATE = { adminPostLeaveGuard: true } as const;

function isLeaveGuardHistoryState(state: unknown): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    'adminPostLeaveGuard' in state &&
    (state as { adminPostLeaveGuard: unknown }).adminPostLeaveGuard === true
  );
}

export function useAdminPostLeaveGuard(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    function handleDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!anchor || anchor.getAttribute('target') === '_blank') return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      if (!confirmLeave()) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    window.history.pushState(LEAVE_GUARD_HISTORY_STATE, '');

    function handlePopState() {
      if (!confirmLeave()) {
        window.history.pushState(LEAVE_GUARD_HISTORY_STATE, '');
        return;
      }
      window.history.back();
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (isLeaveGuardHistoryState(window.history.state)) {
        window.history.back();
      }
    };
  }, [isDirty]);
}

export function handleAdminPostCancel(isDirty: boolean, navigate: () => void): void {
  if (isDirty && !confirmLeave()) return;
  navigate();
}
