import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { pretendard } from '@/app/lib/fonts';
import { SITE_ORIGIN } from '@/app/lib/siteOrigin';

import './globals.css';
import AnalyticsProvider from './components/AnalyticsProvider';
import Footer from './components/Footer';
import Header from './components/Header';
import InquiryInflowCapture from './components/InquiryInflowCapture';
import VercelMetrics from './components/VercelMetrics';

const FloatingQuickActions = dynamic(() => import('./components/FloatingQuickActions'));
const PreFooterCta = dynamic(() => import('./components/PreFooterCta'));

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: '음주운전·성범죄·강제추행·마약 형사전문변호사 | 법무법인 여온',
  description:
    '음주운전, 성범죄, 강제추행, 마약 형사사건 전담. 담당 변호사가 상담부터 재판까지 직접 밀착 진행합니다. 02-318-2981',
  verification: {
    other: {
      'naver-site-verification': 'f2af03f086696bdbf2f7c762e19ad817dd77e6d1',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className={`m-0 p-0 ${pretendard.className}`}>
        <AnalyticsProvider>
          <InquiryInflowCapture />
          <Header />
          <main className="pt-[80px]">{children}</main>
          <FloatingQuickActions />
          <PreFooterCta />
          <Footer />
        </AnalyticsProvider>
        <VercelMetrics />
      </body>
    </html>
  );
}
