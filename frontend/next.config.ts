import type { NextConfig } from 'next';

const ONE_YEAR_CACHE = 'public, max-age=31536000, immutable';
const CAFE24 = 'https://lawfirmonly1.mycafe24.com';
const LANDING_NEW_ADMIN_LOGIN = '/landing_new/admin/admin/index.php';
const CRIMINAL_LANDING_SLUGS = [
  'drunk-driving',
  'indecent-assault',
  'indecent-assault2',
  'interim-measure',
  'lawyer',
  'lawyer-cost',
  'penalty',
  'suspended-indictment',
] as const;

/** `www/landing/` 메인 사이트 덤프 — 광고 랜딩(`yn**.php`)과 무관 */
const LANDING_DUMP_REDIRECTS = [
  { source: '/landing/about.php', destination: '/about/', permanent: true },
  { source: '/landing/field.php', destination: '/field/', permanent: true },
  { source: '/landing/people.php', destination: '/people/', permanent: true },
  { source: '/landing/inc.top.php', destination: '/', permanent: true },
] as const;

const LEGACY_PEOPLE_DETAIL_IDS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

/** GSC Not Found — 깨진·오타·구버전 URL → 유효 페이지 301 */
const LEGACY_SOFT_404_REDIRECTS = [
  { source: '/main', destination: '/', permanent: true },
  { source: '/main/', destination: '/', permanent: true },
  { source: '/conatc.php', destination: '/contact/', permanent: true },
  { source: '/backpg/:path*', destination: '/', permanent: true },
  { source: '/success-case', destination: '/success-story/', permanent: true },
  { source: '/success-case/', destination: '/success-story/', permanent: true },
  { source: '/success-case/:path*', destination: '/success-story/', permanent: true },
  { source: '/success-case-sexual-services-01', destination: '/success-story/', permanent: true },
  { source: '/success-case-sexual-services-01/', destination: '/success-story/', permanent: true },
  // 본문 플레이스홀더가 그대로 URL로 크롤된 경우 (`[]`는 path-to-regexp 이스케이프)
  {
    source: '/success-story/:wr_id/\\[여기에 상담신청 링크 삽입\\]',
    destination: '/contact/',
    permanent: true,
  },
  {
    source: '/success-story/:wr_id/\\[여기에 상담신청 링크 삽입\\]/',
    destination: '/contact/',
    permanent: true,
  },
  {
    source: '/board/bbs/\\[여기에 상담신청 링크 삽입\\]',
    destination: '/contact/',
    permanent: true,
  },
  {
    source: '/board/bbs/\\[여기에 상담신청 링크 삽입\\]/',
    destination: '/contact/',
    permanent: true,
  },
  // 깨진 HTML이 경로로 파싱된 쓰레기 URL (`$`는 path-to-regexp에서 이스케이프)
  { source: '/&', destination: '/', permanent: true },
  { source: '/&/', destination: '/', permanent: true },
  { source: '/\\$', destination: '/', permanent: true },
  { source: '/\\$/', destination: '/', permanent: true },
] as const;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/** 전역 보안 HTTP 헤더 (CSP는 GA4·카카오 등 허용 도메인 정리 후 단계적 도입) */
const SECURITY_HEADERS = [
  ...(IS_PRODUCTION ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
];

const nextConfig: NextConfig = {
  trailingSlash: true,

  async rewrites() {
    return {
      // Next.js [bo_table]/[wr_id] 라우트보다 먼저 — criminal 게시판 slug와 충돌 방지
      beforeFiles: [
        { source: '/criminal/api/:path*', destination: `${CAFE24}/criminal/api/:path*` },
        { source: '/criminal/admin', destination: `${CAFE24}/criminal/admin/` },
        { source: '/criminal/admin/', destination: `${CAFE24}/criminal/admin/` },
        { source: '/criminal/admin/:path*', destination: `${CAFE24}/criminal/admin/:path*` },
        ...CRIMINAL_LANDING_SLUGS.flatMap(slug => [
          { source: `/criminal/${slug}`, destination: `${CAFE24}/criminal/${slug}/` },
          { source: `/criminal/${slug}/`, destination: `${CAFE24}/criminal/${slug}/` },
          { source: `/criminal/${slug}/:path*`, destination: `${CAFE24}/criminal/${slug}/:path*` },
        ]),
      ],

      // Next.js 페이지 매칭 후, 없을 때만 프록시
      afterFiles: [
        // 이미지/미디어
        { source: '/img/:path*', destination: `${CAFE24}/img/:path*` },
        { source: '/data/:path*', destination: `${CAFE24}/data/:path*` },

        // 그누보드 전체
        { source: '/board/:path*', destination: `${CAFE24}/board/:path*` },

        // PHP API - Next.js /api/board/revalidate/ 제외하고 개별 지정
        { source: '/api/board/get_list.php', destination: `${CAFE24}/api/board/get_list.php` },
        { source: '/api/board/get_view.php', destination: `${CAFE24}/api/board/get_view.php` },
        { source: '/api/board/get_post.php', destination: `${CAFE24}/api/board/get_post.php` },
        { source: '/api/board/get_scheduled_list.php', destination: `${CAFE24}/api/board/get_scheduled_list.php` },
        { source: '/api/board/write_post.php', destination: `${CAFE24}/api/board/write_post.php` },
        { source: '/api/board/upload_file.php', destination: `${CAFE24}/api/board/upload_file.php` },
        { source: '/api/board/download_file.php', destination: `${CAFE24}/api/board/download_file.php` },
        { source: '/api/board/get_session.php', destination: `${CAFE24}/api/board/get_session.php` },
        { source: '/api/board/auth/:path*', destination: `${CAFE24}/api/board/auth/:path*` },

        // 상담문의 API
        { source: '/api/inquiry/:path*', destination: `${CAFE24}/api/inquiry/:path*` },
        { source: '/api/submit_inquiry.php', destination: `${CAFE24}/api/submit_inquiry.php` },
        { source: '/backend/api/submit_inquiry.php', destination: `${CAFE24}/api/submit_inquiry.php` },
        { source: '/api/call_lead.php', destination: `${CAFE24}/api/call_lead.php` },

        // 랜딩페이지들 (PHP 레거시)
        { source: '/landing/:path*', destination: `${CAFE24}/landing/:path*` },
        { source: '/landing_new/:path*', destination: `${CAFE24}/landing_new/:path*` },
        { source: '/landing_defense/:path*', destination: `${CAFE24}/landing_defense/:path*` },
        { source: '/landing_realestate/:path*', destination: `${CAFE24}/landing_realestate/:path*` },
        { source: '/drunk/:path*', destination: `${CAFE24}/drunk/:path*` },
        { source: '/your/:path*', destination: `${CAFE24}/your/:path*` },
        { source: '/mobileapp/:path*', destination: `${CAFE24}/mobileapp/:path*` },
        { source: '/special_event/:path*', destination: `${CAFE24}/special_event/:path*` },
        { source: '/receipt/:path*', destination: `${CAFE24}/receipt/:path*` },
        { source: '/complete/:path*', destination: `${CAFE24}/complete/:path*` },

        // 기타 PHP 파일
        { source: '/kakao_link.php', destination: `${CAFE24}/kakao_link.php` },
        { source: '/tel_link.php', destination: `${CAFE24}/tel_link.php` },
        { source: '/dpcrm_reservation.php', destination: `${CAFE24}/dpcrm_reservation.php` },
        { source: '/dpcrm_reservation_temp.php', destination: `${CAFE24}/dpcrm_reservation_temp.php` },

        // common, js, css 레거시 리소스
        { source: '/common/:path*', destination: `${CAFE24}/common/:path*` },
        { source: '/js/:path*', destination: `${CAFE24}/js/:path*` },
        { source: '/css/:path*', destination: `${CAFE24}/css/:path*` },
      ],

      fallback: [],
    };
  },

  async redirects() {
    const legacyPeopleDetailRedirects = LEGACY_PEOPLE_DETAIL_IDS.map(id => ({
      source: '/peoples.php',
      has: [{ type: 'query' as const, key: 'p', value: id }],
      destination: `/people/${id}/`,
      permanent: true,
    }));

    return [
      ...LANDING_DUMP_REDIRECTS,
      ...LEGACY_SOFT_404_REDIRECTS,
      ...legacyPeopleDetailRedirects,
      {
        source: '/landing_new/admin',
        destination: LANDING_NEW_ADMIN_LOGIN,
        permanent: false,
      },
      {
        source: '/landing_new/admin/',
        destination: LANDING_NEW_ADMIN_LOGIN,
        permanent: false,
      },
      {
        source: '/landing_new/admin/admin',
        destination: LANDING_NEW_ADMIN_LOGIN,
        permanent: false,
      },
      {
        source: '/landing_new/admin/admin/',
        destination: LANDING_NEW_ADMIN_LOGIN,
        permanent: false,
      },
      {
        source: '/board/bbs',
        destination: '/admin/login/',
        permanent: false,
      },
      {
        source: '/board/bbs/',
        destination: '/admin/login/',
        permanent: false,
      },
      {
        source: '/board/bbs/login.php',
        destination: '/admin/login/',
        permanent: false,
      },
      // 레거시 그누보드 관리자 — Next /admin/ (JWT)로 통합
      {
        source: '/board/adm',
        destination: '/admin/',
        permanent: false,
      },
      {
        source: '/board/adm/',
        destination: '/admin/',
        permanent: false,
      },
      {
        source: '/board/adm/:path*',
        destination: '/admin/',
        permanent: false,
      },
      // 그누보드 설치·DB 도구 직접 접근 차단
      {
        source: '/board/install/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/dbpma/:path*',
        destination: '/',
        permanent: false,
      },
      { source: '/success', destination: '/success-story', permanent: true },
      { source: '/success/:wr_id', destination: '/success-story/:wr_id', permanent: true },
      { source: '/about.php', destination: '/about', permanent: true },
      { source: '/contact.php', destination: '/contact', permanent: true },
      { source: '/field.php', destination: '/field', permanent: true },
      { source: '/people.php', destination: '/people', permanent: true },
      { source: '/privacy.php', destination: '/privacy', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        source: '/img/:path*',
        headers: [{ key: 'Cache-Control', value: ONE_YEAR_CACHE }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: ONE_YEAR_CACHE }],
      },
      // 어드민 페이지 캐시 완전 차단
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // 첨부 다운로드 API — 검색 인덱싱 제외 (부재 시 API는 410 Gone)
      {
        source: '/api/board/download_file.php',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yeoon.co.kr',
        pathname: '/board/data/**',
      },
      {
        protocol: 'https',
        hostname: 'www.yeoon.co.kr',
        pathname: '/board/data/**',
      },
      {
        protocol: 'https',
        hostname: 'lawfirmonly1.mycafe24.com',
        pathname: '/board/data/**',
      },
    ],
    deviceSizes: [640, 1024, 1920], // 큰 이미지용 반응형 분기점 축소
    imageSizes: [320, 480], // 작은 이미지용 사이즈 축소
    formats: ['image/avif', 'image/webp'], // 최신 압축 포맷 우선 적용
  },
};

export default nextConfig;
