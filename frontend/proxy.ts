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
 * 구 그누보드 게시판 URL → 신 Next.js 경로 301 영구 리다이렉트
 *
 * /board/bbs/board.php?bo_table=review&wr_id=44  →  /review/44/
 * /board/bbs/board.php?bo_table=success           →  /success-story/
 */
export function proxy(request: NextRequest) {
  const { searchParams } = request.nextUrl;

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
  matcher: ['/board/bbs/board.php', '/board/bbs/board.php/'],
};
