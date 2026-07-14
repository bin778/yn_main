'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { captureInquiryInflowFromUrl } from '@/app/lib/inquiryInflow';

/** 첫 진입 시 광고/오가닉 유입을 sessionStorage에 기록한다. */
export default function InquiryInflowCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureInquiryInflowFromUrl();
  }, [pathname]);

  return null;
}
