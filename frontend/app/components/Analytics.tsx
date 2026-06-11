'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { usePathname } from 'next/navigation';

import { ADMIN_PATH_PREFIX } from '@/app/constants/analyticsEvents';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function Analytics() {
  const pathname = usePathname();

  if (!GA_MEASUREMENT_ID) return null;
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) return null;

  return <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
