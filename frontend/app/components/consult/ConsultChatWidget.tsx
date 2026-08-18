'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { useConsultChat } from '@/app/components/consult/consultChatContext';
import { useLazyReCaptcha } from '@/app/components/contact/lazyReCaptchaContext';
import { CONSULT_CHAT_FORM_NAME, GA_EVENTS, GA_SOURCES } from '@/app/constants/analyticsEvents';
import {
  INQUIRY_API_URL,
  INQUIRY_FIELD_LIMITS,
  INQUIRY_STUB_MESSAGE,
  INQUIRY_VALIDATION_MESSAGES,
  RECAPTCHA_SITE_KEY,
} from '@/app/constants/contactContent';
import {
  CONSULT_CHAT_INFLOW,
  CONSULT_CHAT_LAWYER_IMAGES,
  CONSULT_CONTACT_STEP,
  CONSULT_QUESTIONS,
  CONSULT_TOTAL_STEPS,
  formatConsultContent,
  type ConsultAnswers,
} from '@/app/constants/consultFlow';
import { getInquiryAttribution } from '@/app/lib/inquiryInflow';
import { validateInquiryFields } from '@/app/lib/inquiryValidation';
import { trackGaEvent } from '@/app/lib/trackGaEvent';

const RECAPTCHA_ACTION = 'submit_consult';
const LAUNCHER_SLIDE_MS = 2500;
const LAUNCHER_SLIDES = [...CONSULT_CHAT_LAWYER_IMAGES, CONSULT_CHAT_LAWYER_IMAGES[0]];

type InquiryResponse = {
  result: string;
  msg: string;
};

function getInflowLabel(): string {
  if (typeof window === 'undefined') return CONSULT_CHAT_INFLOW.desktop;
  return window.matchMedia('(min-width: 768px)').matches ? CONSULT_CHAT_INFLOW.desktop : CONSULT_CHAT_INFLOW.mobile;
}

export default function ConsultChatWidget() {
  const { isOpen, open, close } = useConsultChat();
  const { activate, executeRecaptcha } = useLazyReCaptcha();
  const recaptchaEnabled = RECAPTCHA_SITE_KEY !== '';

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ConsultAnswers>({});
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launcherSlide, setLauncherSlide] = useState(0);
  const [launcherInstant, setLauncherInstant] = useState(false);

  const currentQuestion = step < CONSULT_CONTACT_STEP ? CONSULT_QUESTIONS[step] : null;
  const progress = ((step + 1) / CONSULT_TOTAL_STEPS) * 100;

  const resetChat = useCallback(() => {
    setStep(0);
    setAnswers({});
    setName('');
    setTel('');
    setAgreed(false);
  }, []);

  const handleClose = useCallback(() => {
    resetChat();
    close();
  }, [resetChat, close]);

  const handleOpen = () => {
    if (recaptchaEnabled) activate();
    open();
  };

  useEffect(() => {
    if (isOpen) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setLauncherInstant(false);
      setLauncherSlide(current => current + 1);
    }, LAUNCHER_SLIDE_MS);

    return () => window.clearInterval(intervalId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  const handleSelectOption = (option: string) => {
    if (!currentQuestion) return;
    setAnswers(current => ({ ...current, [currentQuestion.id]: option }));
    setStep(current => current + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(step - 1);
  };

  const handleFormInteraction = () => {
    if (recaptchaEnabled) activate();
  };

  const submitConsult = async () => {
    if (recaptchaEnabled) activate();

    if (recaptchaEnabled && !executeRecaptcha) {
      alert('보안 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!INQUIRY_API_URL) {
      alert(INQUIRY_STUB_MESSAGE);
      return;
    }

    const content = formatConsultContent(answers);
    const validation = validateInquiryFields({ name, tel, content });
    if (!validation.ok) {
      alert(validation.message);
      return;
    }

    const { name: validName, tel: validTel, content: validContent } = validation.values;
    const attribution = getInquiryAttribution();
    const caseKeyword = answers.topic ?? validContent;

    setIsSubmitting(true);
    try {
      let recaptchaToken = '';
      if (recaptchaEnabled && executeRecaptcha) {
        recaptchaToken = await executeRecaptcha(RECAPTCHA_ACTION);
      }

      const body = new URLSearchParams({
        c_name: validName,
        c_tel: validTel,
        c_content: validContent,
        c_option: caseKeyword,
        c_inflow: getInflowLabel(),
        c_inflowurl: attribution.inflowUrl,
      });
      if (attribution.gclid !== '') body.set('gclid', attribution.gclid);
      if (attribution.utmSource !== '') body.set('utm_source', attribution.utmSource);
      if (attribution.utmCampaign !== '') body.set('utm_campaign', attribution.utmCampaign);
      if (recaptchaToken !== '') body.set('recaptcha_token', recaptchaToken);

      const response = await fetch(INQUIRY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const data = (await response.json()) as InquiryResponse;
      if (data.result === '1') {
        trackGaEvent(GA_EVENTS.GENERATE_LEAD, {
          form_name: CONSULT_CHAT_FORM_NAME,
          link_source: GA_SOURCES.CONSULT_CHAT,
          inflow_url: attribution.inflowUrl,
        });
        alert(`${data.msg}\n담당 변호사가 확인 후 곧 연락드리겠습니다.`);
        resetChat();
        close();
      } else {
        alert(data.msg);
      }
    } catch {
      alert('요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!agreed) {
      alert(INQUIRY_VALIDATION_MESSAGES.agree);
      return;
    }

    const content = formatConsultContent(answers);
    const validation = validateInquiryFields({ name, tel, content });
    if (!validation.ok) {
      alert(validation.message);
      return;
    }

    setName(validation.values.name);
    void submitConsult();
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="1분 상담 시작"
          className={
            'h-16 w-16 cursor-pointer overflow-hidden rounded-full bg-[#023373] ' +
            'shadow-[0_10px_24px_rgba(15,23,42,0.14)] ring-2 ring-white/40 transition-transform ' +
            'hover:scale-105 hover:ring-white/70 md:h-20 md:w-20 [--launcher-size:64px] md:[--launcher-size:80px]'
          }
        >
          <span
            className={`flex w-max ${launcherInstant ? '' : 'transition-transform duration-500 ease-out'}`}
            style={{ transform: `translateX(calc(-${launcherSlide} * var(--launcher-size)))` }}
            onTransitionEnd={() => {
              if (launcherSlide >= CONSULT_CHAT_LAWYER_IMAGES.length) {
                setLauncherInstant(true);
                setLauncherSlide(0);
              }
            }}
          >
            {LAUNCHER_SLIDES.map((imageSrc, index) => (
              <Image
                key={`${imageSrc}-${index}`}
                src={imageSrc}
                alt=""
                width={80}
                height={80}
                sizes="(max-width: 768px) 64px, 80px"
                className="h-16 w-16 shrink-0 object-cover object-[center_12%] md:h-20 md:w-20"
              />
            ))}
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className={
            'absolute right-0 bottom-full z-10 mb-2 flex max-h-[min(28rem,calc(100dvh-10rem))] ' +
            'w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-2xl border ' +
            'border-gray-100 bg-white shadow-2xl md:mb-6'
          }
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-chat-title"
        >
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-[#023373] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="shrink-0 cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="이전 질문"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <p id="consult-chat-title" className="truncate text-sm font-bold text-[#023373] md:text-base">
                내 상황 확인하기
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] text-gray-400 md:text-xs">
                {step + 1}/{CONSULT_TOTAL_STEPS}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="상담 닫기"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {currentQuestion && (
              <div className="flex flex-col gap-4">
                <h3 className="break-keep text-sm font-bold leading-snug text-[#023373] md:text-base">
                  {currentQuestion.question}
                </h3>
                <div className="flex flex-col gap-2">
                  {currentQuestion.options.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={event => {
                        event.currentTarget.blur();
                        handleSelectOption(option);
                      }}
                      className={
                        'w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 ' +
                        'text-left text-sm font-medium break-keep text-[#023373] transition-colors ' +
                        'hover:border-[#023373] hover:bg-[#f3f5f9] focus:outline-none ' +
                        'focus-visible:ring-2 focus-visible:ring-[#023373] md:px-3.5 md:py-2.5 md:text-base'
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === CONSULT_CONTACT_STEP && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <h3 className="break-keep text-sm font-bold leading-snug text-[#023373] md:text-base">
                  입력하신 내용을 바탕으로 담당 변호사가 곧 연락드립니다.
                </h3>
                <input
                  type="text"
                  placeholder="성함"
                  value={name}
                  onFocus={handleFormInteraction}
                  onChange={event => setName(event.target.value)}
                  maxLength={INQUIRY_FIELD_LIMITS.name}
                  disabled={isSubmitting}
                  className={
                    'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 ' +
                    'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#023373]'
                  }
                />
                <input
                  type="tel"
                  placeholder="전화번호 (- 제외)"
                  value={tel}
                  onFocus={handleFormInteraction}
                  onChange={event => setTel(event.target.value.replace(/\D/g, ''))}
                  maxLength={INQUIRY_FIELD_LIMITS.tel}
                  disabled={isSubmitting}
                  className={
                    'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 ' +
                    'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#023373]'
                  }
                />
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={event => setAgreed(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#023373] focus:ring-[#023373]"
                  />
                  <span className="text-xs text-gray-600">
                    <Link href="/privacy" className="font-semibold text-[#023373] underline">
                      개인정보취급방침
                    </Link>{' '}
                    동의
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-white transition-colors ${
                    isSubmitting ? 'cursor-not-allowed bg-[#01285c]' : 'bg-[#023373] hover:bg-[#01285c]'
                  }`}
                >
                  {isSubmitting ? '접수 중...' : '상담 신청하기'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
