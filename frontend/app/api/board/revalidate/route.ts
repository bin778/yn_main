import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getBoardPathSlug } from '@/app/(story)/constants/boardContent';
import { boardListCacheTag, boardViewCacheTag } from '@/app/(story)/lib/boardCache';
import type { BoTable } from '@/app/(story)/types/board';

const BOARD_API_BASE = process.env.BOARD_API_URL ?? 'https://yeoon.co.kr/api/board';

type RevalidateBody = {
  bo_table?: BoTable;
  wr_id?: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RevalidateBody;
  const boTable = body.bo_table;
  const wrId = Number(body.wr_id ?? 0);

  if (boTable === undefined || wrId <= 0) {
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

  const pathSlug = getBoardPathSlug(boTable);
  revalidateTag(boardViewCacheTag(boTable, wrId), 'max');
  revalidateTag(boardListCacheTag(boTable), 'max');
  revalidatePath(`/${pathSlug}/${wrId}/`);
  revalidatePath(`/${pathSlug}/`);

  return NextResponse.json({ ok: true });
}
