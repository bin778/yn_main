import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import { pretendard } from '@/app/lib/fonts';

import './globals.css';
import Analytics from './components/Analytics';
import AnalyticsClickTracker from './components/AnalyticsClickTracker';
import Footer from './components/Footer';
import Header from './components/Header';

const FloatingQuickActions = dynamic(() => import('./components/FloatingQuickActions'));
const PreFooterCta = dynamic(() => import('./components/PreFooterCta'));

export const metadata: Metadata = {
  title: '법무법인 여온',
  description: '재배당/사무장 없는 법무법인 여온',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className={`m-0 p-0 ${pretendard.className}`}>
        <Analytics />
        <AnalyticsClickTracker />
        <Header />
        <main className="pt-[80px]">{children}</main>
        <FloatingQuickActions />
        <PreFooterCta />
        <Footer />
      </body>
    </html>
  );
}
