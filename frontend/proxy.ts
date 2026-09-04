import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APEX_HOST = 'yeoon.co.kr';
const WWW_HOST = 'www.yeoon.co.kr';
const RSS_PATH = '/rss.xml';

const ALLOWED_BO_TABLES = new Set(['review', 'success', 'column', 'news']);

const BO_TABLE_TO_PATH: Record<string, string> = {
  review: 'review',
  success: 'success-story',
  column: 'column',
  news: 'news',
};

function requestHost(request: NextRequest): string {
  const raw = request.headers.get('host') ?? request.nextUrl.hostname;
  return raw.split(':')[0]?.toLowerCase() ?? '';
}

function isLegacyBoardPhpPath(pathname: string): boolean {
  return pathname === '/board/bbs/board.php' || pathname === '/board/bbs/board.php/';
}

/**
 * 1) yeoon.co.kr → www 리다이렉트 (`/rss.xml`만 예외 — 네이버 RSS 등록용)
 * 2) 구 그누보드 board.php → 신 Next.js 경로 301
 *
 * /board/bbs/board.php?bo_table=review&wr_id=44  →  /review/44/
 * /board/bbs/board.php?bo_table=success           →  /success-story/
 */
export function proxy(request: NextRequest) {
  const host = requestHost(request);
  const { pathname, searchParams } = request.nextUrl;

  if (host === APEX_HOST && pathname !== RSS_PATH) {
    const url = request.nextUrl.clone();
    url.hostname = WWW_HOST;
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  if (!isLegacyBoardPhpPath(pathname)) {
    return NextResponse.next();
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
  matcher: [
    /*
     * 정적 에셋·Next 내부 경로 제외. /rss.xml 포함해야 apex에서 예외 처리 가능.
     * www 리다이렉트와 board.php 301만 처리하므로 이미지·폰트·스크립트는 제외한다.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|avif|woff2?|css|js|map)$).*)',
  ],
};
