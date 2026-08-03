import { createContext, useContext } from 'react';

export type ExecuteRecaptcha = (action?: string) => Promise<string>;

export type LazyReCaptchaContextValue = {
  activate: () => void;
  isActive: boolean;
  executeRecaptcha?: ExecuteRecaptcha;
};

export type LazyReCaptchaInternalContextValue = LazyReCaptchaContextValue & {
  registerExecuteRecaptcha: (fn: ExecuteRecaptcha) => void;
};

export const LazyReCaptchaContext = createContext<LazyReCaptchaInternalContextValue>({
  activate: () => {},
  isActive: false,
  registerExecuteRecaptcha: () => {},
});

export function useLazyReCaptcha(): LazyReCaptchaContextValue {
  const { activate, isActive, executeRecaptcha } = useContext(LazyReCaptchaContext);
  return { activate, isActive, executeRecaptcha };
}

export function useLazyReCaptchaInternal() {
  return useContext(LazyReCaptchaContext);
}
