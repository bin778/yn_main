'use client';

import { useSyncExternalStore } from 'react';

import KakaoRoughMap from '@/app/components/contact/KakaoRoughMap';
import type { ContactOffice } from '@/app/constants/contactContent';

/** Match OfficeSection side-by-side breakpoint (lg) to avoid overlap between md–lg. */
const DESKTOP_QUERY = '(min-width: 1024px)';

function subscribeDesktop(callback: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function getDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getDesktopServerSnapshot() {
  return false;
}

type OfficeMapProps = {
  office: ContactOffice;
  className?: string;
};

/** One map instance per office — avoids duplicate daumRoughmapContainer ids. */
export default function OfficeMap({ office, className }: OfficeMapProps) {
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getDesktopServerSnapshot);
  const embed = isDesktop ? office.mapDesktop : office.mapMobile;

  return <KakaoRoughMap key={`${office.id}-${embed.timestamp}`} embed={embed} className={className} />;
}
