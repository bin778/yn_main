'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { usePathname } from 'next/navigation';

import { ADMIN_PATH_PREFIX } from '@/app/constants/analyticsEvents';

export default function VercelMetrics() {
  const pathname = usePathname();
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
