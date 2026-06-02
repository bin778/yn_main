'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { notFound, useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { INQUIRY_LIST_PATH, INQUIRY_STATES, type InquiryState } from '@/app/constants/inquiryAdmin';

import AdminSuperGuard from '../../components/AdminSuperGuard';
import { deleteInquiry, fetchInquiryDetail, updateInquiry, type InquiryDetail } from '../../lib/inquiryAdminApi';

const DETAIL_LABELS: Record<string, string> = {
  idx: '번호',
  c_date: '접수일',
  c_name: '이름',
  c_tel: '연락처',
  c_email: '이메일',
  c_age: '나이',
  c_sex: '성별',
  c_addr: '주소',
  c_addr2: '상세주소',
  c_title1: '제목1',
  c_title2: '제목2',
  c_caldate: '통화예정일',
  c_inq1: '문의1',
  c_inq2: '문의2',
  c_lit: '관심사',
  c_money: '예산',
  c_content: '문의 내용',
  c_inflowdate: '유입일시',
  c_inflowurl: '유입 URL',
  c_inflow: '유입 경로',
  c_option: '옵션1',
  c_option2: '옵션2',
  c_option3: '옵션3',
  c_option4: '옵션4',
  utm_source: 'UTM Source',
  utm_campaign: 'UTM Campaign',
  userip: 'IP 주소',
};

const EDITABLE_KEYS = new Set(['c_state', 'c_state2', 'block']);

function formatDetailValue(key: string, value: string | number | null): string {
  if (value === null || value === '') return '-';
  if (key === 'block') return value === '1' || value === 1 ? '차단됨' : '아니오';
  return String(value);
}

type InquiryDetailPanelProps = { idx: number };

function InquiryDetailPanel({ idx }: InquiryDetailPanelProps) {
  const router = useRouter();

  const [item, setItem] = useState<InquiryDetail | null>(null);
  const [cState, setCState] = useState<InquiryState>('상담접수');
  const [cState2, setCState2] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
      .catch(err => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : '불러오지 못했습니다.';
        if (msg.includes('찾을 수 없')) {
          setNotFoundState(true);
        } else {
          setError(msg);
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
      const updated = await updateInquiry({ idx, c_state: cState, c_state2: cState2.trim(), block: blocked });
      setItem(updated);
      alert('저장되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`#${idx} 문의를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteInquiry(idx);
      router.replace(INQUIRY_LIST_PATH);
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제에 실패했습니다.');
      setDeleting(false);
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

  if (loading) return <p className="text-sm text-[#666]">불러오는 중…</p>;

  if (item === null && error !== null) {
    return (
      <p className="text-sm text-[#b42318]" role="alert">
        {error}
      </p>
    );
  }

  const readOnlyKeys = Object.keys(item ?? {}).filter(key => !EDITABLE_KEYS.has(key));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-[#1a3151]">문의 상세 #{idx}</h1>
        <div className="flex items-center gap-3">
          <Link href={INQUIRY_LIST_PATH} className="text-sm text-[#1a3151] underline">
            목록으로
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded bg-[#b42318] px-4 py-2 text-sm font-medium text-white hover:bg-[#8b1a13] disabled:opacity-50"
          >
            {deleting ? '삭제 중…' : '삭제'}
          </button>
        </div>
      </div>

      {/* 읽기 전용 필드 */}
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

      {/* 수정 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4 border border-[#e8e8e8] bg-white p-6">
        <h2 className="text-base font-semibold text-[#333]">처리</h2>

        <div>
          <label htmlFor="c_state" className="mb-1 block text-sm font-medium text-[#333]">
            처리 상태
          </label>
          <select
            id="c_state"
            value={cState}
            onChange={e => setCState(e.target.value as InquiryState)}
            className="w-full max-w-xs border border-[#ddd] px-3 py-2 text-sm"
          >
            {INQUIRY_STATES.map(s => (
              <option key={s} value={s}>
                {s}
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
            onChange={e => setCState2(e.target.value)}
            className="w-full border border-[#ddd] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="block"
            type="checkbox"
            checked={blocked}
            onChange={e => setBlocked(e.target.checked)}
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

  if (!Number.isFinite(idx) || idx <= 0) notFound();

  return (
    <AdminSuperGuard>
      <InquiryDetailPanel key={idx} idx={idx} />
    </AdminSuperGuard>
  );
}
