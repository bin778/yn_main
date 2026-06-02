'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { INQUIRY_LIST_PATH, INQUIRY_STATES, type InquiryState } from '@/app/constants/inquiryAdmin';

import AdminSuperGuard from '../../components/AdminSuperGuard';
import { fetchInquiryDetail, updateInquiry, type InquiryDetail } from '../../lib/inquiryAdminApi';

const DETAIL_LABELS: Record<string, string> = {
  idx: '번호',
  c_date: '접수일',
  c_name: '이름',
  c_tel: '연락처',
  c_email: '이메일',
  c_content: '문의 내용',
  c_inflow: '유입',
  c_inflowurl: '유입 URL',
  c_inflowdate: '유입 일시',
  c_state: '처리 상태',
  c_state2: '관리자 메모',
  block: '차단',
  userip: 'IP',
  utm_source: 'UTM source',
  utm_campaign: 'UTM campaign',
};

function formatDetailValue(key: string, value: string | number | null): string {
  if (value === null || value === '') {
    return '-';
  }
  if (key === 'block') {
    return value === '1' || value === 1 ? '차단됨' : '아니오';
  }
  return String(value);
}

type InquiryDetailPanelProps = {
  idx: number;
};

function InquiryDetailPanel({ idx }: InquiryDetailPanelProps) {
  const [item, setItem] = useState<InquiryDetail | null>(null);
  const [cState, setCState] = useState<InquiryState>('상담접수');
  const [cState2, setCState2] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchInquiryDetail(idx)
      .then(data => {
        if (cancelled) return;
        setItem(data);
        const state = String(data.c_state ?? '상담접수');
        setCState(INQUIRY_STATES.includes(state as InquiryState) ? (state as InquiryState) : '상담접수');
        setCState2(String(data.c_state2 ?? ''));
        setBlocked(data.block === '1' || data.block === 1);
      })
      .catch(loadError => {
        if (cancelled) return;
        const message = loadError instanceof Error ? loadError.message : '불러오지 못했습니다.';
        if (message.includes('찾을 수 없')) {
          setNotFoundState(true);
        } else {
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idx]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateInquiry({
        idx,
        c_state: cState,
        c_state2: cState2.trim(),
        block: blocked,
      });
      setItem(updated);
      alert('저장되었습니다.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (notFoundState) {
    return (
      <div className="border border-[#e8e8e8] bg-white p-6">
        <p className="text-sm text-[#666]">문의를 찾을 수 없습니다.</p>
        <Link href={INQUIRY_LIST_PATH} className="mt-4 inline-block text-sm text-[#1a3151] underline">
          목록으로
        </Link>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-[#666]">불러오는 중…</p>;
  }

  if (item === null && error !== null) {
    return (
      <p className="text-sm text-[#b42318]" role="alert">
        {error}
      </p>
    );
  }

  const readOnlyKeys = Object.keys(item ?? {}).filter(key => !['c_state', 'c_state2', 'block'].includes(key));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-[#1a3151]">문의 상세 #{idx}</h1>
        <Link href={INQUIRY_LIST_PATH} className="text-sm text-[#1a3151] underline">
          목록으로
        </Link>
      </div>

      <section className="border border-[#e8e8e8] bg-white p-6">
        <dl className="space-y-4">
          {readOnlyKeys.map(key => (
            <div key={key}>
              <dt className="text-xs font-medium text-[#999]">{DETAIL_LABELS[key] ?? key}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-[#333]">
                {formatDetailValue(key, item?.[key] ?? null)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 border border-[#e8e8e8] bg-white p-6">
        <h2 className="text-base font-semibold text-[#333]">처리</h2>
        <div>
          <label htmlFor="c_state" className="mb-1 block text-sm font-medium text-[#333]">
            처리 상태
          </label>
          <select
            id="c_state"
            value={cState}
            onChange={event => setCState(event.target.value as InquiryState)}
            className="w-full max-w-xs border border-[#ddd] px-3 py-2 text-sm"
          >
            {INQUIRY_STATES.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="c_state2" className="mb-1 block text-sm font-medium text-[#333]">
            관리자 메모 (45자 이내)
          </label>
          <input
            id="c_state2"
            type="text"
            maxLength={45}
            value={cState2}
            onChange={event => setCState2(event.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="block"
            type="checkbox"
            checked={blocked}
            onChange={event => setBlocked(event.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="block" className="text-sm text-[#333]">
            IP 차단 (block)
          </label>
        </div>
        {error !== null && (
          <p className="text-sm text-[#b42318]" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-[#1a3151] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? '저장 중…' : '저장'}
        </button>
      </form>
    </div>
  );
}

export default function AdminInquiryDetailPage() {
  const params = useParams<{ idx: string }>();
  const idx = Number.parseInt(params.idx, 10);

  if (!Number.isFinite(idx) || idx <= 0) {
    notFound();
  }

  return (
    <AdminSuperGuard>
      <InquiryDetailPanel key={idx} idx={idx} />
    </AdminSuperGuard>
  );
}
