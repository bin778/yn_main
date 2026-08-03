/**
 * Contact page (`/contact`) from legacy `www/contact.php`.
 */

export type OfficeDirection = {
  id: string;
  iconSrc: string;
  label: string;
  description: string;
};

export type OfficeMapLocation = {
  lat: number;
  lng: number;
  zoom: number;
  /** 네이버 지도 장소(Place) ID — 클릭 시 map.naver.com 상세로 이동 */
  naverPlaceId: string;
  /** 네이버 장소명(길찾기 도착지 표시용) */
  naverPlaceName: string;
  /**
   * 네이버 지도 공유 URL의 인코딩 좌표(예: `3zhVpA,2AM5BZ`).
   * 없으면 lng,lat 소수점 좌표로 대체한다.
   */
  naverEncodedCoords?: string;
};

export type ContactOffice = {
  id: string;
  title: string;
  address: string;
  directions: readonly OfficeDirection[];
  map: OfficeMapLocation;
};

export function getNaverPlaceUrl(placeId: string): string {
  return `https://map.naver.com/p/entry/place/${placeId}`;
}

/** 도착지를 해당 장소로 둔 네이버 지도 길찾기(대중교통) */
export function getNaverDirectionsUrl(location: OfficeMapLocation): string {
  const coords = location.naverEncodedCoords ?? `${location.lng},${location.lat}`;
  const destination = [coords, encodeURIComponent(location.naverPlaceName), location.naverPlaceId, 'PLACE_POI'].join(
    ',',
  );
  return `https://map.naver.com/p/directions/-/${destination}/-/transit?c=15.00,0,0,0,dh`;
}

/** 카카오맵 도착지 지정 링크(웹) — 앱에서 대중교통 길찾기 선택 가능 */
export function getKakaoDirectionsUrl(location: OfficeMapLocation): string {
  const name = encodeURIComponent(location.naverPlaceName);
  return `https://map.kakao.com/link/to/${name},${location.lat},${location.lng}`;
}

/** 티맵 앱 스킴 지원 플랫폼 (PC는 null) */
export type TmapPlatform = 'ios' | 'android';

export function getTmapPlatform(userAgent: string): TmapPlatform | null {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return null;
}

/** 티맵 자동차 길찾기(앱 스킴) — iOS/Android 파라미터 상이 */
export function getTmapDirectionsUrl(location: OfficeMapLocation, platform: TmapPlatform): string {
  const name = encodeURIComponent(location.naverPlaceName);
  if (platform === 'ios') {
    return `tmap://route?rGoName=${name}&rGoX=${location.lng}&rGoY=${location.lat}`;
  }
  return `tmap://route?referrer=com.skt.Tmap&goalname=${name}&goalx=${location.lng}&goaly=${location.lat}`;
}

export const MAP_DIRECTION_ICONS = {
  naver: '/img/naver_map.webp',
  kakao: '/img/kakao_map.webp',
  tmap: '/img/t_map.webp',
} as const;

export const CONTACT_PAGE_TITLE = '법무법인 여온 상담 예약 | 서울 을지로 본사 및 경기 부천 분사무소';
export const CONTACT_PAGE_DESCRIPTION =
  '서울 을지로입구역 3번 출구 도보 1분. 경기 부천 심곡동. 전화 및 카카오 즉시 상담. 서울사무소 02-318-2981 / 부천사무소 032-666-2981';

export const CONTACT_HERO = {
  title: '여온과 함께하기',
  subtitle: '법무법인 여온과 함께라면 당신의 문제는 여행이 됩니다.',
  bg: '/img/3f2ae6827f971.webp',
} as const;

const SUBWAY_ICON = '/img/5482ca0152750.webp';
const PARKING_ICON = '/img/90d4ad1b8a7c7.webp';

export const CONTACT_OFFICES: readonly ContactOffice[] = [
  {
    id: 'seoul',
    title: '서울 주사무소',
    address: '서울특별시 중구 남대문로 10길 28, 10층 1003호 (수하동, 우석빌딩)',
    directions: [
      {
        id: 'seoul-euljiro',
        iconSrc: SUBWAY_ICON,
        label: '을지로입구역',
        description: '3번 출구로 나와 10m 직진 후 스타벅스 앞에서 우회전 1층 낙원커피 건물 10층 1003호',
      },
      {
        id: 'seoul-jonggak',
        iconSrc: SUBWAY_ICON,
        label: '종각역',
        description:
          '5번 출구에서 나와 직진 후 DGB금융센터에서 길을 건넌 뒤 직진 후 처음 나오는 삼거리에서 좌회전, 전방에 보이는 낙원커피 빌딩 10층',
      },
      {
        id: 'seoul-parking',
        iconSrc: PARKING_ICON,
        label: '주차정보',
        description: '| 인근 유료 주차장 이용',
      },
    ],
    map: {
      lat: 37.5674435,
      lng: 126.9842354,
      zoom: 16,
      naverPlaceId: '1212409809',
      naverPlaceName: '법무법인 여온',
      naverEncodedCoords: '3zhVpA,2AM5BZ',
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
    map: {
      lat: 37.4868757,
      lng: 126.7833253,
      zoom: 16,
      naverPlaceId: '2096887533',
      naverPlaceName: '법무법인 여온 부천 분사무소',
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

/** 상담 접수 `c_inflowurl` — 오가닉 vs 구글 광고 */
export const INQUIRY_INFLOW_URL = {
  CONTACT: 'contact',
  CONTACT_GOOGLE: 'contact-ad',
} as const;

export type InquiryInflowUrl = (typeof INQUIRY_INFLOW_URL)[keyof typeof INQUIRY_INFLOW_URL];

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

function resolveCallLeadApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_CALL_LEAD_API_URL?.trim() ?? '';
  if (configured !== '') return configured;

  // 상담 API와 같은 origin/경로 규칙을 따름
  if (INQUIRY_API_URL.startsWith('/')) {
    return '/api/call_lead.php';
  }
  if (INQUIRY_API_URL.includes('/api/submit_inquiry.php')) {
    return INQUIRY_API_URL.replace('/api/submit_inquiry.php', '/api/call_lead.php');
  }
  if (INQUIRY_API_URL.includes('/backend/api/submit_inquiry.php')) {
    return INQUIRY_API_URL.replace('/backend/api/submit_inquiry.php', '/api/call_lead.php');
  }
  return INQUIRY_API_URL ? '/api/call_lead.php' : '';
}

export const CALL_LEAD_API_URL = resolveCallLeadApiUrl();

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? '';

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

export const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID?.trim() ?? '';
