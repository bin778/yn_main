'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

import {
  CONTACT_INQUIRY,
  INQUIRY_API_URL,
  INQUIRY_FIELD_LIMITS,
  INQUIRY_STUB_MESSAGE,
} from '@/app/constants/contactContent';

type InquiryResponse = {
  result: string;
  msg: string;
};

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedTel = tel.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!trimmedTel) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    if (!trimmedContent) {
      alert('문의사항을 입력해주세요.');
      return;
    }
    if (!agreed) {
      alert('개인정보 처리 방침에 동의해주세요.');
      return;
    }

    if (!INQUIRY_API_URL) {
      alert(INQUIRY_STUB_MESSAGE);
      return;
    }

    setSubmitting(true);
    try {
      const body = new URLSearchParams({
        c_name: trimmedName,
        c_tel: trimmedTel,
        c_email: '',
        c_content: trimmedContent,
        c_inflow: getInflowLabel(),
        token: '',
      });

      const response = await fetch(INQUIRY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const data = (await response.json()) as InquiryResponse;
      alert(data.msg);
      if (data.result === '1') {
        setName('');
        setTel('');
        setContent('');
        setAgreed(false);
      }
    } catch {
      alert('요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-[3px] border border-[#ccc] bg-white/10 px-2.5 py-2.5 text-white placeholder:text-white/60';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[580px]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-3">
        <div>
          <label htmlFor="c_name" className="text-base font-medium text-white">
            성함
          </label>
          <input
            id="c_name"
            name="c_name"
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={INQUIRY_FIELD_LIMITS.name}
            required
            className={`${inputClass} mt-2`}
          />
        </div>
        <div>
          <label htmlFor="c_tel" className="text-base font-medium text-white">
            연락처
          </label>
          <input
            id="c_tel"
            name="c_tel"
            type="tel"
            inputMode="numeric"
            value={tel}
            onChange={event => setTel(event.target.value.replace(/\D/g, ''))}
            maxLength={INQUIRY_FIELD_LIMITS.tel}
            required
            placeholder="숫자만 입력"
            className={`${inputClass} mt-2`}
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="c_content" className="text-base font-medium text-white">
          문의사항
        </label>
        <textarea
          id="c_content"
          name="c_content"
          value={content}
          onChange={event => setContent(event.target.value)}
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
        <span className="text-sm md:text-base">
          개인정보 수집 및 이용동의{' '}
          <Link href="/privacy" className="underline">
            [보기]
          </Link>
        </span>
      </label>

      <div className="mt-6 flex justify-center md:justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="cursor-pointer rounded-[3px] bg-[#023373] px-6 py-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? '접수 중…' : '바로 문의하기 >'}
        </button>
      </div>
    </form>
  );
}
