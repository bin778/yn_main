import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BoardSectionListPage from '../../../components/BoardSectionListPage';
import { BOARD_META, resolveBoTableFromPathSlug, SITE_NAME } from '../../../constants/boardContent';
import {
  buildBoardSectionListPath,
  getBoardSectionLabel,
  getBoardSubSectionLabel,
  hasBoardSections,
  isBoardSubSectionSlug,
} from '../../../constants/boardSections';
import type { BoardListSearchParams } from '../../../lib/parseBoardListQuery';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ bo_table: string; wr_id: string; sub: string }>;
  searchParams: Promise<BoardListSearchParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { bo_table: pathSlug, wr_id: category, sub } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);
  const parentSlug = category.trim();
  const childSlug = sub.trim();

  if (!boTable || !hasBoardSections(boTable) || !isBoardSubSectionSlug(boTable, parentSlug, childSlug)) {
    return {};
  }

  const { label, description } = BOARD_META[boTable];
  const categoryLabel = getBoardSectionLabel(boTable, parentSlug);
  const subcategoryLabel = getBoardSubSectionLabel(boTable, parentSlug, childSlug);

  return {
    title: `${label} · ${categoryLabel} · ${subcategoryLabel} | ${SITE_NAME}`,
    description,
    alternates: { canonical: buildBoardSectionListPath(boTable, parentSlug, childSlug) },
  };
}

export default async function BoardSubSectionListPage({ params, searchParams }: PageProps) {
  const { bo_table: pathSlug, wr_id: category, sub } = await params;
  const boTable = resolveBoTableFromPathSlug(pathSlug);
  const parentSlug = category.trim();
  const childSlug = sub.trim();

  if (!boTable || !hasBoardSections(boTable) || !isBoardSubSectionSlug(boTable, parentSlug, childSlug)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;

  return (
    <BoardSectionListPage
      boTable={boTable}
      category={parentSlug}
      subcategory={childSlug}
      searchParams={resolvedSearchParams}
    />
  );
}
