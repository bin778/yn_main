import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BoardListPageContent from '../components/BoardListPageContent';
import { resolveBoTableFromPathSlug } from '../constants/boardContent';
import { fetchBoardList } from '../lib/boardApi';
import { getBoardListMetadata } from '../lib/boardListRoute';
import { parseBoardListQuery, type BoardListSearchParams } from '../lib/parseBoardListQuery';
import type { BoardListResponse } from '../types/board';

const EMPTY_LIST: BoardListResponse = {
  total: 0,
  page: 1,
  per_page: 12,
  total_pages: 0,
  items: [],
};

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ bo_table: string }>;
  searchParams: Promise<BoardListSearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table: pathSlug } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);
  return boTable ? getBoardListMetadata(boTable) : {};
}

export default async function BoardListPage({ params, searchParams }: PageProps) {
  const { bo_table: pathSlug } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);
  if (!boTable) notFound();

  const query = parseBoardListQuery(await searchParams);
  const { page, q, sfl, sort } = query;
  let data: BoardListResponse;
  try {
    data = await fetchBoardList(boTable, page, q, sfl, sort);
  } catch {
    data = EMPTY_LIST;
  }

  return <BoardListPageContent boTable={boTable} data={data} query={query} />;
}
