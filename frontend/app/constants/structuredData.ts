import { SITE_ORIGIN } from '@/app/lib/siteOrigin';

export const LEGAL_SERVICE_SCHEMA: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  'name': '법무법인 여온',
  'url': SITE_ORIGIN,
  'telephone': '02-318-2981',
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': '남대문로10길 28 우석빌딩 10층 1003호',
    'addressLocality': '중구',
    'addressRegion': '서울특별시',
    'postalCode': '04536',
    'addressCountry': 'KR',
  },
  'areaServed': ['서울', '부천', '경기'],
  'knowsAbout': [
    '음주운전 형사변호',
    '성범죄 형사변호',
    '강제추행 형사변호',
    '카메라등이용촬영죄 변호',
    '마약 형사변호',
    '스토킹 형사변호',
    '이혼 가사',
    '강제집행 민사',
  ],
  'description':
    '음주운전·성범죄·강제추행·마약 형사사건 전담. 담당 변호사가 상담부터 직접 진행. 사무장 없음, 재배당 없음, 월 수임건수 제한.',
  'hasOfferCatalog': {
    '@type': 'OfferCatalog',
    'name': '법률 서비스',
    'itemListElement': [
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '음주운전 형사변호' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '성범죄·카촬죄 형사변호' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '강제추행 형사변호' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '마약 형사변호' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '스토킹 형사변호' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '이혼·양육권 가사' } },
      { '@type': 'Offer', 'itemOffered': { '@type': 'Service', 'name': '강제집행·부동산 민사' } },
    ],
  },
  'founder': {
    '@type': 'Person',
    'name': '유영규',
    'jobTitle': '대표변호사',
    'hasCredential': '대한변호사협회 형사전문변호사 인증',
  },
};

export const YOO_YOUNG_KYU_PERSON_SCHEMA: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  'name': '유영규',
  'jobTitle': '대표변호사',
  'worksFor': {
    '@type': 'LegalService',
    'name': '법무법인 여온',
    'url': SITE_ORIGIN,
  },
  'hasCredential': '대한변호사협회 형사전문변호사 인증',
  'knowsAbout': ['형사법', '음주운전 변호', '성범죄 변호', '강제추행 변호', '마약 변호', '스토킹 변호'],
};
