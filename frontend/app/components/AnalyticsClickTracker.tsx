'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { ADMIN_PATH_PREFIX } from '@/app/constants/analyticsEvents';
import { classifyAnchorClick, trackGaEvent } from '@/app/lib/trackGaEvent';

export default function AnalyticsClickTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return;
    if (pathname.startsWith(ADMIN_PATH_PREFIX)) return;

    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;

      const classified = classifyAnchorClick(anchor);
      if (!classified) return;

      trackGaEvent(classified.eventName, classified.params);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
