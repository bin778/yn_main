import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BoardListPageContent from '../../components/BoardListPageContent';
import { resolveBoTableFromPathSlug } from '../../constants/boardContent';
import { fetchBoardList } from '../../lib/boardApi';
import { getBoardListMetadata } from '../../lib/boardListRoute';
import { parseBoardListQuery } from '../../lib/parseBoardListQuery';

export const revalidate = 3600;

const defaultQuery = parseBoardListQuery({});
type PageProps = { params: Promise<{ bo_table: string }> };

export function generateStaticParams() {
  // Generate each list on its first request so deployment does not depend on Cafe24.
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table: pathSlug } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);
  return boTable ? getBoardListMetadata(boTable) : {};
}

export default async function BoardListIsrPage({ params }: PageProps) {
  const { bo_table: pathSlug } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);
  if (!boTable) notFound();

  // Let failures abort regeneration so ISR can retain the last successful list.
  const data = await fetchBoardList(boTable);
  return <BoardListPageContent boTable={boTable} data={data} query={defaultQuery} />;
}
