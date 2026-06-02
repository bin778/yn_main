const INQUIRY_BASE = '/api/inquiry';
const PER_PAGE_DEFAULT = 15;

export type InquiryListItem = {
  idx: number;
  c_date: string | null;
  c_name: string | null;
  c_tel: string | null;
  c_inflowurl: string | null;
  c_inflow: string | null;
  c_state: string | null;
  c_state2: string | null;
  block: string | null;
  userip: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
};

export type InquiryDetail = Record<string, string | number | null>;

export type InquiryListFilter = {
  date_from?: string;
  date_to?: string;
  q?: string;
};

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

export type IpInfoResult = {
  ok: boolean;
  ip: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  org?: string | null;
  loc?: string | null;
  timezone?: string | null;
  note?: string | null;
  error?: string;
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : '요청에 실패했습니다.');
  }
  return data;
}

export async function fetchInquiryList(
  page = 1,
  perPage = PER_PAGE_DEFAULT,
  filter: InquiryListFilter = {},
): Promise<InquiryListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (filter.date_from) params.set('date_from', filter.date_from);
  if (filter.date_to) params.set('date_to', filter.date_to);
  if (filter.q?.trim()) params.set('q', filter.q.trim());

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

export async function deleteInquiry(idx: number): Promise<void> {
  const res = await fetch(`${INQUIRY_BASE}/delete.php`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idx }),
  });
  await parseJson<{ ok: boolean }>(res);
}

export function buildExportUrl(filter: InquiryListFilter = {}): string {
  const params = new URLSearchParams();
  if (filter.date_from) params.set('date_from', filter.date_from);
  if (filter.date_to) params.set('date_to', filter.date_to);
  if (filter.q?.trim()) params.set('q', filter.q.trim());
  const qs = params.toString();
  return `${INQUIRY_BASE}/export.php${qs ? '?' + qs : ''}`;
}

export async function fetchIpInfo(ip: string): Promise<IpInfoResult> {
  const res = await fetch(`${INQUIRY_BASE}/ip_info.php?ip=${encodeURIComponent(ip)}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  return parseJson<IpInfoResult>(res);
}

export { PER_PAGE_DEFAULT };
