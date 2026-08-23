'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { ConsultChatContext } from '@/app/components/consult/consultChatContext';

export function ConsultChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return <ConsultChatContext.Provider value={value}>{children}</ConsultChatContext.Provider>;
}
