import { INQUIRY_PER_PAGE_DEFAULT } from '@/app/constants/inquiryAdmin';

const INQUIRY_BASE = '/api/inquiry';

export type InquiryListItem = {
  idx: number;
  c_date: string | null;
  c_name: string | null;
  c_tel: string | null;
  c_content: string | null;
  c_inflow: string | null;
  c_inflowurl: string | null;
  c_state: string | null;
  c_state2: string | null;
  block: string | null;
  userip: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  c_email: string | null;
};

export type InquiryDetail = Record<string, string | number | null>;

type InquiryListResponse = {
  ok: boolean;
  page: number;
  per_page: number;
  total: number;
  items: InquiryListItem[];
};

type InquiryGetResponse = {
  ok: boolean;
  item: InquiryDetail;
};

type InquiryUpdatePayload = {
  idx: number;
  c_state?: string;
  block?: boolean;
  c_state2?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : '요청에 실패했습니다.');
  }
  return data;
}

export async function fetchInquiryList(page = 1, perPage = INQUIRY_PER_PAGE_DEFAULT): Promise<InquiryListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const res = await fetch(`${INQUIRY_BASE}/list.php?${params.toString()}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  return parseJson<InquiryListResponse>(res);
}

export async function fetchInquiryDetail(idx: number): Promise<InquiryDetail> {
  const res = await fetch(`${INQUIRY_BASE}/get.php?idx=${idx}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await parseJson<InquiryGetResponse>(res);
  return data.item;
}

export async function updateInquiry(payload: InquiryUpdatePayload): Promise<InquiryDetail> {
  const res = await fetch(`${INQUIRY_BASE}/update.php`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJson<InquiryGetResponse>(res);
  return data.item;
}
