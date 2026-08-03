'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { RECAPTCHA_SITE_KEY } from '@/app/constants/contactContent';
import {
  LazyReCaptchaContext,
  type ExecuteRecaptcha,
  type LazyReCaptchaInternalContextValue,
  useLazyReCaptchaInternal,
} from '@/app/components/contact/lazyReCaptchaContext';

function RecaptchaBridge() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { registerExecuteRecaptcha } = useLazyReCaptchaInternal();

  useEffect(() => {
    if (executeRecaptcha) {
      registerExecuteRecaptcha(executeRecaptcha);
    }
  }, [executeRecaptcha, registerExecuteRecaptcha]);

  return null;
}

/** 폼 상호작용 전까지 reCAPTCHA 스크립트를 로드하지 않음. 사이트 키 없으면 children만 렌더. */
export function LazyReCaptchaProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [executeRecaptcha, setExecuteRecaptcha] = useState<ExecuteRecaptcha | undefined>();

  const activate = useCallback(() => {
    setIsActive(prev => prev || true);
  }, []);

  const registerExecuteRecaptcha = useCallback((fn: ExecuteRecaptcha) => {
    setExecuteRecaptcha(() => fn);
  }, []);

  const contextValue: LazyReCaptchaInternalContextValue = {
    activate,
    isActive,
    executeRecaptcha,
    registerExecuteRecaptcha,
  };

  if (RECAPTCHA_SITE_KEY === '') {
    return <>{children}</>;
  }

  return (
    <LazyReCaptchaContext.Provider value={contextValue}>
      {isActive && (
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
          <RecaptchaBridge />
        </GoogleReCaptchaProvider>
      )}
      {children}
    </LazyReCaptchaContext.Provider>
  );
}
