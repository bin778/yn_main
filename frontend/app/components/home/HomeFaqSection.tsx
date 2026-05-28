'use client';

import dynamic from 'next/dynamic';

const FaqAccordion = dynamic(() => import('@/app/components/home/FaqAccordion'), {
  loading: () => <section className="min-h-[480px] bg-[#1a3151]/10" aria-hidden />,
});

export default function HomeFaqSection() {
  return <FaqAccordion />;
}
