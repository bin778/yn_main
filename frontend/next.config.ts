import type { NextConfig } from 'next';

const BOARD_TABLES = ['review', 'success', 'column', 'news'] as const;

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yeoon.co.kr',
        pathname: '/board/data/file/**',
      },
    ],
  },
  async redirects() {
    // 구 그누보드 URL → 신 Next.js 경로 301 영구 리다이렉트
    // 상세 규칙(wr_id 포함)을 목록 규칙(wr_id 없음)보다 먼저 선언한다.
    const detailRedirects = BOARD_TABLES.map(bo_table => ({
      source: '/board/bbs/board.php',
      has: [
        { type: 'query' as const, key: 'bo_table', value: bo_table },
        { type: 'query' as const, key: 'wr_id', value: '(?<wr_id>\\d+)' },
      ],
      destination: `/${bo_table}/:wr_id/`,
      permanent: true,
    }));

    const listRedirects = BOARD_TABLES.map(bo_table => ({
      source: '/board/bbs/board.php',
      has: [{ type: 'query' as const, key: 'bo_table', value: bo_table }],
      missing: [{ type: 'query' as const, key: 'wr_id' }],
      destination: `/${bo_table}/`,
      permanent: true,
    }));

    return [...detailRedirects, ...listRedirects];
  },
};

export default nextConfig;
