export const INQUIRY_STATES = ['상담접수', '연락완료', '상담종료'] as const;

export type InquiryState = (typeof INQUIRY_STATES)[number];

export const INQUIRY_LIST_PATH = '/admin/inquiries/';
export const INQUIRY_DETAIL_PATH = (idx: number) => `/admin/inquiries/${idx}/`;

export const INQUIRY_PER_PAGE_DEFAULT = 20;
