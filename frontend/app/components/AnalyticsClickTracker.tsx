'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { ADMIN_PATH_PREFIX, GA_SOURCE_ATTR, KAKAO_CHANNEL_HOST } from '@/app/constants/analyticsEvents';
import { isAnalyticsConfigured } from '@/app/lib/analyticsConfig';
import { trackCallLead } from '@/app/lib/callTracking';
import { classifyAnchorClick, trackGaEvent } from '@/app/lib/trackGaEvent';

function resolveCallLeadFromAnchor(anchor: HTMLAnchorElement): { channel: 'call' | 'kakao'; source: string } | null {
  const href = anchor.getAttribute('href') ?? '';
  if (!href) return null;

  const source =
    anchor.getAttribute(GA_SOURCE_ATTR) ??
    anchor.closest(`[${GA_SOURCE_ATTR}]`)?.getAttribute(GA_SOURCE_ATTR) ??
    'inline';

  if (href.startsWith('tel:')) {
    return { channel: 'call', source };
  }
  if (href.includes(KAKAO_CHANNEL_HOST)) {
    return { channel: 'kakao', source };
  }
  return null;
}

export default function AnalyticsClickTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith(ADMIN_PATH_PREFIX)) return;

    const handleClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest('a');
      if (!anchor) return;

      const callLead = resolveCallLeadFromAnchor(anchor);
      if (callLead) {
        trackCallLead(callLead.channel, callLead.source);
      }

      if (!isAnalyticsConfigured()) return;

      const classified = classifyAnchorClick(anchor);
      if (!classified) return;

      trackGaEvent(classified.eventName, classified.params);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
