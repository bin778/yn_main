import Link from 'next/link';
import type { FormEvent } from 'react';

import { INQUIRY_FIELD_LIMITS } from '@/app/constants/contactContent';
import { CONSULT_CHAT_COPY } from '@/app/constants/consultFlow';

type Props = {
  name: string;
  tel: string;
  agreed: boolean;
  isSubmitting: boolean;
  onNameChange: (value: string) => void;
  onTelChange: (value: string) => void;
  onAgreeChange: (value: boolean) => void;
  onInteraction: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ConsultChatContactForm({
  name,
  tel,
  agreed,
  isSubmitting,
  onNameChange,
  onTelChange,
  onAgreeChange,
  onInteraction,
  onSubmit,
}: Props) {
  return (
    <div className="shrink-0 border-t border-gray-100 px-3 py-2">
      <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
        <input
          type="text"
          placeholder="성함"
          value={name}
          onFocus={onInteraction}
          onChange={event => onNameChange(event.target.value)}
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
          onFocus={onInteraction}
          onChange={event => onTelChange(event.target.value.replace(/\D/g, ''))}
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
            onChange={event => onAgreeChange(event.target.checked)}
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
  );
}
