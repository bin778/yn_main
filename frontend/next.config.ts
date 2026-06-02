import type { NextConfig } from 'next';

const ONE_YEAR_CACHE = 'public, max-age=31536000, immutable';

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    const CAFE24 = 'https://lawfirmonly1.mycafe24.com';
    return [
      { source: '/img/:path*', destination: `${CAFE24}/img/:path*` },
      { source: '/board/:path*', destination: `${CAFE24}/board/:path*` },
      { source: '/api/:path*', destination: `${CAFE24}/api/:path*` },
      { source: '/backend/:path*', destination: `${CAFE24}/backend/:path*` },
    ];
  },
  async redirects() {
    return [
      {
        source: '/board/bbs/login.php',
        destination: '/admin/login/',
        permanent: false,
      },
      {
        source: '/board/adm/',
        destination: '/admin/',
        permanent: false,
      },
      {
        source: '/board/adm',
        destination: '/admin/',
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
