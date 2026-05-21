import type { NextConfig } from "next";

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
    ];
  },
};

export default nextConfig;
