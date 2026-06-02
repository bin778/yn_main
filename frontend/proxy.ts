import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_BO_TABLES = new Set(['review', 'success', 'column', 'news']);

const BO_TABLE_TO_PATH: Record<string, string> = {
  review: 'review',
  success: 'success-story',
  column: 'column',
  news: 'news',
};

/**
 * 구 그누보드 URL → Next.js 경로 처리
 *
 * /board/bbs/login.php  →  /admin/login/ (JWT 관리자 로그인)
 * /board/bbs/board.php?bo_table=…  →  /review/ … (목록·상세)
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/board/bbs/login.php') {
    const destination = new URL('/admin/login/', request.url);
    const returnUrl = searchParams.get('url');
    if (returnUrl) {
      destination.searchParams.set('url', returnUrl);
    }
    destination.searchParams.set('from', 'legacy');
    return NextResponse.redirect(destination, { status: 302 });
  }

  const boTable = searchParams.get('bo_table');
  const wrId = searchParams.get('wr_id');

  if (!boTable || !ALLOWED_BO_TABLES.has(boTable)) {
    return NextResponse.next();
  }

  const pathSlug = BO_TABLE_TO_PATH[boTable];
  const destination = wrId && /^\d+$/.test(wrId) ? `/${pathSlug}/${wrId}/` : `/${pathSlug}/`;

  return NextResponse.redirect(new URL(destination, request.url), { status: 301 });
}

export const config = {
  matcher: ['/board/bbs/board.php', '/board/bbs/login.php'],
};
