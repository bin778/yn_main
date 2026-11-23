'use client';

import Link from 'next/link';

import type { NavLinkItem } from '@/app/constants/navContent';

const EXTERNAL_HREF_PATTERN = /^https?:\/\//;

type NavLeafProps = {
  item: NavLinkItem;
  className: string;
  onNavigate?: () => void;
};

/**
 * 센터 랜딩은 Next 라우트가 아니라 Cafe24 리라이트로 서빙되므로 절대 URL은 풀 페이지 이동으로 처리한다.
 */
export default function NavLeaf({ item, className, onNavigate }: NavLeafProps) {
  if (!EXTERNAL_HREF_PATTERN.test(item.href)) {
    return (
      <Link href={item.href} className={className} onClick={onNavigate}>
        {item.label}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      className={className}
      onClick={event => {
        event.preventDefault();
        onNavigate?.();
        window.location.assign(item.href);
      }}
    >
      {item.label}
    </a>
  );
}
