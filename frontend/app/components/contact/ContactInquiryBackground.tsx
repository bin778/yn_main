'use client';

import Image from 'next/image';
import { useSyncExternalStore } from 'react';

import { CONTACT_INQUIRY } from '@/app/constants/contactContent';

const DESKTOP_BG_QUERY = '(min-width: 768px)';

function subscribeDesktopBg(callback: () => void) {
  const media = window.matchMedia(DESKTOP_BG_QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getDesktopBgSnapshot() {
  return window.matchMedia(DESKTOP_BG_QUERY).matches;
}

function getDesktopBgServerSnapshot() {
  return false;
}

/** Below-the-fold inquiry band: one background, lazy + low priority so hero stays LCP. */
export default function ContactInquiryBackground() {
  const isDesktop = useSyncExternalStore(subscribeDesktopBg, getDesktopBgSnapshot, getDesktopBgServerSnapshot);
  const src = isDesktop ? CONTACT_INQUIRY.bgDesktop : CONTACT_INQUIRY.bgMobile;

  return (
    <div className="absolute inset-0">
      <Image src={src} alt="" fill className="object-cover" sizes="100vw" loading="lazy" fetchPriority="low" />
    </div>
  );
}
