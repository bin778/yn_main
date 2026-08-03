export const INQUIRY_STATES = ['상담접수', '연락완료', '상담종료', '계약성사'] as const;

/** API/CTA로만 생성되는 상태 — 관리자가 계약성사 등으로 변경 가능 */
export const INQUIRY_LEAD_ONLY_STATES = ['전화클릭', '카톡클릭'] as const;

export type InquiryState = (typeof INQUIRY_STATES)[number];
export type InquiryLeadOnlyState = (typeof INQUIRY_LEAD_ONLY_STATES)[number];
export type InquiryAnyState = InquiryState | InquiryLeadOnlyState;

export const INQUIRY_LIST_PATH = '/admin/inquiries/';
export const INQUIRY_DETAIL_PATH = (idx: number) => `/admin/inquiries/${idx}/`;

export const INQUIRY_PER_PAGE_DEFAULT = 15;
