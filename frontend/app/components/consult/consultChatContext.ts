import { createContext, useContext } from 'react';

type ConsultChatContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

export const ConsultChatContext = createContext<ConsultChatContextValue>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function useConsultChat() {
  return useContext(ConsultChatContext);
}
