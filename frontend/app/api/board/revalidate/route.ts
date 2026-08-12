import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { ALLOWED_BO_TABLES, getBoardPathSlug } from '@/app/(story)/constants/boardContent';
import { getBoardSections, hasBoardSections } from '@/app/(story)/constants/boardSections';
import { boardListCacheTag, boardViewCacheTag } from '@/app/(story)/lib/boardCache';
import { buildBoardPostHref } from '@/app/(story)/lib/boardPostPath';
import type { BoTable } from '@/app/(story)/types/board';

const BOARD_API_BASE = process.env.BOARD_API_URL ?? 'https://www.yeoon.co.kr/api/board';

type RevalidateBody = {
  bo_table?: BoTable;
  wr_id?: number;
  wr_seo_slug?: string;
  extra_bo_tables?: BoTable[];
};

function revalidateBoardList(boTable: BoTable) {
  const pathSlug = getBoardPathSlug(boTable);
  revalidateTag(boardListCacheTag(boTable), 'max');
  revalidatePath(`/${pathSlug}/`);
  revalidatePath(`/${pathSlug}`, 'layout');

  if (!hasBoardSections(boTable)) return;

  for (const section of getBoardSections(boTable)) {
    revalidatePath(`/${pathSlug}/${section.slug}/`);
    for (const child of section.children) {
      revalidatePath(`/${pathSlug}/${section.slug}/${child.slug}/`);
    }
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as RevalidateBody;
  const boTable = body.bo_table;
  const wrId = Number(body.wr_id ?? 0);
  const seoSlug = (body.wr_seo_slug ?? '').trim();
  const extraBoTables = (Array.isArray(body.extra_bo_tables) ? body.extra_bo_tables : []).filter(
    (table): table is BoTable => (ALLOWED_BO_TABLES as readonly string[]).includes(table),
  );

  if (boTable === undefined || !(ALLOWED_BO_TABLES as readonly string[]).includes(boTable)) {
    return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const meRes = await fetch(`${BOARD_API_BASE}/auth/me.php?bo_table=${encodeURIComponent(boTable)}`, {
    headers: { Cookie: cookie },
    cache: 'no-store',
  });

  if (!meRes.ok) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  const me = (await meRes.json()) as { is_admin?: string };
  if (me.is_admin !== 'super' && me.is_admin !== 'board') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  if (wrId > 0) {
    const pathSlug = getBoardPathSlug(boTable);
    revalidateTag(boardViewCacheTag(boTable, wrId), 'max');
    if (seoSlug !== '') {
      revalidateTag(boardViewCacheTag(boTable, seoSlug), 'max');
    }
    revalidatePath(buildBoardPostHref(boTable, wrId, seoSlug));
    revalidatePath(`/${pathSlug}/${wrId}/`);
  }

  revalidateBoardList(boTable);
  for (const extra of extraBoTables) {
    if (extra !== boTable) revalidateBoardList(extra);
  }

  return NextResponse.json({ ok: true });
}
