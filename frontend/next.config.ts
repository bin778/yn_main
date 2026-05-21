import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/peoples.php',
        has: [{ type: 'query', key: 'p', value: '(?<id>\\d+)' }],
        destination: '/people/:id',
        permanent: true,
      },
      {
        source: '/people.php',
        destination: '/people',
        permanent: true,
      },
      {
        source: '/field.php',
        destination: '/field',
        permanent: true,
      },
      {
        source: '/contact.php',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/privacy.php',
        destination: '/privacy',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
