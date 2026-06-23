/**
 * Contact page (`/contact`) from legacy `www/contact.php`.
 */

export type OfficeDirection = {
  id: string;
  iconSrc: string;
  label: string;
  description: string;
};

export type KakaoMapEmbed = {
  timestamp: string;
  key: string;
};

export type ContactOffice = {
  id: string;
  title: string;
  address: string;
  directions: readonly OfficeDirection[];
  mapDesktop: KakaoMapEmbed;
  mapMobile: KakaoMapEmbed;
};

export const CONTACT_PAGE_TITLE = '여온과 함께하기';
export const CONTACT_PAGE_DESCRIPTION = '법무법인 여온 서울 주사무소·부천 분사무소 오시는 길 및 상담 문의 안내입니다.';

export const CONTACT_HERO = {
  title: CONTACT_PAGE_TITLE,
  subtitle: '법무법인 여온과 함께라면 당신의 문제는 여행이 됩니다.',
  bg: '/img/3f2ae6827f971.webp',
} as const;

const SUBWAY_ICON = '/img/5482ca0152750.webp';
const PARKING_ICON = '/img/90d4ad1b8a7c7.webp';

export const CONTACT_OFFICES: readonly ContactOffice[] = [
  {
    id: 'seoul',
    title: '서울 주사무소',
    address: '서울특별시 중구 남대문로 10길 28, 9층 903호 (수하동, 우석빌딩)',
    directions: [
      {
        id: 'seoul-euljiro',
        iconSrc: SUBWAY_ICON,
        label: '을지로입구역',
        description: '3번 출구로 나와 10m 직진 후 스타벅스 앞에서 우회전 1층 낙원커피 건물 9층 903호',
      },
      {
        id: 'seoul-jonggak',
        iconSrc: SUBWAY_ICON,
        label: '종각역',
        description:
          '5번 출구에서 나와 직진 후 DGB금융센터에서 길을 건넌 뒤 직진 후 처음 나오는 삼거리에서 좌회전, 전방에 보이는 낙원커피 빌딩 9층',
      },
      {
        id: 'seoul-parking',
        iconSrc: PARKING_ICON,
        label: '주차정보',
        description: '| 인근 유료 주차장 이용',
      },
    ],
    mapDesktop: {
      timestamp: '1776314533103',
      key: 'm6x7wqeywdg',
    },
    mapMobile: {
      timestamp: '1776314533103',
      key: 'm6x7wqeywdg',
    },
  },
  {
    id: 'bucheon',
    title: '부천 분사무소',
    address: '경기도 부천시 부천로 26, 3층 302호 (심곡동, 부흥빌딩)',
    directions: [
      {
        id: 'bucheon-station',
        iconSrc: SUBWAY_ICON,
        label: '부천역',
        description: '4번출구 직진 300m',
      },
      {
        id: 'bucheon-parking',
        iconSrc: PARKING_ICON,
        label: '주차정보',
        description: '| 인근 유료 주차장 이용',
      },
    ],
    mapDesktop: {
      timestamp: '1776664337389',
      key: 'megwp8pjsa9',
    },
    mapMobile: {
      timestamp: '1776664337389',
      key: 'megwp8pjsa9',
    },
  },
] as const;

export const CONTACT_INQUIRY = {
  tagline: '오직 당신만을 위한 법무법인, 여온',
  headline: '지금 바로\n여온과 함께하세요.',
  bgDesktop: '/img/68b6fbff0d9e4.webp',
  bgMobile: '/img/dd7f74484c0bf.webp',
  inflowDesktop: '상담 페이지(PC)',
  inflowMobile: '상담 페이지(Mobile)',
} as const;

const LEGACY_INQUIRY_API_SUFFIX = '/api/submit_inquiry.php';
const CORRECT_INQUIRY_API_SUFFIX = '/backend/api/submit_inquiry.php';

function resolveInquiryApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_INQUIRY_API_URL?.trim() ?? '';
  if (configured === '') return '';

  // Vercel·로컬 dev same-origin — rewrite가 카페24 /api/submit_inquiry.php 로 프록시
  if (configured.startsWith('/')) {
    return configured;
  }

  if (configured.endsWith(LEGACY_INQUIRY_API_SUFFIX) && !configured.includes('/backend/api/')) {
    return configured.replace(LEGACY_INQUIRY_API_SUFFIX, CORRECT_INQUIRY_API_SUFFIX);
  }

  return configured;
}

export const INQUIRY_API_URL = resolveInquiryApiUrl();

export const INQUIRY_STUB_MESSAGE = '상담 접수 시스템을 준비 중입니다. 급한 문의는 02-318-2981로 연락해 주세요.';

export const INQUIRY_FIELD_LIMITS = {
  name: 10,
  tel: 11,
  content: 500,
} as const;

/** 완성형 한글 2~10자 */
export const INQUIRY_NAME_PATTERN = /^[\uAC00-\uD7A3]{2,10}$/;

/** 010 + 8자리 숫자 */
export const INQUIRY_TEL_PATTERN = /^010\d{8}$/;

export const INQUIRY_CONTENT_MIN = 5;

export const INQUIRY_VALIDATION_MESSAGES = {
  name: '올바른 성함을 입력하고, 한글 2~10자로만 입력해 주세요.',
  tel: '연락처는 010으로 시작하는 11자리 숫자만 입력해 주세요.',
  contentMin: '문의사항은 5자 이상 입력해 주세요.',
  contentMax: `문의사항은 ${INQUIRY_FIELD_LIMITS.content}자 이내로 입력해 주세요.`,
  agree: '개인정보 처리 방침에 동의해주세요.',
} as const;
