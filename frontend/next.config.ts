import type { NextConfig } from 'next';

const ONE_YEAR_CACHE = 'public, max-age=31536000, immutable';

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/img/:path*',
        destination: 'https://yeoon.co.kr/img/:path*',
      },
    ];
  },
  async redirects() {
    return [
      { source: '/success', destination: '/success-story', permanent: true },
      { source: '/success/:wr_id', destination: '/success-story/:wr_id', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/img/:path*',
        headers: [{ key: 'Cache-Control', value: ONE_YEAR_CACHE }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: ONE_YEAR_CACHE }],
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
        hostname: 'lawfirmonly1.mycafe24.com',
        pathname: '/board/data/**',
      },
    ],
  },
};

export default nextConfig;
