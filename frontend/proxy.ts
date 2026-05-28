import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_BO_TABLES = new Set(['review', 'success', 'column', 'news']);

/**
 * 구 그누보드 게시판 URL → 신 Next.js 경로 301 영구 리다이렉트
 *
 * /board/bbs/board.php?bo_table=review&wr_id=44  →  /review/44/
 * /board/bbs/board.php?bo_table=review           →  /review/
 */
export function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const boTable = searchParams.get('bo_table');
  const wrId    = searchParams.get('wr_id');

  if (!boTable || !ALLOWED_BO_TABLES.has(boTable)) {
    return NextResponse.next();
  }

  const destination = wrId && /^\d+$/.test(wrId)
    ? `/${boTable}/${wrId}/`
    : `/${boTable}/`;

  return NextResponse.redirect(new URL(destination, request.url), { status: 301 });
}

export const config = {
  matcher: '/board/bbs/board.php',
};
