'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { BsChatDotsFill } from 'react-icons/bs';

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
  CONSULT_CHAT_COPY,
  CONSULT_CHAT_INFLOW,
  CONSULT_TYPING_DELAY_MS,
  answersThroughStep,
  formatConsultContent,
  getConsultPath,
  getConsultTotalSteps,
  type ConsultAnswers,
} from '@/app/constants/consultFlow';
import {
  DEFAULT_CONSULT_LAWYER,
  getConsultInsight,
  getConsultLawyerForTopic,
  getConsultQuestionLawyer,
  type ConsultInsight,
  type ConsultInsightLawyer,
} from '@/app/constants/consultInsights';
import { getInquiryAttribution } from '@/app/lib/inquiryInflow';
import { validateInquiryFields } from '@/app/lib/inquiryValidation';
import { trackGaEvent } from '@/app/lib/trackGaEvent';

const RECAPTCHA_ACTION = 'submit_consult';
const AVATAR_SIZE = 36;

type InquiryResponse = {
  result: string;
  msg: string;
};

function getInflowLabel(): string {
  if (typeof window === 'undefined') return CONSULT_CHAT_INFLOW.desktop;
  return window.matchMedia('(min-width: 768px)').matches ? CONSULT_CHAT_INFLOW.desktop : CONSULT_CHAT_INFLOW.mobile;
}

function hasConsultAnswers(answers: ConsultAnswers): boolean {
  return Object.values(answers).some(value => Boolean(value));
}

function BotAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Image
      src={src}
      alt={name}
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      className="h-9 w-9 shrink-0 rounded-full object-cover"
    />
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1" aria-label="입력 중">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
    </div>
  );
}

export default function ConsultChatWidget() {
  const { isOpen, open, close } = useConsultChat();
  const { activate, executeRecaptcha } = useLazyReCaptcha();
  const recaptchaEnabled = RECAPTCHA_SITE_KEY !== '';
  const timelineRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ConsultAnswers>({});
  const [skipToContact, setSkipToContact] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const consultPath = getConsultPath(answers);
  const contactStep = consultPath.length;
  const totalSteps = getConsultTotalSteps(answers);
  const currentQuestion = step < contactStep ? consultPath[step] : null;
  const useTwoColumnOptions = currentQuestion?.id === 'topic';
  const showContact = skipToContact || step >= contactStep;
  const progress = ((showContact ? totalSteps : step + 1) / totalSteps) * 100;
  const hostLawyer = DEFAULT_CONSULT_LAWYER;
  const assignedLawyer = getConsultLawyerForTopic(answers.topic);
  const currentQuestionLawyer = currentQuestion
    ? getConsultQuestionLawyer(currentQuestion.id, answers.topic)
    : assignedLawyer;
  const contactLawyer = hasConsultAnswers(answers) ? assignedLawyer : hostLawyer;
  const answered = hasConsultAnswers(answers);
  const canGoBack = step > 0 || skipToContact;

  const resetChat = useCallback(() => {
    setStep(0);
    setAnswers({});
    setSkipToContact(false);
    setIsTyping(false);
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
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isTyping) return;

    const timer = window.setTimeout(() => {
      setStep(current => current + 1);
      setIsTyping(false);
    }, CONSULT_TYPING_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    timeline.scrollTop = timeline.scrollHeight;
  }, [answers, step, isTyping, showContact, isOpen]);

  const handleSelectOption = (option: string) => {
    if (!currentQuestion || isTyping || showContact) return;

    const nextAnswers: ConsultAnswers = { ...answers, [currentQuestion.id]: option };
    const nextPath = getConsultPath(nextAnswers);
    setAnswers(answersThroughStep(nextAnswers, nextPath, step));
    setIsTyping(true);
  };

  const handleSkipToContact = () => {
    if (isTyping) {
      setIsTyping(false);
      setStep(current => current + 1);
    }
    setSkipToContact(true);
  };

  const handleBack = () => {
    if (skipToContact && step < contactStep) {
      setSkipToContact(false);
      return;
    }

    if (step === 0) {
      setSkipToContact(false);
      return;
    }

    const previousStep = step - 1;
    setSkipToContact(false);
    setIsTyping(false);
    setAnswers(answersThroughStep(answers, consultPath, previousStep - 1));
    setStep(previousStep);
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

  const historyQuestions = consultPath.slice(0, step).filter(question => answers[question.id]);
  const pendingInsight =
    currentQuestion && answers[currentQuestion.id]
      ? getConsultInsight(currentQuestion.id, answers[currentQuestion.id] ?? '', answers.topic)
      : null;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="1분 상담 시작"
          className={
            'flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-[#023373] ' +
            'text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)] ring-2 ring-white/40 ' +
            'transition-transform hover:scale-105 hover:ring-white/70 md:h-20 md:w-20'
          }
        >
          <BsChatDotsFill className="h-7 w-7 md:h-9 md:w-9" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div
          className={
            'absolute right-0 bottom-full z-10 mb-2 flex max-h-[min(34rem,calc(100dvh-9rem))] ' +
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

          <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-2 py-2">
            <div className="flex min-w-0 items-center gap-0.5 md:gap-1.5">
              {canGoBack && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="shrink-0 cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-100"
                  aria-label="이전"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <div className="min-w-0">
                <p id="consult-chat-title" className="truncate text-sm md:text-base font-bold text-[#023373]">
                  {CONSULT_CHAT_COPY.title}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {!showContact && (
                <button
                  type="button"
                  onClick={handleSkipToContact}
                  className={
                    'cursor-pointer rounded-full bg-[#023373] px-2 md:px-3 py-1 text-sm md:text-base font-bold text-white ' +
                    'hover:bg-[#01285c]'
                  }
                >
                  {CONSULT_CHAT_COPY.skipCta}
                </button>
              )}
              <span className="px-1 text-xs text-gray-400">
                {showContact ? totalSteps : step + 1}/{totalSteps}
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

          <div ref={timelineRef} className="flex-1 overflow-y-auto px-3 py-3">
            <div className="flex flex-col gap-3">
              <BotMessage avatarSrc={hostLawyer.avatarSrc} lawyerName={hostLawyer.name}>
                <LawyerHeader lawyer={hostLawyer} />
                <p className="mt-1 break-keep text-[13px] md:text-sm leading-relaxed text-gray-800">
                  {CONSULT_CHAT_COPY.greeting}
                </p>
                {step === 0 && !showContact && !isTyping && (
                  <button
                    type="button"
                    onClick={handleSkipToContact}
                    className="mt-1 cursor-pointer text-[13px] md:text-sm font-semibold text-[#023373] underline"
                  >
                    {CONSULT_CHAT_COPY.skipHint}
                  </button>
                )}
              </BotMessage>

              {historyQuestions.map(question => {
                const selected = answers[question.id];
                if (!selected) return null;
                const insight = getConsultInsight(question.id, selected, answers.topic);
                return (
                  <QuestionTurn
                    key={question.id}
                    question={question.question}
                    selected={selected}
                    insight={insight}
                    lawyer={getConsultQuestionLawyer(question.id, answers.topic)}
                  />
                );
              })}

              {isTyping && currentQuestion && answers[currentQuestion.id] && (
                <>
                  <BotMessage avatarSrc={currentQuestionLawyer.avatarSrc} lawyerName={currentQuestionLawyer.name}>
                    <p className="break-keep text-[13px] md:text-sm leading-relaxed font-medium text-[#023373]">
                      {currentQuestion.question}
                    </p>
                  </BotMessage>
                  <UserMessage text={answers[currentQuestion.id] ?? ''} />
                  <BotMessage
                    avatarSrc={pendingInsight?.lawyer.avatarSrc ?? assignedLawyer.avatarSrc}
                    lawyerName={pendingInsight?.lawyer.name ?? assignedLawyer.name}
                  >
                    <TypingDots />
                  </BotMessage>
                </>
              )}

              {!isTyping && !showContact && currentQuestion && (
                <BotMessage avatarSrc={currentQuestionLawyer.avatarSrc} lawyerName={currentQuestionLawyer.name}>
                  <p className="break-keep text-[13px] md:text-sm leading-relaxed font-medium text-[#023373]">
                    {currentQuestion.question}
                  </p>
                </BotMessage>
              )}

              {showContact && (
                <BotMessage avatarSrc={contactLawyer.avatarSrc} lawyerName={contactLawyer.name}>
                  <p className="break-keep text-[13px] md:text-sm leading-relaxed text-gray-800">
                    {answered
                      ? CONSULT_CHAT_COPY.contactTitleWithAnswers
                      : CONSULT_CHAT_COPY.contactTitleWithoutAnswers}
                  </p>
                </BotMessage>
              )}
            </div>
          </div>

          {!isTyping && !showContact && currentQuestion && (
            <div className="shrink-0 border-t border-gray-100 px-3 py-2">
              <div className={useTwoColumnOptions ? 'grid grid-cols-2 gap-1.5' : 'flex flex-col gap-1.5'}>
                {currentQuestion.options.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={event => {
                      event.currentTarget.blur();
                      handleSelectOption(option);
                    }}
                    className={
                      'cursor-pointer rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 ' +
                      'text-left text-[13px] md:text-sm font-medium break-keep text-[#023373] transition-colors ' +
                      'hover:border-[#023373] hover:bg-[#f3f5f9] focus:outline-none ' +
                      'focus-visible:ring-2 focus-visible:ring-[#023373] md:px-3 md:py-2 ' +
                      (!useTwoColumnOptions ? 'w-full' : '')
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showContact && (
            <div className="shrink-0 border-t border-gray-100 px-3 py-2">
              <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
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
                  {isSubmitting ? '접수 중...' : CONSULT_CHAT_COPY.contactSubmit}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function LawyerHeader({ lawyer }: { lawyer: ConsultInsightLawyer }) {
  return (
    <p className="text-xs font-semibold text-gray-500">
      {lawyer.name} {lawyer.title}
      <span className="mt-0.5 ml-1 font-medium text-gray-400">· {lawyer.specialty}</span>
    </p>
  );
}

function BotMessage({
  avatarSrc,
  lawyerName,
  children,
}: {
  avatarSrc: string;
  lawyerName: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <BotAvatar src={avatarSrc} name={lawyerName} />
      <div className="min-w-0 rounded-2xl rounded-tl-md bg-[#f3f5f9] px-3 py-2.5">{children}</div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#023373] px-3 py-2 text-sm break-keep text-white">
        {text}
      </p>
    </div>
  );
}

function QuestionTurn({
  question,
  selected,
  insight,
  lawyer,
}: {
  question: string;
  selected: string;
  insight: ConsultInsight | null;
  lawyer: ConsultInsightLawyer;
}) {
  return (
    <>
      <BotMessage avatarSrc={lawyer.avatarSrc} lawyerName={lawyer.name}>
        <p className="break-keep text-sm leading-relaxed font-medium text-[#023373]">{question}</p>
      </BotMessage>
      <UserMessage text={selected} />
      {insight && (
        <BotMessage avatarSrc={insight.lawyer.avatarSrc} lawyerName={insight.lawyer.name}>
          <LawyerHeader lawyer={insight.lawyer} />
          <p className="mt-1 break-keep text-sm leading-relaxed text-gray-800">{insight.message}</p>
        </BotMessage>
      )}
    </>
  );
}
