import type { NextConfig } from 'next';

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
};

export default nextConfig;
