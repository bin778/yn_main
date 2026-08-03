'use client';

import Link from 'next/link';
import type { FormEvent, FocusEvent } from 'react';
import { useState } from 'react';

import { useLazyReCaptcha } from '@/app/components/contact/lazyReCaptchaContext';
import { GA_EVENTS, GA_SOURCES, INQUIRY_FORM_NAME } from '@/app/constants/analyticsEvents';
import {
  CONTACT_INQUIRY,
  INQUIRY_API_URL,
  INQUIRY_FIELD_LIMITS,
  INQUIRY_STUB_MESSAGE,
  INQUIRY_VALIDATION_MESSAGES,
  RECAPTCHA_SITE_KEY,
} from '@/app/constants/contactContent';
import { getInquiryAttribution } from '@/app/lib/inquiryInflow';
import { validateInquiryFields } from '@/app/lib/inquiryValidation';
import { trackGaEvent } from '@/app/lib/trackGaEvent';

type InquiryResponse = {
  result: string;
  msg: string;
};

const RECAPTCHA_ACTION = 'submit_consult';

function getInflowLabel(): string {
  if (typeof window === 'undefined') return CONTACT_INQUIRY.inflowDesktop;
  return window.matchMedia('(min-width: 768px)').matches ? CONTACT_INQUIRY.inflowDesktop : CONTACT_INQUIRY.inflowMobile;
}

export default function ContactInquiryForm() {
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [content, setContent] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { activate, executeRecaptcha } = useLazyReCaptcha();
  const recaptchaEnabled = RECAPTCHA_SITE_KEY !== '';

  const handleFieldFocus = (_event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (recaptchaEnabled) activate();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!agreed) {
      alert(INQUIRY_VALIDATION_MESSAGES.agree);
      return;
    }

    const validation = validateInquiryFields({ name, tel, content });
    if (!validation.ok) {
      alert(validation.message);
      return;
    }

    if (!INQUIRY_API_URL) {
      alert(INQUIRY_STUB_MESSAGE);
      return;
    }

    if (recaptchaEnabled) {
      activate();
      if (!executeRecaptcha) {
        alert('보안 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
    }

    const { name: validName, tel: validTel, content: validContent } = validation.values;
    const attribution = getInquiryAttribution();
    const inflowUrl = attribution.inflowUrl;

    setSubmitting(true);
    try {
      let recaptchaToken = '';
      if (recaptchaEnabled && executeRecaptcha) {
        recaptchaToken = await executeRecaptcha(RECAPTCHA_ACTION);
      }

      const body = new URLSearchParams({
        c_name: validName,
        c_tel: validTel,
        c_content: validContent,
        c_inflow: getInflowLabel(),
        c_inflowurl: inflowUrl,
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
          form_name: INQUIRY_FORM_NAME,
          link_source: GA_SOURCES.CONTACT_FORM,
          inflow_url: inflowUrl,
        });
        alert(data.msg);
        setName('');
        setTel('');
        setContent('');
        setAgreed(false);
      } else {
        alert(data.msg);
      }
    } catch {
      alert('요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-[3px] border border-[#ccc] bg-white/10 px-2 md:px-2.5 py-2 md:py-2.5 text-white placeholder:text-white/60';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[580px]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-3">
        <div>
          <label htmlFor="c_name" className="text-[13px] md:text-[15px] font-medium text-white">
            성함
          </label>
          <input
            id="c_name"
            name="c_name"
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            onFocus={handleFieldFocus}
            maxLength={INQUIRY_FIELD_LIMITS.name}
            required
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label htmlFor="c_tel" className="text-[13px] md:text-[15px] font-medium text-white">
            연락처
          </label>
          <input
            id="c_tel"
            name="c_tel"
            type="tel"
            inputMode="numeric"
            value={tel}
            onChange={event => setTel(event.target.value.replace(/\D/g, ''))}
            onFocus={handleFieldFocus}
            maxLength={INQUIRY_FIELD_LIMITS.tel}
            required
            placeholder="01012345678"
            className={`${inputClass} mt-2`}
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="c_content" className="text-[13px] md:text-[15px] font-medium text-white">
          문의사항
        </label>
        <textarea
          id="c_content"
          name="c_content"
          value={content}
          onChange={event => setContent(event.target.value)}
          onFocus={handleFieldFocus}
          maxLength={INQUIRY_FIELD_LIMITS.content}
          required
          className={`${inputClass} mt-2 h-[200px] resize-y`}
        />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2 text-white">
        <input
          type="checkbox"
          name="c_agree"
          checked={agreed}
          onChange={event => setAgreed(event.target.checked)}
          required
          className="mt-1"
        />
        <span className="text-[13px] md:text-[15px]">
          개인정보 수집 및 이용동의{' '}
          <Link href="/privacy" className="underline">
            [보기]
          </Link>
        </span>
      </label>

      {/* {recaptchaEnabled && (
        <p className="mt-3 text-[11px] leading-relaxed text-white/70 md:text-[12px]">
          이 사이트는 reCAPTCHA로 보호되며 Google{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
            개인정보처리방침
          </a>
          과{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
            서비스 약관
          </a>
          이 적용됩니다.
        </p>
      )} */}

      <div className="mt-6 flex justify-center md:justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="cursor-pointer rounded-[3px] bg-[#023373] px-6 py-3 text-[13px] md:text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? '접수 중…' : '바로 문의하기 >'}
        </button>
      </div>
    </form>
  );
}
