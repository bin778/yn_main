import type { Metadata } from 'next';
import './globals.css';
import FloatingQuickActions from './components/FloatingQuickActions';
import Footer from './components/Footer';
import Header from './components/Header';
import PreFooterCta from './components/PreFooterCta';

export const metadata: Metadata = {
  title: '법무법인 여온',
  description: '재배당/사무장 없는 법무법인 여온',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="m-0 p-0">
        <Header />
        <main className="pt-[80px]">{children}</main>
        <FloatingQuickActions />
        <PreFooterCta />
        <Footer />
      </body>
    </html>
  );
}
