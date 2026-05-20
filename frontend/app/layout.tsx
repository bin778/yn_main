import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header.tsx';
import Footer from '../components/Footer.tsx';

// SEO 메타데이터 (기존 inc.top.php에 있던 타이틀과 설명)
export const metadata: Metadata = {
  title: '법무법인 여온',
  description: '재배당/사무장 없는 법무법인 여온...',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children} {/* 이곳에 index, about 등 각 페이지 본문이 들어갑니다 */}
        <Footer />
      </body>
    </html>
  );
}
