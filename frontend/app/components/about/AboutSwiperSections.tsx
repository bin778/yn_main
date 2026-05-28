'use client';

import dynamic from 'next/dynamic';

const CertificatesSwiper = dynamic(() => import('@/app/components/about/CertificatesSwiper'), {
  ssr: false,
  loading: () => <section className="min-h-[280px] bg-[#f5f5f5]" aria-hidden />,
});

const OfficeGallerySwiper = dynamic(() => import('@/app/components/about/OfficeGallerySwiper'), {
  ssr: false,
  loading: () => <section className="min-h-[320px] bg-[#f5f5f5]" aria-hidden />,
});

export function AboutCertificatesSection() {
  return <CertificatesSwiper />;
}

export function AboutOfficeGallerySection() {
  return <OfficeGallerySwiper />;
}
