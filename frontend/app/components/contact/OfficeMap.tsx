'use client';

import NaverMap from '@/app/components/contact/NaverMap';
import type { ContactOffice } from '@/app/constants/contactContent';

type OfficeMapProps = {
  office: ContactOffice;
  className?: string;
};

export default function OfficeMap({ office, className }: OfficeMapProps) {
  return <NaverMap location={office.map} title={office.title} className={className} />;
}
